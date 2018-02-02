const mongoose = require('mongoose')
const Schema = mongoose.Schema
const _ = require('underscore')

var wordSchema = new Schema({
  value: { type: String, required: true },
  components: {
    type: [
      { 
        definition: String,
        componentType: {
          type: String,
          enum: ['root', 'separator', null]
        },
        value: String
      }
    ],
    required: true,
    validate: { 
      validator: objs => _.contains(_.pluck(objs, 'componentType'), 'root'),
      message: 'Must have at least one root.'
    }
  },
  definition: {
    type: [
      {
        isRoot: Boolean,
        value: String
      }
    ],
    required: true,
    validate: { 
      validator: objs => objs.length !== 0,
      message: 'Array must be non-empty.'
    }
  },
  categories: [String],
  obscurity: Number,
  roots: [Schema.Types.ObjectId]
})

wordSchema.methods.fullDefinition = function() {
  return _.pluck(this.definition, 'value').join('')
}

wordSchema.methods.easyDefinition = function() {
  const rootDefs = _.pluck(_.filter(this.definition, d => d.isRoot), 'value');
  return _.flatten(_.map(this.fullDefinition().split(' '), word => {
    const _root = _.find(this.components, c => c.definition === word);
    return _root
      ? [{ value: word, isRoot: false }, { value: ` (${_root.value.toUpperCase()})`, isRoot: true }]
      : { value: word, isRoot: false };
  }));
}

wordSchema.methods.hideRootInDef = function(roots) {
  // Gets definition value
  const hiddenRootInDef = _.sample(_.filter(this.definition, d => d.isRoot));
  const hiddenRoot = _.find(this.components, c => c.componentType === 'root' && hiddenRootInDef.value.includes(c.definition))
  const _root = _.find(roots, r => r.value === hiddenRoot.value);
  
  const definition = this.fullDefinition()
    .replace(hiddenRootInDef.value, Array(hiddenRootInDef.value.trim().length).fill('_').join('') + ' ')
    .trim();
  return { definition: definition, answer: { value: hiddenRoot.definition, hint: _root.value } };
}

const Word = mongoose.model('Word', wordSchema)

module.exports = Word
