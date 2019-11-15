'use strict'

var express = require('express');

var ErrorCatcherController = require('../controllers/errorCatcher');

var api = express.Router();

var md_auth = require('../middleware/authenticate');

//=================Rutas //
//========Post //
api.post('/save', md_auth.ensureAuth, ErrorCatcherController.saveError);
//========Put //
api.put('/put-me-on-it/:id', md_auth.ensureAuth, ErrorCatcherController.workOnIt);
api.put('/i-got-it/:id', md_auth.ensureAuth, ErrorCatcherController.solvedError);
//========Get //
api.get('/errors', ErrorCatcherController.getErrors);
module.exports = api;