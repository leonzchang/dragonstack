import React, {Component} from 'react'
import  {  skinny,  slender,  sporty,  stocky,  patchy, plain,  spotted,  striped} from '../assets/index'

interface traitsType {
    traitType: string
    traitValue: string
}

interface dragonProps{
    dragon:{
        dragonId:string,
        generationId:string,
        birthdate:string,
        traits :traitsType[]
    }
}




const propertyMap = {
    backgroundColor:{
        black:'#263238',
        white:'#cfd8dc',
        green:'#a5d6a7',
        blue:'#0277bd',
    },
    pattern:{plain,striped,spotted,patchy},
    build:{slender,stocky,sporty,skinny},
    size:{small:100,medium:140,large:180,enormous:220}
}

export default class DragonAvatar extends Component<dragonProps>{
    get DragonImage(){
        const dragonPropertyMap ={}

        this.props.dragon.traits.forEach(trait =>{
            const {traitType,traitValue} = trait

            dragonPropertyMap[traitType] = propertyMap[traitType][traitValue]
        })

        const {backgroundColor, pattern, build, size} = dragonPropertyMap
        const sizing = {width:size,height:size}

        return(
            <div className='dragon-avatar-image-wrapper'>
                <div className='dragon-avatar-image-backgrond' style={{backgroundColor , ...sizing}}></div>
                <img src={pattern} className='dragon-avatar-image-pattern' style={{ ...sizing}} />
                <img src={build} className='dragon-avatar-image' style={{ ...sizing}} />
            </div>
        )
    }

    render(){
        const {dragonId, generationId, traits} = this.props.dragon

        return(
            <div>
                <span>G{generationId}</span>
                <span>I{dragonId}</span>
                { traits.map(trait => trait.traitValue).join(', ') }
            </div>
        )
    }
}