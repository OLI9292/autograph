const jwt = require('jwt-simple')
const mongoose = require('mongoose')

const CONFIG = require('../config/main')
const User = require('../models/user')

const expiresIn = (numDays) => {
  var dateObj = new Date()
  return dateObj.setDate(dateObj.getDate() + numDays)
}

const genToken = (user) => {
  const expires = expiresIn(7)
  const token = jwt.encode({ exp: expires }, process.env.VALIDATION_TOKEN)
  return { user: user, expires: expires, token: token }
}

exports.login = async (req, res, next) => {
  const [email, password] = [req.body.email, req.body.password]

  if (!email || !password) { return res.status(422).send({ error: 'Email & password required.' }) }

  try {
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) { return res.status(422).send({ error: 'Email not found.' }) }
    
    user.comparePassword(password, function(error, isMatch) {
      if (error) { return res.status(422).send({ error: 'Something went wrong.' }) }

      return isMatch
        ? res.status(200).send(genToken(user))
        : res.status(422).send({ error: 'Incorrect password.' })
    })

  } catch (error) {
    return res.status(422).send({ error: 'Something went wrong.' })
  }
}
