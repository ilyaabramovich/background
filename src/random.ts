import { uniformInt } from "pure-rand/distribution/uniformInt";
import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";

export type RandomInt = (max: number) => number;

export const defaultRandomInt: RandomInt = (max) => Math.floor(Math.random() * (max + 1));

function scramble(value: number) {
  let hash = value | 0;

  hash = Math.imul(hash ^ (hash >>> 16), 0x21f0aaad);
  hash = Math.imul(hash ^ (hash >>> 15), 0x735a2d97);

  return (hash ^ (hash >>> 15)) >>> 0;
}

export function createRandomInt(seed = Math.floor(Math.random() * 0x100000000)): RandomInt {
  const generator = xoroshiro128plus(scramble(seed));

  return (max) => uniformInt(generator, 0, max);
}
