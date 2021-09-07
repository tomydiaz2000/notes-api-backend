const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs');
const path = require('path');

const app = express()

require('dotenv').config()
require('./mongo')

const Note = require('./models/Note')
const QrCode = require('./models/QrCode')
const Image = require('./models/Image')

const { request } = require('express')

const upload = multer({
  dest: 'uploads'
})

app.use(cors())
app.use(express.json())
app.use((request, response, next) => {
  console.log(request.method)
  console.log(request.path)
  console.log(request.body)
  console.log('------------')
  next()
})

let notes = []

app.get('/', (request, response) => { response.sendFile(__dirname + '/views/index.html') })

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.get('/api/images', (request, response) => {
  Image.find({}).then(result => {
    response.json(result)
  })
})

app.post('/api/images', upload.single('avatar'), (request, response, next) => {
  var obj = new Image ({
    name: request.body.name,
    desc: request.body.desc,
    img: {
      data: fs.readFileSync(path.join(__dirname + '/uploads/' + request.file.filename)),
      contentType: 'image/png'
    }
  })
  obj.save().then(savedImage => {
    // console.log(savedImage)
    response.status(200).end()
  })
  
  // Image.create(obj, (err, item) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   else {
  //     Image.save().then(savedImage => {
  //       response.json(savedImage)
  //     })
  //   }
  // });
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)
  response.status(204).end()
})

app.get('/api/qrcode', (request, response) => {
  QrCode.find({}).then(qrCodes => {
    response.json(qrCodes)
  })
})

app.put('/api/qrcode/:id', (request, response) => {
  console.log('PUT HERE')
  const { id } = request.params

  const qrcode = request.body

  const newQrCodeInfo = {
    code: qrcode.code
  }

  QrCode.findByIdAndUpdate(id, newQrCodeInfo, { new: true })
    .then(result => {
      console.log('result ' + result)
      response.json(result)
    })
    .catch(err => {
      console.log(err)
    })
})

app.get('/api/qrcode/:id', (request, response, next) => {
  const { id } = request.params

  QrCode.findById(id).then(dataResponse => {
    if (dataResponse) {
      response.json(dataResponse)
    } else {
      response.status(404).end()
    }
  }).catch(err => {
    next(err)
  })
})

app.delete('/api/qrcode/:id', (request, response, next) => {
  const { id } = request.params

  QrCode.findByIdAndRemove(id).then(dataResponse => {
    response.status(204).end()
  }).catch(err => {
    next(err)
  })
})

app.post('/api/qrcode', (request, response) => {
  const qrcode = request.body

  if (!qrcode.code) {
    return response.status(400).json({
      error: 'require "content" field is missing'
    })
  }

  const newQrCode = new QrCode({
    code: qrcode.code,
    date: new Date().toISOString()
  })

  newQrCode.save().then(savedQrCode => {
    response.json(savedQrCode)
  })
})

app.post('/api/notes', (request, response) => {
  const note = request.body

  if (!note || !note.content) {
    return response.status(400).json({
      error: 'note content is missing'
    })
  }

  const ids = notes.map(note => note.id)
  const maxId = Math.max(...ids)

  const newNote = {
    id: maxId + 1,
    content: note.content,
    important: typeof note.important !== 'undefined' ? note.important : false,
    date: new Date().toISOString()
  }

  notes = notes.concat(newNote)

  response.json(newNote)
})

app.use((request, response) => {
  response.status(404).json({
    error: 'Not found'
  })
})

app.use((error, request, response, next) => {
  console.error(error)

  if (error.name === 'CastError') {
    response.status(400).send({
      error: 'id used is malformed'
    })
  } else {
    response.status(500).end()
  }
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
