# Garoo Services Portal 🚀

### Plataforma Integral de Gestión y Soluciones Digitales

**Garoo** es una plataforma centralizada diseñada para optimizar procesos operativos a través de diversas unidades de negocio. Ofrece un ecosistema de herramientas digitales que van desde la gestión de talento humano hasta el monitoreo de contactos en tiempo real.

---

## 🌟 Características Principales

- **Interfaz Premium:** Diseño moderno con _Design System_ unificado (`pane-v3`, `layout-grid-v4`, `file-zone-v4`, `btn-modern-primary`), transiciones suaves y experiencia fluida.
- **Multi-Servicio:** Acceso centralizado a diferentes verticales de negocio (RocknRolla, Mundo Verde, Ficohsa, Spectrum).
- **Totalmente en Español:** Interfaz 100% localizada para el mercado hispanohablante.
- **Arquitectura Robusta:** Construido sobre React y Vite para un rendimiento ultrarrápido.
- **Responsive Design:** Optimizado para dispositivos móviles, tablets y escritorio.
- **Seguridad por Capas:** Autenticación JWT + `ProtectedRoute` con control por `serviceId` y `requiredRole`.

---

## 🛠️ Unidades de Servicio

### 📄 Mundo Verde: Gestión Documental y Facturación

Módulo de facturación SAT con registro de proveedores integrado. Accesible vía `/form`.

**Pestañas:**

| Tab | Descripción |
|---|---|
| `+ Nueva Factura` | Carga de PDF y XML con previsualización. Integración con webhook SAT. |
| `Reg. Proveedor` | Registro de nuevos proveedores (NIT, razón social, correo, teléfono, dirección). Adjunto opcional de RTU con extracción IA. |
| `Historial SAT` | Tabla paginada y filtrable con historial de facturas enviadas. |

**Ruta standalone:** `/registro-proveedor` (actualmente pública — sin login requerido).

**Acceso:** Solo usuarios con `serviceId: "form"` asignado en el backend.

---

### 👨‍💼 RocknRolla: Gestión de Talento

Un completo gestor de aplicaciones para selección de personal.

- Visualización detallada de perfiles de candidatos.
- Generación automática de currículums en PDF.
- Filtros avanzados por puesto, nacionalidad y pretensión salarial.

### 📞 Ficohsa: Centro de Llamadas

Interfaz optimizada para el registro y gestión de llamadas outbound.

- Formularios dinámicos para captura de datos de clientes potenciales.
- Validación en tiempo real y confirmación de envío.

### 📊 Spectrum Hub: Panel de Leads

Dashboard dinámico para el monitoreo de leads en tiempo real.

- Conexión directa vía webhooks con agentes de IA.
- Visualización de estados, sentimientos y canales de contacto.

---

## 🎨 Design System

Todas las páginas del portal siguen un vocabulario visual unificado:

| Clase / Token | Uso |
|---|---|
| `pane-v3` | Contenedor blanco con borde y sombra sutil |
| `pane-header-v3` | Header de sección (fondo `#f1f5f9`, texto uppercase) |
| `layout-grid-v4` | Grid 2 columnas `1.2fr / 1fr` para formularios |
| `preview-stack-v3` | Columna derecha de previsualizaciones |
| `file-zone-v4` / `rp-file-zone` | Zona de drag & drop para archivos |
| `btn-modern-primary` | Botón principal (gradiente indigo→blue) |
| `tabs-container-v3` | Barra de pestañas con `active-tab` |
| `header-wrapper-v3` | Sub-header **sticky** debajo del header global |
| `field-item-v3` / `rp-field` | Campo de formulario compacto con label uppercase |

---

## 🔐 Control de Acceso

El sistema usa tres capas de seguridad:

1. **JWT en `localStorage`** (`garooToken`) — verificado en cada carga con `auth-verify`.
2. **`ProtectedRoute`** — redirige a `/` si no hay sesión o no se cumple el rol/servicio.
3. **`ServicesContext`** — carga los servicios habilitados por usuario desde el backend (`get-services`). Los admins (`user.client === "admin"`) tienen acceso universal.

```
Usuario → Login → JWT → ServicesContext.hasServicePermission(serviceId) → ProtectedRoute → Página
```

**Pendiente:** Evaluar si `/registro-proveedor` debe protegerse con `serviceId: "form"` (uso interno) o mantenerse pública (para que proveedores externos llenen el formulario directamente).

---

## 🚀 Tecnologías Utilizadas

- **Core:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilos:** Vanilla CSS con Design System propio, Bootstrap Icons, CSS Modules.
- **Navegación:** React Router 6.
- **Autenticación:** JWT + Axios Interceptors (`redtecInstance`).
- **Formularios:** React Hook Form (Facturas), hooks nativos (Reg. Proveedor).
- **Utilidades:** jsPDF, react-bootstrap.

---

## ⚙️ Instalación y Configuración

```bash
# 1. Clonar
git clone https://github.com/jcalderon90/garoo-frontend.git
cd garoo-frontend

# 2. Dependencias
npm install

# 3. Variables de entorno (.env)
VITE_API_URL=https://tu-servidor.com/

# 4. Desarrollo
npm run dev

# 5. Producción
npm run build
```

---

## 🌐 Despliegue

El proyecto está configurado para despliegue automático en **Netlify**. Cada push a la rama `main` dispara una nueva versión en producción.

---

## 📝 Historial de Versiones

### v2.1 — Marzo 2026
- ✅ Nuevo módulo **Registro de Proveedor** integrado como segunda pestaña en Facturación.
- ✅ Layout 2 columnas (`rp-grid`) homologado a `layout-grid-v4` del formulario de facturas.
- ✅ Campos del formulario en grid 3 columnas: `NIT | Razón Social`, `Correo | Teléfono`, `Dirección` (fila completa).
- ✅ Sub-header de Facturación convertido en **sticky** (se mantiene visible al scrollear).
- ✅ Reorganización de tabs: `Nueva Factura → Reg. Proveedor → Historial SAT`.
- ✅ `redtecInstance` como cliente HTTP para todas las llamadas del módulo Mundo Verde.
- ✅ Design System documentado y aplicado consistentemente en ambos formularios.
- ✅ Eliminado espacio excesivo entre el header global de Garoo y el sub-header de sección.

### v2.0 — Versión anterior
- Migración completa a estética premium.
- Unificación de servicios bajo un portal operativo.
- Implementación de redirecciones inteligentes de API.
- Corrección de conflictos de dependencias (ESLint/React Hooks).

---

Desarrollado con ❤️ para **Garoo Servicios**.
