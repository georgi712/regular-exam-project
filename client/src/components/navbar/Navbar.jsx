import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );

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
            <Link to="/" className="h-20 flex items-center">
              <img
                src={logoSrc}
                alt="FruVida"
                className="h-24 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Centered Navbar for large screens */}
          <div className="flex-1 hidden lg:flex justify-center items-center">
            <ul className="menu menu-horizontal items-center gap-4">
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
              <li className="dropdown dropdown-hover">
                <div 
                  tabIndex={0} 
                  role="button" 
                  className={`flex items-center gap-1 hover:bg-accent hover:text-accent-content ${
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
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-6">
                  <li><Link to="/products?category=fruits" className="text-base-content hover:bg-accent hover:text-accent-content">Fruits</Link></li>
                  <li><Link to="/products?category=vegetables" className="text-base-content hover:bg-accent hover:text-accent-content">Vegetables</Link></li>
                  <li><Link to="/products?category=juices" className="text-base-content hover:bg-accent hover:text-accent-content">Fresh Juices</Link></li>
                  <li><Link to="/products?category=nuts" className="text-base-content hover:bg-accent hover:text-accent-content">Nuts</Link></li>
                </ul>
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
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-accent hover:text-accent-content">
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
              <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-52 bg-base-100 text-base-content shadow mt-3">
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
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-accent hover:text-accent-content">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content z-[1] menu menu-sm bg-base-100 text-base-content rounded-box w-52 p-2 shadow mt-3">
                <li>
                  <Link to="/login" className="hover:bg-accent hover:text-accent-content">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:bg-accent hover:text-accent-content">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:bg-accent hover:text-accent-content">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:bg-accent hover:text-accent-content">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Dashboard
                  </Link>
                </li>
                <div className="divider my-0"></div>
                <li>
                  <Link to="/logout" className="text-error hover:bg-error/10">
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
                <li><Link to="/products?category=nuts" className="hover:bg-accent hover:text-accent-content">Nuts</Link></li>
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