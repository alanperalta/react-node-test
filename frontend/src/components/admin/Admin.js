import React, { Component } from 'react';
import { getEscuelas, updateEscuela, deleteEscuela, setEscuela } from '../../API/API';
import './Admin.css';
import Spinner from '../../utils/spinner/Spinner';
import { Redirect } from 'react-router-dom';
class Admin extends Component {
  state = {
    escuelas: [],
    nuevaEscuela: {
      code: '',
      port: 1433,
      user: 'test',
      database: '',
      password: 'test',
      server: 'localhost',
      logoTxt: '',
      logo: '',
      name: ''
    },
    showNuevaEscuela: false,
    reloading: false,
    redirect: false
  };
  componentDidMount = async () => {
    try {
      const data = await getEscuelas();
      if (data === false) {
        this.setState({ redirect: true });
      }
      for (const escuela in data) {
        if (data.hasOwnProperty(escuela)) {
          const element = data[escuela];
          element.logoTxt = '';
        }
      }
      this.setState({ escuelas: data });
    } catch (error) {
      this.setState({ redirect: true });
    }
  };

  handleValue = async e => {
    const tmpValues = e.target.name.split('-'); //CODESCUELA-NOMBRECAMPO
    const tmpEscuela = { ...this.state.escuelas };
    tmpEscuela[tmpValues[0]][tmpValues[1]] = e.target.value;
    if (tmpValues[1] === 'logoTxt') {
      tmpEscuela[tmpValues[0]].logo = await this.toBase64(e.target.files[0]);
    }
    //TODO:usar await/async hace que no se asigne bien el nombre del archivo
    tmpEscuela[tmpValues[0]].logoTxt = '';
    this.setState({ escuelas: tmpEscuela });
  };

  handleNewValues = async e => {
    const tmpEscuela = { ...this.state.nuevaEscuela };
    tmpEscuela[e.target.name] = e.target.value;
    if (e.target.name === 'logoTxt') {
      tmpEscuela.logo = await this.toBase64(e.target.files[0]);
    }
    tmpEscuela.logoTxt = '';
    this.setState({ nuevaEscuela: tmpEscuela });
  };

  guardar = async (evt, escuela) => {
    evt.preventDefault();
    this.setState({ reloading: true });
    window.scrollTo(0, 0);
    await updateEscuela(escuela, this.state.escuelas[escuela]);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  eliminar = async (evt, escuela) => {
    evt.preventDefault();
    this.setState({ reloading: true });
    window.scrollTo(0, 0);
    await deleteEscuela(escuela);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  nuevaEscuela = () => {
    this.setState({ showNuevaEscuela: true });
  };

  agregarEscuela = async evt => {
    evt.preventDefault();
    this.setState({ reloading: true });
    window.scrollTo(0, 0);
    await setEscuela(this.state.nuevaEscuela);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  cancelarNueva = e => {
    e.preventDefault();
    this.setState({
      showNuevaEscuela: false,
      nuevaEscuela: {
        code: '',
        port: 14335,
        server: 'localhost',
        user: '',
        database: '',
        password: '',
        logoTxt: '',
        logo: '',
        name: ''
      }
    });
  };

  toBase64 = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  render() {
    const { escuelas, showNuevaEscuela, nuevaEscuela } = this.state;
    if (this.state.redirect) return <Redirect to={'/'} />;
    return (
      <>
        {this.state.reloading ? (
          <Spinner style={{ marginTop: '30px' }} />
        ) : (
          <div>
            <div hidden={showNuevaEscuela}>
              <div id='accordion'>
                {Object.keys(escuelas).length
                  ? Object.keys(escuelas).map(esc => {
                      return (
                        <div className='card' key={esc}>
                          <div className='card-header'>
                            <a className='card-link' data-toggle='collapse' href={`#collapse-${esc}`}>
                              {esc}
                              <i className='fa fa-angle-down'></i>
                            </a>
                          </div>
                          <div id={`collapse-${esc}`} className='collapse' data-parent='#accordion'>
                            <div className='row justify-content-center'>
                              <div className='col-12 col-md-4'>
                                <div className='card-body card-form'>
                                  <form>
                                    <div className='form-group'>
                                      <label for='name'>Nombre:</label>
                                      <input
                                        onChange={this.handleValue}
                                        className='form-control'
                                        type='text'
                                        name={`${esc}-name`}
                                        value={escuelas[esc].name}
                                      />
                                    </div>
                                    <div className='form-group'>
                                      <label for={`${esc}-logoTxt`}>Logo:</label>
                                      <input
                                        onChange={this.handleValue}
                                        className='form-control'
                                        type='file'
                                        accept='.png, .jpg'
                                        name={`${esc}-logoTxt`}
                                        value={escuelas[esc].logoTxt}
                                      />
                                      <img className='logo' alt='' src={`${escuelas[esc].logo}`} />
                                    </div>
                                    <div className='form-group'>
                                      <label for={`${esc}-user`}>Usuario:</label>
                                      <input
                                        onChange={this.handleValue}
                                        className='form-control'
                                        type='text'
                                        name={`${esc}-user`}
                                        value={escuelas[esc].user}
                                      />
                                    </div>
                                    <div className='form-group'>
                                      <label for={`${esc}-password`}>Clave:</label>
                                      <input
                                        onChange={this.handleValue}
                                        className='form-control'
                                        type='text'
                                        name={`${esc}-password`}
                                        value={escuelas[esc].password}
                                      />
                                    </div>
                                    <div className='form-group'>
                                      <label for={`${esc}-server`}>Dir. servidor:</label>
                                      <input
                                        onChange={this.handleValue}
                                        className='form-control'
                                        type='text'
                                        name={`${esc}-server`}
                                        value={escuelas[esc].server}
                                      />
                                    </div>
                                    <div className='form-group'>
                                      <label for={`${esc}-port`}>Puerto:</label>
                                      <input
                                        onChange={this.handleValue}
                                        className='form-control'
                                        type='text'
                                        name={`${esc}-port`}
                                        value={escuelas[esc].port}
                                      />
                                    </div>
                                    <div className='form-group'>
                                      <label for={`${esc}-database`}>Base:</label>
                                      <input
                                        onChange={this.handleValue}
                                        className='form-control'
                                        type='text'
                                        name={`${esc}-database`}
                                        value={escuelas[esc].database}
                                      />
                                    </div>
                                    <div className='form-group'>
                                      <button onClick={e => this.guardar(e, esc)} className='btn btn-success'>
                                        Guardar
                                      </button>
                                      <button onClick={e => this.eliminar(e, esc)} className='btn btn-danger'>
                                        Eliminar
                                      </button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : null}
              </div>
              <button onClick={this.nuevaEscuela} className='btn btn-success'>
                Nueva Escuela
              </button>
            </div>
            <div className='row justify-content-center nueva'>
              <div className='col-12 col-md-4'>
                <form hidden={!showNuevaEscuela}>
                  <div className='form-group'>
                    <label for='user'>Código:</label>
                    <input
                      onChange={this.handleNewValues}
                      className='form-control'
                      type='text'
                      name='code'
                      value={nuevaEscuela.code}
                    />
                  </div>
                  <div className='form-group'>
                    <label for='name'>Nombre:</label>
                    <input
                      onChange={this.handleNewValues}
                      className='form-control'
                      type='text'
                      name='name'
                      value={nuevaEscuela.name}
                    />
                  </div>
                  <div className='form-group'>
                    <label for='logoTxt'>Logo:</label>
                    <input
                      onChange={this.handleNewValues}
                      className='form-control'
                      type='file'
                      name='logoTxt'
                      accept='.png, .jpg'
                      value={nuevaEscuela.logoTxt}
                    />
                    <img className='logo' alt='' src={nuevaEscuela.logo} />
                  </div>
                  <div className='form-group'>
                    <label for='user'>Usuario:</label>
                    <input
                      onChange={this.handleNewValues}
                      className='form-control'
                      type='text'
                      name='user'
                      value={nuevaEscuela.user}
                    />
                  </div>
                  <div className='form-group'>
                    <label for='password'>Clave:</label>
                    <input
                      onChange={this.handleNewValues}
                      className='form-control'
                      type='text'
                      name='password'
                      value={nuevaEscuela.password}
                    />
                  </div>
                  <div className='form-group'>
                    <label for='server'>Dir. servidor:</label>
                    <input
                      onChange={this.handleNewValues}
                      className='form-control'
                      type='text'
                      name='server'
                      value={nuevaEscuela.server}
                    />
                  </div>
                  <div className='form-group'>
                    <label for='port'>Puerto:</label>
                    <input
                      onChange={this.handleNewValues}
                      className='form-control'
                      type='text'
                      name='port'
                      value={nuevaEscuela.port}
                    />
                  </div>
                  <div className='form-group'>
                    <label for='database'>Base:</label>
                    <input
                      onChange={this.handleNewValues}
                      className='form-control'
                      type='text'
                      name='database'
                      value={nuevaEscuela.database}
                    />
                  </div>
                  <div className='form-group'>
                    <button onClick={this.agregarEscuela} className='btn btn-success'>
                      Agregar
                    </button>
                    <button onClick={this.cancelarNueva} className='btn btn-danger'>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default Admin;
