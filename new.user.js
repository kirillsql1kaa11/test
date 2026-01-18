// ==UserScript==
// @name         ITD Extended Client - test
// @version      1.4.7
// @description  Разделение модулей на категории
// @author       l1kaa11
// @match        https://xn--d1ah4a.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// @namespace    https://github.com/kirillsql1kaa11/test
// @updateURL    https://github.com/kirillsql1kaa11/test/raw/refs/heads/main/new.user.js
// @downloadURL  https://github.com/kirillsql1kaa11/test/raw/refs/heads/main/new.user.js
// ==/UserScript==

(function() {
    'use strict';

    const defaultModules = [
        { id: 'fresh', name: 'ITD Свежак', auth: '@l1ka11', desc: 'Автоматически скрывает посты, опубликованные более 24 часов назад.', url: 'https://raw.githubusercontent.com/kirillsql1kaa11/ITD-Extended-Client/main/modules/itdfresh.txt' },
        { id: 'zoom', name: 'ITD Приближение', auth: '@l1kaa11', desc: 'Позволяет увеличивать изображения при нажатии и прокрутке колесиком.', url: 'https://raw.githubusercontent.com/kirillsql1kaa11/ITD-Extended-Client/main/modules/itdscrollphoto.txt' },
        { id: 'counter', name: 'ITD Счетчик', auth: '@l1kaa11', desc: 'Отображает точное количество загруженных постов в текущей ленте.', url: 'https://raw.githubusercontent.com/kirillsql1kaa11/ITD-Extended-Client/main/modules/itdpostcounter.txt' },
        { id: 'backgrounds', name: 'ITD Фоны', auth: '@l1kaa11', desc: 'Применяет кастомные задние планы и анимированные GIF-фоны.', url: 'https://raw.githubusercontent.com/kirillsql1kaa11/ITD-Extended-Client/main/modules/ITDbackground.txt' },
        { id: 'profilesear', name: 'Profile Search', auth: '@dmitrii_gr (#дым)', desc: 'Добавляет возможность поиска в профиле', url: 'https://raw.githubusercontent.com/Dima-programmer/ITD_EXTENDED_MY_SCRIPTS/main/Profile%20Search.txt' },
        { id: 'suggestion', name: 'Скрыть не нужное', auth: '@dmitrii_gr (#дым)', desc: 'Скрывает "Кого читать" и "Топ кланов"', url: 'https://raw.githubusercontent.com/Dima-programmer/ITD_EXTENDED_MY_SCRIPTS/main/HideBars.txt' }
    ];

    let customModules = GM_getValue('custom_modules_v2', []);

    GM_addStyle(`
        #itd-gui .gui-body::-webkit-scrollbar { width: 4px; }
        #itd-gui .gui-body::-webkit-scrollbar-track { background: transparent; }
        #itd-gui .gui-body::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        #itd-gui { position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: #08080a; border: 1px solid #222; border-radius: 30px; z-index: 999998; display: none; color: white; flex-direction: column; overflow: hidden; box-shadow: 0 0 150px rgba(0,0,0,0.9); font-family: system-ui, sans-serif; }
        .gui-head { padding: 25px 35px; background: #111114; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .gui-body { flex: 1; padding: 30px; overflow-y: auto; scrollbar-width: thin; }
        
        .section-title { width: 100%; padding: 15px 0 10px 0; margin-bottom: 20px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #555; border-bottom: 1px solid #222; display: flex; align-items: center; gap: 10px; }
        .section-title span { color: #007aff; font-weight: bold; }

        .mod-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .mod-card { background: #141417; border: 1px solid #222; padding: 20px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: 0.2s; }
        .active-border { border-left: 5px solid #007aff !important; background: #18181c !important; }
        .custom-card { border-left: 2px dashed #333; }
        
        .mod-name { font-weight: bold; font-size: 18px; color: #fff; margin-bottom: 4px; }
        .mod-author { font-size: 11px; color: #007aff; text-transform: uppercase; margin-bottom: 8px; }
        .mod-desc { font-size: 13px; color: #888; line-height: 1.4; margin-bottom: 15px; }
        .tgl-btn { padding: 12px; border-radius: 12px; cursor: pointer; border: none; font-weight: bold; width: 100%; transition: 0.2s; }
        .on { background: #28a745; color: #fff; }
        .off { background: #222; color: #888; border: 1px solid #333; }
        .upload-zone { background: #111114; border: 2px dashed #007aff; padding: 30px; border-radius: 20px; text-align: center; cursor: pointer; color: #007aff; font-weight: bold; margin-bottom: 30px; transition: 0.3s; }
        .upload-zone:hover { background: rgba(0, 122, 255, 0.05); }
    `);

    const Client = {
        init() {
            this.createModal();
            this.injectSidebarButton();
            this.runScripts();
            const observer = new MutationObserver(() => this.injectSidebarButton());
            observer.observe(document.body, { childList: true, subtree: true });
        },

        injectSidebarButton() {
            const nav = document.querySelector('.sidebar-nav');
            if (!nav || document.getElementById('itd-sidebar-btn')) return;
            const btn = document.createElement('a');
            btn.id = 'itd-sidebar-btn';
            btn.className = 'sidebar-nav-item svelte-13vg9xt';
            btn.style.cursor = 'pointer';
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24"><path fill="currentColor" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path><path fill="currentColor" fill-rule="evenodd" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z" clip-rule="evenodd"></path></svg>`;
            btn.onclick = (e) => {
                e.preventDefault();
                const gui = document.getElementById('itd-gui');
                gui.style.display = gui.style.display === 'flex' ? 'none' : 'flex';
                this.renderModules();
            };
            nav.appendChild(btn);
        },

        createModal() {
            const gui = document.createElement('div');
            gui.id = 'itd-gui';
            gui.innerHTML = `
                <div class="gui-head">
                    <div><h2 style="margin:0;">ITD Extended Client 1.4.7</h2><small style="color:#007aff">Менеджер расширений</small></div>
                    <span id="itd-close" style="cursor:pointer; font-size:28px;">✕</span>
                </div>
                <div class="gui-body">
                    <div class="upload-zone" id="itd-upload">+ ЗАГРУЗИТЬ ПОЛЬЗОВАТЕЛЬСКИЙ СКРИПТ (.JS / .TXT)</div>
                    <input type="file" id="itd-file-input" style="display:none" accept=".js,.txt">
                    
                    <div class="section-title"><span>●</span> Предустановленные модули</div>
                    <div id="default-mod-container" class="mod-grid"></div>

                    <div class="section-title"><span>●</span> Ваши скрипты</div>
                    <div id="custom-mod-container" class="mod-grid"></div>
                </div>
            `;
            document.body.appendChild(gui);
            document.getElementById('itd-close').onclick = () => gui.style.display = 'none';
            document.getElementById('itd-upload').onclick = () => document.getElementById('itd-file-input').click();
            document.getElementById('itd-file-input').onchange = (e) => this.handleFile(e);
        },

        renderModules() {
            const defContainer = document.getElementById('default-mod-container');
            const custContainer = document.getElementById('custom-mod-container');

            const renderCard = (m, isLocal) => `
                <div class="mod-card ${m.active ? 'active-border' : ''} ${isLocal ? 'custom-card' : ''}">
                    <div>
                        <div class="mod-name">${m.name}</div>
                        <div class="mod-author">Автор: ${m.auth || 'Неизвестен'}</div>
                        <div class="mod-desc">${m.desc || 'Описание отсутствует.'}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap: 8px;">
                        <button class="tgl-btn ${m.active ? 'on' : 'off'}" data-id="${m.id}" data-local="${isLocal}">
                            ${m.active ? 'ДЕАКТИВИРОВАТЬ' : 'АКТИВИРОВАТЬ'}
                        </button>
                        ${isLocal ? `<button class="del-script-btn" style="color:#ff4444; background:none; border:none; cursor:pointer; font-size:11px; margin-top:5px;" data-id="${m.id}">Удалить файл</button>` : ''}
                    </div>
                </div>
            `;

            // Отрисовка дефолтных
            defContainer.innerHTML = defaultModules.map(m => {
                const active = GM_getValue('m_' + m.id, false);
                return renderCard({...m, active}, false);
            }).join('');

            // Отрисовка кастомных
            if (customModules.length === 0) {
                custContainer.innerHTML = '<div style="grid-column:1/-1; color:#444; text-align:center; padding:20px;">У вас пока нет добавленных скриптов</div>';
            } else {
                custContainer.innerHTML = customModules.map(m => renderCard(m, true)).join('');
            }

            this.bindEvents();
        },

        bindEvents() {
            document.querySelectorAll('.tgl-btn').forEach(b => {
                b.onclick = () => {
                    const id = b.dataset.id;
                    if (b.dataset.local === 'true') {
                        const m = customModules.find(x => x.id === id);
                        m.active = !m.active;
                        GM_setValue('custom_modules_v2', customModules);
                    } else {
                        GM_setValue('m_' + id, !GM_getValue('m_' + id, false));
                    }
                    location.reload();
                };
            });

            document.querySelectorAll('.del-script-btn').forEach(b => {
                b.onclick = () => {
                    if (confirm('Удалить этот скрипт?')) {
                        customModules = customModules.filter(x => x.id !== b.dataset.id);
                        GM_setValue('custom_modules_v2', customModules);
                        this.renderModules();
                    }
                };
            });
        },

        handleFile(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                customModules.push({ id: 'c' + Date.now(), name: file.name, auth: 'Локально', desc: 'Ваш загруженный скрипт', code: ev.target.result, active: true });
                GM_setValue('custom_modules_v2', customModules);
                location.reload();
            };
            reader.readAsText(file);
        },

        runScripts() {
            defaultModules.forEach(m => {
                if (GM_getValue('m_' + m.id, false) && m.url) {
                    GM_xmlhttpRequest({
                        method: "GET", url: m.url,
                        onload: (res) => { if (res.status === 200) this.inject(res.responseText, m.name); }
                    });
                }
            });
            customModules.forEach(m => { if (m.active) this.inject(m.code, m.name); });
        },

        inject(code, name) {
            try {
                const script = document.createElement('script');
                const blob = new Blob([code], { type: 'text/javascript' });
                script.src = URL.createObjectURL(blob);
                document.head.appendChild(script);
            } catch (e) { console.error(`[ITD] Fail: ${name}`, e); }
        }
    };

    Client.init();
})();
