const Store = require('electron-store')
const store = new Store()

/**
 * 初始化用户id
 */
let userId = null
const initUserId = (_userId) => {
  userId = _userId
}

const getUserId = () => {
  return userId
}

const setData = (key, value) => {
  store.set(key, value)
}

const getData = (key) => {
  return store.get(key)
}

/**
 * 存储userid
 */
const setUserData = (key, value) => {
  setData(userId + key, value)
}

const getUserData = (key) => {
  return getData(userId + key)
}

const deleteUserData = (key) => {
  store.delete(userId + key)
}

export default {
  initUserId,
  getUserId,
  setData,
  getData,
  setUserData,
  getUserData,
  deleteUserData
}
