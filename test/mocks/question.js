const _ = require('underscore')
const moment = require('moment');

const primaryMock = {
  answered_at: moment().format(),
  correct: true,
  mobile: false,
  hints_used: 1,
  incorrect_guesses: 3,
  time_spent: 4.65,
  type: 'spell',
  user_id: 'super-cool-user-id',
  session_id: 'dope-sesh-id',
  word: 'carnivore',
  answers: JSON.stringify(['carn', 'vor']),
  choices: JSON.stringify(['carn', 'herb', 'vor', 'somn']),
}

const secondaryMocks = [
  {
    answered_at: moment().format(),
    correct: false,
    mobile: false,
    hints_used: 0,
    incorrect_guesses: 0,
    time_spent: 2,
    type: 'spell',
    user_id: 'super-bad-user-id',
    session_id: 'dope-sesh-id',
    word: 'carnivore',
    answers: JSON.stringify(['carn', 'vor']),
    choices: JSON.stringify(['carn', 'herb', 'vor', 'somn']),
  },
  {
    answered_at: moment().format(),
    correct: false,
    mobile: false,
    hints_used: 4,
    incorrect_guesses: 10,
    time_spent: 20,
    type: 'spell',
    user_id: 'super-cool-user-id',
    session_id: 'dope-sesh-id',
    word: 'carnivore',
    answers: JSON.stringify(['carn', 'vor']),
    choices: JSON.stringify(['carn', 'herb', 'vor', 'somn']),
  }
]

module.exports = {
  mock: primaryMock,
  mocks: _.union([primaryMock], secondaryMocks),
}
