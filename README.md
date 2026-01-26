#  Jersey Club EC - Fullstack E-commerce

Bienvenido a **Jersey Club EC**, la plataforma definitiva para entusiastas del deporte y coleccionistas de camisetas originales y retro.

---

##  Guía de Usuario

### Para Clientes
1.  **Exploración**: Navega por nuestras categorías principales (Fútbol, Fórmula 1, Jersey Club Brand) usando la barra de navegación fija.
2.  **Búsqueda**: Utiliza el buscador inteligente para encontrar tu equipo o temporada favorita al instante.
3.  **Carrito de Compras**: Agrega tus productos, selecciona tallas y gestiona las cantidades desde el menú lateral del carrito.
4.  **Pago y Facturación**: Realiza tu pedido con un proceso de pago intuitivo. Al finalizar, podrás generar y descargar tu **Factura en PDF** con todos los detalles de la compra.

###  Para Administradores
Acceso a un panel de control exclusivo para:
-   **Gestión de Productos**: Crear, editar y eliminar stock del catálogo.
-   **Control de Usuarios**: Visualizar y gestionar la base de clientes.
-   **Seguimiento de Órdenes**: Monitorizar todos los pedidos realizados en tiempo real.

---

##  Stack Tecnológico
-   **Frontend**: React (Context API, React Router, Axios).
-   **Backend**: Node.js & Express.
-   **Estilos**: Vanilla CSS con diseño responsivo y animaciones modernas.
-   **Persistencia**: Prisma (preparado) y archivos JSON para almacenamiento rápido.
-   **Herramientas**: `jspdf` & `html2canvas` para generación de facturas.

---

##  Instalación Local

### Requisitos:
- Node.js (v16+)
- Git

### Pasos:
1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/jersey-club-ec.git
    cd jersey-club-ec
    ```
2.  **Instalar dependencias**:
    ```bash
    npm install
    cd server && npm install
    cd ..
    ```
3.  **Ejecutar el proyecto**:
    -   **Backend**: `npm run server` (Puerto 5001)
    -   **Frontend**: `npm start` (Puerto 5000)

---

## Despliegue (Render)
Para propósitos de previsualización, el proyecto se puede subir a **Render**.
> [!WARNING]
> Ten en cuenta que en el plan gratuito de Render, los datos de pedidos y nuevos usuarios se reinician periódicamente debido al sistema de archivos efímero.

---

##  Seguridad y OWASP

Esta aplicación implementa medidas de seguridad robustas siguiendo las mejores prácticas y mitigando riesgos del Top 10 de OWASP.

### Riesgos Identificados y Mitigados

#### 1. Inyección (A03:2021-Injection)
*   **Riesgo**: Atacantes podrían enviar comandos SQL maliciosos a través de campos de entrada.
*   **Mitigación**: Uso de **Prisma ORM** que utiliza consultas parametrizadas por defecto, evitando inyección SQL directa. Además, se sanitizan todas las entradas críticas con `express-validator` y `escape()`.

#### 2. Pérdida de Autenticación (A07:2021-Identification and Authentication Failures)
*   **Riesgo**: Contraseñas débiles o manejo incorrecto de sesiones.
*   **Mitigación**: 
    *   Uso de **Bcrypt** para hashear contraseñas (nunca se guardan en texto plano).
    *   Implementación de **JWT (JSON Web Tokens)** con firma segura y expiración para manejo de sesiones stateless.
    *   Middleware `requireAuth` para proteger rutas sensibles.

#### 3. Fallos de Integridad de Datos y Software (A08:2021-Software and Data Integrity Failures)
*   **Riesgo**: Deserialización insegura o falta de validación de tipos.
*   **Mitigación**: Implementación de **validación estricta de esquemas** en el backend para todos los endpoints POST/PUT usando `express-validator`. Se verifican tipos de datos, longitudes y formatos (email) antes de procesar cualquier lógica de negocio.

### Medidas Adicionales
*   **CORS Seguro**: Configurado para permitir peticiones únicamente desde el frontend autorizado, bloqueando orígenes desconocidos.
*   **Manejo de Errores Seguro**: Los errores de producción no exponen el stacktrace del servidor al cliente.

---

**Desarrollado con  por el equipo de Jersey Club EC.**
