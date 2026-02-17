/**
 * Reusable empty state with CTA.
 */
import React from 'react';
import { IonCard, IonCardContent, IonButton } from '@ionic/react';

interface EmptyStateProps {
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, ctaLabel, onCta, children }) => (
  <IonCard className="empty-state">
    <IonCardContent className="ion-text-center ion-padding">
      <p className="text-body" style={{ margin: 0, color: 'var(--ion-color-medium)' }}>{message}</p>
      {ctaLabel && onCta && (
        <IonButton size="small" fill="solid" onClick={onCta} className="ion-margin-top">
          {ctaLabel}
        </IonButton>
      )}
      {children}
    </IonCardContent>
  </IonCard>
);

export default EmptyState;
