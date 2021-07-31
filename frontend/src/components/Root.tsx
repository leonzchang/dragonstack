import React, { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import Home from './Home'
import AuthForm from './AuthForm'
import { RootState } from '..'


class Root extends Component<PropsFromRedux>{
    render(){
        return (
            this.props.account.loggedIn ? <Home /> : <AuthForm />
        )
    }
}

const mapStateToProps = (state:RootState) =>{
    const account = state.account
    
    return {account}
}

const componetConnector = connect(mapStateToProps)  //no mapDispatchToProps

type PropsFromRedux = ConnectedProps<typeof componetConnector>

export default componetConnector(Root)