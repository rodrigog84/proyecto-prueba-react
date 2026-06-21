import { createContext, useContext, useState } from 'react';

// Credenciales simuladas (en PHP sería: define('USER', 'admin'); en config.php)
const FAKE_USER = 'admin';
const FAKE_PASS = '1234';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // useState es el equivalente a $_SESSION en PHP, pero vive en memoria del navegador.
  // Cuando el componente se monta por primera vez, buscamos si ya había una sesión
  // guardada en sessionStorage (similar a que PHP lea $_SESSION al inicio de cada página).
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  function login(username, password) {
    if (username === FAKE_USER && password === FAKE_PASS) {
      const userData = { username, role: 'admin' };
      // Guardar en sessionStorage es como hacer $_SESSION['user'] = $userData en PHP.
      // Se borra automáticamente al cerrar el navegador (igual que las sesiones de PHP
      // expiran al cerrar el browser si no usas cookies persistentes).
      sessionStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  }

  function logout() {
    // Equivalente a session_destroy() en PHP
    sessionStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto fácilmente desde cualquier componente
export function useAuth() {
  return useContext(AuthContext);
}
