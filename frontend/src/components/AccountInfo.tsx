import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../index';
import { fectchAccountInfo } from '../reducers/accountInfoSlice';

const AccountInfo = () => {
  const accountInfo = useSelector((store: RootState) => store.accountInfo);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fectchAccountInfo());
  }, []);

  return (
    <div className="account-info">
      <span>Username: {accountInfo.username}</span>
      <span>Balance: {accountInfo.balance}</span>
    </div>
  );
};

export default AccountInfo;
