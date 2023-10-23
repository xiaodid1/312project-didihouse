import React from 'react';
import {BrowserRouter} from 'react-router-dom'
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import Routerapp from "./routerapp";

const Index = () => {
    return (
        <>
            <BrowserRouter>
                <Routerapp />
            </BrowserRouter>
        </>
    )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    < Index/>
);
reportWebVitals();
