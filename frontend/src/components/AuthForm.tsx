import React, { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { Button, FormGroup, FormControl } from 'react-bootstrap'
import { signup, login } from '../actions/account'
import fetchState from '../reducers/fetchState'
import { RootState } from '..'




class AuthForm extends Component<PropsFromRedux>{
    state = { username:'', password:'', buttonClicked:false }

    updateUsername = (event:React.ChangeEvent<HTMLInputElement>) =>{
        this.setState({username:  event.target.value})
    }

    updatePassword = (event:React.ChangeEvent<HTMLInputElement>) =>{
        this.setState({password:  event.target.value})
    }

    signup = () =>{
        this.setState({buttonClicked:true})

        const { username, password } = this.state

        this.props.signup( { username, password })
    }

    login = () =>{
        this.setState({buttonClicked:true})

        const { username, password } = this.state
        
        this.props.login( { username, password })
    }

    get Error () {
        if (
            this.state.buttonClicked &&
            this.props.account.status === fetchState.error
            ){
            return <div>{this.props.account.message}</div>
        }
    }

    render(){
        return(
            <div>
                <h2>Dragon Stack</h2>
                <FormGroup>
                    <FormControl
                        type='text'
                        value={this.state.username}
                        placeholder='username'
                        onChange={this.updateUsername}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControl
                        type='password'
                        value={this.state.password}
                        placeholder='password'
                        onChange={this.updatePassword}
                    />
                </FormGroup>
                <div>
                    <Button onClick={this.login}>Log in</Button>
                    <span> or </span>
                    <Button onClick={this.signup}>Sign up</Button>
                </div>
                {this.Error}
            </div>
        )
    }
}

const mapStateToProps = (state:RootState) =>{
    const account = state.account
    
    return {account}
}

const componetConnector = connect(mapStateToProps , { signup, login })
type PropsFromRedux = ConnectedProps<typeof componetConnector>

export default componetConnector(AuthForm)