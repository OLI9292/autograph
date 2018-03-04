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

wordSchema.methods.equals = function(word) {
  return this._id.equals(word._id)
}

wordSchema.methods.rootComponents = function(justOne = false) {
  const roots = _.filter(this.components, c => c.componentType === 'root');
  return justOne ? [_.sample(roots)] : roots;
}

wordSchema.methods.sharesRootWith = async function() {
  return await Word.find(
    { 
      $and: [
        { $or: _.map(this.roots, r => ({ roots: r })) },
        { _id: { $ne: this._id } },
      ]
    }
  )
}

wordSchema.methods.prompts = function() {
  const rootDefs = _.pluck(_.filter(this.definition, d => d.isRoot), 'value');

  const withDefs = _.flatten(_.map(this.definition, d => {
    const _root = d.isRoot && _.find(this.components, c => c.definition === d.value)
    const rootValue = _root && _root.value.toUpperCase()
    return d.isRoot
      ? [{ value: d.value, highlight: true }, { value: ` (${rootValue})`, highlight: true }]
      : { value: d.value, highlight: false };
  }));  

  const withoutDefs = _.map(this.definition, d => {
    return { value: d.value, highlight: d.isRoot };
  });  

  return { normal: withoutDefs, easy: withDefs };
}

wordSchema.methods.highlightedComponents = function(rootValue) {
  return _.map(this.components, c => ({
    value: c.value,
    highlight: rootValue ? rootValue === c.value : c.componentType === 'root' 
  }))
}

wordSchema.methods.defCompletionParams = function(roots) {
  const hiddenRootInDef = _.sample(_.filter(this.definition, d => d.isRoot));
  const hiddenRoot = _.find(this.components, c => c.componentType === 'root' && hiddenRootInDef.value.includes(c.definition))
  const _root = _.find(roots, r => r.value === hiddenRoot.value);
  
  const definition = this.fullDefinition()
    .replace(hiddenRootInDef.value, Array(hiddenRootInDef.value.trim().length).fill('_').join('') + ' ')
    .trim();

  const prompt = _.flatten(
    this.highlightedComponents(_root.value).concat(
    `= ${definition}`.split(' ').map(d => ({ value: ' ' + d, highlight: false }))))

  return { prompt: { normal: prompt }, answer: { value: hiddenRoot.definition, hint: hiddenRoot.value } }
}

const Word = mongoose.model('Word', wordSchema)

module.exports = Word
