const _ = require('underscore')

//
// CONSTANTS
// 

const FIELD_DATA = [
  { name: 'id', datatype: 'serial', options: ['primary key'] },
  { name: 'answered_at', datatype: 'timestamp', options: ['not null'] },
  { name: 'correct', datatype: 'boolean', options: ['not null'] },
  { name: 'mobile', datatype: 'boolean', options: ['not null'] },
  { name: 'hints_used', datatype: 'int', options: ['not null', 'check(hints_used >= 0)'] },
  { name: 'incorrect_guesses', datatype: 'int', options: ['not null', 'check(incorrect_guesses >= 0)'] },
  { name: 'time_spent', datatype: 'float', options: ['not null', 'check(time_spent > 0)'] },
  { name: 'type', datatype: 'varchar(60)', options: ['not null'] },
  { name: 'user_id', datatype: 'varchar(40)', options: ['not null'] },
  { name: 'word', datatype: 'varchar(40)', options: [] },
  { name: 'answers', datatype: 'json', options: [] },
  { name: 'choices', datatype: 'json', options: [] }
];

const FIELD_NAMES = _.pluck(FIELD_DATA.slice(1), 'name').sort((a, b) => a.localeCompare(b));

const FIELDS = FIELD_DATA.map(f => `${f.name} ${f.datatype} ${f.options.join(' ')}`);

//
// QUERIES
// 

const valueText = count => `VALUES(${_.range(1, count +1).map(n => `$${n}`).join(', ')})`

exports.getQuestions = ((userId) => {
  return userId
    ? ['SELECT * FROM questions WHERE user_id = $1', [userId]]
    : ['SELECT * FROM questions', []];
});

exports.saveQuestion = data => {
  const keys = data.length ? _.keys(data[0]) : _.keys(data);
  const values = data.length ? data.map(d => _.values(d)) : _.values(data);
  return [`INSERT INTO questions(${keys.join(', ')}) ${valueText(keys.length)};`, values]
}

//
// SETUP
//

exports.createQuestionsTable = `CREATE TABLE questions (${FIELDS.join(', ')});`;
