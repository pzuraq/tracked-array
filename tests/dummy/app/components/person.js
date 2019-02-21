import Component from '@ember/component';
import TrackedArray from 'tracked-array';

export default class Person extends Component {
  friends = new TrackedArray();

  get friendNames() {
    return this.friends.map(f => f.name).join();
  }

  addFriend() {
    this.friends.push({
      name: 'Liz',
    });
  }
}
