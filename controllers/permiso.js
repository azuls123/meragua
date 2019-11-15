'use strict'

var Permiso = require('../models/permiso');

var moment = require('moment');

function save(req, res) {
    var params = req.body;
    var permiso = new Permiso();
    permiso.crear = params.crear;
    permiso.leer = params.leer;
    permiso.actualizar = params.actualizar;
    permiso.borrar = params.borrar;
    permiso.tabla = params.tabla;
    permiso.updated_at = moment().unix();
    permiso.updated_by = req.user.sub;

    permiso.save((err, response) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion...'});
        if (!response) return res.status(404).send({Message: 'La peticion no devolvio ningun valor'});
        console.log(response);

    });
}
function update(req, res) {
    var params = req.body;
    var id = req.params.id;
    var permiso = new Permiso();
    permiso.crear = params.crear;
    permiso.leer = params.leer;
    permiso.actualizar = params.actualizar;
    permiso.borrar = params.borrar;
    permiso.tabla = params.tabla;
    permiso.updated_at = moment().unix();
    permiso.updated_by = req.user.sub;

    permiso.findByIdAndUpdate(id, params, {new:true},(err, response) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion...'});
        if (!response) return res.status(404).send({Message: 'La peticion no devolvio ningun valor'});
        console.log(response);

    });
}
function show(req, res) {
    Permiso.Find({empleado: req.params.empleado}).pupulate('tabla empleado').exec((err, response) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion...'});
        if (!response) return res.status(404).send({Message: 'La peticion no devolvio ningun valor'});
        return res.status(200).send({Message: 'Permisos del Usuairo', Permisos: response})
    });
}

module.exports = {
    save,
    show
}