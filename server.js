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
    return res.json({
      msg: "ID em branco ou inválida.",
      title: "ERRO",
      status: 5,
    });
  }
  if (!pass) {
    return res.json({
      msg: "Senha em branco ou inválida.",
      title: "ERRO",
      status: 5,
    });
  }

  //* busca o usuario no banco
  const user = await User.findOne({ name: name });
  //! caso não exista retorna json de erro
  if (!user) {
    return res.json({
      msg: "Usuário não encontrado.",
      title: "ERRO",
      status: 5,
    });
  }

  //* compara o input de senha com o hash do banco
  const checkPassword = await bcrypt.compare(pass, user.password);

  if (!checkPassword) {
    return res.json({ msg: "Senha incorreta.", title: "ERRO", status: 5 });
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
    return res.json({
      msg: "Sessão validada.",
      title: "SUCESSO",
      auth: true,
      name: user.name,
      status: 10,
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
    return res.json({
      msg: "Seu usuário não tem permissão.",
      title: "ERRO",
      status: 5,
    });
  }
  if (!name) {
    return res.json({
      msg: "ID em branco ou inválido.",
      title: "ERRO",
      status: 5,
    });
  }
  if (!email) {
    return res.json({
      msg: "E-mail em branco ou inválido.",
      title: "ERRO",
      status: 5,
    });
  }
  if (!pass) {
    return res.json({
      msg: "Senha em branco ou inválido.",
      title: "ERRO",
      status: 5,
    });
  }
  if (!level) {
    return res.json({
      msg: "Nivel de permissão em branco ou inválido.",
      status: 5,
    });
  }

  //* verifica se usuario já existe
  const userExists = await User.findOne({ name: name });
  const mailExists = await User.findOne({ email: email });

  if (userExists) {
    return res.json({ msg: "Usuário já cadastrado", title: "ERRO", status: 5 });
  }
  if (mailExists) {
    return res.json({ msg: "E-mail já cadastrado", title: "ERRO", status: 5 });
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
    res
      .status(201)
      .json({
        msg: "Usuario criado com sucesso.",
        title: "SUCESSO",
        status: 10,
      });
  } catch (error) {
    // retorna erro caso tenha algum
    console.log(error);
  }
});

//* editar usuário admin
app.post("/user/edit", async (req, res) => {
  const { name, id, token, auth } = req.body;
  const user = await User.findOne({ _id: id });
  return res.json({ user: user });
});

//*
//! PAREI AQUI FAZENDO O TITULO DO TOAST
app.post("/pacients/create", async (req, res) => {
  // desestrutura todos os inputs da requisição
  const { nam, email, address, desc, cpf, pass, admin, idadmin } = req.body;
  if (!nam) {
    return res.json({
      msg: "Nome do paciente inválido.",
      title: "ERRO",
      status: 5,
    });
  }
  if (!email) {
    return res.json({
      msg: "E-Mail de paciente inválido.",
      title: "ERRO",
      status: 5,
    });
  }
  if (!cpf) {
    return res.json({
      msg: "CPF do paciente inválido.",
      title: "ERRO",
      status: 5,
    });
  }
  if (!address) {
    return res.json({
      msg: "Endereço do paciente inválido.",
      title: "ERRO",
      status: 5,
    });
  }
  if (!desc) {
    return res.json({
      msg: "Descrição do paciente não pode estar em branco.",
      title: "ERRO",
      status: 5,
    });
  }

  const adm = await User.findOne({ name: admin });

  var hash = adm.password;
  // inicializa a lista de pacientes
  var atend = [];

  if (await bcrypt.compare(pass, hash)) {
    console.log("senha válida");
    try {
      const pacient = new Pacient({
        name: nam,
        email,
        cpf,
        addr: address,
        desc,
        atend,
      });

      pacient.save();
      return res.json({
        msg: `Paciente criado com sucesso.`,
        title: "SUCESSO",
        status: 10,
      });
    } catch (error) {
      console.log(error);
      return res.json({
        msg: "Erro interno, por favor contate o Suporte.",
        title: "ERRO",
        status: 5,
      });
    }
  } else {
    console.log("senha invalida");
    return res.json({ msg: "Senha inválida.", title: "ERRO", status: 5 });
  }
});

app.post("/log/medic", async (req, res) => {
  const { msg, err, id, date } = req.body;
  console.log(msg, err, id, date);
});

app.post("/checkcpf", async (req, res) => {
  const { cpf } = req.body;
  const p = await Pacient.findOne({cpf: cpf})
  if(!p) {
    return res.json({msg: "CPF não encontrado.", title: "ERRO", status: 5})
  } else {
    return res.json({msg: `Usuário encontrado: ${p.name}`, title: "SUCESSO", status: 10})
  }
});

app.post('/awake', async (req, res) => {
  const { awake} = req.body;
  if (awake === 'awake') {
    return res.json({msg: 'true'})
  }
})


//! .ENV
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

//* Conexão a DB (dados no .env)
mongoose
  .connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.zausybw.mongodb.net/`)
  .then(
    app.listen(port, () => {
      console.log("rodando...");
    })
  )
  .catch((err) => {
    console.log(err);
  });
