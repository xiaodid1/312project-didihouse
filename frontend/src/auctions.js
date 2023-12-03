import React, { useState } from "react";
import {Form, Input, InputNumber, Button, Upload, Alert, Avatar, Typography} from "antd"
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import axios from "axios";
import {useEffect} from "react";
import socket from "./socket";


const { Text } = Typography
const Auctions = () => {
    const [form] = Form.useForm();
    const [image, setImage] = useState([]);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState(null);
    const [messageType, setType] = useState("warning");
    const [description, setDescription] = useState(null);
    const [price, setPrice] = useState(null);
    const [duration, setDuration] = useState(null);
    const [itemName, setName] = useState(null);
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
                        setTimeout( () => {
                            window.location.replace("/login")
                        }, 2000)
                    }
                });
        }
    });
    const onFinish = async (values) => {
        // 在这里处理表单提交
        // 包括上传文件
        console.log('Form Values:', values);
        console.log('Files to Upload:', image);

        const formData = new FormData();

        // 添加表单字段到 FormData 对象
        Object.keys(values).forEach(key => {
            if (key === 'upload') {
                image.forEach(file => {
                    console.log(file)
                    formData.append('image', file);
                });

            } else {
            //     // 对于非文件字段，直接添加到 FormData 对象中
                formData.append(key, values[key]);
            }
        });
        console.log(formData)
        if (user) {
            await axios.post('/create-auction', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }).then(response =>{
                if (response.data.message === 'You have not logged in yet, you are welcome to log in or register') {
                    setType('warning')
                    setMessage(response.data.message);
                    setTimeout( () => {
                        window.location.replace("/login")
                    }, 1000)
                }
                if (response.data.message === 'Auction Created') {
                    setType('success')
                    setMessage(response.data.message)
                    setTimeout( () => {
                        window.location.replace("/auction-board")
                    }, 1000)
                }
            }).catch(function (error) {
            })
        } else {
            setType('warning')
            setMessage('You have not logged in yet, you are welcome to log in or register')
            setTimeout( () => {

                window.location.replace("/login")
            }, 1000)
        }

    };

    const uploadProps = {
        beforeUpload: file => {
            // 将文件添加到 fileList
            setImage([file]);
            // 阻止文件自动上传
            return false;
        },
        fileList: image,
    };
    const toBoard = () => {
        window.location.replace('/auction-board')
    }
    const toProfile = () => {
        window.location.replace('/profile')
    }
    const showButton = () => {
        if (description && itemName && parseFloat(price) > 0.0 && parseInt(duration) > 0) {
            return (
                <>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </>
            )
        } else {
            return (
                <>
                    <Button type="primary" disabled>
                        Submit
                    </Button>
                </>
            )
        }
    }
    return (
        <>
            {message && <Alert message={message} type={messageType} closable showIcon/> }
            <Avatar icon={<UserOutlined />} onClick={toProfile}/>
            <h1>Create Auction</h1>

            <Form form={form} onFinish={onFinish}>

                <Form.Item
                    name="upload"
                    label="Item Image"
                    valuePropName="fileList"
                    getValueFromEvent={e => {
                        if (Array.isArray(e)) {
                            return e;
                        }
                        return e && e.fileList;
                    }}
                    style={{width: '300px'}}
                >
                        <Upload {...uploadProps} listType="picture" maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload Item Image</Button>
                        </Upload>
                </Form.Item>

                <Form.Item label="Item Name" name="name">
                    <Input onChange={(value) => setName(value)} style={{width: '100px',}} />
                </Form.Item>

                <Form.Item label="Item Description" name="description">
                    <Input onChange={(value) => setDescription(value)} style={{width: '100px',}} />
                </Form.Item>

                <Text underline>*Only allow numbers with 2 decimals~ (Highest:10000, Lowest:1)</Text>
                <Form.Item label="Price" name="price">
                    {/*<Popconfirm placement='right' title='Reminder' description='Only follow numbers with 2 decimals~' okText='Got it!'>*/}
                        <InputNumber min={1} max={10000} precision={2} onChange={(value) => setPrice(value)} prefix="$" style={{width: '100px',}}/>
                    {/*</Popconfirm>*/}
                </Form.Item>

                <Text underline>*Only allow Integers~ (Highest: 360, Lowest:10)</Text>
                <Form.Item label="Duration time" name="duration">
                    {/*<Popconfirm placement='right' title='Reminder' description='Only follow Integers~' okText='Got it!'>*/}
                        <InputNumber min={10} max={360} precision={0} onChange={(value) => setDuration(value)} addonAfter="Sec" style={{width: '100px',}}/>
                    {/*</Popconfirm>*/}
                </Form.Item>

                <Form.Item>
                    {showButton()}
                </Form.Item>

            </Form>

            <Button type='primary' onClick={toBoard}>
                Auction Board
            </Button>
        </>
    )
};

export default Auctions;