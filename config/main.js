module.exports = {  
  'PORT': process.env.PORT || 3002,
  'MONGODB_URI': process.env.MONGODB_URI || 'mongodb://localhost:27017/wordcraft',
  'VALIDATION_TOKEN': process.env.VALIDATION_TOKEN || 'super-cool-token',
  'QUESTION_DB_USERNAME': process.env.QUESTION_DB_USERNAME || 'postgres',
  'QUESTION_DB_PASSWORD': process.env.QUESTION_DB_PASSWORD || '',
  'QUESTION_DB_SERVER': process.env.QUESTION_DB_SERVER || 'localhost',
  'QUESTION_DB_HOST': process.env.QUESTION_DB_HOST || '5432',
  'QUESTION_DB_NAME': process.env.QUESTION_DB_NAME || 'wordcraft'
}
