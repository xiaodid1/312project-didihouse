import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Alert, Button, Table, Tag, Image, Avatar, Divider } from "antd";
import axios from "axios";
import socket from "./socket";

const { Title } = Typography
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
        title: 'Duration(Minutes)',
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
        key: 'winner',
    }
]
const columns2 = [
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
]
const Profile = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState(null);
    const [messageType, setType] = useState("warning");
    const [owndAuction, setOwndAuction] = useState(null);
    const [winAuction, setWinAuction] = useState(null);
    const navigate = useNavigate();
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
                        setTimeout( () => {
                            window.location.replace("/login")
                        }, 2000)
                    }
                });
        }
        if (user && owndAuction === null && winAuction === null) {
            axios.get("/user_infor")
                .then(response => {
                    // setData(response.data.auctions);
                    console.log(response.data)
                    console.log(response.data.created_auctions)
                    console.log(response.data.win_auctions)
                    if (response.data.created_auctions.length > 0) {
                        const auction_data = response.data.created_auctions.map((auction, index) => ({
                            key: auction._id,
                            owner: auction.username,
                            imageUrl: auction.image_file,
                            itemName: auction.name,
                            itemDescription: auction.description,
                            bid: auction.price,
                            duration: auction.duration,
                            status: auction.Status,
                            winner: auction.Status !== 'Ended' ? '' : auction.winner
                        }));
                        console.log(auction_data)
                        setOwndAuction(auction_data)
                    }
                    if (response.data.win_auctions.length > 0) {
                        const auction_data = response.data.win_auctions.map((auction, ) => ({
                            key: auction._id,
                            owner: auction.username,
                            imageUrl: auction.image_file,
                            itemName: auction.name,
                            itemDescription: auction.description,
                            bid: auction.price,
                        }));
                        console.log(auction_data)
                        setWinAuction(auction_data)
                    }
                });
        }
        const updateBid = (data) => {
            setOwndAuction(oldData => oldData.map(auction => {
                if (auction.key === data.auction_id) {
                    return { ...auction, bid: data.new_bid}
                }
                return auction
            }))
        }
        const updateAuction = (data) => {
            if (data) {
                if (user && data.winner && data.winner === user) {
                    axios.get('/get-auction/' + data.auction_id)
                        .then(response => {
                            if (!response.data.message && response.data.auction) {
                                const auction_data = {
                                    key: response.data.auction._id,
                                    owner: response.data.auction.username,
                                    imageUrl: response.data.auction.image_file,
                                    itemName: response.data.auction.name,
                                    itemDescription: response.data.auction.description,
                                    bid: response.data.auction.price,
                                }
                                setWinAuction(oldData => [ ...oldData, auction_data])
                            }
                        })
                } else if (user) {
                    setOwndAuction(oldData => oldData.map(auction => {
                        if (data.auction_id === auction.key) {
                            return { ...auction, status: 'Ended', winner: data.winner}
                        }
                        return auction
                    }))
                }
            }
        }
        socket.on('new_bid_posted', updateBid);
        socket.on('auction_end', updateAuction);
        return () => {
            socket.off('new_bid_posted', updateBid);
            socket.off('auction_end', updateAuction);
        }
    });
    const toBoard = () => {
        window.location.replace('/auction-board')
    }
    const toCreate = () => {
        window.location.replace('/auctions')
    }
    const onRowClick = (data) => {
        return {
            onClick: () => {
                window.location.replace('/auction-room?id=' + data.key);
                // navigate('/auction-room?id=' + data.key)
            }
        }
    }
    const show = () => {
        return (
            <>
                <Divider>Created Auctions</Divider>
                <Table columns={columns} dataSource={owndAuction} onRow={onRowClick} size='small' />
                <br/>
                <br/>
                <Divider>Auctions Won</Divider>
                <Table columns={columns2} dataSource={winAuction} onRow={onRowClick} size='small' />
            </>
        )
    }
    return (
        <>
            {message && <Alert message={message} type={messageType} closable showIcon/>}
            {user && <Title level={3}>Hello, {user}</Title>}
            {user && show()}
            <Button type="primary" onClick={toBoard}>
                Auction Board
            </Button>
            <Button type="primary" onClick={toCreate}>
                Create Auction
            </Button>
        </>
    );
};

export default Profile;