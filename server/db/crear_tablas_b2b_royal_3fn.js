import pool from './pool.js'

async function migrateB2BTablas3FN() {
  const client = await pool.connect()
  try {
    console.log('🚀 Iniciando creación de tablas B2B bajo 3FN (Tercera Forma Normal)...')
    await client.query('BEGIN')

    // 1. Cabecera del Menú Semanal
    await client.query(`
      CREATE TABLE IF NOT EXISTS menus_b2b (
        id VARCHAR(12) PRIMARY KEY,
        empresa VARCHAR(100) NOT NULL,
        semana_key VARCHAR(10) NOT NULL,
        semana_numero INT NOT NULL,
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE NOT NULL,
        dias_servicio INT NOT NULL DEFAULT 5,
        titulo_opcion_a VARCHAR(150),
        titulo_opcion_b VARCHAR(150),
        publicado BOOLEAN DEFAULT TRUE,
        nutriologa_id VARCHAR(12) REFERENCES usuarios(id) ON DELETE SET NULL,
        publicado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_menu_empresa_semana UNIQUE (empresa, semana_key)
      );
    `)
    console.log('✅ Tabla menus_b2b creada exitosamente.')

    // 2. Detalle Atómico de Opciones y Recetas por Día (1FN / 2FN / 3FN)
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_b2b_dias (
        id VARCHAR(12) PRIMARY KEY,
        menu_id VARCHAR(12) NOT NULL REFERENCES menus_b2b(id) ON DELETE CASCADE,
        dia_semana VARCHAR(20) NOT NULL,
        fecha DATE NOT NULL,
        tipo_opcion CHAR(1) NOT NULL CHECK (tipo_opcion IN ('A', 'B')),
        nombre_platillo VARCHAR(200) NOT NULL,
        categoria VARCHAR(150),
        calorias INT DEFAULT 0,
        proteinas_g NUMERIC(5,2) DEFAULT 0,
        carbohidratos_g NUMERIC(5,2) DEFAULT 0,
        grasas_g NUMERIC(5,2) DEFAULT 0,
        ingredientes TEXT,
        metodo_preparacion TEXT,
        imagen_url TEXT,
        CONSTRAINT uq_menu_dia_opcion UNIQUE (menu_id, dia_semana, tipo_opcion)
      );
    `)
    console.log('✅ Tabla menu_b2b_dias creada exitosamente.')

    // 3. Cabecera de Pedidos B2B Semanales
    await client.query(`
      CREATE TABLE IF NOT EXISTS pedidos_b2b (
        id VARCHAR(12) PRIMARY KEY,
        empresa VARCHAR(100) NOT NULL,
        usuario_id VARCHAR(12) NOT NULL,
        menu_id VARCHAR(12) NOT NULL REFERENCES menus_b2b(id) ON DELETE CASCADE,
        semana_key VARCHAR(10) NOT NULL,
        estado VARCHAR(50) DEFAULT 'confirmado' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_pedido_usuario_semana UNIQUE (usuario_id, semana_key)
      );
    `)
    console.log('✅ Tabla pedidos_b2b creada exitosamente.')

    // 4. Detalle Atómico de Elección por Día (1FN / 2FN / 3FN)
    await client.query(`
      CREATE TABLE IF NOT EXISTS pedido_b2b_detalles (
        id VARCHAR(12) PRIMARY KEY,
        pedido_id VARCHAR(12) NOT NULL REFERENCES pedidos_b2b(id) ON DELETE CASCADE,
        menu_dia_id VARCHAR(12) REFERENCES menu_b2b_dias(id) ON DELETE SET NULL,
        dia_semana VARCHAR(20) NOT NULL,
        opcion_seleccionada CHAR(1) NOT NULL CHECK (opcion_seleccionada IN ('A', 'B')),
        notas_adicionales TEXT,
        CONSTRAINT uq_pedido_dia UNIQUE (pedido_id, dia_semana)
      );
    `)
    console.log('✅ Tabla pedido_b2b_detalles creada exitosamente.')

    // Índices de optimización relacional
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_menus_b2b_empresa_semana ON menus_b2b(empresa, semana_key);
      CREATE INDEX IF NOT EXISTS idx_menu_b2b_dias_menu_id ON menu_b2b_dias(menu_id);
      CREATE INDEX IF NOT EXISTS idx_pedidos_b2b_semana ON pedidos_b2b(empresa, semana_key);
      CREATE INDEX IF NOT EXISTS idx_pedido_detalles_pedido ON pedido_b2b_detalles(pedido_id);
    `)
    console.log('✅ Índices de rendimiento creados exitosamente.')

    await client.query('COMMIT')
    console.log('🎉 Migración 3FN completada exitosamente.')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error ejecutando migración 3FN:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrateB2BTablas3FN()
