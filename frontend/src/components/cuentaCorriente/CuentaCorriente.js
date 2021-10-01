import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getDataByToken, getComprobante, getImputacionesByToken } from '../../API/API';
import BootstrapTable from 'react-bootstrap-table-next';
import downloadIcon from '../../assets/download.png';
import downloadIconMini from '../../assets/download-mini.png';
import './CuentaCorriente.css';
import { NotificationManager } from 'react-notifications';
import NumeroFormateado from '../../utils/NumeroFormateado';
import Spinner from '../../utils/spinner/Spinner';

const columns = [
  {
    dataField: 'ID',
    text: 'Comprobante'
  },
  {
    dataField: 'PER_ARA',
    text: 'Período'
  },
  {
    dataField: 'TOTAL',
    text: 'Importe'
  },
  {
    dataField: 'SALDO',
    text: 'Saldo'
  },
  { dataField: 'DESCARGA', text: '' }
];

export default class CuentaCorriente extends Component {
  state = {
    redirect: false,
    loading: false,
    comprobantes: [],
    detalleImp: []
  };
  componentDidMount = async () => {
    await this.getData();
  };

  getData = async () => {
    try {
      //Si total es mayor a 0 es debito
      const filtro = "TOTAL > 0 AND TIPO_CBTE in ('V', 'I', 'A', 'P', 'T')";
      this.setState({ loading: true });
      const data = await getDataByToken({ filtro });
      if (data === false) {
        this.setState({ redirect: true, loading: false });
      } else {
        let auxData = [];
        let alumno = 0;
        let curso = null;
        for (const e of data) {
          if (alumno !== e.FK_SC_ALUMNOS) {
            //Agrego una nueva agrupación de alumno
            auxData = {
              ...auxData,
              [e.FK_SC_ALUMNOS]: {
                comprobantes: { [e.FK_SC_CURSOS_ANUALES]: { debitos: [], descripcion: e.DES_CURSO_ANUAL } },
                saldo: 0,
                curso: 0,
                nombre: e.NOMBRE
              }
            };
            alumno = e.FK_SC_ALUMNOS;
            curso = e.FK_SC_CURSOS_ANUALES;
          } else if (curso !== e.FK_SC_CURSOS_ANUALES) {
            //Agrego un nuevo curso al array del alumno
            auxData[e.FK_SC_ALUMNOS].comprobantes = {
              ...auxData[e.FK_SC_ALUMNOS].comprobantes,
              [e.FK_SC_CURSOS_ANUALES]: { debitos: [], descripcion: e.DES_CURSO_ANUAL }
            };
            curso = e.FK_SC_CURSOS_ANUALES;
          }
          auxData[alumno].comprobantes[curso].debitos.push({
            ID: e.ID,
            PER_ARA: e.PER_ARA ? e.PER_ARA : e.PERIODO,
            TOTAL: <NumeroFormateado value={e.TOTAL} prefix='$' />,
            SALDO: <NumeroFormateado value={e.SALDO > 0 ? e.SALDO : 0} prefix='$' />,
            DESCARGA: (
              <img
                style={{ cursor: 'pointer' }}
                onClick={evt => this.descargar(evt, e.ID, e.FK_SC_ALUMNOS)}
                alt='Ver comprobante'
                src={downloadIcon}
              />
            )
          });
          //Acumulo deuda por alumno
          auxData[alumno].saldo += e.SALDO;
          if (e.FK_SC_CURSOS_ANUALES > auxData[alumno].curso) {
            auxData[alumno].curso = e.FK_SC_CURSOS_ANUALES;
            auxData[alumno].desCurso = e.DES_CURSO_ANUAL;
          }
        }
        const imputaciones = await getImputacionesByToken();
        this.setState({
          loading: false,
          comprobantes: auxData,
          imputaciones
        });
      }
    } catch (e) {
      this.setState({ redirect: true, loading: false });
      console.log(e);
    }
  };

  descargar = async (e, comprobante, alumno) => {
    try {
      e.stopPropagation();
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
    if (this.state.redirect) return <Redirect to={'/'} />;
    let alumnoIndex = 0;
    return (
      <div className='container content'>
        <h1 className='ribbon'>Cuenta Corriente</h1>
        {this.state.loading ? (
          <Spinner />
        ) : (
          <div className='accordionCC' id='accordionCC'>
            {Object.keys(this.state.comprobantes).map((alumno, index) => {
              alumnoIndex++;
              return (
                <div className='panel panel-default' key={index}>
                  <div className='panel-heading' role='tab' id={`heading-${index}`}>
                    <h4 className='panel-title'>
                      <a
                        role='button'
                        data-toggle='collapse'
                        data-parent='#accordionCC'
                        href={`#collapse-${index}`}
                        aria-expanded='true'
                        aria-controls={`#collapse-${index}`}
                        className='collapsed'
                      >
                        {this.state.comprobantes[alumno].nombre}
                      </a>
                    </h4>
                  </div>
                  <div
                    id={`collapse-${index}`}
                    className='panel-collapse collapse in'
                    role='tabpanel'
                    aria-labelledby={`#heading-${index}`}
                  >
                    <div className='panel-body'>
                      <div className='accordion-inner' id={`accordionCC-${index}`}>
                        <div className='row row-detalle'>
                          <div className='col'>
                            {this.state.comprobantes[alumno].saldo > 0 ? (
                              <p className='conDeuda'>
                                Deuda total:{' '}
                                <NumeroFormateado value={this.state.comprobantes[alumno].saldo} prefix='$' />
                              </p>
                            ) : (
                              <p className='sinDeuda'>No registra deuda</p>
                            )}
                          </div>
                          <div className='col'>Curso actual: {this.state.comprobantes[alumno].desCurso}</div>
                        </div>
                        {Object.keys(this.state.comprobantes[alumno].comprobantes).map((curso, index) => {
                          const detalles = {
                            renderer: row => {
                              return (
                                <div>
                                  {this.state.imputaciones[row.ID] ? (
                                    this.state.imputaciones[row.ID].map(imputacion => (
                                      <div key={imputacion.ID}>
                                        Comprobante: {imputacion.ID} - Importe:{' '}
                                        {<NumeroFormateado value={imputacion.IMPORTE} prefix='$' />}
                                        <img
                                          style={{ cursor: 'pointer', marginLeft: '10px' }}
                                          onClick={e => this.descargar(e, imputacion.ID, alumno)}
                                          alt='Descargar'
                                          src={downloadIconMini}
                                        />
                                      </div>
                                    ))
                                  ) : (
                                    <div>No existen pagos/notas de crédito para este comprobante</div>
                                  )}
                                </div>
                              );
                            },
                            onlyOneExpanding: true
                          };
                          return (
                            <div className='panel panel-default' key={index}>
                              <div className='panel-heading' role='tab' id={`#heading-${alumnoIndex}-${index}`}>
                                <h4 className='panel-title'>
                                  <a
                                    role='button'
                                    data-toggle='collapse'
                                    data-parent={`#accordionCC-${alumnoIndex -1}`}
                                    href={`#collapse-${alumnoIndex}-${index}`}
                                    aria-expanded='true'
                                    aria-controls={`#collapse-${alumnoIndex}-${index}`}
                                    className='collapsed'
                                  >
                                    Curso: {this.state.comprobantes[alumno].comprobantes[curso].descripcion}
                                  </a>
                                </h4>
                              </div>
                              <div
                                id={`collapse-${alumnoIndex}-${index}`}
                                className='panel-collapse collapse in'
                                role='tabpanel'
                                aria-labelledby={`#heading-${alumnoIndex}-${index}`}
                              >
                                <div className='panel-body'>
                                  <div className='flecha'>
                                    <i className='fa fa-arrow-left'></i>Desplace la tabla
                                    <i className='fa fa-arrow-right'></i>
                                  </div>
                                  <BootstrapTable
                                    striped
                                    keyField='ID'
                                    data={this.state.comprobantes[alumno].comprobantes[curso].debitos}
                                    columns={columns}
                                    expandRow={detalles}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
