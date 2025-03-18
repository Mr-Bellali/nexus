import { create } from 'zustand'
import { AuthState, Credentials } from './types';
import secure from './secure';
import api, { ADDRESS } from './api';
import utils from './utils';


const useGlobal = create<AuthState>((set, get) => ({
  // -------------------------------------------------------- \\
  //  Initialization
  // -------------------------------------------------------- \\
  initialized: false,

  init: async () => {
    const credentials: Credentials = await secure.get('credentials')
    if (credentials) {
      try {
        const response = await api({
          method: 'POST',
          url: '/auth/login',
          data: {
            username: credentials.username,
            password: credentials.password
          }
        })
        if (response.status !== 200) {
          throw 'Authentication error'
        }
        const user = response.data.user
        const token = response.data.user.token
        secure.set('token', token)
        set((state) => ({
          initialized: true,
          authenticated: true,
          user,
        }));
        return
      } catch (error) {
        console.error("error: ", error);
      }
    }
    set((state) => ({
      initialized: true,
    }));
  },

  // -------------------------------------------------------- \\
  //  Authentication
  // -------------------------------------------------------- \\

  authenticated: false,
  user: {},

  login: (user: any, credentials: any, token: any) => {
    secure.set('credentials', credentials)
    secure.set('token', token)

    set((state) => ({
      authenticated: true,
      user: user,
    }));
  },

  logout: () => {
    secure.wipe()
    set((state) => ({
      authenticated: false,
      user: {},
    }));
  },

  // -------------------------------------------------------- \\
  //  WebSocket
  // -------------------------------------------------------- \\
  socket: null,
  socketConnect: async () => {
    const token = await secure.get('token')

    const socket = new WebSocket(
      `ws://${ADDRESS}/chat?token=${token}`
    )

    socket.onopen = () => {
      utils.log('socket.open')
    }

    socket.onmessage = () => {
      utils.log('socket.onMessage')
    }

    socket.onerror = () => {
      utils.log('socket.onError')
    }

    socket.onclose = () => {
      utils.log('socket.onClose')
    }

    set((state) => ({ socket }));

  },
  socketClose: () => {

  },

  // -------------------------------------------------------- \\
  //  Thumbnail
  // -------------------------------------------------------- \\
  uploadThumbnail: (file) => {
    const socket = get().socket
    socket?.send(JSON.stringify({
      source: 'uploadthumbnail',
      base64: file.base64,
      filename: file.fileName
    }))
  }

}));



export default useGlobal;
