<img src="https://github.com/eshengsky/Mock/blob/master/static/image/mock.png" height="120" align="right">

# Mock

HTTP/HTTPS 模拟响应工具，支持浏览器和本地服务器请求，可用来模拟接口返回，提高开发及测试效率。  
基于 [Node.js](https://nodejs.org) 和 [Electron](http://electron.atom.io/) 构建。

## 界面预览
![image](https://raw.githubusercontent.com/eshengsky/Mock/master/static/image/preview.png)

## 功能特色
* 基于代理服务器机制并自动设置
* 无需修改现有代码中的请求链接，不污染源码
* 支持浏览器和本地服务器的请求
* 支持 HTTP 和 HTTPS 请求
* 可以完全自定义响应的内容

## 兼容性
目前仅支持 Windows 平台。

## :gift: [应用下载](https://github.com/eshengsky/Mock/releases)

## 快速开始
请先确保已成功安装 [Node.js](https://nodejs.org/en/download/) 和 [NPM](https://www.npmjs.com/)。  
#### 安装依赖包
```shell
$ npm install
```
#### 启动应用
```shell
$ npm start
```
如果想以 debug 模式启动应用，请使用
```shell
$ npm run dev
```
**Enjoy it!** :smile:

## 如何打包
可以使用 [electron-packager](https://github.com/electron-userland/electron-packager) 对程序进行打包以方便分发应用。
#### 全局安装electron-packager
```shell
$ npm install -g electron-packager
```
#### 打包应用
在完成了[快速开始](#快速开始)全部操作的前提下，进入需要打包的应用的目录，执行：
```shell
$ npm run package
```

#### 注意事项
打包过程中 electron-packager 会自动下载所需的文件并存放到 `user/你的用户名/.electron` 中，自动下载可能会很慢，建议直接在 [Electron Release](https://github.com/electron/electron/releases) 使用下载工具进行下载并放到上述目录中。

## 常见问题
* 除了浏览器端的请求，如何模拟本地服务器发送的请求？  
Mock 工具是基于代理服务器的，所以你只需要将对应的代理配置成 `http://127.0.0.1:2018` 或 `http://127.0.0.1:2018` 即可。以 Node.js 服务器为例，启动脚本改为 `set HTTP_PROXY=http://127.0.0.1:2018&&node ./bin/www` 。

* 为什么关闭 Mock 后，无法正常上网了？  
正常情况下，关闭软件之前 Mock 会将系统代理设置为空，如果你发现无法正常上网了，应该是系统代理没有取消，请手动设置，方式：打开 IE - Internet 选项 - 连接 - 局域网设置 - 取消勾选代理服务器。

## 许可协议
The MIT License (MIT)

Copyright (c) 2018 孙正华

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.