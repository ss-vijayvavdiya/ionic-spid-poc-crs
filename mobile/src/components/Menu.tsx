/**
 * Side menu with i18n labels and user profile section.
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
  personCircleOutline,
} from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

const Menu: React.FC = () => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { displayName } = useUser();

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
      <div
        style={{
          padding: '1.5rem 1rem',
          background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
          color: '#fff',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>POS Receipt</p>
        <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '1.1rem' }}>{displayName || t('menu.guest')}</p>
      </div>
      <IonList>
        <IonListHeader style={{ color: 'var(--ion-color-primary)', fontWeight: 600 }}>Menu</IonListHeader>
        {menuItems.map((item) => (
          <IonMenuToggle key={item.path}>
            <IonItem button routerLink={item.path} routerDirection="none" detail={false}>
              <IonIcon slot="start" icon={item.icon} style={{ color: 'var(--ion-color-primary)' }} />
              <IonLabel>{t(`menu.${item.key}`)}</IonLabel>
            </IonItem>
          </IonMenuToggle>
        ))}
      </IonList>
      <IonList>
        <IonMenuToggle>
          <IonItem button routerLink="/profile" routerDirection="none" detail={false}>
            <IonIcon slot="start" icon={personCircleOutline} style={{ color: 'var(--ion-color-secondary)' }} />
            <IonLabel>{displayName || t('menu.guest')}</IonLabel>
          </IonItem>
        </IonMenuToggle>
        <IonItem button onClick={handleLogout} style={{ '--color': 'var(--ion-color-danger)' } as React.CSSProperties}>
          <IonIcon slot="start" icon={logOutOutline} />
          <IonLabel>{t('menu.logout')}</IonLabel>
        </IonItem>
      </IonList>
    </>
  );
};

export default Menu;
