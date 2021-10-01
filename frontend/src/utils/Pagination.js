import React, { Component } from 'react';
class Pagination extends Component {
  handlePage = pagina => {
    const { activa, total } = this.props;
    if (activa !== pagina && pagina <= total && pagina > 0) {
      this.props.funcion(pagina);
    }
  };
  render() {
    let paginas = [];
    for (let index = 1; index <= this.props.total; index++) {
      paginas.push(
        <li className={`page-item ${this.props.activa === index ? 'active' : ''}`} key={index}>
          <div role='button' className='page-link' style={{ cursor: 'pointer' }} onClick={() => this.handlePage(index)}>
            {index}
          </div>
        </li>
      );
    }
    return (
      <div className='card m-t-5'>
        <div className='body'>
          <ul className='pagination pagination-primary m-b-0'>
            <li className='page-item'>
              <div
                role='button'
                className='page-link'
                style={{ cursor: 'pointer' }}
                onClick={() => this.handlePage(this.props.activa - 1)}
              >
                Anterior
              </div>
            </li>
            {paginas}
            <li className='page-item'>
              <div
                role='button'
                className='page-link'
                style={{ cursor: 'pointer' }}
                onClick={() => this.handlePage(this.props.activa + 1)}
              >
                Siguiente
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Pagination;
