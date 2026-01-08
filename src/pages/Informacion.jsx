import React from "react";

export default function Informacion() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Información</h1>

      {/* Términos de Servicio */}
      <section id="terminos" className="mb-12 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Términos de Servicio</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            Bienvenido a Jersey Club EC. Al acceder y utilizar nuestro sitio web, aceptas cumplir con los siguientes términos y condiciones de uso.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">1. Uso del Sitio</h3>
          <p>
            El contenido de este sitio web es únicamente para tu información general y uso personal. Está sujeto a cambios sin previo aviso.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">2. Propiedad Intelectual</h3>
          <p>
            Todo el contenido incluido en este sitio, como texto, gráficos, logotipos, imágenes y software, es propiedad de Jersey Club EC y está protegido por las leyes de propiedad intelectual.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">3. Cuenta de Usuario</h3>
          <p>
            Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Aceptas la responsabilidad de todas las actividades que ocurran bajo tu cuenta.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">4. Limitación de Responsabilidad</h3>
          <p>
            Jersey Club EC no será responsable por daños directos, indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar nuestros servicios.
          </p>
        </div>
      </section>

      {/* Política de Privacidad */}
      <section id="privacidad" className="mb-12 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Política de Privacidad</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            En Jersey Club EC, valoramos tu privacidad y nos comprometemos a proteger tu información personal.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">Información que Recopilamos</h3>
          <p>
            Recopilamos información que nos proporcionas directamente, como nombre, dirección de correo electrónico, dirección de envío y detalles de pago cuando realizas una compra.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">Uso de la Información</h3>
          <p>
            Utilizamos tu información para procesar pedidos, enviar confirmaciones, proporcionar soporte al cliente y mejorar nuestros servicios.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">Protección de Datos</h3>
          <p>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, pérdida o alteración.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">Cookies</h3>
          <p>
            Utilizamos cookies para mejorar tu experiencia de navegación. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades del sitio.
          </p>
        </div>
      </section>

      {/* Envíos y Entregas */}
      <section id="envios" className="mb-12 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Envíos y Entregas</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            Realizamos envíos a todo Ecuador con los mejores tiempos de entrega del mercado.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">Tiempos de Entrega</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Quito y Guayaquil:</strong> 1-3 días hábiles</li>
            <li><strong>Otras ciudades principales:</strong> 3-5 días hábiles</li>
            <li><strong>Zonas rurales:</strong> 5-7 días hábiles</li>
          </ul>
          <h3 className="font-semibold text-gray-800 mt-4">Costos de Envío</h3>
          <p>
            El costo de envío se calcula automáticamente según tu ubicación al momento del checkout. Ofrecemos envío gratuito en compras mayores a $50.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">Seguimiento de Pedido</h3>
          <p>
            Una vez que tu pedido sea despachado, recibirás un correo electrónico con el número de seguimiento para que puedas rastrear tu envío en tiempo real.
          </p>
        </div>
      </section>

      {/* Devoluciones */}
      <section id="devoluciones" className="mb-12 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Devoluciones y Cambios</h2>
        <div className="text-gray-700 leading-relaxed space-y-4">
          <p>
            Tu satisfacción es nuestra prioridad. Si no estás conforme con tu compra, estamos aquí para ayudarte.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">Política de Devolución</h3>
          <p>
            Aceptamos devoluciones dentro de los 30 días posteriores a la recepción del producto, siempre que el artículo esté sin usar, con etiquetas originales y en su empaque original.
          </p>
          <h3 className="font-semibold text-gray-800 mt-4">Proceso de Devolución</h3>
          <ol className="list-decimal ml-6 space-y-2">
            <li>Contáctanos por WhatsApp o correo electrónico indicando tu número de pedido.</li>
            <li>Te proporcionaremos las instrucciones para el envío del producto.</li>
            <li>Una vez recibido y verificado, procesaremos tu reembolso en 5-7 días hábiles.</li>
          </ol>
          <h3 className="font-semibold text-gray-800 mt-4">Cambios de Talla</h3>
          <p>
            Si necesitas cambiar la talla, contáctanos dentro de los 15 días posteriores a la entrega. Los cambios están sujetos a disponibilidad de stock.
          </p>
        </div>
      </section>

      {/* Preguntas Frecuentes */}
      <section id="faq" className="mb-12 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b pb-2">Preguntas Frecuentes</h2>
        <div className="text-gray-700 leading-relaxed space-y-6">
          <div>
            <h3 className="font-semibold text-gray-800">¿Las camisetas son originales?</h3>
            <p className="mt-2">
              Trabajamos con réplicas de alta calidad AAA+ que replican fielmente los diseños originales. No vendemos productos oficiales de las marcas deportivas.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">¿Cómo puedo saber mi talla?</h3>
            <p className="mt-2">
              En cada producto encontrarás una guía de tallas detallada. Si tienes dudas, contáctanos por WhatsApp y te ayudaremos a elegir la talla correcta.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">¿Qué métodos de pago aceptan?</h3>
            <p className="mt-2">
              Aceptamos tarjetas de crédito/débito (Visa, MasterCard), PayPal, transferencia bancaria y pago contra entrega en ciudades seleccionadas.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">¿Puedo personalizar mi camiseta con nombre y número?</h3>
            <p className="mt-2">
              Sí, ofrecemos servicio de personalización. Puedes agregar nombre y número a tu camiseta por un costo adicional. Consulta la opción al momento de comprar.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">¿Tienen tienda física?</h3>
            <p className="mt-2">
              Actualmente operamos exclusivamente online, lo que nos permite ofrecer mejores precios. Sin embargo, puedes recoger tu pedido en nuestro punto de entrega en Quito.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}