import { BACKEND } from '../config';

interface fectchFromAccountType {
  endpoint: string;
  options: RequestInit;
}

const fectchFromAccount = async ({ endpoint, options }: fectchFromAccountType) => {
  return await fetch(`${BACKEND.ADDRESS}/account/${endpoint}`, options).then((response) =>
    response.json()
  );
};

export default fectchFromAccount;
