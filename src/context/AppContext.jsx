import React, { createContext, useContext, useReducer } from 'react';

// Context for the whole app – now uses a static dummy user
const AppContext = createContext(null);

const initialState = {
  // Dummy signed‑in user (you can change the email here)
  user: { uid: 'dummy-uid', email: 'user@example.com' },
  loading: false,
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

  // No Firebase listener – user is preset above
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
