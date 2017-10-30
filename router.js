const express = require('express')

const UserController = require('./controllers/user')
const ClassController = require('./controllers/class')
const LessonController = require('./controllers/lesson')

module.exports = (app) => {  
  const apiRoutes = express.Router()
  
  apiRoutes.get('/user', UserController.read)
  apiRoutes.get('/user/:id', UserController.read)
  apiRoutes.delete('/user', UserController.delete)
  apiRoutes.patch('/user', UserController.update)
  apiRoutes.post('/user/create', UserController.create)
  apiRoutes.post('/user/login', UserController.login)
  apiRoutes.post('/user/:id/lesson', LessonController.create)

  apiRoutes.get('/class', ClassController.read)
  apiRoutes.get('/class/:id', ClassController.read)
  apiRoutes.get('/class/:id/students', ClassController.readStudents)
  apiRoutes.delete('/class', ClassController.deleteAll)
  apiRoutes.delete('/class/:id', ClassController.delete)
  apiRoutes.post('/class', ClassController.create)
  apiRoutes.post('/class/:id', ClassController.join)

  app.use('/api', apiRoutes)
}
