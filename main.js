'use strict';
const path = require('path');
const fs = require('fs');
const wincmd = require('node-windows');
const electron = require('electron');
const Proxy = require('http-mitm-proxy');
const regedit = require('regedit');
const cp = require('child_process');
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const Menu = electron.Menu;

/**
 * 代理服务器接口
 */
const proxyServerPort = 2017;

// Module to control application life.
const app = electron.app;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const debug = /--debug/.test(process.argv[2]);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
const settingsFilePath = path.resolve(app.getPath('userData'), 'settings.json');

// mock 设置，默认为空数组
let mockSettings = [];

process.on('uncaughtException', err => {
    console.error(err);
});

function initialize() {
    const shouldQuit = makeSingleInstance();
    if (shouldQuit) {
        return app.exit(0);
    }

    /**
     * 获取最新配置
     */
    function getLatestSettings() {
        return new Promise((resolve, reject) => {
            fs.readFile(settingsFilePath, (err, buffer) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // 如果文件不存在，不认为是异常，返回空数组
                        resolve([]);
                    } else {
                        // 其他错误
                        reject(err);
                    }
                } else {
                    try {
                        const data = JSON.parse(buffer.toString());
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }

    function createWindow() {
        const windowOptions = {
            width: 680,
            minWidth: 450,
            height: 840,
            icon: path.join(__dirname, `${process.platform === 'win32' ? '/static/image/mock.ico' : '/static/image/mock.png'}`),
            show: false
        };

        // Create the browser window.
        mainWindow = new BrowserWindow(windowOptions);

        // and load the index.html of the app.
        mainWindow.loadURL(path.join('file://', __dirname, '/index.html'));

        if (debug) {
            mainWindow.webContents.openDevTools();
            mainWindow.maximize();
        }

        mainWindow.once('ready-to-show', () => {
            mainWindow.show();
        });

        // Emitted when the window is closed.
        mainWindow.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null;
        });
    }

    function setMenu() {
        // Menus
        const template = [{
            label: '文件',
            submenu: [{
                label: '新建',
                accelerator: 'CmdOrCtrl+N',
                click(item, focusedWindow) {
                    // send to renderer
                    focusedWindow.webContents.send('new', true);
                }
            }, {
                label: '退出',
                accelerator: 'CmdOrCtrl+W',
                click() {
                    app.exit(0);
                }
            }]
        }, {
            label: '编辑',
            submenu: [{
                label: '复制',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            }, {
                label: '剪切',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            }, {
                label: '粘贴',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            }, {
                label: '全选',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall'
            }]
        }, {
            label: '窗口',
            submenu: [{
                label: '最小化',
                role: 'minimize'
            }, {
                label: '全屏模式',
                accelerator: 'F11',
                click(item, focusedWindow) {
                    if (focusedWindow) {
                        focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                    }
                }
            }]
        }, {
            label: '帮助',
            submenu: [{
                label: `版本 ${app.getVersion()}`,
                enabled: false
            }, {
                label: '项目主页',
                click() {
                    electron.shell.openExternal('https://github.com/eshengsky/Mock');
                }
            }, {
                label: '问题反馈',
                click() {
                    electron.shell.openExternal('https://github.com/eshengsky/Mock/issues');
                }
            }, {
                type: 'separator'
            }, {
                label: '切换开发人员工具',
                accelerator: 'F12',
                role: 'toggledevtools'
            }, {
                type: 'separator'
            }, {
                label: '检查更新...',
                click(item, focusedWindow) {
                    // send to renderer
                    focusedWindow.webContents.send('update', true);
                }
            }, {
                type: 'separator'
            }, {
                label: '关于作者',
                click() {
                    electron.shell.openExternal('http://www.skysun.name/about');
                }
            }]
        }];
        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    function getFullUrl(request) {
        const secure = request.connection.encrypted || request.headers['x-forwarded-proto'] === 'https';
        return `http${secure ? 's' : ''}://${request.headers.host}${request.url}`;
    }

    /**
     * 创建代理服务器
     */
    function createProxy() {
        const proxy = Proxy();

        proxy.onError((ctx, err, errorKind) => {
            let url = '[undefined]';
            if (ctx && ctx.clientToProxyRequest) {
                url = getFullUrl(ctx.clientToProxyRequest);
            }
            console.error(`${errorKind} on ${url}:`, err);
        });

        proxy.onRequest((ctx, callback) => {
            const req = ctx.clientToProxyRequest;
            const fullUrl = getFullUrl(req);
            console.log(`${req.method.toUpperCase()} ${fullUrl}`);
            const findOne = mockSettings.find(t => (fullUrl.indexOf(t.uri) >= 0)
                && (t.method === 'ALL' || (t.method.toUpperCase() === req.method.toUpperCase()))
                && (t.active === '1'));
            if (findOne) {
                // 触发规则
                console.log('Trigger Rule:', findOne);
                const responseCode = findOne.code;
                const responseType = findOne.mime;
                const responseHeaders = findOne.headers;
                const responseBody = findOne.body;
                const responseDelay = findOne.delay;

                ctx.use(Proxy.gunzip);
                ctx.proxyToClientResponse.statusCode = responseCode;
                ctx.proxyToClientResponse.setHeader('mock-data', 'true');
                ctx.proxyToClientResponse.setHeader('content-type', responseType);
                if (responseHeaders) {
                    const headerArr = responseHeaders.split('\n');
                    headerArr.forEach(item => {
                        const header = item.split(':');
                        let key = header[0];
                        let value = header[1];
                        if (key != null) {
                            key = key.trim();
                            if (key) {
                                value = value ? value.trim() : '';
                                ctx.proxyToClientResponse.setHeader(key, value);
                            }
                        }
                    });
                }
                setTimeout(() => {
                    ctx.proxyToClientResponse.end(new Buffer(responseBody));
                }, responseDelay);
                return;
            }
            ctx.proxyToServerRequestOptions.rejectUnauthorized = false;
            callback();
        });

        proxy.listen({ port: proxyServerPort });
    }

    /**
     * 重启文件系统（使得注册表修改立即生效）
     */
    function restartExplorer() {
        cp.exec('taskkill /f /im explorer.exe&start explorer.exe', (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    }

    /**
     * 注册代理信息
     * @param {*} enable 是否开启代理
     */
    function registerProxy(enable = true) {
        let config;
        if (enable) {
            config = {
                ProxyServer: {
                    value: `http=127.0.0.1:${proxyServerPort};https=127.0.0.1:${proxyServerPort};`,
                    type: 'REG_SZ'
                },
                ProxyOverride: {
                    value: '',
                    type: 'REG_SZ'
                },
                ProxyEnable: {
                    value: 1,
                    type: 'REG_DWORD'
                }
            };
        } else {
            config = {
                ProxyEnable: {
                    value: 0,
                    type: 'REG_DWORD'
                }
            };
        }
        regedit.putValue({
            'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Internet Settings': config
        }, () => {
            console.log('registerProxy 注册代理信息完成！');
            restartExplorer();
        }, err => {
            console.error('registerProxy 注册代理信息出错！', err);
        });
    }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    app.on('ready', () => {
        // 检查是否是管理员用户
        wincmd.isAdminUser(isAdmin => {
            if (!isAdmin) {
                dialog.showErrorBox('错误', '请使用Windows管理员身份运行！');
                app.exit();
                return;
            }

            // 更新mock配置
            getLatestSettings().then(data => {
                mockSettings = data;
            });

            // 界面修改后，自动更新
            ipc.on('settingsModified', () => {
                getLatestSettings().then(data => {
                    mockSettings = data;
                });
            });

            // 创建UI
            createWindow();

            // 设置菜单
            setMenu();

            // 创建代理服务器
            createProxy();

            // 注册代理信息
            registerProxy();
        });
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        } else {
            mainWindow.show();
        }
    });

    app.on('before-quit', e => {
        e.preventDefault();
        registerProxy(false);

        // 5秒后真正退出程序
        setTimeout(() => {
            app.exit();
        }, 5000);
        app.isQuiting = true;
    });
}

function makeSingleInstance() {
    return app.makeSingleInstance(() => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

initialize();
