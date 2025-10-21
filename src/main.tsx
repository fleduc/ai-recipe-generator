import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Authenticator } from '@aws-amplify/ui-react';

/**
 * Root render: wraps the app in Amplify's Authenticator to require sign-in
 * before accessing the AI recipe functionality.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Authenticator>
            <App />
        </Authenticator>
    </React.StrictMode>,
);
