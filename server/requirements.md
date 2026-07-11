# Requerimientos del Sistema - Bicicletas Paysandú

Este documento detalla los requerimientos funcionales, no funcionales, reglas de negocio y tarifas de taller para el desarrollo de la plataforma web de Bicicletas Paysandú.

---

## 1. Sistema de Roles y Permisos (Usuarios)
La plataforma debe diferenciar claramente qué puede hacer cada persona que ingresa al sistema:

*   **Visitante (No registrado):**
    *   Navegar por la página principal (Home).
    *   Ver la información de contacto y ubicación del local.
    *   Leer la sección "Sobre Nosotros".
    *   Visualizar el catálogo público de bicicletas y productos.
*   **Cliente (Usuario Registrado):**
    *   Toda la funcionalidad del Visitante.
    *   Acceso a su panel personal (Dashboard de Cliente).
    *   Agendar citas/horas para el taller.
    *   Cancelar sus citas permitidas (dentro de los límites de tiempo establecidos).
    *   Visualizar el historial de sus reservas pasadas y activas.
*   **Administrador (Personal del local):**
    *   Acceso exclusivo a un panel de control privado (Dashboard de Administración).
    *   Gestión total de la web (catálogo, reservas, usuarios, etc.).

---

## 2. Requerimientos Funcionales

### A. Gestión del Catálogo (Panel de Administrador)
*   **Creación de productos:** Capacidad para subir nuevos artículos al catálogo.
*   **Campos obligatorios por producto:**
    *   Imagen principal del producto.
    *   Título / Nombre.
    *   Precio (estrictamente en Dólares Estadounidenses - USD).
    *   Detalles / Descripción.
*   **Edición y eliminación:** Capacidad de modificar precios, actualizar descripciones o imágenes, y borrar productos del catálogo.

### B. Visualización del Catálogo (Vista Pública)
*   **Galería dinámica:** Los productos cargados por el administrador deben renderizarse automáticamente en la web en un diseño de cuadrícula (grid).
*   **Tarjetas de producto (Cards):** Cada ítem debe mostrar su foto, título y precio de forma clara. Al hacer clic, debe permitir ver más detalles del producto.

### C. Módulo de Reservas y Agenda (Taller)
*   **Calendario interactivo:** Interfaz visual donde el cliente pueda seleccionar un día y un horario disponible.
*   **Bloqueo automático:** Si un bloque de horario ya está reservado por otro cliente, debe inhabilitarse visualmente (en gris) para evitar superposiciones.
*   **Gestión de Citas y Reservas vía Cal.com:** Integración de la plataforma de agendamiento de Cal.com:
    *   **Integración Web/Widget:** El calendario y la reserva de citas se realizarán a través de la integración de Cal.com (ya sea mediante su API o incrustando su widget interactivo/embed en el panel del cliente).
    *   **Sincronización Automática:** Cal.com gestionará la disponibilidad y las franjas horarias del taller de forma automática, vinculándose con el calendario personal de los administradores del local.
    *   **Automatización de Notificaciones:** Uso del sistema nativo de Cal.com para el envío automático de correos de confirmación, recordatorios y cancelaciones de citas tanto para el cliente como para el taller.

---

## 3. Servicios y Tarifas del Taller

A continuación se detallan los servicios estándar que ofrece el taller y sus precios base.

### Tabla de Servicios

| Servicio | Precio | Detalles / Tareas Incluidas |
| :--- | :--- | :--- |
| **Ajuste y Regulación** | `$900` | • Ajuste de frenos<br>• Regulación de cambios |
| **Servicio Básico** | `$2000` | • Limpieza de cuadro y transmisión<br>• Ajuste de frenos<br>• Regulación de cambios<br>• Ajuste de tornillería |
| **Engrase General** | `$2600` | • Desarmado y engrasado de piezas<br>• Limpieza de cuadro y transmisión<br>• Ajuste de frenos<br>• Regulación de cambios<br>• Ajuste de tornillería |

### Condiciones y Reglas de Precios del Taller:
*   ⚠️ **Variación de precios:** El precio del servicio puede variar para aquellos clientes que posean o traigan bicicletas de las **marcas representadas** por el local.
*   🚫 **Exclusión de repuestos:** Los precios listados corresponden únicamente a la mano de obra del servicio técnico y **no incluyen repuestos ni componentes nuevos**.

---

## 4. Reglas de Negocio (Restricciones)

*   **Restricción de moneda del catálogo:** Todos los campos de precio en el catálogo de productos y la base de datos asociada deben procesarse y mostrarse en **Dólares Estadounidenses (USD)**.
*   **Límites de la Agenda (Horario Comercial):** El calendario web solo debe permitir la reserva de horas dentro de los siguientes rangos operativos reales:
    *   **Lunes a Viernes:** `08:00 a 12:00` y `15:00 a 19:00`.
    *   **Sábados:** `08:30 a 12:30`.
    *   **Domingos:** Cerrado (sistema de reservas bloqueado por completo).

---

## 5. Requerimientos No Funcionales

*   **Diseño Responsivo (Mobile First):** La plataforma debe ser completamente adaptable a dispositivos móviles, optimizando la experiencia de usuario en smartphones, ya que se proyecta que la mayoría de los clientes reserven desde sus teléfonos.
*   **Seguridad y Privacidad:**
    *   Las contraseñas de los usuarios deben guardarse encriptadas en la base de datos (por ejemplo, utilizando bcrypt).
    *   Toda la comunicación de la plataforma debe realizarse bajo protocolo seguro **HTTPS**.
