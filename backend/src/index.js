import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS config:
// - En Docker el backend no está expuesto al exterior (solo Nginx llega a él),
//   así que podemos reflejar cualquier origen de forma segura.
// - En producción con dominio propio, setea CORS_ORIGIN=https://tudominio.com
const corsOrigin = process.env.CORS_ORIGIN;

const allowedOrigins = [
  /^https?:\/\/.*\.vercel\.app$/,
  'http://localhost:5173',
  'http://localhost',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // CORS_ORIGIN=* permite todo (útil en Docker detrás de Nginx)
    if (corsOrigin === '*' || !origin) return callback(null, true);
    const allowed = allowedOrigins.some((o) =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    allowed ? callback(null, true) : callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Parsear JSON en el body de las peticiones (equivalente a $_POST en PHP)
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Health check — útil para saber si el servidor está vivo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
