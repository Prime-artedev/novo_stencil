const faceapi = require("face-api.js")
const canvas = require("canvas")

// mokey pathing the faceapi canvas
const {
    Canvas,
    Image,
    ImageData
} = canvas
faceapi.env.monkeyPatch({
    Canvas,
    Image,
    ImageData
})

const faceDetectionNet = faceapi.nets.ssdMobilenetv1

// SsdMobilenetv1Options
const minConfidence = 0.5

// TinyFaceDetectorOptions
const inputSize = 408
const scoreThreshold = 0.5

// MtcnnOptions
const minFaceSize = 50
const scaleFactor = 0.8

function getFaceDetectorOptions(net) {
    return net === faceapi.nets.ssdMobilenetv1 ?
        new faceapi.SsdMobilenetv1Options({
            minConfidence
        }) :
        (net === faceapi.nets.tinyFaceDetector ?
            new faceapi.TinyFaceDetectorOptions({
                inputSize,
                scoreThreshold
            }) :
            new faceapi.MtcnnOptions({
                minFaceSize,
                scaleFactor
            })
        )
}

const faceDetectionOptions = getFaceDetectorOptions(faceDetectionNet)


async function detect_AllFaces(imagen_detection) {

    // load weights
    await faceDetectionNet.loadFromDisk('weights')
    await faceapi.nets.faceLandmark68Net.loadFromDisk('weights')

    // load the image
    const img = await canvas.loadImage(imagen_detection)

    // detect the faces with landmarks
    const results = await faceapi.detectAllFaces(img, faceDetectionOptions)
        .withFaceLandmarks()
    // create a new canvas and draw the detection and landmarks
    const out = await faceapi.createCanvasFromMedia(img)


    let box = {
        x: results[0].alignedRect._box._x - 140,
        y: results[0].alignedRect._box._y - 100,
        width: results[0].alignedRect._box._width + 300,
        height: results[0].alignedRect._box._height + 300
    }

    return box

}

exports.detect_AllFaces = detect_AllFaces

// async function teste() {

//     await run().then(function (box) {

//         console.log(box)
//     })

// }