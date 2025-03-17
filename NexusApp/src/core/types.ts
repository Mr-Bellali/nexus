export interface AuthState {
  authenticated: boolean;
  credentials?: Record<string, any>; 
  user: Record<string, any>;
  login: (user: any, credentials: any) => void; 
  logout: () => void;
}
