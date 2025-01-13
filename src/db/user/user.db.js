// user.queries.js를 실행시키는 js

import { toCamelCase } from '../../utils/transformCase.js';
import pools from '../database.js';
import { SQL_QUERIES } from './user.queries.js';
import { v4 as uuidv4 } from 'uuid';

// DeviceId를 찾는다
export const findUserByDeviceId = async (deviceId) => {
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_DEVICE_ID, [deviceId]);
  return toCamelCase(rows[0]); // 첫 번째 행을 반환
};

// 유저 생성
export const createUser = async (deviceId) => {
  const id = uuidv4();
  return { id, deviceId };
};

// 유저 로그인 업데이트
export const updateUserLogin = async (id) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_USER_LOGIN, [id]);
};
