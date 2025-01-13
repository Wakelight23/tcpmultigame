import { addUser } from '../../session/user.session.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import { createResponse } from '../../utils/response/createResponse.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createUser, findUserByDeviceId, updateUserLogin } from '../../db/user/user.db.js';

const initialHandler = async ({ socket, userId, payload }) => {
  try {
    let { deviceId } = payload;

    // deviceId가 없을 경우 소켓 정보를 기반으로 생성
    if (!deviceId || deviceId.trim() === '') {
      console.log('Device ID가 누락되었습니다. 소켓 정보를 기반으로 Device ID 생성.');
      deviceId = `${socket.remoteAddress}:${socket.remotePort}`;
    }

    console.log(`Received Device ID: ${deviceId}`);

    // 데이터베이스에서 유저 조회
    let user = await findUserByDeviceId(deviceId);

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

    // 클라이언트에게 응답 전송
    const initialResponse = createResponse(
      HANDLER_IDS.INITIAL,
      RESPONSE_SUCCESS_CODE,
      { userId: user.id },
      deviceId,
    );

    socket.write(initialResponse); // 응답 전송
  } catch (error) {
    handleError(socket, error); // 에러 처리
  }
};

export default initialHandler;
