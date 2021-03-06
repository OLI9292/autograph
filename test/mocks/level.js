const ID_1 = "5a4aea2c8293e0305e30ebd1";
const ID_2 = "5a4aea2c8293e0305e30ebx1";
const _ = require("underscore");

const primaryMock = {
  _id: ID_1,
  ladder: 1,
  words: [
    "carnivore",
    "herbivore",
    "omnivore",
    "voracious",
    "isohyet",
    "monopoly",
    "pteradactyol",
    "something",
    "nothing",
    "happy",
    "horse"
  ],
  progressBars: 3,
  slug: "vor",
  ratios: {
    seen: 0.5,
    unseen: 0.25
  },
  name: "vor",
  type: "general"
};

const exploreMock = {
  words: ["carnivore", "herbivore", "omnivore"],
  _id: "5a8d7e4aca19cf0020e8178e",
  name: "astronomy",
  ladder: 1,
  progressBars: null,
  slug: "astronomy-1",
  type: "topic",
  ratios: {
    seen: 0.5,
    unseen: 0.25
  }
};

const speedMock = {
  words: ["carnivore", "herbivore", "omnivore"],
  _id: "5a8d7e4aca19cf0030e8178e",
  name: "speed",
  ladder: 3,
  progressBars: null,
  slug: "speed-1",
  type: "speed",
  speed: {
    time: 5,
    inputType: "button"
  },
  ratios: {
    seen: 0.5,
    unseen: 0.25
  }
};

module.exports = {
  mock: primaryMock,
  exploreMock: exploreMock,
  speedMock: speedMock,
  mocks: [primaryMock, exploreMock, speedMock]
};
