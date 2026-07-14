# Próximos Pasos - Bicicletas Paysandú

Este archivo sirve como recordatorio de las tareas pendientes y mejoras futuras para continuar el desarrollo del proyecto.

---

## 1. Tareas del Backend (Servidor)
* **Integración real con Cal.com API**:
  - Actualmente, el sistema de cancelación local funciona en base de datos. Para que cancele las reuniones de Cal.com de forma real, asegúrate de añadir la clave `CAL_API_KEY` en el archivo `server/.env`.
* **Seguridad del Webhook**:
  - Para producción, es importante activar la firma de validación de webhook de Cal.com añadiendo `CAL_WEBHOOK_SECRET` al archivo `server/.env`.
* **Pruebas de Correo y Autenticación**:
  - Validar los flujos de recuperación de contraseñas de Supabase y notificaciones automáticas de Cal.com.

---

## 2. Tareas del Frontend (Cliente Next.js)
* **Página de Catálogo (`/catalogo`)**:
  - Conectar la página de catálogo para consumir los productos reales desde el endpoint del backend (`GET /api/catalog`) en lugar de usar datos estáticos.
* **Dashboard del Administrador (`/admin`)**:
  - Asegurar de que la carga de imágenes en el formulario de creación de productos permita subir archivos a un bucket de almacenamiento de Supabase Storage, o acepte URLs de imágenes públicas seguras.
* **Integración del Widget en el Dashboard**:
  - Verificar que el token JWT del cliente logueado se pase correctamente a todas las llamadas de la API para proteger las rutas.

---

## 3. Comandos Útiles para Iniciar el Proyecto
* **Iniciar Servidor (con Nodemon)**:
  ```bash
  cd server && npm run dev
  ```
* **Iniciar Frontend (Next.js)**:
  ```bash
  cd client && npm run dev
  ```
