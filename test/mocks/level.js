const ID_1 = '5a4aea2c8293e0305e30ebd1'
const _ = require('underscore')

const demos = require('../../lib/demoLevels')
const demoId = _.keys(demos)[0]

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
  type: 'root'
}

const secondaryMocks = [
  {
    _id: demoId,
    isDemo: true,
    ladder: 2,
    words: _.pluck(demos[demoId], 'word'),
    progressBars: 2,
    slug: 'vor',
    ratios: {
      seen: 0,
      unseen: 0
    },
    name: 'omni',
    type: 'root'    
  }
]

module.exports = {
  mock: primaryMock,
  mock2: secondaryMocks,
  mocks: secondaryMocks.concat(primaryMock)
}