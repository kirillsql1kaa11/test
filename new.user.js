// ==UserScript==
// @name         ITD Extended Client v2.0
// @version      2.0
// @description  Исправлена совместимость с KAALITION AI и проброс API
// @author       l1kaa11
// @match        https://xn--d1ah4a.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      gist.githubusercontent.com
// @connect      raw.githubusercontent.com
// @connect      api.groq.com
// @run-at       document-end
// @namespace    https://github.com/kirillsql1kaa11/test
// @updateURL    https://github.com/kirillsql1kaa11/test/raw/refs/heads/main/ITDEXT.user.js
// @downloadURL  https://github.com/kirillsql1kaa11/test/raw/refs/heads/main/ITDEXT.user.js
// ==/UserScript==

(function() {
    'use strict';

    const defaultModules = [
        {
            id: 'kaalition',
            name: '🚀 KAALITION AI PRO',
            auth: '@newsoffc & @dmitrii_gr',
            desc: 'Продвинутый ИИ-ассистент с системой плагинов и генератором постов.',
            url: 'https://raw.githubusercontent.com/GleTur/KAALITION_AI/main/kaalition-ai.txt'
        },
        {
            id: 'fresh',
            name: 'ITD Свежак',
            auth: '@l1ka11',
            desc: 'Автоматически скрывает посты, опубликованные более 24 часов назад.',
            url: 'https://raw.githubusercontent.com/kirillsql1kaa11/ITD-Extended-Client/main/modules/itdfresh.txt'
        },
        {
            id: 'zoom',
            name: 'ITD Приближение',
            auth: '@l1kaa11',
            desc: 'Позволяет увеличивать изображения при наведении и прокрутке колесиком.',
            url: 'https://raw.githubusercontent.com/kirillsql1kaa11/ITD-Extended-Client/main/modules/itdscrollphoto.txt'
        },
        {
            id: 'arts',
            name: 'ITD Арты',
            auth: '@l1kaa11',
            desc: 'Улучшенный интерфейс для раздела рисования и просмотра артов.',
            url: 'https://raw.githubusercontent.com/kirillsql1kaa11/ITD-Extended-Client/main/modules/ITDartex.txt'
        },
        {
            id: 'counter',
            name: 'ITD Счетчик',
            auth: '@l1kaa11',
            desc: 'Отображает точное количество загруженных постов в текущей ленте.',
            url: 'https://raw.githubusercontent.com/kirillsql1kaa11/ITD-Extended-Client/main/modules/itdpostcounter.txt'
        },
        {
            id: 'backgrounds',
            name: 'ITD Фоны',
            auth: '@l1kaa11',
            desc: 'Применяет кастомные задние планы и анимированные GIF-фоны.',
            url: 'https://raw.githubusercontent.com/kirillsql1kaa11/ITD-Extended-Client/main/modules/ITDbackground.txt'
        },
        {
            id: 'profilesear',
            name: 'Profile Search',
            auth: '@dmitrii_gr (#дым)',
            desc: 'Добавляет возможность поиска в профиле',
            url: 'https://gist.githubusercontent.com/Dima-programmer/ca1d842c672ed355d036cf97b91526b6/raw/9b0abb1dd557951ddd354707eecc240d56bfe4d7/ProfileSearch.txt'
        },
        {
            id: 'suggestion',
            name: 'Скрыть "Кого читать"',
            auth: '@dmitrii_gr (#дым)',
            desc: 'Убирает плашку "Кого читать"',
            url: 'https://gist.githubusercontent.com/Dima-programmer/76854a744e67fbfbcf29669d37693eea/raw/09269fd155693e4ea1eb81e94fda11ff3ae43b55/SuggestionsHide.txt'
        }
    ];

    let customModules = GM_getValue('custom_modules_v2', []);

    GM_addStyle(`
        #itd-gui .gui-body::-webkit-scrollbar { width: 4px; }
        #itd-gui .gui-body::-webkit-scrollbar-track { background: transparent; }
        #itd-gui .gui-body::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        #itd-gui .gui-body:hover::-webkit-scrollbar-thumb { background: #444; }
        #itd-gui { position: fixed; top: 10%; left: 10%; width: 80%; height: 80%; background: #08080a; border: 1px solid #222; border-radius: 30px; z-index: 999998; display: none; color: white; flex-direction: column; overflow: hidden; box-shadow: 0 0 150px rgba(0,0,0,0.9); font-family: system-ui, sans-serif; }
        .gui-head { padding: 25px 35px; background: #111114; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; }
        .gui-body { flex: 1; padding: 30px; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-content: start; scrollbar-width: thin; scrollbar-color: #333 transparent; }
        .mod-card { background: #141417; border: 1px solid #222; padding: 20px; border-radius: 20px; display: flex; flex-direction: column; justify-content: space-between; position: relative; transition: 0.2s; }
        .active-border { border-left: 5px solid #007aff !important; background: #18181c !important; }
        .mod-name { font-weight: bold; font-size: 18px; color: #fff; margin-bottom: 4px; }
        .mod-author { font-size: 11px; color: #007aff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .mod-desc { font-size: 13px; color: #888; line-height: 1.4; margin-bottom: 15px; }
        .tgl-btn { padding: 12px; border-radius: 12px; cursor: pointer; border: none; font-weight: bold; width: 100%; transition: 0.2s; }
        .on { background: #28a745; color: #fff; }
        .off { background: #222; color: #888; border: 1px solid #333; }
        .upload-zone { grid-column: 1 / -1; background: #111114; border: 2px dashed #333; padding: 20px; border-radius: 20px; text-align: center; cursor: pointer; color: #007aff; font-weight: bold; margin-bottom: 10px; }
        #itd-sidebar-btn svg { transition: transform 0.3s ease; }
        #itd-sidebar-btn:hover svg { transform: rotate(45deg); color: #007aff; }
    `);

    const Client = {
        init() {
            // Создаем мост для API в глобальном окне
            window.ITD_GM_BRIDGE = {
                getValue: GM_getValue,
                setValue: GM_setValue,
                xmlHttpRequest: GM_xmlhttpRequest,
                addStyle: GM_addStyle
            };

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
                    <div><h2 style="margin:0;">ITD Extended Client 1.4.3</h2><small style="color:#007aff">Интерфейс управления модулями</small></div>
                    <span id="itd-close" style="cursor:pointer; font-size:28px;">✕</span>
                </div>
                <div class="gui-body">
                    <div class="upload-zone" id="itd-upload">ЗАГРУЗИТЬ СВОЙ СКРИПТ (.JS / .TXT)</div>
                    <input type="file" id="itd-file-input" style="display:none" accept=".js,.txt">
                    <div id="mod-container" style="display:contents"></div>
                </div>
            `;
            document.body.appendChild(gui);
            document.getElementById('itd-close').onclick = () => gui.style.display = 'none';
            document.getElementById('itd-upload').onclick = () => document.getElementById('itd-file-input').click();
            document.getElementById('itd-file-input').onchange = (e) => this.handleFile(e);
        },

        handleFile(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                customModules.push({ id: 'c' + Date.now(), name: file.name, auth: 'Вы', desc: 'Локальный файл', code: ev.target.result, active: true });
                GM_setValue('custom_modules_v2', customModules);
                location.reload();
            };
            reader.readAsText(file);
        },

        deleteModule(id) {
            if (confirm('Вы уверены, что хотите удалить этот скрипт?')) {
                customModules = customModules.filter(x => x.id !== id);
                GM_setValue('custom_modules_v2', customModules);
                this.renderModules(); 
            }
        },

        renderModules() {
            const container = document.getElementById('mod-container');
            const all = [
                ...defaultModules.map(m => ({...m, active: GM_getValue('m_' + m.id, false), isLocal: false})),
                ...customModules.map(m => ({...m, isLocal: true}))
            ];

            container.innerHTML = all.map(m => `
                <div class="mod-card ${m.active ? 'active-border' : ''}">
                    <div>
                        <div class="mod-name">${m.name}</div>
                        <div class="mod-author">Автор: ${m.auth || 'Неизвестен'}</div>
                        <div class="mod-desc">${m.desc || 'Описание отсутствует.'}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap: 8px;">
                        <button class="tgl-btn ${m.active ? 'on' : 'off'}" data-id="${m.id}" data-local="${m.isLocal}">
                            ${m.active ? 'ДЕАКТИВИРОВАТЬ' : 'АКТИВИРОВАТЬ'}
                        </button>
                        ${m.isLocal ? `<button class="del-script-btn" style="color:#ff4444; background:none; border:none; cursor:pointer; font-size:11px;" data-id="${m.id}">Удалить скрипт</button>` : ''}
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('.tgl-btn').forEach(b => {
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

            container.querySelectorAll('.del-script-btn').forEach(b => {
                b.onclick = () => this.deleteModule(b.dataset.id);
            });
        },

        runScripts() {
            defaultModules.forEach(m => {
                if (GM_getValue('m_' + m.id, false) && m.url) {
                    GM_xmlhttpRequest({
                        method: "GET", url: m.url + '?v=' + Date.now(),
                        onload: (res) => { if (res.status === 200) this.inject(res.responseText, m.name); }
                    });
                }
            });
            customModules.forEach(m => { if (m.active) this.inject(m.code, m.name); });
        },

        inject(code, name) {
            try {
                const script = document.createElement('script');
                // Оборачиваем код для предоставления доступа к API через мост
                const wrappedCode = `(function() {
                    const GM_getValue = window.ITD_GM_BRIDGE.getValue;
                    const GM_setValue = window.ITD_GM_BRIDGE.setValue;
                    const GM_xmlhttpRequest = window.ITD_GM_BRIDGE.xmlHttpRequest;
                    const GM_addStyle = window.ITD_GM_BRIDGE.addStyle;
                    
                    try {
                        ${code}
                    } catch(e) {
                        console.error("[ITD Module Error] ${name}:", e);
                    }
                })();`;
                
                const blob = new Blob([wrappedCode], { type: 'text/javascript' });
                script.src = URL.createObjectURL(blob);
                document.head.appendChild(script);
                console.log(`[ITD] Успешно запущен: ${name}`);
            } catch (e) { console.error(`[ITD] Fail: ${name}`, e); }
        }
    };

    Client.init();
})();
