import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';

import { logout } from '../actions/account';
import AccountInfo from './AccountInfo';

class Header extends Component<PropsFromRedux> {
  render() {
    return (
      <div className="header">
        <AccountInfo />
        <Button className="logout-button" onClick={this.props.logout}>
          Log Out
        </Button>
      </div>
    );
  }
}

const componetConnector = connect(null, { logout });

type PropsFromRedux = ConnectedProps<typeof componetConnector>;

export default componetConnector(Header);
