#!/usr/bin/env node

const firebase = require('firebase');
const Slack = require('node-slack');
const CONFIG = require('../Config/main');

const slack = new Slack(CONFIG.SLACK_HOOK, {});

const firebaseConfig = {
  apiKey: CONFIG.FIREBASE_API_KEY,
  authDomain: CONFIG.FIREBASE_AUTH_DOMAIN,
  databaseURL: CONFIG.FIREBASE_DATABASE_URL
  storageBucket: CONFIG.FIREBASE_STORAGE_BUCKET
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const ref = firebaseApp.database().ref().child('web').child('forms');

const date = Date.now();

ref.once('value').then((snap) => {
  const submissions = Object.keys(snap.val()).map((k) => snap.val()[k]);
  
  const newSubmissions = submissions.filter((s) => {
    const diffMins = (date - s.date) / 60000
    return diffMins <= 10
  })

  Promise.all(newSubmissions.map(postToSlack)).then((res) => {
    firebaseApp.delete()
    return
  })
});

const postToSlack = (data) => {
  return new Promise((resolve, reject) => {
    let message = `${data.firstName} ${data.lastName} (email: ${data.email}) from ${data.school} just submitted a form.\n\n`
    
    if (data.comments.length) {
      message += `In the comments section he/she wrote: ${data.comments}`
    }

    slack.send({
      text: message,
      channel: '#growth',
      username: 'Form-Bot2'
    }, () => resolve());
  })
}
