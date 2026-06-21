import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/login
// Equivalente PHP:
//   $user = $pdo->fetch("SELECT * FROM users WHERE username = ?", [$username]);
//   if ($user && password_verify($password, $user['password'])) {
//     $_SESSION['user'] = $user;
//   }
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  try {
    // Buscar usuario en la BD por username
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      // Mismo mensaje genérico para no revelar si el usuario existe o no
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // bcrypt.compare compara el texto plano contra el hash guardado en BD
    // Equivalente a password_verify() en PHP
    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar JWT — es el "ticket" que el cliente guardará y enviará en cada petición
    // En PHP guardabas el usuario en $_SESSION (en el servidor).
    // Con JWT, el servidor firma un token y se lo da al cliente; el cliente lo envía de vuelta.
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me — devuelve los datos del usuario autenticado (requiere JWT válido)
// Útil para que el frontend verifique si el token sigue siendo válido al recargar la página
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, role: true }, // nunca devolver el password
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
