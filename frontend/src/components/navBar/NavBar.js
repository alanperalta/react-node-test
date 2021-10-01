import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import MainMenu from '../mainMenu/MainMenu';
import LogoTGroup from '../../assets/logo-escuelas.png';
import { getLogoEscuela } from '../../API/API';
class NavBar extends Component {
  state = {
    nombre: '',
    logo: ''
  };
  componentDidMount = async () => {
    const escuela = await getLogoEscuela(this.getEscuela());
    this.setState({ nombre: escuela.name, logo: escuela.logo });
  };

  getEscuela = () => {
    if (window.localStorage.getItem('escuela')) {
      return window.localStorage.getItem('escuela');
    } else if (window.sessionStorage.getItem('escuela')) {
      return window.sessionStorage.getItem('escuela');
    } else return false;
  };
  render() {
    const { pathname } = this.props.location;
    return (
      <nav className='navbar navbar-icon-top navbar-expand-lg navbar-dark bg-dark'>
        <div className='container'>
          <Link className='navbar-brand' to='/login'>
            {pathname === '/' || pathname === '/login' || this.getEscuela() === 'ADMIN' ? (
              <img style={{ width: '100px' }} src={LogoTGroup} alt='TGroup Escuelas' />
            ) : this.getEscuela() ? (
              <img style={{ width: '50px' }} src={`${this.state.logo}`} alt={`${this.state.nombre}`} />
            ) : (
              <></>
            )}
          </Link>
          {/* Botón OffCanvas */}
          {pathname !== '/' && pathname !== '/login' ? (
            <>
              <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#mainMenu'>
                <span className='navbar-toggler-icon'></span>
              </button>
              <MainMenu />
            </>
          ) : null}
        </div>
      </nav>
    );
  }
}
export default withRouter(NavBar);
