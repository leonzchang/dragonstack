import React, { Component } from 'react'
import { connect,ConnectedProps } from 'react-redux'
import { logout } from '../actions/account'
import { fectchAccountDragons } from '../actions/accountDragons' 
import Generation from './Generation'
import Dragon from './Dragon'
import AccountInfo from './AccountInfo'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'



class Home extends Component<PropsFromRedux>{
    componentDidMount(){
        this.props.fectchAccountDragons()  //update account dragons redux state and also clean previous state
    }
    render(){
        return (
            <div>
                <Button className='logout-button' onClick={this.props.logout}>Log Out</Button>
                <h2>Dragon Stack</h2>
                <Generation />
                <Dragon />
                <hr />
                <AccountInfo />
                <hr />
                <Link to='/account-dragons'>Account Dragons</Link>
                <br />
                <Link to='/public-dragons'>Public Dragons</Link>
            </div>
        )
    }
}

const componetConnector = connect(null, { logout, fectchAccountDragons })

type PropsFromRedux = ConnectedProps<typeof componetConnector>

export default componetConnector(Home)