import { config } from '../config/config.js';
import { PACKET_TYPE } from '../constants/header.js';
import { getHandlerById } from '../handlers/index.js';
import { packetParser } from '../utils/parser/packetParser.js';
import { getUserBySocket } from '../session/user.session.js';
import CustomError from '../utils/error/customError.js';
import { handleError } from '../utils/error/errorHandler.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import gameExitHandler from '../handlers/game/gameExit.handler.js';

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
        // 공통 패킷 구조를 파싱
        const { handlerId, userId, payload } = packetParser(packet);

        console.log('Decoded Packet:', { handlerId, userId, payload });

        switch (packetType) {
          case PACKET_TYPE.NORMAL: {
            const handler = getHandlerById(handlerId);
            console.log('handler 뭐가 나오니? ', handler);
            if (!handler) {
              throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, '알 수 없는 핸들러 ID입니다.');
            }

            // 유저 세션 확인
            // const user = getUserBySocket(socket);
            // if (!user) {
            //   throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
            // }

            // 핸들러 호출
            await handler({
              socket,
              userId,
              payload,
            });
            break;
          }

          case PACKET_TYPE.PING: {
            console.log('Ping received');
            break; // Ping 처리 로직 추가 가능
          }

          case PACKET_TYPE.LOCATION: {
            console.log('Location Update received:', payload);
            // 위치 업데이트 처리 로직 추가 가능
            break;
          }

          case PACKET_TYPE.GAME_START: {
            console.log('Game Start received');
            // 게임 시작 처리 로직 추가 가능
            break;
          }
          case PACKET_TYPE.EXIT: {
            console.log('클라이언트 접속 종료');
            gameExitHandler({ socket, userId });
            break;
          }

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
