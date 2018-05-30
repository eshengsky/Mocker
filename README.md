<img src="https://github.com/eshengsky/Mocker/blob/master/static/image/mocker.png" height="120" align="right">

# Mocker

[中文文档](https://github.com/eshengsky/Mocker/blob/master/README_zh.md)

HTTP/HTTPS mock tool, supports browsers and local server requests, can be used to mock response data returns and facilitate development and testing.  
Based on [Node.js](https://nodejs.org) and [Electron](http://electron.atom.io/).

## Preview
![image](https://raw.githubusercontent.com/eshengsky/Mocker/master/static/image/preview.png)

## Features
* Intercepting and simulating response based on proxy server mechanism.
* Normally no need to manually set proxy.
* You can mock data without modifying the request link in your code, do not pollute the source code.
* Mock data support requests from browsers and local servers.
* Support HTTP and HTTPS requests, automatically generate local SSL certificates.
* Fully custom response content.

## :gift: Download
https://github.com/eshengsky/Mocker/releases

#### Note
* Currently only support Windows platform.
* Please make sure that your Windows has been installed [PowerShell](https://www.microsoft.com/zh-cn/download/details.aspx?id=40855) (Win7+ systems are usually installed by default).
* Run Mocker as administrator as possible.

## Quick Start

Firstly install [Node.js](https://nodejs.org/en/download/) and [NPM](https://www.npmjs.com/).  

#### install dependencies
```shell
$ npm install
```
#### lauch app
```shell
$ npm start
```
If you want to lauch the application in debug mode, use:
```shell
$ npm run dev
```
**Enjoy it!** :smile:

## How to package

You can use [electron-packager](https://github.com/electron-userland/electron-packager) to package the program to distribute the app.

#### install electron-packager
```shell
$ npm install -g electron-packager
```
#### package app
After complete [Quick Start](#quick-start), go into the directory which app you want to package, execute:
```shell
$ npm run package
```

#### Note

In the packing process, `electron-packager` will automatically download the required files and store it in `user/yourname/.electron`, automatic downloading may be slow, it is recommended that use download tool to download the files in [Electron Release](https://github.com/electron/electron/releases) then put in the above directory.

## FAQ
* How to mock https response?  
Click `Mocker` menu bar `SSL` - `Download certificate...`, save the SSL certificate to any location, then click `SSL` - `Open certmgr`, choose `Trusted root certification authority` - `certificate`, right click and choose `all tasks` - `import`, select the certificate you just downloaded, and the other options default, complete the import.

* How to mock data sent by local servers (such as Node.js server)?  
`Mocker` is based on proxy servers, so you only need to set agent as `http://127.0.0.1:28369` or `https://127.0.0.1:28369`. Take Node.js server as an example, use `set HTTP_PROXY=http://127.0.0.1:28369&&node ./bin/www`.

* I can't get to the Internet after close Mocker.  
In normal circumstances, `Mocker` will automatically reset the system agent to empty before exiting the program, but in some special cases (such as manually killing process, direct shutdown, program exception, etc.), the system agent may not automatically reset, you need to manually set it, square: open the `IE` - `Internet option ` - ` Connection ` - ` LAN settings `, uncheck the proxy server.

* I can't use it correctly, or did I have an unusual error.  
Try to run app as administrator, if still not working, please submit Issue.

## License
The MIT License (MIT)

Copyright (c) 2018 Sky

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.