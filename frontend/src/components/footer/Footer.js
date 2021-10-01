import React from 'react';
import LogoEscuelas from '../../assets/logo-escuelas.png';
const Footer = () => {
  return (
    <footer className='py-4 bg-dark text-white'>
      <div className='container text-center'>
        <a href='http://escuelas.tgroup.com.ar' target='_blank' rel='noopener noreferrer'>
          <img className='footer-logo' src={LogoEscuelas} alt='TGroup Escuelas' />
          <br />
          <span style={{ color: 'white' }}>TGroup Sistemas S.A.S. &copy;2020</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
