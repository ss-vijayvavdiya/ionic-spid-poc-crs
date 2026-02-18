/**
 * Skeleton placeholder for loading states.
 */
import React from 'react';
import { IonCard, IonCardHeader, IonCardContent } from '@ionic/react';

interface SkeletonCardProps {
  variant?: 'product' | 'receipt' | 'product-grid';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'product' }) => {
  const baseClass = 'skeleton-pulse';
  if (variant === 'product-grid') {
    return (
      <IonCard className="product-card">
        <IonCardContent className="ion-text-center">
          <div className={`${baseClass}`} style={{ width: 48, height: 48, borderRadius: 8, margin: '0 auto 8px' }} />
          <div className={`${baseClass}`} style={{ height: 16, width: '80%', margin: '0 auto 4px' }} />
          <div className={`${baseClass}`} style={{ height: 12, width: '50%', margin: '0 auto' }} />
        </IonCardContent>
      </IonCard>
    );
  }
  if (variant === 'receipt') {
    return (
      <IonCard className="receipt-card">
        <IonCardContent>
          <div className={`${baseClass}`} style={{ height: 18, width: '40%', marginBottom: 8 }} />
          <div className={`${baseClass}`} style={{ height: 14, width: '60%' }} />
        </IonCardContent>
      </IonCard>
    );
  }
  return (
    <IonCard className="product-card">
      <IonCardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className={`${baseClass}`} style={{ width: 72, height: 72, borderRadius: 8, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className={`${baseClass}`} style={{ height: 20, width: '70%', marginBottom: 6 }} />
            <div className={`${baseClass}`} style={{ height: 14, width: '40%' }} />
          </div>
        </div>
      </IonCardHeader>
      <IonCardContent>
        <div className={`${baseClass}`} style={{ height: 16, width: '30%', marginBottom: 4 }} />
        <div className={`${baseClass}`} style={{ height: 12, width: '50%' }} />
      </IonCardContent>
    </IonCard>
  );
};

export default SkeletonCard;
