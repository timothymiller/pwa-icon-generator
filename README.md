# 🐬 PWA Icon Generator

This is a simple node.js program to simplify converting original artwork to the numerous progressive web app icon formats.

pwa-icon-generator saves image output to the ```/icons/``` folder which can be dropped inside the ```/public/``` directory of my [full-stack-antd-next](https://github.com/timothymiller/full-stack-antd-next) template. Two steps to support favicons/PWA icons on all web client platforms from Windows 7 to iOS 14.

### 🖼️ Input

This program takes two square image files (jpg or png), one non-masked, the other masked. Read more about [maskable icons here](https://web.dev/maskable-icon/).

Place images inside the ```/convert/``` folder in the project root directory, then ```yarn && yarn start```

### 🎞️ Output

Images are saved inside the ```/icons/``` folder in the project root directory.


Technical information about the TypeScript stack is listed below:

TypeScript based stack for testing & production with the following features:

- Tree-shaking
- Deploy to Docker
- Instant reload in debug mode
- ESLint & Prettier support for Visual Studio Code out of the box

## 🎬 Getting Started

```yarn start```

Execute source code with nodemon for live reloading of code changes.

```yarn test```

Run all *.test.ts files in test/ directory.

```yarn build```

Export app to prod/app.ts after running tsc & rollup.

```yarn deploy```

Creates a minimal Docker image based on the output from yarn build

## 🍔 Tech Stack

- TypeScript
- ES6
- Node.js

## 🔨 Unit Testing

- Mocha
- Chai

## 🔩 Code Quality

- ESLint - Airbnb JavaScript Style Guide
- Rollup - CJS by default

## 🏃 Runtime

- Docker
- PM2
- Node.js

## 🛥️ External Ports

If you wanted to extend this template to create an API server, you would do so in your docker-compose file utilizing the output image from this template or when running from the command line like this:

```docker run -p <public_port>:<private_port> -d <image>```

## 🚓 License

This project is licensed under the GNU General Public License, version 3 (GPLv3) and is distributed free of charge.

## 👨‍💻 Author

Timothy Miller

[View my GitHub profile 💡](https://github.com/timothymiller)

[View my personal website 💻](https://timknowsbest.com)