'use strict'

var express = require('express');

var DetalleController = require('../controllers/detalleFactura');

var api = express.Router();

var md_aut = require('../middleware/authenticate');


api.post('/save', md_aut.ensureAuth, DetalleController.saveAll);

api.get('/detalle/:id', md_aut.ensureAuth, DetalleController.getDetalle);

module.exports = api;