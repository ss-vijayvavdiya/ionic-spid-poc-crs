import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import { useMerchant } from '../contexts/MerchantContext';
import { getProduct, createProduct, updateProduct } from '../api/products';

const ProductFormPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { merchantId } = useMerchant();
  const isEdit = id && id !== 'new';

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [vatRate, setVatRate] = useState('22');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!merchantId || !isEdit) {
      setLoading(false);
      return;
    }
    getProduct(id!, merchantId)
      .then((p) => {
        setName(p.name);
        setPrice((p.priceCents / 100).toFixed(2));
        setVatRate(String(p.vatRate));
        setCategory(p.category ?? '');
        setSku(p.sku ?? '');
      })
      .catch(() => setToast(t('common.error')))
      .finally(() => setLoading(false));
  }, [id, merchantId, isEdit, t]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t('products.nameRequired');
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) e.price = t('products.priceRequired');
    const vatNum = parseInt(vatRate, 10);
    if (isNaN(vatNum) || vatNum < 0 || vatNum > 100) e.vatRate = t('products.vatRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!merchantId || !validate()) return;
    setSaving(true);
    setErrors({});
    try {
      const priceCents = Math.round(parseFloat(price) * 100);
      const vatRateNum = parseInt(vatRate, 10);
      if (isEdit) {
        await updateProduct(id!, merchantId, {
          name: name.trim(),
          priceCents,
          vatRate: vatRateNum,
          category: category.trim() || undefined,
          sku: sku.trim() || undefined,
        });
        setToast(t('common.saved'));
      } else {
        await createProduct(merchantId, {
          name: name.trim(),
          priceCents,
          vatRate: vatRateNum,
          category: category.trim() || undefined,
          sku: sku.trim() || undefined,
        });
        setToast(t('common.saved'));
      }
      setTimeout(() => history.replace('/products'), 800);
    } catch (err) {
      setToast(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (!merchantId) {
    return (
      <IonPage>
        <HeaderBar title={t('products.addProduct')} />
        <IonContent className="ion-padding">
          <p>{t('merchant.select')}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <HeaderBar title={isEdit ? t('products.editProduct') : t('products.addProduct')} />
      <IonContent className="ion-padding">
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
            <p>{t('common.loading')}</p>
          </div>
        ) : (
          <>
            <IonItem>
              <IonLabel position="stacked">{t('products.name')} *</IonLabel>
              <IonInput
                type="text"
                value={name}
                onIonInput={(e) => setName(e.detail.value ?? '')}
                placeholder={t('products.name')}
              />
              {errors.name && <p style={{ color: 'var(--ion-color-danger)', fontSize: '0.85em', margin: '0.25rem 0 0' }}>{errors.name}</p>}
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('products.price')} *</IonLabel>
              <IonInput
                type="number"
                value={price}
                onIonInput={(e) => setPrice(e.detail.value ?? '')}
                placeholder="0.00"
              />
              {errors.price && <p style={{ color: 'var(--ion-color-danger)', fontSize: '0.85em', margin: '0.25rem 0 0' }}>{errors.price}</p>}
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('products.vatRate')} *</IonLabel>
              <IonInput
                type="number"
                value={vatRate}
                onIonInput={(e) => setVatRate(e.detail.value ?? '')}
                placeholder="22"
              />
              {errors.vatRate && <p style={{ color: 'var(--ion-color-danger)', fontSize: '0.85em', margin: '0.25rem 0 0' }}>{errors.vatRate}</p>}
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('products.category')}</IonLabel>
              <IonInput
                type="text"
                value={category}
                onIonInput={(e) => setCategory(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('products.sku')}</IonLabel>
              <IonInput
                type="text"
                value={sku}
                onIonInput={(e) => setSku(e.detail.value ?? '')}
              />
            </IonItem>
            <IonButton expand="block" onClick={handleSave} disabled={saving}>
              {saving ? <IonSpinner name="crescent" /> : t('common.save')}
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={() => history.goBack()} disabled={saving}>
              {t('common.cancel')}
            </IonButton>
          </>
        )}
        <IonToast isOpen={!!toast} message={toast} onDidDismiss={() => setToast('')} duration={2000} />
      </IonContent>
    </IonPage>
  );
};

export default ProductFormPage;
