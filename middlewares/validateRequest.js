const jwt = require('jwt-simple')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongoose').Types.ObjectId

const CONFIG = require('../config/main')

const findUser = async (id) => {
  if (!ObjectId.isValid(id)) { return }
  try {
    const db = await MongoClient.connect(CONFIG.MONGODB_URI)
    return await db.collection('users').findOne({ _id: ObjectId(id) })
  } catch (error) {
    return
  }
}

const isAdmin = (user) => user.role === 'admin'
const requiresAdmin = (url) => url.indexOf('admin') >= 0

module.exports = async (req, res, next) => {

  if (!requiresAdmin(req.url)) {
    next()
    return
  }

  const token = (req.body && req.body.access_token)
    || (req.query && req.query.access_token)
    || req.headers['x-access-token']

  const key = (req.body && req.body.x_key)
    || (req.query && req.query.x_key)
    || req.headers['x-key']
    
  if (token || key) {

    try {
      const decoded = jwt.decode(token, CONFIG.VALIDATION_TOKEN)
      if (decoded.exp <= Date.now()) { return res.status(400).send('Token expired.') }

      const user = await findUser(key)

      if (user) {
        if (isAdmin(user) && requiresAdmin(req.url))  {
          next()
        } else {
          return res.status(403).send({ error: 'Not authorized.' })
        }
      } else {
        return res.status(401).send({ error: 'Invalid user.' })
      }
    } catch (error) {
      return res.status(500).send({ error: 'Something went wrong.' })
    }
  } else {
    return res.status(401).send({ error: 'Invalid token or key.' })
  }
}
