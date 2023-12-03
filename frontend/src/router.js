import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from "./Login";
import Register from "./Register";
import Home from "./welcome";
import Dashboard from "./dashboard";
import Auctions from "./auctions";
import AuctionBoard from "./auctionBoard";
import Profile from "./profile";
import AuctionRoom from "./auctionRoom";

function Router() {

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/*<Route path="/dashboard" element={<Dashboard />} />*/}
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/auction-board" element={<AuctionBoard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auction-room" element={<AuctionRoom />} />
        </Routes>
    )
}

export default Router