const {
    formatTitle
} = require("./formatTitle");
const fs = require("fs");
const path = require('path');
const {
    registerFont,
    createCanvas,
} = require("canvas");


module.exports.camada_text = function (modifications, variador, canvas_dados) {

    let modelo = `${modifications[variador].font.toLowerCase()}`
    let family = `${modifications[variador].family.toLowerCase()}`

    const font = {
        name: `'${family}'`,
        src: path.join(__dirname, `./fonts/${modelo}.ttf`)
    }

    registerFont(font.src, {
        family: font.name
    });

    const width = canvas_dados.width
    const height = canvas_dados.height
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    const texto = modifications[variador].text

    //posição primeiro texto
    const position_y = modifications[variador].position_y
    const position_x = modifications[variador].position_x
    const lineHeight = modifications[variador].position_2_line; //posição da segunda linha
    //estilo

    context.font = `'${modifications[variador].estilo} ${modifications[variador].tamanho} ${modifications[variador].family.toLowerCase()} '`;


    //cor
    context.fillStyle = modifications[variador].cor;

    //Texto a ser enviado ate 40 caracteres ira quebrar em 2 linhas
    const text = formatTitle(texto);
    context.fillText(text[0], position_x, position_y);

    if (text[1]) {
        context.fillText(text[1], position_x, position_y + lineHeight, )
    };

    const buffer = canvas.toBuffer("image/png");
    return texto_image = ("./texto.png", buffer);
    // return fs.writeFileSync("./testefunca.png", buffer, (err) => {

    //     if (err) throw err;

    //     res.end()
    // });
}