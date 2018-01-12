const _ = require('underscore')
const moment = require('moment');

const primaryMock = {
  id: 'user123:chill-web-sesh420',
  user_id: 'user123',
  session_id: 'chill-web-sesh420',
  ip: '123ismyip',
  date: '2018-01-12',
  start: '10:01:00',
  timezone_offset: '-0500',
  duration: '0:01:18',
  paths: JSON.stringify(['/home', '/leaderboards', '/profile'])
}

const secondaryMocks = [
  {
    id: 'user456:lazy-web-sesh3',
    user_id: 'user456',
    session_id: 'lazy-web-sesh3',
    ip: '23498247',
    date: '2017-01-12',
    start: '09:01:00',
    timezone_offset: '-0500',
    duration: '0:02:22',
    paths: JSON.stringify(['/leaderboards', '/profile'])
  },
  {
    id: 'user123:lazy-web-sesh4',
    user_id: 'user123',
    session_id: 'lazy-web-sesh4',
    ip: '123ismyip',
    date: '2018-01-11',
    start: '11:01:00',
    timezone_offset: '-0500',
    duration: '0:01:48',
    paths: JSON.stringify(['/home', '/leaderboards', '/home'])
  }
]

module.exports = {
  mock: primaryMock,
  mocks: _.union([primaryMock], secondaryMocks)
}
