const electron = require('electron');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const Menu = electron.Menu;
const app = electron.app;
const dialog = electron.dialog;

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
            label: '下载证书',
            click() {
                dialog.showSaveDialog({
                    title: '保存SSL证书',
                    defaultPath: 'ca.pem'
                }, fileName => {
                    if (fileName) {
                        const caPath = path.join(__dirname, './\.http-mitm-proxy/certs/ca.pem');
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
                electron.shell.openExternal('https://github.com/eshengsky/Mock#常见问题');
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