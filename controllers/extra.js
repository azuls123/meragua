'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable de extras //
var Extra = require('../models/extra');
var moment = require('moment');
//=================Declaracion de Funciones //
// Funcion de registro de datos //
function save(req, res){
    var params = req.body;
    var extra = new Extra;

    if (params.date && params.rmuv) {
        extra.date = params.date;
        extra.rmuv = params.rmuv;
        extra.updated_at = moment().unix();
        extra.updated_by = req.user.sub;
        extra.save((err, resp) => {
            if (err) return res.status(500).send({Message: 'error al ejecutar la peticion...', Error: err});
            if (!resp) return res.status(404).send({Message: 'la peticion no devolvio ningun valor'});
            return res.status(200).send({Message: 'Se han guardado los Valores'});
        })
    } else {
        return res.status(404).send({Message: 'datos incompletos', Extra: params});
    }
}
function update(req, res) {
    var id = req.params.id;
    var params = req.body;
    params.updated_at = moment().unix();
    params.updated_by = req.user.sub;
    Extra.findByIdAndUpdate(id, params, {new : true}, (err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion... Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ninguna respuesta...'});
        return res.status(200).send({Message: 'se han editado los datos correctamente', resp});
    })
}
function show(req, res){
    Extra.find().sort([['date', 'desc']]).populate('mora updated_by').exec((err, response) => {
        if (err) return res.status(500).send({Message: 'Error al procesar la peticion en el servidor', Error: err});
        if (!response) return res.status(404).send({Message: 'La peticion no retorno ninguna respuesta..'});
        return res.status(200).send({Message: 'Se han Obetnido los valores de RMUV y Mora Registrados!!...', extra: response});

    })
}
function showPaginate(req, res) {
    var page = 1;
    var itemsPerPage = 5;

    if (req.params.page) page = req.params.page;
    if (req.body.items) itemsPerPage = req.body.items;

    Extra.find().paginate(page, itemsPerPage, (err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion... Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor...'});
        return res.status(200).send({Extras: resp});
    })
}

function remove(req,res) {
    var id = req.params.id;
    Extra.findByIdAndRemove(id, (err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion.. Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'la peticion no ha devuelto ninguna respuesta...'});
        return res.status(200).send({Message: 'los valores de iva: ' + resp.iva + ', y rmuv: ' + resp.rmuv + ', se han borrado...'});
    })
}

module.exports = {
    save,
    show,
    update,
    remove
}