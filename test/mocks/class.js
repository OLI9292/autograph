const mongoose = require('mongoose')

const schoolData = require('./school')
const ID_1 = '5a4aea2c8293e0305e30ebc5'

const primaryMock = {
  _id: ID_1,
  name: 'Super Cool Class',
  school: schoolData.ID_1,
  teacher: ID_1
}

module.exports = {
  mock: primaryMock,
  mocks: [primaryMock],   
  ID_1: ID_1
}
