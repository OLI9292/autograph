require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const router = require('./router')

const CONFIG = require('./config/main')

mongoose.Promise = global.Promise
mongoose.connect(CONFIG.MONGODB_URI, { useMongoClient: true, promiseLibrary: global.Promise })

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(logger('dev'))

app.use((req, res, next) => {  
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials')
  res.header('Access-Control-Allow-Credentials', 'true')
  next()
})

// Don't validate requests during testing
if (process.env.NODE_ENV === 'production') {
  app.all('/api/v2/*', [require('./middlewares/validateRequest')])  
}

app.listen(CONFIG.PORT, () => console.log(`App listening on port ${CONFIG.PORT}`))

router(app)

// For testing
module.exports = app
