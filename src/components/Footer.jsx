import React from "react";
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white border-t border-gray-800 relative z-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10">
        {/* Jersey Club EC Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">Jersey Club EC</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Tu tienda online de camisetas deportivas de las mejores ligas y equipos del mundo.
          </p>
        </div>

        {/* Enlaces Rápidos Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">Enlaces Rápidos</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/futbol" className="text-gray-300 hover:text-white text-sm transition-colors">Fútbol</Link>
            </li>
            <li>
              <Link to="/formula1" className="text-gray-300 hover:text-white text-sm transition-colors">Fórmula 1</Link>
            </li>
            <li>
              <Link to="/jersey-club-brand" className="text-gray-300 hover:text-white text-sm transition-colors">Jersey Club Brand</Link>
            </li>
            <li>
              <Link to="/ofertas" className="text-gray-300 hover:text-white text-sm transition-colors">Ofertas</Link>
            </li>
          </ul>
        </div>

        {/* Contacto Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">Contacto</h3>
          <ul className="space-y-4">
            <li>
              <p className="text-gray-400 text-xs">Email</p>
              <a href="mailto:info@jerseyclubec.com" className="text-gray-300 hover:text-white text-sm transition-colors">
                info@jerseyclubec.com
              </a>
            </li>
            <li>
              <p className="text-gray-400 text-xs">Teléfono / WhatsApp</p>
              <a href="tel:+593997941179" className="text-gray-300 hover:text-white text-sm transition-colors">
                +593 997941179
              </a>
            </li>
            <li>
              <p className="text-gray-400 text-xs">Ubicación</p>
              <p className="text-gray-300 text-sm">Quito, Ecuador</p>
            </li>
            <li>
              <p className="text-gray-400 text-xs">Horario de atención</p>
              <p className="text-gray-300 text-sm">Lun - Vie: 9:00 - 18:00</p>
            </li>
          </ul>
        </div>

        {/* Social Media Section */}
        <div>
          <h3 className="text-lg font-bold mb-4">Síguenos</h3>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.325v21.351c0 .733.592 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.794.715-1.794 1.762v2.313h3.587l-.467 3.622h-3.12v9.294h6.116c.733 0 1.325-.591 1.325-1.324v-21.35c0-.733-.592-1.325-1.325-1.325z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.717 0-4.917 2.2-4.917 4.917 0 .386.044.762.127 1.124-4.083-.205-7.702-2.16-10.126-5.134-.423.725-.666 1.562-.666 2.457 0 1.697.865 3.194 2.181 4.073-.803-.026-1.56-.246-2.22-.616v.062c0 2.37 1.685 4.348 3.918 4.798-.41.111-.841.171-1.287.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.604 3.415-1.685 1.32-3.809 2.105-6.102 2.105-.396 0-.788-.023-1.175-.068 2.179 1.396 4.768 2.212 7.557 2.212 9.054 0 14-7.496 14-13.986 0-.21-.005-.423-.015-.633.961-.695 1.8-1.562 2.46-2.549z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 py-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-gray-400 text-sm">© 2024 Jersey Club EC. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
