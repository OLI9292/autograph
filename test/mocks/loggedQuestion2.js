const primaryMock = {
  correct: false,
  email: "oliver@gmail.com",
  endTime: "Wed Jun 20 2018 : 28 GMT-0400 (Eastern Daylight Time)",
  finished: true,
  guesses: "noun; nominative; subject; verb; conditional; independent subjunctive; all other subordination; indirect command; primary; subsequent time; secondary",
  questionCategory: "latin testing zach",
  questionPrompt: "Syntax, of, labōrārent?",
  questionSecondaryPrompt: "Magister, honestus, dōna, multa, et, pulchra, servīs, bellō, captīs, dāns, imperāvit, ut, cum, dīligentiā, studiōque, labōrārent, ut, līberī, mox, essent, et, ē, rēgnō, cēderent., Servī, autem, magistrum, nōn, audīvērunt;, ē, rēgnō, numquam, cessērunt,, sed, ē, vītā, mox, cessūrī, errant.",
  questionSubCategory: "zach latin testing",
  questionIdentifier: "1.1.2",
  secondsTaken: 32.249,
  startTime: "Wed Jun 20 2018 10:32:56 GMT-0400 (Eastern Daylight Time)",
  userId: "59fccf65bc0b8e001fbe83a3"
};

const secondaryMock = {
  correct: false,
  email: "oliver@gmail.com",
  endTime: "Wed Jun 20 2018 : 28 GMT-0400 (Eastern Daylight Time)",
  finished: true,
  guesses: "...",
  questionCategory: "...",
  questionPrompt: "...",
  questionSecondaryPrompt: "...",
  questionSubCategory: "oliver greek testing",
  questionIdentifier: "1.1.2",
  secondsTaken: 32.249,
  startTime: "Wed Jun 20 2018 10:32:56 GMT-0400 (Eastern Daylight Time)",
  userId: "59fccf65bc0b8e001fbe83a3"
};

module.exports = {
  mock: primaryMock,
  mocks: [primaryMock, secondaryMock]
};
