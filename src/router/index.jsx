import ResetPassword from "../views/ResetPassword";
<Route path="/reset-password/:token" element={<ResetPassword />} />
// src/router/index.jsx
import { Routes, Route } from "react-router-dom";

// Layout público
import Layout from "../views/Layout";

// Vistas públicas
import Home from "../views/Home";
import Cart from "../views/Cart";
import NotFound from "../views/NotFound";
import Categories from "../views/Categories";
import SizeGuide from "../views/SizeGuide";
import CottonCare from "../views/CottonCare";
import FAQ from "../views/FAQ";
import PaymentMethods from "../views/PaymentMethods";
import MyAccount from "../views/MyAccount";
import Products from "../views/Products";
import Category from "../views/Category";
import ProductDetail from "../views/ProductDetail";
import Wishlist from "../views/Wishlist";

// ⭐ NUEVO: Registro
import Register from "../views/account/Register";

// Checkout
import Checkout from "../views/Checkout";
import CheckoutSuccess from "../views/CheckoutSuccess";
import CheckoutError from "../views/CheckoutError";

// ⭐ NUEVO: Mercado Pago Payment Results
import PaymentSuccess from "../views/PaymentSuccess";
import PaymentFailure from "../views/PaymentFailure";
import PaymentPending from "../views/PaymentPending";

// ⭐ NUEVO: Modo Checkout
import ModoCheckout from "../views/ModoCheckout";

// Order Tracking
import OrderTracking from "../views/OrderTracking";

// Order Details (PÚBLICO)
import OrderDetails from "../views/OrderDetails";

// Admin
import AdminLayout from "../views/AdminLayout";
import AdminDashboard from "../views/AdminDashboard";
import AdminSales from "../views/AdminSales";
import AdminSaleDetail from "../views/AdminSaleDetail";
import AdminProducts from "../views/AdminProducts";
import AdminProductDetail from "../views/AdminProductDetail";
import AdminStock from "../views/AdminStock";
import AdminCustomers from "../views/AdminCustomers";
import AdminCustomerDetail from "../views/AdminCustomerDetail";
import AdminCustomerEdit from "../views/AdminCustomerEdit";
import AdminStats from "../views/AdminStats";
import AdminOpinions from "../views/AdminOpinions";
import AdminMarketing from "../views/AdminMarketing";
import AdminSubcategories from "../views/AdminSubcategories";

// Nuevos imports admin
import AdminDiscounts from "../views/AdminDiscounts";
import AdminPromoCodes from "../views/AdminPromoCodes";
import AdminSizeTables from "../views/AdminSizeTables";

// Protección admin
import AdminRoute from "./AdminRoute";

// Área de cliente (PROTEGIDA)
import UserRoute from "./UserRoute";
import AccountLayout from "../views/account/AccountLayout";
import AccountPurchases from "../views/account/AccountPurchases";
import AccountProfile from "../views/account/AccountProfile";
import AccountShipping from "../views/account/AccountShipping";
import AccountContact from "../views/account/AccountContact";

// ⭐ NUEVO: soporte
import AccountOpinions from "../views/account/AccountOpinions";
import AccountHelp from "../views/account/AccountHelp";

export default function AppRouter() {
  return (
    <Routes>

      {/* Públicas */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/indumentaria/:subcategory" element={<Category section="indumentaria" />} />
        <Route path="/cute-items/:subcategory" element={<Category section="cute-items" />} />
        <Route path="/merch/:subcategory" element={<Category section="merch" />} />

        <Route path="/categorias" element={<Categories />} />
        <Route path="/talles" element={<SizeGuide />} />
        <Route path="/algodon" element={<CottonCare />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/medios-de-pago" element={<PaymentMethods />} />

        <Route path="/mi-cuenta" element={<MyAccount />} />

        {/* ⭐ NUEVA RUTA DE REGISTRO */}
        <Route path="/register" element={<Register />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />

        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/checkout/error" element={<CheckoutError />} />

        {/* ⭐ NUEVO: Rutas de pago Mercado Pago */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        <Route path="/payment/pending" element={<PaymentPending />} />

        {/* ⭐ NUEVO: Ruta de checkout Modo */}
        <Route path="/payment/modo-checkout" element={<ModoCheckout />} />

        <Route path="/seguimiento" element={<OrderTracking />} />
        <Route path="/orden/:code" element={<OrderDetails />} />

        <Route path="/notfound" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/sales" element={<AdminSales />} />
        <Route path="/admin/sales/:id" element={<AdminSaleDetail />} />

        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProductDetail />} />
        <Route path="/admin/products/:id" element={<AdminProductDetail />} />

        <Route path="/admin/stock" element={<AdminStock />} />

        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/customers/:id" element={<AdminCustomerDetail />} />
        <Route path="/admin/customers/:id/edit" element={<AdminCustomerEdit />} />

        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/marketing" element={<AdminMarketing />} />

        <Route path="/admin/discounts" element={<AdminDiscounts />} />
        <Route path="/admin/promocodes" element={<AdminPromoCodes />} />
        <Route path="/admin/subcategories" element={<AdminSubcategories />} />
        <Route path="/admin/sizetables" element={<AdminSizeTables />} />
        <Route path="/admin/opinions" element={<AdminOpinions />} />
      </Route>

      {/* Área de cliente */}
      <Route
        element={
          <UserRoute>
            <AccountLayout />
          </UserRoute>
        }
      >
        <Route path="/mi-cuenta/compras" element={<AccountPurchases />} />
        <Route path="/mi-cuenta/perfil" element={<AccountProfile />} />
        <Route path="/mi-cuenta/envio" element={<AccountShipping />} />
        <Route path="/mi-cuenta/contacto" element={<AccountContact />} />
        <Route path="/mi-cuenta/opiniones" element={<AccountOpinions />} />
        {/* ⭐ NUEVA RUTA DE AYUDA */}
        <Route path="/mi-cuenta/ayuda" element={<AccountHelp />} />
      </Route>

    </Routes>
  );
}
