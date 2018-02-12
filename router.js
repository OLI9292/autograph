const express = require('express')

const ClassController = require('./controllers/class')
const LeaderboardController = require('./controllers/leaderboard')
const LessonController = require('./controllers/lesson')
const LoginController = require('./controllers/login')
const SessionsController = require('./controllers/session')
const SchoolController = require('./controllers/school')
const LoggedQuestionsController = require('./controllers/loggedQuestion')
const UserController = require('./controllers/user')

const LevelController = require('./controllers/level')
const FactoidController = require('./controllers/factoid')
const WordController = require('./controllers/word')
const RootController = require('./controllers/root')
const QuestionController = require('./controllers/question')
const TextController = require('./controllers/text')
const WordListController = require('./controllers/wordList')

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
  apiRoutes.get('/v2/auth/question', LoggedQuestionsController.read)
  apiRoutes.get('/v2/auth/question/:userId', LoggedQuestionsController.read)
  apiRoutes.post('/v2/auth/question', LoggedQuestionsController.create)

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
  apiRoutes.patch('/v2/auth/user/:id/completedLevel', UserController.completedLevel)
  apiRoutes.patch('/v2/admin/user/resetStarCounts', UserController.resetStarCounts) // ADMIN
  apiRoutes.patch('/v2/auth/user/:id', UserController.update2)
  apiRoutes.patch('/v2/auth/user/joinClass', UserController.joinClass)
  apiRoutes.delete('/v2/admin/user/:id', UserController.delete) // ADMIN

  // JOBS
  apiRoutes.post('/v2/auth/clearSessions', require('./scripts/clearSessions').run) // ADMIN

  // FACTOID
  apiRoutes.post('/v2/admin/factoids', FactoidController.create) // Admin only
  apiRoutes.get('/v2/factoids', FactoidController.read)
  apiRoutes.patch('/v2/admin/factoids/:id', FactoidController.update) // Admin only
  apiRoutes.delete('/v2/admin/factoids/:id', FactoidController.delete) // Admin only

  //
  // ISOHYET
  //

  // LEVEL
  apiRoutes.post('/v2/level', LevelController.create)
  apiRoutes.get('/v2/level', LevelController.read)
  apiRoutes.get('/v2/level/:id', LevelController.read)
  apiRoutes.patch('/v2/level/:id', LevelController.update)
  apiRoutes.delete('/v2/level/:id', LevelController.delete)

  // WORD
  apiRoutes.post('/v2/admin/words', WordController.create) // Admin only
  apiRoutes.get('/v2/words', WordController.read)
  apiRoutes.get('/v2/words/:id', WordController.read)
  apiRoutes.get('/v2/related-words', WordController.relatedWords) 
  apiRoutes.patch('/v2/admin/words/:id', WordController.update) // Admin only
  apiRoutes.delete('/v2/admin/words/:id', WordController.delete) // Admin only

  // ROOT
  apiRoutes.get('/v2/roots', RootController.read)
  apiRoutes.get('/v2/roots/:value', RootController.readOne)

  // QUESTION
  apiRoutes.get('/v2/question', QuestionController.read)

  // TEXT
  apiRoutes.post('/v2/texts/parse', TextController.parse) // Admin only

  // WORD LIST
  apiRoutes.post('/v2/admin/word-lists', WordListController.create) // Admin only
  apiRoutes.get('/v2/word-lists', WordListController.read)
  apiRoutes.get('/v2/word-lists/:id', WordListController.read)
  apiRoutes.patch('/v2/admin/word-lists/:id', WordListController.update) // Admin only
  apiRoutes.delete('/v2/admin/word-lists/:id', WordListController.delete) // Admin only  

  app.use('/api', apiRoutes)
}
