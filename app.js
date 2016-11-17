var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var http=require('http').createServer();
var io=require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var onlineUsers={};
var onlineCount=0;
io.on('connection',function(socket){
  console.log('a user connected');

  //监听新用户加入
  socket.on('login',function(obj){
    socket.name=obj.userid;
    if(!onlineUsers.hasOwnProperty(obj.userid)){
      onlineUsers[obj.userid]=obj.username;
      onlineCount++;
    }
    io.emit('login',{onlineusers:onlineCount,onlineCount:onlineCount,user:obj});
    console.log(obj.username+'加入了聊天室');
  });

  //对message事件的监听
  socket.on('message',function(obj){
    io.emit('message',obj);
    console.log(obj.username+'说：'+obj.content);
  });

  //监听退出事件
  socket.on('disconnect',function(){
    if(onlineUsers.hasOwnProperty(socket.name)){
      var obj={userid:socket.name,username:onlineUsers[socket.name]};
      delete onlineUsers[socket.name];
      onlineCount--;
      io.emit('logout',{onlineUsers:onlineUsers,onlineCount:onlineCount,user:obj});
      console.log(obj.username+'退出了聊天室');
    }
  })
})

http.listen(5000, function(){
  console.log('listening on *:3000');
});


module.exports = app;
