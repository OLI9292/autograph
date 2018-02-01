const ID_1 = '5a4aea2c8293e0305e30ebf1'

const primaryMock = {
  _id: ID_1,
  name: 'Beginner 1',
  category: 'Everything',
  updatedOn: '1513171726',
  questions: [{ word: 'hypnotism', difficulty: 1 }],
  isStudy: true
}

module.exports = {
  mock: primaryMock,
  mocks: [primaryMock]
}
