const express = require('express')

const UserController = require('./controllers/user')
const ClassController = require('./controllers/class')

module.exports = (app) => {  
  const apiRoutes = express.Router()
  
  apiRoutes.get('/user', UserController.read)
  apiRoutes.get('/user/:id', UserController.read)
  apiRoutes.delete('/user', UserController.delete)
  apiRoutes.patch('/user', UserController.update)
  apiRoutes.post('/user/create', UserController.create)
  apiRoutes.post('/user/login', UserController.login)

  apiRoutes.post('/class', ClassController.create)
  apiRoutes.post('/class/:id', ClassController.join)
  apiRoutes.get('/class', ClassController.read)
  apiRoutes.delete('/class', ClassController.delete)

  app.use('/api', apiRoutes)
}
