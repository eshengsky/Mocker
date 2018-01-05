const Proxy = require('http-mitm-proxy');
const { app } = require('electron');
const path = require('path');

/**
 * 创建代理服务器
 * @param {*} mainWindow 
 */
module.exports = mainWindow => {
    function getFullUrl(request) {
        const secure = request.connection.encrypted || request.headers['x-forwarded-proto'] === 'https';
        return `http${secure ? 's' : ''}://${request.headers.host}${request.url}`;
    }

    const proxy = Proxy();

    proxy.onError((ctx, err, errorKind) => {
        let url = '[undefined]';
        if (ctx && ctx.clientToProxyRequest) {
            url = getFullUrl(ctx.clientToProxyRequest);
        }
        console.error(`${errorKind} on ${url}:`, err);
        mainWindow.webContents.send('log', {
            type: 'error',
            message: `${errorKind} on ${url}: ${err.message}`
        });
    });

    proxy.onRequest((ctx, callback) => {
        const req = ctx.clientToProxyRequest;
        const fullUrl = getFullUrl(req);
        console.log(`${req.method.toUpperCase()} ${fullUrl}`);
        mainWindow.webContents.send('log', {
            type: 'info',
            message: `${req.method.toUpperCase()} ${fullUrl}`
        });

        if (ctx.clientToProxyRequest.headers.host === '127.0.0.1:2018') {
            ctx.proxyToClientResponse.end('Mock Server is OK!');
            return;
        }

        // 判断是否能找到对应的配置
        const findOne = global.mockSettings.find(t => (fullUrl.indexOf(t.uri) >= 0)
            && (t.method === 'ALL' || (t.method.toUpperCase() === req.method.toUpperCase()))
            && (t.active === '1'));
        if (findOne) {
            // 触发了配置
            console.log('Trigger Rule:', findOne);
            mainWindow.webContents.send('log', {
                type: 'info',
                message: `触发规则：${JSON.stringify(findOne)}`
            });
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

    proxy.listen({ 
        port: 2018,
        sslCaDir: path.resolve(app.getPath('userData'), './SSL')
    }, err => {
        if (err) {
            require('electron').dialog.showErrorBox('错误', err.stack ? err.stack : err.message);
        }
    });
    return proxy;
}


