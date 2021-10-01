const router = require("express").Router();
const dbConfig = require('../config.json');
const sql = require('mssql');
const { env } = require('process');
const jwtGen = require('jsonwebtoken');
require('dotenv').config();

//Ejecutar query
const executeQuery = async (escuela, res, query) => {
  let rows = [];
  let errorMsg = '';
  let error = true;
  try {
    const pool = await new sql.ConnectionPool('Server=localhost,1433;Database=ESC_PRUEBA01;User Id=test;Password=test;Encrypt=true').connect();
    const result = await pool.request().query(query);
    rows = result.recordset;
    error = false;
    sql.close();
  } catch (err) {
    errorMsg += err + '\n';
    sql.close();
  }

  if (error) {
    res.status(500).send({ Error: `${errorMsg}` });
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(rows);
  }
};

//LOGIN
router.post('/login', async (req, res) => {
  let errorMsg = '';
  let token = null;
  const { dniPadre, dniAlumno, escuela } = req.body;
  try {
    let result = {
      recordset: []
    };
    if (dniPadre !== 'admin') {
      const pool = await new sql.ConnectionPool(dbConfig[escuela]).connect();
      const query = `select * from SC_FOR_ALUMNOS where NUM_DOC_PAD = '${dniPadre}' and NUM_DOC = '${dniAlumno}'`;
      result = await pool.request().query(query);
      sql.close();
    } else if (dniAlumno === 'admin' && escuela === 'ADMIN') {
      const payload = {
        dniPadre,
        escuela,
        alumnos: [],
        role: 'admin'
      };
      token = jwtGen.sign(payload, env.SECRET, {
        expiresIn: '365d'
      });
    }

    if (result.recordset.length) {
      const payload = {
        dniPadre,
        nombrePadre: result.recordset[0].FAMILIA,
        escuela,
        alumnos: result.recordset.map(e => e.ID),
        role: 'user'
      };
      token = jwtGen.sign(payload, env.SECRET, {
        expiresIn: '365d'
      });
    } else {
      errorMsg = 'Usuario o contraseña incorrectos';
    }
  } catch (err) {
    errorMsg += err + '\n';
    console.log(err);
    sql.close();
  }

  if (token) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(token);
  } else {
    res.status(500).send({ Error: `${errorMsg}` });
  }
});

//Cuenta corriente
router.get('/cuenta', (req, res) => {
  try {
    const datos = jwtGen.verify(req.headers.authorization.replace(/^Bearer\s/, ''), env.SECRET);
    const filtro = req.query.filtro ? `AND ${req.query.filtro}` : '';
    const alumnos = datos.alumnos.map(alumno => `'${alumno}'`).join(',');
    const query = `select * from SC_CTA_CTA where FK_SC_ALUMNOS in (${alumnos}) ${filtro} ORDER BY NOMBRE ASC, FK_SC_CURSOS_ANUALES DESC`;
    executeQuery(datos.escuela, res, query);
  } catch (error) {
    console.log(error);
  }
});

//Imputaciones masivas
router.get('/imputaciones', (req, res) => {
  try {
    const datos = jwtGen.verify(req.headers.authorization.replace(/^Bearer\s/, ''), env.SECRET);
    const alumnos = datos.alumnos.map(alumno => `'${alumno}'`).join(',');
    const query = `select * from SC_IMP_VEN where FK_SC_ALUMNOS in (${alumnos}) order by FK_SC_COM_VEN_D, FK_SC_COM_VEN`;
    executeQuery(datos.escuela, res, query);
  } catch (error) {
    console.log(error);
  }
});

//Descarga de comprobantes
router.get('/comprobante', (req, res) => {
  try {
    const datos = jwtGen.verify(req.headers.authorization.replace(/^Bearer\s/, ''), env.SECRET);
    if (datos.alumnos.includes(req.query.alumno)) {
      const file = `${__dirname}/../comprobantes/${datos.escuela}/${req.query.alumno}/${req.query.id}.pdf`;
      console.log(file)
      res.download(file);
    } else {
      res.status(500);
    }
  } catch (error) {
    console.log(error);
  }
});

//Comunicaciones
router.get('/comunicaciones', (req, res) => {
  try {
    const datos = jwtGen.verify(req.headers.authorization.replace(/^Bearer\s/, ''), env.SECRET);
    const alumnos = datos.alumnos.map(alumno => `'${alumno}'`).join(',');
    const query = `select *, FORMAT (FECHA, 'dd-MM-yy') as FECHA_FORMAT from SC_NOTIF_WEB 
                  where FK_SC_ALUMNOS in (${alumnos}) order by ID desc, NOMBRE 
                  OFFSET ${req.query.pagina * 5 - 5} ROWS FETCH NEXT 5 ROWS ONLY`;
    executeQuery(datos.escuela, res, query);
  } catch (error) {
    console.log(error);
  }
});

//Cant. Comunicaciones
router.get('/totalComunicaciones', (req, res) => {
  try {
    const datos = jwtGen.verify(req.headers.authorization.replace(/^Bearer\s/, ''), env.SECRET);
    const alumnos = datos.alumnos.map(alumno => `'${alumno}'`).join(',');
    const filtroPendiente = `${req.query.soloPendientes ? 'AND isnull(LEIDO_INT_CLI,0) = 0' : ''}`;
    const query = `select count(*) as TOTAL from SC_NOTIF_WEB where FK_SC_ALUMNOS in (${alumnos}) ${filtroPendiente}`;
    executeQuery(datos.escuela, res, query);
  } catch (error) {
    console.log(error);
  }
});

//Update comunicación leída/no leída
router.put('/leido/:id', (req, res) => {
  try {
    const datos = jwtGen.verify(req.headers.authorization.replace(/^Bearer\s/, ''), env.SECRET);
    const alumnos = datos.alumnos.map(alumno => `'${alumno}'`).join(',');
    const query = `update SC_NOTIF_WEB set LEIDO_INT_CLI = ${req.body.value}, LEIDO = 1 where ID = ${req.params.id} AND FK_SC_ALUMNOS in (${alumnos})`;
    executeQuery(datos.escuela, res, query);
    console.log(query);
  } catch (error) {
    console.log(error);
  }
});

//Borrar comunicación
router.delete('/comunicaciones/:id', (req, res) => {
  try {
    const datos = jwtGen.verify(req.headers.authorization.replace(/^Bearer\s/, ''), env.SECRET);
    const alumnos = datos.alumnos.map(alumno => `'${alumno}'`).join(',');
    const query = `delete from SC_NOTIF_WEB where ID = ${req.params.id} AND FK_SC_ALUMNOS in (${alumnos})`;
    executeQuery(datos.escuela, res, query);
  } catch (error) {
    console.log(error);
  }
});

//Logo escuela
router.get('/logo-escuela/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let dataLogo = '';
  if (dbConfig[req.params.id]) {
    dataLogo = { logo: dbConfig[req.params.id].logo, name: dbConfig[req.params.id].name };
  }
  res.status(200).json(dataLogo);
});

//Get Role
router.get('/role', (req, res) => {
  try {
    const datos = jwtGen.verify(req.headers.authorization.replace(/^Bearer\s/, ''), env.SECRET);
    res.status(200).json(datos.role);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
