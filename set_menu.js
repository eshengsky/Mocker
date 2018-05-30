const electron = require('electron');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const Menu = electron.Menu;
const app = electron.app;
const dialog = electron.dialog;
const logPath = path.resolve(app.getPath('userData'), 'log.log');
const localeFilePath = path.resolve(app.getPath('userData'), 'locale.json');

function setLocale(locale) {
    try {
        let data = {};
        if (fs.existsSync(localeFilePath)) {
            data = fs.readFileSync(localeFilePath, 'utf8');
            data = JSON.parse(data);
        }
        data.locale = locale;
        fs.writeFileSync(localeFilePath, JSON.stringify(data, null, 4), 'utf8');
    } catch (e) {

    }
}

module.exports = (i18n, locale) => {
    const template = [{
        label: i18n.__('file'),
        submenu: [{
            label: i18n.__('new'),
            accelerator: 'CmdOrCtrl+N',
            click(item, focusedWindow) {
                // send to renderer
                focusedWindow.webContents.send('new', true);
            }
        }, {
            type: 'separator'
        }, {
            label: i18n.__('reload'),
            accelerator: 'CmdOrCtrl+R',
            click() {
                app.relaunch();
                app.quit();
            }
        }, {
            label: i18n.__('exit'),
            accelerator: 'CmdOrCtrl+W',
            click() {
                app.quit();
            }
        }]
    }, {
        label: i18n.__('edit'),
        submenu: [{
            label: i18n.__('copy'),
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        }, {
            label: i18n.__('cut'),
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        }, {
            label: i18n.__('paste'),
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        }, {
            label: i18n.__('select_all'),
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
        }]
    }, {
        label: 'Language',
        submenu: [{
            label: 'English',
            type: 'checkbox',
            checked: locale === 'en-US',
            click() {
                setLocale('en-US');
                app.relaunch();
                app.exit(0);
            }
        }, {
            label: '简体中文',
            type: 'checkbox',
            checked: locale === 'zh-CN',
            click() {
                setLocale('zh-CN');
                app.relaunch();
                app.exit(0);
            }
        }, {
            label: '繁體中文',
            type: 'checkbox',
            checked: locale === 'zh-TW',
            click() {
                setLocale('zh-TW');
                app.relaunch();
                app.exit(0);
            }
        }]
    }, {
        label: 'SSL',
        submenu: [{
            label: i18n.__('down_cert'),
            click() {
                dialog.showSaveDialog({
                    title: i18n.__('save_cert'),
                    defaultPath: path.join(app.getPath('desktop'), 'MockCA.pem'),
                    buttonLabel: i18n.__('save_cert'),
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
            label: i18n.__('open_cert'),
            click() {
                cp.exec('certmgr.msc');
            }
        }, {
            label: i18n.__('desc_cert'),
            click() {
                electron.shell.openExternal('https://github.com/eshengsky/Mocker#常见问题');
            }
        }]
    }, {
        label: i18n.__('window'),
        submenu: [{
            label: i18n.__('min'),
            role: 'minimize'
        }, {
            label: i18n.__('full_screen'),
            accelerator: 'F11',
            click(item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                }
            }
        }]
    }, {
        label: i18n.__('help'),
        submenu: [{
            label: `${i18n.__('version')} ${app.getVersion()}`,
            enabled: false
        }, {
            label: i18n.__('homepage'),
            click() {
                electron.shell.openExternal('https://github.com/eshengsky/Mocker');
            }
        }, {
            label: i18n.__('issue'),
            click() {
                electron.shell.openExternal('https://github.com/eshengsky/Mocker/issues');
            }
        }, {
            type: 'separator'
        }, {
            label: i18n.__('devtool'),
            accelerator: 'F12',
            role: 'toggledevtools'
        }, {
            label: i18n.__('show_log'),
            click() {
                electron.shell.openItem(logPath);
            }
        }, {
            type: 'separator'
        }, {
            label: i18n.__('checkupdate'),
            click(item, focusedWindow) {
                // send to renderer
                focusedWindow.webContents.send('update', true);
            }
        }, {
            type: 'separator'
        }, {
            label: i18n.__('about'),
            click() {
                electron.shell.openExternal('http://www.skysun.name/about');
            }
        }]
    }];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}