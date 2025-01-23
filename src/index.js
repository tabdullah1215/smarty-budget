// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

serviceWorkerRegistration.unregister();
reportWebVitals();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/custom-service-worker-renamed.js')
        .then((registration) => {
            console.log('Custom service worker registered:', registration.scope);
        })
        .catch((error) => {
            console.error('Custom service worker registration failed:', error);
        });
}