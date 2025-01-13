import net from 'net';
import Long from 'long';
import { getProtoMessages, loadProtos } from './src/init/loadProtos.js';

const TOTAL_LENGTH = 4; // 전체 길이를 나타내는 4바이트
const PACKET_TYPE_LENGTH = 1; // 패킷타입을 나타내는 1바이트

let userId;
let gameId;
let sequence = 0;
const deviceId = 'xxxx1x';
let x = 0.0;
let y = 0.0;

const createPacket = (handlerId, payload, clientVersion = '1.0.0', type, name) => {
  const protoMessages = getProtoMessages();
  const PayloadType = protoMessages[type][name];

  if (!PayloadType) {
    throw new Error('PayloadType을 찾을 수 없습니다.');
  }

  const payloadMessage = PayloadType.create(payload);
  const payloadBuffer = PayloadType.encode(payloadMessage).finish();

  return {
    handlerId,
    userId,
    clientVersion,
    sequence,
    payload: payloadBuffer,
  };
};

const sendPacket = (socket, packet) => {
  const protoMessages = getProtoMessages();
  const Packet = protoMessages.common.Packet;
  if (!Packet) {
    console.error('Packet 메시지를 찾을 수 없습니다.');
    return;
  }

  const buffer = Packet.encode(packet).finish();

  // 패킷 길이 정보를 포함한 버퍼 생성
  const packetLength = Buffer.alloc(TOTAL_LENGTH);
  packetLength.writeUInt32BE(buffer.length + TOTAL_LENGTH + PACKET_TYPE_LENGTH, 0); // 패킷 길이에 타입 바이트 포함

  // 패킷 타입 정보를 포함한 버퍼 생성
  const packetType = Buffer.alloc(PACKET_TYPE_LENGTH);
  packetType.writeUInt8(1, 0); // NORMAL TYPE

  // 길이 정보와 메시지를 함께 전송
  const packetWithLength = Buffer.concat([packetLength, packetType, buffer]);

  socket.write(packetWithLength);
};

const sendPong = (socket, timestamp) => {
  const protoMessages = getProtoMessages();
  const Ping = protoMessages.common.Ping;

  const pongMessage = Ping.create({ timestamp });
  const pongBuffer = Ping.encode(pongMessage).finish();
  // 패킷 길이 정보를 포함한 버퍼 생성
  const packetLength = Buffer.alloc(TOTAL_LENGTH);
  packetLength.writeUInt32BE(pongBuffer.length + TOTAL_LENGTH + PACKET_TYPE_LENGTH, 0);

  // 패킷 타입 정보를 포함한 버퍼 생성
  const packetType = Buffer.alloc(1);
  packetType.writeUInt8(0, 0);

  // 길이 정보와 메시지를 함께 전송
  const packetWithLength = Buffer.concat([packetLength, packetType, pongBuffer]);

  socket.write(packetWithLength);
};

const updateLocation = (socket) => {
  x += 0.1;
  const packet = createPacket(6, { gameId, x, y }, '1.0.0', 'game', 'LocationUpdatePayload');

  sendPacket(socket, packet);
};

// 서버에 연결할 호스트와 포트
const HOST = 'localhost';
const PORT = 5555;

const client = new net.Socket();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

client.connect(PORT, HOST, async () => {
  console.log('Connected to server');
  await loadProtos();

  const successPacket = createPacket(0, { deviceId }, '1.0.0', 'initial', 'InitialPacket');

  await sendPacket(client, successPacket);
  await delay(500);

  const createGamePacket = createPacket(
    4,
    { timestamp: Date.now() },
    '1.0.0',
    'game',
    'CreateGamePayload',
  );

  await sendPacket(client, createGamePacket);
});

client.on('data', (data) => {
  // 1. 길이 정보 수신 (4바이트)
  const length = data.readUInt32BE(0);
  const totalHeaderLength = TOTAL_LENGTH + PACKET_TYPE_LENGTH;
  // 2. 패킷 타입 정보 수신 (1바이트)
  const packetType = data.readUInt8(4);
  const packet = data.slice(totalHeaderLength, totalHeaderLength + length); // 패킷 데이터
  const protoMessages = getProtoMessages();

  if (packetType === 1) {
    const Response = protoMessages.response.Response;

    try {
      const response = Response.decode(packet);
      const responseData = JSON.parse(Buffer.from(response.data).toString());
      if (response.handlerId === 0) {
        userId = responseData.userId;
      }
      console.log('응답 데이터:', responseData);
      sequence = response.sequence;
    } catch (e) {
      console.log(e);
    }
  } else if (packetType === 0) {
    try {
      const Ping = protoMessages.common.Ping;
      const pingMessage = Ping.decode(packet);
      const timestampLong = new Long(
        pingMessage.timestamp.low,
        pingMessage.timestamp.high,
        pingMessage.timestamp.unsigned,
      );
      // console.log('Received ping with timestamp:', timestampLong.toNumber());
      sendPong(client, timestampLong.toNumber());
    } catch (pongError) {
      console.error('Ping 처리 중 오류 발생:', pongError);
    }
  } else if (packetType === 2) {
    try {
      const Start = protoMessages.gameNotification.Start;
      const startMessage = Start.decode(packet);

      console.log('응답 데이터:', startMessage);
      if (startMessage.gameId) {
        gameId = startMessage.gameId;
      }

      // 위치 업데이트 패킷 전송
      setInterval(() => {
        updateLocation(client);
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  } else if (packetType === 3) {
    try {
      const locationUpdate = protoMessages.gameNotification.LocationUpdate;
      const locationUpdateMessage = locationUpdate.decode(packet);

      console.log('응답 데이터:', locationUpdateMessage);
    } catch (error) {
      console.error(error);
    }
  }
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.error('Client error:', err);
});
