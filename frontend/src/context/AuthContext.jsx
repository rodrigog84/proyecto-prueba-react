import { createContext, useContext, useState } from 'react';

// Usamos ?? en vez de || para que string vacío ("") sea válido.
// En Docker, VITE_API_URL="" → las URLs son relativas (/api/...) y Nginx las proxifica.
// En desarrollo local, VITE_API_URL="http://localhost:3001" apunta directo al backend.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Al iniciar, recuperamos el token y el usuario de sessionStorage
  // (si el usuario recargó la página, no pierde la sesión)
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));

  async function login(username, password) {
    // fetch reemplaza al formulario HTML que en PHP enviaba datos al servidor.
    // Aquí enviamos un POST con JSON al endpoint del backend.
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // El backend devolvió 401 u otro error
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    // Guardamos el token JWT y los datos del usuario en sessionStorage.
    // El token es el equivalente al ID de sesión que PHP guarda en la cookie PHPSESSID,
    // pero aquí el cliente lo gestiona explícitamente y lo envía en cada request.
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  // Función utilitaria para hacer peticiones autenticadas al backend.
  // Añade automáticamente el header Authorization con el JWT.
  async function authFetch(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (response.status === 401) {
      logout();
      throw new Error('Sesión expirada');
    }
    return response;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
