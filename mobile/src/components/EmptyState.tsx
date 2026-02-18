/**
 * Reusable empty state with CTA.
 */
import React from 'react';
import { IonCard, IonCardContent, IonButton, IonSpinner } from '@ionic/react';

interface EmptyStateProps {
  message: string;
  ctaLabel?: string;
  onCta?: () => void;
  ctaLoading?: boolean;
  secondaryCtaLabel?: string;
  onSecondaryCta?: () => void;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  ctaLabel,
  onCta,
  ctaLoading,
  secondaryCtaLabel,
  onSecondaryCta,
  children,
}) => (
  <IonCard className="empty-state" style={{ borderLeft: '4px solid var(--ion-color-primary)' }}>
    <IonCardContent className="ion-text-center ion-padding">
      <p className="text-body" style={{ margin: 0, color: 'var(--ion-color-medium)', lineHeight: 1.5 }}>{message}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        {ctaLabel && onCta && (
          <IonButton size="small" fill="solid" onClick={onCta} disabled={ctaLoading}>
            {ctaLoading ? <IonSpinner name="crescent" /> : ctaLabel}
          </IonButton>
        )}
        {secondaryCtaLabel && onSecondaryCta && (
          <IonButton size="small" fill="outline" onClick={onSecondaryCta} disabled={ctaLoading}>
            {secondaryCtaLabel}
          </IonButton>
        )}
      </div>
      {children}
    </IonCardContent>
  </IonCard>
);

export default EmptyState;
