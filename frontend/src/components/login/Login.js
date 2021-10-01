import React, { Component } from 'react';
import { login, getRoleToken } from '../../API/API';
import { withRouter } from 'react-router-dom';
import { NotificationManager } from 'react-notifications';
export default withRouter(
  class Login extends Component {
    state = {
      dniPadre: '',
      dniAlumno: '',
      escuela: '',
      recordar: false
    };

    login = async e => {
      e.preventDefault();
      const { dniAlumno, dniPadre, escuela } = this.state;
      if (dniAlumno && dniPadre && escuela) {
        try {
          const data = { ...this.state };
          await login(data);
          await this.validarToken();
        } catch (error) {
          NotificationManager.error(error.message);
        }
      } else {
        NotificationManager.warning('Debe completar todos los campos');
      }
    };

    handleLogin = campo => e => {
      this.setState({ [campo]: campo === 'escuela' ? e.target.value.toUpperCase() : e.target.value });
    };

    handleRecordar = e => {
      this.setState({ recordar: e.target.checked });
    };

    componentDidMount = async () => {
      await this.validarToken();
    };

    validarToken = async () => {
      try {
        const data = await getRoleToken();
        if (data === 'admin') {
          window.location.replace('/admin');
        } else if (data) {
          window.location.replace('/cuenta');
        }
      } catch (e) {
        console.log(e);
      }
    };

    render() {
      return (
        <div className='auth-wrapper'>
          <div className='auth-inner'>
            <form>
              <h3>Ingreso al sistema</h3>
              <div>
                <p>demo admin: admin - admin - admin</p>
                <p>demo user: 25539909 - 48303724 - prueba</p>
              </div>

              <div className='form-group'>
                <label>DNI</label>
                <input
                  type='text'
                  className='form-control'
                  placeholder='DNI Padre/Madre/Tutor'
                  value={this.state.dniPadre}
                  onChange={this.handleLogin('dniPadre')}
                />
              </div>

              <div className='form-group'>
                <label>Clave</label>
                <input
                  type='password'
                  className='form-control'
                  placeholder='Clave'
                  value={this.state.dniAlumno}
                  onChange={this.handleLogin('dniAlumno')}
                />
              </div>

              <div className='form-group'>
                <label>Escuela</label>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Cód. Escuela'
                  value={this.state.escuela}
                  onChange={this.handleLogin('escuela')}
                />
              </div>

              <div className='form-group'>
                <div className='custom-control custom-checkbox'>
                  <input
                    type='checkbox'
                    className='custom-control-input'
                    id='chkRecordar'
                    onChange={this.handleRecordar}
                    checked={this.state.recordar}
                  />
                  <label className='custom-control-label' htmlFor='chkRecordar'>
                    Recordar datos
                  </label>
                </div>
              </div>

              <button className='btn btn-primary btn-block' onClick={this.login}>
                Ingresar
              </button>
            </form>
          </div>
        </div>
      );
    }
  }
);
