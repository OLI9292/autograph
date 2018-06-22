const _ = require("underscore");
const mongoose = require("mongoose");

const schoolData = require("./school");
const levelData = require("./level");

const ID_1 = "5a4aea2c8293e0305e30ebc6";
const ID_2 = "5a4aea2c8293e0305e30ebc7";
const ID_3 = "5a4aea2c8293e0305e30ebc9";

const primaryMock = {
  _id: ID_1,
  friends: [],
  username: "willow-g",
  firstName: "Willow",
  lastName: "Glenn",
  signUpMethod: "email",
  isTeacher: false,
  email: "willow@gmail.com",
  password: "super-secret-password",
  weeklyStarCount: 6,
  totalStarCount: 32,
  words: [
    { name: "carnivore", correct: 0, seen: 0, timeSpent: 0, experience: 8 },
    { name: "herbivore", correct: 0, seen: 0, timeSpent: 0, experience: 8 },
    { name: "terrestrial", correct: 0, seen: 0, timeSpent: 0, experience: 8 },
    { name: "terrace", correct: 0, seen: 0, timeSpent: 0, experience: 8 }
  ],
  levels: [
    {
      id: levelData.mock._id,
      progress: [
        {
          type: "train",
          stage: 1,
          bestScore: 10,
          bestAccuracy: 0.85,
          bestTime: 40
        }
      ]
    }
  ],
  school: schoolData.ID_1,
  classes: [{ id: "5a4aea2c8293e0305e30ebc5", role: "student" }],
  question2History: [
    { id: mongoose.Types.ObjectId(), perfect: false },
    { id: mongoose.Types.ObjectId(), perfect: false }
  ]
};

const secondaryMocks = [
  {
    _id: ID_2,
    friends: [],
    username: "alejandro-b",
    firstName: "Alejandro",
    lastName: "Baptista",
    signUpMethod: "email",
    isTeacher: false,
    email: "alejandro@gmail.com",
    weeklyStarCount: 12,
    words: [
      { name: "carnivore", correct: 0, seen: 0, timeSpent: 0, experience: 10 },
      { name: "herbivore", correct: 0, seen: 0, timeSpent: 0, experience: 10 }
    ],
    school: schoolData.ID_1,
    classes: [{ id: "5a4aea2c8293e0305e30ebc5", role: "student" }]
  },
  {
    _id: ID_3,
    friends: [],
    username: "akiva-s",
    firstName: "Akiva",
    lastName: "S",
    signUpMethod: "email",
    isTeacher: true,
    email: "akiva@gmail.com",
    school: schoolData.ID_1,
    classes: [{ id: "5a4aea2c8293e0305e30ebc5", role: "teacher" }]
  }
];

const invalidMocks = [
  {
    username: "joe-s",
    firstName: "Joe",
    lastName: "Shmoe"
  }
];

module.exports = {
  mock: primaryMock,
  teacherMock: secondaryMocks[1],
  mocks: _.union([primaryMock], secondaryMocks),
  invalidMocks: invalidMocks,
  ID_1: ID_1,
  ID_2: ID_2
};
