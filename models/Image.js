const mongoose = require('mongoose')
const {Schema, model} = mongoose

const imageSchema = new Schema({
  name: String,
  desc: String,
  img:
  {
      data: Buffer,
      contentType: String
  }
})

imageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Image = model('Image', imageSchema)

module.exports = Image