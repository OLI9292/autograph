const ID_1 = '5a4aea2c8293e0305e30ebc0'

const rootData = require('./root')

const primaryMock = {
  _id: ID_1,
  value: 'hypnotism',
  obscurity: 3,
  categories: ['esl', 'humanity'],
  definition: [
    { value: 'the action of putting someone in a state of artificial ', isRoot: false },
    { value: 'sleep', isRoot: true }
  ],
  components: [
    { componentType: 'root', definition: 'sleep', value: 'hypn' },
    { componentType: 'separator', value: 'o' },
    { componentType: null, value: 'tism' }
  ],
  roots: [rootData.hypn_ID, rootData.ism_ID]
}

const secondaryMocks = [
  {
    value: 'carnivore',
    obscurity: 5,
    definition: [
      { value: 'an animal that ', isRoot: false },
      { value: 'eat', isRoot: true },
      { value: 's ', isRoot: false },
      { value: 'meat', isRoot: true }
    ],
    components: [
      { componentType: 'root', definition: 'meat', value: 'carn' },
      { componentType: null, value: 'i' },
      { componentType: 'root', definition: 'eat', value: 'vor' },
      { componentType: null, value: 'e' }
    ],
    roots: [rootData.carn_ID, rootData.vor_ID]
  },
  {
    value: 'herbivore',
    obscurity: 5,
    definition: [
      { value: 'test definition', isRoot: false }
    ],
    components: [
      { componentType: 'root', definition: 'test', value: 'test-root' }
    ]
  },
  {
    value: 'aquifier',
    obscurity: 5,
    definition: [
      { value: 'test definition', isRoot: false }
    ],
    components: [
      { componentType: 'root', definition: 'test', value: 'test-root' }
    ]
  },
  {
    value: 'monogram',
    obscurity: 5,
    definition: [
      { value: 'test definition', isRoot: false }
    ],
    components: [
      { componentType: 'root', definition: 'test', value: 'test-root' }
    ]
  },
  {
    value: 'autograph',
    obscurity: 5,
    definition: [
      { value: 'test definition', isRoot: false }
    ],
    components: [
      { componentType: 'root', definition: 'test', value: 'test-root' }
    ]
  },
  {
    value: 'terrace',
    obscurity: 5,
    definition: [
      { value: 'test definition', isRoot: false }
    ],
    components: [
      { componentType: 'root', definition: 'test', value: 'test-root' }
    ]
  },
  {
    value: 'omnivore',
    obscurity: 5,
    definition: [
      { value: 'test definition', isRoot: false }
    ],
    components: [
      { componentType: 'root', definition: 'test', value: 'test-root' }
    ]
  }          
]

module.exports = {
  mock: primaryMock,
  mocks: secondaryMocks.concat(primaryMock)
}
