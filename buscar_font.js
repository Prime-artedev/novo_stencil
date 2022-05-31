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
module.exports.buscar_fonts_especifica = async function (font) {

    const sql = await `SELECT * FROM app_stylos WHERE font LIKE '%${font}%'`
    console.log(sql)
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
            // console.log(result.length)
            return result




            // // return (result[0].font)
        })



    })

}