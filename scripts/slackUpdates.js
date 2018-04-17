#!/usr/bin/env node

const firebase = require('firebase');
const Slack = require('node-slack');
const CONFIG = require('../config/main');
const get = require('lodash/get');

const slack = new Slack(CONFIG.SLACK_HOOK, {});

const firebaseConfig = {
  apiKey: CONFIG.FIREBASE_API_KEY,
  authDomain: CONFIG.FIREBASE_AUTH_DOMAIN,
  databaseURL: CONFIG.FIREBASE_DATABASE_URL,
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
    firebaseApp.delete();
    process.exit(0);
  })
});

const postToSlack = data => {
  return new Promise((resolve, reject) => {
    slack.send({
      text: get(data, 'message'),
      channel: '#growth',
      username: 'Form-Bot'
    }, () => resolve());
  })
}
