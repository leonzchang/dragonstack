import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import { fectchAccountDragons } from '../actions/accountDragons';
import { RootState } from '../index';
import AccountDragonRow from './AccountDragonRow';
import Header from './Header';

class AccountDragons extends Component<PropsFromRedux> {
  componentDidMount() {
    this.props.fectchAccountDragons(); //update when get a new dragon
  }

  render() {
    if (!this.props.account.loggedIn) {
      return <Redirect to={{ pathname: '/' }} />;
    }

    return (
      <div>
        <Header />
        <h3>Account Dragons </h3>
        <Link to="/">Home</Link>
        {this.props.accountDragons.dragons?.map((dragon) => {
          return (
            <div key={dragon.dragonId}>
              <AccountDragonRow dragon={dragon} />
              <hr />
            </div>
          );
        })}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const { accountDragons, account } = state;

  return { accountDragons, account };
};

const componetConnector = connect(mapStateToProps, { fectchAccountDragons });
type PropsFromRedux = ConnectedProps<typeof componetConnector>;

export default componetConnector(AccountDragons);
