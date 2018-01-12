const cache = require('../cache')

exports.run = () => {
  cache.smembers('known_sessions', (error, keys) => {
    keys.forEach((key) => {
      console.log('\n')
      console.log('key ' + key)
      cache.exists(key + ':timeout', (err, exists) => {
        console.log(exists === 1)
        if (exists === 1) { return; }

        const [userId, sessionId] = key.split( ':' );
        const session = { _id: key, userID: userID, sessionID: sessionId };

        cache.lrange(key, 0, -1, (error, events) => {
          const parsed = events.map(JSON.parse);
          const [first, last] = [_.first(parsed), _.last(parsed)];
          const [start, end] = [moment(first.at), moment(last.at)];
          const delta = moment.duration(end.diff(start));

          session.ip = first.ip;
          session.date = start.format('YYYY-MM-DD');
          session.start = start.format('HH:MM:SS');
          session.offset = start.format('ZZ');
          session.duration = numeral(delta.asSeconds()).format('00:00:00');
          session.paths = _.pluck(parsed, 'path');

          // TODO: Save in DB
          console.log(session)
        });

        cache.del(key);
        cache.srem('known_sessions', key);
     }); 
   });  
}
