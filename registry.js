const path = require('path');
const cp = require('child_process');

module.exports = (mainWindow, enable = true) => {
    return new Promise((resolve, reject) => {
        if (enable) {
            const enableProxyFile = path.join(__dirname, './powershell/enable_proxy.ps1');
            cp.exec(`powershell -ExecutionPolicy ByPass -File "${enableProxyFile}"`, (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    mainWindow.webContents.send('log', {
                        type: 'error',
                        message: `启用代理出错: ${err.message}`
                    });
                    reject(err);
                } else {
                    console.info('启用代理成功！');
                    mainWindow.webContents.send('log', {
                        type: 'info',
                        message: '启用代理成功！'
                    });
                    resolve();
                }
            });
        } else {
            const disableProxyFile = path.join(__dirname, './powershell/disable_proxy.ps1');
            cp.exec(`powershell -ExecutionPolicy ByPass -File "${disableProxyFile}"`, (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        }
    });
}