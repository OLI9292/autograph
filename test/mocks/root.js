const carn_ID = '5a4aea2c8293e0305e30ebe8'
const vor_ID = '5a4aea2c8293e0305e30ebe9'
const hypn_ID = '5a4aea2c8293e0305e30ebe4'
const ism_ID = '5a4aea2c8293e0305e30ebe3'
const cosm_ID = '5a2529e6dbcc2700215a0329'

const primaryMock = {
  _id: carn_ID,
  value: 'carn',
  definitions: ['meat']
}

const secondaryMocks = [
  {
    value: 'herb',
    definitions: ['plant']
  },
  {
    _id: vor_ID,
    value: 'vor',
    definitions: ['eat']
  },
  {
    value: 'mono',
    definitions: ['one']
  },
  {
    value: 'bi',
    definitions: ['two']
  },
  {
    value: 'tri',
    definitions: ['three']
  },
  {
    value: 'quad',
    definitions: ['for']
  },
  {
    value: 'crypt',
    definitions: ['secret']
  },
  {
    _id: hypn_ID,
    value: 'hypn',
    definitions: ['sleep']
  },
  {
    definitions: [
      'universe',
      'beautiful',
      'beauty'
    ],
    _id: cosm_ID,
    value: 'cosm',
  }  
]

module.exports = {
  mock: primaryMock,
  mocks: secondaryMocks.concat(primaryMock),
  carn_ID: carn_ID,
  vor_ID: vor_ID,
  ism_ID: ism_ID,
  hypn_ID: hypn_ID,
  cosm_ID: cosm_ID
}
