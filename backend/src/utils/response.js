/**
 * 统一响应工具
 */

const CODE = {
  SUCCESS: 0,
  // 通用错误 100xx
  BAD_REQUEST: 10001,
  UNAUTHORIZED: 10002,
  FORBIDDEN: 10003,
  NOT_FOUND: 10004,
  SERVER_ERROR: 10005,
  
  // 业务错误 200xx
  USER_NOT_EXIST: 20001,
  USER_ALREADY_EXIST: 20002,
  INVALID_INVITE_CODE: 20003,
  GEMS_NOT_ENOUGH: 20004,
  TASK_NOT_FOUND: 20005,
  ORDER_NOT_FOUND: 20006,
  INVALID_PARAMETER: 20007
};

function success(data = null, message = 'success') {
  return {
    code: CODE.SUCCESS,
    message,
    data
  };
}

function error(code, message, data = null) {
  return {
    code,
    message,
    data
  };
}

function paginate(list, pagination) {
  return {
    code: CODE.SUCCESS,
    message: 'success',
    data: {
      list,
      pagination
    }
  };
}

module.exports = {
  CODE,
  success,
  error,
  paginate
};
