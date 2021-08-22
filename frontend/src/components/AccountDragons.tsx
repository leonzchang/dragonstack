import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import { RootState } from '../index';
import { fectchAccountDragons } from '../reducers/accountDragonsSlice';
import AccountDragonRow from './AccountDragonRow';
import Header from './Header';

const AccountDragons = () => {
  const account = useSelector((store: RootState) => store.account);
  const accountDragons = useSelector((store: RootState) => store.accountDragons);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fectchAccountDragons());
  }, []);

  if (!account.loggedIn) {
    return <Redirect to={{ pathname: '/' }} />;
  }
  return (
    <div>
      <Header />
      <h3>Account Dragons </h3>
      <Link to="/">Home</Link>
      {accountDragons.dragons?.map((dragon) => {
        return (
          <div key={dragon.dragonId}>
            <AccountDragonRow dragon={dragon} />
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default AccountDragons;
