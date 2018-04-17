const mongoose = require("mongoose");

const schoolData = require("./school");
const userData = require("./user");
const ID_1 = "5a4aea2c8293e0305e30ebc5";

const primaryMock = {
  value: "Super cool carnivore factoid.",
  words: ["carnivore"],
};

const secondaryMocks = [
  {
    value: "Super cool herbivore factoid.",
    words: ["herbivore"]
  },
  {
    value: "Super cool omnivore factoid.",
    words: ["omnivore"]
  }  
]

module.exports = {
  mock: primaryMock,
  mocks: secondaryMocks.concat(primaryMock)
};
