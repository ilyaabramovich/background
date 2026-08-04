import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";
import { uniformInt } from "pure-rand/distribution/uniformInt";

// Daily seeds are day numbers, so today and tomorrow differ by exactly one, and a generator
// started from two seeds that close can agree on its first few draws. This is the splitmix32
// finalizer, which scatters neighbouring integers across the whole 32-bit range before a single
// value is drawn.
function scramble(value) {
  let hash = value | 0;

  hash = Math.imul(hash ^ (hash >>> 16), 0x21f0aaad);
  hash = Math.imul(hash ^ (hash >>> 15), 0x735a2d97);

  return (hash ^ (hash >>> 15)) >>> 0;
}

// Returns a draw function rather than the generator itself: pure-rand's reproducible form hands
// back a fresh generator with every value, which would force every function that draws to return
// a tuple. Keeping the mutation inside this closure gets the same reproducibility for free.
export function createRandomInt(seed = Math.floor(Math.random() * 0x100000000)) {
  const generator = xoroshiro128plus(scramble(seed));

  return (max) => uniformInt(generator, 0, max);
}
