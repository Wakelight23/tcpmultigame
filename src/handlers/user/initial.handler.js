import { addUser, getUserBySocket } from '../../session/user.session.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createUser, findUserByDeviceId, updateUserLogin } from '../../db/user/user.db.js';
import { getAvailableGameSession } from '../../session/game.session.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { userSessions } from '../../session/sessions.js';

const initialHandler = async ({ socket, userId, payload }) => {
  console.log('initialHandler 함수 들어왔다!');
  try {
    const { deviceId } = payload;

    // 1. 데이터베이스에서 유저 검색
    let user = await findUserByDeviceId(deviceId);

    if (!user) {
      console.log(`새로운 유저 생성: Device ID = ${deviceId}`);
      user = await createUser(deviceId);
    } else {
      console.log(`기존 유저 로그인 업데이트: User ID = ${user.id}`);
      await updateUserLogin(user.id);
    }

    // 2. 세션에서 동일한 소켓 또는 deviceId 확인
    const existingUser = userSessions.find(
      (sessionUser) => sessionUser.socket === socket || sessionUser.id === user.id,
    );

    if (existingUser) {
      console.warn(`유저가 이미 세션에 존재합니다: User ID = ${existingUser.id}`);
      return;
    }

    // 3. 새로운 유저를 세션에 추가
    addUser(socket, user.id);
    console.log(`userSession에 추가됨: User ID = ${user.id}`);

    const protoMessages = getProtoMessages();
    const InitialResponse = protoMessages.response.InitialResponse;

    const initialResponseData = InitialResponse.create({
      userId: user.id,
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
