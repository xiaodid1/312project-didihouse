import React, {useEffect, useState} from 'react';
import {Alert, Button, Table, Tag, Image, Avatar } from "antd";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { UserOutlined } from '@ant-design/icons';
import './media/error.jpg'
import socket from "./socket";
import auctions from "./auctions";

const columns = [
    {
        title: 'Owner',
        dataIndex: 'owner',
        key: 'owner'
    },
    {
        title: 'Item Image',
        dataIndex: 'imageUrl',
        key: 'image',
        render: imageUrl => <Image width={50} height={50} src={imageUrl}/>
    },
    {
        title: 'Item Name',
        dataIndex: 'itemName',
        key: 'itemName',
    },
    {
        title: 'Item Description',
        dataIndex: 'itemDescription',
        key: 'itemDescription',
    },
    {
        title: 'Bid',
        dataIndex: 'bid',
        key: 'bid',
        render: bid => '$ ' + bid
    },
    {
        title: 'Duration(Seconds)',
        dataIndex: 'duration',
        key: 'duration',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => {
            let color = status === 'Ended' ? 'volcano' : status === 'Ongoing' ? 'geekblue' : 'green';
            return <Tag color={color}>{status}</Tag>;
        }
    },
    {
        title: 'Winner',
        dataIndex: 'winner',
        key: 'winner'
    }
]
const AuctionBoard = () => {
    const [user, setUser] = useState(null);
    const [verify, setVerify] = useState(null);
    const [message, setMessage] = useState(null);
    const [messageType, setType] = useState("warning");
    const [data, setData] = useState(null)
    useEffect( () => {
        if (!user) {
            axios.get("/auth-check")
                .then(response => {
                    if (response.data.username) {
                        setUser(response.data.username);
                        setVerify(response.data.verif);
                    }
                    if (response.data.message) {
                        setType("warning");
                        setMessage(response.data.message);
                        setTimeout( () => {
                            window.location.replace("/login")
                        }, 1000)
                    }
                });
        }
        if (!data && user) {
            axios.get("/all-auction")
                .then(response => {
                    // setData(response.data.auctions);
                    console.log(response.data)
                    console.log(response.data.auctions)
                    const auction_data = response.data.auctions.map((auction, index) => ({
                        key: auction._id,
                        owner: auction.username,
                        imageUrl: auction.image_file,
                        itemName: auction.name,
                        itemDescription: auction.description,
                        bid: auction.price,
                        duration: auction.duration,
                        status: auction.Status,
                        winner: auction.Status !== 'Ended' ? '' : auction.winner,
                    }));
                    console.log(auction_data)
                    setData(auction_data)
                });
        }
        const addAuction = (auction) => {
            const auction_date = {
                key: auction.auction_id,
                owner: auction.username,
                imageUrl: auction.image_file,
                itemName: auction.name,
                itemDescription: auction.description,
                bid: auction.price,
                duration: auction.duration,
                status: auction.Status,
                winner: auction.winner,
            };
            setData(oldData => [...oldData, auction_date])
        }
        const updateStatus = (data) => {
            setData(oldData => oldData.map(auction => {
                if (auction.key === data.auction_id) {
                    return { ...auction, status: 'Ongoing'}
                }
                return auction
            }))
        }
        const updateBid = (data) => {
            setData(oldData => oldData.map(auction => {
                if (auction.key === data.auction_id) {
                    return { ...auction, bid: data.new_bid}
                }
                return auction
            }))
        }
        const endAuction = (data) => {
            setData(oldData => oldData.map(auction => {
                if (auction.key === data.auction_id) {
                    return { ...auction, status: 'Ended', winner: data.winner}
                }
                return auction
            }))
        }
        socket.on('new_auction_created', addAuction);
        socket.on('new_auction_started', updateStatus);
        socket.on('new_bid_posted', updateBid);
        socket.on('auction_end', endAuction);
        return () => {
            socket.off('new_auction_created', addAuction);
            socket.off('new_auction_started', updateStatus);
            socket.off('new_bid_posted', updateBid);
            socket.off('auction_end', endAuction);
        }
    });

    const onRowClick = (data) => {
        return {
            onClick: () => {
                window.location.replace('/auction-room?id=' + data.key);
                // navigate('/auction-room?id=' + data.key)
            }
        }
    }
    const toCreate = () => {
        window.location.replace('/auctions')
    }
    const toProfile = () => {
        window.location.replace('/profile')
    }
    return (
        <>
            <Avatar icon={<UserOutlined />} onClick={toProfile}/>
            <span>Email Verification: {verify}</span>
            <br />
            <Button type="primary" onClick={toCreate}>
                Create Auction
            </Button>
            {message && <Alert message={message} type={messageType} closable showIcon/>}
            {user && <Table
                columns={columns}
                dataSource={data}
                onRow={onRowClick}
                size='small'
            />}
        </>
    );
};

export default AuctionBoard;