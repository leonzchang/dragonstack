import React, { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { fectchAccountDragons } from '../actions/accountDragons' 
import AccountDragonRow from './AccountDragonRow'
import { RootState } from '../index'
import { Link } from 'react-router-dom'



class AccountDragons extends Component<PropsFromRedux>{
    componentDidMount(){
        this.props.fectchAccountDragons() //update when get a new dragon
    }

    render(){
        return(
            <div>
                <h3>Account Dragons </h3>
                <Link to='/'>Home</Link>
                {
                    this.props.accountDragons.dragons?.map(dragon => {
                        return (
                            <div key={dragon.dragonId}>
                                <AccountDragonRow dragon={ dragon }/>
                                <hr />
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}


const mapStateToProps = (state:RootState) =>{
    const accountDragons = state.accountDragons
    
    return {accountDragons}
}

const componetConnector = connect(mapStateToProps , { fectchAccountDragons })
type PropsFromRedux = ConnectedProps<typeof componetConnector>

export default componetConnector(AccountDragons)