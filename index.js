//Pacotes
const express = require('express');
const exphbs = require('express-handlebars');
const {
    createCanvas,
    loadImage
} = require("canvas");
const fs = require("fs");
const app = express();
const cors = require('cors')

//Utilitarios
app.use(
    express.urlencoded({ // para pegarmos o bory

        extended: true,
    })
)
app.use(express.json()) // para pegar o bory em JSON
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.use(express.static('public'));

//Extenção
//Função que faz a quebra do texto
const {
    formatTitle
} = require("./formatTitle");


//Todo - Home
app.get('/', (req, res) => { // para renderizar a home;
    res.render('home')
})

//! Rota trabalhar personalização letra
//Todo - codigo abaixo

//Todo - Rota de tratamento
app.get("/IMAGEM/", (req, res, next) => {

    //const dados = req.body.dados;

    // dados = {
    //     //tamanho da imagen
    //     width: 1000,
    //     height: 1000,

    //     //image
    //     mockup: "https://cdn.usestencil.com/uploads/69c3c935-0906-407e-a155-511df554b06b/c106ac17-a830-4680-a4fa-4db19fbf9b37/globo-play-2-sem-fundo-2-1109504032.png",

    //     Foto: "https://cdn.usestencil.com/uploads/69c3c935-0906-407e-a155-511df554b06b/c106ac17-a830-4680-a4fa-4db19fbf9b37/portrait-happy-smiley-man-1083944675.jpg",

    //     //Texto:
    //     texto_01: "Thiago"
    // }

    // montamos o tamanho da imagem
    // const width = 1000;
    // const height = 1000;

    const width = 1000;
    const height = 1777;

    // montamos o tamnho do documento de fundo o matriz
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    const context_01 = canvas.getContext("2d");
    const context_02 = canvas.getContext("2d");
    const context_03 = canvas.getContext("2d");

    //Definimos a base do quadro
    context.fillStyle = "#f000";
    context.fillRect(0, 0, width, height);


    //Todo - style - 01
    //const texto_01 = "Thiago"
    const texto_01 = " "

    //posição primeiro texto
    const texto_1_A = 690;
    const texto_1_l = 640;
    const lineHeight = 100; //posição da segunda linha


    context_01.font = "bold 50pt 'Menlo'";
    context_01.fillStyle = "#fff"


    //Texto a ser enviado ate 40 caracteres ira quebrar em 2 linhas
    const text = formatTitle(texto_01);
    context_01.fillText(text[0], texto_1_l, texto_1_A);
    if (text[1]) context.fillText(text[1], texto_1_l, texto_1_A + lineHeight);


    //Todo - style - 02

    const texto2 = ""

    //posição do texto
    const texto_2_A = 150;
    const texto_2_l = 500

    context_02.fillStyle = "#66ff66";
    //edição da texto 2
    context_02.font = "40pt 'PT Sans'";
    context_02.fillText(`${texto2}`, texto_2_l, texto_2_A);

    //Todo - style - 03

    const texto3 = ""

    //posição do texto
    const texto_3_A = 800;
    const texto_3_l = 200;

    //estilo da frase
    context_03.textBaseline = 'top'
    context_03.font = "50pt 'PT Sans'";
    context_03.fillStyle = '#f000'

    //Estilo do quadro
    const textWidth = context_03.measureText(texto3).width
    context_03.fillRect(texto_3_l - textWidth / 25 - 90, texto_3_A - 40, textWidth + 200, 150)
    context_03.fillStyle = '#f000'
    context_03.fillText(texto3, texto_3_l, texto_3_A)


    //todo - Posição das imagens
    //Posição da imagen dinamica
    // const Position_mockup = {
    //     w: 0,
    //     h: 0,
    //     x: dados.width,
    //     y: dados.height,
    // }
    const Position_mockup = {
        w: 0,
        h: 0,
        x: width,
        y: height,
    }
    const Position_Foto = {
        w: 70, //largura esquerda para direita posição
        h: 591, //altura de cima para baixo posição
        y: 740, //altura tamanho
        x: 878, //largura tamanho
    }
    // const Position_Foto = {
    //     w: dados.posição_foto.w, //altura
    //     h: dados.posição_foto.h,
    //     x: dados.posição_foto.x,
    //     y: dados.posição_foto.y
    // }


    //montamos a imagem e enviamos para o projt final
    // let mockup = "https://cdn-0.imagensemoldes.com.br/wp-content/uploads/2018/07/Imagem-de-Festa-Cartaz-com-Bexigas-de-Anivers%C3%A1rio-PNG.png"

    // let Foto = "https://img.freepik.com/fotos-gratis/imagem-aproximada-em-tons-de-cinza-de-uma-aguia-careca-americana-em-um-fundo-escuro_181624-31795.jpg?w=740&t=st=1650491943~exp=1650492543~hmac=152791b7668606587891d3ec8546a565e50a72f091602572c99466cc15306dc5"


    //montamos a imagem e enviamos para o projt final
    // let mockup = dados.mockup

    // let Foto = dados.Foto

    let mockup = "https://cdn.usestencil.com/uploads/69c3c935-0906-407e-a155-511df554b06b/e6d7a186-6965-4268-9004-bb6bcaa86c1c/arte-1701354715.png"

    let Foto = "https://cdn.usestencil.com/uploads/69c3c935-0906-407e-a155-511df554b06b/c106ac17-a830-4680-a4fa-4db19fbf9b37/portrait-happy-smiley-man-1083944675.jpg"


    // salvamos o texto em camada
    const buffer = canvas.toBuffer("image/png");
    let texto_imag = ("./texto.png", buffer);



    loadImage(Foto).then((image) => {
        const {
            w,
            h,
            x,
            y
        } = Position_Foto;
        context.drawImage(image, w, h, x, y);

        loadImage(mockup).then((image2) => {
            const {
                w,
                h,
                x,
                y
            } = Position_mockup;
            context.drawImage(image2, w, h, x, y);

            loadImage(texto_imag).then((image3) => {
                const {
                    w,
                    h,
                    x,
                    y
                } = Position_mockup;
                context.drawImage(image3, w, h, x, y);


                // salvamos o caminho da imagem e tambem o tipo do arquivo
                const buffer = canvas.toBuffer("image/png");
                fs.writeFileSync("./teste10.png", buffer, (err) => {

                    if (err) throw err;

                    res.end()
                });


            });

        });

    });

    return res.status(200).send("arquivo criado").end()

})

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado na porta 3000: http://localhost:3000/")
});