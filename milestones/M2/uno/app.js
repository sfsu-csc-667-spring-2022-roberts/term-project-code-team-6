const createError = require('http-errors');
const express = require('express');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const path = require('path');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const logger = require('morgan');

// Only use env variables in production
if (process.env.NODE_ENV === 'development') {
	require('dotenv').config();
}

const pgPromise = require('./db');

// Routes
const indexRouter = require('./routes/index');
const testsRouter = require('./routes/tests');
const authRouter = require('./routes/auth');
const gameRouter = require('./routes/game');

const app = express();

app.socket = require('./sockets');

// Session Store
app.use(
	expressSession({
		store: new pgSession({
			pgPromise: pgPromise,
		}),
		secret: 'thisisasigniture',
		resave: false,
		cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // One Week
		name: 'UNO Session',
		saveUninitialized: false,
	})
);

// Get session from parsing user request
app.use((req, res, next) => {
	if (req.session.email) {
		res.locals.isAuth = true;
	}
	// console.log(req.session);
	next();
});

// View engine setup
hbs.registerPartials(path.join(__dirname, 'views/partials'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tests', testsRouter);
app.use('/auth', authRouter);
app.use('/game', gameRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	// req.app.get('env') return development by default
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.statusCode || 500);
	res.render('error');
});

module.exports = app;
