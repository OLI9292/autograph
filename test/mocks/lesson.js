const ID_1 = '5a4aea2c8293e0305e30ebc3'

const primaryMock = {
  _id: ID_1,
  name: 'Chew On This',
  filenames: ['chew_on_this.txt'],
  updatedOn: '1513333986',
  questions: [
    { 
      word: 'carnivore',
      context: 'A carnivore chews on meat.',
      related: ['herbivore']
    },
    { 
      word: 'herbivore',
      context: 'A herbivore chews on grass.'
    }
  ]
}

module.exports = {
  mock: primaryMock,
  mocks: [primaryMock],
}
