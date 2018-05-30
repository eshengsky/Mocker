<img src="https://github.com/eshengsky/Mocker/blob/master/static/image/mocker.png" height="120" align="right">

# Mocker

[English document](https://github.com/eshengsky/Mocker/blob/master/README.md)

HTTP/HTTPS 模拟响应工具，支持浏览器和本地服务器请求，可用来模拟接口返回，便于开发及测试。  
基于 [Node.js](https://nodejs.org) 和 [Electron](http://electron.atom.io/) 构建。

## 界面预览
![image](https://raw.githubusercontent.com/eshengsky/Mocker/master/static/image/preview_zh.png)

## 功能特色
* 基于代理服务器机制拦截并模拟响应
* 通常无需手动设置代理
* 无需修改代码中的请求链接即可模拟数据，不污染源码
* 支持浏览器和本地服务器的请求模拟
* 支持 HTTP 和 HTTPS 请求，自动生成本地 SSL 证书
* 完全自定义响应内容

## :gift: 应用下载
https://github.com/eshengsky/Mocker/releases

#### 注意
* 目前仅支持 Windows 平台
* 请确保你的 Windows 已安装 [PowerShell](https://www.microsoft.com/zh-cn/download/details.aspx?id=40855)（Win7 及以上版本系统通常已默认安装）
* 尽可能以管理员身份运行应用

## 本地调试

首先安装 [Node.js](https://nodejs.org/en/download/) 和 [NPM](https://www.npmjs.com/)。  

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

可以使用 [electron-packager](https://github.com/electron-userland/electron-packager) 对程序进行打包以分发应用。

#### 全局安装electron-packager
```shell
$ npm install -g electron-packager
```
#### 打包应用
在完成了 [本地调试](#本地调试) 操作的前提下，进入需要打包的应用的目录，执行：
```shell
$ npm run package
```

#### 注意事项
打包过程中 `electron-packager` 会自动下载所需的文件并存放到 `user/你的用户名/.electron` 中，自动下载可能会很慢，建议直接在 [Electron Release](https://github.com/electron/electron/releases) 使用下载工具进行下载并放到上述目录中。

## 常见问题
* 如何模拟 https 请求？  
首先点击 `Mocker` 菜单栏 `SSL` - `下载证书`，将安全证书下载保存到任意位置，再点击菜单栏 `SSL` - `打开证书管理器`，在弹出的界面中选择 `受信任的根证书颁发机构` - `证书`，右击选择 `所有任务` - `导入`，要导入的文件请选择你刚刚下载的证书，其他选项默认，完成导入。

* 如何模拟本地服务器（如 Node.js 服务器）发送的请求？  
`Mocker` 工具是基于代理服务器的，所以你只需要将对应的代理配置成 `http://127.0.0.1:28369` 或 `https://127.0.0.1:28369` 即可。以 Node.js 服务器为例，将启动脚本设置为 `set HTTP_PROXY=http://127.0.0.1:28369&&node ./bin/www` 。

* 关闭 Mocker 后我无法正常上网了。  
在正常情况下，`Mocker` 会在退出程序前自动将系统代理重置为空，但遇到一些特殊情况（如手动杀死进程、直接关机、程序异常等），系统代理可能不会自动重置，此时你需要手动进行设置，方式：打开 `IE` - `Internet 选项` - `连接` - `局域网设置`，取消勾选代理服务器。

* 我发现无法正常使用，或者有异常错误提示？  
尝试使用管理员身份运行软件（[链接](http://www.skysun.name/blog/os/set-default-to-run-as-administrator-in-windows)），如果问题依旧，请提 Issue。

## 许可协议
The MIT License (MIT)

Copyright (c) 2018 孙正华

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.