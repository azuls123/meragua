'use strict'

var Detalle = require('../models/detalleFactura');

var moment = require('moment')

function saveAll(req, res) {
    var params = req.body;
    var user = req.user.sub;
    var detalle = new Detalle;
    detalle.detalle = params.detalle;
    detalle.factura = params.factura;
    detalle.importe = params.importe;
    detalle.updated_by = user;
    detalle.updated_at = moment().unix();
    detalle.save();
    return res.status(201).send({Message: 'detalle ingresado'})
}

function getDetalle(req, res) {
    var factura = req.params.id;
    console.log(factura);
    
    Detalle.find({factura:factura}).populate('importe factura').exec((error, response) => {
        if (error) return res.status(500).send({Message: 'Error ejecutando la peticion...', Error: error});
        if (!response || response.length<=0) return res.status(404).send({Message: 'No existe detalles de esta factura...', response});
        return res.status(200).send({Message: 'Detalles Cargados.', Detalles: response});
    });
}

module.exports = {
    saveAll,
    getDetalle
}