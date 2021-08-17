import React, { Component } from 'react';
import { Button, FormControl, FormGroup } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';

import { login, signup } from '../actions/account';
import { RootState } from '../index';
import fetchState from '../reducers/fetchState';

class AuthForm extends Component<PropsFromRedux> {
  state = { username: '', password: '', buttonClicked: false };

  updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ username: event.target.value });
  };

  updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ password: event.target.value });
  };

  signup = () => {
    this.setState({ buttonClicked: true });

    const { username, password } = this.state;

    this.props.signup({ username, password });
  };

  login = () => {
    this.setState({ buttonClicked: true });

    const { username, password } = this.state;

    this.props.login({ username, password });
  };

  get Error() {
    if (this.state.buttonClicked && this.props.account.status === fetchState.error) {
      return <div>{this.props.account.message}</div>;
    }
  }

  render() {
    return (
      <div>
        <h2>Dragon Stack</h2>
        <br />
        <FormGroup>
          <FormControl
            type="text"
            value={this.state.username}
            placeholder="username"
            onChange={this.updateUsername}
          />
        </FormGroup>
        <br />
        <FormGroup>
          <FormControl
            type="password"
            value={this.state.password}
            placeholder="password"
            onChange={this.updatePassword}
          />
        </FormGroup>
        <br />
        <div>
          <Button onClick={this.login}>Log in</Button>
          <span> or </span>
          <Button onClick={this.signup}>Sign up</Button>
        </div>
        {this.Error}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const account = state.account;

  return { account };
};

const componetConnector = connect(mapStateToProps, { signup, login });
type PropsFromRedux = ConnectedProps<typeof componetConnector>;

export default componetConnector(AuthForm);
