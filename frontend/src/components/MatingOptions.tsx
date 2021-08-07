import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '../index'
import history from '../history'
import { BACKEND } from '../config'


class MatingOptions extends Component<PropsFromRedux>{
    mate = ({matronDragonId,patronDragonId}:{matronDragonId:number,patronDragonId:number}) => () => {
        fetch(`${BACKEND.ADDRESS}/dragon/mate`,{
            method:'POST',
            credentials:'include',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({matronDragonId, patronDragonId})
        })
        .then(reponse => reponse.json())
        .then(json =>{
            alert(json.message)

            if(json.type !== 'error'){
                history.push('/account-dragons')
            }
        })
        .catch(error => alert(error.message))
    }

    render(){
        return(
            <div>
                <h4>Pick one of your dragons to mate with: </h4>
                {
                    this.props.accountDragons.dragons?.map(dragon =>{
                        const {dragonId, generationId, nickname} = dragon

                        return (
                            <span key={dragonId}>
                                <Button 
                                    onClick={this.mate({
                                        patronDragonId: this.props.patronDragonId,
                                        matronDragonId: dragonId
                                    })}
                                >
                                    G{generationId}.I{dragonId}. {nickname}
                                </Button>
                                {' '}
                            </span>
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

const componetConnector = connect(mapStateToProps)



type PropsFromRedux = ConnectedProps<typeof componetConnector> & { patronDragonId: number }

export default componetConnector(MatingOptions)
