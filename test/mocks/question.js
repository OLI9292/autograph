const primaryMock = {
  prompt: {
    normal: [
      { value: "belief" },
      { value: " or acceptance of something as true" }
    ]
  },
  answer: [
    { value: "cred", missing: true },
    { value: "ence", missing: false }
  ],
  choices: [
    { value: "FER" },
    { value: "GRAPH" },
    { value: "INTRO" },
    { value: "HEDR" },
    { value: "ACU" },
    { value: "CRED" }
  ],
  key: "credence-2"
}

module.exports = {
  mock: primaryMock
}
