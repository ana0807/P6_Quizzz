var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var partials = require('express-partials');
var flash = require('express-flash');
var methodOverride = require('method-override');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// In production (Heroku) I redirect the HTTP requests to https.
// Documentation: http://jaketrent.com/post/https-redirect-node-heroku/
/*if (app.get('env') === 'production') {
    app.use(function(req, res, next) {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            res.redirect('https://' + req.get('Host') + req.url);
        } else {
            next()
        }
    });
}*/


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Configuracion de la session para almacenarla en BBDD usando Sequelize.
var sequelize = require("./models");
var sessionStore = new SequelizeStore({
    db: sequelize,
    table: "session",
    checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds. (15 minutes)
    expiration: 4 * 60 * 60 * 1000  // The maximum age (in milliseconds) of a valid session. (4 hours)
});
app.use(session({
    secret: "Quiz 2018",
    store: sessionStore,
    resave: false,
    saveUninitialized: true
}));

app.use(methodOverride('_method', {methods: ["POST", "GET"]}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());
app.use(flash());

// Dynamic Helper:
app.use(function(req, res, next) {

    // To use req.session in the views
    res.locals.session = req.session;

    // To use req.url in the views
    res.locals.url = req.url;
    
    next();
});

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
