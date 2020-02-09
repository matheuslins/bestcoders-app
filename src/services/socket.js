import socketio from 'socket.io-client';

const socket = socketio('https://best-coders-backend.herokuapp.com', {
    autoConnect: false
});

function subscribeToNewCoders(subscribeFunction){
    socket.on('new-coder', subscribeFunction);
}

function connect(latitude, longitude, techs){
    socket.io.opts.query = {
        latitude,
        longitude,
        techs,
    };
    socket.connect();
}

function disconect(){
    if (socket.connected){
        socket.disconnect();
    }
}

export {
    connect,
    disconect,
    subscribeToNewCoders
}