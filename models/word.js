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

wordSchema.methods.hideRootInDef = function(roots) {
  const rootDefinitions = _.flatten(_.pluck(roots, 'definitions'));
  const missingRootDefinition = _.find(this.definition, p => _.contains(rootDefinitions, p.value.trim()));

  if (missingRootDefinition) {
    const missingRoot = _.find(roots, r => _.contains(r.definitions, missingRootDefinition.value));  
    if (missingRoot) {
      const definition = this.fullDefinition().replace(missingRootDefinition.value, '_');
      return { definition: definition, answer: missingRoot };      
    }
  }

  return
}

const Word = mongoose.model('Word', wordSchema)

module.exports = Word
