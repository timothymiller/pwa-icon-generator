import Jimp from 'jimp';
import fs from 'fs';

type IconSpec = {
  size: number;
  name: string;
};

class Icon {
  private outputPath = './icon/';
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
    ]);
  }

  async resize(designSpecs: IconSpec[]) {
    for (const spec of designSpecs) {
      const image = await Jimp.read(this.filePath);
      await image
        .resize(spec.size, spec.size)
        .write(this.outputPath + spec.name);
    }
  }

  async convertApple(this: Icon) {
    if (!this.isMasked()) return;
    const designSpecs: IconSpec[] = [
      { size: 57, name: 'touch-icon-iphone.jpg' },
      { size: 76, name: 'touch-icon-ipad.jpg' },
      { size: 120, name: 'touch-icon-iphone-retina.jpg' },
      { size: 152, name: 'touch-icon-ipad-retina.jpg' },
      { size: 167, name: 'touch-icon-ipad-pro.jpg' },
      { size: 180, name: 'touch-icon-iphone-6-plus.jpg' },
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
  }
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
  for (const icon of icons) {
    icon.describe();
    await icon.convertAll();
  }
};

(async function () {
  await main();
})();
