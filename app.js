const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const UserModel = require("./models/User.model");
const {fork} = require('child_process')
const yargs = require('yargs')
const cpus = require('os')
const loginRouter = require('./routes/login.router')
const registerRouter = require('./routes/register.router')
const logoutRouter = require('./routes/logout.router')
const procesosRouter = require('./routes/procesos.router')

require('dotenv').config({path:'./config/passwords.env'})
const app = express();
const { PORT } = yargs(process.argv.slice(2)).default({PORT: 8080}).argv
const mongoUri = process.env.MONGOURI;

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => console.log("Base de datos conectada!!"));

const store = new MongoDBSession({
  uri: mongoUri,
  collection: "sessions",
});

app.use(
  session({
    key: "user_id",
    secret: "D4n1el",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { maxAge: 60000 },
  })
);

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/logout', logoutRouter)
app.use('/info', procesosRouter)

const isAuth = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/dashboard", isAuth, (req, res) => {
  res.render("dashboard", { user: req.session.user.username });
});

app.get("/info", (req, res) => {
  res.render("info" );
});

app.get("/register", (req, res) => {
  res.render("register", { msg_error: "" });
});

app.get("/login", (req, res) => {
  res.render("login", { msg_error: "" });
});

app.get('/api/randoms', (req, res) => {
  const amount = req.query.amount ? parseInt(req.query.amount) : 100000000
  const child = fork('./calculo.js')

  child.on('message', msg => {
    if(msg === 'ready'){
        console.log('Iniciando proceso hijo')
        child.send({amount})
    }
    else {
      console.log('Proceso finalizado')
      res.render('calculo', {
          result: msg.result,
          length: 1000
      })
      }
  })
})

app.listen(PORT, () => console.log(`Server Up on port ${PORT}`));
