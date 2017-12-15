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
  apiRoutes.delete('/class/:id', ClassController.delete)
  apiRoutes.post('/class', ClassController.create)
  apiRoutes.post('/class/:id', ClassController.join)

  // LESSON ROUTES
  apiRoutes.post('/lesson', LessonController.create)
  apiRoutes.get('/lesson', LessonController.read)
  apiRoutes.get('/lesson/:id', LessonController.read)
  apiRoutes.patch('/lesson/:id', LessonController.update)
  apiRoutes.delete('/lesson/:id', LessonController.delete)

  // V2

  // CLASS ROUTES
  apiRoutes.post('/v2/admin/class', ClassController.create)
  apiRoutes.get('/v2/auth/class', ClassController.read)
  apiRoutes.get('/v2/auth/class/:id', ClassController.read)
  apiRoutes.get('/v2/auth/class/:id/students', ClassController.readStudents)  
  apiRoutes.delete('/v2/admin/class/:id', ClassController.delete)

  //apiRoutes.post('/class/:id', ClassController.join)

  // LESSON ROUTES
  apiRoutes.post('/v2/admin/lesson', LessonController.create)
  apiRoutes.get('/v2/lesson', LessonController.read)
  apiRoutes.get('/v2/lesson/:id', LessonController.read)
  apiRoutes.patch('/v2/admin/lesson/:id', LessonController.update)
  apiRoutes.delete('/v2/admin/lesson/:id', LessonController.delete)  

  // USER ROUTES
  apiRoutes.post('/v2/user', UserController.create)
  apiRoutes.get('/v2/admin/user', UserController.read) // ADMIN
  apiRoutes.get('/v2/auth/user/:id', UserController.read) // AUTH
  apiRoutes.patch('/v2/auth/user/:id', UserController.update2) // AUTH
  apiRoutes.delete('/v2/admin/user/:id', UserController.delete) // ADMIN

  //apiRoutes.patch('/v2/auth/user', UserController.update) // AUTH
  //apiRoutes.post('/v2/user/login', UserController.login)
  //apiRoutes.post('/v2/auth/user/:id/lesson', LessonController.create) // AUTH  

  app.use('/api', apiRoutes)
}
