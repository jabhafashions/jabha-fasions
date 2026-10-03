import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Components/Home/Home';
import Admin from './Components/Admin/Admin';
import ProductsPage from './Components/Products/ProductsPage';
import CartPage from './Components/Cart/CartPage';
import CheckoutPage from './Components/Cart/CheckoutPage';
import OrderSuccess from './Components/Cart/OrderSuccess';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
