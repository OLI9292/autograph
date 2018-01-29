const db = require('../databases/accounts/index')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')
const bcrypt = require('bcrypt')
const SALT_WORK_FACTOR = 10

const userSchema = new Schema({
  classes: {
    type: [
      {
        id: Schema.Types.ObjectId,
        role: { type: String, enum: ['teacher', 'student'], default: 'student' }
      }
    ],
    default: []
  },
  isTeacher: { type: Boolean, default: false },
  gender: { type: String, enum: ['male', 'female'] },
  deviceId: String,
  email: String,
  facebookId: String,
  mobileIapUnlocked: { type: Boolean, default: false },
  ranking: { type: Number, default: 100 },
  firstName: { type: String, required: true, default: "" },
  lastName: String,
  optedIntoEmail: Boolean,
  password: String,
  roundsCompleted: { type: Number, required: true, default: 0 },
  role: String,
  school: Schema.Types.ObjectId,
  signUpMethod: {
    type: String, 
    enum: ['email', 'facebook', 'google'], 
    required: true
  },
  weeklyStarCount: { type: Number, default: 0 },
  wordListsCompleted: [Schema.Types.ObjectId],  
  words: {
    type: [
      {
        name: { type: String, required: true },
        seen: { type: Number, required: true, default: 1 },
        correct: { type: Number, required: true },
        experience: { type: Number, required: true, default: 1 },
        timeSpent: { type: Number, required: true, default: 0 }
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

userSchema.methods.fullName = function() {
  return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName
}

userSchema.methods.initials = function() {
  let initials = this.firstName.charAt(0)
  if (this.lastName) { initials += this.lastName.charAt(0) }
  return initials.toUpperCase()
}

userSchema.methods.firstNameLastInitial = function() {
  return this.lastName ? `${this.firstName} ${this.lastName.charAt(0).toUpperCase()}` : this.firstName
}

userSchema.methods.starCount = function() {
  return _.reduce(this.words, (acc, w) => acc + w.experience, 0)
}

userSchema.methods.schoolName = function(schools) {
  const school = _.find(schools, s => s._id.equals(this.school))
  return school ? school.name : '';
}

const User = db.model('User', userSchema)

module.exports = User
