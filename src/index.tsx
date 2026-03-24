import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

const rootElement = document.getElementById('root');
const initialTheme = localStorage.getItem('theme') ?? 'light';
rootElement?.setAttribute('data-theme', initialTheme);
document.documentElement.setAttribute('data-theme', initialTheme);

const root = ReactDOM.createRoot(
  rootElement as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
