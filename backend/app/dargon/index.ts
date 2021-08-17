import TRAITS from '../../data/traits.json';

interface traitsType {
  traitType: string;
  traitValue: string;
}

interface dragonInfo {
  dragonId?: number;
  birthdate?: Date;
  nickname?: string;
  traits?: traitsType[];
  generationId?: number;
  isPublic?: boolean;
  saleValue?: number;
  sireValue?: number;
}

const DEFAULT_PROPERTIES = {
  dragonId: undefined,
  nickname: 'unnamed',
  generationId: undefined,
  isPublic: false,
  saleValue: 0,
  sireValue: 0,
  get birthdate() {
    return new Date();
  },
  get randomTraits() {
    const traits: traitsType[] = [];

    TRAITS.forEach((TRAIT) => {
      const traitType = TRAIT.type;
      const traitValues = TRAIT.values;

      const traitValue = traitValues[Math.floor(Math.random() * traitValues.length)];

      traits.push({ traitType, traitValue });
    });

    return traits;
  },
};

export default class Dragon {
  dragonId?: number;
  birthdate: Date;
  nickname: string;
  traits: traitsType[];
  generationId?: number;
  isPublic: boolean;
  saleValue: number;
  sireValue: number;
  constructor({
    dragonId,
    birthdate,
    nickname,
    traits,
    generationId,
    isPublic,
    saleValue,
    sireValue,
  }: dragonInfo = {}) {
    this.dragonId = dragonId || DEFAULT_PROPERTIES.dragonId;
    this.birthdate = birthdate || DEFAULT_PROPERTIES.birthdate;
    this.nickname = nickname || DEFAULT_PROPERTIES.nickname;
    this.traits = traits || DEFAULT_PROPERTIES.randomTraits;
    this.generationId = generationId || DEFAULT_PROPERTIES.generationId;
    this.isPublic = isPublic || DEFAULT_PROPERTIES.isPublic;
    this.saleValue = saleValue || DEFAULT_PROPERTIES.saleValue;
    this.sireValue = sireValue || DEFAULT_PROPERTIES.sireValue;
  }
}
