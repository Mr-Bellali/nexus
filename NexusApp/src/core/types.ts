export interface User {
  id: number,
  thumbnail: string | null,
  firstName: string,
  lastName: string,
  username: string,
  status: string
}

export interface GlobalState {
  authenticated: boolean;
  credentials?: Record<string, any>;
  user: Record<string, any>;
  initialized: Boolean;
  socket: WebSocket | null;
  searchList: User[] | null;
  requestsList: any[] | null;
  friendsList: any[] | null;
  messagesList: any[] | null;
  messagesId: number | null;
  messagesTyping: any;
  messagesNext: any;
  init: () => void;
  login: (user: any, credentials: any, token: any) => void;
  logout: () => void;
  socketConnect: () => void;
  socketClose: () => void;
  uploadThumbnail: (file: any) => void
  searchUsers: (query: string) => void
  requestConnect: (id: number) => void;
  requestAccept : (id: string) => void
  messageSend: (id: string, message: string) => void
  getMessagesList: (id: string, page? :number) => void
  typingMessage: (id: number) => void;
}
export type Credentials = {
  username: string;
  password: string
}