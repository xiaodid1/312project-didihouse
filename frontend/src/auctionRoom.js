import React, {useState, useEffect} from 'react';
import { Avatar, Button, Form, Input, Typography, Divider, Image, Tag, InputNumber, message, Popconfirm } from 'antd';
import { Alert } from "antd";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import socket from "./socket";

const { Title, Text } = Typography
const AuctionRoom = () => {
    const [user, setUser] = useState(null);
    const [messageNote, setMessage] = useState(null);
    const [messageType, setType] = useState("warning");
    const [data, setData] = useState(null)
    const [bitInput, setBitInput] = useState(null)
    const [messageApi, contextHolder] = message.useMessage();
    const [buttonDisable, setDisable] = useState(false)
    const [time, setTime] = useState(null)
    // const [context, setContext] = useState(null)
    const { search } = useLocation();
    const param = new URLSearchParams(search);
    const id = param.get('id');
    useEffect( () => {
        if (!user) {
            axios.get("/auth-check")
                .then(response => {
                    if (response.data.username) {
                        setUser(response.data.username);
                    }
                    if (response.data.message) {
                        setType("warning");
                        setMessage(response.data.message);
                        setTimeout(() => {
                            window.location.replace("/login")
                        }, 1000)
                    }
                });
        }
        if (!id) {
            setMessage('Not Auction Associate')
            setTimeout(() => {
                window.location.replace("/auction-board")
            }, 1000)
        }
        if (user && id !== null && data === null) {
            axios.get('/get-auction/' + id)
                .then(response => {
                    // console.log(response.data.auction);
                    if (response.data.message) {
                        if (response.data.message === 'No Auction Associate') {
                            setType('warning')
                            setMessage(response.data.message)
                            setTimeout(() => {
                                window.location.replace("/auction-board")
                            }, 1000)
                        } else if (response.data.message === 'You have not logged in yet, you are welcome to log in or register') {
                            setType('warning');
                            setMessage(response.data.message)
                            setTimeout(() => {
                                window.location.replace("/login")
                            }, 1000)
                        }
                    } else {
                        setData(response.data.auction)
                    }
                });
        }
        const updateAuction = (auction) => {
            setData(oldData => {
                if (id && oldData._id === auction.auction_id) {
                    return { ...oldData, Status: 'Ongoing'}
                }
                return oldData;
            })
        }
        const updateBid = (auction) => {
            setData(oldData => {
                if (id && oldData._id === auction.auction_id && parseFloat(oldData.price) < parseFloat(auction.new_bid)) {
                    return { ...oldData, price: auction.new_bid}
                }
                return oldData;
            })
        }
        const updateTime = (timeData) => {
            // if (id && id === data.auction_id && timeData.auction_id === data.auction_id) {
            //     console.log(id === data.auction_id);
            //     console.log(timeData.auction_id === data.auction_id)
            //     setTime(timeData.time)
            // }
            // setTime(() => {
            //     if (id === data._id && data._id === timeData.auction_id) {
            //         return timeData.time;
            //     }
            // })
            if (id === data._id && data._id === timeData.auction_id) {
                setTime(timeData.time)
            }
        }
        const endAuction = (auction) => {
            setData(oldData => {
                if (id && oldData._id === auction.auction_id) {
                    return { ...oldData, Status: 'Ended', winner: auction.winner}
                }
                return oldData;
            })
        }
        socket.on('new_auction_started', updateAuction);
        socket.on('new_bid_posted', updateBid);
        socket.on('time_left', updateTime);
        socket.on('auction_end', endAuction);
        return () => {
            socket.off('new_auction_created', updateAuction);
            socket.off('new_bid_posted', updateBid);
            socket.off('time_left', updateTime);
            socket.off('auction_end', endAuction);
        }
    });
    const showStatus = (data) => {
        let color = null;
        if (data.Status === 'Waiting') {
            color = 'green'
        } else if (data.Status === 'Ongoing') {
            color = 'geekblue'
        } else {
            color = 'volcano'
        }
        return (
            <>
                <Tag color={color}>{data.Status}</Tag>
            </>
        )
    }
    const showData = (data) => {
        if (!data) {
            return <div>Loading Information ... </div>
        }
        return (
            <>
                <span>Owner: {data.username}</span>
                <br/>
                <Image width={50} height={50} src={data.image_file}/>
                <br/>
                <span>Item Name: {data.name}</span>
                <br/>
                <span>Item Description: {data.description}</span>
                <br/>
                <span>Bid: $ {data.price}</span>
                <br/>
                <span>Duration(Seconds): {data.duration}</span>
                <br/>
                <span>Status: {showStatus(data)}</span>
                <br/>
                <span>Winner: {data.Status !== 'Ended' ? '' : data.winner}</span>
                <br/>
            </>
        )
    }
    const showButton = (status) => {
        if (status) {
            if (status === 'Waiting') {
                return (
                    <>
                        <Button type="primary" htmlType="submit" onClick={startAuction}>
                            Start Auction
                        </Button>
                    </>
                )
            } else if (status === 'Ongoing' || status === 'Ended') {
                return (
                    <>
                        <Button type='primary' disabled>
                            Start Auction
                        </Button>
                    </>
                )
            }
        }
    }
    const [form] = Form.useForm();
    const toBoard = () => {
        window.location.replace('/auction-board')
    }
    const toProfile = () => {
        window.location.replace('/profile')
    }
    const onFinish = async (value) => {
        console.log(value)
        setDisable(true)
        if (user) {

            await axios.post('/post-bit/' + id, value)
                .then(response => {
                    console.log(response)
                    if (response.data.message === 'Bit placed successfully') {
                        // setType('success')
                        // setMessage(response.data.message)
                        messageApi.open({
                            type: 'success',
                            content: response.data.message,
                            duration: 3,
                        })
                        form.resetFields();
                        setBitInput(null)
                    } else if (response.data.message === 'Bid must be be greater than previous bid') {
                        messageApi.open({
                            type: 'error',
                            content: response.data.message,
                            duration: 3,
                        })
                        form.resetFields();
                        setBitInput(null)
                    } else if (response.data.message === 'Invalid Action' || response.data.message === 'No Auction Associate') {
                        setType('warning')
                        setMessage(response.data.message)
                        setTimeout(() => {
                            window.location.replace('/auction-board')
                        }, 1000)
                    } else {
                        setType('warning')
                        setMessage(response.data.message)
                        setTimeout(() => {
                            window.location.replace("/login")
                        }, 1000)
                    }
                })
        } else {
            setMessage("Please Log in first")
            setType('warning')
            setTimeout(() => {
                window.location.replace("/login")
            }, 1000)
        }
        setTimeout(() => {
            setDisable(false)
        }, 3000)

    }
    const startAuction = () => {
        if (user && id && user === data.username && data.Status === 'Waiting') {
            axios.post('/start-auction/' + id)
                .then(response => {
                    console.log(response.data.message)
                    if (response.data.message === 'Auction Started') {
                        // setType('success');
                        // setMessage(response.data.message);
                        messageApi.open({
                            type: 'success',
                            content: response.data.message,
                            duration: 3,
                        })
                    } else if (response.data.message === 'Invalid Action' || response.data.message === 'No Auction Associate') {
                        setType('warning');
                        setMessage(response.data.message);
                        setTimeout(() => {
                            window.location.replace('/auction-board')
                        }, 1000)
                    } else {
                        setType('warning');
                        setMessage(response.data.message);
                        setTimeout(() => {
                            window.location.replace('/login')
                        }, 1000)
                    }
                })
        } else if (!user) {
            setType('warning');
            setMessage('You have not logged in yet, you are welcome to log in or register');
            setTimeout(() => {
                window.location.replace('/login')
            }, 1000)
        } else if (!id || data.username !== user || data.Status !== 'Waiting') {
            setType('warning');
            setMessage('Invalid Action');
            setTimeout(() => {
                window.location.replace('/auction-board')
            }, 1000)
        }
    }
    const showBidButton = () => {
        if (bitInput !== null && bitInput > 0 && buttonDisable === false && data.Status === 'Ongoing') {
            return (
                <>
                    <Button type='primary' htmlType='submit'>
                        Place Bit
                    </Button>
                </>
            )
        } else {
            return (
                <>
                    <Button type='primary' disabled>
                        Place Bit
                    </Button>
                </>
            )
        }
    }
    const showDuration = () => {
        if (time) {
            return (
                <>
                    <Title level={3}>Duration left: {time} Seconds</Title>
                </>
            )
        }
    }
    const showForm = (status) => {
        if (status) {
            if (status === 'Ongoing') {
                return (
                    <>
                        <Text underline>*Only follow numbers with 2 decimals~ (Highest:100000, Lowest:1)</Text>
                        <Form form={form} onFinish={onFinish}>
                            <Form.Item label='New Bit to place' name='new_bid'>
                                {/*<Popconfirm placement='right' title='Reminder' description='Only follow numbers with 2 decimals~' okText='Got it!'>*/}
                                    <InputNumber min={1} max={100000} precision={2} onChange={(value) => setBitInput(value)}/>
                                {/*</Popconfirm>*/}
                            </Form.Item>
                            {showBidButton()}
                        </Form>
                    </>
                )
            }
        }
    }
    return (
        <>
            {contextHolder}
            <Avatar icon={<UserOutlined />} onClick={toProfile}/>
            <Title level={2}>Auction Information</Title>
            {showDuration()}
            {/*<Divider><Title level={2}>Auction Information</Title></Divider>*/}
            {messageNote && <Alert message={messageNote} type={messageType} showIcon closable/>}
            {user && id && showData(data)}
            {/*if user is the auction owner and auction not start yet*/}
            {data && id && user && user === data.username && showButton(data.Status)}
            {/*if user is not owner and auction is ongoing*/}
            {data && id && user && user !== data.username && showForm(data.Status)}
            <br/>
            <Button type='primary' onClick={toBoard}>
                Auction Board
            </Button>
        </>
    );
};

export default AuctionRoom;