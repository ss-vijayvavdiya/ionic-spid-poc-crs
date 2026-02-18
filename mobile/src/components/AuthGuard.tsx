/**
 * Protects routes that require authentication.
 * Redirects to /login when no token is present.
 */
import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps extends Omit<RouteProps, 'component'> {
  component: React.ComponentType<any>;
}

/** Route that requires auth; redirects to /login when unauthenticated. */
export function PrivateRoute({ component: Component, ...rest }: PrivateRouteProps) {
  const { token } = useAuth();
  return (
    <Route
      {...rest}
      render={(props) => (token ? <Component {...props} /> : <Redirect to="/login" />)}
    />
  );
}

/** Login route: redirects to /checkout when already authenticated. */
export function PublicLoginRoute({ component: Component, ...rest }: PrivateRouteProps) {
  const { token } = useAuth();
  return (
    <Route
      {...rest}
      render={(props) => (token ? <Redirect to="/checkout" /> : <Component {...props} />)}
    />
  );
}
