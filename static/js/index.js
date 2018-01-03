const fs = require('fs');
const path = require('path');
const shortid = require('shortid');
const request = require('request');
const showdown = require('showdown');
const { remote, ipcRenderer, shell } = require('electron');
const app = remote.app;
const settingsFilePath = path.resolve(app.getPath('userData'), 'settings.json');

class Mock {
    constructor() {
        this.$btnNew = $('#btn-new');
        this.$tbBody = $('#table-body');
        this.$listPanel = $('.list-panel');
        this.$btnBack = $('.btn-back');
        this.$editPanel = $('.edit-panel');
        this.$logUl = $('.log-panel ul');
        this.$textUri = $('#text-uri');
        this.$formUri = $('#form-uri');
        this.$selectMethod = $('#select-method');
        this.$textStatus = $('#text-status');
        this.$selectStatus = $('#select-status');
        this.$textMime = $('#text-mime');
        this.$selectMime = $('#select-mime');
        this.$textHeader = $('#text-header');
        this.$selectMode = $('#select-mode');
        this.$textDelay = $('#text-delay');
        this.$btnSave = $('.btn-save');
        this.$uid = $('#uid');
        this.defaultEditorHeight = 150;
        swal.setDefaults({
            cancelButtonText: '取消',
            buttonsStyling: false,
            cancelButtonClass: 'btn btn-default',
            width: '400px'
        });
        this.init();
    }

    init() {
        this.initMockList();
        this.bindEvents();
    }

    uriFromPath(_path) {
        let pathName = path.resolve(_path).replace(/\\/g, '/');
        if (pathName.length > 0 && pathName.charAt(0) !== '/') {
            pathName = `/${pathName}`;
        }
        return encodeURI(`file://${pathName}`);
    }

    /**
     * 初始化列表
     */
    initMockList() {
        this.getSettings().then(data => {
            if (Array.isArray(data)) {
                let html = '';
                data.forEach(item => {
                    html +=
                        `<tr>
                        <td><input data-uid="${item.id}" type="checkbox" ${item.active === '1' ? 'checked' : ''}></td>
                        <td align="center"><span class="list-method">${item.method === 'ALL' ? '不限' : item.method}</span></td>
                        <td><span title="${item.uri}" class="list-uri">${item.uri}</span></td>
                        <td align="center"><button class="button button-primary button-borderless button-box button-small" title="修改" onclick="editMock('${item.id}');"><i class="fa fa-pencil"></i></button>
                        <button class="button button-caution button-borderless button-box button-small" title="删除" onclick="delMock('${item.id}');"><i class="fa fa-trash-o"></i></button></td>
                    </tr>`;
                });
                this.$tbBody.html(html);
                $("[type='checkbox']").bootstrapSwitch({
                    size: 'small',
                    onColor: 'success',
                    onText: '开',
                    offText: '关',
                    onSwitchChange: (event, state) => {
                        const active = state === true ? '1' : '0';
                        const uid = event.currentTarget.dataset.uid;
                        this.getSettings().then(data => {
                            const findOne = data.find(t => t.id === uid);
                            if (findOne) {
                                findOne.active = active;
                                fs.writeFile(settingsFilePath, JSON.stringify(data, null, 4), err => {
                                    if (err) {
                                        swal({
                                            title: '保存出错',
                                            text: err.message,
                                            cancelButtonText: '关闭',
                                            type: 'error'
                                        });
                                        return;
                                    }

                                    // 告诉主线程配置已改
                                    ipcRenderer.send('settingsModified', '');
                                });
                            }
                        });
                    }
                });
            }
        }).catch();
    }

    /**
     * 初始化编辑器
     */
    initEditor({ text, mode }) {
        amdRequire.config({
            baseUrl: this.uriFromPath(path.join(__dirname, './node_modules/monaco-editor/min'))
        });

        // workaround monaco-css not understanding the environment
        self.module = undefined;

        // workaround monaco-typescript not understanding the environment
        self.process.browser = true;
        amdRequire(['vs/editor/editor.main'], () => {
            if (!this.editor) {
                this.editor = monaco.editor.create(document.getElementById('text-body'), {
                    model: null,
                    scrollBeyondLastLine: false
                });
            }
            const newModel = monaco.editor.createModel(text, mode);
            this.editor.setModel(newModel);
            this.editor.layout();
        });
    }

    /**
     * 获取设置
     */
    getSettings() {
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

    /**
     * 保存详情设置
     */
    saveSettings() {
        if (!this.$textUri.val().trim()) {
            this.$formUri.addClass('has-error');
            window.scrollTo(0, 0);
            this.$textUri.focus();
            return;
        }

        const uid = this.$uid.val();
        const updateData = {
            id: uid,
            uri: this.$textUri.val().trim(),
            method: this.$selectMethod.selectlist('selectedItem').value,
            code: this.$selectStatus.combobox('selectedItem').text,
            mime: this.$selectMime.combobox('selectedItem').text,
            headers: this.$textHeader.val().trim(),
            mode: this.$selectMode.val(),
            body: this.editor.getValue(),
            delay: this.$textDelay.val().trim(),
            active: '1'
        };

        if (!uid) {
            // 新建
            const newUid = shortid.generate();
            updateData.id = newUid;
        }

        this.getSettings().then(data => {
            if (uid) {
                // 更新
                const findOne = data.find(t => t.id === uid);
                if (findOne) {
                    // id 和 active 不做更新
                    findOne.uri = updateData.uri;
                    findOne.method = updateData.method;
                    findOne.code = updateData.code;
                    findOne.mime = updateData.mime;
                    findOne.headers = updateData.headers;
                    findOne.mode = updateData.mode;
                    findOne.body = updateData.body;
                    findOne.delay = updateData.delay;
                }
            } else {
                // 新建
                data.unshift(updateData);
            }
            fs.writeFile(settingsFilePath, JSON.stringify(data, null, 4), err => {
                if (err) {
                    swal({
                        title: '保存出错',
                        text: err.message,
                        cancelButtonText: '关闭',
                        type: 'error'
                    });
                    return;
                }

                swal({
                    text: '保存成功',
                    type: 'success',
                    showConfirmButton: false,
                    timer: 800
                });

                // 如果保存成功，则对 id 重新赋值
                this.$uid.val(updateData.id);

                // 告诉主线程配置已改
                ipcRenderer.send('settingsModified', '');
            });
        }).catch(err => {
            swal({
                title: '保存出错',
                text: err.message,
                cancelButtonText: '关闭',
                type: 'error'
            });
        });
    }

    /**
     * 重置详情
     */
    resetMockDetails() {
        this.$uid.val('');
        this.$textUri.val('');
        this.$selectMethod.selectlist('selectByValue', 'ALL');
        this.$selectStatus.combobox('selectByValue', '200');
        this.$selectMime.combobox('selectByValue', 'application/json; charset=UTF-8');
        this.$textHeader.val('');
        this.$selectMode.val('json');
        this.initEditor({
            text: `{
"code": "1"
}`,
            mode: 'json'
        });
        this.$textDelay.val('0');
    }

    /**
     * 初始化详情
     * @param {string} [uid] - 唯一id，为空则来自新建
     */
    initMockDetails(uid) {
        this.$formUri.removeClass('has-error');
        if (!uid) {
            // 没有 uid，说明是新建
            this.resetMockDetails();
            this.$textUri.focus();
        } else {
            // 编辑
            this.getSettings().then(data => {
                const findOne = data.find(t => t.id === uid);
                this.$uid.val(findOne.id);
                this.$textUri.val(findOne.uri);
                this.$selectMethod.selectlist('selectByValue', findOne.method);
                this.$selectStatus.combobox('selectByValue', findOne.code);
                this.$selectMime.combobox('selectByValue', findOne.mime);
                this.$textHeader.val(findOne.headers);
                this.$selectMode.val(findOne.mode);
                this.initEditor({
                    text: findOne.body,
                    mode: findOne.mode
                });
                this.$textDelay.val(findOne.delay);
            });
        }
    }

    deleteMockItem(uid) {
        swal({
            text: '确定要删除该项吗？',
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-danger',
            confirmButtonColor: '#ff4351',
            confirmButtonText: '确定删除',
            showLoaderOnConfirm: true,
        }).then(result => {
            if (result.value) {
                this.getSettings().then(data => {
                    const index = data.findIndex(t => t.id === uid);
                    if (index >= 0) {
                        data.splice(index, 1);
                        fs.writeFile(settingsFilePath, JSON.stringify(data, null, 4), err => {
                            if (err) {
                                swal({
                                    title: '出错了',
                                    text: err.message,
                                    cancelButtonText: '关闭',
                                    type: 'error'
                                });
                                return;
                            }
                            this.initMockList();
                            swal({
                                text: '删除成功',
                                type: 'success',
                                showConfirmButton: false,
                                timer: 1500
                            });

                            // 告诉主线程配置已改
                            ipcRenderer.send('settingsModified', '');
                        });
                    }
                });
            }
        });
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        this.$btnNew.on('click', () => {
            this.$editPanel.show(0, () => {
                this.$editPanel.css('left', '0');
                setTimeout(() => {
                    this.initMockDetails();
                }, 500);
            });
        });

        window.editMock = uid => {
            this.$editPanel.show(0, () => {
                this.$editPanel.css('left', '0');
            });
            setTimeout(() => {
                this.initMockDetails(uid);
            }, 500);
        };

        window.delMock = uid => {
            this.deleteMockItem(uid);
        };

        window.onresize = () => {
            if (this.editor && this.$editPanel.is(':visible')) {
                this.editor.layout();
            }
        };

        this.$btnBack.on('click', () => {
            this.$editPanel.css('left', '101%');
            setTimeout(() => {
                this.$editPanel.hide();
                this.resetMockDetails();
            }, 500);
            this.initMockList();
        });

        this.$textStatus.on('blur', () => {
            // 如果没有填写或选中，则默认200
            if (!this.$selectStatus.combobox('selectedItem').text) {
                this.$selectStatus.combobox('selectByValue', '200');
            }
        });

        this.$textMime.on('blur', () => {
            // 如果没有填写或选中，则默认json
            if (!this.$selectMime.combobox('selectedItem').text) {
                this.$selectMime.combobox('selectByValue', 'application/json; charset=UTF-8');
            }
        });

        this.$textDelay.on('blur', () => {
            // 如果没有填写，则默认0
            if (!this.$textDelay.val().trim()) {
                this.$textDelay.val('0');
            }
        });

        this.$btnSave.on('click', () => {
            this.saveSettings();
        });

        this.$textUri.on('input', () => {
            if (this.$textUri.val().trim()) {
                this.$formUri.removeClass('has-error');
            }
        });

        this.$selectMode.on('change', () => {
            const text = this.editor.getValue();
            const mode = this.$selectMode.children('option:selected').val();
            this.initEditor({
                text,
                mode
            });
        });

        this.$selectMime.on('changed.fu.combobox', (event, data) => {
            const mime = data.text;
            switch (mime) {
                case 'application/json; charset=UTF-8':
                    this.$selectMode.val('json').change();
                    break;
                case 'text/html; charset=UTF-8':
                    this.$selectMode.val('html').change();
                    break;
                case 'application/javascript; charset=UTF-8':
                    this.$selectMode.val('javascript').change();
                    break;
                case 'text/css; charset=UTF-8':
                    this.$selectMode.val('css').change();
                    break;
                default:
                    this.$selectMode.val('plaintext').change();
            }
        });

        // Ctrl+S 保存修改
        $(window).on('keydown', event => {
            if (event.ctrlKey || event.metaKey) {
                if (String.fromCharCode(event.which).toLowerCase() === 's') {
                    event.preventDefault();
                    this.$btnSave.click();
                }
            }
        });

        // 菜单 - 新建
        ipcRenderer.on('new', () => {
            this.$btnNew.click();
        });

        // 菜单 - 检查更新
        ipcRenderer.on('update', () => {
            request({
                url: 'https://api.github.com/repos/eshengsky/Mock/releases',
                timeout: 3000,
                headers: {
                    'User-Agent': 'Mozilla'
                }
            }, (err, response, body) => {
                if (err) {
                    swal({
                        title: '检查更新失败',
                        text: err.message,
                        cancelButtonText: '关闭',
                        type: 'error'
                    });
                    return;
                }
                const data = JSON.parse(body);
                const current = Number(app.getVersion().replace(/\./g, ''));
                const versionStr = data[0].tag_name;
                const name = data[0].name;
                const version = Number(versionStr.replace('v', '').replace(/\./g, ''));
                if (version > current) {
                    // 有更新版本
                    let changelog = data[0].body;
                    const converter = new showdown.Converter();
                    changelog = converter.makeHtml(changelog);

                    swal({
                        title: '发现新版本',
                        html: `<div class="changelog"><p>${name}</p>${changelog}</div>`,
                        showCancelButton: true,
                        confirmButtonClass: 'btn btn-success',
                        confirmButtonText: '立即下载',
                        cancelButtonText: '取消',
                        type: 'info'
                    }, () => {
                        const assets = data[0].assets;
                        const download = assets.find(t => t.name.includes('.exe')).browser_download_url;
                        shell.openExternal(download);
                    });
                } else {
                    // 没有更新版本
                    swal({
                        title: '没有更新',
                        text: `你已是最新版本 v${app.getVersion()}`,
                        type: 'success',
                        showConfirmButton: false,
                        timer: 2500
                    });
                }
            });
        });

        ipcRenderer.on('log', (event, { type, message }) => {
            this.$logUl.append(`<li class="${type}">${message}</li>`);
        });
    }
}

new Mock();
