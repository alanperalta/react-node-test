import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Spinner from '../../utils/spinner/Spinner';
import './Comunicaciones.css';
import { getComunicaciones, setLeido, borrarComunicacion, getTotalComunicaciones } from '../../API/API';
import BadgeTitulo from './BadgeTitulo';
import Pagination from '../../utils/Pagination';
import { NotificationManager } from 'react-notifications';
import Mensaje from './Mensaje/Mensaje';
class Comunicaciones extends Component {
  state = {
    redirect: false,
    loading: false,
    pagina: 1,
    pagTotal: 1,
    comunicaciones: [],
    comActiva: null
  };

  componentDidMount = async () => {
    //False: trae el total, TRUE: total pendiente de leer
    const totalCom = await getTotalComunicaciones(false);
    if (totalCom) {
      const auxTotal = Math.ceil(totalCom / 5);
      this.setState({ pagTotal: auxTotal });
    }
    this.getComunicaciones(1);
  };

  setLeido = async (id, value, e) => {
    //Evito que si toco el sobrecito, se ejecute el onclick del li padre
    if (!value) {
      e.stopPropagation();
    } else {
      const comActiva = this.state.comunicaciones.find(com => com.ID === id);
      this.setState({ comActiva });
    }
    const result = await setLeido(id, value);
    if (result) {
      const auxCom = [...this.state.comunicaciones].map(comunicacion => {
        if (comunicacion.ID === id) {
          comunicacion.LEIDO_INT_CLI = value;
        }
        return comunicacion;
      });

      this.setState({ comunicaciones: auxCom });
    }
  };

  getComunicaciones = async pagina => {
    try {
      this.setState({ loading: true });
      const data = await getComunicaciones(pagina);
      if (data) {
        this.setState({ comunicaciones: data });
      } else {
        this.setState({ loading: false, redirect: true });
      }
      this.setState({ pagina, loading: false, comActiva: null });
    } catch (e) {
      this.setState({ loading: false, redirect: true });
      console.log(e);
    }
  };

  borrarComunicacion = async (id, e) => {
    //Evito que si toco el sobrecito, se ejecute el onclick del li padre
    e.stopPropagation();
    if (window.confirm('¿Desea borrar esta comunicación?')) {
      const result = await borrarComunicacion(id);
      if (result) {
        NotificationManager.success('Borrado correctamente!');
        await getComunicaciones(this.state.pagina);
      } else {
        NotificationManager.error('Hubo un error al borrar la comunicación');
      }
    }
  };

  onCloseMsj = () => {
    this.setState({ comActiva: null });
  };

  render() {
    if (this.state.redirect) return <Redirect to={'/'} />;
    //V|Comp. ventas|T|Talón pago|N|Comunicado|D|Informe deuda|I|Informe alumno
    return (
      <div className='container'>
        {this.state.loading ? (
          <Spinner style={{ marginTop: '30px' }} />
        ) : this.state.comunicaciones.length ? (
          <section className='container-inbox inbox'>
            <Mensaje data={this.state.comActiva} onClose={this.onCloseMsj} />
            <div className='container-fluid'>
              <div className='row clearfix'>
                <div className='col-md-12 col-lg-12 col-xl-12'>
                  <ul className='mail_list list-group list-unstyled'>
                    {this.state.comunicaciones.map(comunicacion => (
                      <li
                        className={`list-group-item ${comunicacion.LEIDO_INT_CLI ? '' : 'unread'}`}
                        key={comunicacion.ID}
                        onClick={e => this.setLeido(comunicacion.ID, true, e)}
                      >
                        <div className='media'>
                          <div className='pull-left'>
                            <div className='controls'>
                              <div className='delete'>
                                <i
                                  onClick={e => this.borrarComunicacion(comunicacion.ID, e)}
                                  className='fa fa-times'
                                ></i>
                              </div>
                              <span
                                onClick={e => this.setLeido(comunicacion.ID, false, e)}
                                className='envelope hidden-sm-down'
                                data-toggle='active'
                              >
                                {comunicacion.LEIDO_INT_CLI ? (
                                  <i className='far fa-envelope-open'></i>
                                ) : (
                                  <i className='fas fa-envelope'></i>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className='media-body'>
                            <div className='media-heading'>
                              <span className='m-r-10 titulo'>{comunicacion.TITULO}</span>
                              <BadgeTitulo tipo={comunicacion.TIPO} />
                              <small className='float-right text-muted'>
                                <time className='hidden-sm-down' dateTime='2017'>
                                  {comunicacion.FECHA_FORMAT}
                                </time>
                                {comunicacion.FK_SC_COM_VEN || comunicacion.FK_SC_TALON_PAGO ? (
                                  <i className='fa fa-paperclip'></i>
                                ) : null}
                              </small>
                            </div>
                            <p className='msg'>{comunicacion.COMUNICADO}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <Pagination activa={this.state.pagina} total={this.state.pagTotal} funcion={this.getComunicaciones} />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <h3 style={{ marginTop: '30px' }}>No hay comunicaciones para visualizar</h3>
        )}
      </div>
    );
  }
}
export default Comunicaciones;
