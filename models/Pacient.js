const mongoose = require("mongoose");

const Pacient = mongoose.model("Pacient", {
  name: String,
  email: String,
  cpf: String,
  addr: String,
  desc: String,
  atend: Array,
});

module.exports = Pacient;
