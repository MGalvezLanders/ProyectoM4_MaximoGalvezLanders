# Gestor Estratégico de Tareas — PIM4 Full Stack

Proyecto Integrador del Módulo 4 de la carrera Full Stack en [SoyHenry](https://soyhenry.com).

---

## Descripción del proyecto

Aplicación web SPA (Single Page Application) para la gestión de tareas diarias. Permite a los usuarios registrarse, autenticarse y administrar sus tareas de forma organizada y persistente desde cualquier dispositivo.

Desarrollada para **MateCode**, startup ficticia que requería una solución rápida, escalable y basada en servicios administrados (BaaS).

**Funcionalidades principales:**
- Registro e inicio de sesión con email/password y Google
- Creación, edición, eliminación y marcado de tareas como completadas
- Persistencia de datos en la nube por usuario autenticado
- Envío de resumen de tareas por email
- Rutas privadas protegidas

---

## Decisiones arquitectónicas

### Estructura por capas

El proyecto sigue una arquitectura modular organizada por responsabilidad:

```
project-root/
├─ api/
│  └─ send-email.ts          # Vercel Serverless Function (AWS SES)
├─ src/
│  ├─ assets/
│  ├─ components/
│  │  ├─ buildSummary/
│  │  ├─ ConfirmModal/
│  │  ├─ Footer/
│  │  ├─ FormField/
│  │  ├─ GoogleSignInButton/
│  │  ├─ Header/
│  │  ├─ Navbar/
│  │  ├─ TaskCard/
│  │  ├─ TaskForm/
│  │  └─ TaskList/
│  ├─ features/
│  │  ├─ auth/               # Lógica de autenticación
│  │  └─ tasks/              # Lógica de tareas
│  ├─ mocks/                 # Mocks para testing
│  ├─ pages/                 # Vistas principales
│  ├─ routes/                # Router y rutas protegidas
│  ├─ services/              # Integraciones externas (Firebase)
│  ├─ types/                 # Interfaces y tipos compartidos
│  └─ utils/                 # Helpers y validaciones
├─ test/
│  ├─ api/
│  ├─ components/
│  ├─ features/
│  └─ utils/
│     └─ setup.ts
├─ .env
├─ .env.example
├─ .gitignore
├─ vercel.json
└─ README.md
```

Esta separación permite escalar el proyecto sin acoplar la lógica de negocio a los componentes visuales.

### Firebase como BaaS

Se eligió Firebase por su integración nativa con React, su sistema de autenticación robusto y la sincronización en tiempo real de Firestore. Cada usuario solo puede acceder a sus propias tareas gracias al filtrado por `userId`.

### AWS SES a través de Vercel Functions

Las credenciales de AWS nunca se exponen en el frontend. El envío de emails se delega a una Vercel Serverless Function (`/api/send-email`), que actúa como intermediario seguro entre el cliente y AWS SES.

### TypeScript en todo el proyecto

Se tiparon todas las entidades principales (`Task`, estados de formulario, errores) para reducir errores en tiempo de desarrollo y mejorar la mantenibilidad del código.

---

## Instrucciones de instalación

### Requisitos previos

- Node.js >= 18
- npm >= 9
- Cuenta de Firebase
- Cuenta de AWS con SES configurado

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/MGalvezLanders/ProyectoM4_MaximoGalvezLanders.git
cd ProyectoM4_MaximoGalvezLanders

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Completar el archivo .env con tus credenciales (ver sección siguiente)

# 4. Iniciar el servidor de desarrollo
npm run dev
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto basándose en `.env.example`:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# AWS SES (solo para Vercel Functions, nunca en el frontend)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
SES_FROM_EMAIL=
```

> ⚠️ El archivo `.env` está incluido en `.gitignore` y nunca debe subirse al repositorio.

---

## URL de producción

[https://proyecto-m4-maximo-galvez-landers.vercel.app](https://proyecto-m4-maximo-galvez-landers.vercel.app)

---

## Flujo de envío de emails

El envío de emails sigue el siguiente flujo para garantizar que las credenciales de AWS nunca queden expuestas en el frontend:

```
Usuario hace click en "Enviar resumen"
        ↓
Frontend realiza POST a /api/send-email
con el listado de tareas en el body
        ↓
Vercel Serverless Function recibe la request
Lee las variables de entorno de AWS (server-side)
        ↓
La función se conecta a AWS SES
y envía el email al usuario autenticado
        ↓
Responde al frontend con éxito o error
```

**Importante:** En entorno sandbox de AWS SES, tanto el email remitente (`SES_FROM_EMAIL`) como el destinatario deben estar verificados en la consola de AWS. Para enviar a cualquier dirección es necesario solicitar *production access* desde el panel de SES.

---

## Integración de IA en el proceso de desarrollo

### Herramienta utilizada
Claude (Anthropic) a través de claude.ai, durante todo el proceso de planificación y desarrollo.

### En qué situaciones fue más efectiva

**Planificación inicial:** La IA fue clave para estructurar el proyecto desde el principio. A partir de los requerimientos del PI, ayudó a definir la arquitectura de carpetas, las fases de desarrollo y la lista de tareas ordenadas por prioridad. Esto permitió arrancar con un roadmap claro en lugar de improvisar sobre la marcha.

**Resolución de errores puntuales:** Ante errores como el 404 en `/api/send-email` o el problema de email no verificado en AWS SES, la IA permitió identificar la causa y la solución rápidamente sin tener que buscar en múltiples fuentes.

**Configuración de servicios externos:** La integración de Firebase Auth, Firestore y AWS SES involucra mucha configuración y pasos específicos. La IA funcionó como guía paso a paso adaptada al contexto del proyecto, sin necesidad de leer documentación extensa.

**Generación de código boilerplate:** Componentes tipados, hooks personalizados y la estructura de las Vercel Functions fueron acelerados significativamente con asistencia de IA, permitiendo enfocarse en la lógica de negocio.

**Testing:** La IA fue de gran ayuda para escribir tests de componentes y funciones clave con Vitest y React Testing Library. Ayudó a estructurar los casos de prueba, configurar los mocks de Firebase y SES, y entender qué era importante testear en cada parte del sistema.

**Documentación:** La generación del README, el plan de desarrollo y la documentación del flujo de emails fueron asistidos por IA. A partir de una conversación iterativa donde se fue brindando contexto del proyecto, se obtuvo documentación clara, completa y adaptada a los requerimientos del PI.

### Patrones y buenas prácticas descubiertas

- **Dar contexto antes de pedir código:** Compartir el stack, la estructura de carpetas y el objetivo antes de pedir una solución produjo resultados mucho más precisos y reutilizables.
- **Iterar en lugar de pedir todo de una vez:** Hacer preguntas específicas por etapa fue más efectivo que pedir "hacé toda la app". Cada fase tuvo su propia conversación enfocada.
- **Validar el código generado:** La IA puede sugerir código que funciona pero no sigue las convenciones del proyecto. Revisarlo siempre antes de integrarlo fue fundamental para mantener consistencia.
- **Usar la IA para entender, no solo para copiar:** Ante cada fragmento de código generado, se buscó entender qué hacía y por qué, lo que reforzó el aprendizaje en lugar de reemplazarlo.