/**
 * App shell with IonMenu (side menu) and IonRouterOutlet.
 * All routes except /login require authentication (AuthGuard).
 * When authenticated and on /login, redirect to checkout (handles post-SPID flow).
 */
import React, { useEffect } from 'react';
import { IonMenu, IonRouterOutlet, IonContent, useIonRouter } from '@ionic/react';
import { Route, Redirect, useLocation } from 'react-router-dom';
import Menu from '../components/Menu';
import { PrivateRoute, PublicLoginRoute } from '../components/AuthGuard';
import { useAuth } from '../contexts/AuthContext';
import { useMerchant } from '../contexts/MerchantContext';

// Pages
import LoginPage from '../pages/LoginPage';
import MerchantSelectPage from '../pages/MerchantSelectPage';
import CheckoutPage from '../pages/CheckoutPage';
import ReceiptsPage from '../pages/ReceiptsPage';
import ReceiptDetailPage from '../pages/ReceiptDetailPage';
import ProductsPage from '../pages/ProductsPage';
import ProductFormPage from '../pages/ProductFormPage';
import SettingsPage from '../pages/SettingsPage';
import LanguageSettingsPage from '../pages/LanguageSettingsPage';
import PaymentsSettingsPage from '../pages/PaymentsSettingsPage';
import PrinterSettingsPage from '../pages/PrinterSettingsPage';
import ReportsPage from '../pages/ReportsPage';
import SupportPage from '../pages/SupportPage';
import CustomersPage from '../pages/CustomersPage';
import CustomerFormPage from '../pages/CustomerFormPage';
import HomePage from '../pages/HomePage';
import ProfilePage from '../pages/ProfilePage';

const AppShell: React.FC = () => {
  const { token } = useAuth();
  const { merchants, selectedMerchant } = useMerchant();
  const ionRouter = useIonRouter();
  const location = useLocation();

  useEffect(() => {
    if (!token) return;
    if (location.pathname === '/login') {
      ionRouter.push('/checkout', 'root');
      return;
    }
    if (merchants.length > 1 && !selectedMerchant && location.pathname !== '/merchant-select') {
      ionRouter.push('/merchant-select', 'root');
    }
  }, [token, merchants.length, selectedMerchant, location.pathname, ionRouter]);

  return (
    <>
      <IonMenu contentId="main-content" type="overlay" menuId="main-menu" disabled={!token}>
        <IonContent>
          <Menu />
        </IonContent>
      </IonMenu>

      <IonRouterOutlet id="main-content">
        <PublicLoginRoute exact path="/login" component={LoginPage} />
        <PrivateRoute exact path="/merchant-select" component={MerchantSelectPage} />
        <PrivateRoute exact path="/checkout" component={CheckoutPage} />
        <PrivateRoute exact path="/receipts" component={ReceiptsPage} />
        <PrivateRoute exact path="/receipts/:id" component={ReceiptDetailPage} />
        <PrivateRoute exact path="/products" component={ProductsPage} />
        <PrivateRoute exact path="/products/new" component={ProductFormPage} />
        <PrivateRoute exact path="/products/:id/edit" component={ProductFormPage} />
        <PrivateRoute exact path="/customers" component={CustomersPage} />
        <PrivateRoute exact path="/customers/new" component={CustomerFormPage} />
        <PrivateRoute exact path="/customers/:id/edit" component={CustomerFormPage} />
        <PrivateRoute exact path="/settings" component={SettingsPage} />
        <PrivateRoute exact path="/settings/language" component={LanguageSettingsPage} />
        <PrivateRoute exact path="/settings/payments" component={PaymentsSettingsPage} />
        <PrivateRoute exact path="/settings/printer" component={PrinterSettingsPage} />
        <PrivateRoute exact path="/reports" component={ReportsPage} />
        <PrivateRoute exact path="/support" component={SupportPage} />
        <PrivateRoute exact path="/home" component={HomePage} />
        <PrivateRoute exact path="/profile" component={ProfilePage} />

        <Route exact path="/">
          {token ? <Redirect to="/checkout" /> : <Redirect to="/login" />}
        </Route>
        <Route exact path="/index.html">
          {token ? <Redirect to="/checkout" /> : <Redirect to="/login" />}
        </Route>

        <Route>
          <Redirect to="/" />
        </Route>
      </IonRouterOutlet>
    </>
  );
};

export default AppShell;
