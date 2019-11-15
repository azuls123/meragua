'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable mongoose para la conexion con MongoDB //
var mongoose = require('mongoose');
// Variable urlmongo para indicar la direccion del servidor //
var urlmongo = 'mongodb://localhost:27017/watercontrol';
// Variable importada de app.js //
var app = require('./app');
// Variables de logos //
var tearDrop = require('./resources/logo/teardrop');
// Variable del puerto para montar el servidor BackEnd //
var port = process.env.PORT || 3800;
// variable de fecha //
var today = new Date();
var currTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var currDate = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
//=================Instrucciones
// Promesa global de la variable mongoose para habilitarla en toda la API //
mongoose.Promise = global.Promise;
//=================Conexion de mongoDB mediante mongoose
// Ejemplo de conexion correcta: mongoose.connect('mongodb://user:password@sample.com:port/dbname', { useNewUrlParser: true }) //
mongoose.connect(
    // Declaracion de la direccion URL de la Base de Datos //
    urlmongo,
    // Sentencia para habilitar la compatibilidad entre mongo y las versiones nuevas y viejas de mongoose //
    { useNewUrlParser: true }
)
    // Callback "Then" confirmar la realizacion de la Instruccion Connect
    .then(() => {
        // Mensaje en consola de Confirmacion de Coneccion Exitosa
        console.log("Conexion Lista!");
        console.log("Hoy: " + today + ". Fecha Actual: " + currDate + ". Hora Actual: " + currTime);
        //=================Creacion del servidor //
        // Llamado a la funcion listen para establecer un puerto de escucha para el servidor //
        // Callback seguido de la funcion para mostrar en consola el correcto funcionamiento del servidor //
        app.listen(port, () => {
            console.log();
            console.log("Servidor Listo!");
            // Logo del BackEnd();
            tearDrop();
            // Mensajes de confirmacion del funcionamiento del servidor
            console.log("URL del Servidor: http://localhost:3800/");
        });
    })
    // Callback "Catch" para iniciar instrucciones en caso del fallo en la instruccion Connect
    .catch(
        // Despliegue del error detallado en consola
        err => console.log(err));


app.set('port', process.env.PORT || 3000);