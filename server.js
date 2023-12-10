require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { access } = require('fs');
const User = require('./models/User');

const app = express();
const port = 5000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

app.post("/", (req, res) => {
    const user = req.body.userID
})

const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

//* Conexão a DB (dados no .env)
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.zausybw.mongodb.net/`)
    .then(app.listen(port, () => {console.log('Banco conectado!\n' + 'API na porta ' + port)}))
    .catch((err) => {console.log(err)})