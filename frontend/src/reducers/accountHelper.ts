import { BACKEND } from '../config';

interface fectchFromAccountType {
  endpoint: string;
  options: RequestInit;
}

interface traitsType {
  traitType: string;
  traitValue: string;
}

interface dragonType {
  dragonId: number;
  generationId: number;
  birthdate: Date;
  nickname: string;
  isPublic: boolean;
  saleValue: number;
  sireValue: number;
  traits: traitsType[];
}

interface fectchFromAccountJson {
  type: string;
  message: string;
  info: {
    balance: number;
    username: string;
  };
  dragons: dragonType[];
  authenticated: boolean;
}

const fectchFromAccount = async ({ endpoint, options }: fectchFromAccountType) => {
  const response = await fetch(`${BACKEND.ADDRESS}/account/${endpoint}`, options);
  const json: fectchFromAccountJson = await response.json();
  return json;
};

export default fectchFromAccount;
