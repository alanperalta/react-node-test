const request = require("supertest");
const app = require("../server");
const expect = require('chai').expect;

/*Para endpoints protegidos*/
let token;
let adminToken;
const userTest = {
  dniPadre: '25539909',
  dniAlumno: '48303724',
  escuela: 'PRUEBA'
}

const adminUserTest = {
  dniPadre: 'admin',
  dniAlumno: 'admin',
  escuela: 'ADMIN'
}

const escuelaTest= {
    code: "PRUEBA2",
    port:1433,
    user:"test",
    database:"ESC_PRUEBA02",
    password:"test",
    server:"127.0.0.1",
    name:"Escuela PRUEBA2",
    logo:""
}

//Login user simple
before(done => {
  request(app)
    .post('/api/escuelas/login')
    .send(userTest)
    .end((err, response) => {
      token = response.body;
      done();
    });
});

//Login user admin
before(done => {
  request(app)
    .post('/api/escuelas/login')
    .send(adminUserTest)
    .end((err, response) => {
      adminToken = response.body;
      done();
    });
});

//User requests
describe('USER REQUESTS', () => {
  describe('POST /login', () => {  
    it('debería devolver un auth token', done => {
      request(app)
      .post('/api/escuelas/login')
      .send(userTest)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.be.a.string;
        done();
      })
    });

    it('debería loguear a un admin', done => {
      request(app)
      .post('/api/escuelas/login')
      .send(adminUserTest)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.be.a.string;
        done();
      })
    });

    it('debería devolver un error de credenciales inválidas', done => {
      const loginData = {...userTest, dniAlumno: '11111111'};
      request(app)
      .post('/api/escuelas/login')
      .send(loginData)
      .expect('Content-Type', /json/)
      .expect(500)
      .end((err, res) => {
        expect(res.body.Error).to.be.eq('Usuario o contraseña incorrectos');
        done();
      })
    });
  })

  describe('GET /cuenta', () => {
    it('debería responder con datos de la cta. de los alumnos correspondientes', done => {
      request(app)
      .get('/api/escuelas/cuenta')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200, done)
    });

    it('debería responder status 401', done => {
      request(app)
      .get('/api/escuelas/cuenta')
      .expect(401, done)
    });
  });

  describe('GET /imputaciones', () => {
    it('debería responder con datos de la cta. de los alumnos correspondientes', done => {
      request(app)
      .get('/api/escuelas/imputaciones')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200, done)
    });

    it('debería responder status 401', done => {
      request(app)
      .get('/api/escuelas/imputaciones')
      .expect(401, done)
    });
  });

  describe('GET /comunicaciones', () => {
    it('debería responder 500 por no informar paginación', done => {
      request(app)
      .get('/api/escuelas/comunicaciones')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(500, done)
    });

    it('debería responder con las primeras 5 comunicaciones del alumno', done => {
      request(app)
      .get('/api/escuelas/comunicaciones?pagina=1')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.be.an('Array');
        expect(res.body).to.have.length.below(6);
        done();
      })
    });

    it('debería responder con las siguientes 5 comunicaciones del alumno', done => {
      request(app)
      .get('/api/escuelas/comunicaciones?pagina=2')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.be.an('Array');
        expect(res.body).to.have.length.below(6);
        done();
      })
    });

    it('debería responder status 401', done => {
      request(app)
      .get('/api/escuelas/comunicaciones')
      .expect(401, done)
    });
  });

  describe('GET /totalComunicaciones', () => {
    it('debería responder con la cantidad total de comunicaciones del alumno', done => {
      request(app)
      .get('/api/escuelas/totalComunicaciones')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.be.an('Array');
        expect(res.body[0]).to.have.property('TOTAL');
        done();
      })
    });

    it('debería responder con la cantidad de comun. pendientes', done => {
      request(app)
      .get('/api/escuelas/totalComunicaciones?soloPendientes=1')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.be.an('Array');
        expect(res.body[0]).to.have.property('TOTAL');
        done();
      })
    });

    it('debería responder status 401', done => {
      request(app)
      .get('/api/escuelas/totalComunicaciones')
      .expect(401, done)
    });
  });

  describe('GET /role', () => {
    it('debería responder con el rol del usuario', done => {
      request(app)
      .get('/api/escuelas/role')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(['user', 'admin']).to.contains(res.body);
        done();
      })
    });

    it('debería responder status 401', done => {
      request(app)
      .get('/api/escuelas/role')
      .expect(401, done)
    });
  });
});

//ADMIN requests
describe('ADMIN REQUESTS', () => {
  describe('GET /', () => {
    it('debería responder la lista de escuelas', done => {
      request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res).to.be.an('Object');
        done()
      });
    });
  
    it('debería responder status 401', done => {
      request(app)
      .get('/api/admin')
      .expect(401, done)
    });

    it('debería responder status 403 - rol denegado', done => {
      request(app)
      .get('/api/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(403, done)
    });
  });
});