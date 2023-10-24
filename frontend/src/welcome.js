import React from 'react';
import { Button } from "antd";

const Home = () => {
    return (
        <div>
            <h2>Welcome to team 404 Not Found team project page</h2>
            <Button type={"primary"} href={"./login"}>Login</Button>
            <br/>
            <br/>
            <Button type={"primary"} href={"./register"}>Register</Button>
        </div>
    );
}

export default Home;