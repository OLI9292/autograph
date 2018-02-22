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

const exploreMock = {
  words: [
    'carnivore',
    'herbivore',
    'omnivore'
  ],
  _id: '5a8d7e4aca19cf0020e8178e',
  name: 'astronomy',
  ladder: 1,
  progressBars: null,
  slug: 'astronomy-1',
  type: 'topic',
  ratios: {
    seen: 0.5,
    unseen: 0.25
  },
}

module.exports = {
  mock: primaryMock,
  exploreMock: exploreMock,
  mocks: [primaryMock, exploreMock]
}