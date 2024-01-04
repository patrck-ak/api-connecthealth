// importação do .env
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const User = require("./models/User");
const Pacient = require("./models/Pacient");
var cors = require("cors");

const secret = process.env.SECRET;

const app = express();
const port = 5000;
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

//? config express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

//* validação de usuário via token
app.post("/validation", async (req, res) => {
  const { tk, id } = req.body;
  var tokenValid = false;
  try {
    //* log de tentavida de token inválido.
    tokenValid = jwt.verify(tk, secret);
  } catch (error) {
    console.error("token inválido: " + tk);
  }
  const userExists = User.findOne({ _id: id });
  if (tokenValid && userExists) {
    res.json({ stts: true });
  } else {
    res.json({ stts: false });
  }
});

//* logar usuário
app.post("/auth/user", async (req, res) => {
  const { name, pass } = req.body;
  var level;
  console.log(name, pass);

  if (!name) {
    return res.json({ err: "ID em branco ou inválida.", status: 1 });
  }
  if (!pass) {
    return res.json({ err: "Senha em branco ou inválida.", status: 2 });
  }

  //* busca o usuario no banco
  const user = await User.findOne({ name: name });
  //! caso não exista retorna json de erro
  if (!user) {
    return res.json({ err: "Usuário não encontrado.", status: 3 });
  }

  //* compara o input de senha com o hash do banco
  const checkPassword = await bcrypt.compare(pass, user.password);

  if (!checkPassword) {
    return res.json({ err: "Senha incorreta.", status: 4 });
  } else {
    const secret = process.env.SECRET;
    const token = jwt.sign({ id: user._id }, secret);
    switch (user.level) {
      case 0:
        level = 3121; // nivel 0 nenhum
      case 1:
        level = 2431; // nivel de leitura
      case 2:
        level = 1261; // nivel de leitura, escrita e remoção
    }
    return res.send({
      name: user.name,
      status: 5,
      id: user.id,
      token: token,
      level: level,
    });
  }
});

//* cadastrar usuario admin
app.post("/user/new/admin", async (req, res) => {
  // recupera todos os inputs
  const { name, pass, email, level, adminLevel } = req.body;
  if (adminLevel !== "1261") {
    return res.json({ err: "Seu usuário não tem permissão.", status: 10 });
  }
  if (!name) {
    return res.json({ err: "UserID em branco ou inválido.", status: 1 });
  }
  if (!pass) {
    return res.json({ err: "Senha em branco ou inválido.", status: 2 });
  }
  if (!email) {
    return res.json({ err: "E-mail em branco ou inválido.", status: 3 });
  }
  if (!level) {
    return res.json({
      err: "Nivel de permissão em branco ou inválido.",
      status: 4,
    });
  }

  //* verifica se usuario já existe
  const userExists = await User.findOne({ name: name });
  const mailExists = await User.findOne({ email: email });

  if (userExists) {
    return res.json({ err: "Usuário já cadastrado", status: 5 });
  }
  if (mailExists) {
    return res.json({ msg: "E-mail já cadastrado", status: 6 });
  }

  //* criptar senha
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(pass, salt);

  //* salvar usuário na tabela
  const user = new User({
    name,
    email,
    password: passwordHash,
    level,
  });

  //* envia o usuário
  try {
    await user.save();
    res.status(201).json({ msg: "usuario criado com sucesso.", status: 200 });
  } catch (error) {
    // retorna erro caso tenha algum
    console.log(error);
  }
});

//* editar usuário admin
app.post('/user/edit', async (req, res) => {
  const {name, id, token, auth} = req.body;
  const user = await User.findOne({_id: id})
  return res.json({user: user})
}) 

//*
app.post("/pacients/create", async (req, res) => {
  // desestrutura todos os inputs da requisição
  const { nam, email, address, desc, cpf, pass, admin, idadmin } = req.body;
  if (!nam) {
    return res.json({ err: "Nome do paciente inválido.", status: 1 });
  }
  if (!email) {
    return res.json({ err: "E-Mail de paciente inválido.", status: 2 });
  }
  if (!address) {
    return res.json({ err: "Endereço do paciente inválido.", status: 3 });
  }
  if (!desc) {
    return res.json({ err: "Descrição do paciente não pode estar em branco.", status: 4 });
  }
  if (!cpf) {
    return res.json({ err: "CPF do paciente inválido.", status: 5 });
  }

  const adm = await User.findOne({ name: admin });
  var pacientExists = await Pacient.findOne({ name: nam });
  var hash = adm.password;

  // verifica se já existe algum paciente cadastrado
  if (pacientExists) {
    return res.json({ err: "Nome já registrado.", status: 6 });
  }

  if (bcrypt.compare(pass, hash)) {
    console.log("senha válida");
    return res.json({ msg: "true" });
  } else {
    console.log("senha invalida");
    return res.json({ err: "Senha inválida.", status: 7 });
  }
});

//! .ENV
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

//* Conexão a DB (dados no .env)
mongoose
  .connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.zausybw.mongodb.net/`)
  .then(
    app.listen(port, () => {
      console.log('rodando...');
    })
  )
  .catch((err) => {
    console.log(err);
  });
