const mongoose = require('mongoose')
const _ = require('underscore')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const TYPES = ['welcome']

const message = (email, type, name) => ({
  welcome: {
    to: email,
    from: 'ben@playwordcraft.com',
    subject: 'Welcome to Wordcraft',
    text: `hi ${name}, we\'r going to have lots of fun together. love, ben`,
    html: `hi ${name}, we\'r going to have lots of <strong>fun</strong> together. love, ben`
  }
}[type])


exports.send = (email, type, name, cb) => {
  const msg = message(email, type, name)
  // Don't email while testing  
  if (process.env.NODE_ENV === 'test') { cb(msg); return; }

  sgMail.send(msg)
    .then(() => cb(msg))
    .catch(e => cb({ error: e.message })) 
}

exports.post = (req, res, next) => {
  const { email, type, name } = req.query
  if (email && name && _.contains(TYPES, type)) {
    exports.send(email, type, name, result => res.status(result.error ? 422 : 200).send(result))
  } else {
    return res.status(422).send({ error: 'Bad input.' })
  }
}
