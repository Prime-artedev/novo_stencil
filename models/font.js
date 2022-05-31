const {
    DataTypes
} = require('sequelize')

const db = require('../db/conn'); // puxamos conexao com o banco


//* estamos criando as tabela do banco de dados
const font = db.define('font', { //vamos definir o modulo que sera criado no banco de dados

    font: {
        type: DataTypes.STRING //criamos somente boolean

    }

});

module.exports = font