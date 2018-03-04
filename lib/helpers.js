const _ = require('underscore')

exports.guid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

exports.capitalize = str => _.map(str.split(''), (c, i) => i === 0 ? c.toUpperCase() : c).join('')

exports.upcase = str => _.isString(str) && str.toUpperCase()

exports.downcase = str => _.isString(str) && str.toLowerCase()
