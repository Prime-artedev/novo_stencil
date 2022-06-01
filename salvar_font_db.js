const font = require('./models/font')


module.exports.salvar_font_db = async function (x) {

    let cadastro = await font.findOne({
        where: {
            font: x
        }
    })

    if (cadastro === null) {

        return await font.create({
            font: x

        }).then(res => {

            //console.log(res)
            return (res)
        })

    } else {

        return "cadastrado"

    }
}