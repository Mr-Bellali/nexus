export interface AuthState {
  authenticated: boolean;
  credentials?: Record<string, any>; 
  user: Record<string, any>;
  initialized: Boolean;
  init: () => void;
  login: (user: any, credentials: any) => void; 
  logout: () => void;
}
export type Credentials = {
  username: string;
  password: string
}