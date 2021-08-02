import React, { Component } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { fectchPublicDragons } from '../actions/publicDragons'
import { fectchAccountDragons } from '../actions/accountDragons' 
import PublicDragonRow from './PublicDragonRow'
import { RootState } from '..'
import { Link } from 'react-router-dom'

class PublicDragons extends Component<PropsFromRedux>{
    componentDidMount(){
        this.props.fectchPublicDragons()
        this.props.fectchAccountDragons()
    }

    render(){
        return(
            <div>
                <h3>Public Dragons</h3>
                <Link to='/'>Home</Link>
                {
                    this.props.publicDragons.dragons?.map(dragon=>{
                        return(
                            <div key={dragon.dragonId}>
                                <PublicDragonRow dragon={dragon} />
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
    const publicDragons = state.publicDragons

    return {publicDragons}
}


const componetConnector = connect(mapStateToProps, { fectchPublicDragons, fectchAccountDragons })

type PropsFromRedux = ConnectedProps<typeof componetConnector>

export default componetConnector(PublicDragons)