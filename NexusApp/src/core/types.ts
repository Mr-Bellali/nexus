export interface AuthState {
  authenticated: boolean;
  credentials?: Record<string, any>; 
  user: Record<string, any>;
  initialized: Boolean;
  socket: WebSocket | null;
  init: () => void;
  login: (user: any, credentials: any, token: any) => void; 
  logout: () => void;
  socketConnect: () => void;
  socketClose: () => void;
  uploadThumbnail: (file:any) => void
}
export type Credentials = {
  username: string;
  password: string
}