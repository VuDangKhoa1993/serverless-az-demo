import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Authenticator } from '@aws-amplify/ui-react';
const el = document.getElementById('root');
const root = ReactDOM.createRoot(el);

root.render(
    <>
        <Authenticator.Provider>
            <App />
        </Authenticator.Provider>
    </>
);
