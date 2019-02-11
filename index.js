var app = require('express')();
var formidableMiddleware = require('express-formidable');

var ultimasTareas = [];
var usuarios = [];
var usuariosChat = [];
var miSocketTest = "";

app.use(express.static(__dirname + "/public"));
var port = process.env.PORT || 3000;
var server = app.listen(port);
var io = require("socket.io").listen(server);

// Settings for CORS
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');

  // Request methods you wish to allow
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.header('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

// TEST
app.use(formidableMiddleware({
  encoding: 'utf-8',
  uploadDir: './uploads',
  multiples: true, // req.files to be arrays of files
}));
app.post('/upload', (req, res) => {
  io.sockets.socket(this.socketid).emit('test',req.files);
  res.send(req.files)
})

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  miSocketTest = socket;

  socket.on('tarea', function (tareasServer) {
    ultimasTareas = tareasServer;
    io.emit('tarea', tareasServer);
  });

  socket.on('nuevaTarea', function (nuevaTareaServer) {
    ultimasTareas.push(nuevaTareaServer);
    io.emit('tarea', ultimasTareas);
    io.emit('nuevaTarea', nuevaTareaServer);
  });

  socket.on('borrar', function (indice) {
    io.emit('borrar', ultimasTareas[indice]);
    ultimasTareas.splice(indice, 1);
    io.emit('tarea', ultimasTareas);
  });

  socket.on('usuario', function (usuario) {
    if (usuarios.indexOf(usuario) == -1) {
      usuarios.push(usuario);
      usuariosChat.push({
        id: "usuario" + usuario,
        name: usuario,
        imageUrl: ''
      })
      io.emit('participantes', JSON.stringify(usuariosChat));
      io.emit('tarea', ultimasTareas);
      io.emit('usuario', usuario);
      socket.on('disconnect', function () {
        io.emit('desconexion', usuario);
        usuarios.splice(usuarios.indexOf(usuario), 1);
        usuariosChat.splice(usuariosChat.indexOf(usuario), 1);
      });
    } else {
      io.emit('errorLogin')
    }
  });

  socket.on("mensajeChat", function (mensaje) {
    socket.broadcast.emit('mensajesChat', mensaje);
  });
});
http.listen(3000, function () {
  console.log('listening on *:3000');
});