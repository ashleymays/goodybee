const express = require('express')
const indexRouter = require('./src/routes/index.route')
const recipesRouter = require('./src/routes/recipes.route')
const userRouter = require('./src/routes/user.route')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const config = require('./src/configs/credentials.config')
const passport = require('./src/configs/passport.config')
const mongoose = require('mongoose')
const flash = require('express-flash')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const app = express()

app.use(flash())
app.use(session({
    secret: config.sessionSecret,
    store: MongoStore.create({ mongoUrl: config.connectionString }),
    saveUninitialized: false,
    resave: false
}))
app.use('/public', express.static(__dirname + '/src/public'))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', __dirname + '/src/views')
app.set('view engine', 'ejs')



// Connect to database
mongoose.connect(config.connectionString, { dbName: config.dbName, useNewUrlParser: true })
    .then(_ => console.log('Connected to database'))
    .catch(err => console.error(err))
mongoose.connection.on('error', err => console.error(err))
mongoose.connection.on('disconnected', _ => console.log('Database disconnected'))



// Routes
app.use('/', indexRouter)
app.use('/recipes', recipesRouter)
app.use('/user', userRouter)


let PORT = process.env.PORT || 3500
app.listen(PORT, _ => {
    console.log(`Listening on port ${PORT}`)
})