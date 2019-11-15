'use strict'

var Mora = require('../models/mora');
var moment = require('moment');

function save(req, res) {
    var params = req.body;
    var mora = new Mora;

    if (params.cantidad_meses && (params.porcentaje || params.corte === true || params.corte === 'true')) {
        mora.cantidad_meses = params.cantidad_meses;
        mora.porcentaje = params.porcentaje;
        mora.corte = params.corte;
        mora.edited_by = req.user.sub;
        mora.edited_at = moment().unix();
        console.log('guardando mora');
        Mora.find({cantidad_meses: params.cantidad_meses}).exec(
            (err, resp) => {
                if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion...', Error: err});
                if (resp.length>=1) return res.status(403).send({Message: 'Ya se ingreso un interes para esta cantidad de meses'});
                if (!resp || resp.length<=0) {
                    mora.save(
                        (err, response) => {
                            if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion...', Error: err});
                            if (!response) return res.status(403).send({Message: 'Ya se ingreso un interes para esta cantidad de meses'});
                            return res.status(201).send({Message: 'Interes por Mora ingresado correctamente', Mora: response})
                        }
                    )
                }

            }
        )
    }
}

function update(req,res) {
    var id = req.params.id;
    var params = req.body;
    params.updated_at = moment().unix();
    params.updated_by = req.user.sub;
    Mora.findByIdAndUpdate(id, params, {new: true}, (err, response) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la Peticion...'});
        if (!response) return res.status(404).send({Message: 'La peticion no responde'});
        return res.status(200).send({Message: 'Valores de Mora editados correctamente...'})
    })
}

function deletes(req,res) {
    var id = req.params.id;
    Mora.findByIdAndRemove(id, (err, response) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la Peticion...'});
        if (!response) return res.status(404).send({Message: 'La peticion no responde'});
        return res.status(200).send({Message: 'Valores de Mora eliminados correctamente...'})
    })    
}

function gets(req,res) {
    Mora.find().exec((err, response) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la Peticion...'});
        if (!response) return res.status(404).send({Message: 'La peticion no responde'});
        return res.status(200).send({Message: 'Peticion Exitosa, estos son los valores de mora', Mora: response});
    })
}
module.exports = {
    save,
    update,
    deletes,
    gets
}