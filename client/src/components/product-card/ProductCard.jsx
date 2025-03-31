import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddToCart } from '../../api/userProfileApi.js';

const ProductCard = ({ 
  id,
  imageUrl, 
  name, 
  price, 
  pricePerKg, 
  weight, 
  origin, 
  originFlag, 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const { updateCartHandler } = useAddToCart();
  const navigate = useNavigate();

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleCardClick = (e) => {
    if (e.target.classList.contains('btn-accent')) return;
    navigate(`/products/${id}/details`);
  };

  const addButtonHandler = (e) => {
    updateCartHandler(id, quantity, price, imageUrl, name);

    setQuantity(1);
  }

  return (
    <div 
      className="card bg-base-100 shadow-lg transition-all duration-300 h-full cursor-pointer"
      style={{
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : ''
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <figure className="px-4 pt-4 relative overflow-hidden rounded-t-xl">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/10 opacity-0 transition-opacity duration-300"
             style={{ opacity: isHovered ? 0.1 : 0 }}>
        </div>
        <img
          src={imageUrl}
          alt={name}
          className="rounded-xl h-56 w-full object-cover transition-transform duration-500"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        />
      </figure>
      
      <div className="card-body p-5">
        <div className="mb-2">
          <h3 className="card-title text-xl font-bold">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-accent font-bold text-lg">{price} лв</span>
            <span className="text-sm text-base-content/70">/ {pricePerKg} лв/кг</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-base-content/70 text-sm bg-base-200/50 p-2 rounded-lg mb-4">
          <span>{weight}</span>
          <span>•</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-base-300">
              <img 
                src={originFlag} 
                alt={`${origin} flag`} 
                className="w-full h-full object-cover"
              />
            </div>
            <span>{origin}</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-auto">
          <div className="flex items-center justify-between bg-base-200/50 rounded-lg p-2">
            <button 
              className="btn btn-sm btn-circle btn-ghost text-lg"
              onClick={(e) => { e.stopPropagation(); handleQuantityChange(-1); }}
            >
              -
            </button>
            <span className="font-medium text-base">{quantity}</span>
            <button 
              className="btn btn-sm btn-circle btn-ghost text-lg"
              onClick={(e) => { e.stopPropagation(); handleQuantityChange(1); }}
            >
              +
            </button>
          </div>
          
          <button 
            className="btn btn-accent w-full"
            onClick={addButtonHandler}
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(0)',
              opacity: isHovered ? 1 : 0.9,
              transition: 'all 0.3s ease'
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 