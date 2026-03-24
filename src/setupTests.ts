// @ts-nocheck
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder
}

global.HawkQueryOptions = class {
  constructor(options) {
    this.options = options
  }
}

const root = document.createElement('div');
root.setAttribute('id', 'root');
root.setAttribute('data-theme', 'light');
document.body.appendChild(root);

HTMLElement.prototype.requestFullscreen = vi.fn().mockResolvedValue(undefined);
document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

const localStorageMock = (function () {
  let store = {};

  return {
    getItem(key) {
      return store[key];
    },

    setItem(key, value) {
      store[key] = value;
    },

    clear() {
      store = {};
    },

    removeItem(key) {
      delete store[key];
    },

    getAll() {
      return store;
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });
