const express = require('express')

const ClassController = require('./controllers/class')
const LeaderboardController = require('./controllers/leaderboard')
const LessonController = require('./controllers/lesson')
const LoginController = require('./controllers/login')
const SessionsController = require('./controllers/session')
const SchoolController = require('./controllers/school')
const QuestionsController = require('./controllers/question')
const UserController = require('./controllers/user')

module.exports = (app) => {  
  const apiRoutes = express.Router()
  
  apiRoutes.post('/user/create', UserController.create)
  apiRoutes.get('/user', UserController.read)
  apiRoutes.get('/user/:id', UserController.read)
  apiRoutes.post('/user/login', UserController.login)
  apiRoutes.patch('/user', UserController.update)

  // V2
  apiRoutes.post('/v2/login', LoginController.login)  

  // QUESTION ROUTES
  apiRoutes.get('/v2/auth/question', QuestionsController.read)
  apiRoutes.get('/v2/auth/question/:userId', QuestionsController.read)
  apiRoutes.post('/v2/auth/question', QuestionsController.create)

  // SESSION ROUTES
  apiRoutes.get('/v2/auth/session', SessionsController.read)
  apiRoutes.get('/v2/auth/session/:userId', SessionsController.read)

  // CLASS ROUTES
  apiRoutes.post('/v2/admin/class', ClassController.create) // ADMIN
  // TODO: - cleaner implementation
  apiRoutes.post('/v2/class/:id', ClassController.join)  
  apiRoutes.get('/v2/auth/class', ClassController.read)
  apiRoutes.get('/v2/auth/class/:id', ClassController.read)
  apiRoutes.get('/v2/auth/class/:id/students', ClassController.readStudents)
  apiRoutes.patch('/v2/admin/class/:id', ClassController.update) // ADMIN
  apiRoutes.delete('/v2/admin/class/:id', ClassController.delete) // ADMIN

  // LEADERBOARDS ROUTES
  apiRoutes.get('/v2/auth/leaderboard', LeaderboardController.read)

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
  apiRoutes.patch('/v2/admin/school/:id', SchoolController.update)
  apiRoutes.delete('/v2/admin/school/:id', SchoolController.delete)    

  // USER ROUTES
  apiRoutes.post('/v2/user', UserController.create)
  apiRoutes.get('/v2/auth/user', UserController.read) // ADMIN
  apiRoutes.get('/v2/auth/user/:id', UserController.read)
  apiRoutes.patch('/v2/admin/user/joinSchool', UserController.joinSchool)  
  // TODO: - cleaner implementation
  apiRoutes.patch('/v2/auth/user/stats', UserController.update)
  apiRoutes.patch('/v2/admin/user/resetStarCounts', UserController.resetStarCounts) // ADMIN
  apiRoutes.patch('/v2/auth/user/:id', UserController.update2)
  apiRoutes.patch('/v2/auth/user/joinClass', UserController.joinClass)
  apiRoutes.delete('/v2/admin/user/:id', UserController.delete) // ADMIN

  // JOBS
  apiRoutes.post('/v2/auth/clearSessions', require('./scripts/clearSessions').run) // ADMIN

  app.use('/api', apiRoutes)
}
