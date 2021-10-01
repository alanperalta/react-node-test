import NumberFormat from 'react-number-format';
import React from 'react';
const NumeroFormateado = props => {
  return (
    <NumberFormat
      {...props}
      thousandSeparator='.'
      decimalSeparator=','
      decimalScale='2'
      displayType='text'
      fixedDecimalScale
    />
  );
};

export default NumeroFormateado;
