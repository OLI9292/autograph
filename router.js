const express = require('express')

const UserController = require('./controllers/user')
const ClassController = require('./controllers/class')
const LessonController = require('./controllers/lesson')

module.exports = (app) => {  
  const apiRoutes = express.Router()
  
  // USER ROUTES
  apiRoutes.get('/user', UserController.read)
  apiRoutes.get('/user/:id', UserController.read)
  apiRoutes.delete('/user', UserController.delete)
  apiRoutes.patch('/user', UserController.update)
  apiRoutes.patch('/user/:id', UserController.update2)
  apiRoutes.post('/user/create', UserController.create)
  apiRoutes.post('/user/login', UserController.login)
  apiRoutes.post('/user/:id/lesson', LessonController.create)

  // CLASS ROUTES
  apiRoutes.get('/class', ClassController.read)
  apiRoutes.get('/class/:id', ClassController.read)
  apiRoutes.get('/class/:id/students', ClassController.readStudents)
  apiRoutes.delete('/class', ClassController.deleteAll)
  apiRoutes.delete('/class/:id', ClassController.delete)
  apiRoutes.post('/class', ClassController.create)
  apiRoutes.post('/class/:id', ClassController.join)

  // LESSON ROUTES
  apiRoutes.post('/lesson', LessonController.create)
  apiRoutes.get('/lesson', LessonController.read)
  apiRoutes.get('/lesson/:id', LessonController.read)
  apiRoutes.patch('/lesson/:id', LessonController.update)
  apiRoutes.delete('/lesson/:id', LessonController.delete)

  app.use('/api', apiRoutes)
}
