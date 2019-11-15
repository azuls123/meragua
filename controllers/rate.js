'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable del esquema del modelo //
var User = require('../models/user');
var Rate = require('../models/rate');
var Limits = require('../models/limits');
var mongoosePaginate = require('mongoose-pagination');
//=================Declaracion de Funciones //
// Funcion de register de de datos //
function save(req, res) {
    // variable para la recoleccion de datos del formulario //
    var params = req.body;
    // variable para la definicion del objeto con respecto al modelo //
    var rate = new Rate;
    // Log de Comprobacion //
    console.log("Dentro de save");
    Rate.find((err, response) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion de comprobacion'});
        if (response.Rates) {
            for (let index = 0; index < response.Rates.length; index++) {
                const element = response.Rates[index];
                if (element.tarifa.toLowerCase().replace(' ','').indexOf(params.tarifa.toLowerCase().replace(' ',''))) {
                    return res.status(500).send({Message: 'Tarifa Registrada Anteriormente.'});
                }
            }
        }
    });

    // comprobacion de los valores obligatorios enviados desde el formulario //
    if (params.tarifa && req.user.sub) {
        // Asignacion de los parametros al modelo del Controlador //
        rate.tarifa = params.tarifa;
        rate.base = params.base
        rate.edited_by = req.user.sub;
        rate.percent_cost = params.percent_cost;
        // Logs de Comprobacion //
        console.log("Dentro del traspaso de Parametros");
        console.log(rate);
        // Instruccion Save de Mongoose para Guardar los Parametros en MongoDB //
        // usando un callback para el 'Catcheo' de Errores //
        rate.save((err, tarifaStored) => {
            // Sentencia 'Si' para comprobar la existencia de errores //
            if (err) return res.status(500).send({ Message: 'Error al Guardar la Tarifa' });
            // Sentencia 'Si' para comprobar la existencia de valores dentro del Objeto //
            if (!tarifaStored) return res.status(404).send({ Message: 'No se pudo ingresar la Tarifa' });
            // Sentencia 'Entonces' complementaria al 'Si' para identificar un objeto vacio //
            return res.status(200).send({ Message: ' Tarifa Ingresada correctamente', Tarifa: tarifaStored });
        })
    }
    // en caso de que los datos esten incompletos o dañados se envia un mensaje de error //
    else {
        res.status(200).send({
            Message: 'Datos faltantes o erroneos'
        })
    }
}
function show(req, res) {
    Rate.find({}).populate('edited_by').exec((err, response) => {
        if (err) return res.status(500).send({ Message: 'error al obtener las tarifas' });
        if (!response) return res.status(404).send({ Message: 'no existen tarifas' });
        return res.status(200).send({
            Message: 'Listado de Tarifas',
            Rates: response
        });
    })
}
function findRate(req, res) {
    const id = req.params.id;
    Rate.findById(id).exec((error, response)=>{
        if (error) return res.status(500).send({Message: 'Error al enviar la peticion....', Error: error});
        if (!response) return res.status(404).send({Message: 'No existe esa tarifa...'});
        return res.status(200).send({Message: 'Tarifa Econtrada!!..', Rate: response});
    })
}
function rateLimits(req, res) {
    var rate = req.params.id;
    Limits.find({rate_id: rate}, (err, resp) => {
        if (err) return res.status(500).send({Message: 'error al ejectuar la peticion'});
        if (!resp) return res.status(404).send({Message: 'no se encontraron limites'});
        return res.status(200).send({Limites: resp});
    })
}
function update(req, res) {
    var userId = req.user.sub;
    var rate_id = req.params.id;
    var tarifa = req.body.tarifa;
    var params = [];
    params = {
        tarifa,
        edited_by: userId
    };
    // return res.status(200).send({params});
    Rate.findOneAndUpdate({ _id: rate_id }, params, { new: true }, (err, rateUpdated) => {
        if (err) return res.status(500).send({ Message: 'Error en la peticion' });
        if (!rateUpdated) res.status(500).send({ Message: 'No se actualizo la tarifa' });
        return res.status(200).send({ Tarifa: rateUpdated });
    })
}
function deleteRate(req, res) {
    var rateId = req.params.id;

    Rate.findOneAndDelete({ '_id': rateId }, (err, delt) => {
        if (err) return res.status(500).send({ Message: 'Error al borrar la tarifa' });
        if (!delt) return res.status(404).send({ Message: 'No se borro ninguna tarifa' });
        return res.status(200).send({ Message: 'tarifa eliminada', delt });
    });
}
module.exports = {
    save,
    show,
    update,
    deleteRate,
    rateLimits,
    findRate
}