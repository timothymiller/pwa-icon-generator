import Jimp from 'jimp'
import fs from 'fs'
const fsPromises = fs.promises
import { createIco } from 'create-ico'
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas'

type IconSpec = {
  size: number
  name: string
}

class Icon {
  private iconPath = '' + process.env.APP_DATA_PATH + '/icons/'
  private splashPath = '' + process.env.APP_DATA_PATH + '/splash/'
  private backgroundColor = '' + process.env.BACKGROUND_COLOR
  private appName = '' + process.env.APP_NAME
  private website = '' + process.env.WEBSITE
  private primaryTextColor = '' + process.env.PRIMARY_TEXT_COLOR
  private secondaryTextColor = '' + process.env.SECONDARY_TEXT_COLOR
  private primaryColor = '' + process.env.PRIMARY_COLOR

  constructor(private filePath: string) {
    this.filePath = filePath
  }
  describe(this: Icon): void {
    console.log('File path: ' + this.filePath)
  }

  async isSquare(this: Icon): Promise<boolean> {
    const image = await Jimp.read(this.filePath)
    return image.getWidth() === image.getHeight()
  }

  isMasked(this: Icon): boolean {
    return this.filePath.includes('masked')
  }

  async convertAll(this: Icon): Promise<void> {
    await Promise.all([
      this.convertApple(),
      this.convertGoogle(),
      this.convertMicrosoft(),
      this.generateSplashScreens(),
    ])
  }

  async resize(designSpecs: IconSpec[]): Promise<void> {
    for (const spec of designSpecs) {
      const image = await Jimp.read(this.filePath)
      await image.resize(spec.size, spec.size).write(this.iconPath + spec.name)
    }
  }

  async convertApple(this: Icon): Promise<void> {
    if (!this.isMasked()) return
    const designSpecs: IconSpec[] = [
      { size: 57, name: 'touch-icon-iphone.png' },
      { size: 76, name: 'touch-icon-ipad.png' },
      { size: 120, name: 'touch-icon-iphone-retina.png' },
      { size: 152, name: 'touch-icon-ipad-retina.png' },
      { size: 167, name: 'touch-icon-ipad-pro.png' },
      { size: 180, name: 'touch-icon-iphone-6-plus.png' },
    ]
    await this.resize(designSpecs)
  }

  async convertGoogle(this: Icon): Promise<void> {
    let designSpecs: IconSpec[] = []
    if (this.isMasked()) {
      designSpecs = [
        { size: 192, name: 'maskable-icon-192x192.png' },
        { size: 512, name: 'maskable-icon-512x512.png' },
      ]
    } else {
      designSpecs = [
        { size: 16, name: 'favicon-16.png' },
        { size: 32, name: 'favicon-32.png' },
        { size: 48, name: 'favicon-48.png' },
        { size: 128, name: 'android-icon-128x128.png' },
        { size: 192, name: 'android-icon-192x192.png' },
        { size: 512, name: 'icon-512x512.png' },
      ]
    }
    await this.resize(designSpecs)
    await this.generateFavicon()
  }

  async convertMicrosoft(this: Icon): Promise<void> {
    if (!this.isMasked()) return
    const designSpecs: IconSpec[] = [
      { size: 70, name: 'ms-icon-70x70.png' },
      { size: 144, name: 'ms-icon-144x144.png' },
      { size: 150, name: 'ms-icon-150x150.png' },
      { size: 310, name: 'ms-icon-310x310.png' },
    ]
    await this.resize(designSpecs)
    await this.generateBrowserConfig()
  }

  generateBrowserConfig = async (): Promise<void> => {
    const browserConfig =
      '<?xml version="1.0" encoding="utf-8"?>\n<browserconfig><msapplication><tile><square70x70logo src="/icons/ms-icon-70x70.png"/><square150x150logo src="/icons/ms-icon-150x150.png"/><square310x310logo src="/icons/ms-icon-310x310.png"/><TileColor>' +
      this.primaryColor +
      '</TileColor></tile></msapplication></browserconfig>'
    const browserConfigPath = './icons/browserconfig.xml'
    await fsPromises.writeFile(browserConfigPath, browserConfig)
  }

  generateFavicon = async (): Promise<void> => {
    if (this.isMasked()) return
    const ico = await createIco(this.filePath, { sizes: [16, 32, 64, 256] })
    fs.writeFileSync(this.iconPath + 'favicon.ico', ico)
  }

  createSplashScreen = async (width: number, height: number): Promise<void> => {
    // Different dimensions for portrait vs. landscape
    let shortestSide
    let percentBoxWidth
    let percentWebsiteWidth
    if (width >= height) {
      shortestSide = height
      percentBoxWidth = 0.3
      percentWebsiteWidth = 0.4
    } else {
      shortestSide = width
      percentBoxWidth = 0.6
      percentWebsiteWidth = 0.75
    }
    const canvas = createCanvas(width, height)
    const context: CanvasRenderingContext2D = canvas.getContext('2d')
    context.fillStyle = this.backgroundColor
    context.fillRect(0, 0, width, height)
    const text = this.appName

    // Draw icon in center of screen
    const logoWidth = shortestSide * 0.4
    const image = await loadImage(this.filePath)
    const x = width - width / 2 - logoWidth / 2
    const y = height - height / 2 - logoWidth / 2
    context.drawImage(image, x, y, logoWidth, logoWidth)

    // Draw background rectangle
    const logoFontSize = this.determineFontSize(context, width, text, percentBoxWidth)
    context.font = 'bold ' + logoFontSize + 'pt Menlo'
    context.textAlign = 'center'
    context.textBaseline = 'top'
    context.fillStyle = this.primaryColor
    const textWidth = context.measureText(text).width
    const textHeight = context.measureText('M').width
    const boxX = width / 2 - textWidth / 2 - textWidth * 0.1
    const boxY = height / 2 + (shortestSide * 0.4) / 2 + textHeight * 0.2
    context.fillRect(boxX, boxY, textWidth + textWidth * 0.2, textHeight + textHeight * 0.2)

    // Draw app name centered inside rectangle
    context.fillStyle = this.primaryTextColor
    context.fillText(text, width / 2, boxY)

    // Draw website name at bottom, centered horizontally
    context.fillStyle = this.secondaryTextColor
    const fontSize = this.determineFontSize(context, width, this.website, percentWebsiteWidth)
    context.font = 'bold ' + fontSize + 'pt Menlo'
    const textX = width / 2
    const textY = height - shortestSide * 0.12
    context.fillText(this.website, textX, textY)

    // Write to disk
    const buffer = canvas.toBuffer('image/png')
    if (!fs.existsSync(this.splashPath)) {
      fs.mkdirSync(this.splashPath)
    }
    fs.writeFileSync(this.splashPath + 'launch-' + width + 'x' + height + '.png', buffer)
  }

  determineFontSize = (
    context: CanvasRenderingContext2D,
    screenWidth: number,
    text: string,
    minPercentWidth: number
  ): number => {
    let fontSize = 12
    context.font = 'bold ' + fontSize + 'pt Menlo'
    while (context.measureText(text).width < screenWidth * minPercentWidth) {
      fontSize += 1
      context.font = 'bold ' + fontSize + 'pt Menlo'
    }
    return fontSize
  }

  generateSplashScreens = async (): Promise<void> => {
    if (this.isMasked()) return
    const sizes = [
      [640, 1136],
      [1125, 2436],
      [1536, 2048],
      [1668, 2224],
      [2048, 2732],
      [2048, 1536],
      [1668, 2388],
      [2388, 1668],
      [750, 1334],
      [2224, 1668],
      [2688, 1242],
      [2732, 2048],
      [1242, 2208],
      [2208, 1242],
      [1242, 2688],
      [1334, 750],
      [828, 1792],
      [1792, 828],
      [2436, 1125],
      [1136, 640],
    ]
    for (const size of sizes) {
      const width = size[0]
      const height = size[1]
      await this.createSplashScreen(width, height)
    }
  }
}

export { Icon, IconSpec }
