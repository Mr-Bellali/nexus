export interface User {
  id: number,
  thumbnail: string | null,
  firstName: string,
  lastName: string,
  username: string,
  status: string
}

export interface AuthState {
  authenticated: boolean;
  credentials?: Record<string, any>;
  user: Record<string, any>;
  initialized: Boolean;
  socket: WebSocket | null;
  searchList: User[] | null;
  requestsList: any[] | null
  init: () => void;
  login: (user: any, credentials: any, token: any) => void;
  logout: () => void;
  socketConnect: () => void;
  socketClose: () => void;
  uploadThumbnail: (file: any) => void
  searchUsers: (query: string) => void
  requestAccept : (id: string) => void
}
export type Credentials = {
  username: string;
  password: string
}