import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import Logout from '../logout/Logout';
import './MainMenu.css';
import { getTotalComunicaciones, getRoleToken } from '../../API/API';
class MainMenu extends Component {
  state = {
    notificaciones: 0,
    role: 'user'
  };

  logout = () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    this.props.history.push('/');
  };

  componentDidMount = async () => {
    try {
      //Con true trae total no leidos
      const pendientes = await getTotalComunicaciones(true);
      const role = await getRoleToken();
      if (pendientes) {
        this.setState({ notificaciones: pendientes });
      }
      this.setState({ role });
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    const { pathname } = this.props.location;
    if (pathname === '/' || pathname === '/login') {
      return null;
    }
    return (
      <div className='collapse navbar-collapse nav' id='mainMenu'>
        {this.state.role !== 'admin' ? (
          <ul className='navbar-nav mr-auto'>
            <li className={`nav-item ${pathname === '/cuenta' ? 'active' : ''}`}>
              <Link className='nav-link' to='/cuenta'>
                <i className='fa fa-file-invoice-dollar'></i>Facturación
              </Link>
            </li>
            <li className={`nav-item ${pathname === '/comunicaciones' ? 'active' : ''}`}>
              <Link className='nav-link' to='/comunicaciones'>
                <i className='fa fa-bell'>
                  {this.state.notificaciones ? (
                    <span className='badge badge-danger'>{this.state.notificaciones}</span>
                  ) : null}
                </i>
                Comunicaciones
              </Link>
            </li>
          </ul>
        ) : (
          <ul className='navbar-nav mr-auto'>
            <li className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}>
              <Link className='nav-link' to='/admin'>
                <i className='fa fa-cog'></i>
                Configuración
              </Link>
            </li>
          </ul>
        )}
        <ul className='navbar-nav ml-auto'>
          <li className='nav-item'>
            <Logout />
          </li>
        </ul>
      </div>
    );
  }
}
export default withRouter(MainMenu);
