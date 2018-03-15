const jwt = require('jwt-simple')
const User = require('../models/user')
const CONFIG = require('../config/main')

const isAdmin = (user) => user.role === 'admin'
const requiresAdmin = (url) => url.indexOf('admin') >= 0

module.exports = async (req, res, next) => {

  const token = (req.body && req.body.access_token)
    || (req.query && req.query.access_token)
    || req.headers['access-token']

  const userId = (req.body && req.body.x_key)
    || (req.query && req.query.x_key)
    || req.headers['key']

  const sessionId = (req.body && req.body.x_session)
    || (req.query && req.query.x_session)
    || req.headers['session']

  if (!requiresAdmin(req.url)) {
    req.sessionId = sessionId
    req.userId = userId
    next()
    return
  }        
    
  if (token || userId) {
    try {
      const decoded = jwt.decode(token, CONFIG.VALIDATION_TOKEN)
      if (decoded.exp <= Date.now()) { return res.status(400).send('Token expired.') }
      
      const user = await User.findById(userId)
      
      if (user) {
        if (isAdmin(user) && requiresAdmin(req.url))  {
          next()
        } else {
          return res.status(403).send({ error: 'Not authorized.' })
        }           
      } else {  
        return res.status(401).send({ error: user.error })
      }
    } catch (error) {
      return res.status(500).send({ error: 'Something went wrong.' })
    }
  } else {
    return res.status(401).send({ error: 'Invalid token or key.' })
  }
}
