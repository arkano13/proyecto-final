import React from 'react';

import {
  registerRootComponent,
} from 'expo';

import App from './App';

import {
  TemaProvider,
} from './src/context/TemaContext';

function AplicacionRaiz() {
  return (
    <TemaProvider>
      <App />
    </TemaProvider>
  );
}

registerRootComponent(
  AplicacionRaiz
);