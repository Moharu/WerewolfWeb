// 
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//

var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var sockets = [];
var roles = [];

io.on('connection', function (socket) { //Estabelece os callbacks de cada event  ('event', callback (funçao executada quando recebe aquele evento.))

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('startgame', function() {
      randomRoles(3, 1, 1, 1, 1, 1, 2);
    });
    
    socket.on('identify', function (name) {
      if (name == '') {
        name = 'Anonymous';
      }
      var nickname = (sockets.indexOf(socket) + 1) + '. '+name;
      
      socket.set('role', 'none');
      
      socket.set('name', nickname, function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
  
  async.map(
    sockets,
    function(socket, callback) {
      socket.get('role', callback);
    }, 
    function (err, names) {
      sockets.forEach(function (socket){
        names.forEach(function (name){
          if(sockets.indexOf(socket) == names.indexOf(name)){
            roles[sockets.indexOf(socket)] = name;
            socket.emit('tellrole', name);
          }
        })
      });
    });
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});

/* ***************************** GAME ******************************************
******************************** FUNCTIONS *************************************
*/

function randomRoles( werewolfnumber, witchnumber, cupidnumber, hunternumber, littlegirlnumber, seernumber, villagernumber) {
  sockets.forEach(function (socket){
    var role = 'none';
    while(role == 'none'){
      var numb = Math.floor(Math.random()*7) + 1;
      switch(numb){
        case 1:
          if(werewolfnumber!=0){
            werewolfnumber--;
            role = 'werewolf';
            socket.set('role', 'werewolf');
          }
          break;
        case 2:
          if(witchnumber!=0){
            witchnumber--;
            role = 'witch';
            socket.set('role', 'witch');
          }
          break;
        case 3:
          if(cupidnumber!=0){
            cupidnumber--;
            role = 'cupid';
            socket.set('role', 'cupid');
          }
          break;
        case 4:
          if(littlegirlnumber!=0){
            littlegirlnumber--;
            role = 'littlegirl';
            socket.set('role', 'littlegirl');
          }
          break;
        case 5:
          if(hunternumber!=0){
            hunternumber--;
            role = 'hunter';
            socket.set('role', 'hunter');
          }
          break;
        case 6:
          if(seernumber!=0){
            seernumber--;
            role = 'seer';
            socket.set('role', 'seer');
          }
          break;
        case 7:
          if(villagernumber!=0){
            villagernumber--;
            role = 'villager';
            socket.set('role', 'villager');
          }
          break;
      }
    }
  startGame();
  });
}

function startGame(){
  updateRoster();
  sockets.forEach(function (socket){
    socket.emit('startclock', 30);
  });
  //setTimeout(startNightCycle(), 5000);
}

function startClock(socket, seconds){
  socket.emit('startclock', seconds);
}

/*function startNightCycle(){
  werewolvesTurn();
}

function werewolvesTurn(){
  sockets.forEach(function (socket){
    socket.get('role', function(role){
      if(role == 'werewolf'){
        socket.emit('startclock', 30);
      }
    });
  });
}*/
