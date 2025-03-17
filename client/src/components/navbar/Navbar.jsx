import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    // Function to update the theme state
    const updateTheme = () => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    };

    // Observe changes in the data-theme attribute
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Cleanup the observer on unmount
    return () => observer.disconnect();
  }, []);

  // Change the logo based on the theme
  const logoSrc =
    theme === "dark"
      ? "/images/fruvida-high-resolution-logo-Photoroom.png"
      : "/images/fruvida-high-resolution-logo-white-Photoroom.png"; // Dark mode logo

  const isActive = (path) => location.pathname === path;

  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className={`navbar ${theme === 'light' ? 'bg-success text-success-content' : 'bg-base-300'}`}>
          {/* Left side - Drawer button for mobile */}
          <div className="flex-none lg:hidden">
            <label
              htmlFor="my-drawer"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </label>
          </div>

          {/* Logo */}
          <div className="flex-none">
            <Link to="/" className="h-16 flex items-center">
              <img
                src={logoSrc}
                alt="FruVida"
                className="h-20 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Centered Navbar for large screens */}
          <div className="flex-1 hidden lg:flex justify-center items-center">
            <ul className="menu menu-horizontal items-center gap-6">
              <li>
                <Link
                  to="/"
                  className={`hover:bg-accent hover:text-accent-content ${
                    isActive("/") ? "bg-accent text-accent-content" : ""
                  }`}
                >
                  Home
                </Link>
              </li>
              <li>
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('products')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    to="/products"
                    className={`flex items-center gap-1 hover:bg-accent hover:text-accent-content px-4 py-2 rounded-full ${
                      isActive("/products") ? "bg-accent text-accent-content" : ""
                    }`}
                  >
                    Products
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <ul 
                    className={`absolute top-full menu dropdown-content z-[1] p-2 shadow bg-base-100 text-base-content rounded-box w-52 ${
                      activeDropdown === 'products' ? 'block' : 'hidden'
                    }`}
                  >
                    <li><Link to="/products?category=fruits" className="hover:bg-accent hover:text-accent-content">Fruits</Link></li>
                    <li><Link to="/products?category=vegetables" className="hover:bg-accent hover:text-accent-content">Vegetables</Link></li>
                    <li><Link to="/products?category=juices" className="hover:bg-accent hover:text-accent-content">Fresh Juices</Link></li>
                    <li><Link to="/products?category=smoothies" className="hover:bg-accent hover:text-accent-content">Smoothies</Link></li>
                  </ul>
                </div>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`hover:bg-accent hover:text-accent-content ${
                    isActive("/about") ? "bg-accent text-accent-content" : ""
                  }`}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className={`hover:bg-accent hover:text-accent-content ${
                    isActive("/contact") ? "bg-accent text-accent-content" : ""
                  }`}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Right side - Cart & Profile */}
          <div className="flex-none flex gap-2 ml-auto">
            {/* Cart Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('cart')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="btn btn-ghost btn-circle hover:bg-accent hover:text-accent-content">
                <div className="indicator">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="badge badge-sm indicator-item badge-primary">8</span>
                </div>
              </div>
              <div
                className={`absolute top-full card card-compact w-52 bg-base-100 text-base-content shadow ${
                  activeDropdown === 'cart' ? 'block' : 'hidden'
                }`}
              >
                <div className="card-body">
                  <span className="font-bold text-lg">8 Items</span>
                  <span className="text-base-content/80">Subtotal: $999</span>
                  <div className="card-actions">
                    <Link to="/cart" className="btn btn-primary btn-block">
                      View cart
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setActiveDropdown('profile')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <div className="btn btn-ghost btn-circle hover:bg-accent hover:text-accent-content">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <ul
                className={`absolute top-full menu menu-sm bg-base-100 text-base-content rounded-box w-52 p-2 shadow ${
                  activeDropdown === 'profile' ? 'block' : 'hidden'
                }`}
              >
                <li>
                  <Link to="/profile" className="justify-between hover:bg-accent hover:text-accent-content">
                    Profile
                    <span className="badge badge-accent">New</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile/settings" className="hover:bg-accent hover:text-accent-content">
                    Settings
                  </Link>
                </li>
                <div className="divider my-0"></div>
                <li>
                  <Link to="/login" className="text-error hover:bg-error/10">
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Drawer (Mobile Menu) */}
      <div className="drawer-side z-[999]">
        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu bg-base-300 min-h-full w-80 p-4">
          <li>
            <Link
              to="/"
              className={`hover:bg-accent hover:text-accent-content ${
                isActive("/") ? "bg-accent text-accent-content" : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <details>
              <summary className={`hover:bg-accent hover:text-accent-content ${
                location.pathname === "/products" ? "bg-accent text-accent-content" : ""
              }`}>
                Products
              </summary>
              <ul className="p-2">
                <li><Link to="/products?category=fruits" className="hover:bg-accent hover:text-accent-content">Fruits</Link></li>
                <li><Link to="/products?category=vegetables" className="hover:bg-accent hover:text-accent-content">Vegetables</Link></li>
                <li><Link to="/products?category=juices" className="hover:bg-accent hover:text-accent-content">Fresh Juices</Link></li>
                <li><Link to="/products?category=smoothies" className="hover:bg-accent hover:text-accent-content">Smoothies</Link></li>
              </ul>
            </details>
          </li>
          <li>
            <Link
              to="/about"
              className={`hover:bg-accent hover:text-accent-content ${
                isActive("/about") ? "bg-accent text-accent-content" : ""
              }`}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={`hover:bg-accent hover:text-accent-content ${
                isActive("/contact") ? "bg-accent text-accent-content" : ""
              }`}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}