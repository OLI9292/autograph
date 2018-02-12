const _ = require('underscore')

const classData = require('./class')
const schoolData = require('./school')
const levelData = require('./level')

const ID_1 = '5a4aea2c8293e0305e30ebc6'
const ID_2 = '5a4aea2c8293e0305e30ebc7'
const ID_3 = '5a4aea2c8293e0305e30ebc9'

const primaryMock = {
  _id: ID_1,
  firstName: 'Willow',
  lastName: 'Glenn',
  signUpMethod: 'email',
  isTeacher: false,
  email: 'willow@gmail.com',
  password: 'super-secret-password',
  weeklyStarCount: 6,
  words: [
    { name: 'carnivore', correct: 0, seen: 0, timeSpent: 0, experience: 8 },
    { name: 'herbivore', correct: 0, seen: 0, timeSpent: 0, experience: 8 },
    { name: 'terrestrial', correct: 0, seen: 0, timeSpent: 0, experience: 8 },
    { name: 'terrace', correct: 0, seen: 0, timeSpent: 0, experience: 8 }
  ],
  levels: [
    {
      id: levelData.mock._id,
      progress: [
        {
          type: 'regular',
          stage: 1,
          bestScore: 10,
          bestAccuracy: 0.85,
          bestTime: 40
        }
      ]
    }
  ],
  school: schoolData.ID_1,
  classes: [{ id: classData.ID_1, role: 'student' }],
}

const secondaryMocks = [
  {
    _id: ID_2,
    firstName: 'Alejandro',
    lastName: 'Baptista',
    signUpMethod: 'email',
    isTeacher: false,
    email: 'alejandro@gmail.com',
    weeklyStarCount: 12,
    words: [
      { name: 'carnivore', correct: 0, seen: 0, timeSpent: 0, experience: 10 },
      { name: 'herbivore', correct: 0, seen: 0, timeSpent: 0, experience: 10 }
    ],
    school: schoolData.ID_1,
    classes: [{ id: classData.ID_1, role: 'student' }]
  },
  {
    _id: ID_3,
    firstName: 'Akiva',
    lastName: 'S',
    signUpMethod: 'email',
    isTeacher: true,
    email: 'akiva@gmail.com',
    school: schoolData.ID_1,
    classes: [{ id: classData.ID_1, role: 'teacher' }]    
  }
]

const invalidMocks = [
  {
    firstName: 'Joe',
    lastName: 'Shmoe'
  }
]

module.exports = {
  mock: primaryMock,
  teacherMock: secondaryMocks[1],
  mocks: _.union([primaryMock], secondaryMocks),
  invalidMocks: invalidMocks,
  ID_1: ID_1,
  ID_2: ID_2
}
