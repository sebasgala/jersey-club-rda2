import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white border border-gray-200 rounded-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden"
    >
      <div className="relative">
        <div className="block p-2 sm:p-4 pb-1 sm:pb-2 w-full">
          <figure className="relative aspect-square w-full overflow-hidden rounded-md bg-gray-50">
            <img
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              src={product.image}
              alt={product.name}
              loading="lazy"
            />
          </figure>
        </div>
      </div>
      <div className="flex-1 px-2 sm:px-4 pb-2 sm:pb-4 flex flex-col">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-orange-600 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
          {product.name}
        </h3>
        <div className="mt-2 sm:mt-3">
          <span className="text-lg sm:text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
        </div>
        <div className="mt-auto pt-2 sm:pt-3 w-full bg-[#495A72] group-hover:bg-[#3E4E63] text-white font-medium py-1.5 sm:py-2 px-2 sm:px-4 rounded-full text-[10px] sm:text-sm transition-colors shadow-sm text-center">
          Ver detalles
        </div>
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    stock: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProductCard;