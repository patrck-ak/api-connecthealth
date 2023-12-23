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

const secret = '9DS0AD7ADA7DY028DASUDAS09DA8D9A8'

const app = express();
const port = 5000;
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

// config express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

//* logar usuário
app.post("/auth/user", async (req, res, next) => {
  const { name, pass } = req.body;
  var level;
  console.log(name, pass)

  if (!name) {
    return res.json({ err: "ID em branco ou inválida.", status: 1 })
  }
  if (!pass) {
    return res.json({ err: "Senha em branco ou inválida.", status: 2  });
  }

  //* busca o usuario no banco
  const user = await User.findOne({ name: name });
  //! caso não exista retorna json de erro
  if (!user) {
    return res.json({ err: "Usuário não encontrado.", status: 3  });
  }

  //* compara o input de senha com o hash do banco
  const checkPassword = await bcrypt.compare(pass, user.password);
  console.log(checkPassword, pass);


  if (!checkPassword) {
    return res.json({ err: "Senha incorreta.", status: 4  });
  } else {
    const secret = process.env.SECRET
    const token = jwt.sign({id: user._id}, secret)
    switch(user.level) {
      case 0:
        level = 3121; // nivel 0 leitura
      case 1: 
        level = 2431; // nivel de leitura e escrita
      case 2:
        level = 1261 // nivel de leitura, escrita e remoção
    }
    return res.send({ name: user.name, status: 5, id: user.id, token: token, level: level});
  }
});

//* cadastrar usuario admin
app.post("/user/new/admin", async (req, res) => {
  // recupera todos os inputs
  const { name, pass, email, level } = req.body;

  if (!name) {
    return res.json({ err: "UserID em branco ou inválido." });
  }
  if (!pass) {
    return res.json({ err: "Senha em branco ou inválido." });
  }
  if (!email) {
    return res.json({ err: "E-mail em branco ou inválido." });
  }
  if (!level) {
    return res.json({ err: "Nivel de permissão em branco ou inválido." });
  }

  //* verifica se usuario já existe
  const userExists = await User.findOne({ name: name });
  const mailExists = await User.findOne({ email: email });

  if (userExists) {
    return res.json({ err: "Usuário já cadastrado" });
  }
  if (mailExists) {
    return res.json({ msg: "E-mail já cadastrado" });
  }

  //* criptar senha DB
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(pass, salt);

  //* salvar usuário na tabela
  const user = new User({
    name,
    email,
    password: passwordHash,
    level,
  });

  //* cria um usuário
  try {
    await user.save();
    res.status(201).json({ msg: "usuario criado com sucesso." });
  } catch (error) {
    // retorna erro caso tenha algum
    console.log(error);
  }
});

app.post("/validation", async (req, res) => {
  const { tk, id } = req.body;
  var tokenValid = false
  try { //* logger de tentavida de token inválido.
    tokenValid = jwt.verify(tk, secret)
  } catch (error) {
    console.error('token inválido: ' + tk)
  }
  const userExists = User.findOne({_id: id})
  if(tokenValid && userExists) {
    res.json({stts: true})
  } else {
    res.json({stts: false})  
  }
});

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
