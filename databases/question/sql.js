const _ = require("underscore");

//
// CONSTANTS
//

const QUESTION_FIELD_DATA = [
  { name: "id", datatype: "serial", options: ["primary key"] },
  { name: "answered_at", datatype: "timestamp", options: ["not null"] },
  { name: "correct", datatype: "boolean", options: ["not null"] },
  { name: "mobile", datatype: "boolean", options: ["not null"] },
  {
    name: "hints_used",
    datatype: "int",
    options: ["not null", "check(hints_used >= 0)"]
  },
  {
    name: "incorrect_guesses",
    datatype: "int",
    options: ["not null", "check(incorrect_guesses >= 0)"]
  },
  {
    name: "time_spent",
    datatype: "float",
    options: ["not null", "check(time_spent > 0)"]
  },
  { name: "type", datatype: "varchar(60)", options: ["not null"] },
  { name: "user_id", datatype: "varchar(40)", options: ["not null"] },
  { name: "session_id", datatype: "varchar(60)", options: [] },
  { name: "word", datatype: "varchar(40)", options: [] },
  { name: "answers", datatype: "json", options: [] },
  { name: "choices", datatype: "json", options: [] }
];

const QUESTION_FIELD_NAMES = _.pluck(QUESTION_FIELD_DATA.slice(1), "name").sort(
  (a, b) => a.localeCompare(b)
);
const QUESTION_FIELDS = QUESTION_FIELD_DATA.map(
  f => `${f.name} ${f.datatype} ${f.options.join(" ")}`
);

const SESSION_FIELD_DATA = [
  { name: "id", datatype: "varchar(120)", options: ["primary key"] },
  { name: "user_id", datatype: "varchar(60)", options: ["not null"] },
  { name: "session_id", datatype: "varchar(60)", options: ["not null"] },
  { name: "ip", datatype: "varchar(60)", options: ["not null"] },
  { name: "date", datatype: "varchar(30)", options: ["not null"] },
  { name: "start", datatype: "varchar(30)", options: ["not null"] },
  { name: "timezone_offset", datatype: "varchar(30)", options: ["not null"] },
  { name: "duration", datatype: "varchar(30)", options: [] },
  { name: "paths", datatype: "json", options: ["not null"] }
];

const SESSION_FIELD_NAMES = _.pluck(SESSION_FIELD_DATA, "name").sort((a, b) =>
  a.localeCompare(b)
);
const SESSION_FIELDS = SESSION_FIELD_DATA.map(
  f => `${f.name} ${f.datatype} ${f.options.join(" ")}`
);

//
// QUERIES
//

const valueText = count =>
  `VALUES(${_.range(1, count + 1)
    .map(n => `$${n}`)
    .join(", ")})`;

exports.getQuestions = userId => {
  return userId
    ? ["SELECT * FROM questions WHERE user_id = $1", [userId]]
    : ["SELECT * FROM questions", []];
};

exports.getSessions = userId => {
  return userId
    ? ["SELECT * FROM sessions WHERE user_id = $1", [userId]]
    : ["SELECT * FROM sessions", []];
};

exports.saveQuestion = data => {
  const keys = data.length ? _.keys(data[0]) : _.keys(data);
  const values = data.length ? data.map(d => _.values(d)) : _.values(data);
  return [
    `INSERT INTO questions(${keys.join(", ")}) ${valueText(keys.length)};`,
    values
  ];
};

exports.saveSession = data => {
  const [keys, values] = [_.keys(data), _.values(data)];
  console.log("Saving session: " + data.id);
  return [
    `INSERT INTO sessions(${keys.join(", ")}) ${valueText(keys.length)};`,
    values
  ];
};

//
// SETUP
//

exports.createQuestionsTable = `CREATE TABLE questions (${QUESTION_FIELDS.join(
  ", "
)});`;

exports.createSessionsTable = `CREATE TABLE sessions (${SESSION_FIELDS.join(
  ", "
)});`;
