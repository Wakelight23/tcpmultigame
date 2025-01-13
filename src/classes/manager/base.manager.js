// 여러가지 매니저가 생성될 수 있는 일종의 Form
class BaseManager {
  constructor() {
    if (new.target === BaseManager) {
      throw new TypeError('Cannot Construct BaseManager instances');
    }
  }

  // ...args = overriding
  addPlayer(playerId, ...args) {
    throw new Error('Method not implemented');
  }

  removePlayer() {
    throw new Error('Method not implemented');
  }

  clearAll() {
    throw new Error('Method not implemented');
  }
}

export default BaseManager;
