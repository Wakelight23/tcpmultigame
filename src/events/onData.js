import { config } from '../config/config.js';
import { PACKET_TYPE } from '../constants/header.js';
import { getHandlerById } from '../handlers/index.js';
import { packetParser } from '../utils/parser/packetParser.js';
import { getUserBySocket } from '../session/user.session.js';
import CustomError from '../utils/error/customError.js';
import { handleError } from '../utils/error/errorHandler.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import gameExitHandler from '../handlers/game/gameExit.handler.js';
import IntervalManager from '../classes/manager/interval.manager.js';
import {
  createLocationPacket,
  createPingPacket,
  createWaitingPacket,
  gameStartNotification,
} from '../utils/notification/game.notification.js';

export const onData = (socket) => async (data) => {
  // 기존 버퍼에 새로 수신된 데이터를 추가
  socket.buffer = Buffer.concat([socket.buffer, data]);

  // 패킷의 총 헤더 길이 (패킷 길이 정보 + 타입 정보)
  const totalHeaderLength = config.packet.totalLength + config.packet.typeLength;

  while (socket.buffer.length >= totalHeaderLength) {
    // 1. 패킷 길이 정보 수신 (4바이트)
    const length = socket.buffer.readUInt32BE(0);

    // 2. 패킷 타입 정보 수신 (1바이트)
    const packetType = socket.buffer.readUInt8(config.packet.totalLength);

    // 3. 패킷 전체 길이 확인 후 데이터 수신
    if (socket.buffer.length >= length) {
      const packet = socket.buffer.slice(totalHeaderLength, length);
      socket.buffer = socket.buffer.slice(length);

      try {
        const { handlerId, userId, payload } = packetParser(packet);
        const intervalManager = new IntervalManager();

        switch (packetType) {
          case PACKET_TYPE.NORMAL:
            await handleNormalPacket(handlerId, socket, userId, payload);
            break;

          case PACKET_TYPE.PING:
            handlePingPacket(userId, socket, intervalManager);
            break;

          case PACKET_TYPE.WAITING:
            handleWaitingPacket(payload, socket, intervalManager);
            break;

          case PACKET_TYPE.JOIN_GAME:
            handleGameStartPacket(payload, socket, intervalManager);
            break;

          case PACKET_TYPE.GAME_START:
            handleGameStartPacket(payload, socket, intervalManager);
            break;

          case PACKET_TYPE.LOCATION:
            handleLocationPacket(payload, socket, intervalManager);
            break;

          case PACKET_TYPE.EXIT:
            handleExitPacket(userId, socket, intervalManager);
            break;

          default:
            console.error(`Unknown packet type: ${packetType}`);
        }
      } catch (error) {
        handleError(socket, error);
      }
    } else {
      // 아직 전체 패킷이 도착하지 않음
      break;
    }
  }
};

async function handleNormalPacket(handlerId, socket, userId, payload) {
  const handler = getHandlerById(handlerId);
  if (!handler) {
    throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, '알 수 없는 핸들러 ID입니다.');
  }
  await handler({ socket, userId, payload });
}

function handlePingPacket(userId, socket, intervalManager) {
  console.log('Ping received');
  intervalManager.addPingCheck(userId, () => {
    const pingPacket = createPingPacket(Date.now());
    socket.write(pingPacket);
  });
}

function handleLocationPacket(payload, socket, intervalManager) {
  console.log('Location Update received:', payload);
  intervalManager.addLocationUpdate(payload.users[0].id, () => {
    const locationPacket = createLocationPacket(payload.users);
    socket.write(locationPacket);
  });
}

function handleWaitingPacket(payload, socket) {
  console.log('Waiting packet received:', payload);
  const { gameId, playerCount, gameState } = payload;

  // 게임 상태 업데이트
  updateGameState(gameId, playerCount, gameState);

  // 클라이언트에게 대기 상태 알림
  const waitingPacket = createWaitingPacket(gameId, playerCount, gameState);
  socket.write(waitingPacket);
}

function handleGameStartPacket(payload, socket, intervalManager) {
  console.log('Game Start Notification received');
  const timestamp = Date.now();
  intervalManager.addGameStartNotification(payload.gameId, () => {
    const startPacket = gameStartNotification(payload.gameId, timestamp);
    socket.write(startPacket);
  });
}

function handleExitPacket(userId, socket, intervalManager) {
  console.log('take EXIT! 클라이언트 접속 종료');
  intervalManager.removePlayer(userId);
  gameExitHandler({ socket, userId });
}
