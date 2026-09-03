import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'nutriker_secreto_super_seguro_2024'

export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decodificado = jwt.verify(token, JWT_SECRET)
    req.usuario = decodificado // { id, correo, rol }

    // BLINDAJE DE SEGURIDAD PARA ROL "RRHH"
    // Si es RRHH, solo puede acceder a /api/citas y /api/auth
    if (req.usuario.rol === 'RRHH') {
      const isAllowed = req.originalUrl.startsWith('/api/citas') || req.originalUrl.startsWith('/api/auth')
      if (!isAllowed) {
        return res.status(403).json({ error: 'Acceso denegado: El rol de RRHH solo tiene permisos para acceder a la Agenda (Citas).' })
      }
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Acceso denegado: Token inválido o expirado' })
  }
}

// Middleware de Control de Acceso Basado en Roles (RBAC)
export function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Acceso denegado: No autenticado' })
    }
    
    // El Administrador tiene acceso global
    if (req.usuario.rol === 'Administrador' || rolesPermitidos.includes(req.usuario.rol)) {
      return next()
    }

    return res.status(403).json({ 
      error: `Acceso denegado: Se requiere el rol ${rolesPermitidos.join(' o ')}` 
    })
  }
}

