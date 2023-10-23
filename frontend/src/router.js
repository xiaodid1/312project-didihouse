import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from "./Login";
import Register from "./Register";
import Home from "./welcome";
import Dashboard from "./dashboard";

function Router() {

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    )
}

export default Router