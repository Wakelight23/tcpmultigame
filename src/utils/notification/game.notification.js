// 게임 내에서 게임과 관련된 모든 알림을 여기에서 처리

import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../constants/header.js';
import { getProtoMessages } from '../../init/loadProtos.js';

// 범용적으로 사용할 함수
const makeNotification = (message, type) => {
  const packetLength = Buffer.alloc(config.packet.totalLength);
  packetLength.writeUInt32BE(
    message.length + config.packet.totalLength + config.packet.typeLength,
    0,
  );

  const packetType = Buffer.alloc(config.packet.typeLength);
  packetType.writeUInt8(type, 0);

  return Buffer.concat([packetLength, packetType, message]);
};

// 유저들의 위치정보
export const createLocationPacket = (users) => {
  const protoMessage = getProtoMessages();
  const Location = protoMessage.gameNotification.LocationUpdate;

  const payload = { users };
  const message = Location.create(payload);
  const locationPacket = Location.encode(message).finish();

  return makeNotification(locationPacket, PACKET_TYPE.LOCATION);
};

// 게임 시작 패킷
// export const gameStartNotification = (gameId, timestamp) => {
//   const protoMessage = getProtoMessages();
//   const Start = protoMessage.gameNotification.Start;

//   const payload = { gameId, timestamp };
//   const message = Start.create(payload);
//   const startPacket = Start.encode(message).finish();

//   return makeNotification(startPacket, PACKET_TYPE.GAME_START);
// };

export const createPingPacket = (timestamp) => {
  const protoMessages = getProtoMessages();
  const ping = protoMessages.common.Ping;

  const payload = { timestamp };
  const message = ping.create(payload);
  const pingPacket = ping.encode(message).finish();

  return makeNotification(pingPacket, PACKET_TYPE.PING);
};
