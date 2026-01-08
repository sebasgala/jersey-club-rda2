# 👕 Jersey Club EC - Fullstack E-commerce

Bienvenido a **Jersey Club EC**, la plataforma definitiva para entusiastas del deporte y coleccionistas de camisetas originales y retro. 🏁⚽

---

## 🚀 Guía de Usuario

### 🛍️ Para Clientes
1.  **Exploración**: Navega por nuestras categorías principales (Fútbol, Fórmula 1, Jersey Club Brand) usando la barra de navegación fija.
2.  **Búsqueda**: Utiliza el buscador inteligente para encontrar tu equipo o temporada favorita al instante.
3.  **Carrito de Compras**: Agrega tus productos, selecciona tallas y gestiona las cantidades desde el menú lateral del carrito.
4.  **Pago y Facturación**: Realiza tu pedido con un proceso de pago intuitivo. Al finalizar, podrás generar y descargar tu **Factura en PDF** con todos los detalles de la compra.

### 🛡️ Para Administradores
Acceso a un panel de control exclusivo para:
-   **Gestión de Productos**: Crear, editar y eliminar stock del catálogo.
-   **Control de Usuarios**: Visualizar y gestionar la base de clientes.
-   **Seguimiento de Órdenes**: Monitorizar todos los pedidos realizados en tiempo real.

---

## 🛠️ Stack Tecnológico
-   **Frontend**: React (Context API, React Router, Axios).
-   **Backend**: Node.js & Express.
-   **Estilos**: Vanilla CSS con diseño responsivo y animaciones modernas.
-   **Persistencia**: Prisma (preparado) y archivos JSON para almacenamiento rápido.
-   **Herramientas**: `jspdf` & `html2canvas` para generación de facturas.

---

## 💻 Instalación Local

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

## 🌐 Despliegue (Render)
Para propósitos de previsualización, el proyecto se puede subir a **Render**.
> [!WARNING]
> Ten en cuenta que en el plan gratuito de Render, los datos de pedidos y nuevos usuarios se reinician periódicamente debido al sistema de archivos efímero.

---
**Desarrollado con ❤️ por el equipo de Jersey Club EC.**
