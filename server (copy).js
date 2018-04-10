'use strict';

var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
//var port = process.env.OPENSHIFT_NODEJS_PORT || 1337;
var ip =  process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
    
var express = require('express');
var app = express();
var http = require('http').Server(app);
const request = require('request');
var io = require('socket.io')(http);


// app.use(function(req, res, next) { 
//     res.header('Access-Control-Allow-Origin', "*"); 
//     res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE'); 
//     res.header('Access-Control-Allow-Headers', 'Content-Type'); 
//     next(); 
// });

//app.use(cors({origin: 'http://localhost:1337'}));
//For serving static files
app.use(express.static(__dirname));


//var activePlayersLimit = 6;
var playerList = [];
//var playerQueue = [];


app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
})

//app.get('/game', function(req, res){
//    res.sendFile(__dirname + '/game.html') 
//});

//For probe and liveness tests
app.get('/probe', (req, res) => res.sendStatus(200));
app.get('/liveness', (req, res) => res.sendStatus(200));

http.listen(port, function(){
    console.log('listening on port ' + port);
});

var players = io.of('/player'); //Make socket namespace for player-clients
var game = io.of('/game'); //name space for game-client (ie. the actual game)

//players.on('connection', function(socket){
//    
//    console.log('new player: ' + socket.id);
//    
//    //Inform game client of new player
//    game.emit('newplayer', socket.id);
//    console.log("joining game")
//    //let player client know it has joined
//    socket.emit('joinedgame');
//
//    //store connection id
//    playerList.push(socket.id)
//
//
//    //bind handler for client input
//    socket.on('input', function(data){
////        sendPlayerDirection(socket, data);
//        console.log(data);
//    });
//
//    
//    console.log("# of players: " + playerList.length);
////    console.log("queue: " + playerQueue.length);
//    console.log("");
//
//    
//    socket.on('disconnect', function(t){
//        console.log('connection ' + socket.id + ' closed');
//        game.emit('playerdisconnected', socket.id);
//        playerList.pop(socket.id)
//          
//        console.log("# of players: " + playerList.length);
////        console.log("queue: " + playerQueue.length);
//        console.log("");
//        
//    });
//    
//});

game.on('connection', function(socket){
    console.log('new game: ' + socket.id);
    socket.emit("hello", "there");
    //Reset active players and queue
    playerList = [];

    
    socket.on('message', function(data){
        data = JSON.parse(data);
        var otherSocket = playerList.connected[data.id];
        if (otherSocket){
            otherSocket.emit('message', data.message);
        } else {
            console.log("not found");
        }
    });
});

function sendPlayerDirection(socket, data){
    console.log("player " + socket.id + " is moving " + data); 
    game.emit("direction", {id: socket.id, direction: data})
}

function stopMove(socket, data){
    console.log("player stopped moving");
    game.emit("moveend" , {id: socket.id});
}