'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable de registro //
var Descuento = require('../models/descuento');
var DescuentoUsuario = require('../models/descuentoUsuario');
var moment = require('moment');
//=================Declaracion de Funciones //
// Funcion de registro de datos //
function save(req, res) {
    var params = req.body;
    var descuento = new Descuento;
    if (params.valor && params.nombre) {
        descuento.nombre = params.nombre;
        descuento.valor = params.valor;
        descuento.updated_at = moment().unix();
        descuento.edited_by = req.user.sub;
        descuento.save((err, resp) => {
            if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion... Error: ' + err });
            if (!resp) return res.status(404).send({ Message: 'La peticion no ha devuelto ningun valor...' });
            return res.status(200).send({ Message: 'Exito al guardar el descuento: ' + resp.nombre });
        })
    }
}
function saveDescUsu(req,res) {
    var params = req.body;
    var descUser = new DescuentoUsuario;
    if (params.descuento && params.usuario){
        descUser.descripcion = params.descripcion;
        if (!params.descripcion) descUser.descripcion = 'Agregar una descripcion';

        descUser.usuario = params.usuario;
        descUser.descuento = params.descuento;

        descUser.save((err, resp) => {
            if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion... Error: ' + err});
            if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor...'});
            return res.status(200).send({Message: 'El descuento(id) de: ' + resp.descuento + ' al usuario(id): ' + resp.usuario + ', se ha guardado correctamente'});
        })
    }
}

function show(req, res) {
    var page = req.params.page;
    if (!req.params.page) page = 1;
    var itemsPerPage = req.body.items;
    if (!req.body.items) itemsPerPage = 5;

    Descuento.find().paginate(page, itemsPerPage, (err, resp, total) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion... Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor... '});
        return res.status(200).send({
            Total: 'Tipos de Descuentos: ' + total,
            Pages: 'Paginas Totales: ' + Math.ceil(total/itemsPerPage),
            Descuentos: resp
        })
    })
}

function showDescUsu(req, res) {
    var page = req.params.page;
    if (!req.params.page) page = 1;
    var itemsPerPage = req.body.items;
    if (!req.body.items) itemsPerPage = 5;

    DescuentoUsuario.find().paginate(page, itemsPerPage, (err, resp, total) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion... Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor... '});
        return res.status(200).send({
            Total: 'Descuentos a Usuarios: ' + total,
            Pages: 'Paginas Totales: ' + Math.ceil(total/itemsPerPage),
            Descuentos: resp
        })
    })
}

function update(req, res) {
    var id = req.params.id;
    var params = req.body;

    Descuento.findByIdAndUpdate(id, params, (err, resp)=>{
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion.... Error: ' + err });
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor...'});
        return res.status(200).send({Message: 'El Descuento con id: ' + resp.id + ' ha sido editado'});
    })
}

function updateDescUsu(req, res) {
    var id = req.params.id;
    var params = req.body;

    DescuentoUsuario.findByIdAndUpdate(id, params, (err, resp)=>{
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion.... Error: ' + err });
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor...'});
        return res.status(200).send({Message: 'El Descuento del usuario con id: ' + resp.id + ' ha sido editado'});
    })
}

function remove(req, res) {
    var id = req.params.id;
    Descuento.findByIdAndRemove(id, (err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion. . . ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor...'});
        return res.status(200).send({Message: 'el tipo de descuento se ha borrado exitosamente. . . '});
    })
}

function removeDescUsu(req, res) {
    var id = req.params.id;
    DescuentoUsuario.findByIdAndRemove(id, (err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion. . . ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor...'});
        return res.status(200).send({Message: 'el tipo de descuento se ha borrado exitosamente. . . '});
    })
}
module.exports = {
    save,
    saveDescUsu,
    show,
    showDescUsu,
    update,
    updateDescUsu,
    remove,
    removeDescUsu
}