const express = require('express')

const UserController = require('./controllers/user')

module.exports = (app) => {  
  const apiRoutes = express.Router()
  
  apiRoutes.post('/user/create', UserController.create)
  apiRoutes.post('/user/login', UserController.login)

  app.use('/api', apiRoutes)
}
