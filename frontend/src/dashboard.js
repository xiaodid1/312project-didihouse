import React, {useEffect, useState} from 'react';
import {Alert, Button, Form, Input} from "antd";
import axios from "axios";
import Home from "./welcome";
import { HeartOutlined, HeartFilled } from '@ant-design/icons'

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState(null);
    const [messageType, setType] = useState("warning");
    const [postmessage, setPostmessage] = useState(null);
    const [likemessage, setLikemessage] = useState(null);
    const [posts, setPosts] = useState([]);
    useEffect(() => {
        if (!user) {
            axios.get("/auth-check")
                .then(response => {
                    if (response.data.username) {
                        setUser(response.data.username);
                    }
                    if (response.data.message) {
                        setType("warning");
                        setMessage(response.data.message);
                    }
                });
        }

        const fetchPosts = () => {
            axios.get('/posts-his/' + user)
                .then(response => {
                    setPosts(response.data.posts);
                });
        };
        fetchPosts();
        const interval = setInterval(fetchPosts, 3000);
        return () => clearInterval(interval);
    }, [user]);
    const [form] = Form.useForm();
    const onFinish = async (values) => {
        axios.post("/dashboard-post/" + user, values)
            .then(function (response) {
                setPostmessage(response.data.message)
                setType("success")
                setPosts(prevPosts => [...prevPosts, {user, ...values}]);
                form.resetFields();
            })
    }
    const setLike = async (postid) => {
        axios.post('/setLike/' + user + "/" + postid)
            .then(response => {
                if (response.data.message) {
                    setType("warning")
                    setLikemessage(response.data.message)
                } else {
                    setPosts(prevPosts => {
                        return prevPosts.map(posts => {
                            if (posts._id === postid) {
                                return {...posts, liked: 1, likes: posts.likes + 1}
                            }
                            return posts
                        })
                    })
                }
            })
    }
    const setDislike = async (postid) => {
        axios.post('/setDislike/' + user + "/" + postid)
            .then(response => {
                setPosts(prevPosts => {
                    return prevPosts.map(posts => {
                        if (posts._id === postid) {
                            return {...posts, liked: 0, likes: posts.likes - 1}
                        }
                        return posts
                    })
                })
            })
    }
    return (
        <>
            {message && <Alert message={message} type={messageType} closable showIcon/>}
            {likemessage &&  <Alert message={likemessage} type={messageType} closable showIcon/>}
            {user && <h1>Welcome to dashboard, {user}</h1>}
            {message && <Home/> }
            {postmessage && <Alert message={postmessage} type={messageType} closable showIcon/> }
            {user && <Form form={form}
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
                    label="Title"
                    name="title"
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                >
                    <Input/>
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
            </Form> }
            <div>
                {posts.map((post, index) => (
                    <div id={post._id}>
                        <h3>{post.user} :</h3>
                        <h2>Title: {post.title}</h2>
                        <p>Description: {post.description}</p>
                        {post.liked === 1 ?
                            <HeartFilled style={{color: "red",}} onClick={() => setDislike(post._id)} /> :
                            <HeartOutlined onClick={() => setLike(post._id)} /> }
                        <p>{post.likes}</p>
                        <br/>
                        <br/>
                    </div>
                ))}
            </div>
        </>
    )
};

export default Dashboard;