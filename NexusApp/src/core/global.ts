import { create } from 'zustand'
import { AuthState, Credentials } from './types';
import secure from './secure';
import api, { ADDRESS } from './api';
import utils from './utils';

// -------------------------------------------------------- \\
//  Socket recieve message handlers
// -------------------------------------------------------- \\
function responseThumbnail(set: Function, get: Function, data: Object) {
  set((state) => ({
    user: {
      account: data
    }
  }))
}

function responseSearch(set: Function, get: Function, data: Object) {
  utils.log("response search data:", data)
  set((state) => ({
    searchList: data
  }))
  set((state) => ({
    user: {
      account: data
    }
  }))
}



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

    socket.onmessage = (event) => {
      // Convert data to json
      const parsed = JSON.parse(event.data)
      const responses: any = {
        'thumbnail': responseThumbnail,
        'search': responseSearch
      }
      const resp = responses[parsed.source]
      if (!resp) {
        utils.log('parsed source [ ', parsed.source, ' ]not found')
        return
      }
      // Call responses function 
      responseThumbnail(set, get, parsed.account)
      responseSearch(set, get, parsed.users)
    }

    socket.onerror = () => {
      utils.log('socket.onError')
    }

    socket.onclose = () => {
      const socket = get().socket
      if (socket) {
        socket.close()
      }
      set((state) => ({
        socket: null
      }))
    }

    set((state) => ({ socket }));

  },
  socketClose: () => {

  },

  // -------------------------------------------------------- \\
  //  Searching
  // -------------------------------------------------------- \\
  searchList: null,

  searchUsers: (query: string) => {

    if (query) {

      const socket = get().socket
      socket?.send(JSON.stringify({
        source: 'search',
        content: query
      }))
    } else {
      set((state) => ({
        searchList: null
      }))
    }

  },

  // -------------------------------------------------------- \\
  //  Thumbnail
  // -------------------------------------------------------- \\
  uploadThumbnail: (file) => {
    const socket = get().socket
    socket?.send(JSON.stringify({
      source: 'thumbnail',
      type: 'upload',
      base64: file.base64,
      filename: file.fileName
    }))
  }

}));



export default useGlobal;
