import { Socket } from 'socket.io'

export interface SocketWithUserId extends Socket {
  data: {
    userId?: string
  }
  handshake: Socket['handshake'] & {
    auth: Socket['handshake']['auth'] & {
      userId?: string
    }
  }
}
