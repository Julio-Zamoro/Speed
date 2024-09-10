import React from 'react';
import ReactDOM from 'react-dom/client'; // Atualizado para React 18
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Criar o root com React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar a aplicação com BrowserRouter envolvido
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);