import { atom } from 'recoil';

export const exampleAtom = atom<number>({
  key: 'exampleAtom',
  default: 0,
});
