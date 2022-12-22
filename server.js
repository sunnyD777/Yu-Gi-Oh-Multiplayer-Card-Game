const express = require("express")
const mongoose= require("mongoose")
const session = require("express-session")
const passport = require("passport")
var socket = require("socket.io");

const app = express()

const dbURI = require("./config/keys").dbURI

mongoose.connect(dbURI, {useNewUrlParser: true })
.then(()=> console.log("Database succesfully connected!"))
.catch(err => console.log(err));

app.set('view engine', 'ejs');

app.use(express.static('public'));

// Express body parser
app.use(express.urlencoded({ extended: true }) );

app.use(session({
    secret: 'kjdsjdskajd',
    resave: true,
    saveUninitialized: true,
  }))

app.use(passport.initialize());
app.use(passport.session());

require("./config/passport-setup")(passport)

const PORT = process.env.PORT || 3000
var server = app.listen(PORT,console.log("Server is running on localhost:"+PORT+"..."))

app.use("/",require("./routes/userRoutes"))
app.use("/game", require("./routes/gameRoutes"))

var io = socket(server)
var lobbyHandler = require("./config/lobbySocket-handler")
var gameHandler = require("./config/gameSocket-handler")
var deckHandler = require("./config/deckSocket-handler")

io.of("/game/lobby").on('connection', function(socket){
     lobbyHandler(socket)
});
io.of("/game/room").on('connection', function(socket){
  gameHandler(socket)
});
io.of("/game/deck").on('connection', function(socket){
  deckHandler(socket)
});