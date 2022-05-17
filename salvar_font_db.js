const poll = require('./db/conn')


module.exports.salvar_font_db = async function (font, res) {

    const sql = await `INSERT INTO app_stylos (font) VALUE ('${font}')`

    poll.getConnection((error, conn) => {
        if (error) {
            return res.status(500).send({
                error: error
            })
        }


        conn.query(sql, (error, result, fields) => {
            if (error) {
                return res.status(500).send({
                    error: error
                })
            } else {
                return res.status(200).send(
                    "font Cadastrada"
                ).end()
            }

        })
    })

}