'use strict'

var express = require('express');

var MoraController = require('../controllers/mora');

var api = express.Router();
var md_auth = require('../middleware/authenticate');
//=================Rutas //
//========Post //
api.post('/save', md_auth.ensureAuth, MoraController.save);
//========Get //
api.get('/show', md_auth.ensureAuth, MoraController.gets);
//========Put //
api.put('/update/:id', md_auth.ensureAuth, MoraController.update);
//========Delete //
api.delete('/delete/:id', md_auth.ensureAuth, MoraController.deletes);

module.exports = api;