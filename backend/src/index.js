import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: permite que el frontend (en otro origen/puerto) haga peticiones a esta API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
