const FALLBACK_SEED = 0x6d2b79f5;

const normalize = seed => (Number(seed) >>> 0) || FALLBACK_SEED;

export function createRng(seed) {
  let state = normalize(seed);

  return {
    next() {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      return state / 0x100000000;
    },

    int(min, max) {
      return min + Math.floor(this.next() * (max - min + 1));
    },

    pick(items) {
      if (!items.length) throw new RangeError('pick requires items');
      return items[this.int(0, items.length - 1)];
    },

    snapshot() {
      return { algorithm: 'xorshift32', state };
    }
  };
}

export const restoreRng = snapshot => createRng(snapshot.state);
