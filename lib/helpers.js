const _ = require("underscore");

exports.guid = () => {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

exports.capitalize = str =>
  _.map(str.split(""), (c, i) => (i === 0 ? c.toUpperCase() : c)).join("");

exports.upcase = str => _.isString(str) && str.toUpperCase();

exports.downcase = str => _.isString(str) && str.toLowerCase();

exports.randomPassword = () => {
  const colors = ["gold","orange","blue","silver","brown","purple","green","yellow","red","neon","pink"];
  const animals = ["crab","frog","deer","duck","fly","dragon","panda","spider","turkey","turtle","walrus","zebra","rabbit","lizard","horse","sheep","hawk","eagle","cat","dog","fish","bird","snake","lion","tiger","bear","moose","shark","ant","swan","bee"];
  const number = _.random(10, 99);
  return _.sample(colors) + _.sample(animals) + number;
}
