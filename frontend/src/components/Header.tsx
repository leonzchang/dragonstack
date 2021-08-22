import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { logout } from '../reducers/accountSlice';
import AccountInfo from './AccountInfo';

const Header = () => {
  const dispatch = useDispatch();

  return (
    <div className="header">
      <AccountInfo />
      <Button className="logout-button" onClick={() => dispatch(logout())}>
        Log Out
      </Button>
    </div>
  );
};

export default Header;
