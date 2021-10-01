//Initiallising node modules
const express = require('express');
const jwt = require('express-jwt');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const { env } = require('process');
require('dotenv').config();
const http = require('http');
const escuelasRoutes = require('./routes/escuelas');
const adminRoutes = require('./routes/admin');

var app = express();

// Body Parser Middleware
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

//CORS Middleware
app.use(cors());

//API Security
app.use(helmet());

//API Loggin HTTP
app.use(morgan('combined'));

app.use(express.static('tienda/static'));

//Config JWT
const checkJwt = jwt({
  secret: env.SECRET
}).unless({ path: ['/api/escuelas/login', '/api/tiendanube', '/favicon.ico'] });

app.use(checkJwt);
app.use("/api/escuelas/", escuelasRoutes);
app.use("/api/admin/", adminRoutes);

//Setting up server
var server = http.createServer(app).listen(env.PORT || 9000, function () {
  var port = server.address().port;
  console.log('WS corriendo en el puerto:', port);
});

module.exports = app;