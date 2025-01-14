import {
  createLocationPacket,
  // gameStartNotification,
} from '../../utils/notification/game.notification.js';
import IntervalManager from '../manager/interval.manager.js';

const MAX_PALYERS = 2;

class Game {
  constructor(id) {
    this.id = id;
    this.users = [];
    this.intervalManager = new IntervalManager();
    this.state = 'waiting'; // 'waiting', 'inProgress'
  }

  addUser(user) {
    // 최대 참가 인원수 설정
    if (this.users.length >= MAX_PALYERS) {
      throw new Error(`Game session is full`);
    }
    this.users.push(user);

    // 1초마다 ping 체크
    this.intervalManager.addPlayer(user, user.ping.bind(user), 1000);
    // 최대 인원수가 되면 게임 시작
    if (this.users.length === MAX_PALYERS) {
      setTimeout(() => {
        this.startGame();
      }, 3000);
    }
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(userId) {
    this.users = this.users.filter((user) => user.id !== userId);
    // this.intervalManager.removePlayer(userId);

    // 게임 플레이 도중에 유저가 나갔다면 state 상태를 waiting으로 변경
    if (this.users.length < MAX_PALYERS) {
      this.state = 'waiting';
    }
  }

  // 유저들 중 latancy가 가장 높은 유저 기준으로 계산
  getMaxLatancy() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      maxLatency = Math.max(maxLatency, user.latency);
    });

    return maxLatency;
  }

  // startGame() {
  //   this.state = 'inProgress'; // 이 메서드가 호출되서 게임이 시작되었다면
  //   // const startPacket = gameStartNotification(this.id, Date.now());
  //   console.log(this.getMaxLatancy());

  //   this.users.forEach((user) => {
  //     user.socket.write(startPacket);
  //   });
  // }

  getAllLocation() {
    const maxLatancy = this.getMaxLatancy();

    const locationData = this.users.map((user) => {
      const { x, y } = user.calculatePosition(maxLatancy);
      return { id: user.id, x, y };
    });
    return createLocationPacket(locationData);
  }
}

export default Game;
