import fs from 'fs'
import { Icon } from './icon'
require('dotenv').config()

const main = async () => {
  const inputPath = process.env.APP_DATA_PATH + '/convert/'
  const fileNames = fs.readdirSync(inputPath)
  if (fileNames.length > 2) {
    throw 'Max 2 input files required.'
  }
  if (fileNames.length < 2) {
    throw 'Masked & Non-Masked icon files required.'
  }
  const icons: Icon[] = []
  for (const fileName of fileNames) {
    const icon = new Icon(inputPath + fileName)
    if (await icon.isSquare()) {
      icons.push(icon)
    } else {
      throw icon.describe + ' width must equal height.'
    }
  }
  console.log('Generating icons...')
  for (const icon of icons) {
    await icon.convertAll()
  }
  console.log('Done!')
}

;(async function () {
  await main()
})()
