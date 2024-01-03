const mongoose = require('mongoose')

const Pacient = mongoose.model('Pacient', {
  name: String,
  email: String,
  password: String,
  level: Number,
  cpf: Number,
  addr: String,
  desc: String
})

module.exports = Pacient