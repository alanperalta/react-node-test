import { URL } from './config.js';
const axios = require('axios').default;

export const login = async data => {
  let msgError = '';
  const recordar = data.recordar;
  delete data.recordar;
  delete data.redirect;
  try {
    const response = await axios.post(`${URL}/escuelas/login`, data);
    window.sessionStorage.clear();
    window.localStorage.clear();
    if (recordar) {
      window.localStorage.setItem('token', response.data);
      window.localStorage.setItem('escuela', data.escuela);
    } else {
      window.sessionStorage.setItem('token', response.data);
      window.sessionStorage.setItem('escuela', data.escuela);
    }
    //const dataByToken = await getDataByToken();
    return true;
  } catch (error) {
    error.response ? (msgError = error.response.data.Error) : (msgError = error.message);
    if (msgError.includes('config.server')) {
      throw new Error('Código de escuela inexistente');
    } else {
      throw new Error(msgError);
    }
  }
};

export const getDataByToken = async (params = {}) => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    const response = await axios.get(`${URL}/escuelas/cuenta`, { headers, params });
    return response.data;
  } catch (error) {
    return false;
  }
};

export const getRoleToken = async () => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    const response = await axios.get(`${URL}/escuelas/role`, { headers });
    return response.data;
  } catch (error) {
    return false;
  }
};

export const getLogoEscuela = async id => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    const response = await axios.get(`${URL}/escuelas/logo-escuela/${id}`, { headers });
    return response.data;
  } catch (error) {
    return false;
  }
};

export const getImputacionesByToken = async () => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    const response = await axios.get(`${URL}/escuelas/imputaciones`, { headers });
    let auxImp = '';
    let imputaciones = {};
    for (const imputacion of response.data) {
      if (auxImp !== imputacion.FK_SC_COM_VEN_D) {
        auxImp = imputacion.FK_SC_COM_VEN_D;
        imputaciones[imputacion.FK_SC_COM_VEN_D] = [];
      }
      imputaciones[imputacion.FK_SC_COM_VEN_D].push({
        ID: imputacion.FK_SC_COM_VEN,
        IMPORTE: imputacion.SALDO
      });
    }
    return imputaciones;
  } catch (error) {
    return false;
  }
};

export const getComprobante = async (id, alumno) => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    const params = {
      id,
      alumno
    };
    const response = await axios.get(`${URL}/escuelas/comprobante`, { responseType: 'blob', headers, params });
    return response.data;
  } catch (error) {
    return false;
  }
};

export const getComunicaciones = async pagina => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };

    const params = {
      pagina
    };
    const response = await axios.get(`${URL}/escuelas/comunicaciones`, { headers, params });
    return response.data;
  } catch (error) {
    return false;
  }
};

export const getTotalComunicaciones = async soloPendientes => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    const params = {
      soloPendientes
    };
    const response = await axios.get(`${URL}/escuelas/totalComunicaciones`, { params, headers });
    return response.data[0].TOTAL;
  } catch (error) {
    return false;
  }
};

export const setLeido = async (id, value) => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    let auxValue = 0;
    if (value) {
      auxValue = 1;
    }
    const response = await axios.put(`${URL}/escuelas/leido/${id}`, { value: auxValue }, { headers });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const borrarComunicacion = async id => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    const response = await axios.delete(`${URL}/escuelas/comunicaciones/${id}`, { headers });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const getEscuelas = async () => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    const response = await axios.get(`${URL}/admin`, { headers });
    return response.data;
  } catch (error) {
    return false;
  }
};

export const setEscuela = async data => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    data.port = Number(data.port);
    delete data.logoTxt;
    const response = await axios.post(`${URL}/admin`, { data }, { headers });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const updateEscuela = async (id, data) => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    delete data.logoTxt;
    data.port = Number(data.port);
    const response = await axios.put(`${URL}/admin/${id}`, { data }, { headers });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export const deleteEscuela = async id => {
  try {
    const headers = {
      authorization: 'Bearer ' + getToken()
    };
    const response = await axios.delete(`${URL}/admin/${id}`, { headers });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const getToken = () => {
  if (window.localStorage.getItem('token')) {
    return window.localStorage.getItem('token');
  } else if (window.sessionStorage.getItem('token')) {
    return window.sessionStorage.getItem('token');
  } else return false;
};
