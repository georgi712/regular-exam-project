import { Link } from 'react-router-dom';

// Mock data for demonstration
const MOCK_CART_ITEMS = [
  {
    id: 1,
    name: 'Fresh Apples',
    price: 2.99,
    quantity: 2,
    image: '/images/apple.jpg',
  },
  {
    id: 2,
    name: 'Organic Bananas',
    price: 1.99,
    quantity: 3,
    image: '/images/banana.jpg',
  },
  {
    id: 3,
    name: 'Sweet Oranges',
    price: 3.49,
    quantity: 1,
    image: '/images/orange.jpg',
  },
];

export default function Cart() {
  const cartItems = MOCK_CART_ITEMS;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-base-content">Shopping Cart</h1>
                <p className="text-base-content/70 mt-2">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              {cartItems.length > 0 && (
                <button
                  className="btn btn-ghost text-error hover:bg-error/10"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center py-16">
                  <div className="bg-base-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-base-content/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                  <p className="text-base-content/70 mb-8 max-w-md mx-auto">
                    Looks like you haven't added any items to your cart yet. Start shopping to add some delicious fruits!
                  </p>
                  <Link to="/products" className="btn btn-primary btn-lg">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="divide-y divide-base-200">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row gap-6 items-center py-6 first:pt-0 last:pb-0"
                      >
                        <div className="relative group">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-28 h-28 object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300" />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                          <h3 className="font-bold text-xl">{item.name}</h3>
                          <p className="text-accent font-bold text-lg mt-1">
                            {item.price.toFixed(2)} лв
                          </p>
                          <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                            <button
                              className="btn btn-circle btn-sm btn-ghost hover:bg-base-200"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              className="input input-bordered w-20 text-center text-lg font-medium"
                              min="1"
                            />
                            <button
                              className="btn btn-circle btn-sm btn-ghost hover:bg-base-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="font-bold text-xl mb-3">
                            {(item.price * item.quantity).toFixed(2)} лв
                          </p>
                          <button
                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="card bg-base-100 shadow-lg sticky top-8">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-base-content/70">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} лв</span>
                  </div>
                  <div className="flex justify-between text-base-content/70">
                    <span>Shipping</span>
                    <span>{shipping.toFixed(2)} лв</span>
                  </div>
                  <div className="flex justify-between text-base-content/70">
                    <span>Tax (10%)</span>
                    <span>{tax.toFixed(2)} лв</span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{total.toFixed(2)} лв</span>
                  </div>

                  {/* Promo Code */}
                  <div className="form-control mt-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        className="input input-bordered flex-grow focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button className="btn btn-primary whitespace-nowrap">Apply</button>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    className="btn btn-primary btn-lg w-full mt-6"
                  >
                    Proceed to Checkout
                  </Link>

                  {/* Continue Shopping */}
                  <Link
                    to="/products"
                    className="btn btn-outline btn-lg w-full"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 