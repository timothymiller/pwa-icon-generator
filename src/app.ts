import Jimp from 'jimp';
import fs from 'fs';
const fsPromises = fs.promises;
import { createIco } from 'create-ico';
import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';

type IconSpec = {
  size: number;
  name: string;
};

class Icon {
  private iconPath = './icons/';
  private splashPath = './icons/splash/';
  // Theme defaults (light theme)
  private backgroundColor = '#ffffff';
  private appName = 'PWA Demo';
  private website = 'ant-design.preparesoftware.com';
  private primaryTextColor = '#ffffff';
  private secondaryTextColor = '#8C8C8C';
  private primaryColor = '#1765ad';

  constructor(private filePath: string) {
    this.filePath = filePath;
  }
  describe(this: Icon) {
    console.log('File path: ' + this.filePath);
  }

  async isSquare(this: Icon): Promise<boolean> {
    const image = await Jimp.read(this.filePath);
    return image.getWidth() === image.getHeight();
  }

  isMasked(this: Icon): boolean {
    return this.filePath.includes('masked');
  }

  async convertAll(this: Icon) {
    await Promise.all([
      this.convertApple(),
      this.convertGoogle(),
      this.convertMicrosoft(),
      this.generateSplashScreens(),
    ]);
  }

  async resize(designSpecs: IconSpec[]) {
    for (const spec of designSpecs) {
      const image = await Jimp.read(this.filePath);
      await image.resize(spec.size, spec.size).write(this.iconPath + spec.name);
    }
  }

  async convertApple(this: Icon) {
    if (!this.isMasked()) return;
    const designSpecs: IconSpec[] = [
      { size: 57, name: 'touch-icon-iphone.png' },
      { size: 76, name: 'touch-icon-ipad.png' },
      { size: 120, name: 'touch-icon-iphone-retina.png' },
      { size: 152, name: 'touch-icon-ipad-retina.png' },
      { size: 167, name: 'touch-icon-ipad-pro.png' },
      { size: 180, name: 'touch-icon-iphone-6-plus.png' },
    ];
    await this.resize(designSpecs);
  }

  async convertGoogle(this: Icon) {
    let designSpecs: IconSpec[] = [];
    if (this.isMasked()) {
      designSpecs = [
        { size: 192, name: 'maskable-icon-192x192.png' },
        { size: 512, name: 'maskable-icon-512x512.png' },
      ];
    } else {
      designSpecs = [
        { size: 16, name: 'favicon-16.png' },
        { size: 32, name: 'favicon-32.png' },
        { size: 48, name: 'favicon-48.png' },
        { size: 192, name: 'android-icon-192x192.png' },
        { size: 512, name: 'icon-512x512.png' },
      ];
    }
    await this.resize(designSpecs);
    await this.generateFavicon();
  }

  async convertMicrosoft(this: Icon) {
    if (!this.isMasked()) return;
    const designSpecs: IconSpec[] = [
      { size: 70, name: 'ms-icon-70x70.png' },
      { size: 144, name: 'ms-icon-144x144.png' },
      { size: 150, name: 'ms-icon-150x150.png' },
      { size: 310, name: 'ms-icon-310x310.png' },
    ];
    await this.resize(designSpecs);
    await this.generateBrowserConfig();
  }

  generateBrowserConfig = async (): Promise<void> => {
    const browserConfig =
      '<?xml version="1.0" encoding="utf-8"?>\n<browserconfig><msapplication><tile><square70x70logo src="/icons/ms-icon-70x70.png"/><square150x150logo src="/icons/ms-icon-150x150.png"/><square310x310logo src="/icons/ms-icon-310x310.png"/><TileColor>' +
      this.primaryColor +
      '</TileColor></tile></msapplication></browserconfig>';
    const browserConfigPath = './icons/browserconfig.xml';
    await fsPromises.writeFile(browserConfigPath, browserConfig);
  };

  generateFavicon = async (): Promise<void> => {
    const ico = await createIco(this.filePath, { sizes: [16, 32, 64, 256] });
    fs.writeFileSync(this.iconPath + 'favicon.ico', ico);
  };

  createSplashScreen = async (width: number, height: number) => {
    const canvas = createCanvas(width, height);
    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    context.fillStyle = this.backgroundColor;
    context.fillRect(0, 0, width, height);
    const text = this.appName;

    // Draw icon in center of screen
    const logoWidth = width * 0.4;
    const image = await loadImage(this.filePath);
    const x = width - width / 2 - logoWidth / 2;
    const y = height - height / 2 - logoWidth / 2;
    context.drawImage(image, x, y, logoWidth, logoWidth);

    // Draw background rectangle
    const logoFontSize = this.determineFontSize(context, width, text, 0.6);
    context.font = 'bold ' + logoFontSize + 'pt Menlo';
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillStyle = this.primaryColor;
    const textWidth = context.measureText(text).width;
    const textHeight = context.measureText('M').width;
    const boxX = width / 2 - textWidth / 2 - textWidth * 0.1;
    const boxY = height / 2 + (width * 0.4) / 2 + textHeight * 0.2;
    context.fillRect(
      boxX,
      boxY,
      textWidth + textWidth * 0.2,
      textHeight + textHeight * 0.2
    );

    // Draw app name centered inside rectangle
    context.fillStyle = this.primaryTextColor;
    context.fillText(text, width / 2, boxY);

    // Draw website name at bottom, centered horizontally
    context.fillStyle = this.secondaryTextColor;
    const fontSize = this.determineFontSize(context, width, this.website, 0.75);
    context.font = 'bold ' + fontSize + 'pt Menlo';
    const textX = width / 2;
    const textY = height - height * 0.06;
    context.fillText(this.website, textX, textY);

    // Write to disk
    const buffer = canvas.toBuffer('image/png');
    if (!fs.existsSync(this.splashPath)) {
      fs.mkdirSync(this.splashPath);
    }
    fs.writeFileSync(
      this.splashPath + 'launch-' + width + 'x' + height + '.png',
      buffer
    );
  };

  determineFontSize = (
    context: CanvasRenderingContext2D,
    screenWidth: number,
    text: string,
    minPercentWidth: number
  ): number => {
    let fontSize = 12;
    context.font = 'bold ' + fontSize + 'pt Menlo';
    while (context.measureText(text).width < screenWidth * minPercentWidth) {
      fontSize += 1;
      context.font = 'bold ' + fontSize + 'pt Menlo';
    }
    return fontSize;
  };

  generateSplashScreens = async () => {
    if (this.isMasked()) return;
    const sizes = [
      [640, 1136],
      [750, 1294],
      [1242, 2148],
      [1125, 2436],
      [1536, 2048],
      [1668, 2224],
      [2048, 2732],
    ];
    for (const size of sizes) {
      const width = size[0];
      const height = size[1];
      await this.createSplashScreen(width, height);
    }
  };
}

const main = async () => {
  const inputPath = './convert/';
  const fileNames = fs.readdirSync(inputPath);
  if (fileNames.length > 2) {
    throw 'Max 2 input files required.';
  }
  if (fileNames.length < 2) {
    throw 'Masked & Non-Masked icon files required.';
  }
  const icons: Icon[] = [];
  for (const fileName of fileNames) {
    const icon = new Icon(inputPath + fileName);
    if (await icon.isSquare()) {
      icons.push(icon);
    } else {
      throw icon.describe + ' width must equal height.';
    }
  }
  console.log('Generating icons...');
  for (const icon of icons) {
    await icon.convertAll();
  }
};

(async function () {
  await main();
})();
