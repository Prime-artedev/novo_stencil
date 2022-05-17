const rp = require('request-promise');

module.exports.uploads = function (image, res) {


    const client_id = "e3c9fc845f296f2"
    let options = {
        method: 'POST',
        uri: 'https://api.imgur.com/3/image',
        headers: {

            "Authorization": `Client-ID ${client_id}`,

        },
        body: image

    };
    rp(options)
        .then(json => {

            const dados_bruto = JSON.parse(json);
            const image_upload = dados_bruto.data.link
            return res.status(200).send({
                image_upload: image_upload
            }).end()

        }).catch(err => {
            console.log('Problems!: ' + err.message);

        })


}