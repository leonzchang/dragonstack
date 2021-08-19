import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import { RootState } from '../index';
import { fectchAccountDragons } from '../reducers/accountDragonsSlice';
import { fectchPublicDragons } from '../reducers/publicDragonsSlice';
import Header from './Header';
import PublicDragonRow from './PublicDragonRow';

class PublicDragons extends Component<PropsFromRedux> {
  componentDidMount() {
    this.props.fectchPublicDragons();
    this.props.fectchAccountDragons();
  }

  render() {
    if (!this.props.account.loggedIn) {
      return <Redirect to={{ pathname: '/' }} />;
    }

    return (
      <div>
        <Header />
        <h3>Public Dragons</h3>
        <Link to="/">Home</Link>
        {this.props.publicDragons.dragons?.map((dragon) => {
          return (
            <div key={dragon.dragonId}>
              <PublicDragonRow dragon={dragon} />
              <hr />
            </div>
          );
        })}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const { publicDragons, account } = state;

  return { publicDragons, account };
};

const componetConnector = connect(mapStateToProps, { fectchPublicDragons, fectchAccountDragons });

type PropsFromRedux = ConnectedProps<typeof componetConnector>;

export default componetConnector(PublicDragons);
