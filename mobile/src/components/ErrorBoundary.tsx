/**
 * Error boundary for production. Catches React runtime errors and shows a friendly message.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/react';
import { refreshOutline } from 'ionicons/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <IonPage>
          <IonContent className="ion-padding ion-text-center">
            <div style={{ paddingTop: '3rem' }}>
              <h2>Something went wrong</h2>
              <p style={{ color: 'var(--ion-color-medium)', marginTop: '1rem' }}>
                {this.state.error.message}
              </p>
              <IonButton onClick={this.handleRetry} className="ion-margin-top">
                <IonIcon icon={refreshOutline} slot="start" />
                Try again
              </IonButton>
            </div>
          </IonContent>
        </IonPage>
      );
    }
    return this.props.children;
  }
}
