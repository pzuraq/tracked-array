import { get, notifyPropertyChange } from '@ember/object';
import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';
import { REQUIRE_LEGACY_BROWSER_SUPPORT } from 'tracked-array-flags';

const ACCESS_COUNT_KEY = '___ACCESS_COUNT_KEY___';
const ARRAY_KEY = '___ARRAY_KEY____';
const SUPPORTS_PROXY = typeof Proxy === 'function';

export default class TrackedArray extends Array {
  constructor() {
    super();

    if (DEBUG) {
      this[ACCESS_COUNT_KEY] = 0;
    }

    if (SUPPORTS_PROXY) {
      return new Proxy(this, {
        get(target, prop) {
          if (DEBUG && REQUIRE_LEGACY_BROWSER_SUPPORT) {
            assert(
              `You attempted to access this TrackedArray directly via: ${prop}. This works in modern browsers, but does _not_ work in older browsers like IE. If you want to access TrackedArrays like this, set  the \`requireLegacyBrowserSupport\` option for TrackedArrays to false. Otherwise, make sure you are using KVO compliant methods, such as \`get\` or \`getLength\`.`,

              // Note: We check both getter/setter methods here because setter
              // methods are _accessed_, not actually set.
              target[ACCESS_COUNT_KEY] > 0 || (isNaN(prop) && prop !== 'length')
            );
          } else {
            // entangle
            get(target, ARRAY_KEY);
          }

          return Reflect.get(...arguments);
        },

        set(target, prop) {
          if (DEBUG && REQUIRE_LEGACY_BROWSER_SUPPORT) {
            assert(
              `You attempted to set a value in this TrackedArray directly via: ${prop}. This works in modern browsers, but does _not_ work in older browsers like IE. If you want to set values in TrackedArrays like this, set  the \`requireLegacyBrowserSupport\` option for TrackedArrays to false. Otherwise, make sure you are using KVO compliant methods, such as \`set\`.`,
              target[ACCESS_COUNT_KEY] > 0 || (isNaN(prop) && prop !== 'length')
            );
          } else {
            // entangle
            get(target, ARRAY_KEY);
            // update
            notifyPropertyChange(target, ARRAY_KEY);
          }

          return Reflect.set(...arguments);
        },
      });
    }
  }

  get(i) {
    return this[i];
  }

  set(i) {
    this[i] = i;
  }

  getLength() {
    return this.length;
  }
}

if ((DEBUG && REQUIRE_LEGACY_BROWSER_SUPPORT) || !SUPPORTS_PROXY) {
  const ARRAY_GETTER_METHODS = [
    'concat',
    'entries',
    'every',
    'fill',
    'filter',
    'find',
    'findIndex',
    'flat',
    'flatMap',
    'forEach',
    'get',
    'getLength',
    'includes',
    'indexOf',
    'join',
    'keys',
    'lastIndexOf',
    'map',
    'reduce',
    'reduceRight',
    'reverse',
    'slice',
    'some',
    'values',
  ];

  const ARRAY_SETTER_METHODS = [
    'copyWithin',
    'pop',
    'push',
    'set',
    'shift',
    'sort',
    'splice',
    'unshift',
  ];

  for (let methodName of ARRAY_GETTER_METHODS) {
    let method =
      TrackedArray.prototype[methodName] || Array.prototype[methodName];

    TrackedArray.prototype[methodName] = function() {
      if (DEBUG) {
        this[ACCESS_COUNT_KEY]++;
      }

      // entangle
      get(this, ARRAY_KEY);

      let ret = method.apply(this, arguments);

      if (DEBUG) {
        this[ACCESS_COUNT_KEY]--;
      }

      return ret;
    };
  }

  for (let methodName of ARRAY_SETTER_METHODS) {
    let method =
      TrackedArray.prototype[methodName] || Array.prototype[methodName];

    TrackedArray.prototype[methodName] = function() {
      if (DEBUG) {
        this[ACCESS_COUNT_KEY]++;
      }

      get(this, ARRAY_KEY);
      notifyPropertyChange(this, ARRAY_KEY);

      let ret = method.apply(this, arguments);

      if (DEBUG) {
        this[ACCESS_COUNT_KEY]--;
      }

      return ret;
    };
  }
}
