import React from 'react';

import { patchy, plain, skinny, slender, sporty, spotted, stocky, striped } from '../assets/index';

interface traitsType {
  traitType: string;
  traitValue: string;
}

interface dragonProps {
  dragon: {
    dragonId?: number;
    generationId?: number;
    nickname?: string;
    birthdate?: Date;
    traits?: traitsType[];
  };
}

interface dragonPropertyMapType {
  [key: string]: number | string | undefined;
  backgroundColor?: string;
  pattern?: string;
  build?: string;
  size?: number;
}

interface propertyMapType {
  [key: string]: {
    [key: string]: string | number;
  };
}

const propertyMap: propertyMapType = {
  backgroundColor: {
    black: '#263238',
    white: '#cfd8dc',
    green: '#a5d6a7',
    blue: '#0277bd',
  },
  pattern: { plain, striped, spotted, patchy },
  build: { slender, stocky, sporty, skinny },
  size: { small: 100, medium: 140, large: 180, enormous: 220 },
};

const DragonAvatar = (props: dragonProps) => {
  const DragonImage = () => {
    const dragonPropertyMap: dragonPropertyMapType = {};

    props.dragon.traits?.forEach((trait) => {
      const { traitType, traitValue } = trait;

      dragonPropertyMap[traitType] = propertyMap[traitType][traitValue];
    });

    const { backgroundColor, pattern, build, size } = dragonPropertyMap;
    const sizing = { width: size, height: size };

    return (
      <div className="dragon-avatar-image-wrapper">
        <div className="dragon-avatar-image-background" style={{ backgroundColor, ...sizing }} />
        <img src={pattern} className="dragon-avatar-image-pattern" style={{ ...sizing }} />
        <img src={build} className="dragon-avatar-image" style={{ ...sizing }} />
      </div>
    );
  };

  const { dragonId, generationId, traits } = props.dragon;

  if (!dragonId) return <div />;

  return (
    <div>
      <span>G{generationId}</span>
      <span>I{dragonId}</span>
      {traits?.map((trait) => trait.traitValue).join(', ')}
      {DragonImage()}
    </div>
  );
};

export default DragonAvatar;
