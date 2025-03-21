import { create } from 'zustand'
import { AuthState, Credentials } from './types';
import secure from './secure';
import api, { ADDRESS } from './api';
import utils from './utils';

// -------------------------------------------------------- \\
//  Socket recieve message handlers
// -------------------------------------------------------- \\

function responseRequestConnect(set: Function, get: Function, connection: any) {
  const user = get().user

  // If the one who's sending the request
  // Update the search list row
  console.log("user: ", user.account)
  console.log("connection id: ", connection.sender.id)
  if (user.account.id === connection.sender.id) {
    const searchList = [...get().searchList]
    const searchIndex = searchList.findIndex(
      request => request.id === connection.receiver.id
    )
    console.log("search index: ", searchIndex)
    if (searchIndex >= 0) {
      searchList[searchIndex].status = 'pending-them'
      set((state) => ({
        searchList: searchList
      }))
    }
  } else {
    const requestsList = [...get().requestsList]
    const requestIndex = requestsList.findIndex(
      request => request.sender.id === connection.sender.id
    )
    if (requestIndex === -1) {
      requestsList.unshift(connection)
      set((state) => ({
        requestsList
      }))
    }
  }
}

function responseRequestList(set: Function, get: Function, requestsList: any) {
  set((state) => ({
    requestsList
  }))
}

function responseRequestAccept(set: Function, get: Function, connection: any) {
  const user = get().user

  // If I was the one who accepted the request
  // Remove the request from requestsList
  if(user.account.id === connection.sender.id) {
    const requestsList = [...get().requestsList]
    const requestIndex = requestsList.findIndex(
      request => request.id === connection.id
    )
    if(requestIndex >= 0 ) {
      requestsList.splice(requestIndex, 1)
      set((state) => ({
        requestsList
      }))
    }
  }

}

function responseThumbnail(set: Function, get: Function, data: Object) {
  set((state) => ({
    user: {
      account: data
    }
  }
  ))

}

function responseSearch(set: Function, get: Function, data: Object) {
  set((state) => ({
    searchList: data ? data : null
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
      socket.send(JSON.stringify({
        source: 'request-list'
      }))
    }

    socket.onmessage = (event) => {
      // Convert data to json
      const parsed = JSON.parse(event.data)
      const responses: any = {
        'thumbnail': responseThumbnail,
        'search': responseSearch,
        "request-connect": responseRequestConnect,
        'request-list': responseRequestList,
        'request-accept': responseRequestAccept
      }
      const resp = responses[parsed.source]
      if (!resp) {
        utils.log(`parsed source ['${parsed.source}']not found`)
        return
      }
      // Call responses function 
      resp(set, get, parsed.data);
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
  //  Requests
  // -------------------------------------------------------- \\
  requestsList: null,

  requestConnect: (id: number) => {
    const socket = get().socket
    socket?.send(JSON.stringify({
      source: 'request-connect',
      id
    }))
  },

  requestAccept: (id: string) => {
    const socket = get().socket
    socket?.send(JSON.stringify({
      source: 'request-accept',
      id
    }))
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
  },

}));



export default useGlobal;
