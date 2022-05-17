const poll = require('./db/conn')


module.exports.buscar_fonts = async function (res) {

    const sql = await `SELECT * FROM app_stylos`

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
            }
            return res.status(200).send({
                response: result
            })

        })
    })



}