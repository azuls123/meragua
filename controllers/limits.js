'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable del esquema del modelo //
var Limits = require('../models/limits');
//=================Declaracion de Funciones //
// Funcion de register de datos //
function save(req, res) {
    // variable para la recoleccion de datos del formulario //
    var params = req.body;
    // variable para la definicion del objeto con respecto al modelo //
    var limits = new Limits;
    // variable de fecha //
    var today = new Date();
    var currDate = today.getFullYear() + ' - ' + (today.getMonth() + 1) + ' - ' + today.getDate();
    // Log de Comprobacion //
    console.log("Dentro de save");
    // Asignacion de los parametros al modelo del Controlador //
    limits.limit_to = params.limit_to;
    limits.limit_from = params.limit_from;
    limits.cost = params.cost;
    limits.percent_cost = params.percent_cost;
    limits.eddited_by = req.user.sub;
    limits.rate_id = req.params.rate;
    // comprobacion de los valores obligatorios enviados desde el formulario //
    if (limits.rate_id) {
        // Logs de Comprobacion //
        console.log("Dentro del traspaso de Parametros");
        console.log(limits);
        // Instruccion Save de Mongoose para Guardar los Parametros en MongoDB //
        // usando un callback para el 'Catcheo' de Errores //
        limits.save((err, limitsStored) => {
            // Sentencia 'Si' para comprobar la existencia de errores //
            if (err) return res.status(500).send({ Message: 'error al enviar la peticion' });
            // Sentencia 'Si' para comprobar la existencia de valores dentro del Objeto //
            if (!limitsStored) return res.status(404).send({ Message: 'limite vacio' });
            // Sentencia 'Entonces' complementaria al 'Si' para identificar un objeto vacio //
            return res.status(200).send({ Message: 'limite agregado correctamente', limitsStored });
        })

    }
    // en caso de que los datos esten incompletos o dañados se envia un mensaje de error //
    else {
        res.status(200).send({
            Message: 'Datos faltantes o erroneos'
        })
    }
}
function show(req, res){
    var rate = req.params.rate;
    console.log(rate);

    Limits.find({rate_id: rate}, (err, resp) =>{
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion al servidor', Error: err})
        if (!resp) return res.status(404).send({Message: 'No se encotraron los limites de la tarifa'})
        return res.status(200).send({Message: 'Peticion correcta...', Limits: resp});
    })
}
function showAll(req, res){
    Limits.find().exec((err, resp) =>{
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion al servidor', Error: err})
        if (!resp) return res.status(404).send({Message: 'No se encotraron los limites de la tarifa'})
        return res.status(200).send({Message: 'Peticion correcta...', Limits: resp}), console.log(resp);
    })
}
// Funcion de Obtencion de Datos //
function shows(req, res) {
    var page = 1;
    var itemsPerPage = 8;
    if (req.params.page) page = req.params.page;
    var params = req.body;

    if (params.items) itemsPerPage = parseInt(params.items);
    console.log(itemsPerPage);

    Limits.find().paginate(page, itemsPerPage, (err, get, total) => {
        if (err) return res.status(500).send({ Message: 'error al procesar la peticion' });
        if (!get) return res.status(404).send({ Message: 'no se pudo procesar la peticion, vacia' });
        return res.status(200).send({
            Total: total,
            Pages: Math.ceil(total / itemsPerPage),
            Limits: get
        })
    });
}
// Funcion Editar //
function update(req, res) {
    var id = req.params.id;
    var updateLimits = req.body;
    Limits.findByIdAndUpdate(id, updateLimits, { new: true }, (err, limitsUpdated) => {
        if (err) return res.status(500).send({ Message: 'error al ejecutar la peticion... ', Error: err });
        if (!limitsUpdated) return res.status(404).send({ Message: 'Error al editar el Limite' });
        return res.status(200).send({ Message: 'el limite id: ' + id + ' ha sido editado', limitsUpdated });
    });
}
// Funcion Borrar //
function remove(req, res) {
    var id = req.params.id;
    Limits.find({rate_id: id}, (err, resp) =>{
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion al servidor', Error: err})
        if (!resp) return res.status(404).send({Message: 'No se encotraron los limites de la tarifa'})
        if (resp) {
            for (let index = 0; index < resp.length; index++) {
                const limit = resp[index];
                Limits.findByIdAndRemove(limit._id, (err, deleted) => {
                    if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion' });
                    if (!deleted) return res.status(404).send({ Message: 'No se pudo borrar el limite' });
                });
            }
        }
    })

}
module.exports = {
    save,
    show,
    update,
    remove,
    showAll
}