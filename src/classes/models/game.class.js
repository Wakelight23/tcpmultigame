import { config } from '../../config/config.js';
import {
  createLocationPacket,
  createWaitingPacket,
  gameStartNotification,
} from '../../utils/notification/game.notification.js';
import IntervalManager from '../manager/interval.manager.js';

class Game {
  constructor(id) {
    this.id = id;
    this.users = [];
    this.intervalManager = new IntervalManager();
    this.state = 'waiting'; //초기 상태
  }

  addUser(user) {
    // 최대 참가 인원수 설정
    if (this.users.length >= config.maxPlayer.max_player) {
      throw new Error(`Game session is full`);
    }
    this.users.push(user);
    this.updateGameState();
    // this.broadcastToAll();
    this.broadcastGameState();

    // 1초마다 ping 체크
    // this.intervalManager.addPlayer(user, user.ping.bind(user), 1000);
    // 최대 인원수가 되면 게임 시작
    // if (this.users.length === config.maxPlayer.max_player) {
    //   setTimeout(() => {
    //     this.startGame();
    //   }, 3000);
    // }
  }

  updateGameState() {
    if (this.users.length === 0) {
      this.state = 'empty';
    } else if (this.users.length < config.maxPlayer.max_player) {
      this.state = 'waiting';
    } else if (this.users.length === config.maxPlayer.max_player) {
      this.state = 'inProgress';
    }
  }

  getSessionInfo() {
    return {
      gameId: this.id,
      playerCount: this.users.length,
      gameState: this.state,
    };
  }

  broadcastToAll(packet) {
    console.log('broadcastToAll의 packet : ', packet);
    this.users.forEach((user) => {
      if (user && user.socket) {
        user.socket.write(packet);
      }
    });
  }

  broadcastLocationUpdate() {
    const locationData = this.users.map((user) => ({
      id: user.id,
      x: user.x,
      y: user.y,
    }));

    const locationPacket = createLocationPacket(this.id, locationData);

    console.log('locationPacket : ', locationPacket);
    this.broadcastToAll(locationPacket);
  }

  broadcastGameState() {
    const gameState = this.getSessionInfo();
    const statePacket = createWaitingPacket(
      gameState.gameId,
      gameState.playerCount,
      gameState.gameState,
    );
    this.users.forEach((user) => {
      if (user && user.socket) {
        user.socket.write(statePacket);
      }
    });
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(userId) {
    this.users = this.users.filter((user) => user.id !== userId);
    this.intervalManager.removePlayer(userId);
    this.updateGameState();
    this.broadcastGameState();
  }

  // 유저들 중 latancy가 가장 높은 유저 기준으로 계산
  getMaxLatency() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      if (user && typeof user.latency === 'number') {
        maxLatency = Math.max(maxLatency, user.latency);
      }
    });
    return maxLatency;
  }

  startGame() {
    this.state = 'inProgress';
    this.broadcastGameState();
    this.broadcastLocationUpdate();
    const startPacket = gameStartNotification(this.id, Date.now());
    console.log('startGame()안의 startPacket : ', startPacket);
    this.users.forEach((user) => {
      if (user && user.socket) {
        user.socket.write(startPacket);
      }
    });
  }

  getAllLocation() {
    const maxLatancy = this.getMaxLatency();
    console.log('maxLatancy check : ', maxLatancy);

    const locationData = this.users.map((user) => {
      const { x, y } = user.calculatePosition(maxLatancy);
      return { id: user.id, x, y };
    });
    // console.log('getAllLocation의 locationData : ', locationData);
    return createLocationPacket(locationData);
  }
}

export default Game;
