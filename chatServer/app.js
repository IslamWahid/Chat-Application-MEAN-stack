var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/Chat')

app.use(bodyParser.json());
app.use(bodyParser.json({type: 'text/plain'}))
app.use(bodyParser.urlencoded({extended: false}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var auth = require('./routes/auth');
app.use('/auth', auth);

//=====================================================================================
//----------------------------chat Handler---------------------------------------------
//=====================================================================================
// Users Array for users data and sockets
var usersArray = new Array();
var message_model = require('./models/message_model');
var auth_model = require('./models/auth_model');

// Listen for new connections
// Open new Socket for each request
io.on('connection', clientSocket => {
  console.log("new connection");
  // Listen for new connection ..
  clientSocket.on('join', userData => {
    // add socket and user userData
    clientSocket.userData = userData;
    usersArray.push(clientSocket);



    //send the online users to all users and to the user himself
    let online_users = usersArray.map((user) => user.userData)
    clientSocket.broadcast.emit("online_users", online_users);
    clientSocket.emit("online_users", online_users);



    //send offline users to all users and the user himself
    //get offline users by getting all users and remove online_users
    auth_model.find({},{ id:1, name:1 },(err,data)=>{

      //stringify the online_users array
      online_users = online_users.map(elmt=>JSON.stringify(elmt));

      //filter  offline_users from online_users
      let offline_users = data.map((elm)=> obj = {name : elm.name, id: String(elm['_id'])})
      .filter((elm)=>!online_users.includes(JSON.stringify(elm)));

      clientSocket.broadcast.emit("offline_users", offline_users);
      clientSocket.emit("offline_users", offline_users);
    });
  });

  // send message for certain user
  clientSocket.on("message", data => {
    let msg = new message_model();
    msg.msg = data.message;
    msg.from = clientSocket.userData.id;
    msg.to = data.to;
    msg.save();
    //find the reciever socket from usersArray
    let recieverSocket = usersArray.find(elm => elm.userData.id == data.to)
    // respond to reciever and respond to the client
    recieverSocket.emit("message", msg);
    clientSocket.emit("message", msg);
  })

  clientSocket.on("offline_message" , data => {
    let msg = new message_model();
    msg.msg = data.message;
    msg.from = clientSocket.userData.id;
    msg.to = data.to;
    msg.save();
    // respond to reciever and respond to the client
    clientSocket.emit("message", msg);
  })

  clientSocket.on("getMessages", otherClientId => {

    let messages = [];
    //load messages from database
    message_model.find({
      from: {
        $in: [clientSocket.userData.id, otherClientId]
      },
      to: {
        $in: [clientSocket.userData.id, otherClientId]
      }
    }, {
      to: 1,
      from: 1,
      msg: 1,
      _id: 0
    }, (err, msgs) => clientSocket.emit("loadMessages", msgs));
  })

  clientSocket.on("disconnect", () => {

    usersArray = usersArray.filter((elm) => JSON.stringify(elm.userData) != JSON.stringify(clientSocket.userData));

    // user logout
    let online_users = usersArray.map((user) => user.userData)
    clientSocket.broadcast.emit("online_users", online_users);


    auth_model.find({},{ id:1, name:1 },(err,data)=>{

      //stringify the online_users array
      online_users = online_users.map(elmt=>JSON.stringify(elmt));

      //filter  offline_users from online_users
      let offline_users = data.map((elm)=> obj = {name : elm.name, id: String(elm['_id'])})
      .filter((elm)=>!online_users.includes(JSON.stringify(elm)));

      clientSocket.broadcast.emit("offline_users", offline_users);
    });
  })
});

//=====================================================================================
//=====================================================================================

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development'
  ? err
  : {};

  res.status(err.status || 500);
  res.json('error');
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});

module.exports = app;
