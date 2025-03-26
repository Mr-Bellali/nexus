import { create } from 'zustand'
import { GlobalState, Credentials } from './types';
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
  if (user.account.id === connection.sender.id) {
    const searchList = [...get().searchList]
    const searchIndex = searchList.findIndex(
      request => request.id === connection.receiver.id
    )
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
  if (user.account.id === connection.receiver.id) {
    const requestsList = [...get().requestsList]
    const requestIndex = requestsList.findIndex(
      request => request.id === connection.id
    )
    if (requestIndex >= 0) {
      requestsList.splice(requestIndex, 1)
      set((state) => ({
        requestsList
      }))
    }
  }
  // Update the state of the acceptence of the sender if he's connected
  const sl = get().searchList
  if (sl === null) {
    return
  }
  const searchList = [...sl]


  let searchIndex = -1
  if (user.account.id === connection.receiver.id) {
    searchIndex = searchList.findIndex(
      user => user.id === connection.sender.id
    )
  } else {
    searchIndex = searchList.findIndex(
      user => user.id === connection.receiver.id
    )
  }

  if (searchIndex >= 0) {
    searchList[searchIndex].status = 'connected'
    set((state) => ({
      searchList
    }))
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

function responseFriends(set: Function, get: Function, friendsList: Object) {
  set((state) => ({
    friendsList
  }))
}

function responseNewFriend(set: Function, get: Function, friend: Object) {
  const friendsList = [friend, ...get().friendsList]
  set((state) => ({
    friendsList
  }))
}

function responseMessagesList(set: Function, get: Function, data: any) {
  console.log("data.messagesData.next: ", data.next)
  set((state) => ({
    messagesList: [...get().messagesList, ...data.messagesData.messages],
    messagesNext: data.next,
    // messagesId: data.friend.id
  }))
}

function responseMessage(set: Function, get: Function, data: any) {
  const friendId = data.friend.friend.id
  const friendsList = [...get().friendsList]

  console.log("data: ", data)
  console.log("friendId: ", friendId)
  console.log("friends list: ", friendsList)

  const friendIndex = friendsList.findIndex(
    item => item.friend.id === friendId
  )
  console.log("friend id: ", friendId)
  console.log("friend index: ", friendIndex)
  if (friendIndex >= 0) {
    const item = friendsList[friendIndex]
    console.log("item: ", item)
    item.preview = data.preview
    item.updatedAt = data.updatedAt
    friendsList.splice(friendIndex, 1)
    friendsList.unshift(item)
    set((state) => ({
      friendsList
    }))
    console.log("new friendlist: ", friendsList)
  }
  // if (friendId !== get().messagesId) {
  //   return
  // }

  console.log("old messages list: ", get().messagesList)

  const messagesList = [data.message, ...get().messagesList]

  console.log("new messages list: ", messagesList)

  set((state) => ({
    messagesList,
    messagesTyping: null
  }))

  console.log("is messages list is updated?? ", get().messagesList)
}

function responseTypingMessage(set: Function, get: Function, data: any){
  if(data.receiverId === get().messagesId) return
  set((state) => ({
    messagesTyping: new Date()
  }))
}

const useGlobal = create<GlobalState>((set, get) => ({
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
      socket.send(JSON.stringify({
        source: 'friends'
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
        'request-accept': responseRequestAccept,
        'friends': responseFriends,
        'messageslist': responseMessagesList,
        'message': responseMessage,
        'new-friend': responseNewFriend,
        'typing-message': responseTypingMessage
      }
      const resp = responses[parsed.source]
      if (!resp) {
        utils.log(`parsed source ['${parsed.source}']not found`)
        return
      }
      utils.log("parsed.source : ", parsed.source)
      utils.log("parsed data: ", parsed)

      // Call responses function 
      resp(set, get, parsed.data);
    }

    socket.onerror = (event: any) => {
      // const parsed = JSON.parse(event.error)
      console.error('socket.onError')
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
  //  Friends
  // -------------------------------------------------------- \\
  friendsList: null,

  // -------------------------------------------------------- \\
  //  Messages
  // -------------------------------------------------------- \\
  messagesList: [],
  messagesId: null,
  messagesTyping: null,
  messagesNext: null,
  media: "",

  getMessagesList: (id, page = 0) => {
    if (page === 0) {
      set((state) => ({
        messagesList: [],
        messagesId: null,
        messagesTyping: null,
        messagesNext: null,
      }))
    }
    const socket = get().socket
    socket?.send(JSON.stringify({
      source: 'messageslist',
      id,
      page
    }))
  },
  messageSend: (id, message) => {
    const socket = get().socket
    socket?.send(JSON.stringify({
      source: 'message',
      type: 'text',
      id,
      content: message
    }))
  },
  typingMessage: (id) => {
    const socket = get().socket
    socket?.send(JSON.stringify({
      source: 'typing-message',
      id,
    }))
  },
  selectMedia: (media) => {
    set((state) => ({
      media
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
