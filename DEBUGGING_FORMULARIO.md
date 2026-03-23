# 🔍 Guía de Debugging — Módulo Mundo Verde

## Formularios Cubiertos

| Formulario | Ruta | Endpoint |
|---|---|---|
| Facturación (Nueva Factura) | `/form` → tab "Nueva Factura" | `webhook-factura` |
| Registro de Proveedor | `/form` → tab "Reg. Proveedor" | `registro-proveedor` |

Ambos usan `redtecInstance` (axios con base URL `VITE_API_URL`) con JWT automático en el header.

---

## 📄 Formulario de Facturas

### Problema Reportado

El formulario funciona correctamente cuando lo usa el desarrollador, pero falla para otros usuarios.

### ✅ Mejoras Implementadas

#### 1. Compatibilidad de Tipos MIME para XML

- **Problema**: Diferentes navegadores reportan tipos MIME distintos para `.xml`:
  - Chrome/Edge: `text/xml`
  - Firefox: `application/xml`
  - Windows Explorer: `text/plain`
  - Algunos navegadores: sin tipo MIME

- **Solución**: Validación por extensión (`.xml`) como método principal + forzar MIME via `Blob` al enviar.

#### 2. Logging Mejorado

```javascript
// Al enviar el formulario
console.log("Enviando formulario con:", { nit, serie, pdfName, pdfType, xmlName, xmlType });

// Al cargar archivos XML
console.log('XML cargado correctamente:', { name, type, size });

// En caso de error
console.error("Error completo:", { status, data, message });
```

#### 3. Manejo de Errores

- Mensajes específicos según tipo: CORS, conexión, 400/500 server.
- Detección automática de errores de red vs errores del servidor.
- Encoding UTF-8 al leer archivos: `reader.readAsText(file, 'UTF-8')`.

---

## 🏢 Formulario de Registro de Proveedor

### Campos del Formulario

| Campo | Requerido | Validación |
|---|---|---|
| NIT | Sí (si no hay archivo) | Texto libre |
| Razón Social | No | Texto libre |
| Correo Electrónico | Sí (si no hay archivo) | Formato email |
| Teléfono | No | Tipo `tel` |
| Dirección Fiscal | No | Texto libre |
| Archivo RTU (PDF/PNG/JPG) | No | Max 15 MB, extensión válida |

> Si se adjunta un archivo, NIT y correo pasan a ser opcionales (la IA extrae los datos).

### Logging Disponible

```javascript
// Al iniciar envío
console.log("Iniciando envío de registro de proveedor...");

// Al adjuntar archivo
console.log("Adjuntando archivo:", file.name, file.type, file.size);

// Datos del formulario enviados
console.log("Datos de formulario:", { nit, nombre, correo, telefono, direccion });

// Respuesta exitosa
console.log("Respuesta del servidor:", response.data);

// Errores
console.error("Error en registro de proveedor:", error);
console.error("Respuesta de error:", error.response?.status, error.response?.data);
```

### Errores Comunes

#### Error: "Solo se aceptan archivos PDF, PNG o JPEG"
**Causa:** El usuario intentó subir un archivo de otro tipo.
**Solución:** Verificar que el archivo sea `.pdf`, `.png`, `.jpg` o `.jpeg`.

#### Error: "El archivo no debe superar 15 MB"
**Causa:** El archivo adjunto supera el límite de tamaño.
**Solución:** Comprimir o reducir el archivo antes de adjuntarlo.

#### Error: "El servidor no responde"
**Causa:** Timeout o servidor caído en el endpoint `registro-proveedor`.
**Solución:** Verificar estado del servidor backend.

---

## 🐛 Guía de Debugging General

### Paso 1: Abrir la Consola del Navegador

1. Presionar `F12` o clic derecho → "Inspeccionar"
2. Ir a la pestaña **Console** y luego **Network**

### Paso 2: Identificar el Problema

#### CORS Error
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
**Solución:** Configurar CORS en el servidor para permitir el origen.

#### NetworkError / Failed to fetch
**Causas posibles:**
- Sin conexión a internet
- Firewall o VPN bloqueando el servidor
- Servidor caído

#### Error 4xx/5xx del servidor
```
Error del servidor (400): Bad Request
Error del servidor (500): Internal Server Error
```
**Solución:** Revisar los logs del servidor. El mensaje de error específico viene en `error.response.data`.

---

## 📋 Checklist para Usuarios con Problemas

### Facturación
- [ ] ¿El archivo XML termina en `.xml`?
- [ ] ¿El archivo PDF termina en `.pdf`?
- [ ] ¿Los archivos pesan menos de 5 MB cada uno?
- [ ] ¿Hay conexión a internet?
- [ ] ¿Está usando VPN?
- [ ] ¿Puede compartir captura de la consola (F12)?

### Registro de Proveedor
- [ ] ¿El archivo adjunto es PDF, PNG o JPEG?
- [ ] ¿El archivo pesa menos de 15 MB?
- [ ] Si no adjunta archivo, ¿llenó NIT y Correo?
- [ ] ¿Hay conexión a internet?

---

## 🔧 Soluciones Rápidas

### Para el Usuario
1. Intentar con otro navegador (preferiblemente Chrome o Edge).
2. Verificar extensiones de archivo.
3. Desactivar VPN temporalmente.
4. Limpiar caché del navegador (`Ctrl+Shift+R`).

### Para el Desarrollador
1. Revisar configuración CORS del servidor:
   ```
   Access-Control-Allow-Origin: [dominio]
   Access-Control-Allow-Methods: POST
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```
2. Revisar logs del servidor para ver qué recibe en cada campo.
3. Verificar que los endpoints acepten `multipart/form-data`.
4. Validar que el JWT del usuario no haya expirado (revisar en `localStorage.garooToken`).

---

## 🚀 Mejoras Adicionales Recomendadas

1. **Retry automático** en errores de red transitorios.
2. **Validación de contenido XML** (verificar que sea XML bien formado antes de enviar).
3. **Indicador de progreso** para uploads de archivos grandes.
4. **Proteger `/registro-proveedor`** con `ProtectedRoute serviceId="form"` si el uso es interno.
5. **Guardar en `sessionStorage`** datos del formulario como respaldo ante errores de red.

---

**Última actualización:** Marzo 2026 — Módulo Registro de Proveedor integrado al sistema.
