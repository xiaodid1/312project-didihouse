import React, { useState } from 'react';
import {Button, Form, Input, Typography} from 'antd';
import { Alert } from "antd";
import axios from "axios";

const { Title } = Typography
const Login = () => {
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState("success");
    const onFinish = (values) => {
        axios.post("/login",
            values)
            .then(function (response) {
                setMessage(response.data.message)
                if (response.data.message !== "Successfully logged in"){
                    setMessageType("error")
                    if (response.data.message === "User not found please register first") {
                        setTimeout( () => {
                            window.location.replace("/register")
                        }, 1000)
                    }
                } else {
                    setMessageType("success")
                    setTimeout( () => {
                        window.location.replace("/auction-board")
                    }, 1000)
                }
            })
            .catch(function (error) {
            })
    };
    const toRegister = () => {
        window.location.replace('/register')
    }
    return (
        <>
            <Title level={2}>Login</Title>
            {message && <Alert message={message} type={messageType} showIcon/>}
            <Form
                name="basic"
                labelCol={{
                    span: 8,
                }}
                wrapperCol={{
                    span: 16,
                }}
                style={{
                    maxWidth: 600,
                }}
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your username!',
                        },
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your password!',
                        },
                    ]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item
                    wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}
                >
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
            <Button type="primary" onClick={toRegister}>
                Register
            </Button>
        </>
    );
};
export default Login;