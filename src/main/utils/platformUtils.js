import path from 'path'
import os from 'os'
import fs from 'fs'

// 获取适合当前平台的应用数据目录
export function getAppDataPath() {
  switch (process.platform) {
    case 'win32':
      return path.join(os.homedir(), '.weTalk')
    case 'linux':
      return path.join(os.homedir(), '.config', 'weTalk')
    case 'darwin': // macOS
      return path.join(os.homedir(), 'Library', 'Application Support', 'weTalk')
    default:
      return path.join(os.homedir(), '.weTalk')
  }
}

// 确保应用目录结构存在
export function ensureAppDirectories() {
  const appDataPath = getAppDataPath()
  const directories = [
    path.join(appDataPath, 'fileStorage'),
    path.join(appDataPath, 'temp'),
    path.join(appDataPath, 'avatar')
  ]

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })

  return appDataPath
}
