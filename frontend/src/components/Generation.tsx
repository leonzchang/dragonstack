import React, {Component} from 'react'

const DEFAULT_GENERATION = {generationId:'',exipration:''}

const MINIMUN_DELAY = 3000

export default class Generaion extends Component{

    state = {generation : DEFAULT_GENERATION}
    timer !:  NodeJS.Timeout

    componentDidMount(){
        this.fetchNextGeneration()
    }

    componentWillUnmount(){
        clearTimeout(this.timer)
    }

    fetchGeneration = () => {
        fetch('http://localhost:3000/generation')
        .then(response => response.json())
        .then(json =>{
            this.setState({generation: json.generation})
        })
        .catch(error => console.error('error',error))
    }

    fetchNextGeneration = () =>{
        this.fetchGeneration()

        let delay = new Date(this.state.generation.exipration).getTime() - new Date().getTime()

        if (delay < MINIMUN_DELAY) {
            delay = MINIMUN_DELAY
        }

        this.timer = setTimeout(() => this.fetchNextGeneration , delay)
    }

    render(){
        const { generation } = this .state

        return(
            <div>
                <h3>Generation {generation.generationId}. Expires on:</h3>
                <h4>{new Date(generation.exipration).toString()}</h4>
            </div>
        )
}


}