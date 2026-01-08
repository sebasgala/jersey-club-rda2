/**
 * =====================================================
 * GENERACIÓN DE FACTURA PDF
 * =====================================================
 * 
 * Usa jsPDF para generar facturas en PDF.
 * 
 * INSTALACIÓN REQUERIDA:
 * npm install jspdf
 * 
 * Si no está instalada, el código mostrará instrucciones.
 */

/**
 * Generar factura PDF
 * @param {object} order - Datos de la orden
 * @param {string} order.orderId - ID único de la orden
 * @param {Date} order.date - Fecha de la orden
 * @param {object} order.customer - Datos del cliente
 * @param {string} order.customer.fullName
 * @param {string} order.customer.email
 * @param {string} order.customer.phone
 * @param {object} order.shipping - Dirección de envío
 * @param {string} order.shipping.address
 * @param {string} order.shipping.city
 * @param {string} order.shipping.country
 * @param {string} order.shipping.postalCode
 * @param {Array} order.items - Items del pedido
 * @param {object} order.totals - Totales
 * @returns {Promise<boolean>}
 */
export const generateInvoicePDF = async (order) => {
  try {
    // Importar jsPDF dinámicamente
    const { default: jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    
    // ===== ENCABEZADO =====
    doc.setFontSize(24);
    doc.setTextColor(191, 25, 25); // #BF1919
    doc.text('JERSEY CLUB', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Tu tienda de camisetas deportivas', pageWidth / 2, yPos, { align: 'center' });
    
    // Línea separadora
    yPos += 8;
    doc.setDrawColor(200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    // ===== INFO DE FACTURA =====
    yPos += 12;
    doc.setFontSize(16);
    doc.setTextColor(15, 17, 17);
    doc.text('FACTURA', 20, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Orden #: ${order.orderId}`, 20, yPos);
    doc.text(`Fecha: ${new Date(order.date).toLocaleDateString('es-EC', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth - 20, yPos, { align: 'right' });
    
    // ===== DATOS DEL CLIENTE =====
    yPos += 15;
    doc.setFontSize(11);
    doc.setTextColor(15, 17, 17);
    doc.text('Datos del Cliente:', 20, yPos);
    
    yPos += 6;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`Nombre: ${order.customer.fullName}`, 20, yPos);
    yPos += 5;
    doc.text(`Email: ${order.customer.email}`, 20, yPos);
    yPos += 5;
    doc.text(`Teléfono: ${order.customer.phone}`, 20, yPos);
    
    // ===== DIRECCIÓN DE ENVÍO =====
    yPos += 12;
    doc.setFontSize(11);
    doc.setTextColor(15, 17, 17);
    doc.text('Dirección de Envío:', 20, yPos);
    
    yPos += 6;
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`${order.shipping.address}`, 20, yPos);
    yPos += 5;
    doc.text(`${order.shipping.city}, ${order.shipping.postalCode}`, 20, yPos);
    yPos += 5;
    doc.text(`${order.shipping.country}`, 20, yPos);
    
    // ===== TABLA DE PRODUCTOS =====
    yPos += 15;
    doc.setFontSize(11);
    doc.setTextColor(15, 17, 17);
    doc.text('Detalle del Pedido:', 20, yPos);
    
    // Encabezados de tabla
    yPos += 8;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos - 4, pageWidth - 40, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text('Producto', 22, yPos);
    doc.text('Talla', 100, yPos);
    doc.text('Cant.', 120, yPos);
    doc.text('Precio', 140, yPos);
    doc.text('Subtotal', pageWidth - 22, yPos, { align: 'right' });
    
    // Items
    yPos += 8;
    doc.setTextColor(40);
    order.items.forEach((item, index) => {
      const price = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
        : item.price;
      const subtotal = price * item.quantity;
      
      // Truncar nombre si es muy largo
      const maxNameLength = 40;
      const name = item.title.length > maxNameLength 
        ? item.title.substring(0, maxNameLength) + '...' 
        : item.title;
      
      doc.text(name, 22, yPos);
      doc.text(item.selectedSize || 'M', 100, yPos);
      doc.text(String(item.quantity), 120, yPos);
      doc.text(`$${price.toFixed(2)}`, 140, yPos);
      doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 22, yPos, { align: 'right' });
      
      yPos += 6;
      
      // Verificar si necesitamos nueva página
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Línea separadora
    yPos += 4;
    doc.setDrawColor(200);
    doc.line(100, yPos, pageWidth - 20, yPos);
    
    // ===== TOTALES =====
    yPos += 10;
    const totalsX = 140;
    
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(`$${order.totals.subtotal}`, pageWidth - 22, yPos, { align: 'right' });
    
    yPos += 6;
    doc.text('Envío:', totalsX, yPos);
    doc.text(parseFloat(order.totals.shipping) === 0 ? 'GRATIS' : `$${order.totals.shipping}`, pageWidth - 22, yPos, { align: 'right' });
    
    yPos += 6;
    doc.text('IVA (15%):', totalsX, yPos);
    doc.text(`$${order.totals.taxes}`, pageWidth - 22, yPos, { align: 'right' });
    
    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(15, 17, 17);
    doc.text('TOTAL:', totalsX, yPos);
    doc.setTextColor(177, 39, 4); // #B12704
    doc.text(`$${order.totals.total}`, pageWidth - 22, yPos, { align: 'right' });
    
    // ===== PIE DE PÁGINA =====
    yPos += 20;
    doc.setDrawColor(200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(191, 25, 25);
    doc.text('¡Gracias por tu compra!', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Jersey Club - Tu tienda de confianza para camisetas deportivas', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    doc.text('www.jerseyclub.ec | contacto@jerseyclub.ec', pageWidth / 2, yPos, { align: 'center' });
    
    // Guardar PDF
    doc.save(`factura-${order.orderId}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generando PDF:', error);
    
    // Si jsPDF no está instalado, mostrar instrucciones
    if (error.message && error.message.includes('jspdf')) {
      alert('Para generar PDFs, necesitas instalar jsPDF.\n\nEjecuta en terminal:\nnpm install jspdf');
    }
    
    return false;
  }
};

/**
 * Verificar si jsPDF está disponible
 * @returns {Promise<boolean>}
 */
export const isPdfAvailable = async () => {
  try {
    await import('jspdf');
    return true;
  } catch {
    return false;
  }
};

// Eliminado default export para evitar advertencias de ESLint
