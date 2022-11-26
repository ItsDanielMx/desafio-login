const express = require('express')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
const UserModel = require('./models/User.model')

const app = express()
const PORT = process.env.PORT || 8080;
const mongoUri = 'mongodb://localhost:27017/desafio';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,   
  useUnifiedTopology: true
}).then( res => console.log('Base de datos conectada!!'))

const store = new MongoDBSession({
  uri: mongoUri,
  collection: 'sessions'
})

app.use(session({    
  key: 'user_id',
  secret: 'D4n1el',
  resave: false,
  saveUninitialized: false,  
  store: store,
  cookie: { maxAge: 60000 }
}))

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

const isAuth = (req, res, next) => {         

  if(!req.session.user) {
    res.redirect('/login')
  }else{    
    next();
  }
}


app.get('/', (req, res) => {     
  res.redirect('/login');  
})

app.get('/dashboard', isAuth, (req, res) => {  
  res.render('dashboard', {user: req.session.user.username})
})

app.get('/register', (req, res) => {  
  res.render('register',{msg_error:''});
})

app.get('/login', (req, res) => {  
  res.render('login', {msg_error: ''});   
})

app.post('/login', async (req, res) => {

  const { email, password } = req.body;

  const user = await UserModel.findOne({ email })

  if(!user) {
    return res.render('login', {msg_error: 'Email no registrado'})
  }

  const passCoincide = await bcrypt.compare(password, user.password)

  if(!passCoincide){
    return res.render('login', {msg_error: 'Contraseña incorrecta'})
  }

  req.session.user = user;
  res.render('dashboard', {user: user.username})
})

app.post('/register', async (req, res) => {  

  let { username, email, password } = req.body;

  try {
    let user = await UserModel.findOne({ email })
    
    if(user){
      return res.render('register', {msg_error: 'Email ya existe'});
    }
  
    user = await UserModel.findOne({ username })

    if(user){
      return res.render('register', {msg_error: 'Usuario ya existe'});
    }

    let hashedPassword = await bcrypt.hash(password, 12);

    user = await UserModel.create({ 
      username, 
      email, 
      password: hashedPassword
    });
    
    await user.save();
    res.render('login', {msg_error:''})
  } catch (error) {
    return res.render('register', {msg_error: error.message});
  }
  
})

app.post('/logout', (req, res) => {
  req.session.destroy( (err) => {
    if(err) throw err;
    res.redirect('/login');
  })
})

app.listen(PORT, () => console.log(`Server Up on port ${PORT}`))