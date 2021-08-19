import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link } from 'react-router-dom';

import { fectchAccountDragons } from '../reducers/accountDragonsSlice';
import Dragon from './Dragon';
import Generation from './Generation';
import Header from './Header';

class Home extends Component<PropsFromRedux> {
  componentDidMount() {
    this.props.fectchAccountDragons(); //update account dragons redux state and also clean previous state
  }
  render() {
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
  }
}

const componetConnector = connect(null, { fectchAccountDragons });

type PropsFromRedux = ConnectedProps<typeof componetConnector>;

export default componetConnector(Home);
