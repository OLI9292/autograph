const express = require('express')

const UserController = require('./controllers/user')

module.exports = (app) => {  
  const apiRoutes = express.Router()
  
  apiRoutes.post('/user/create', UserController.create)
  apiRoutes.post('/user/login', UserController.login)
  apiRoutes.get('/user', UserController.read)
  apiRoutes.get('/user/:id', UserController.read)
  apiRoutes.patch('/user', UserController.update)
  apiRoutes.delete('/user', UserController.delete)

  app.use('/api', apiRoutes)
}
