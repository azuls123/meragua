'use strict' // Habilita el uso de cualquiera de librerias de forma forzada y el uso de los nuevos standares de JavaScript 6 //
//=================Declaracion de variables //
// Variable express para la creacion del servidor mediante express //
var express = require('express');
// Variable para "Parsear" o igualar los lenguajes del servidor con el api //
var bodyParser = require('body-parser');
// Variable app para cargar el Framework de Express //
var app = express();
// Variable para Configurar las Rutas Estaticas
var path = require('path');
//=================Seccion de Middlewares que se ejecutaran antes de llegar a un controlador //
// Configuracion base para body Parser //
app.use(bodyParser.urlencoded({ extended: false }));
// Instruccion que transforma los datos arrojados por el servidor en objetos json //
app.use(bodyParser.json());
// Configuracion para intercambio de recursos de origenes cruzados CORS //
app.use((req, res, next) => {
    // Configuracion de Control de Acceso a cualquiera //
    res.header('Access-Control-Allow-Origin', '*');
    // Configuracion de control de Cabeceras, definicion de tipos //
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    // Configuracion de control de Metodos accesibles (Api-Rest[GET, POST, PUT, DELETE, OPTIONS]) //
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    // Acceso final a los metodos de Api Rest por medio de las cabeceras //
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');

    next();
});
// Morgan request viewer //
var morgan = require('morgan');
//=================Cargar Rutas //
// User
var UserRoutes = require('./routes/user');
// Noticias o Publicaciones //
var publicationRoutes = require('./routes/publication');
// rutas de follow
var followRoutes = require('./routes/follow');
// rutas de message
var messageRoutes = require('./routes/message');
// rutas de Tarifa //
var rateRoutes = require('./routes/rate');
// rutas de limites //
var limitsRoutes = require('./routes/limits');
// rutas de medidores //
var meterRoutes = require('./routes/meter');
// rutas de registros //
var registerRoutes = require('./routes/register');
// rutas de facturas //
var billRoutes = require('./routes/bill');
// rutas de role_users //
var role_userRoutes = require('./routes/role_user');
// rutas de tablas //
var tablaRoutes = require('./routes/tabla');
// ruta de extras //
var extraRoutes = require('./routes/extra');
// ruta de descuentos //
var descuentoRoutes = require('./routes/descuento');
// ruta de importes //
var importeRoutes = require('./routes/importe');
// ruta de errores //
var errorCatcherRoutes = require('./routes/errorCatcher');
// ruta de contenido borrado //
var erasedDataRoutes = require('./routes/erasedData');
// ruta de mora //
var moraRoutes = require('./routes/mora');
// ruta de mora //
var importeUsuarioRoutes = require('./routes/importeUsuario');
// ruta de detallefactura //
var detalleRoutes = require('./routes/detalleFactura');

//=================Seccion de Rutas
// variable morgan para ver los eventos de las rutas //
app.use(morgan('combined'));
// variable para acceder al frontend
// app.use(express.static(path.join(__dirname, 'client')));
app.use('/', express.static('client', {redirect: false}));

// variable de rutas de usuarios //
app.use('/user', UserRoutes);
// varaible de rutas de seguimiento //
app.use('/follow', followRoutes);
// variable de rutas de noticias o publicaciones //
app.use('/publication', publicationRoutes);
// variable de mensajeria //
app.use('/message',messageRoutes);
// variable de tarifa //
app.use('/rate', rateRoutes);
// variable de limites //
app.use('/limits', limitsRoutes);
// variable de medidores //
app.use('/meter', meterRoutes);
// variable de registros //
app.use('/register', registerRoutes);
// variable de facturas //
app.use('/bill', billRoutes);
// variable de role_useres //
app.use('/role_user', role_userRoutes);
// variable de tablas //
app.use('/tabla', tablaRoutes);
// variable de extras //
app.use('/extra', extraRoutes);
// variable de descuentos //
app.use('/descuento', descuentoRoutes);
// variable de importes //
app.use('/importe', importeRoutes);
// variable de errores //
app.use('/errors', errorCatcherRoutes);
// variable de contenido borrado //
app.use('/erased', erasedDataRoutes);
// variable de moras //
app.use('/mora', moraRoutes);
// variable de detalles de importe usuario //
app.use('/importe-usuario', importeUsuarioRoutes);
// variable de detalles de importe usuario //
app.use('/detalle-factura', detalleRoutes);
// Ruta por Defecto, se establecen los parametros Request y Response mediante un Callback al metodo GET //
app.get('/', (req, res) => {
    console.log('API Launched Succefully');
    
    res.status(200).send({
        Message: 'Hola Mundo!, Servidor en Ejecucion',
        line01: 'GAD Cantonal de       +       Departamento   ',
        line02: '     Mera            +++         de Agua     ',
        line03: '                    +++++        Potable     ',
        line04: '    *              +++++++         *         ',
        line05: '   ***            +++++++++       ***        ',
        line06: '  *****          +++++++++++     * ***       ',
        line07: ' * *****        +++++++++++++    *  **       ',
        line08: '*  ******      + +++++++++++++     -         ',
        line09: '*  ******     +  ++++++++++++++              ',
        line10: ' *******     +    ++++++++++++++             ',
        line11: '   ---      +      ++++++++++++++            ',
        line12: '            +       +++++++++++++            ',
        line13: '            +       +++++++++++++            ',
        line14: '             +_   _+++++++++++++             ',
        line15: '======-    -  +++++++++++++++++  -    -======',
        line16: '===-    -===-   +++++++++++++   -===-    -===',
        line17: '=-   -====-  --=   +++++++   =--  -====-   -=',
        line18: '-   -====-  --====         ====--  -====-   -',
        line19: '=-   -====-  --===============--  -====-   -=',
        line20: '===-    -===-_ _ _ _ _ _ _ _ _ _-===-    -===',
        line21: '======-    -=====================-    -======',
        line22: '=========-_ _ _ _ _ _ _ _ _ _ _ _ _-=========',
        line23: '=============================================',
    });
});

app.get('*', function(req, res, next) {
    res.sendfile(path.resolve('client/index.html'));
})

// Exportar las instrucciones y procesos //
module.exports = app;
