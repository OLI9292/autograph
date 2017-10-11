const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, index: { unique: true } },
  password: String,
  classes: [Schema.Types.ObjectId],
  words: {
    type: [
      {
        name: { type: String, required: true, unique: true },
        seen: { type: Number, required: true },
        correct: { type: Number, required: true },
        experience: { type: Number, required: true },
        totalTime: { type: Number, required: true } // total seconds spent w/ word
      }
    ],
    default: []
  }
})

userSchema.pre('save', function(next) {
  const user = this;

  if (!user.isModified('password')) {
    return next()
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) {
      return next(err)
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err)
      }

      user.password = hash
      next()
    })
  })
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) {
      return cb(err)
    }
    
    cb(null, isMatch)
  })
}

const User = mongoose.model('User', userSchema)

module.exports = User
