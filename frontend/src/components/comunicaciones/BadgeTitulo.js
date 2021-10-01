import React from 'react';
const BadgeTitulo = props => {
  let tipo = '';
  switch (props.tipo) {
    case 'V':
      tipo = 'Comprobante';
      break;
    case 'T':
      tipo = 'Talón de pago';
      break;
    case 'N':
      tipo = 'Comunicado';
      break;
    case 'D':
      tipo = 'Informe de deuda';
      break;
    case 'I':
      tipo = 'Informe de alummno';
      break;
    default:
      tipo = 'Otros';
      break;
  }
  return <span className={`badge bg-${props.tipo}`}>{tipo}</span>;
};

export default BadgeTitulo;
