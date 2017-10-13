const express = require('express')

const UserController = require('./controllers/user')

module.exports = (app) => {  
  const apiRoutes = express.Router()
  
  apiRoutes.post('/user/create', UserController.create)
  apiRoutes.post('/user/login', UserController.login)
  apiRoutes.post('/user/:userId', UserController.update)
  apiRoutes.get('/user', UserController.read)

  app.use('/api', apiRoutes)
}
