import { createPingPacket } from '../../utils/notification/game.notification.js';

class User {
  constructor(id, socket) {
    this.id = id;
    this.socket = socket;
    // 유저가 움직이는 위치 동기화를 서버에서 처리하기 위해 객체 처리
    this.x = 0;
    this.y = 0;
    this.lastUpdateTime = Date.now();
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
  }

  getNextSequence() {
    return ++this.sequence;
  }

  ping() {
    const now = Date.now();

    console.log(`[${this.id}] ping`);

    this.socket.write(createPingPacket(now));
  }

  handlePong(data) {
    const now = Date.now();
    this.latency = (now - data.timestamp) / 2; // 왜 나누기 2? 갔다가 오니까 = 왕복
    console.log(`Received pong from user ${this.id} at ${now} with latency ${this.latency}ms`);
  }

  // 위치 계산
  // 이 게임에 접속한 유저 중 가장 높은 latency를 가진 유저를 기준으로 위치 계산
  calculatePosition(latancy) {
    const timeDiff = latancy / 1000; // 초 단위로 계산한다
    const speed = 1; // 거, 속, 시 공식에서 speed는 1로 고정 => 속도가 달라지면 계산 방식이 복잡해진다
    const distance = speed * timeDiff; // 속도 * 레이턴시 = 거리

    return {
      x: this.x + distance,
      y: this.y + distance,
    };
  }
}

export default User;
