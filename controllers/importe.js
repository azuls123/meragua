'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable del esquema del modelo //
var Importe = require('../models/importe');
var moment = require('moment');
//=================Declaracion de Funciones //
// Funcion de register de datos //
function save(req,res) {
    var params = req.body;
    var importe = new Importe;
    if (params.nombre && params.costo && params.descuento && params.percent) {
        importe.nombre = params.nombre;
        importe.costo = params.costo;
        importe.percent = params.percent;
        importe.descuento = params.descuento;
        importe.edited_at = moment().unix();
        importe.edited_by = req.user.sub;
        importe.save((err, response)=> {
            console.log('guardando....');
            
            if (err) return res.status(500).send({Message: 'error al ejecutar la peticion', Error: err});
            if (!response) return res.status(404).send({Message: 'el servidor no responde....'});
            if (params.descuento === true) {
                return res.status(201).send({Message: 'Descuento agregado correctamente', Importe: response});
            } else {
                return res.status(201).send({Message: 'Importe agregado correctamente', Importe: response});
            }
        });

    } else {
        return res.status(404).send({Message: 'Datos Faltantes.... Nombre: ' + params.nombre + ', Costo: ' + params.costo + ', Porcentaje?: ' + params.percent + ', es Descuento?: ' + params.descuento});
    }
}

function show(req, res) {
    Importe.find().exec((err, response)=>{
        if (err) return res.status(500).send({Message: 'error al ejecutar la peticion', Error: err});
        if (!response) return res.status(404).send({Message: 'el servidor no responde....'});
        return res.status(200).send({Message: 'Lista de Importes Cargada..', Importes: response});
    });
}

function update(req, res) {
    var id = req.params.id;
    var params = req.body;
    params.edited_at = moment().unix();
    params.edited_by = req.user.sub;
    Importe.findByIdAndUpdate(id, params, {new: true}, (err, resp)=>{
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion . . . Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor'});
        if (params.descuento === true ) return res.status(200).send({Message: 'El Descuento se ha editado correctamente . . . '});
        if (params.descuento === false ) return res.status(200).send({Message: 'El Importe se ha editado correctamente . . . '});
    })
}

function remove(req, res) {
    var id = req.params.id;
    Importe.findByIdAndRemove(id, (err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejectuar la peticion'})
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor. . .'});
        return res.status(200).send({Message: 'el importe se ha borrado correctamente . . .'});
    })
}

module.exports = {
    save,
    show,
    update,
    remove
}