require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { access } = require('fs');
const User = require('./models/User');
var cors = require('cors')

const app = express();
const port = 5000;
const corsOptions ={
    origin:'http://localhost:3000', 
    credentials:true,
    optionSuccessStatus: 200
}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors(corsOptions))

app.get("/newuser", async (req, res) => {
    var d = await User.findById('656b467cf2e08c8a2c654611')
    res.send(d)
})


const dbUser = process.env.DB_USER
const dbPass = process.env.DB_PASS

//* Conexão a DB (dados no .env)
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@cluster0.zausybw.mongodb.net/`)
    .then(app.listen(port, () => {console.log('Banco conectado!\n' + 'API na porta ' + port)}))
    .catch((err) => {console.log(err)})