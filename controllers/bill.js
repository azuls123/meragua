'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable del esquema del modelo //
var Bill = require('../models/bill');
// Variable de Usuario //
var User = require('../models/user');
// Variable de Medidor //
var Meter = require('../models/meter');
// Variable de Tarifa //
var Rate = require('../models/rate');
// Variable de Limites //
var Limits = require('../models/limits');
// Variable de Registros //
var Register = require('../models/register');
// Variable de Paginacion //
var mongoosePaginate = require('mongoose-pagination');
// Variable TimeStamp //
var moment = require('moment');
//=================Declaracion de Funciones //
// Funcion de register de datos //
function save2(req, res) {
    var params = req.body;
    var factura = new Bill;
    var today = new Date();
    User.findOne({ cedula: params.cedula }, (err, respUser) => {
        if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion... Error: ' + err });
        if (!respUser) return res.status(404).send({ Message: 'No se encontro el usuario....' });
        factura.user = respUser.id;
        Bill.find((err, resp) => {
            if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion... Error: ' + err });
            factura.numero = resp.length + 1;
            factura.cedula = params.cedula;
            factura.nombres = respUser.nombre + ' ' + respUser.apellido;
            factura.direccion = respUser.direccion;
            factura.fecha = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();

            Meter.findOne({
                $and: [
                    { clave: params.medidor },
                    { user: respUser.id }
                ]
            }, (err, respMeter) => {
                if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion.... Error: ' + err });
                if (!resp) return res.status(404).send({ Message: 'No se pudo encontrar el medidor con ese usaurio...' });
                factura.medidor = params.medidor;
                factura.meter = respMeter.id;
                Rate.findById(respMeter.rate, (err, respRate) => {
                    if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion.... Error: ' + err });
                    if (!respRate) return res.status(404).send({ Message: 'No se logro encontrar la tarifa....' });
                    factura.tarifa = respRate.tarifa;
                    var date = params.anio + '.' + params.mes;
                    var dateAnterior;
                    if (params.mes <= 9) dateAnterior = params.anio + '.0' + parseInt(params.mes - 1); else dateAnterior = params.anio + '.' + parseInt(params.mes - 1);
                    console.log('Fecha Actual: ' + date + '. Fecha Anterior: ' + dateAnterior);

                    Register.findOne({
                        $and: [
                            { meter: factura.meter },
                            { date: date },
                            { cancelado: false }
                        ]
                    }, (err, respRegister) => {
                        if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion... Error: ' + err });
                        if (!respRegister) return res.status(404).send({ Message: 'No se pudo obtener el registro... verificar la fecha', factura });
                        // aqui agregar el impuesto por mora.... //
                        // aqui agregar descuentos.... //
                        factura.subtotal = respRegister.subtotal;
                        console.log(respRegister.subtotal);
                        factura.total = respRegister.subtotal;
                        return res.status(200).send({ Message: 'Todo correcto....', factura });
                    })
                })
            })
        })
    })
}

function save(req, res) {
    var bill = new Bill;
    var params = req.body;
    bill.updated_by = req.user.sub;
    bill.updated_at = moment().unix();
    bill.fecha = params.fecha;
    bill.total = params.total;
    bill.pago = params.pago;
    bill.tarifa = params.tarifa;
    bill.medidor = params.medidor;
    bill.usuario = params.usuario;
    bill.registro = params.registro;
    Bill.find({ registro: bill.registro }).exec((error, response) => {
        if (error) return res.status(500).send({ Message: 'Error al ejecutar la peticion para comprobar Factura Unica' });
        if (response.length >= 1) return res.status(304).send({ Message: 'La factura de este registro de consumo ya ha sido ingresada..' });
        if (!response || response.length <= 0) {
            bill.save((errorSave, responseSave) => {
                if (errorSave) return res.status(500).send({ Message: 'Error al ejectuar la peticion', Error: errorSave });
                if (!responseSave || responseSave.length <= 0) return res.status(404).send({ Message: 'El servidor no ha arrojado ninguna respuesta....' });
                return res.status(201).send({ Message: 'Factura Guardada Correctamente!', Factura: responseSave });
            })
        }
    })
    // getBillNumber().then((total)=>{
    //     console.log(total);
    //     bill.numero = total;

    // })
}
function pagoFactura(req, res) {
    var update = req.body
    var id = req.params.id;
    getBillNumber().then((total)=>{
        update.numero = total;
        Bill.findByIdAndUpdate(id, update, { new: true }, (err, response) => {
            if (err) return res.status(500).send({Message: 'Ha ocurrido un error al ejecutar la peticion al servidor', Error: err});
            if (!response || response.length<=0) return res.status(404).send({Message: 'El servidor no ha devuelto respuesta...'});
            if (response) {
                Register.findById(response.registro, (errr, resp) => {
                    if (errr) return res.status(500).send({Message: 'No se pudo obtener la informacion del registro a facturar...'})
                    if (!resp || resp.length<=0) return res.status(500).send({Message: 'No se encontro el registro a facturar'});
                    if (resp) {
                        let payRegister = resp;
                        payRegister.cancelado = true;
                        payRegister.bill = id;
                        Register.findByIdAndUpdate(payRegister._id, payRegister, {new: true}, (erru, respu)=>{
                            if (erru) return res.status(500).send({Message: 'Error al editar la informacion del registro'});
                            if (!respu || respu.length<=0) return res.status(404).send({Message: 'el servidor no devolvio respuesta...'});
                        })
                    }
                })
            }
        })
    })
}

function getConteo(req, res) {
    getBillNumber().then((count) => {
        return res.status(200).send({ Message: 'Correcto', count })
    })
}
async function getBillNumber() {
    var total = await Bill.countDocuments({pago: {$nin: ['debe']}}).exec().then((count) => {
        console.log('Count');
        
        if (count == 0) {
            return count = 1;
        } else {
            return count;
        }
        return count;
    })
    return total;
}

function show(req, res) {
    Bill.find().populate('medidor usuario registro').exec((error, response) => {
        if (error) return res.status(500).send({ Message: 'error al ejecutar la peticion al servidor...', Error: error });
        if (!response) return res.status(404).send({ Message: 'el servidor no ha devuelto ninguna respuesta' })
        return res.status(200).send({ Message: 'Obteniendo lista de Facturas', Bill: response });
    })
}

function getFactura(req, res){
    Bill.findById(req.params.id).populate('usuario medidor registro tarifa updated_by').exec((error, response)=>{
        if (error) return res.status(500).send({Message: 'error al ejecutar la peticion', Error: error});
        if (!response) return res.status(404).send({Message: 'No existe esta factura'});
        return res.status(200).send({Message: 'Factura Encontrada!...', factura: response});
    })
}
module.exports = {
    save,
    show,
    getConteo,
    pagoFactura,
    getFactura
}