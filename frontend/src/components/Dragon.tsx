import React, {Component} from 'react'
import { connect } from 'react-redux'
import { fetchDragon } from '../actions/dragon'
import DragonAvatar from './DragonAvatar'
import { RootState } from '..'
import { Button } from 'react-bootstrap'


class Dragon extends Component<propsType>{
   
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

    return {dragon,fetchDragon}
}

type propsType = ReturnType<typeof mapStateToProps>

const componetConnector = connect(mapStateToProps , {fetchDragon})

export default componetConnector(Dragon)