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
    const pingData = {
      timestamp: Date.now(),
    };
    this.lastPingSent = pingData;
    this.socket.write(createPingPacket(pingData));
  }

  handlePong(data) {
    const now = Date.now();
    this.latency = Math.max(0, (now - data.timestamp) / 2);
    this.lastPongTime = now; // 마지막 pong 시간 저장
    console.log(`Received pong from user ${this.id} at ${now} with latency ${this.latency}ms`);
  }

  // 위치 계산
  calculatePosition(currentTime) {
    if (!currentTime) {
      currentTime = Date.now();
    }
    const timeDiff = (currentTime - this.lastUpdateTime) / 1000;

    // 가속도를 속도에 적용
    this.velocityX += this.accelerationX * timeDiff;
    this.velocityY += this.accelerationY * timeDiff;

    // 속도 제한 (예: -5 ~ 5 사이로 제한)
    this.velocityX = Math.max(-5, Math.min(this.velocityX, 5));
    this.velocityY = Math.max(-5, Math.min(this.velocityY, 5));

    // 새로운 위치 계산
    this.x += this.velocityX * timeDiff;
    this.y += this.velocityY * timeDiff;

    // 마지막 업데이트 시간 갱신
    this.lastUpdateTime = currentTime;

    // 가속도 초기화 (한 번의 입력만 처리)
    this.accelerationX = 0;
    this.accelerationY = 0;

    return { x: this.x, y: this.y };
  }
}

export default User;
