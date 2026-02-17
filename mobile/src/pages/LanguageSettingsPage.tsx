import React from 'react';
import { IonContent, IonPage, IonList, IonRadioGroup, IonListHeader, IonItem, IonLabel, IonRadio } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, setStoredLanguage, getStoredLanguage, type SupportedLanguage } from '../i18n';

const LanguageSettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const current = getStoredLanguage();

  const handleChange = (lang: SupportedLanguage) => {
    setStoredLanguage(lang);
    i18n.changeLanguage(lang);
    history.goBack();
  };

  return (
    <IonPage>
      <HeaderBar title={t('language.title')} />
      <IonContent className="ion-padding">
        <IonList>
          <IonRadioGroup value={current} onIonChange={(e) => handleChange(e.detail.value as SupportedLanguage)}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <IonItem key={lang}>
                <IonLabel>{LANGUAGE_LABELS[lang]}</IonLabel>
                <IonRadio value={lang} />
              </IonItem>
            ))}
          </IonRadioGroup>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default LanguageSettingsPage;
