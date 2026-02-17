/**
 * Side menu with i18n labels.
 */
import React from 'react';
import {
  IonList,
  IonListHeader,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
} from '@ionic/react';
import {
  cartOutline,
  receiptOutline,
  cubeOutline,
  peopleOutline,
  cardOutline,
  printOutline,
  barChartOutline,
  settingsOutline,
  helpCircleOutline,
  logOutOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Menu: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { path: '/checkout', icon: cartOutline, key: 'checkout' },
    { path: '/receipts', icon: receiptOutline, key: 'receipts' },
    { path: '/products', icon: cubeOutline, key: 'products' },
    { path: '/customers', icon: peopleOutline, key: 'customers' },
    { path: '/settings/payments', icon: cardOutline, key: 'payments' },
    { path: '/settings/printer', icon: printOutline, key: 'printer' },
    { path: '/reports', icon: barChartOutline, key: 'reports' },
    { path: '/settings', icon: settingsOutline, key: 'settings' },
    { path: '/support', icon: helpCircleOutline, key: 'support' },
  ];

  return (
    <>
      <IonList>
        <IonListHeader>POS</IonListHeader>
        {menuItems.map((item) => (
          <IonMenuToggle key={item.path}>
            <IonItem button routerLink={item.path} routerDirection="none">
              <IonIcon slot="start" icon={item.icon} />
              <IonLabel>{t(`menu.${item.key}`)}</IonLabel>
            </IonItem>
          </IonMenuToggle>
        ))}
      </IonList>
      <IonList>
        <IonItem button onClick={handleLogout}>
          <IonIcon slot="start" icon={logOutOutline} />
          <IonLabel>{t('menu.logout')}</IonLabel>
        </IonItem>
      </IonList>
    </>
  );
};

export default Menu;
