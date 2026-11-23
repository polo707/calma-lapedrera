# Calma La Pedrera

Web pública + reservas directas + asistente de chat (sin IA) + panel privado `/admin`.

- Next.js 15 (App Router) + TypeScript, sin Tailwind. Estilos en `src/app/globals.css` sobre tokens (`tokens.css`).
- Idiomas: ES / EN / PT en `src/i18n/dict.ts`.
- **WhatsApp y PIN**: `src/config/site.ts` (`WHATSAPP_NUMBER`, `ADMIN_PIN`).
- **Datos compartidos** (cabañas, tarifas, temporada, seña, bloqueos, reservas): `src/lib/store.ts`.
  Hoy en `localStorage` (demo, por navegador). Para producción, implementar la interfaz `Repository` contra una base de datos.
- Datos de ejemplo: `src/lib/seed.ts` (nombres de cabañas y tarifas a confirmar con Calma).
- Asistente: `src/chat/engine.ts` (palabras clave ES/EN/PT) y `src/chat/ChatWidget.tsx` (mensajes guardados como claves, se re-traducen al cambiar idioma).

```bash
npm install
npm run dev      # http://localhost:3000  ·  panel en /admin (PIN demo 1234)
npm run build
```
