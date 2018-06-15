const ID_1 = "6a4aea2c8293e0305e30ebd1";
const ID_2 = "7a4aea2c8293e0305e30ebd1";

const primaryMock = {
  _id: ID_1,
  identifier: "18.1.1",
  category: "Latin",
  subCategory: "Intro",
  prompt: [
    {
      value: "Classify the highlighted word",
      highlight: false
    }
  ],
  secondaryPrompt: [
    {
      value: "When setting out on a mission of revenge, dig two graves.",
      highlight: false
    }
  ],  
  choices: [
    [
      {
        value: "noun",
        correct: true
      },
      {
        value: "adjective",
        correct: false
      }      
    ],
    [
      {
        value: "singular",
        correct: true
      },
      {
        value: "plural",
        correct: false
      }      
    ]    
  ]
};

const secondaryMock = {
  _id: ID_2,
  identifier: "18.1.1",
  category: "Latin",
  subCategory: "Intro",
  prompt: [
    {
      value: "Classify the highlighted word",
      highlight: false
    }
  ],
  secondaryPrompt: [
    {
      value: "When setting out on a mission of revenge, dig two graves.",
      highlight: false
    }
  ],  
  choiceTreeJson: "{}"
};

module.exports = {
  mock: primaryMock,
  mocks: [primaryMock].concat(secondaryMock)
};
