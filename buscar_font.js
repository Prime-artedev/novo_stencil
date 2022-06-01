const font = require('./models/font')


module.exports.buscar_fonts = async () => {

    return await font.findAll({
        raw: true,
        attributes: ['id', 'font']

    }).then(res => {

        return (res)
    })
};