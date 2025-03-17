import { create } from 'zustand'
import { AuthState } from './types';
import secure from './secure';


const useGlobal = create<AuthState>((set) => ({
  // -------------------------------------------------------- \\
  //  Authentication
  // -------------------------------------------------------- \\

  authenticated: false,
  user: {},

  login: (user: any, credentials:any ) => {
    secure.set('credentials', credentials)
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
}));

export default useGlobal;
