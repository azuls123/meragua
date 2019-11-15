'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable de registro //
var Register = require('../models/register');
// Variable de medidor //
var Meter = require('../models/meter');
// Variable de tarifa //
var Rate = require('../models/rate');
// Variable de limites //
var Limits = require('../models/limits');
// Variable de Extras //
var Extra = require('../models/extra');
// Variable de Tiempo de registro //
var moment = require('moment');
var morgan = require('morgan');
var register = new Register;
//=================Declaracion de Funciones //
// Funcion de registro de datos //
function saveCompletly(req, res) {
    var params = req.body;
    var lectura_anterior = 0;
    if (params.anio && params.mes) {

        params.date = params.anio + '.' + params.mes;
        var premonth = params.mes - 1;
        if (premonth<=9) premonth = '0'+premonth;
        var date_anterior = (params.anio + '.' + premonth);
        console.log('hay fecha....' + params.date);
    }
    Register.find({$and: [
        {date: params.date},
        {meter: params.meter}
    ]}, (err, resp) => {
        if (err) return res.status(500).send({Message: 'No se pudo ejecutar la peticion... Error: ' + err});
        if (resp.length >=1) return res.status(200).send({Message: 'Registro Duplicado,,,,'});
        console.log(params.date + params.meter + ' ... ' + resp);
        if (resp.length=0 || !resp.length) {
            register.lectura = params.lectura;
            register.date = params.date;
            register.cancelado = false;
            register.meter = params.meter;
            register.extra = params.extra;
            if (params.mes > 12) return res.status(500).send({Message: 'La fecha ingresada es incorrecta, recuerde usar el formato de numero 1-12....'})
            if (params.lectura && params.date) {
                Register.find({meter: params.meter}, (errRegister, varRegister) =>{
                    register.lectura = params.lectura;
                    register.date = params.date;
                    register.cancelado = false;
                    register.meter = params.meter;
                    register.extra = params.extra;
                    if (errRegister) return res.status(500).send({Message: 'Error al ejecutar la peticion . . . . Error: ' + errRegister});
                    if (varRegister.length == 0) {
                        register.consumo = 0;
                        Meter.findById(params.meter, (errMeter, varMeter) => {
                            if (errMeter) return res.status(500).send({Message: 'no se ha podido ejecutar la peticion.... Error: ' + errMeter});
                            Rate.findById(varMeter.rate, (errRate, varRate) => {
                                if (errRate) return res.status(500).send({Message: 'no se ha podido ejectuar la peticion.... Error: ' + errRate});
                                if (!varRate) return res.status(404).send({Message: 'No se ha podido obtener la tarifa del medidor....'+varMeter.rate});
                                register.subtotal = varRate.base;
                                register.save((err, resp) => {
                                    if (err) return res.status(500).send({Message: 'Error al Ejecutar la peticion... Error: '+err});
                                    if (!resp) return res.status(404).send({Message: 'No se pudo guardar el registro....'});
                                    return res.status(200).send({Message: 'hasta aqui todo bien.... primer registro... Clave: ' + varMeter.clave, register});
                                })
                            })
                        })
                    } else if (varRegister.length >= 1) {
                        console.log('{meter: ' + params.meter + '}, \n{date: ' + date_anterior + '}');

                        Register.findOne({$and: [
                            {meter: params.meter},
                            {date: date_anterior}
                        ]}, (errReg, varReg)=> {
                            if (errReg) return res.status(500).send({Message: 'Error al ejecutar la peticion'});
                            if (!varReg) return res.status(404).send({Message: 'no se encontro el registro anterior, por favor verifique la fecha...'});
                            register.consumo = register.lectura - varReg.lectura;
                            if (register.consumo >=0){
                                Meter.findById(params.meter, (errMeter, varMeter) => {
                                    if (errMeter) return res.status(500).send({Message: 'no se ha podido ejecutar la peticion.... Error: ' + errMeter});
                                    Rate.findById(varMeter.rate, (errRate, varRate) => {
                                        if (errRate) return res.status(500).send({Message: 'no se ha podido ejectuar la peticion.... Error: ' + errRate});
                                        if (!varRate) return res.status(404).send({Message: 'No se ha podido obtener la tarifa del medidor....'+varMeter.rate});
                                        Limits.find({rate_id: varRate.id}, (errLimits, varLimits) => {
                                            if (errLimits) return res.status(500).send({Message: 'Error al ejecutar la peticion . . . . . Error: ' + errLimits});
                                            if (!varLimits) return res.status(404).send({Message: 'No existen limites para la tarifa actual!'});
                                            varLimits.forEach(element => {
                                                if (!element.limit_to | element.limit_to == undefined ) element.limit_to = 999999999;
                                                if ( parseFloat(register.consumo) >= parseInt(element.limit_from) & parseInt(register.consumo) <= parseInt(element.limit_to) ) {
                                                    console.log(element);
                                                    Extra.findById(params.extra, (err, varExtra)=>{
                                                        console.log(varExtra.rmuv);
                                                        var exceso = parseFloat(parseFloat(varExtra.rmuv)*(parseFloat(element.excess)/100));
                                                        var consumos = parseFloat(register.consumo);
                                                        console.log('base: ' + varRate.base + '\nexceso: ' + exceso + '\nconsumo: ' +consumos);
                                                        register.subtotal = parseFloat(parseFloat(varRate.base) + (parseFloat(consumos) * parseFloat(exceso)));
                                                        console.log('subtotal: '+ register.subtotal);
                                                        register.registered_by = req.user.sub;
                                                        register.updated_at = moment().unix();
                                                        register.save((err, resp) => {
                                                            if (err) return res.status(500).send({Message: 'Error al guardar el registro.... Error: '+ err});
                                                            if (!resp) return res.status(404).send({Message: 'No se pudo guardar el registro...'});
                                                            if (resp) return res.status(200).send({Message: 'hasta aqui todo bien.... agregar registro', register})
                                                        })
                                                    })
                                                }
                                            });
                                        })
                                    })
                                })
                            } else {
                                return res.status(500).send({Message: 'La lectura registrada es negativa por favor, revise el medidor y el contador'});
                            }
                        })
                    } else {
                        return res.status(200).send({Message: 'error, no entra en el if..........' + varRegister.length})
                    }
                })
            } else {
                console.log(params.date);

                return res.status(500).send({Message: 'No se ha ingresado fecha.... o lectura'});
            }
        }
    })
}

function save(req, res) {
    var params = req.body;
    var register = new Register;
    if (!req.user.sub) {
        // enviar error Forbiden [prohibido] en caso de que se intente ingresar un usuario sin antes haber iniciado sesion en el sistema
        return res.status(403).send({Message: 'Solo los Empleados pueden ingresar usuarios '});
    // comprobar que el usuario que inicio sesion no se aun usuario normal [ propietario de medidor ]
    }
    register._id = undefined;
    register.lectura = params.lectura;
    register.consumo = params.consumo;
    register.year = params.year;
    register.month = params.month;
    register.subtotal = params.subtotal;
    register.updated_at = moment().unix();
    register.cancelado = false;
    register.excessConsumo = params.excessConsumo;
    register.excessCosto = params.excessCosto;
    register.excessM3 = params.excessM3;
    register.base = params.base;
    register.registered_by = req.user.sub;
    register.meter = params.meter;
    register.extra = params.extra;
    console.log(register);
    
    // return res.status(300).send({Message: 'Peticion de Guardado....', Register: register});
    register.save((err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al guardar el registro.... ', Error: err});
        if (!resp) return res.status(404).send({Message: 'No se pudo guardar el registro...'});
        if (resp) return res.status(200).send({Message: 'Registro agregado con exito', register: register})
    })
}

function getOne(req, res) {
    var id = req.params.id;
    Register.findById(id).populate('meter extra registered_by').exec((error, response) => {
        if (error) return res.status(500).send({Message: 'Error al Obtener el registro.... ', Error: error});
        if (!response) return res.status(404).send({Message: 'No se pudo guardar el registro...'});
        return res.status(200).send({Message: 'Registro Cargado!.', Register: response});
    })
}
function getLast(req, res) {
    var id = req.params.id;
    Register.find({meter: id}).sort([['lectura', 'desc']]).select({'_id': 0}).exec((error, response)=> {
        if (error) return res.status(500).send({Message: 'Error al Obtener el registro.... ', Error: error});
        if (!response) return res.status(404).send({Message: 'No se pudo guardar el registro...'});
        return res.status(200).send({Message: 'Registro Anterior Cargado!.', Register: response});
    })
}
function show(req, res) {
    Register.find({meter: req.params.id}).sort([['updated_at', 'desc']]).select({'__v': 0}).exec((err, registers) => {
        if (err) return res.status(500).send({Message: 'Hubo un Error al procesar la peticion', Error: err});
        if (!registers) return res.status(404).send({Message: 'No existen registros en el servidor, prueba con otro medidor...'})
        if (registers.length >= 1 ) return res.status(200).send({Message: 'Peticion Exitosa! se encontraron ' + (registers.length) + ' registros...', registers: registers});
        if (registers.length == 0 ) return res.status(200).send({Message: 'No existen registros de este medidor.' + req.params.id});
    })
}
function showAll(req, res) {
    Register.find().select({ '_id': 0, '__v': 0}).exec((err, registers) => {
        if (err) return res.status(500).send({Message: 'Hubo un Error al procesar la peticion', Error: err});
        if (!registers) return res.status(404).send({Message: 'No existen registros en el servidor, prueba con otro medidor...'})
        return res.status(200).send({Message: 'Peticion Exitosa!', registers: registers});
    })
}
function showPaginate(req, res) {
    var page = 1;
    var itemsPerPage = 4;
    var params = req.body;
    var Registro = Register.find();
    if (req.params.page) page = req.params.page;
    if (params.items) itemsPerPage = parseInt(params.items);
    if (params.cancelado == "true") Registro = Register.find({cancelado: true});
    if (params.cancelado == "false") Registro = Register.find({cancelado: false});
    Registro.paginate(page, itemsPerPage, (err, get, total) => {
        if (err) return res.status(500).send({ Message: 'error al procesar la peticion' });
        if (!get) return res.status(404).send({ Message: 'no se pudo procesar la peticion, vacia' });
        return res.status(200).send({
            Total: total,
            Pages: Math.ceil(total / itemsPerPage),
            Register: get
        })
    });
}
function showSimple(req,res) {
    var Registro = Register.find();
    if (req.body.cancelado = true) Registro = Register.find({cancelado});
    Registro.exec((err, resp) => {
        if (err) return res.status(500).send({Message: 'error al procesar la peticion, Error:' + err});
        if (!resp) return res.status(404).send({Message: 'no se pudo buscar'});
        return res.status(200).send({RegistroTotal: resp});
    });
}
function showByMonth(req,res) {
    var mes = req.params.mes;
    if (!mes) showSimple(req, res); else {
        Register.find({mes: mes}, (err, resp) => {
            if (err) return res.status(500).send({Message: 'error al procesar la peticion, Error:' + err});
            if (!resp) return res.status(404).send({Message: 'no se pudo buscar'});
            return res.status(200).send({Mes: mes, Registros: resp});
        })
    }
}
function showByMeter(req,res) {
    var meter = req.params.meter;
    if (!meter) showSimple(req, res); else {
        Register.find({meter: meter}, (err, resp) => {
            if (err) return res.status(500).send({Message: 'error al procesar la peticion, Error:' + err});
            if (!resp) return res.status(404).send({Message: 'no se pudo buscar'});
            return res.status(200).send({Medidor: meter, Registros: resp});
        })
    }
}
function update (req, res) {
    var id = req.params.id;
    var updateRegister = req.body;
    updateRegister.registered_by = req.user.sub;
    updateRegister.updated_at = moment().unix();
    Register.findByIdAndUpdate(id, updateRegister, { new: true }, (err, updated) => {
        if (err) return res.status(500).send({ Message: 'error al ejecutar la peticion... ', Error: err });
        if (!updated) return res.status(404).send({ Message: 'Error al editar el registro' });
        return res.status(200).send({ Message: 'el medidor: ' + updated.meter + ' ha sido editado', updated });
    });
}
function remove (req, res) {
    var id = req.params.id;
    Register.findByIdAndRemove(id, (err, deleted) => {
        if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion' });
        if (!deleted) return res.status(404).send({ Message: 'No se pudo borrar el registro' });
        return res.status(200).send({ Message: 'El registro con id: ' + id + ', ha sido borrado con exito!.', deleted });
    })
}
module.exports = {
    save,
    show,
    showByMonth,
    showByMeter,
    update,
    remove,
    showAll,
    getOne
}