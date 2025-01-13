import { removeUser } from '../session/user.session.js';
import CustomError from '../utils/error/customError.js';
import { handleError } from '../utils/error/errorHandler.js';

export const onError = (socket) => (err) => {
  console.log(`소켓 에러 : ${err}`);

  handleError(socket, new CustomError(500, `소켓 오류 : ${err.message}`));

  // 세션에서 유저 삭제
  removeUser(socket);
};
