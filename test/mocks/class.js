const mongoose = require('mongoose')

module.exports = {
  teacher: mongoose.Types.ObjectId(),
  name: 'TAG',
  school: '5a3d3b8f2363a400217d29eb',
  students: [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()]
}
