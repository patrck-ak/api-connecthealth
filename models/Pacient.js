const mongoose = require('mongoose')

const Pacient = mongoose.model('Pacient', {
  name: String,
  email: String,
  password: String,
  cpf: String,
  addr: String,
  desc: String,
  atend: String,
})

module.exports = Pacient