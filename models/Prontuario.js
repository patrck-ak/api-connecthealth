const mongoose = require('mongoose')

const Prontuario = mongoose.model('Prontuario', {
  name: String,
  cpf: Number,
  date: String,
  desc: String
})

module.exports = Prontuario