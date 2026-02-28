import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001'

let socket: Socket | null = null
let _userId: string | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id)
      if (_userId) {
        socket?.emit('join_user', _userId)
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })
  }
  return socket
}

export function connectSocket(token: string) {
  const s = getSocket()
  s.auth = { token }
  if (!s.connected) {
    s.connect()
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  _userId = null
}

export function joinUserRoom(userId: string) {
  _userId = userId
  const s = getSocket()
  if (s.connected) {
    s.emit('join_user', userId)
  }
}
