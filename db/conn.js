const mysql = require('mysql') // puxamos os dados do banco
require('dotenv').config()

const pool = mysql.createPool({ // toda a conexao com o banco de dados
    connectionLimit: 10, // mantemos 10 conexões
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    // port: process.env.PORT_BASE

})



module.exports = pool