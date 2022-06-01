require('dotenv').config()
const {
    Sequelize
} = require("sequelize") // estamos importando so o sequelize


const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE

const sequelize = new Sequelize(database, user, password, { // fazendo a conexao com o banco

    host: process.env.HOST, // aqui esta como local
    dialect: 'mysql', // tipo do banco
    port: process.env.PORT,

}); // dados do banco de dados


module.exports = sequelize // montamos a exportação da conexão