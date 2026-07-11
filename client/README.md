# Bicicletas Paysandú — Cliente (Next.js)

Frontend de la tienda y taller de bicicletas, construido con Next.js (App Router), TypeScript y Tailwind CSS.

## Requisitos previos

- Node.js 18+
- El backend corriendo en `http://localhost:5001` (ver `../server`)

## Configuración

Variables en `.env.local`:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL del backend Express (por defecto `http://localhost:5001`) |
| `NEXT_PUBLIC_CAL_LINK` | Enlace de Cal.com del taller, en formato `usuario/evento` |

> **Importante**: cambiá `NEXT_PUBLIC_CAL_LINK` por el enlace real del evento de Cal.com del taller. El widget pre-rellena el correo del cliente y las respuestas `servicio` y `marca` mediante parámetros de consulta; las preguntas del evento en Cal.com deben tener identificadores (slugs) que contengan `servicio`/`tipo` y `marca`/`bicicleta` para que el backend las reconozca.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Estructura

- `/` — Página de inicio: información comercial, horario, ubicación y "Sobre nosotros".
- `/catalogo` — Catálogo público de productos en USD.
- `/login` y `/registro` — Autenticación de clientes.
- `/dashboard` — Panel del cliente: agendar turno (widget de Cal.com), historial de reservas con precios en UYU y cancelación (con regla de 24 horas).
- `/admin` — Panel de administración: CRUD del catálogo y lista global de reservas.

## Roles

El rol (`cliente` o `admin`) se detecta al iniciar sesión consultando un endpoint exclusivo de administradores. Para hacer administrador a un usuario, actualizá su fila en la tabla `profiles` de Supabase (`role = 'admin'`).
