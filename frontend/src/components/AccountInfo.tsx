import React, { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { fectchAccountInfo } from '../actions/accountInfo'
import { RootState } from '../index'



class AccountInfo extends Component<PropsFromRedux>{
    componentDidMount(){
        this.props.fectchAccountInfo()
    }

    render(){
        return(
            <div>
                <h3>Account Info</h3>
                <div>Username: {this.props.accountInfo.username}</div>
                <div>Balance: {this.props.accountInfo.balance}</div>
            </div>
        )
    }

}

const mapStateToProps = (state:RootState) =>{
    const accountInfo = state.accountInfo
    
    return {accountInfo}
}

const componetConnector = connect(mapStateToProps , { fectchAccountInfo })
type PropsFromRedux = ConnectedProps<typeof componetConnector>

export default componetConnector(AccountInfo)