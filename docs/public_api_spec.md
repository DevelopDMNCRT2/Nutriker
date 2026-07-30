# Especificación de API Gateway Público (Cliente) 🌐

Este documento define las especificaciones exactas de los endpoints públicos del servidor backend `server/` para ser consumidos por el cliente web (`client/`) de **NutriKer**.

---

## 🛍️ 1. Catálogo de Productos Públicos

Devuelve la lista de productos disponibles en la tienda con su stock, categoría e imágenes.

- **Endpoint:** `GET /api/public/productos`
- **Autenticación:** Ninguna (Pública)

### Respuesta de Ejemplo (`200 OK`):

```json
[
  {
    "id": "PRD-101",
    "nombre": "Proteína Aislada NutriKer Vanilla 1kg",
    "descripcion": "Suplemento alimenticio de alta pureza.",
    "descripcion_detallada": "Proteína aislada de suero de leche enriquecida con aminoácidos esenciales.",
    "precio": "850.00",
    "descuento": "10.00",
    "precio_final": "765.00",
    "stock": 25,
    "imagen_principal": "/uploads/proteina-vanilla.png",
    "galeria": [],
    "categoria_nombre": "Suplementos Nutricionales"
  }
]
```

---

## 🚚 2. Zonas de Envío Activas

Devuelve las zonas de entrega configuradas y sus tarifas para la selección en el checkout.

- **Endpoint:** `GET /api/public/zonas-envio`
- **Autenticación:** Ninguna (Pública)

### Respuesta de Ejemplo (`200 OK`):

```json
[
  {
    "id": "ZON-001",
    "nombre": "Zona Centro (CDMX)",
    "tipo_region": "Local",
    "costo": "50.00",
    "tiempo_entrega": "24 a 48 horas"
  }
]
```

---

## 🛒 3. Procesar Compra / Checkout

Registra la orden de compra y guarda los detalles de los productos adquiridos por el paciente.

- **Endpoint:** `POST /api/public/checkout`
- **Autenticación:** Ninguna (Pública)
- **Headers:** `Content-Type: application/json`

### Cuerpo del Request (`POST Body`):

```json
{
  "cliente_nombre": "Carlos Alberto Ruiz",
  "cliente_email": "carlos.ruiz@gmail.com",
  "cliente_telefono": "5512345678",
  "direccion_entrega": "Av. Insurgentes Sur 456, Col. Roma Sur",
  "ciudad": "Ciudad de México",
  "zona_envio_id": "ZON-001",
  "metodo_pago": "Tarjeta de Crédito/Débito",
  "items": [
    {
      "producto_id": "PRD-101",
      "producto_nombre": "Proteína Aislada NutriKer Vanilla 1kg",
      "cantidad": 2,
      "precio_unitario": 765.00
    }
  ]
}
```

### Respuesta de Ejemplo (`201 Created`):

```json
{
  "mensaje": "Orden registrada y procesada exitosamente",
  "orden": {
    "id": "ORD-789",
    "cliente_nombre": "Carlos Alberto Ruiz",
    "total": "1530.00",
    "estado_orden": "Pagado",
    "estado_envio": "En preparación",
    "created_at": "2026-07-30T15:00:00.000Z"
  }
}
```

---

## 📅 4. Agendar Cita Pública en Línea

Permite a los pacientes agendar consultas clínicas desde el portal público.

- **Endpoint:** `POST /api/public/citas`
- **Autenticación:** Ninguna (Pública)
- **Headers:** `Content-Type: application/json`

### Cuerpo del Request (`POST Body`):

```json
{
  "cliente_nombre": "Sofía Montenegro",
  "cliente_telefono": "5544332211",
  "fecha": "2026-08-05",
  "horario": "10:30",
  "atencion_previa": "no",
  "peso": 68.5,
  "estatura": 165
}
```

### Respuesta de Ejemplo (`201 Created`):

```json
{
  "mensaje": "Cita agendada con éxito",
  "cita": {
    "id": "CIT-302",
    "cliente_nombre": "Sofía Montenegro",
    "fecha": "2026-08-05",
    "horario": "10:30",
    "created_at": "2026-07-30T15:00:00.000Z"
  }
}
```

### Error de Conflicto de Horario (`409 Conflict`):

```json
{
  "error": "Lo sentimos, el horario 10:30 del 2026-08-05 ya se encuentra reservado. Por favor selecciona otro horario.",
  "codigo": "HORARIO_OCUPADO"
}
```
