import React from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js';
import '../node_modules/react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import '../node_modules/react-notifications/lib/notifications.css';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Login from './components/login/Login';
import CuentaCorriente from './components/cuentaCorriente/CuentaCorriente';
import { NotificationContainer } from 'react-notifications';
import Footer from './components/footer/Footer';
import NavBar from './components/navBar/NavBar';
import Comunicaciones from './components/comunicaciones/Comunicaciones';
import Admin from './components/admin/Admin';
function App() {
  return (
    <Router>
      <div className='App'>
        <header>
          <NavBar />
        </header>
        <div id='wrap'>
          <Switch>
            <Route exact path='/cuenta' component={CuentaCorriente} />
            <Route exact path='/comunicaciones' component={Comunicaciones} />
            <Route exact path='/login' component={Login} />
            <Route exact path='/admin' component={Admin} />
            <Route exact path='/' component={Login} />
            <Redirect to='/' />
          </Switch>
        </div>
        <Footer />
        <NotificationContainer />
      </div>
    </Router>
  );
}

export default App;
