# TestDrop

Plataforma de beta testing para apps y juegos — Android, iOS, PC y más.

## Tecnologías

- **React + Vite** — frontend
- **Supabase** — auth, base de datos, emails automáticos
- **Vercel** — hosting gratuito

## Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar en local
npm run dev
```

Abre http://localhost:5173

## Desplegar en Vercel (gratis)

1. Sube el proyecto a GitHub
2. Ve a vercel.com → "New Project" → importa tu repo
3. Click "Deploy" — sin configuración extra necesaria

## Estructura

```
src/
  hooks/useAuth.jsx     — autenticación con Supabase
  lib/supabase.js       — cliente de Supabase
  components/Navbar.jsx — navegación
  pages/
    Home.jsx            — landing page
    Login.jsx           — inicio de sesión + recuperar contraseña
    Register.jsx        — registro desarrollador / tester
    Projects.jsx        — listado de proyectos con filtros
    Dashboard.jsx       — panel del usuario
```

## Funcionalidades incluidas

- Registro con roles: Desarrollador / Tester
- Email de confirmación automático (Supabase)
- Recuperación de contraseña por email
- Publicar proyectos (desarrolladores)
- Apuntarse a proyectos (testers)
- Filtrar por estado y plataforma
- Cerrar / reabrir proyectos
- Ordenados por fecha
