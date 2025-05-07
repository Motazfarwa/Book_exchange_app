import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { authService } from '../services/api';

// Route that redirects to login if user is not authenticated
export const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      authService.isLoggedIn() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/login",
            state: { from: props.location }
          }}
        />
      )
    }
  />
);

// Route that redirects to homepage if user is already authenticated
export const PublicRoute = ({ component: Component, restricted, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      authService.isLoggedIn() && restricted ? (
        <Redirect to="/" />
      ) : (
        <Component {...props} />
      )
    }
  />
);

// Middleware to extract user from token
export const getCurrentUser = () => {
  return authService.getCurrentUser();
};
