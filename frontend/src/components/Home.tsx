import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { fectchAccountDragons } from '../reducers/accountDragonsSlice';
import Dragon from './Dragon';
import Generation from './Generation';
import Header from './Header';

const Home = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fectchAccountDragons()); //update account dragons redux state and also clean previous state
  }, []);

  return (
    <div>
      <Header />
      <h2>Dragon Stack</h2>
      <Generation />
      <Dragon />
      <hr />
      <Link to="/account-dragons">Account Dragons</Link>
      <br />
      <Link to="/public-dragons">Public Dragons</Link>
    </div>
  );
};

export default Home;
