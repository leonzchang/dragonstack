import React, { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { fetchDragon } from '../actions/dragon'
import DragonAvatar from './DragonAvatar'
import { RootState } from '..'
import { Button } from 'react-bootstrap'



class Dragon extends Component<PropsFromRedux>{
 
    render(){
        return(
            <div>
                <Button onClick={this.props.fetchDragon}>New Dragon</Button>
               <DragonAvatar dragon={this.props.dragon}/>
            </div>
        )
    }
}


const mapStateToProps = (state:RootState) =>{
    const dragon = state.dragon

    return {dragon}
}


const componetConnector = connect(mapStateToProps, { fetchDragon })

type PropsFromRedux = ConnectedProps<typeof componetConnector>

export default componetConnector(Dragon)