const _ = require('underscore');
const moment = require('moment');
const numeral = require('numeral');

const cache = require('../cache');
const query = require('../databases/question/query');
const sql = require('../databases/question/sql');

exports.run = () => {
  cache.smembers('known_sessions', (error, keys) => {
    keys.forEach((key) => {
      cache.exists(key + ':timeout', (err, exists) => {
        if (exists === 1) { return; }

        const [userId, sessionId] = key.split(':');
        const session = { id: key, user_id: userId, session_id: sessionId };

        cache.lrange(key, 0, -1, (error, events) => {
          const parsed = events.map(JSON.parse);
          const [first, last] = [_.first(parsed), _.last(parsed)];
          const [start, end] = [moment(first.at), moment(last.at)];
          const delta = moment.duration(end.diff(start));

          session.ip = first.ip;
          session.date = start.format('YYYY-MM-DD');
          session.start = start.format('HH:MM:SS');
          session.timezone_offset = start.format('ZZ');
          session.duration = numeral(delta.asSeconds()).format('00:00:00');
          session.paths = JSON.stringify(_.pluck(parsed, 'path'));

          await query(...sql.saveSession(session));
        });

        cache.del(key);
        cache.srem('known_sessions', key);
     }); 
   });  
  });
}
