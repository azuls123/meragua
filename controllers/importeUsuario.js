'use strict'

var ImporteUsuario = require('../models/importeUsuario');
var moment = require('moment');

function save(req, res) {
    var params = req.body;
    var importeUsuario = new ImporteUsuario;

    if (params.medidor && params.importe) {
        importeUsuario.detalle = params.detalle;
        importeUsuario.medidor = params.medidor;
        importeUsuario.importe = params.importe;
        importeUsuario.edited_by = req.user.sub;
        importeUsuario.edited_at = moment().unix();

        ImporteUsuario.find({$and: [
            {medidor: params.medidor}, 
            {importe: params.importe}
        ]}, (err,response) => {
            if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion de unicidad', Error: err});
            if (response.length>=1) return res.status(403).send({Message: 'este tipo de importe ya se ha aplicado...'});
            importeUsuario.save((err, responseSave) => {
                if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion de Ingreso', Error: err});
                if (!responseSave) return res.status(404).send({Message: 'El servidor no esta respondiendo o tardo mucho en responder..'});
                return res.status(201).send({Message: 'Detalle de Importe de Usuario guardado correctamente!...', ImporteUsuario: responseSave});
            })
        })
    }
}

function show(req,res) {
    ImporteUsuario.find().exec((err, response) => {
        if (err) return res.status(500).send({Message: 'error al ejectuar la peticion....', Error: err});
        if (!response) return res.status(404).send({Message: 'el servidor no responde o ha tardado mucho en responder'});
        return res.status(200).send({Message: 'Peticion aceptada... lista de detalles....', ImporteUsuario: response});
    })
}

function deletes(req,res) {
    var id = req.params.id;
    ImporteUsuario.findByIdAndRemove(id, (err, response) => {
        if (err) return res.status(500).send({Message: 'error al ejecutar la peticion....', Error: err});
        if (!response) return res.status(404).send({Message: 'el servidor no respondio'});
        return res.status(200).send({Message: 'el detalle de importeUsuario ha sido eliminado....'});
    })
}

function update(req, res) {
    var id = req.params.id;
    var params = req.body;
    ImporteUsuario.findByIdAndUpdate(id, params, (err, response) => {
        if (err) return res.status(500).send({ Message: 'Error en la peticion' });
        if (!resp) res.status(500).send({ Message: 'No se recibio respuesta del servidor' });
        return res.status(200).send({Message: 'Detalle del usuario y sus importes editado correctamente'})
    })
}

module.exports = {
    save,
    update,
    deletes,
    show
}