'use strict'

var ErrorCatcher = require('../models/errorCatcher');
var moment = require('moment');

function saveError(req, res) {
    var params = req.body;
    let error = new ErrorCatcher;
    error.description = params.description;
    error.message = params.message;
    error.action = params.action;
    error.code = params.code + '-' + moment().unix();
    error.title = params.title;
    error.zone = params.zone;
    error.table = params.table;
    error.updated_at = moment().unix();
    error.repaired = false;
    error.registered_by = req.user.sub;
    error.solved_by = null;

    error.save((err, response) => {
        if (err) return res.status(500).send({Message: 'vaya, esto es vergonzoso... se ha producido un error registrando el error...', Error: err, error});
        if (!response) return res.staus(404).send({Message: 'ok, esto no deberia pasar..... /.\\ ..... no se ha obtenido una respuesta en el servidor...'});
        if (response) return res.status(200).send({Message: 'Oh No!, :( Se ha Producido Un Error... Pero lo Hemos almacenado en el Servidor para Solucionarlo!!, Comunicate con uno de los administradores e indicale éste Código: ' + error.code})
    })
}

function workOnIt(req, res) {
    var id = req.params.id;
    let params;
    params.solved_by = req.user.sub;
    ErrorCatcher.findByIdAndUpdate(id, params, {new:true}, (err, response) =>{
        if (err) return res.status(500).send({Message: 'Ok, esto no deberia pasar..... pero no se pudo registrar la correcion del error :c...'});
        if (!response) return res.status(404).send({Message: 'Hmmm... Que raro!, El servidor no dice nada!!'});
        return res.status(200).send({Message: 'Listo!.. Ya estas a cargo del error: ' + response.code });
    })
}

function solvedError(req, res){
    var id = req.params.id;
    let params;
    params.description = 'Internal Server Error';
    params.repaired = true;
    params.updated_at = moment().unix();
    params.solved_by = req.user.sub;
    ErrorCatcher.findByIdAndUpdate(id, params, {new:true}, (err, response) =>{
        if (err) return res.status(500).send({Message: 'Ok, esto no deberia pasar..... pero no se pudo registrar la correcion del error :c...'});
        if (!response) return res.status(404).send({Message: 'Hmmm... Que raro!, El servidor no dice nada!!'});
        return res.status(200).send({Message: 'Listo!... Se registró la Solución de este Error :D'});
    })
}

function getErrors(req,res) {
    ErrorCatcher.find().sort([['update_at', 'asc']]).exec((err, response) => {
        if (err) return res.status(500).send({Message: 'Ups!, Esto no deberia estar pasando!, el servidor devolvio un error :c.. ' , Error: err});
        if (!response) return res.status(404).send({Message: 'Todo bien.... o todo mal??!!.... bueno no se, el punto es que no hay registro de errores... espero que no exista ninguno n.n'});
        if (response) return res.status(200).send({Message: 'Diablos, me gustaria no tener que decir esto pero bueno... Aquí estan los errores u.u : ', Error: response});
    })
}
module.exports = {
    saveError,
    workOnIt,
    solvedError,
    getErrors
}