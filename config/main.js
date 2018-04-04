module.exports = {  
  'PORT': process.env.PORT || 3002,
  'MONGODB_URI': process.env.MONGODB_URI || 'mongodb://localhost:27017/wordcraft',
  'VALIDATION_TOKEN': process.env.VALIDATION_TOKEN || 'super-cool-token',
  'QUESTION_DB_USERNAME': process.env.QUESTION_DB_USERNAME || 'postgres',
  'QUESTION_DB_PASSWORD': process.env.QUESTION_DB_PASSWORD || '',
  'QUESTION_DB_SERVER': process.env.QUESTION_DB_SERVER || 'localhost',
  'QUESTION_DB_HOST': process.env.QUESTION_DB_HOST || '5432',
  'QUESTION_DB_NAME': process.env.QUESTION_DB_NAME || 'wordcraft',
  'SENDGRID_API_KEY': process.env.SENDGRID_API_KEY,
  'FIREBASE_API_KEY': process.env.FIREBASE_API_KEY,
  'FIREBASE_AUTH_DOMAIN': process.env.FIREBASE_AUTH_DOMAIN,
  'FIREBASE_DATABASE_URL': process.env.FIREBASE_DATABASE_URL,
  'FIREBASE_STORAGE_BUCKET': process.env.FIREBASE_STORAGE_BUCKET,
  'SLACK_HOOK': process.env.SLACK_HOOK,
  'AWS_IDENTITY_POOL_ID': process.env.AWS_IDENTITY_POOL_ID,
  'AWS_REGION': process.env.AWS_REGION,
  'AWS_IMAGES_BUCKET': process.env.AWS_IMAGES_BUCKET
}
