import jwt from 'jsonwebtoken';

// Middleware de autenticación — equivalente al guard de PHP:
//   if (!isset($_SESSION['user'])) { header('Location: login.php'); exit; }
// Pero en lugar de una sesión en el servidor, validamos un JWT que el cliente envía
// en cada request en el header Authorization: Bearer <token>
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // jwt.verify descifra el token y verifica que no fue manipulado ni expiró
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // lo adjuntamos al request, como PHP adjunta $_SESSION al scope
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
