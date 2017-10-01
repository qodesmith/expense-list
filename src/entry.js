import './styles/styles.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import Expenses from './components/expenses';

document.body.innerHTML = '<div id="our-expenses"></div>'

ReactDOM.render(
  <Expenses />,
  document.querySelector('#our-expenses')
);
