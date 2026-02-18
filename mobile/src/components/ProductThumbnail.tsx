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

  const accentColors: Record<string, string> = {
    Beverages: '#0d9488',
    Pastries: '#f59e0b',
    Food: '#f43f5e',
    Desserts: '#6366f1',
    Main: '#10b981',
    Starters: '#ec4899',
    default: '#64748b',
  };
  const accent = category ? (accentColors[category] ?? accentColors.default) : accentColors.default;

  if (imageUrl) {
    return (
      <div
        style={{
          width: px,
          height: px,
          borderRadius: 12,
          overflow: 'hidden',
          background: `${accent}18`,
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
        borderRadius: 12,
        background: `${accent}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      aria-hidden
    >
      <IonIcon icon={icon} style={{ fontSize: px * 0.45, color: accent }} />
    </div>
  );
};

export default ProductThumbnail;
