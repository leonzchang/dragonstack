import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../index';
import AuthForm from './AuthForm';
import Home from './Home';

const Root = () => {
  const account = useSelector((store: RootState) => store.account);

  return account.loggedIn ? <Home /> : <AuthForm />;
};

export default Root;
