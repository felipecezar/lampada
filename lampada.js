let r = g = b = 255 //braco é a cor padrão

let ledCharacteristic = null
let dispositivoBluetooth
const SERVICO_PRIMARIO_UUID = '0000ffb0-0000-1000-8000-00805f9b34fb'
const CARACTERISTICA_ESCRITA_UUID = '0000ffb2-0000-1000-8000-00805f9b34fb'
let conectado = false

let btConectar = document.querySelector('#bt-conectar')
let btDesconectar = document.querySelector('#bt-desconectar')
let imgSeletorCor = document.querySelector('#img-seletorCor')

btConectar.addEventListener("click", conectar)
btDesconectar.addEventListener("click", desconectar)

let corLampada = document.querySelector('#corLampada')

function conectar(){

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
                setCor(255,255,255)
                btConectar.classList.add('esconder')
                btDesconectar.classList.remove('esconder')
                imgSeletorCor.classList.remove('esconder')

            })
            .catch(error => {
                console.log('Argh! ' + error)
            })
    }

}

function desconectar(){
    if (!dispositivoBluetooth) {
       return;
     }
     if (dispositivoBluetooth.gatt.connected) {
        conectado = false
        corLampada.style.fill = '#000'
        setCor(0,0,0)
        dispositivoBluetooth.gatt.disconnect()

        console.log('Dispositivo desconectado')

        btDesconectar.classList.add('esconder')
        btConectar.classList.remove('esconder')
        imgSeletorCor.classList.add('esconder')
     }
}

//seleção de cor
var img = new Image()
img.crossOrigin = ''


img.src = 'imagens/cores7.png'
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
        corLampada.style.fill = corHex

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
