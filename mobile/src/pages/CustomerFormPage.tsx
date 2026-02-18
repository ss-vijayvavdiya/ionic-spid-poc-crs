/**
 * Add or edit customer.
 */
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
import { getCustomer, createCustomer, updateCustomer } from '../api/customers';

const CustomerFormPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const { merchantId } = useMerchant();
  const isEdit = id && id !== 'new';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!merchantId || !isEdit) {
      setLoading(false);
      return;
    }
    getCustomer(id!, merchantId)
      .then((c) => {
        setName(c.name);
        setEmail(c.email ?? '');
        setPhone(c.phone ?? '');
      })
      .catch(() => setToast(t('common.error')))
      .finally(() => setLoading(false));
  }, [id, merchantId, isEdit, t]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t('customers.nameRequired');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = t('customers.emailInvalid');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!merchantId || !validate()) return;
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await updateCustomer(id!, merchantId, {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        });
      } else {
        await createCustomer(merchantId, {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        });
      }
      setToast(t('common.saved'));
      setTimeout(() => history.replace('/customers'), 800);
    } catch (err) {
      setToast(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (!merchantId) {
    return (
      <IonPage>
        <HeaderBar title={t('customers.addCustomer')} />
        <IonContent className="ion-padding">
          <p>{t('merchant.select')}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <HeaderBar title={isEdit ? t('customers.editCustomer') : t('customers.addCustomer')} />
      <IonContent className="ion-padding">
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
            <p>{t('common.loading')}</p>
          </div>
        ) : (
          <>
            <IonItem>
              <IonLabel position="stacked">{t('customers.name')} *</IonLabel>
              <IonInput
                type="text"
                value={name}
                onIonInput={(e) => setName(e.detail.value ?? '')}
                placeholder={t('customers.name')}
              />
              {errors.name && (
                <p style={{ color: 'var(--ion-color-danger)', fontSize: '0.85em', margin: '0.25rem 0 0' }}>{errors.name}</p>
              )}
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('customers.email')}</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value ?? '')}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p style={{ color: 'var(--ion-color-danger)', fontSize: '0.85em', margin: '0.25rem 0 0' }}>{errors.email}</p>
              )}
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">{t('customers.phone')}</IonLabel>
              <IonInput
                type="tel"
                value={phone}
                onIonInput={(e) => setPhone(e.detail.value ?? '')}
                placeholder="+39 333 1234567"
              />
            </IonItem>
            <IonButton expand="block" onClick={handleSave} disabled={saving} className="ion-margin-top">
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

export default CustomerFormPage;
