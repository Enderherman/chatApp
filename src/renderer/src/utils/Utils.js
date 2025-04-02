const isEmpty = (str) => {
  return str == null || str === '' || str === undefined
}

const getAreaInfo = (data) => {
  if (isEmpty(data)) {
    return '-'
  }
  return data.replace(',', ' ')
}

export default {
  isEmpty,
  getAreaInfo
}
