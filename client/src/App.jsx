import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/navbar/Navbar.jsx";
import Footer from "./components/footer/Footer.jsx";
import Home from "./components/home/Home.jsx";
import Products from "./components/products/Products.jsx";
import Cart from "./components/cart/Cart.jsx";
import Profile from "./components/profile/Profile.jsx";
import Login from "./components/login/Login.jsx";
import Register from "./components/register/Register.jsx";
import Contact from "./components/contact/Contact.jsx";
import About from "./components/about/About.jsx";
import NotFound from './components/not-found/NotFound.jsx';
import ProductDetails from './components/product-details/ProductDetails.jsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId/details" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
