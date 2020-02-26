'use strict';
let tabid = -1;

const getLoginData = async () => {
    const global = await browser.runtime.getBackgroundPage();
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    tabid = parseInt(window.location.search.split('=')[1]) || tabs[0].id;
    global.page.currentTabId = tabid;
    document.title = global.page.tabs[tabid].titlePreface + tr('popupTitle');
    return global.page.tabs[tabid].loginList;
};

$(async () => {
    await initColorTheme();
    const data = await getLoginData();
    let resolve = true;
    for (let i = 0; i < data.logins.length; ++i) {
        const a = $('<a/>');
        a.addClass('list-group-item');
        a.text(data.logins[i].login + ' (' + data.logins[i].name + ')');
        a.data('creds', data.logins[i]);
        a.click(function() {
            resolve = false;
            if (data.resolve) {
                const creds = $(this).data('creds');
                data.resolve({
                    authCredentials: {
                        username: creds.login,
                        password: creds.password
                    }
                });
            }
            close();
        });
        a.appendTo('#login-list');
    }

    $('#btn-dismiss').click(async () => {
        resolve = false;
        data.resolve({cancel: false});
        close();
    });


    window.addEventListener('beforeunload', async () => {
        const global = await browser.runtime.getBackgroundPage();

        if (global.page.tabs[tabid]) {
            global.page.tabs[tabid].httpAuthDialog = false;
            if (resolve && data.resolve) {
                data.resolve({cancel: false});
            }
        }
    }, false);
});
