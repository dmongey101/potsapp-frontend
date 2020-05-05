import io from 'socket.io-client'

const baseURL = 'http://127.0.0.1:3000'

const socket = io.connect(baseURL)

export { socket, baseURL }