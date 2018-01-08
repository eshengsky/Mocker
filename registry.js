const path = require('path');
const cp = require('child_process');
const log4js = require('log4js');
const logger = log4js.getLogger();

module.exports = (enable = true) => {
    return new Promise((resolve, reject) => {
        if (enable) {
            const enableProxyFile = path.join(__dirname, './powershell/enable_proxy.ps1');
            cp.exec(`powershell -ExecutionPolicy ByPass -File "${enableProxyFile}"`, err => {
                if (err) {
                    logger.error('启用代理出错：', err);
                    reject(err);
                } else {
                    logger.info('启用代理成功！');
                    resolve();
                }
            });
        } else {
            const disableProxyFile = path.join(__dirname, './powershell/disable_proxy.ps1');
            cp.exec(`powershell -ExecutionPolicy ByPass -File "${disableProxyFile}"`, err => {
                if (err) {
                    logger.error('关闭代理出错：', err);
                    reject(err);
                } else {
                    logger.info('关闭代理成功！');
                    resolve();
                }
            });
        }
    });
}