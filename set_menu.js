const electron = require('electron');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const Menu = electron.Menu;
const app = electron.app;
const dialog = electron.dialog;
const logPath = path.resolve(app.getPath('userData'), 'log.log');

module.exports = () => {
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
            type: 'separator'
        }, {
            label: '重新加载',
            accelerator: 'CmdOrCtrl+R',
            click() {
                app.relaunch();
                app.quit();
            }
        }, {
            label: '退出',
            accelerator: 'CmdOrCtrl+W',
            click() {
                app.quit();
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
        label: 'SSL',
        submenu: [{
            label: '下载证书...',
            click() {
                dialog.showSaveDialog({
                    title: '保存证书',
                    defaultPath: path.join(app.getPath('desktop'), 'MockCA.pem'),
                    buttonLabel: '保存证书',
                    filters: [{
                        name: 'pem',
                        extensions: ['pem']
                    }]
                }, fileName => {
                    if (fileName) {
                        const caPath = path.join(app.getPath('userData'), './SSL/certs/ca\.pem');
                        fs.createReadStream(caPath).pipe(fs.createWriteStream(fileName));
                    }
                });
            }
        }, {
            label: '打开证书管理器',
            click() {
                cp.exec('certmgr.msc');
            }
        }, {
            label: '安装说明',
            click() {
                electron.shell.openExternal('https://github.com/eshengsky/Mocker#常见问题');
            }
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
                electron.shell.openExternal('https://github.com/eshengsky/Mocker');
            }
        }, {
            label: '问题反馈',
            click() {
                electron.shell.openExternal('https://github.com/eshengsky/Mocker/issues');
            }
        }, {
            type: 'separator'
        }, {
            label: '切换开发人员工具',
            accelerator: 'F12',
            role: 'toggledevtools'
        }, {
            label: '查看调试日志',
            click() {
                electron.shell.openItem(logPath);
            }
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