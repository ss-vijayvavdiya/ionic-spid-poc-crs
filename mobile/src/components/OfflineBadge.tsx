/**
 * Offline badge for header when network unavailable.
 */
import React from 'react';
import { IonBadge } from '@ionic/react';
import { useTranslation } from 'react-i18next';

interface OfflineBadgeProps {
  isOffline: boolean;
  pendingCount?: number;
}

const OfflineBadge: React.FC<OfflineBadgeProps> = ({ isOffline, pendingCount = 0 }) => {
  const { t } = useTranslation();

  if (!isOffline && pendingCount === 0) return null;

  if (isOffline) {
    return (
      <IonBadge color="warning" style={{ marginRight: 8 }}>
        {t('common.offline')}
      </IonBadge>
    );
  }

  if (pendingCount > 0) {
    return (
      <IonBadge color="medium" style={{ marginRight: 8 }}>
        {t('common.pendingSync', { count: pendingCount })}
      </IonBadge>
    );
  }

  return null;
};

export default OfflineBadge;
