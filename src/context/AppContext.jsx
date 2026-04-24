import React, { createContext, useContext, useReducer } from 'react';

// Context for the whole app – now uses a static dummy user
const AppContext = createContext(null);

const isDebugMode = import.meta.env.VITE_BYPASS_AUTH === 'true';

const initialState = {
  // If BYPASS_AUTH is true, use dummy user, otherwise start with null
  user: isDebugMode ? { uid: 'dummy-uid', email: 'user@example.com' } : null,
  loading: !isDebugMode,
  activeTab: 'home',
  currentVideo: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'START_VIDEO_CHAT':
      return { ...state, activeTab: 'coach', currentVideo: action.payload };
    case 'CLEAR_VIDEO_CHAT':
      return { ...state, currentVideo: null };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  React.useEffect(() => {
    // Only set up Firebase listener if we are NOT in bypass mode
    if (import.meta.env.VITE_BYPASS_AUTH !== 'true') {
      const { auth } = import('../lib/firebase'); 
      const { onAuthStateChanged } = import('firebase/auth');
      
      let unsub;
      Promise.all([import('../lib/firebase'), import('firebase/auth')]).then(([{ auth }, { onAuthStateChanged }]) => {
        unsub = onAuthStateChanged(auth, user => {
          dispatch({ type: 'SET_USER', payload: user });
        });
      });
      return () => unsub && unsub();
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
