const Proxy = require('http-mitm-proxy');
const { app } = require('electron');
const path = require('path');
const log4js = require('log4js');
const logger = log4js.getLogger();

/**
 * 创建代理服务器
 */
module.exports = () => {
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
        logger.error(`[PROXY] ${errorKind} on ${url}:`, err);
    });

    proxy.onRequest((ctx, callback) => {
        const req = ctx.clientToProxyRequest;
        const fullUrl = getFullUrl(req);
        logger.info(`[PROXY] ${req.method.toUpperCase()} ${fullUrl}`);

        if (ctx.clientToProxyRequest.headers.host === '127.0.0.1:28369') {
            ctx.proxyToClientResponse.end('Mock Server is OK!');
            return;
        }

        // 判断是否能找到对应的配置
        if (!global.mockSettings) {
            return;
        }
        const findOne = global.mockSettings.find(t => (decodeURIComponent(fullUrl).indexOf(decodeURIComponent(t.uri)) >= 0)
            && (t.method === 'ALL' || (t.method.toUpperCase() === req.method.toUpperCase()))
            && (t.active === '1'));
        if (findOne) {
            // 触发了配置
            logger.info('Match to rule:', findOne);
            const responseCode = findOne.code;
            const responseType = findOne.mime;
            const responseHeaders = findOne.headers;
            const responseBody = findOne.body;
            const responseDelay = findOne.delay;

            ctx.use(Proxy.gunzip);
            ctx.proxyToClientResponse.statusCode = responseCode;
            ctx.proxyToClientResponse.setHeader('Mock-Data', 'true');
            ctx.proxyToClientResponse.setHeader('Content-Type', responseType);
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
        port: 28369,
        sslCaDir: path.resolve(app.getPath('userData'), './SSL')
    }, err => {
        if (err) {
            require('electron').dialog.showErrorBox('Error:', err.stack ? err.stack : err.message);
        }
    });
    return proxy;
};
