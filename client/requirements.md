# Requerimientos del Cliente - Bicicletas Paysandú

Este documento especifica los requerimientos funcionales, de diseño y de integración con el backend para la aplicación frontend de Bicicletas Paysandú, construida utilizando **Next.js**.

---

## 1. Descripción de la Aplicación
La aplicación es una plataforma web para una tienda y taller de bicicletas local en Paysandú. Sus dos funciones principales son:
1. Ofrecer un catálogo público de productos en dólares estadounidenses (USD).
2. Permitir a los clientes registrados reservar turnos en el taller mecánico mediante el agendamiento integrado de **Cal.com**, calculando tarifas de mano de obra en pesos uruguayos (UYU) y gestionando la agenda del taller.

El idioma de toda la interfaz de usuario debe ser estrictamente **Español**.

---

## 2. Roles de Usuario y Paneles

### A. Visitante (Usuario no registrado)
* **Página de Inicio (Home)**: Información comercial, horario, ubicación del local y sección "Sobre Nosotros".
* **Catálogo Público**: Galería interactiva (diseño en cuadrícula/grid) que muestra los productos cargados. Cada tarjeta (card) debe incluir:
  - Imagen principal
  - Título del producto
  - Precio formateado en **USD** (Dólares)
  - Botón de detalles para desplegar la descripción completa.

### B. Cliente (Usuario Registrado)
* **Autenticación**: Formularios de Registro e Inicio de sesión.
* **Dashboard del Cliente**:
  * **Agendar Turno (Taller)**: Integrar el widget interactivo de Cal.com (Embed).
    * Al renderizar el widget de Cal.com, se deben pasar las respuestas del usuario y pre-rellenar datos usando parámetros de consulta (query params):
      - Tipo de servicio (`Ajuste y Regulación`, `Servicio Básico` o `Engrase General`).
      - Marca de la bicicleta.
      - Correo del cliente (pre-rellenado automáticamente).
  * **Historial de Reservas**: Una tabla o lista que cargue el historial del cliente (reservas activas y pasadas) consumiendo el endpoint del backend. Debe mostrar:
    - Servicio, fecha, hora, marca de bicicleta, estado (confirmado o cancelado).
    - **Precio final calculado en pesos uruguayos (UYU)**.
  * **Cancelación de Reservas**: Opción de cancelar reservas directamente. Si la reserva está a menos de 24 horas del inicio del turno, la interfaz debe bloquear la acción o mostrar el mensaje de error provisto por el backend.

### C. Administrador (Personal del Local)
* **Dashboard de Administración**:
  * **Gestión de Catálogo (CRUD)**:
    - Crear nuevo producto: formulario para subir título, descripción, precio en USD e imagen.
    - Editar producto: modificar precios, descripciones o imágenes de ítems existentes.
    - Eliminar producto: quitar productos del catálogo.
  * **Lista Global de Reservas**: Vista del listado de todas las citas agendadas en el local.

---

## 3. Integración con el Backend (Cómo Funciona)

El backend corre en `http://localhost:5001` utilizando Node.js, Express y Supabase. 

### Flujo de Reservas con Cal.com:
1. El cliente reserva un horario a través del **widget de Cal.com** incrustado en el dashboard.
2. Cal.com procesa el agendamiento y envía un webhook al backend (`/api/reservations/webhook`).
3. El backend recibe los datos del cliente, la marca de bicicleta y el tipo de servicio.
4. El backend calcula el precio en **pesos uruguayos (UYU)** aplicando las siguientes reglas:
   - **Ajuste y Regulación**: `$900 UYU`
   - **Servicio Básico**: `$2000 UYU`
   - **Engrase General**: `$2600 UYU`
   - **Descuento de Marca Representada**: Si la marca de bicicleta es una de las representadas (`Specialized`, `Trek`, `Giant`, `Scott`), se aplica automáticamente un **10% de descuento** sobre la tarifa del taller.
5. El backend registra la reserva en Supabase y la asocia al usuario correspondiente por su dirección de correo electrónico.

---

## 4. Referencia de Endpoints del Backend

Todas las respuestas de error y éxito que devuelve la API están redactadas en **Español** para su renderizado directo. Las rutas protegidas requieren pasar el JWT en el header: `Authorization: Bearer <access_token>`.

### A. Autenticación (`/api/auth`)
* `POST /api/auth/signup`: Registro de usuario.
  - Body: `{"email", "password"}`
* `POST /api/auth/login`: Inicio de sesión (devuelve la sesión y el `access_token` en el payload).
  - Body: `{"email", "password"}`
* `GET /api/auth/me`: Perfil del usuario autenticado (requiere Auth header).

### B. Catálogo de Productos (`/api/catalog`)
* `GET /api/catalog`: Listar todos los productos en USD (Público).
* `GET /api/catalog/:id`: Obtener detalles de un producto (Público).
* `POST /api/catalog`: Crear un producto (Requiere Auth de Administrador).
  - Body: `{"title", "description", "price", "image_url"}`
* `PUT /api/catalog/:id`: Editar producto (Requiere Auth de Administrador).
  - Body: `{"title", "description", "price", "image_url"}` (opcionales)
* `DELETE /api/catalog/:id`: Eliminar producto (Requiere Auth de Administrador).

### C. Reservas y Taller (`/api/reservations`)
* `GET /api/reservations/my-reservations`: Lista de reservas del cliente autenticado (Requiere Auth).
* `PUT /api/reservations/:id/cancel`: Cancelar una reserva específica (Requiere Auth).
  - *Nota*: Si faltan menos de 24 horas para la cita, fallará devolviendo un status 400.
* `GET /api/reservations`: Lista todas las reservas del sistema (Requiere Auth de Administrador).

---

## 5. Diseño y Estética
La interfaz del cliente debe diseñarse siguiendo pautas visuales premium y modernas:
* **Mobile-First**: Optimizado para dispositivos móviles, ya que se espera que la mayoría de los usuarios realicen sus reservas desde smartphones.
* **Componentes**: Diseños de tarjetas de catálogo estilizadas, visualizaciones claras del estado de los turnos de taller y formularios intuitivos de registro/autenticación.
