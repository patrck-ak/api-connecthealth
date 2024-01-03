const mongoose = require('mongoose')

const Log = mongoose.model('Log', {
  name: String,
  date: String,
  action: String,
})

module.exports = Log