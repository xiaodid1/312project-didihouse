import React, {useEffect, useState} from 'react';
import {Alert, Button, Table, Tag, Image } from "antd";
import axios from "axios";
import './images/cat.jpg'
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
        render: bid => <a>$ {bid}</a>
    },
    {
        title: 'Duration(Minutes)',
        dataIndex: 'duration',
        key: 'duration',
        render: duration => <a>{duration}</a>
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => {
            let color = status === 'Ended' ? 'volcano' : status === 'Ongoing' ? 'geekblue' : 'green';
            return <Tag color={color}>{status}</Tag>;
        }
    }
]
const AuctionBoard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState(null);
    const [messageType, setType] = useState("warning");
    const [data, setData] = useState(null)
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
        } else {
            axios.get("/all-auction")
                .then(response => {
                    // setData(response.data.auctions);
                    const auction_data = response.data.auctions.map((auction, index) => ({
                        key: auction._id,
                        owner: auction.username,
                        imageUrl: auction.image_file,
                        itemName: auction.name,
                        itemDescription: auction.description,
                        bid: auction.price,
                        duration: auction.duration,
                        status: auction.Status,
                    }));
                    setData(auction_data)
                });
        }
    });
    // const auctions = [
    //     {
    //         key: 1,
    //         owner: 'Biying Yu',
    //         imageUrl: './images/cat.jpg',
    //         itemName: 'Orange',
    //         itemDescription: 'cat',
    //         bid: 20,
    //         duration: 30,
    //         status: 'Waiting'
    //     },
    //     {
    //         key: 2,
    //         owner: 'Xdd',
    //         imageUrl: './images/cat.jpg',
    //         itemName: 'Yellow Hair',
    //         itemDescription: 'Sha Gou',
    //         bid: 30,
    //         duration: 20,
    //         status: 'Ongoing'
    //     },
    //     {
    //         key: 3,
    //         owner: 'Xdd',
    //         imageUrl: 'images/cat.jpg',
    //         itemName: 'Yellow Hair',
    //         itemDescription: 'Sha Gou',
    //         bid: 30,
    //         duration: 20,
    //         status: 'Ended'
    //     },
    // ]

    const onRowClick = (data) => {
        return {
            onClick: () => {
                window.location.replace('/dashboard/' + data.key);
            }
        }
    }
    return (
        <>
            {message && <Alert message={message} type={messageType} closable showIcon/>}
            {user && <Table
                columns={columns}
                dataSource={data}
                onRow={onRowClick}
            />}
        </>
    );
};

export default AuctionBoard;