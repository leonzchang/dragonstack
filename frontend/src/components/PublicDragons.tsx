import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import { RootState } from '../index';
import { fectchAccountDragons } from '../reducers/accountDragonsSlice';
import { fectchPublicDragons } from '../reducers/publicDragonsSlice';
import Header from './Header';
import PublicDragonRow from './PublicDragonRow';

const PublicDragons = () => {
  const account = useSelector((store: RootState) => store.account);
  const publicDragons = useSelector((store: RootState) => store.publicDragons);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fectchPublicDragons());
    dispatch(fectchAccountDragons());
  }, []);

  if (!account.loggedIn) {
    return <Redirect to={{ pathname: '/' }} />;
  }

  return (
    <div>
      <Header />
      <h3>Public Dragons</h3>
      <Link to="/">Home</Link>
      {publicDragons.dragons?.map((dragon) => {
        return (
          <div key={dragon.dragonId}>
            <PublicDragonRow dragon={dragon} />
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default PublicDragons;
