//文件类型
const FILE_TYPE = {
  mjpeg: 0,
  jpeg: 0,
  jpg: 0,
  png: 0,
  gif: 0,
  bmp: 0,
  webp: 0,
  mp4: 1,
  avi: 1,
  rmvb: 1,
  mkv: 1,
  mp3: 1,
  wma: 1,
  flac: 1,
  aac: 1,
  wav: 1,
  ogg: 1,
  m4a: 1,
  m4b: 1,
  mov: 1,
  0: '图片',
  1: '视频',
  2: '文件'
}
const getFileType = (suffix) => {
  if (suffix === null || suffix === undefined || suffix === '') return 2
  if (typeof suffix === 'string') {
    suffix = suffix.toLowerCase()
  }
  const fileType = FILE_TYPE[suffix]
  if (fileType === undefined) return 2
  return fileType
}
export { FILE_TYPE, getFileType }
