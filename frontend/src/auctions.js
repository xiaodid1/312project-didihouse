import React, { useState } from "react";
import {Form, Input, InputNumber, Button, Upload, Alert} from "antd"
import { UploadOutlined,  } from '@ant-design/icons';
import axios from "axios";
import {useEffect} from "react";

const Auctions = () => {
    const [form] = Form.useForm();
    const [image, setImage] = useState([]);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState(null);
    const [messageType, setType] = useState("warning");
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
                    }, 2000)
                }
                if (response.data.message === 'Auction Created') {
                    setType('success')
                    setMessage(response.data.message);

                }
            }).catch(function (error) {
            })
        } else {
            setType('warning')
            setMessage('You have not logged in yet, you are welcome to log in or register')
            setTimeout( () => {
                window.location.replace("/login")
            }, 2000)
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
    return (
        <>
            {message && <Alert message={message} type={messageType} closable showIcon/> }
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
                    <Input style={{width: '100px',}} />
                </Form.Item>

                <Form.Item label="Item Description" name="description">
                    <Input style={{width: '100px',}} />
                </Form.Item>

                <Form.Item label="Price" name="price">
                    <InputNumber prefix="$" style={{width: '100px',}}/>
                </Form.Item>

                <Form.Item label="Duration time" name="duration">
                    <InputNumber addonAfter="Min" style={{width: '100px',}}/>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>

            </Form>
        </>
    )
};

export default Auctions;