/**
 * Header bar with menu toggle, title, and optional offline badge.
 */
import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton } from '@ionic/react';
import OfflineBadge from './OfflineBadge';
import { useConnectivity } from '../contexts/ConnectivityContext';
import { useSync } from '../contexts/SyncContext';

interface HeaderBarProps {
  title: string;
  isOffline?: boolean;
  pendingSyncCount?: number;
  actions?: React.ReactNode;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ title, isOffline: isOfflineProp, pendingSyncCount: pendingProp, actions }) => {
  const { isOnline } = useConnectivity();
  const { pendingCount } = useSync();
  const isOffline = isOfflineProp ?? !isOnline;
  const pendingSyncCount = pendingProp ?? pendingCount;

  return (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonMenuButton menu="main-menu" />
      </IonButtons>
      <IonTitle>{title}</IonTitle>
      <IonButtons slot="end">
        {actions}
        <OfflineBadge isOffline={isOffline} pendingCount={pendingSyncCount} />
      </IonButtons>
    </IonToolbar>
  </IonHeader>
  );
};

export default HeaderBar;
