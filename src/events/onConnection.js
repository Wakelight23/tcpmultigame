import { onData } from './onData.js';
import { onEnd } from './onEnd.js';
import { onError } from './onError.js';

export const onConnection = (socket) => {
  console.log(`클라이언트가 연결되었습니다 : ${socket.remoteAddress}:${socket.remotePort}`);

  // 왜 만드는가
  // 각 클라이언트마다 고유한 버퍼 유지 위해
  socket.buffer = Buffer.alloc(0);

  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
};
