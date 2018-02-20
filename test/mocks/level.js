const ID_1 = '5a4aea2c8293e0305e30ebd1'
const ID_2 = '5a4aea2c8293e0305e30ebx1'
const _ = require('underscore')


const primaryMock = {
  _id: ID_1,
  ladder: 1,
  words: ['carnivore', 'herbivore', 'omnivore', 'voracious', 'isohyet', 'monopoly', 'pteradactyol', 'something', 'nothing', 'happy', 'horse'],
  progressBars: 3,
  slug: 'vor',
  ratios: {
    seen: 0.5,
    unseen: 0.7
  },
  name: 'vor',
  type: 'general'
}

module.exports = {
  mock: primaryMock,
  mocks: [primaryMock]
}