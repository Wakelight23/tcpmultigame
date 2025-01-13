import { getGameSeesion } from '../../session/game.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { getProtoMessages } from '../../init/loadProtos.js';

const updateLocationHandler = ({ socket, userId, payload }) => {
  try {
    const protoMessages = getProtoMessages();
    const LocationUpdatePayload = protoMessages.game.LocationUpdatePayload;
    const LocationUpdate = protoMessages.game.LocationUpdate;

    // Protobuf로 payload 디코딩
    const decodedPayload = LocationUpdatePayload.decode(payload);
    const { gameId, x, y } = decodedPayload;

    const gameSession = getGameSeesion(gameId);
    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임 세션을 찾을 수 없습니다.');
    }

    const user = gameSession.getUser(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    // 유저 위치 업데이트
    user.updatePosition(x, y);

    // 모든 유저의 위치 정보를 Protobuf로 직렬화하여 전송
    const allLocations = gameSession.getAllLocation(); // [{ id, playerId, x, y }, ...]
    const locationUpdateMessage = LocationUpdate.create({
      users: allLocations.map((loc) => ({
        id: loc.id,
        playerId: loc.playerId,
        x: loc.x,
        y: loc.y,
      })),
    });

    const packet = LocationUpdate.encode(locationUpdateMessage).finish();
    socket.write(packet);
  } catch (e) {
    handleError(socket, e);
  }
};

export default updateLocationHandler;
