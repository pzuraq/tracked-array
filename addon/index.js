import { get, notifyPropertyChange } from '@ember/object';

export default class TrackedArray extends Array {
  constructor() {
    super();

    return new Proxy(this, {
      get() {
        get(this, '[]');
      },

      set() {
        notifyPropertyChange(this, '[]');
      },
    });
  }
}
