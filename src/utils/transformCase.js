/* 
카멜 케이스(Camel case)는 띄어쓰기를 하지 않고 각 단어의 첫 글자를 대문자로 붙여 쓰되, 
전체 단어의 첫 글자는 대문자 또는 소문자로 쓸 수 있는 방식입니다.
https://developer.mozilla.org/ko/docs/Glossary/Camel_case
*/
import camelCase from 'lodash/camelCase.js';

export const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    // 배열인 경우, 배열의 각 요소에 대해 재귀적으로 toCamelCase 함수를 호출
    return obj.map((v) => toCamelCase(v));
  } else if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    // 객체인 경우, 객체의 키를 카멜케이스로 변환하고, 값에 대해서도 재귀적으로 toCamelCase 함수를 호출
    return Object.keys(obj).reduce((result, key) => {
      result[camelCase(key)] = toCamelCase(obj[key]);
      return result;
    }, {});
  }
  // 객체도 배열도 아닌 경우, 원본 값을 반환
  return obj;
};
