import BaseManager from './base.manager.js';

class IntervalManager extends BaseManager {
  constructor() {
    super();
    this.intervals = new Map(); // Map으로 사용하면 중복이 되지 않는다.
  }

  addPlayer(playerId, callback, interval, type = 'user') {
    if (!this.intervals.has(playerId)) {
      this.intervals.set(playerId, new Map());
    }
    this.intervals.get(playerId).set(type, setInterval(callback, interval));
  }

  addGame(gameId, callback, interval) {
    this.addPlayer(gameId, callback, interval, 'game');
  }

  addUpdatePosition(gameId, callback, interval) {
    this.addPlayer(gameId, callback, interval, 'updatePosition');
  }

  removeInterval(playerId, type) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
      if (userIntervals.has(type)) {
        clearInterval(userIntervals.get(type));
        userIntervals.delete(type);
      }
    }
  }

  removePlayer(playerId) {
    if (this.invervals.has(playerId)) {
      const userIntervals = this.invervals.get(playerId);
      userIntervals.forEach((intervalId) => clearInverval(intervalId));
      this.invervals.delete(playerId);
    }
  }

  clearAll() {
    this.intervals.forEach((userIntervals) => {
      userIntervals.forEach((intervalId) => clearInterval(intervalId));
    });
    thos.intervals.clear();
  }
}

export default IntervalManager;
