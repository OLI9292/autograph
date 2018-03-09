const docPlugin = function (schema, options) {
  schema.statics.doc = function(id) {
    return this.findById(id, async (error, doc) => {
      if (error) { return { error: error.message } }
      return doc || { error: `${this.modelName} not found.` }
    })    
  }
}

const docsPlugin = function (schema, options) {
  schema.statics.docs = function() {
    return this.find({}, async (error, docs) => {
      if (error) { return { error: error.message } }
      return docs || { error: `${this.modelName}s not found.` }
    })    
  }
}

module.exports = [
  docPlugin,
  docsPlugin
]
