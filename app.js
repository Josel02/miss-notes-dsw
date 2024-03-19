var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Rutas existentes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Rutas nuevas
var notesRouter = require('./routes/notes');

var app = express();

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Usar rutas
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/notes', notesRouter);

// Servir archivos estáticos de React en producción
if (process.env.NODE_ENV === 'production') {
  // Cambio 1: Ruta estática para los archivos construidos por React
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Cambio 2: Manejar cualquier solicitud que no coincida con las rutas anteriores para devolver el archivo index.html de React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Captura error 404 y lo pasa al manejador de errores
app.use(function(req, res, next) {
  next(createError(404));
});

// Manejador de errores
app.use(function(err, req, res, next) {
  // Configura locales, proporcionando error solo en desarrollo
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderiza la página de error
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
