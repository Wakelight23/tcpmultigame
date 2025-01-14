import net from 'net';
import initServer from './init/index.js';
import dotenv from 'dotenv';
import { config } from './config/config.js';
import { onConnection } from './events/onConnection.js';
import { initializeGameSessions } from './session/game.session.js';

const server = net.createServer(onConnection);

initServer()
  .then(() => {
    // 서버 실행할 때 (초기화 할 때) 기본 gameSession 생성
    initializeGameSessions();

    server.listen(config.server.port, config.server.host, () => {
      console.log(`서버가 ${config.server.port}, ${config.server.host} 에서 실행중입니다`);
      console.log(server.address());
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1); // 오류 발생 시 프로세스 종료
  });
