const express = require('express')

const ClassController = require('./controllers/class')
const LessonController = require('./controllers/lesson')
const LoginController = require('./controllers/login')
const SchoolController = require('./controllers/school')
const UserController = require('./controllers/user')

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

  apiRoutes.post('/v2/login', LoginController.login)  

  // CLASS ROUTES
  apiRoutes.post('/v2/admin/class', ClassController.create) // ADMIN
  // TODO: - cleaner implementation
  apiRoutes.post('/v2/class/:id', ClassController.join)  
  apiRoutes.get('/v2/auth/class', ClassController.read) // AUTH
  apiRoutes.get('/v2/auth/class/:id', ClassController.read) // AUTH
  apiRoutes.get('/v2/auth/class/:id/students', ClassController.readStudents) // AUTH
  apiRoutes.patch('/v2/admin/class/:id', ClassController.update) // ADMIN
  apiRoutes.delete('/v2/admin/class/:id', ClassController.delete) // ADMIN

  // LESSON ROUTES
  apiRoutes.post('/v2/admin/lesson', LessonController.create)
  apiRoutes.get('/v2/lesson', LessonController.read)
  apiRoutes.get('/v2/lesson/:id', LessonController.read)
  apiRoutes.patch('/v2/admin/lesson/:id', LessonController.update)
  apiRoutes.delete('/v2/admin/lesson/:id', LessonController.delete)  

  // SCHOOL ROUTES
  apiRoutes.post('/v2/admin/school', SchoolController.create)
  apiRoutes.get('/v2/admin/school', SchoolController.read)
  apiRoutes.get('/v2/admin/school/:id', SchoolController.read)
  apiRoutes.get('/v2/auth/school/:id/leaderboards', SchoolController.leaderboards) // AUTH  
  apiRoutes.patch('/v2/admin/school/:id', SchoolController.update)
  apiRoutes.delete('/v2/admin/school/:id', SchoolController.delete)    

  // USER ROUTES
  apiRoutes.post('/v2/user', UserController.create)
  apiRoutes.get('/v2/auth/user', UserController.read) // ADMIN
  apiRoutes.get('/v2/auth/user/:id', UserController.read) // AUTH
  apiRoutes.patch('/v2/admin/user/joinSchool', UserController.joinSchool)  
  // TODO: - cleaner implementation
  apiRoutes.patch('/v2/auth/user/stats', UserController.update) // AUTH
  apiRoutes.patch('/v2/auth/user/:id', UserController.update2) // AUTH
  apiRoutes.patch('/v2/auth/user/joinClass', UserController.joinClass) // AUTH
  apiRoutes.delete('/v2/admin/user/:id', UserController.delete) // ADMIN

  app.use('/api', apiRoutes)
}
