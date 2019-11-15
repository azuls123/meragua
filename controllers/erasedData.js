'use strict'

var ErasedData = require('../models/erasedData');
var moment = require('moment');
function save (req, res){
    var params = req.body;
    var erasedData = new ErasedData;
    if (req.user.sub) {
        erasedData.tabla = params.tabla;
        erasedData.contenido = erasedData.contenido;
        erasedData.erased_at = moment().unix()
        erasedData.erased_by = req.user.sub;

        erasedData.save((err, response)=>{
            if (err) return res.status(500).send({Message: 'Error en la peticion', Error: err});
            if (!response) return res.status(404).send({Message: 'No se ha recibido respuesta por parte del servidor'});
            if (response) return res.status(201).send({Message: 'Registrado correctamente..'})
        })
    }
}
function get(req,res) {
    ErasedData.find((err, response)=> {
        if (err) return res.status(500).send({Message: 'error en la peticion', Error: err});
        if (!response) return res.status(404).send({Message: 'No se recibio respuesta del servidor'});
        if (response) return res.status(200).send({Message: 'Lista de Borrados Obtenida', erasedData: response})
    })
}
module.exports = {
    save, get
}