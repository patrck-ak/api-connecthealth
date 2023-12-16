
// importação do .env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const { access } = require("fs");
const User = require("./models/User");
var cors = require("cors");

const app = express();
const port = 5000;
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};

// config express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

//* requrest da página de login
app.post("/auth/user", async (req, res, next) => {
  const { name, pass } = req.body;

  if (!name) {
    return res.json({erroMsg: "ID em branco ou inválida." });
  } if(!pass) {
    return res.json({erroMsg: "Senha em branco ou inválida."})
  }

  //* busca o usuario no banco
  const user = await User.findOne({name: name})
  //! caso não exista retorna json de erro
  if(!user) { 
    return res.json({erroMsg: 'Usuário não encontrado.'})
  }

  //* compara o input de senha com o hash do banco
  const checkPassword = await bcrypt.compare(pass, user.password)
  if(!checkPassword) { 
    return res.json({erroMsg: 'Senha incorreta.'})
  }
  res.json({msg: 'logado.'})
});

//* cadastrar usuario admin
app.post("/new/user/admin", (req, res) => {
  // recupera todos os inputs 
  const {name, pass, level} = req.body
  if(!name) {
    return res.json({erroMsg: "UserID em branco ou inválido."})
  }
  if(!pass) {
    return res.json({erroMsg: "UserID em branco ou inválido."})
  }
  if(!level) {
    return res.json({erroMsg: "Nivel de permissão em branco ou inválido."})
  }
})


const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

//* Conexão a DB (dados no .env)
mongoose
  .connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.zausybw.mongodb.net/`)
  .then(
    app.listen(port, () => {
      console.log("Banco conectado!\n" + "API na porta " + port);
    })
  )
  .catch((err) => {
    console.log(err);
  });
