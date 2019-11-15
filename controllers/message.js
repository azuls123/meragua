'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //

var moment = require('moment');
// var mongoosePaginate = require('mongoose-pagination');

var Message = require('../models/message');

function prueba(req, res){
    return res.status(200).send({Message: 'controlador funcionando correctamente'});
};
function save(req , res){
    var params = req.body;
    var message = new Message();

    if (!params.text || !params.receiver) return res.status(200).send({Message: 'campos incompletos'});
    if (params.text && params.receiver){
        message.emitter = req.user.sub;
        message.receiver = params.receiver;
        message.text = params.text;
        message.viewed = false;
        message.created_at = moment().unix();

        message.save((err, saved) => {
            if (err) return res.status(500).send({Message: 'error al guardar el mensaje', Error: err});
            if (!saved) return res.status(404).send({Message: 'no se encuentra el mensaje'});

            return res.status(200).send({Message: 'el mensaje ha sido guardado', saved});
        });
    }
}


function showEmitter(req,res){
    var userId = req.user.sub;
    var page = 1;

    if (req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 4;
    console.log(userId);

    Message.find({emitter: userId}).sort([['created_at', 'desc']]).populate('receiver emitter', '_id cuenta nombre apellido image' ).paginate(page, itemsPerPage, (err, messages, total) =>{
        if (err) return res.status(500).send({Message: 'error al mostrar', Error: err});
        if (!messages) return res.status(404).send({Message: 'no se encontraron los mensajes'});
        return res.status(200).send({
            Total: total,
            Pages: Math.ceil(total/itemsPerPage),
            Messages: messages
        })
    })
}
function showReceiver(req,res){
    var userId = req.user.sub;
    var page = 1;

    if (req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 4;
    console.log(userId);

    Message.find({receiver: userId}).sort([['created_at', 'desc']]).populate('emitter receiver', '_id cuenta nombre apellido image' ).paginate(page, itemsPerPage, (err, messages, total) =>{
        if (err) return res.status(500).send({Message: 'error al mostrar', Error: err});
        if (!messages) return res.status(404).send({Message: 'no se encontraron los mensajes'});
        return res.status(200).send({
            Total: total,
            Pages: Math.ceil(total/itemsPerPage),
            Messages: messages
        });
    });
}
function unviewed(req,res){
    var userId = req.user.sub;

    Message.count({receiver: userId, viewed: 'false'}).exec((err, unvieweds) => {
        if (err) return res.status(500).send({Message: 'error al buscar mensajes sin leer'});
        if (!unvieweds) return res.status(404).send({Message: 'no hay mensajes sin leer'});
        return res.status(200).send({Count: unvieweds});
    });
}
function viewed(req, res){
    var userId = req.user.sub;
    Message.update({receiver: userId,viewed: 'false'}, {viewed: 'true'}, {"multi": true}, (err, msg) => {
        if (err) return res.status(500).send({Message: 'error al marcar como visto'});
        if (!msg) return res.status(404).send({Message: 'no hay mensajes leidos'});
        return res.status(200).send({Message: msg});
    });
}
module.exports = {
    prueba,
    save,
    showReceiver,
    showEmitter,
    unviewed,
    viewed
}