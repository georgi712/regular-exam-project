import { Routes, Route } from 'react-router-dom';

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
import Checkout from './components/checkout/Checkout.jsx';
import Admin from './components/admin/Admin.jsx';
import Logout from './components/logout/Logout.jsx';
import UserProvider from './providers/UserProvider.jsx';
import MyOrders from './components/profile/orders/MyOrders';
import { ToastProvider } from './contexts/ToastContext.jsx';
import AuthGard from './components/guards/AuthGard.jsx';
import UserGard from './components/guards/UserGard.jsx';
import AdminGuard from './components/guards/AdminGuard.jsx';
import AuthGardLogout from './components/guards/AuthGardLogout.jsx';

function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:productId/details" element={<ProductDetails />} />
              <Route element={<AuthGard />} >
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<MyOrders />} />
              </Route>
              <Route element={<AuthGardLogout/>} >
                <Route path="/logout" element={<Logout />} />
              </Route>
              <Route element={<UserGard />} >
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              <Route element={<AdminGuard />} >
                  <Route path="/admin" element={<Admin />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </UserProvider>
    </ToastProvider>
  );
}

export default App;
