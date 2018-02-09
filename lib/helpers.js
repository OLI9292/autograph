const _ = require('underscore')

exports.guid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


exports.flatmap = (a, cb) => [].concat(...a.map(cb))


exports.capitalize = str => _.map(str.split(''), (c, i) => i === 0 ? c.toUpperCase() : c).join('')
