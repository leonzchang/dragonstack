import React, {Component} from 'react'
import {connect} from 'react-redux'
import { fetchGeneration } from '../actions/generation'
import { RootState } from '..'
import fetchSate from '../reducers/fetchSate'


const MINIMUN_DELAY = 3000

class Generaion extends Component<propsType>{
    timer !:  NodeJS.Timeout

    componentDidMount(){
        this.fetchNextGeneration()
    }

    componentWillUnmount(){
        clearTimeout(this.timer)
    }
    
    fetchNextGeneration = () =>{
        this.props.fetchGeneration()

        let delay =   new Date(this.props.generation.expiration).getTime() - new Date().getTime()
      
        if (delay < MINIMUN_DELAY) {
            delay = MINIMUN_DELAY
        }

        this.timer = setTimeout(() => this.fetchNextGeneration() , delay)
    }

    render(){
        console.log('this.props ',this.props)
     
        const { generation } = this.props

        if (generation.status === fetchSate.fetching){
            return <div>...</div>
        }

        if (generation.status === fetchSate.error){
            return <div>{generation.message}</div>
        }

        return(
            <div>
                <h3>Generation {generation.generationId}. Expires on:</h3>
                <h4>{new Date(generation.expiration).toString()}</h4>
            </div>
        )
}


} 


const mapStateToProps = (state:RootState) =>{
    const generation = state.generation
    
    return {generation,fetchGeneration}
}


type propsType = ReturnType<typeof mapStateToProps>

const componetConnector = connect(mapStateToProps , {fetchGeneration})

export default  componetConnector(Generaion) 


