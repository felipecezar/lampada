let r = g = b = 255 //braco é a cor padrão

let ledCharacteristic = null
let dispositivoBluetooth
const SERVICO_PRIMARIO_UUID = '0000ffb0-0000-1000-8000-00805f9b34fb'
const CARACTERISTICA_ESCRITA_UUID = '0000ffb2-0000-1000-8000-00805f9b34fb'
let conectado = false

let botao = document.querySelector('#bt-conectar')
botao.addEventListener("click", conectar)

let cor = document.querySelector('#cor')

function conectar(){

    if (conectado) {
       dispositivoBluetooth.gatt.disconnect()
       botao.textContent= 'Conectar'
       conectado = false
       setCor(0,0,0)
       console.log('Dispositivo desconectado');
     }
     if(!conectado){
        //console.log('Solicitando conecão com dispositivo bluetooth...')
        navigator.bluetooth.requestDevice(
            {
                filters: [{ services: [SERVICO_PRIMARIO_UUID] }]
            })
            .then(device => {
                dispositivoBluetooth = device
                //console.log('> dispositivo encontrado ' + device.name)
                //console.log('Conectando ao servidor GATT...')
                return device.gatt.connect()
            })
            .then(server => {
                //console.log('Obtendo o serviço 0xffb2 - Controle da lampada...')
                return server.getPrimaryService(SERVICO_PRIMARIO_UUID)
            })
            .then(service => {
                //console.log('Obtendo a caracteristica 0xffe9 - Controle da lampada...')
                return service.getCharacteristic(CARACTERISTICA_ESCRITA_UUID)
            })
            .then(characteristic => {
                //console.log('Caracteristica encontrada!')
                ledCharacteristic = characteristic
                console.log('Dispositivo conectado')
                conectado = true
                botao.textContent= 'Desconectar'
                setCor(255,255,255)
            })
            .catch(error => {
                console.log('Argh! ' + error)
            })
    }



}

//seleção de cor

var img = new Image()
img.crossOrigin = ''


img.src = 'cores7.png'
img.onload = function() {
    let canvas = document.querySelector('canvas')
    let context = canvas.getContext('2d')
    canvas.width = 300
    canvas.height = 300

    canvas.addEventListener('click', desenha)

    function desenha(evt) {
        //redesenha a imagem caso o usuario tenha dado zoom
        canvas.width = 300
        canvas.height = 300
        context.drawImage(img, 0, 0, canvas.width, canvas.height)

        let rect = canvas.getBoundingClientRect()
        let x = Math.round((evt.clientX - rect.left))
        let y = Math.round((evt.clientY - rect.top))
        var data = context.getImageData(x, y, 1, 1).data
        console.log(data)
        r = data[0]
        g = data[1]
        b = data[2]





        let corHex =  '#' + rgb2Hex(r,g,b)
        cor.style.fill = corHex
        setCor(r,g,b)

        context.beginPath()
        context.arc(x, y + 2, 10 * devicePixelRatio, 0, 2 * Math.PI, false)
        context.shadowColor = '#333'
        context.shadowBlur = 4 * devicePixelRatio
        context.fillStyle = 'white'
        context.fill()

    }

    context.drawImage(img, 0, 0, canvas.width, canvas.height)



}

function rgb2Hex(r,g,b) {
    return toHex(r)+toHex(g)+toHex(b)
}
function toHex(n) {
    n = parseInt(n,10);
    if (isNaN(n)){
        return "00"
    }
    n = Math.max(0,Math.min(n,255))
    return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16)
}

function setCor(vermelho, verde, azul) {

    let data = new Uint8Array([azul, verde, vermelho, toHex(255)])
    return ledCharacteristic.writeValue(data)
        .catch(err => console.log('Erro ao escrever o valor na caracteristica! ', err))
}
