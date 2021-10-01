import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import closeSession from '../../assets/close-session.png';
class Logout extends Component {
  logout = () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    this.props.history.push('/');
  };

  render() {
    return (
      <div role='button' className='nav-link btn-close-session' onClick={this.logout}>
        <img style={{ cursor: 'pointer' }} src={closeSession} alt='Cerrar sesión' />
      </div>
    );
  }
}
export default withRouter(Logout);
