'use strict';
const path = require('path');
const fs = require('fs');
const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const i18n = require('i18n');
const localeArray = ['en-US', 'zh-CN', 'zh-TW'];
i18n.configure({
    locales: localeArray,
    directory: `${__dirname}/locales`,
    objectNotation: true
});
const log4js = require('log4js');
const logPath = path.resolve(app.getPath('userData'), 'log.log');
log4js.configure({
    appenders: {
        console: {
            type: 'console',
        },

        file: {
            type: 'file',
            filename: logPath,
            maxLogSize: 10 * 1024 * 1024,
            backups: 3,
            compress: true
        }
    },
    categories: {
        default: { 
            appenders: ['console', 'file'],
            level: 'debug'
        }
    }
});
const logger = log4js.getLogger();

const setMenu = require('./set_menu');
const createProxy = require('./proxy');
const registerProxy = require('./registry');

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const debug = /--debug/.test(process.argv[2]);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let proxy = null;
const settingsFilePath = path.resolve(app.getPath('userData'), 'settings.json');
const localeFilePath = path.resolve(app.getPath('userData'), 'locale.json');

// mock 设置，默认为空数组
global.mockSettings = [];

process.on('uncaughtException', err => {
    logger.error('[uncaughtException]', err);
});

process.on('unhandledRejection', err => {
    logger.error('[unhandledRejection]', err);
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
            width: 700,
            minWidth: 500,
            height: 840,
            center: true,
            icon: path.join(__dirname, `${process.platform === 'win32' ? '/static/image/mocker.ico' : '/static/image/mocker.png'}`),
            show: false,
            opacity: 0.95
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

    function getLocale() {
        // get locale from config if exists
        let locale;
        try {
            let data = fs.readFileSync(localeFilePath, 'utf8');
            data = JSON.parse(data);
            locale = data.locale;
        } catch (e) {

        }

        // then try get current env locale
        if (!locale) {
            locale = app.getLocale();
        }

        // if not in the 3 locales, return en-US
        if (localeArray.indexOf(locale) === -1) {
            locale = 'en-US';
        }
        return locale;
    }

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    app.on('ready', () => {
        // 设置语言
        const locale = getLocale();
        i18n.setLocale(locale);

        // 更新mock配置
        getLatestSettings().then(data => {
            global.mockSettings = data;
        });

        // 界面修改后，自动更新
        ipc.on('settingsModified', () => {
            getLatestSettings().then(data => {
                global.mockSettings = data;
            });
        });

        // 创建UI
        createWindow();

        // 设置菜单
        setMenu(i18n, locale);

        // 创建代理服务器
        proxy = createProxy(mainWindow);

        // 注册代理信息
        registerProxy();
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
        global.mockSettings = null;

        if (proxy) {
            proxy.close();
        }

        registerProxy(false).then(() => {
            app.exit();
        }).catch(err => {
            dialog.showErrorBox('Error:', err.message);
            app.exit();
        });
    });

    app.setAsDefaultProtocolClient('mocker');

    // 外部链接 mocker://xxx 打开，备用
    app.on('open-url', (event, url) => {
        dialog.showMessageBox('Welcome Back', `You arrived from: ${url}`);
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
