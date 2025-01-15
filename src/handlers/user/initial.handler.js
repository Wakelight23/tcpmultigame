import { addUser } from '../../session/user.session.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createUser, findUserByDeviceId, updateUserLogin } from '../../db/user/user.db.js';
import { getAvailableGameSession } from '../../session/game.session.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import CustomError from '../../utils/error/customError.js';

const initialHandler = async ({ socket, userId, payload }) => {
  console.log('initialHandler 함수 들어왔다!');
  try {
    const { deviceId } = payload;

    const user = await findUserByDeviceId(payload.deviceId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    if (!user) {
      user = await createUser(deviceId);
    } else {
      await updateUserLogin(user.id);
    }

    addUser(socket, user.id);

    // 유저가 없으면 새로 생성
    if (!user) {
      console.log(`새로운 유저 생성: Device ID = ${deviceId}`);
      user = await createUser(deviceId);
    } else {
      console.log(`기존 유저 로그인 업데이트: User ID = ${user.id}`);
      await updateUserLogin(user.id);
    }

    // 세션에 유저 추가
    addUser(socket, user.id);
    console.log(`유저 추가됨: User ID = ${user.id}`);

    const protoMessages = getProtoMessages();
    const InitialResponse = protoMessages.response.InitialResponse;

    const initialResponseData = InitialResponse.create({
      userId: user.id,
      // gameId: gameSession.id,
    });

    // 클라이언트에게 응답 전송
    const initialResponse = createResponse(
      HANDLER_IDS.INITIAL,
      RESPONSE_SUCCESS_CODE,
      InitialResponse.encode(initialResponseData).finish(),
      deviceId,
    );

    socket.write(initialResponse); // 응답 전송
  } catch (error) {
    handleError(socket, error); // 에러 처리
  }
};

export default initialHandler;
