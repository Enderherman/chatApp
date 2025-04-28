import { selectChatMessagesByMessageId } from './database/ChatMessageModel'

const fs = require('fs')
const fse = require('fs-extra')
const NODE_ENV = process.env.NODE_ENV
const path = require('path')
const { app, ipcMain, shell } = require('electron')
const { exec } = require('child_process')
const FormData = require('form-data') //引入FormData模块（用于构建表单数据)
const axios = require('axios') // 引入axios库
import store from './store'
import { dialog } from 'electron'
import { selectSettingInfo, updateSysSetting } from './database/UserSettingModel'
import { getWindow } from './windowProxy'

const moment = require('moment')
moment.locale(' zh-cn', {})

//express 服务器
const express = require('express')
const expressServer = express()

const cover_image_suffix = '_cover.png'
const image_suffix = '.png'

const ffprobePath = '/assets/ffprobe.exe'
const ffmpegPath = '/assets/ffmpeg.exe'
//保存到本地
// const saveFileToLocal = (messageId, filePath, fileType) => {
//   return new Promise(async (resolve, reject) => {
//     let savePath = await getLocalFilePath('chat', false, messageId)
//     console.log('localSave: ', savePath)
//     savePath = path.normalize(savePath)
//     let ffprobePath = getFFprobePath()
//     let ffmpegPath = getFFmpegPath()
//     let coverPath = null
//     //复制文件
//     fs.copyFileSync(filePath, savePath)
//     console.log('目标路径: ', filePath)
//     if (fileType !== 2) {
//       let command = `"${ffprobePath}" -v error -select_streams v:0 -show_entries stream=codec_name "${filePath}"`
//       //1.获取类型
//       let result = await execCommand(command)
//       result = result.replaceAll('\r\n', '')
//       result = result.substring(result.indexOf('=') + 1)
//       let codeName = result.substring(0, result.indexOf('[')).trim()
//       console.log('codename:', codeName)
//       if (codeName === 'hevc') {
//         //2.1 先删除一下复制
//         fs.rmSync(savePath)
//         command = `"${ffmpegPath}" -y -i  "${filePath}" -c:v libx264 -crf 20 "${savePath}"`
//         //2.2 转译下格式
//         await execCommand(command)
//       }
//       coverPath = savePath + cover_image_suffix
//       //3.生成缩略图
//       command = `"${ffmpegPath}" -i "${savePath}" -y -vframes 1 -vf "scale=min(170\\, iw*min(170/iw\\,170/ih)):min(170\\, ih*min(170/iw\\,170/ih))" "${coverPath}"`
//       await execCommand(command)
//     }
//     //上传文件
//     await uploadFile(messageId, savePath, coverPath)
//     resolve()
//   })
// }
/**
 * 将文件保存到本地并处理
 * @param {string} messageId - 消息ID
 * @param {string} filePath - 原始文件路径
 * @param {number} fileType - 文件类型
 * @returns {Promise<void>}
 */
const saveFileToLocal = async (messageId, filePath, fileType) => {
  try {
    // 获取保存路径
    let savePath = await getLocalFilePath('chat', false, messageId)
    savePath = path.normalize(savePath)
    // 获取工具路径
    const ffprobePath = getFFprobePath()
    const ffmpegPath = getFFmpegPath()
    let coverPath = null
    // 复制文件
    fs.copyFileSync(filePath, savePath)
    // 处理非文件类型文件
    if (fileType !== 2) {
      // 1.获取视频编码类型
      let command = `"${ffprobePath}" -v error -select_streams v:0 -show_entries stream=codec_name "${filePath}"`
      let result = await execCommand(command)
      result = result.replaceAll('\r\n', '')
      result = result.substring(result.indexOf('=') + 1)
      let codeName = result.substring(0, result.indexOf('[')).trim()
      console.log('codename:', codeName)
      // 2.如果是HEVC格式，转换为H.264
      if (codeName === 'hevc') {
        // 2.1 先删除复制的文件
        fs.rmSync(savePath)
        // 2.2 转换格式
        command = `"${ffmpegPath}" -y -i "${filePath}" -c:v libx264 -crf 20 "${savePath}"`
        await execCommand(command)
      }
      // 3.生成缩略图
      coverPath = savePath + cover_image_suffix
      command = `"${ffmpegPath}" -i "${savePath}" -y -vframes 1 -vf "scale=min(170\\, iw*min(170/iw\\,170/ih)):min(170\\, ih*min(170/iw\\,170/ih))" "${coverPath}"`
      await execCommand(command)
    }
    // 上传文件
    await uploadFile(messageId, savePath, coverPath)
  } catch (error) {
    console.error('保存文件失败:111111111111111111111111111111111111', error)
    throw error
  }
}

/**
 * 上传文件
 */
const uploadFile = (messageId, savePath, coverPath) => {
  const formData = new FormData()
  formData.append('messageId', messageId)
  formData.append('file', fs.createReadStream(savePath))
  if (coverPath) {
    formData.append('cover', fs.createReadStream(coverPath))
  }
  const url = `${getDomainPath()}/api/chat/uploadFile`
  const token = store.getUserData('token')
  const config = { headers: { 'Content-Type': 'multipart/form-data', token: token } }
  axios
    .post(url, formData, config)
    .then((response) => {
      console.log(response.data)
    })
    .catch((error) => {
      console.error('文件上传失败', error)
    })
}

/**
 * 执行命令
 */
const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}

/**
 * 获取地址
 */
const getDomainPath = () => {
  return NODE_ENV !== 'development' ? store.getData('prodDomain') : store.getData('devDomain')
}

const getFFprobePath = () => {
  return path.join(getResourcesPath(), ffprobePath)
}

const getFFmpegPath = () => {
  return path.join(getResourcesPath(), ffmpegPath)
}
/**
 * 获取路径
 */
const getResourcesPath = () => {
  let resourcePath = app.getAppPath()
  if (NODE_ENV !== 'development') {
    resourcePath = path.dirname(app.getPath('exe') + '/resources')
  }
  return resourcePath
}

/**
 * 获取模块路径
 */
const getLocalFilePath = (partType, showCover, fileId) => {
  return new Promise(async (resolve, reject) => {
    let localFolder = store.getUserData('localFileFolder')
    let localPath = null
    if (partType === 'avatar') {
      localFolder = localFolder + '/avatar/'
      if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localFolder, { recursive: true })
      }
      localPath = localFolder + fileId + image_suffix
    } else if (partType === 'chat') {
      let messageInfo = await selectChatMessagesByMessageId(fileId)
      const month = moment(Number.parseInt(messageInfo.sendTime)).format('YYYYMM')
      localFolder = localFolder + '/' + month
      if (!fs.existsSync(localFolder)) {
        //递归创建目录
        fs.mkdirSync(localFolder, { recursive: true })
      }
      let fileSuffix = messageInfo.fileName
      fileSuffix = fileSuffix.substring(fileSuffix.lastIndexOf('.'))
      localPath = localFolder + '/' + fileId + fileSuffix
    } else if (partType === 'tmp') {
      localFolder = localFolder + '/temp/'
      if (!fs.existsSync(localFolder)) {
        fs.mkdirSync(localFolder, { recursive: true })
      }
      localPath = localFolder + fileId
    }
    if (showCover) {
      localPath = localPath + cover_image_suffix
    }
    console.log('localPath: ', localPath)
    resolve(localPath)
  })
}

/**
 * 图片服务器
 */
let server = null
const startLocalServer = (serverPort) => {
  server = expressServer.listen(serverPort, () => {
    console.log('本地服务server start 在 localhost:' + serverPort)
  })
}
const closeLocalServer = () => {
  if (server) {
    server.close()
  }
}
const FILE_TYPE_CONTENT_TYPE = {
  0: 'image/',
  1: 'video/',
  2: 'application/octet-stream'
}
/**
 * get方法从端口
 */
//TODO sendP5
expressServer.get('/file', async (req, res) => {
  let { partType, fileType, fileId, showCover, forceGet } = req.query
  if (!partType || !fileId) {
    res.send('请求参数错误')
  }
  if (showCover === 'false') {
    showCover = false
  } else {
    showCover = showCover === undefined ? false : Boolean(showCover)
  }
  const localPath = await getLocalFilePath(partType, showCover, fileId)
  if (!fs.existsSync(localPath) || forceGet === 'true') {
    if (forceGet === 'true' && partType === 'avatar') {
      await downloadFile(fileId, true, localPath + cover_image_suffix, partType)
    }
    await downloadFile(fileId, showCover, localPath, partType)
  }
  const fileSuffix = localPath.substring(localPath.lastIndexOf('.') + 1)
  let contentType = FILE_TYPE_CONTENT_TYPE[fileType] + fileSuffix
  res.setHeader('Content-Type', contentType)
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (showCover || fileType !== '1') {
    fs.createReadStream(localPath).pipe(res)
    return
  }
  let stat = fs.statSync(localPath)
  let fileSize = stat.size
  let range = req.headers.range
  console.log(range, 'range')
  if (range) {
    let parts = range.replace(/bytes=/, '').split('-')
    let start = parseInt(parts[0], 10)
    let end = parts[1] ? parseInt(parts[1], 10) : start + 999999
    end = end > fileSize - 1 ? fileSize - 1 : end
    let chunkSize = end - start + 1
    let stream = fs.createReadStream(localPath, { start, end })
    let head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4'
    }
    res.writeHead(206, head)
    stream.pipe(res)
  } else {
    let head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    }
    res.writeHead(200, head)
    fs.createReadStream(localPath).pipe(res)
  }
})

//TODO 从服务器下载文件
const downloadFile = async (fileId, showCover, savePath, partType) => {
  showCover = showCover + ''
  let url = getDomainPath() + '/api/chat/downloadFile'
  const token = store.getUserData('token')
  return new Promise(async (resolve, reject) => {
    let formData = new FormData()
    formData.append('fileId', fileId)
    formData.append('showCover', showCover)
    const config = {
      responseType: 'stream',
      headers: {
        'Content-Type': 'multipart/form-data',
        token: token
      }
    }
    let response = await axios.post(url, formData, config)
    const folderPath = savePath.substring(0, savePath.lastIndexOf('/'))
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    const stream = fs.createWriteStream(savePath)
    console.log('我在响应中---------------\n', response.headers)
    if (response.headers['content-type'] === 'application/json') {
      let resourcePath = getResourcesPath()
      console.log('我从本地取了')
      if (partType === 'avatar') {
        fs.createReadStream(resourcePath + '/assets/default_avatar.png').pipe(stream)
      } else {
        fs.createReadStream(resourcePath + '/assets/404.png').pipe(stream)
      }
    } else {
      response.data.pipe(stream)
    }
    stream.on('finish', () => {
      stream.close()
      resolve()
    })
    stream.on('error', (err) => {
      console.log('牛处问ti1le')
      stream.close()
      reject(err)
    })
  })
}

/**
 * 创建头像的cover
 */
const createCover = (filePath) => {
  return new Promise(async (resolve, reject) => {
    let ffmpegPath = getFFmpegPath()
    let avatarPath = await getLocalFilePath('avatar', false, store.getUserId() + '_temp')
    let command = `"${ffmpegPath}" -i "${filePath}" "${avatarPath}" -y`
    await execCommand(command)
    let coverPath = await getLocalFilePath('avatar', false, store.getUserId() + '_temp_cover')
    command = `"${ffmpegPath}" -i "${filePath}" -y -vframes 1 -vf "scale=min(170\\, iw*min(170/iw\\,170/ih)):min(170\\, ih*min(170/iw\\,170/ih))" "${coverPath}"`
    await execCommand(command)
    resolve({ avatarStream: fs.readFileSync(avatarPath), coverStream: fs.readFileSync(coverPath) })
  })
}

/**
 * 保存文件
 */
const saveAs = async ({ partType, fileId }) => {
  let fileName = ''
  if (partType === 'avatar') {
    fileName = fileId + image_suffix
  } else if (partType === 'chat') {
    let messageInfo = await selectChatMessagesByMessageId(fileId)
    fileName = messageInfo.fileName
  }
  const localPath = await getLocalFilePath(partType, false, fileId)
  const options = {
    title: '保存文件',
    defaultPath: fileName
  }
  let result = await dialog.showSaveDialog(null, options)
  if (result.canceled || result.filePath === '') {
    return
  }
  const filePath = result.filePath
  fs.copyFileSync(localPath, filePath)
}

/**
 * 从剪切板复制文件到内存
 */
const saveClipBoardFile = async (file) => {
  const fileSuffix = file.name.substring(file.name.lastIndexOf('.'))

  const filePath = await getLocalFilePath('tmp', false, 'temp' + fileSuffix)
  console.log('fileSuffix', fileSuffix, '\nfilePath', filePath)
  let byteArray = file.byteArray
  const buffer = Buffer.from(byteArray)
  fs.writeFileSync(filePath, buffer)
  return {
    size: byteArray.length,
    name: file.name,
    path: filePath
  }
}

/**
 * 打开文件存储目录
 */
const openLocalFolder = async () => {
  let settingInfo = await selectSettingInfo()
  const sysSetting = JSON.parse(settingInfo.sysSetting)
  const localFileFolder = sysSetting.localFileFolder
  if (!fs.existsSync(localFileFolder)) {
    fs.mkdirSync(localFileFolder, { recursive: true })
  }
  shell.openPath('file:///' + localFileFolder + store.getUserId())
}

/**
 * 更改文件保存目录
 */
const changeLocalFolder = async () => {
  let settingInfo = await selectSettingInfo()
  const sysSetting = JSON.parse(settingInfo.sysSetting)
  let localFileFolder = sysSetting.localFileFolder
  const options = {
    properties: ['openDirectory'],
    defaultPath: localFileFolder
  }
  let result = await dialog.showOpenDialog(options)
  if (result.canceled) {
    return
  }
  const newFileFolderPath = result.filePaths[0]
  if (localFileFolder !== newFileFolderPath + '\\') {
    const userId = store.getUserId()
    getWindow('main').webContents.send('copyCallback')
    await fse.copySync(localFileFolder + '/' + userId, newFileFolderPath + '/' + userId)
    sysSetting.localFileFolder = newFileFolderPath + '\\'
    const newSysSetting = JSON.stringify(sysSetting)
    await updateSysSetting(newSysSetting)
    store.setUserData('localFileFolder', sysSetting.localFileFolder + store.getUserId())
    await getWindow('main').webContents.send('getSysSettingCallback', newSysSetting)
  }
}

/**
 * 下载更新 安装更新
 */
const downloadUpdate = async (id, fileName) => {
  let url = `${store.getData('prodDomain')}/api/app/downloadUpdate`
  const token = store.getUserData('token')
  const config = {
    responseType: 'stream',
    headers: {
      'Content-Type': 'multipart/form-data',
      token: token
    },
    onDownloadProgress(progress) {
      const loaded = progress.loaded
      getWindow('main').webContents.send('downloadUpdateCallback', loaded)
    }
  }
  const response = await axios.post(url, { id }, config)
  const localFile = await getLocalFilePath(null, false, fileName)
  const stream = fs.createWriteStream(localFile)
  response.data.pipe(stream)
  stream.on('finish', async () => {
    stream.close()
    const command = `"${localFile}"`
    execCommand(command)
  })
}
export {
  saveFileToLocal,
  startLocalServer,
  closeLocalServer,
  createCover,
  saveAs,
  saveClipBoardFile,
  openLocalFolder,
  changeLocalFolder,
  downloadUpdate
}
