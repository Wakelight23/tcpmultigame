import { createPingPacket } from '../../utils/notification/game.notification.js';

class User {
  constructor(id, socket) {
    this.id = id;
    this.socket = socket;
    // 유저가 움직이는 위치 동기화를 서버에서 처리하기 위해 객체 처리
    this.x = 0;
    this.y = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.accelerationX = 0;
    this.accelerationY = 0;
    this.lastUpdateTime = Date.now();
    this.gameId = null; // gameId 초기화
  }

  setGameId(gameId) {
    this.gameId = gameId;
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
  calculatePosition(currentTime) {
    const timeDiff = (currentTime - this.lastUpdateTime) / 1000;

    // 입력이 있을 때만 속도 적용
    if (this.velocityX !== 0 || this.velocityY !== 0) {
      // 절대 좌표 기반 위치 계산
      this.x += this.velocityX * timeDiff;
      this.y += this.velocityY * timeDiff;

      // 입력이 끝나면 속도 초기화
      this.velocityX = 0;
      this.velocityY = 0;
    }

    this.lastUpdateTime = currentTime;
    return { x: this.x, y: this.y };
  }
}

export default User;
