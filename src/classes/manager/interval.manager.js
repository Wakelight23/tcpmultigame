import BaseManager from './base.manager.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import { config } from '../../config/config.js';

class IntervalManager extends BaseManager {
  constructor() {
    super();
    this.intervals = new Map();
  }

  // 게임 시작 알림을 위한 인터벌 추가
  addGameStartNotification(gameId, callback) {
    this.addPlayer(gameId, callback, config.intervals.gameStart, 'gameStart');
  }

  // 위치 업데이트를 위한 인터벌 추가
  addLocationUpdate(gameId, callback) {
    if (!this.intervals.has(gameId)) {
      this.intervals.set(gameId, new Map());
    }
    this.intervals
      .get(gameId)
      .set('locationUpdate', setInterval(callback, config.intervals.locationUpdate));
  }

  addPingCheck(playerId, callback) {
    this.addPlayer(playerId, callback, config.intervals.ping, 'ping');
  }

  removeLocationUpdate(gameId) {
    if (this.intervals.has(gameId)) {
      const intervals = this.intervals.get(gameId);
      if (intervals.has('locationUpdate')) {
        clearInterval(intervals.get('locationUpdate'));
        intervals.delete('locationUpdate');
      }
    }
  }

  // 기본 인터벌 추가 메서드
  addPlayer(playerId, callback, interval, type = 'user') {
    if (!this.intervals.has(playerId)) {
      this.intervals.set(playerId, new Map());
    }
    this.intervals.get(playerId).set(type, setInterval(callback, interval));
  }

  // 특정 타입의 인터벌 제거
  removeInterval(playerId, type) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
      if (userIntervals.has(type)) {
        clearInterval(userIntervals.get(type));
        userIntervals.delete(type);
      }
    }
  }

  // 플레이어의 모든 인터벌 제거
  removePlayer(playerId) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
      userIntervals.forEach((intervalId) => clearInterval(intervalId));
      this.intervals.delete(playerId);
    }
  }

  // 모든 인터벌 정리
  clearAll() {
    this.intervals.forEach((userIntervals) => {
      userIntervals.forEach((intervalId) => clearInterval(intervalId));
    });
    this.intervals.clear();
  }
}

export default IntervalManager;
