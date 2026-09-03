import pool from './pool.js'
import bcrypt from 'bcrypt'
import { generarIdUnico } from '../utils/generarId.js'

async function migrateUsuariosEmpresas() {
  try {
    console.log('🚀 Creando tabla usuarios_empresas...')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios_empresas (
        id VARCHAR(12) PRIMARY KEY,
        empresa VARCHAR(100) NOT NULL,
        nombre VARCHAR(150) NOT NULL,
        correo VARCHAR(150) NOT NULL,
        contrasena VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL CHECK (rol IN ('Chef', 'Empleado')),
        activo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT uq_empresa_correo UNIQUE (empresa, correo)
      );

      CREATE INDEX IF NOT EXISTS idx_usuarios_empresas_empresa ON usuarios_empresas(empresa);
      CREATE INDEX IF NOT EXISTS idx_usuarios_empresas_correo ON usuarios_empresas(correo);
    `)
    console.log('✅ Tabla e índices de usuarios_empresas creados con éxito.')

    // Semilla para Royal Canin
    const demoUsers = [
      {
        empresa: 'Royal Canin',
        nombre: 'Chef Ejecutivo Royal Canin',
        correo: 'chef.royal@nutriker.com',
        contrasena: 'Chef123!',
        rol: 'Chef'
      },
      {
        empresa: 'Royal Canin',
        nombre: 'Empleado Participante Royal Canin',
        correo: 'empleado.royal@nutriker.com',
        contrasena: 'Empleado123!',
        rol: 'Empleado'
      }
    ]

    for (const user of demoUsers) {
      const existing = await pool.query(
        'SELECT id FROM usuarios_empresas WHERE empresa = $1 AND correo = $2',
        [user.empresa, user.correo]
      )

      if (existing.rowCount === 0) {
        const id = await generarIdUnico('usuarios_empresas')
        const hash = await bcrypt.hash(user.contrasena, 10)
        await pool.query(
          `INSERT INTO usuarios_empresas (id, empresa, nombre, correo, contrasena, rol)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, user.empresa, user.nombre, user.correo, hash, user.rol]
        )
        console.log(`👤 Usuario creado: ${user.correo} (${user.rol}) - ID: ${id}`)
      } else {
        console.log(`ℹ️ Usuario ya existe: ${user.correo}`)
      }
    }

    console.log('🎉 Migración y seed de usuarios_empresas completados exitosamente.')
  } catch (error) {
    console.error('❌ Error en la migración de usuarios_empresas:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrateUsuariosEmpresas()
