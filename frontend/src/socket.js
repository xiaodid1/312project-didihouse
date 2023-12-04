import { io } from 'socket.io-client';

const socket = io('https://auction404notfound.com', { transports : ['websocket']});

export default socket;