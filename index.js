//Pacotes
const sharp = require('sharp')

const express = require('express');
const {
    body,
    validationResult
} = require('express-validator');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const {
    registerFont,
    createCanvas,
    loadImage
} = require("canvas");
const fs = require("fs");
const app = express();
const cors = require('cors')
require('dotenv').config()
const multer = require('multer'); // aceita upload
const uploads = require('./upload').uploads
const modelo_de_dados = require('./config/modelo')
const camada_text = require('./text').camada_text
const multer_config = require('./config/multer_config');

const salvar_font_db = require('./salvar_font_db').salvar_font_db
const buscar_fonts = require('./buscar_font').buscar_fonts
const buscar_fonts_especifica = require('./buscar_font').buscar_fonts_especifica

const detect_AllFaces = require('./face_detect').detect_AllFaces

const font = require('./models/font')
const conn = require('./db/conn')
const {
    Op
} = require('sequelize')
//Utilitarios
app.use(
    express.urlencoded({ // para pegarmos o bory

        extended: true,
    })
)
app.use(express.json()) // para pegar o bory em JSON
app.use(bodyParser.json()) //receber dados via Json
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(cors());


//Todo - Home
app.get('/', (req, res) => { // para renderizar a home;
    res.render('home')
})

//Todo - mostra fonts
app.get('/registro_fonts', (req, res) => {

    buscar_fonts(res)

})

//Todo - rota uploads fonts
app.post('/font', multer(multer_config).single('font'), (req, res) => {
    const font_name = req.file.filename


    salvar_font_db(font_name, res)

})

//todo - Rota modelo
app.get("/Modelo/", (req, res, next) => {

    return res.status(200).send({
        modelo_de_dados
    }).end()
})

const validation = [

    body("canvas.width").bail().not().isEmpty().isNumeric().withMessage("somente numero"),
    body("canvas.height").bail().not().isEmpty().isNumeric().withMessage("somente numero"),
    body("canvas.color").bail().not().isEmpty(),
    body("modifications").custom(value => {
        let dados_name = value.map(el => el.name)
        let array_2 = ['mokup', 'foto', 'text']

        for (var i = 0; i < dados_name.length; i++) {
            var array = dados_name[i];
            if (array_2.includes(array) === false) {

                return Promise.reject("erro")
            }
        }
        return true;
    }).bail().withMessage("Na Propriedade => name <== so aceita: ['mokup', 'foto', 'text']"),

    body("modifications").custom(value => {
        let dados_name = value.map(el => el.tipo)
        let array_2 = ['image', 'text']

        for (var i = 0; i < dados_name.length; i++) {
            var array = dados_name[i];
            if (array_2.includes(array) === false) {

                return Promise.reject("erro")
            }
        }
        return true;
    }).bail().withMessage("Na Propriedade => tipo <== so aceita :['image','text']"),

    body("modifications").custom(async value => {
        let dados_src = value.map(el => el.src)


        for (var i = 0; i < dados_src.length; i++) {

            if (dados_src[i] === '') {
                return Promise.reject("erro")
            }
        }
        return true;
    }).bail().withMessage("Na Propriedade => src <== não pode ficar vazio e tipo= image (deve conter uma Url valida) "),

    body("modifications").custom(value => {
        let dados_face = value.map(el => el.Face_Detection)
        var counts = {};
        dados_face.forEach(function (x) {
            counts[x] = (counts[x] || 0) + 1;
        });
        // console.log(counts.true);
        if (counts.true > 1) {

            return Promise.reject("erro")
        }
        return true;
    }).bail().withMessage("Na Propriedade => Face_Detection <== so podemos usar uma vez"),

    body("modifications").custom(value => {

        let dados_position_size = value.map(el => el.position_y)
        for (const key in dados_position_size) {
            const element = dados_position_size[key];
            if (isNaN(element) == true) {
                return Promise.reject("erro")
            }
        }
        let dados_position_size2 = value.map(el => el.position_x)
        for (const key in dados_position_size2) {
            const element = dados_position_size2[key];
            if (isNaN(element) == true) {
                return Promise.reject("erro")
            }
        }
        let dados_position_size5 = value.map(el => el.rotate)
        for (const key in dados_position_size5) {
            const element = dados_position_size5[key];
            if (isNaN(element) == true) {
                return Promise.reject("erro")
            }
        }

        return true;
    }).bail().withMessage("Na Propriedade => position_y,position_x,width,height,rotate <== so podemos usar numero"),

    body("modifications").custom(async value => {
        let dados_font = value.filter(el => el.font !== undefined)
        let dados_family = value.filter(el => el.font !== undefined)
        const x2 = dados_font[0].font


        return await font.findAll({
            where: {
                font: {
                    [Op.like]: `%${x2}`
                }
            },
            raw: true
        }).then(res => {
            console.log(res, "avan")
        })




        //! adegua o banco de dados com sequelize e acabar a validação da font


    }).withMessage("Na Propriedade => font <== so podemos usar font cadastrada, e esta nao se encontra cadastrada; Obs: confira a escrita")

]


// temos que validar a font se esta no banco de dados


//Todo - Rota de tratamento
app.post("/IMAGEM/", validation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    // res.json({
    //     msg: "sucesso"
    // })


    const modifications = req.body.modifications;
    const canvas_dados = req.body.canvas

    const width = parseInt(canvas_dados.width)
    const height = parseInt(canvas_dados.height)

    // montamos o tamnho do documento de fundo o matriz
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    //Definimos a base do quadro
    context.fillStyle = canvas_dados.color //"#f000";
    context.fillRect(0, 0, width, height);



    class controler_personalization {

        static personalização_camada_02 = (a, b, c, d) => {

            loadImage(modifications[0].src).then((image_0) => {

                const width = parseInt(modifications[0].width)
                const height = parseInt(modifications[0].height)
                const position_x = parseInt(modifications[0].position_x)
                const position_y = parseInt(modifications[0].position_y)
                canvas.getContext('2d')
                context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                context.rotate(modifications[0].rotate * Math.PI / 180);
                context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                (modifications[0].Face_Detection == true) ? context.drawImage(image_0, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_0, position_x, position_y, width * 1, height * 1)
                context.restore();


                let operador_ternario_1;

                let camada_1 = modifications[1].tipo

                if (camada_1 == "text") {

                    operador_ternario_1 = camada_text(modifications, 1, canvas_dados)

                } else {
                    operador_ternario_1 = modifications[1].src
                }


                loadImage(operador_ternario_1).then((image_1) => {
                    context.translate(parseInt(modifications[0].position_x) + parseInt(modifications[0].width) * 1 / 2, parseInt(modifications[0].position_y) + parseInt(modifications[0].height) * 1 / 2);
                    context.rotate(parseInt(-modifications[0].rotate) * Math.PI / 180);
                    context.translate(parseInt(-modifications[0].position_x) - parseInt(modifications[0].width) * 1 / 2, parseInt(-modifications[0].position_y) - parseInt(modifications[0].height) * 1 / 2);

                    if (camada_1 == "text") {
                        const width = parseInt(canvas_dados.width)

                        const height = parseInt(canvas_dados.height)
                        const position_x = 0
                        const position_y = 0

                        context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                        context.rotate(modifications[1].rotate * Math.PI / 180);
                        context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                        context.drawImage(image_1, position_x, position_y, width, height);

                    } else {

                        const width = parseInt(modifications[1].width)
                        const height = parseInt(modifications[1].height)
                        const position_x = parseInt(modifications[1].position_x)
                        const position_y = parseInt(modifications[1].position_y)
                        context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                        context.rotate(modifications[1].rotate * Math.PI / 180);
                        context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                        (modifications[1].Face_Detection == true) ? context.drawImage(image_1, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_1, position_x, position_y, width * 1, height * 1)
                        context.restore();

                    }
                    const buffer = canvas.toBuffer("image/png");
                    const image_02 = ("./image.png", buffer);

                    // fs.writeFileSync("./testefinalxxxx.png", buffer, (err) => {
                    //     if (err) throw err;
                    //     res.end()
                    // });

                    uploads(image_02, res)
                })
            })
        };
        static personalização_camada_03 = (a, b, c, d) => {

            loadImage(modifications[0].src).then((image_0) => {

                const width = parseInt(modifications[0].width)
                const height = parseInt(modifications[0].height)
                const position_x = parseInt(modifications[0].position_x)
                const position_y = parseInt(modifications[0].position_y)
                context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                context.rotate(modifications[0].rotate * Math.PI / 180);
                context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                (modifications[0].Face_Detection == true) ? context.drawImage(image_0, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_0, position_x, position_y, width * 1, height * 1)
                context.restore();

                let operador_ternario_1;

                let camada_1 = modifications[1].tipo

                if (camada_1 == "text") {

                    operador_ternario_1 = camada_text(modifications, 1, canvas_dados)

                } else {
                    operador_ternario_1 = modifications[1].src
                }

                loadImage(operador_ternario_1).then((image_1) => {
                    context.translate(parseInt(modifications[0].position_x) + parseInt(modifications[0].width) * 1 / 2, parseInt(modifications[0].position_y) + parseInt(modifications[0].height) * 1 / 2);
                    context.rotate(parseInt(-modifications[0].rotate) * Math.PI / 180);
                    context.translate(parseInt(-modifications[0].position_x) - parseInt(modifications[0].width) * 1 / 2, parseInt(-modifications[0].position_y) - parseInt(modifications[0].height) * 1 / 2);

                    if (camada_1 == "text") {
                        const width = parseInt(canvas_dados.width);
                        const height = parseInt(canvas_dados.height);
                        const position_x = 0;
                        const position_y = 0;

                        context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                        context.rotate(modifications[1].rotate * Math.PI / 180);
                        context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                        context.drawImage(image_1, position_x, position_y, width, height);

                    } else {
                        const width = parseInt(modifications[1].width)
                        const height = parseInt(modifications[1].height)
                        const position_x = parseInt(modifications[1].position_x)
                        const position_y = parseInt(modifications[1].position_y)
                        context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                        context.rotate(modifications[1].rotate * Math.PI / 180);
                        context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                        (modifications[1].Face_Detection == true) ? context.drawImage(image_1, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_1, position_x, position_y, width * 1, height * 1)
                        context.restore();

                    };

                    let operador_ternario_2;

                    let camada_2 = modifications[2].tipo

                    if (camada_2 == "text") {

                        operador_ternario_2 = camada_text(modifications, 2, canvas_dados)

                    } else {
                        operador_ternario_2 = modifications[2].src
                    }



                    loadImage(operador_ternario_2).then((image_2) => {
                        context.translate(parseInt(modifications[1].position_x) + parseInt(modifications[1].width) * 1 / 2, parseInt(modifications[1].position_y) + parseInt(modifications[1].height) * 1 / 2);
                        context.rotate(parseInt(-modifications[1].rotate) * Math.PI / 180);
                        context.translate(parseInt(-modifications[1].position_x) - parseInt(modifications[1].width) * 1 / 2, -parseInt(modifications[1].position_y) - parseInt(modifications[1].height) * 1 / 2);

                        if (camada_2 == "text") {
                            const width = parseInt(canvas_dados.width);
                            const height = parseInt(canvas_dados.height);
                            const position_x = 0;
                            const position_y = 0;

                            context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                            context.rotate(modifications[2].rotate * Math.PI / 180);
                            context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                            context.drawImage(image_2, position_x, position_y, width, height);

                        } else {

                            const width = parseInt(modifications[2].width);
                            const height = parseInt(modifications[2].height);
                            const position_x = parseInt(modifications[2].position_x);
                            const position_y = parseInt(modifications[2].position_y);
                            canvas.getContext('2d')
                            context.save();
                            context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                            context.rotate(modifications[2].rotate * Math.PI / 180);
                            context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                            (modifications[2].Face_Detection == true) ? context.drawImage(image_2, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_2, position_x, position_y, width * 1, height * 1)
                            context.restore();


                        };

                        const buffer = canvas.toBuffer("image/png");
                        const image_03 = ("./image.png", buffer);

                        // fs.writeFileSync("./testefinal333.png", buffer, (err) => {
                        //     if (err) throw err;
                        //     res.end()
                        // });

                        uploads(image_03, res)


                    })
                })
            })

        };

        static personalização_camada_04 = (a, b, c, d) => {

            loadImage(modifications[0].src).then((image_0) => {

                const width = parseInt(modifications[0].width)
                const height = parseInt(modifications[0].height)
                const position_x = parseInt(modifications[0].position_x)
                const position_y = parseInt(modifications[0].position_y)
                context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                context.rotate(parseInt(modifications[0].rotate) * Math.PI / 180);
                context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                (modifications[0].Face_Detection == true) ? context.drawImage(image_0, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_0, position_x, position_y, width * 1, height * 1)
                context.restore();


                let operador_ternario_1;

                let camada_1 = modifications[1].tipo

                if (camada_1 == "text") {

                    operador_ternario_1 = camada_text(modifications, 1, canvas_dados)

                } else {
                    operador_ternario_1 = modifications[1].src
                }

                loadImage(operador_ternario_1).then((image_1) => {

                    context.translate(parseInt(modifications[0].position_x) + parseInt(modifications[0].width) * 1 / 2, parseInt(modifications[0].position_y) + parseInt(modifications[0].height) * 1 / 2);
                    context.rotate(parseInt(-modifications[0].rotate) * Math.PI / 180);
                    context.translate(parseInt(-modifications[0].position_x) - parseInt(modifications[0].width) * 1 / 2, parseInt(-modifications[0].position_y) - parseInt(modifications[0].height) * 1 / 2);

                    if (camada_1 == "text") {
                        const width = parseInt(canvas_dados.width);
                        const height = parseInt(canvas_dados.height);
                        const position_x = 0;
                        const position_y = 0;
                        context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                        context.rotate(modifications[1].rotate * Math.PI / 180);
                        context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                        context.drawImage(image_1, position_x, position_y, width, height);

                    } else {
                        const width = parseInt(modifications[1].width)
                        const height = parseInt(modifications[1].height)
                        const position_x = parseInt(modifications[1].position_x)
                        const position_y = parseInt(modifications[1].position_y)
                        context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                        context.rotate(modifications[1].rotate * Math.PI / 180);
                        context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                        (modifications[1].Face_Detection == true) ? context.drawImage(image_1, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_1, position_x, position_y, width * 1, height * 1)
                        context.restore();

                    };

                    let operador_ternario_2;

                    let camada_2 = modifications[2].tipo

                    if (camada_2 == "text") {

                        operador_ternario_2 = camada_text(modifications, 2, canvas_dados)

                    } else {
                        operador_ternario_2 = modifications[2].src
                    }

                    loadImage(operador_ternario_2).then((image_2) => {
                        context.translate(parseInt(modifications[1].position_x) + parseInt(modifications[1].width) * 1 / 2, parseInt(modifications[1].position_y) + parseInt(modifications[1].height) * 1 / 2);
                        context.rotate(parseInt(-modifications[1].rotate) * Math.PI / 180);
                        context.translate(parseInt(-modifications[1].position_x) - parseInt(modifications[1].width) * 1 / 2, -parseInt(modifications[1].position_y) - parseInt(modifications[1].height) * 1 / 2);

                        if (camada_2 == "text") {
                            const width = parseInt(canvas_dados.width);
                            const height = parseInt(canvas_dados.height);
                            const position_x = 0;
                            const position_y = 0;
                            context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                            context.rotate(modifications[2].rotate * Math.PI / 180);
                            context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                            context.drawImage(image_2, position_x, position_y, width, height);

                        } else {
                            const width = parseInt(modifications[2].width);
                            const height = parseInt(modifications[2].height);
                            const position_x = parseInt(modifications[2].position_x);
                            const position_y = parseInt(modifications[2].position_y);
                            canvas.getContext('2d')
                            context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                            context.rotate(modifications[2].rotate * Math.PI / 180);
                            context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                            (modifications[2].Face_Detection == true) ? context.drawImage(image_2, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_2, position_x, position_y, width * 1, height * 1)
                            context.restore();

                        };
                        let operador_ternario_3;

                        let camada_3 = modifications[3].tipo

                        if (camada_3 == "text") {

                            operador_ternario_3 = camada_text(modifications, 3, canvas_dados)

                        } else {
                            operador_ternario_3 = modifications[3].src
                        }
                        loadImage(operador_ternario_3).then((image_3) => {
                            context.translate(parseInt(modifications[2].position_x) + parseInt(modifications[2].width) * 1 / 2, parseInt(modifications[2].position_y) + parseInt(modifications[2].height) * 1 / 2);
                            context.rotate(parseInt(-modifications[2].rotate) * Math.PI / 180);
                            context.translate(parseInt(-modifications[2].position_x) - parseInt(modifications[2].width) * 1 / 2, parseInt(-modifications[2].position_y) - parseInt(modifications[2].height) * 1 / 2);

                            if (camada_3 == "text") {
                                const width = parseInt(canvas_dados.width);
                                const height = parseInt(canvas_dados.height);
                                const position_x = 0;
                                const position_y = 0;
                                context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                                context.rotate(parseInt(modifications[3].rotate) * Math.PI / 180);
                                context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                                context.drawImage(image_3, position_x, position_y, width, height);

                            } else {
                                const width = parseInt(modifications[3].width);
                                const height = parseInt(modifications[3].height);
                                const position_x = parseInt(modifications[3].position_x);
                                const position_y = parseInt(modifications[3].position_y);
                                canvas.getContext('2d')
                                context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                                context.rotate(parseInt(modifications[3].rotate) * Math.PI / 180);
                                context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                                (modifications[3].Face_Detection == true) ? context.drawImage(image_3, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_3, position_x, position_y, width * 1, height * 1)
                                context.restore();

                            };

                            const buffer = canvas.toBuffer("image/png");
                            const image_04 = ("./image.png", buffer);

                            // fs.writeFileSync("./testefinal444.png", buffer, (err) => {
                            //     if (err) throw err;
                            //     res.end()
                            // });

                            uploads(image_04, res)

                        })
                    })
                })

            })

        };
        static personalização_camada_05 = (a, b, c, d) => {
            loadImage(modifications[0].src).then((image_0) => {

                const width = parseInt(modifications[0].width)
                const height = parseInt(modifications[0].height)
                const position_x = parseInt(modifications[0].position_x)
                const position_y = parseInt(modifications[0].position_y)
                context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                context.rotate(parseInt(modifications[0].rotate) * Math.PI / 180);
                context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                (modifications[0].Face_Detection == true) ? context.drawImage(image_0, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_0, position_x, position_y, width * 1, height * 1)
                context.restore();

                let operador_ternario_1;

                let camada_1 = modifications[1].tipo

                if (camada_1 == "text") {

                    operador_ternario_1 = camada_text(modifications, 1, canvas_dados)

                } else {
                    operador_ternario_1 = modifications[1].src
                }

                loadImage(operador_ternario_1).then((image_1) => {

                    context.translate(parseInt(modifications[0].position_x) + parseInt(modifications[0].width) * 1 / 2, parseInt(modifications[0].position_y) + parseInt(modifications[0].height) * 1 / 2);
                    context.rotate(parseInt(-modifications[0].rotate) * Math.PI / 180);
                    context.translate(parseInt(-modifications[0].position_x) - parseInt(modifications[0].width) * 1 / 2, parseInt(-modifications[0].position_y) - parseInt(modifications[0].height) * 1 / 2);

                    if (camada_1 == "text") {
                        const width = parseInt(canvas_dados.width);
                        const height = parseInt(canvas_dados.height);
                        const position_x = 0;
                        const position_y = 0;
                        context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                        context.rotate(modifications[1].rotate * Math.PI / 180);
                        context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                        context.drawImage(image_1, position_x, position_y, width, height);

                    } else {
                        const width = parseInt(modifications[1].width)
                        const height = parseInt(modifications[1].height)
                        const position_x = parseInt(modifications[1].position_x)
                        const position_y = parseInt(modifications[1].position_y)
                        context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                        context.rotate(modifications[1].rotate * Math.PI / 180);
                        context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                        (modifications[1].Face_Detection == true) ? context.drawImage(image_1, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_1, position_x, position_y, width * 1, height * 1)
                        context.restore();

                    };

                    let operador_ternario_2;

                    let camada_2 = modifications[2].tipo

                    if (camada_2 == "text") {

                        operador_ternario_2 = camada_text(modifications, 2, canvas_dados)

                    } else {
                        operador_ternario_2 = modifications[2].src
                    }

                    loadImage(operador_ternario_2).then((image_2) => {

                        context.translate(parseInt(modifications[1].position_x) + parseInt(modifications[1].width) * 1 / 2, parseInt(modifications[1].position_y) + parseInt(modifications[1].height) * 1 / 2);
                        context.rotate(parseInt(-modifications[1].rotate) * Math.PI / 180);
                        context.translate(parseInt(-modifications[1].position_x) - parseInt(modifications[1].width) * 1 / 2, -parseInt(modifications[1].position_y) - parseInt(modifications[1].height) * 1 / 2);

                        if (camada_2 == "text") {
                            const width = parseInt(canvas_dados.width);
                            const height = parseInt(canvas_dados.height);
                            const position_x = 0;
                            const position_y = 0;
                            context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                            context.rotate(modifications[2].rotate * Math.PI / 180);
                            context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                            context.drawImage(image_2, position_x, position_y, width, height);

                        } else {
                            const width = parseInt(modifications[2].width);
                            const height = parseInt(modifications[2].height);
                            const position_x = parseInt(modifications[2].position_x);
                            const position_y = parseInt(modifications[2].position_y);
                            context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                            context.rotate(modifications[2].rotate * Math.PI / 180);
                            context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                            (modifications[2].Face_Detection == true) ? context.drawImage(image_2, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_2, position_x, position_y, width * 1, height * 1)
                            context.restore();
                        };
                        let operador_ternario_3;

                        let camada_3 = modifications[3].tipo

                        if (camada_3 == "text") {

                            operador_ternario_3 = camada_text(modifications, 3, canvas_dados)

                        } else {
                            operador_ternario_3 = modifications[3].src
                        }
                        loadImage(operador_ternario_3).then((image_3) => {
                            context.translate(parseInt(modifications[2].position_x) + parseInt(modifications[2].width) * 1 / 2, parseInt(modifications[2].position_y) + parseInt(modifications[2].height) * 1 / 2);
                            context.rotate(parseInt(-modifications[2].rotate) * Math.PI / 180);
                            context.translate(parseInt(-modifications[2].position_x) - parseInt(modifications[2].width) * 1 / 2, parseInt(-modifications[2].position_y) - parseInt(modifications[2].height) * 1 / 2);

                            if (camada_3 == "text") {

                                const width = parseInt(canvas_dados.width);
                                const height = parseInt(canvas_dados.height);
                                const position_x = 0;
                                const position_y = 0;
                                context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                                context.rotate(parseInt(modifications[3].rotate) * Math.PI / 180);
                                context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                                context.drawImage(image_3, position_x, position_y, width, height);

                            } else {
                                const width = parseInt(modifications[3].width);
                                const height = parseInt(modifications[3].height);
                                const position_x = parseInt(modifications[3].position_x);
                                const position_y = parseInt(modifications[3].position_y);
                                context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                                context.rotate(parseInt(modifications[3].rotate) * Math.PI / 180);
                                context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                                (modifications[3].Face_Detection == true) ? context.drawImage(image_3, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_3, position_x, position_y, width * 1, height * 1)
                                context.restore();

                            };
                            let operador_ternario_4;

                            let camada_4 = modifications[4].tipo

                            if (camada_4 == "text") {

                                operador_ternario_4 = camada_text(modifications, 4, canvas_dados)

                            } else {
                                operador_ternario_4 = modifications[4].src
                            }
                            loadImage(operador_ternario_4).then((image_4) => {
                                context.translate(parseInt(modifications[3].position_x) + parseInt(modifications[3].width) * 1 / 2, parseInt(modifications[3].position_y) + parseInt(modifications[3].height) * 1 / 2);
                                context.rotate(parseInt(-modifications[3].rotate) * Math.PI / 180);
                                context.translate(parseInt(-modifications[3].position_x) - parseInt(modifications[3].width) * 1 / 2, -parseInt(modifications[3].position_y) - parseInt(modifications[3].height) * 1 / 2);

                                if (camada_4 == "text") {
                                    const width = parseInt(canvas_dados.width);
                                    const height = parseInt(canvas_dados.height);
                                    const position_x = 0;
                                    const position_y = 0;
                                    context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                                    context.rotate(parseInt(modifications[4].rotate) * Math.PI / 180);
                                    context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);
                                    context.drawImage(image_4, position_x, position_y, width, height);

                                } else {
                                    const width = parseInt(modifications[4].width);
                                    const height = parseInt(modifications[4].height);
                                    const position_x = parseInt(modifications[4].position_x);
                                    const position_y = parseInt(modifications[4].position_y);
                                    context.translate(position_x + width * 1 / 2, position_y + height * 1 / 2);
                                    context.rotate(parseInt(modifications[4].rotate) * Math.PI / 180);
                                    context.translate(-position_x - width * 1 / 2, -position_y - height * 1 / 2);

                                    (modifications[4].Face_Detection == true) ? context.drawImage(image_4, a, b, c, d, position_x, position_y, width * 1, height * 1): context.drawImage(image_4, position_x, position_y, width * 1, height * 1)
                                    context.restore();

                                };

                                const buffer = canvas.toBuffer("image/png");
                                const image_05 = ("./image.png", buffer);

                                // fs.writeFileSync("./testefinal555.png", buffer, (err) => {
                                //     if (err) throw err;
                                //     res.end()
                                // });

                                uploads(image_05, res)

                            })
                        })
                    })
                })
            })

        };

    }


    //Colocar a formula dinamica e tambem colocar colocar seletor no detect

    let seletor_camadas = modifications.length

    let date_busc = modifications.map(el => el.Face_Detection)
    const categorizador = (date_busc.indexOf(true))

    // console.log(seletor_camadas) console.log(date_busc) console.log(categorizador)


    switch (seletor_camadas) {
        case 2:

            (categorizador == -1) ? controler_personalization.personalização_camada_02():
                detect_AllFaces(modifications[categorizador].src).then(function (data) {
                    controler_personalization.personalização_camada_02(data.x, data.y, data.width, data.height)
                })


            break;
        case 3:

            (categorizador == -1) ? controler_personalization.personalização_camada_03():
                detect_AllFaces(modifications[categorizador].src).then(function (data) {
                    controler_personalization.personalização_camada_03(data.x, data.y, data.width, data.height)
                })

            break;
        case 4:
            (categorizador == -1) ? controler_personalization.personalização_camada_04():
                detect_AllFaces(modifications[categorizador].src).then(function (data) {
                    controler_personalization.personalização_camada_04(data.x, data.y, data.width, data.height)
                })

            break;
        case 5:
            (categorizador == -1) ? controler_personalization.personalização_camada_05():
                detect_AllFaces(modifications[categorizador].src).then(function (data) {
                    controler_personalization.personalização_camada_05(data.x, data.y, data.width, data.height)
                })

            break;
    };

})

app.listen(process.env.PORT_APP, () => {
    console.log(`Servidor iniciado na porta`)
});

// conn.sync({
//     force: true
// }).then(() => {

//     app.listen(3010)

// }).catch((err) => {

//     console.log(err)
// });