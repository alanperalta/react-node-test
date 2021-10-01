const router = require("express").Router();
const dbConfig = require('../config.json');
const { env } = require('process');
const fs = require('fs');
const jwtGen = require('jsonwebtoken');
require('dotenv').config();

const requireRole = role => 
(req, res, next) => {
  const datos = jwtGen.verify(req.headers.authorization.replace(/^Bearer\s/, ''), env.SECRET);
  if (datos.role && datos.role === role) {
    next();
  } else {
    res.status(403).send('Usuario no autorizado a acceder al servicio');
  }
};

//Lista de escuelas
router.get('/', requireRole('admin'), (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(dbConfig);
  } catch (error) {
    console.log(error);
  }
});

//Agregar escuela
router.post('/', requireRole('admin'), (req, res) => {
  try {
    const codigo = req.body.data.code;
    delete req.body.data.code;
    dbConfig[codigo] = req.body.data;
    fs.writeFile('./config.json', JSON.stringify(dbConfig), error => {
      res.status(500).send('Error al agregar escuela');
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});

//Update Escuela
router.put('/:id', requireRole('admin'), (req, res) => {
  try {
    dbConfig[req.params.id] = req.body.data;
    fs.writeFile('./config.json', JSON.stringify(dbConfig), error => {
      res.status(500).send('Error al modificar escuela');
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});

//Borrar escuela
router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    delete dbConfig[req.params.id];
    fs.writeFile('./config.json', JSON.stringify(dbConfig), error => {
      res.status(500).send('Error al borrar escuela');
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;