import { config } from '../../config/config.js';
import { getProtoTypeNameByHandlerId } from '../../handlers/index.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import CustomError from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';

// data = 바이트 배열
export const packetParser = (data) => {
  const protoMessages = getProtoMessages();

  // 공통 패킷 구조를 디코딩
  const CommonPacket = protoMessages.common.CommonPacket; // CommonPacket 메시지
  let packet;
  try {
    packet = CommonPacket.decode(data);
    console.log('Decoded Packet:', packet); // 디코딩된 패킷 출력
  } catch (e) {
    throw new CustomError(ErrorCodes.PACKET_DECODE_ERROR, `패킷 디코딩에 실패하였습니다.`);
  }

  const handlerId = packet.handlerId;
  const userId = packet.userId;
  const clientVersion = packet.version;
  const payloadBuffer = packet.payload;

  // 클라이언트 버전 검증
  if (clientVersion !== config.client.version) {
    throw new CustomError(
      ErrorCodes.CLIENT_VERSION_MISMATCH,
      `클라이언트 버전이 일치하지 않습니다.`,
    );
  }

  // 핸들러 ID로 Protobuf 타입 가져오기
  const protoTypeName = getProtoTypeNameByHandlerId(handlerId);
  if (!protoTypeName) {
    throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, `알 수 없는 핸들러 ID입니다.`);
  }

  // Protobuf 메시지 타입 로드
  const [namespace, typeName] = protoTypeName.split('.');
  const PayloadType = protoMessages[namespace][typeName];

  // payload 디코딩
  let payload;
  try {
    payload = PayloadType.decode(payloadBuffer);
  } catch (e) {
    throw new CustomError(ErrorCodes.PACKET_DECODE_ERROR, `페이로드 디코딩에 실패하였습니다.`);
  }

  // 필드 검증 (선택적으로 유지)
  const errorMessage = PayloadType.verify(payload);
  if (errorMessage) {
    throw new CustomError(
      ErrorCodes.INVALID_PACKET,
      `패킷 구조가 일치하지 않습니다: ${errorMessage}`,
    );
  }

  return { handlerId, userId, payload };
};
