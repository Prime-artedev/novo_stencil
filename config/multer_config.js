const multer = require('multer');
const path = require('path');

module.exports = {
    dest: path.resolve(__dirname, '..', './fonts'),
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '..', './fonts'))
        },
        filename: (req, file, cb) => {
            const file_name = `${file.originalname.toLowerCase()}`

            cb(null, file_name);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allwed_mines = [
            'font/ttf',
            'font/otf'
        ]
        //caso o arquivo nao for da categoria estipulada
        if (allwed_mines.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Tipo de arquivo invalido, somente ttf e otf"))
        }
    },

}