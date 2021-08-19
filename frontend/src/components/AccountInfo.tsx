import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../index';
import { fectchAccountInfo } from '../reducers/accountInfoSlice';

class AccountInfo extends Component<PropsFromRedux> {
  componentDidMount() {
    this.props.fectchAccountInfo();
  }

  render() {
    return (
      <div className="account-info">
        <span>Username: {this.props.accountInfo.username}</span>
        <span>Balance: {this.props.accountInfo.balance}</span>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const accountInfo = state.accountInfo;

  return { accountInfo };
};

const componetConnector = connect(mapStateToProps, { fectchAccountInfo });
type PropsFromRedux = ConnectedProps<typeof componetConnector>;

export default componetConnector(AccountInfo);
