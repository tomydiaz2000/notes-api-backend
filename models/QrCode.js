const mongoose = require('mongoose')
const {Schema, model} = mongoose

const qrCodeSchema = new Schema({
  code: String,
  date: Date,
})

qrCodeSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const QrCode = model('QrCode', qrCodeSchema)


// Note.find({}).then(result => {
//   console.log(result)
//   mongoose.connection.close()
// })

// const note = new Note({
//   content: 'MongoDB es increible',
//   date: new Date(),
//   important: true
// })

// note.save().then(result =>{
//   console.log(result)
//   mongoose.connection.close()
// }).catch(err => {
//   console.error(err)
// })

module.exports = QrCode