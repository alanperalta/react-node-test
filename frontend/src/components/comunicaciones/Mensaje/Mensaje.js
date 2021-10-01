import React, { Component } from 'react';
import './Mensaje.css';
import { getComprobante } from '../../../API/API';
import { NotificationManager } from 'react-notifications';
import downloadIcon from '../../../assets/download-mini.png';
import htmlParser from 'react-html-parser';
class Mensaje extends Component {
  descargar = (comprobante, alumno) => async () => {
    try {
      const res = await getComprobante(comprobante, alumno);
      if (res) {
        const data = new Blob([res], { type: 'application/pdf' });
        const URL = window.URL.createObjectURL(data);
        const tempLink = document.createElement('a');
        tempLink.href = URL;
        tempLink.setAttribute('download', `${comprobante}.pdf`);
        tempLink.click();
      } else {
        NotificationManager.warning('Comprobante no encontrado, consulte a la administración');
      }
    } catch (error) {
      NotificationManager.error('Error al descargar comprobante');
      console.log(error);
    }
  };
  render() {
    const { data } = this.props;
    return (
      <>
        {data ? (
          <div className='col-md-12'>
            <div className='row inbox-wrapper'>
              <div className='col-lg-12'>
                <div className='card'>
                  <div className='card-body'>
                    <div className='row'>
                      <div className='col-lg-12 email-content'>
                        <div className='email-head'>
                          <div className='email-head-subject'>
                            <div className='title d-flex align-items-center justify-content-between'>
                              <div className='d-flex align-items-center'>
                                <span>{data.TITULO}</span>
                              </div>
                            </div>
                          </div>
                          <div className='email-head-sender d-flex align-items-center justify-content-between flex-wrap'>
                            <div className='d-flex align-items-center'>
                              <div className='sender d-flex align-items-center'>
                                Alumno:<span>{data.NOMBRE}</span>
                              </div>
                            </div>
                            <div className='date'>{data.FECHA_FORMAT}</div>
                          </div>
                        </div>
                        <div className='email-body'>{htmlParser(data.COMUNICADO)}</div>
                        {data.FK_SC_COM_VEN || data.FK_SC_TALON_PAGO ? (
                          <div className='email-attachments'>
                            <div className='title'>Comprobantes adjuntos</div>
                            <ul>
                              {data.FK_SC_COM_VEN ? (
                                <li>
                                  {data.FK_SC_COM_VEN}
                                  <img
                                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                                    onClick={this.descargar(data.FK_SC_COM_VEN, data.FK_SC_ALUMNOS)}
                                    alt='Ver comprobante'
                                    src={downloadIcon}
                                  />
                                </li>
                              ) : null}
                              {data.FK_SC_TALON_PAGO ? (
                                <li>
                                  {data.FK_SC_TALON_PAGO}
                                  <img
                                    style={{ cursor: 'pointer', marginLeft: '10px' }}
                                    onClick={this.descargar(data.FK_SC_TALON_PAGO, data.FK_SC_ALUMNOS)}
                                    alt='Ver comprobante'
                                    src={downloadIcon}
                                  />
                                </li>
                              ) : null}
                            </ul>
                          </div>
                        ) : null}
                        <button className='btn btn-danger' onClick={this.props.onClose}>
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }
}

export default Mensaje;
