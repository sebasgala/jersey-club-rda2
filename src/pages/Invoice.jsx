import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Invoice() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const order = state?.order;

  // Si no hay orden en el estado, redirigir al inicio
  useEffect(() => {
    if (!order) {
      navigate('/');
    }
  }, [order, navigate]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // Mejor calidad
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`factura-jersey-club-${order.orderNumber}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  if (!order) return null;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Contenedor referenciado para captura PDF */}
        <div ref={invoiceRef} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center bg-white print:shadow-none">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 print:hidden">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1111] mb-3">
            ¡Compra Confirmada!
          </h1>

          <p className="text-gray-600 mb-2">
            Gracias por tu compra, {order.shippingData?.fullName || 'Cliente'}
          </p>

          <p className="text-sm text-gray-500 mb-6">
            Orden #{order.orderNumber}
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-3 border-b pb-2">Resumen del pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{order.items?.length || 0} productos</span>
                <span className="font-medium">${order.total?.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío</span>
                <span className="font-medium">
                  {order.total?.freeShipping ? 'GRATIS' : `$${order.total?.shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA (15%)</span>
                <span className="font-medium">${order.total?.taxes}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                <span className="font-bold text-gray-900 text-lg">Total Pagado</span>
                <span className="font-bold text-[#B12704] text-lg">${order.total?.total}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Datos de Envío</h4>
              <p className="text-sm text-gray-600">{order.shippingData?.fullName}</p>
              <p className="text-sm text-gray-600">{order.shippingData?.address}</p>
              <p className="text-sm text-gray-600">{order.shippingData?.city}, {order.shippingData?.country}</p>
              <p className="text-sm text-gray-600">{order.shippingData?.phone}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6 print:hidden">
            Hemos enviado un correo de confirmación a <strong>{order.shippingData?.email}</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden" data-html2canvas-ignore>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center px-6 py-3 bg-[#B12704] hover:bg-[#8d1f03] text-white font-medium rounded-full transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar PDF
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#495A72] hover:bg-[#3d4d61] text-white font-medium rounded-full transition-colors shadow-sm"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
