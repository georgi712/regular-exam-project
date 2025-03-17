import { useState } from 'react';

const ProductCard = ({ 
  image, 
  name, 
  price, 
  pricePerKg, 
  grammage, 
  origin, 
  originFlag,
  onAddToCart 
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    onAddToCart({ name, price, quantity });
  };

  return (
    <div className="card bg-base-100 border border-base-200 hover:border-accent transition-all duration-300">
      <figure className="px-4 pt-4">
        <img
          src={image}
          alt={name}
          className="rounded-xl h-56 w-full object-cover"
        />
      </figure>
      <div className="card-body space-y-4">
        <div className="space-y-2">
          <h3 className="card-title text-xl">{name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold text-lg">{price} лв</span>
            <span className="text-sm text-base-content/70">/ {pricePerKg} лв/кг</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-base-content/70 text-sm">
          <span>{grammage}</span>
          <span>•</span>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden">
              <img 
                src={originFlag} 
                alt={`${origin} flag`} 
                className="w-full h-full object-cover"
              />
            </div>
            <span>{origin}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center border rounded-lg">
            <button 
              className="btn btn-ghost btn-sm px-3"
              onClick={() => handleQuantityChange(-1)}
            >
              -
            </button>
            <input 
              type="number" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center border-x px-2 py-1"
              min="1"
            />
            <button 
              className="btn btn-ghost btn-sm px-3"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </button>
          </div>
          <button 
            className="btn btn-accent flex-grow"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 