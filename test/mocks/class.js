const mongoose = require('mongoose')

module.exports = {
  teacher: mongoose.Types.ObjectId(),
  name: 'TAG',
  students: [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()]
}
