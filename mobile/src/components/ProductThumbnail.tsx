/**
 * Product image placeholder with category-based icon.
 * Shows icon when no image URL; ready for future image support.
 */
import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  cafeOutline,
  nutritionOutline,
  restaurantOutline,
  iceCreamOutline,
  pizzaOutline,
  eggOutline,
  cubeOutline,
} from 'ionicons/icons';

const CATEGORY_ICONS: Record<string, typeof cubeOutline> = {
  Beverages: cafeOutline,
  Pastries: nutritionOutline,
  Food: restaurantOutline,
  Desserts: iceCreamOutline,
  Main: pizzaOutline,
  Starters: eggOutline,
  default: cubeOutline,
};

interface ProductThumbnailProps {
  category?: string;
  imageUrl?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 48, md: 72, lg: 96 };

const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  category,
  imageUrl,
  name,
  size = 'md',
}) => {
  const px = sizes[size];
  const icon = category ? (CATEGORY_ICONS[category] ?? CATEGORY_ICONS.default) : CATEGORY_ICONS.default;

  if (imageUrl) {
    return (
      <div
        style={{
          width: px,
          height: px,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--ion-color-light)',
          flexShrink: 0,
        }}
      >
        <img src={imageUrl} alt={name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: px,
        height: px,
        borderRadius: 8,
        background: 'var(--ion-color-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <IonIcon icon={icon} style={{ fontSize: px * 0.45, color: 'var(--ion-color-medium)' }} />
    </div>
  );
};

export default ProductThumbnail;
