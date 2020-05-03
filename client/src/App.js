import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './store';

import './App.css';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';

import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';
import Routes from './components/routing/Routes';

const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Switch>
          <Route exact path='/' component={Landing} />
          <Route component={Routes} />
        </Switch>
      </Router>
    </Provider>
  );
};

export default App;
