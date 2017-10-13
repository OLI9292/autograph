const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

const userSchema = new Schema({
  firstName: { type: String, required: true, default: "" },
  lastName: { type: String, required: true, default: "" },
  email: { type: String, index: { unique: true } },
  optedIntoEmail: Boolean,
  roundsCompleted: { type: Number, required: true, default: 0 },
  facebookId: String,
  password: String,
  classes: [Schema.Types.ObjectId],
  words: {
    type: [
      {
        name: { type: String, required: true, unique: true },
        seen: { type: Number, required: true, default: 1 },
        correct: { type: Number, required: true },
        experience: { type: Number, required: true, default: 1 },
        totalTime: { type: Number, required: true, default: 0 } // total seconds spent w/ word
      }
    ],
    default: []
  },
  categories: {
    type: [
      {
        name: { type: String, required: true, unique: true },
        progress: { type: Number, required: true, default: 0 }
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
