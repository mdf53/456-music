/* eslint-disable no-extend-native */
const define = (name, value) => {
  if (Array.prototype[name]) {
    return;
  }

  Object.defineProperty(Array.prototype, name, {
    value,
    writable: true,
    configurable: true
  });
};

define("toReversed", function toReversed() {
  return this.slice().reverse();
});

define("toSorted", function toSorted(compareFn) {
  return this.slice().sort(compareFn);
});

define("toSpliced", function toSpliced(start, deleteCount, ...items) {
  const copy = this.slice();
  copy.splice(start, deleteCount, ...items);
  return copy;
});

define("with", function withPolyfill(index, value) {
  const copy = this.slice();
  const resolvedIndex = index < 0 ? copy.length + index : index;
  copy[resolvedIndex] = value;
  return copy;
});
