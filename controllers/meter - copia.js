'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable del esquema del modelo //
var Meter = require('../models/meter');
var mongoosePaginate = require('mongoose-pagination');
var moment = require('moment');

var fs = require('fs');
var path = require('path');
// var User = require('../models/user');
// var Rate = require('../models/rate');
//=================Declaracion de Funciones //

// Funcion de register de datos //
function save(req, res) {
    // variable para la recoleccion de datos del formulario //
    var params = req.body;
    // variable para la definicion del objeto con respecto al modelo //
    var meter = new Meter;
    // variable de fecha //
    var today = new Date();
    var currDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    // Log de Comprobacion //
    console.log("Dentro de save");
    // comprobacion de los valores obligatorios enviados desde el formulario //
    if (params.clave) {
        // Asignacion de los parametros al modelo del Controlador //
        meter.clave = params.clave;
        meter.user = params.user;
        meter.rate = params.rate;
        meter.direccion = params.direccion;
        meter.updated_at = moment().unix();
        meter.edited_by = req.user.sub;
        meter.image = null;
        // meter.updated_at = currDate;
        // comprobar valor Unico //
        Meter.findOne({ clave: meter.clave }).exec((err, meteres) => {
            if (err) {
                // Log de Error mostrado en la Consola //
                console.log(err);
                // Retorno de un error 500: no se pudo realizar la accion //
                return res.status(500).send({
                    Message: 'Error al Guardar',
                    message2: err
                });
            }
            if (meteres && meteres.length >= 1) {
                return res.status(500).send({
                    Message: 'valores duplicados',
                    message2: err
                });
            }
        })
        // Logs de Comprobacion //
        console.log("Dentro del traspaso de Parametros");
        console.log(meter);
        Meter.find({ clave: meter.clave }).exec((err, meteres) => {
            if (err) {
                return res.status(500).send({
                    Message: 'Error al guardar el Medidor'
                },
                    console.log(err))
            }
            if (meteres && meteres.length >= 1) {
                return res.status(500).send({ Message: 'Medidor duplicado' })
            } else {
                // Instruccion Save de Mongoose para Guardar los Parametros en MongoDB //
                // usando un callback para el 'Catcheo' de Errores //
                meter.save((err, meterStored) => {
                    // Sentencia 'Si' para comprobar la existencia de errores //
                    if (err) {
                        // Log de Error mostrado en la Consola //
                        console.log(err);
                        // Retorno de un error 500: no se pudo realizar la accion //
                        return res.status(500).send({
                            Message: 'Error al Guardar',
                            message2: err
                        });
                    }
                    // Sentencia 'Si' para comprobar la existencia de valores dentro del Objeto //
                    if (meterStored) {
                        // Se envian los datos del objeto mediante un send con el objeto mismo y un codigo 200 //
                        res.status(200).send({ Message: 'El medidor ' + meterStored.clave + ' ha sido Guardado Exitosamente',meter: meterStored });
                    }
                    // Sentencia 'Entonces' complementaria al 'Si' para identificar un objeto vacio //
                    else {
                        // Se devuelve un error 404 al cliente indicando que el objeto se encuentra vacio //
                        res.status(404).send({
                            Message: 'Objeto Vacio o Incompleto'
                        })
                    }
                })
            }
        })
    }
    // en caso de que los datos esten incompletos o dañados se envia un mensaje de error //
    else {
        res.status(200).send({
            Message: 'Datos faltantes o erroneos'
        })
    }
}
function show(req, res) {
    Meter.find().populate('user rate edited_by').sort([['clave', 'asc']]).exec((err, resp) => {
        if (err) return res.status(500).send({Message: 'error al procesar la peticion, Error:' + err});
        if (!resp) return res.status(404).send({Message: 'no se pudo buscar'});
        return res.status(200).send({Medidores: resp});
    });
}
function getMeter(req, res) {
    Meter.findOne({_id: req.params.id}).populate('rate edited_by user').exec((err, meter) => {
        if (err) return res.status(500).send({Message: 'Error interno en el servidor', Error: err});
        if (!meter) return res.status(404).send({Message: 'No se encontró ningun medidor'});
        return res.status(200).send({meter: meter});
    })
}
function showByUser(req, res) {
    var id = req.params.id;
    // id = 'ObjectId("'+id+'")';
    Meter.find({user: id}).populate('rate user edited_by').exec((err, resp) => {
        if (err) return res.status(500).send({Message: 'error al procesar la peticion, Error:' + err});
        if (!resp) return res.status(404).send({Message: 'no se pudo buscar'});
        return res.status(200).send({Medidores: resp});
    });
}
function showByRate(req, res) {
    var rate = req.params.rate;
    console.log(rate);
    if (!rate) showSimple(req, res); else {
        Meter.find({rate: rate}, (err, resp) => {
            if (err) return res.status(500).send({Message: 'error al procesar la peticion, Error:' + err});
            if (!resp) return res.status(404).send({Message: 'no se pudo buscar'});
            return res.status(200).send({Tarifa: rate, Medidores: resp});
        });
    }
}
function update(req, res) {
    var id = req.params.id;
    var updateMeter = req.body;
    updateMeter.updated_at = moment().unix();
    updateMeter.edited_by = req.user.sub;
    Meter.findByIdAndUpdate(id, updateMeter, { new: true }, (err, updated) => {
        if (err) return res.status(500).send({ Message: 'error al ejecutar la peticion... ', Error: err });
        if (!updated) return res.status(404).send({ Message: 'Error al editar el Medidor' });
        return res.status(200).send({ Message: 'el medidor con clave: ' + updated.clave + ' ha sido editado', meter: updated });
    });
}
function remove(req, res) {
    var id = req.params.id;
    Meter.findByIdAndRemove(id, (err, deleted) => {
        if (err) return res.status(500).send({ Message: 'Error al ejecutar la peticion' });
        if (!deleted) return res.status(404).send({ Message: 'No se pudo borrar el medidor' });
        return res.status(200).send({ Message: 'El medidor con id: ' + id + ', ha sido borrado con exito!.', deleted });
    })
}
function showByClave(req, res) {
    var clave = req.params.clave;

    Meter.findOne({clave}, (err, resp) => {
        if (err) return res.status(500).send({Message: 'Error al ejecutar la peticion... Error: ' + err});
        if (!resp) return res.status(404).send({Message: 'La peticion no ha devuelto ningun valor...'});
        return res.status(200).send({Medidor: resp});
    })
}

function UploadImage(req,res) {
    var MeterId = req.params.id;
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            // actualizar documento del user
            Meter.findByIdAndUpdate(MeterId, { image: file_name }, { new: true }, (err, resp) => {
                if (err) return res.status(500).send({ Message: 'Error en la peticion' });
                if (!resp) res.status(500).send({ Message: 'No se actualizo el usuario' });
                return res.status(200).send({Message: 'Croquis del Medidor Subido', medidor: resp });
            });
        } else {
            return removeFilesOfUpload(res, file_path, 'Ups!, Algo va mal, no se ha podido subir el archivo. Extension no valida.');
        }
    } else return res.status(404).send({message : 'no se pudo subir la imagen'})
}

function removeFilesOfUpload(res, file_path, message) {
    fs.unlink(path, (err) => {
        console.log(err);
        return res.status(200).send({message})
    });
}
function getImage(req, res) {
    var image_File = req.params.imageFile;
    var path_file = './uploads/meters/' + image_File;

    fs.exists(path_file, (exist) => {
        if (exist) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(404).send({ Message: 'Ups, no encontramos la imagen dentro del servidor' });
        };
    });
}
module.exports = {
    save,
    show,
    showByUser,
    showByRate,
    update,
    remove,
    showByClave,
    UploadImage,
    getImage,
    getMeter
}