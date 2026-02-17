/**
 * Header bar with menu toggle, title, and optional offline badge.
 */
import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton } from '@ionic/react';
import OfflineBadge from './OfflineBadge';

interface HeaderBarProps {
  title: string;
  isOffline?: boolean;
  pendingSyncCount?: number;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  isOffline = false,
  pendingSyncCount = 0,
}) => (
  <IonHeader>
    <IonToolbar>
      <IonButtons slot="start">
        <IonMenuButton menu="main-menu" />
      </IonButtons>
      <IonTitle>{title}</IonTitle>
      <IonButtons slot="end">
        <OfflineBadge isOffline={isOffline} pendingCount={pendingSyncCount} />
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

export default HeaderBar;
