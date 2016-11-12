'use strict';

let ledCharacteristic = null
let dispositivoBluetooth
let estaConectado = false
const SERVICO_PRIMARIO_UUID = '0000ffb0-0000-1000-8000-00805f9b34fb'
const CARACTERISTICA_ESCRITA_UUID = '0000ffb2-0000-1000-8000-00805f9b34fb'

function conectado() {
    document.querySelector('.botao-conectar').classList.add('esconder')
    document.querySelector('.botoes-cor').classList.remove('esconder')
    estaConectado = true
}

function conectar() {

      console.log('Solicitando conecão com dispositivo bluetooth...')
      navigator.bluetooth.requestDevice(
          {
              filters: [{ services: [SERVICO_PRIMARIO_UUID] }]
          })
          .then(device => {
              dispositivoBluetooth = device
              console.log('> dispositivo encontrado ' + device.name)
              console.log('Conectando ao servidor GATT...')
              return device.gatt.connect()
          })
          .then(server => {
              console.log('Obtendo o serviço 0xffb2 - Controle da lampada...')
              return server.getPrimaryService(SERVICO_PRIMARIO_UUID)
          })
          .then(service => {
              console.log('Obtendo a caracteristica 0xffe9 - Controle da lampada...')
              return service.getCharacteristic(CARACTERISTICA_ESCRITA_UUID)
          })
          .then(characteristic => {
              console.log('Caracteristica encontrada!')
              ledCharacteristic = characteristic
              conectado()
          })
          .catch(error => {
              console.log('Argh! ' + error)
          })
}


function mudarCor(vermelho, verde, azul) {
    let data = new Uint8Array([azul, verde, vermelho, 0x00])
    return ledCharacteristic.writeValue(data)
        .catch(err => console.log('Erro ao escrever o valor na caracteristica! ', err))
}

function vermelho() {
    return mudarCor(255, 0, 0)
        .then(() => console.log('Cor modificada para vermelho'))
}

function verde() {
    return mudarCor(0, 255, 0)
        .then(() => console.log('Cor modificada para vermelho'))
}

function azul() {
    return mudarCor(0, 0, 255)
        .then(() => console.log('Cor modificada para vermelho'))
}
