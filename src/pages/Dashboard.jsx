import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Banco de nombres y categorías para generar productos aleatorios
const NAMES = ['Laptop Pro X', 'Monitor UltraWide', 'Teclado Mecánico', 'Mouse Inalámbrico',
  'Auriculares BT', 'Webcam 4K', 'Hub USB-C', 'SSD Externo 1TB', 'Micrófono Studio',
  'Silla Ergonómica', 'Escritorio Standing', 'Cámara Mirrorless', 'Tablet Gráfica', 'Router WiFi 6'];
const CATEGORIES = ['Electrónica', 'Periféricos', 'Audio', 'Almacenamiento', 'Mobiliario', 'Fotografía', 'Redes'];
const STATUSES = ['En stock', 'Bajo stock', 'Agotado'];
const STATUS_COLORS = { 'En stock': '#22c55e', 'Bajo stock': '#f59e0b', 'Agotado': '#ef4444' };

function generateProducts(count = 6) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    price: (Math.random() * 900 + 50).toFixed(2),
    stock: Math.floor(Math.random() * 100),
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
  }));
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  function handleLogout() {
    logout(); // session_destroy() en PHP
    navigate('/login');
  }

  function handleLoadProducts() {
    setLoading(true);
    setLoaded(false);
    // Simulamos una llamada a una API con un delay (como un fetch() a una URL)
    setTimeout(() => {
      setProducts(generateProducts(6));
      setLoading(false);
      setLoaded(true);
    }, 800);
  }

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="header-logo">⚡</span>
          <h1>Panel Principal</h1>
        </div>
        <div className="header-right">
          <div className="user-badge">
            <span className="user-avatar">👤</span>
            <span>Hola, <strong>{user?.username}</strong></span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Bienvenido al Dashboard</h2>
          <p>
            Sesión activa como <strong>{user?.username}</strong> ({user?.role}).
            Tu sesión persiste en <code>sessionStorage</code> mientras el navegador esté abierto.
          </p>
        </div>

        <div className="products-section">
          <div className="section-header">
            <h3>Inventario de Productos</h3>
            <button
              onClick={handleLoadProducts}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Cargando...' : '🔄 Cargar productos aleatorios'}
            </button>
          </div>

          {!loaded && !loading && (
            <div className="empty-state">
              <span>📦</span>
              <p>Haz clic en el botón para cargar datos</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Consultando inventario...</p>
            </div>
          )}

          {loaded && !loading && (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-header">
                    <span className="product-name">{product.name}</span>
                    <span
                      className="product-status"
                      style={{ color: STATUS_COLORS[product.status] }}
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className="product-body">
                    <div className="product-detail">
                      <span className="detail-label">Categoría</span>
                      <span className="detail-value">{product.category}</span>
                    </div>
                    <div className="product-detail">
                      <span className="detail-label">Precio</span>
                      <span className="detail-value price">${product.price}</span>
                    </div>
                    <div className="product-detail">
                      <span className="detail-label">Stock</span>
                      <span className="detail-value">{product.stock} uds.</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
