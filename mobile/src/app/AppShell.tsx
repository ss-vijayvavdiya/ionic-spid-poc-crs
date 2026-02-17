/**
 * App shell with IonMenu (side menu) and IonRouterOutlet.
 * Wraps authenticated routes. Login is outside the menu.
 */
import React from 'react';
import {
  IonMenu,
  IonRouterOutlet,
  IonSplitPane,
  IonContent,
} from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import Menu from '../components/Menu';

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
import HomePage from '../pages/HomePage';

import { getStoredToken } from '../auth/storage';

const AppShell: React.FC = () => {
  const token = getStoredToken();

  return (
    <IonSplitPane contentId="main-content" when="md">
          <IonMenu contentId="main-content" type="overlay" menuId="main-menu" disabled={!token}>
            <IonContent>
              <Menu />
            </IonContent>
          </IonMenu>

          <IonRouterOutlet id="main-content">
            <Route exact path="/login" component={LoginPage} />
            <Route exact path="/merchant-select" component={MerchantSelectPage} />

            <Route exact path="/checkout" component={CheckoutPage} />
            <Route exact path="/receipts" component={ReceiptsPage} />
            <Route exact path="/receipts/:id" component={ReceiptDetailPage} />
            <Route exact path="/products" component={ProductsPage} />
            <Route exact path="/products/new" component={ProductFormPage} />
            <Route exact path="/products/:id/edit" component={ProductFormPage} />
            <Route exact path="/customers" component={CustomersPage} />
            <Route exact path="/settings" component={SettingsPage} />
            <Route exact path="/settings/language" component={LanguageSettingsPage} />
            <Route exact path="/settings/payments" component={PaymentsSettingsPage} />
            <Route exact path="/settings/printer" component={PrinterSettingsPage} />
            <Route exact path="/reports" component={ReportsPage} />
            <Route exact path="/support" component={SupportPage} />
            <Route exact path="/home" component={HomePage} />

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
        </IonSplitPane>
  );
};

export default AppShell;
