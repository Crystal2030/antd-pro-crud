import {addBook, queryBookList, removeBook, editBook} from '../services/api';

export default {
  namespace: 'page1',  // 该字段就相当于model的索引

  state: {
    list: [],
    pagination: {},
  },

  effects: {
    *fetch({payload}, { call, put}) {
      // call 用于调用异步逻辑  put: 用于触发action  拿到http请求数据后触发reducer修改state的数据
      const response = yield call(queryBookList, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({payload, callback}, {call, put}) {
      const response = yield call(addBook, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *edit({payload, callback}, {call, put}) {
      const response = yield call(editBook, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeBook, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,  // 将数据返回给页面
      }
    },
  },
};
