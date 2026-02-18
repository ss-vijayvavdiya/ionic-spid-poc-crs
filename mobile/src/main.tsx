import React from 'react';
import ReactDOM from 'react-dom/client';
import { addIcons } from 'ionicons';
import {
  cafeOutline,
  nutritionOutline,
  restaurantOutline,
  iceCreamOutline,
  pizzaOutline,
  eggOutline,
  cubeOutline,
  receiptOutline,
  refreshOutline,
  createOutline,
  eyeOffOutline,
  shareOutline,
  repeatOutline,
} from 'ionicons/icons';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

addIcons({
  cafeOutline,
  nutritionOutline,
  restaurantOutline,
  iceCreamOutline,
  pizzaOutline,
  eggOutline,
  cubeOutline,
  receiptOutline,
  refreshOutline,
  createOutline,
  eyeOffOutline,
  shareOutline,
  repeatOutline,
});
import '@ionic/react/css/core.css';
import './theme/variables.css';
import './theme/design-tokens.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

setupIonicReact();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <IonApp>
        <IonReactRouter>
          <App />
        </IonReactRouter>
      </IonApp>
    </ErrorBoundary>
  </React.StrictMode>
);
