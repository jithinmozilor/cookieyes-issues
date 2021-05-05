try {
    bannerActiveCheck();
} catch (err) {
    console.error(err);
}

var ckyActiveLaw = "";

function count(callback) {
    if (cliConfig.options.selectedLaws.length !== 2) {
        ckyActiveLaw = cliConfig.options.selectedLaws[0];
        callback(ckyActiveLaw);
    }

    var request = new XMLHttpRequest();
    request.open("GET", "https://geoip.cookieyes.com/geoip/checker/result.php", true);

    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            var data = JSON.parse(this.response);
            var clientIP = data.ip;
            sessionStorage.setItem("isEU", data.in_eu);
            sessionStorage.setItem("countryName", data.country);
            sessionStorage.setItem("regionCode", data.region_code);
            var ipdata = { ip: clientIP.substring(0, clientIP.lastIndexOf(".")) + ".0", country_name: data.country_name };
            sessionStorage.setItem("ip", JSON.stringify(ipdata, null, 2));
            var in_EU = data.in_eu;
            var country_name = data.country;
            var region_code = data.region_code;
            if (ckyActiveLaw) {
                if (ckyActiveLaw === "gdpr") {
                    var showOnlyInEu = cliConfig.options.geoTarget["gdpr"].eu;
                } else if (ckyActiveLaw === "ccpa") {
                    cookieYes.unblock();
                    var showOnlyInCalifornia = cliConfig.options.geoTarget["ccpa"].california;
                    var showOnlyInUs = cliConfig.options.geoTarget["ccpa"].us;
                }
                switch (true) {
                    case (ckyActiveLaw === "gdpr" && showOnlyInEu && in_EU === false) ||
                        (ckyActiveLaw === "ccpa" && showOnlyInCalifornia && country_name !== "US" && region_code !== "CA") ||
                        (ckyActiveLaw === "ccpa" && showOnlyInUs && country_name !== "US"):
                        disableBanner();
                        break;
                    default:
                        displayBanner();
                }
            } else {
                var showOnlyInEu = cliConfig.options.geoTarget["gdpr"].eu;
                var showOnlyInCalifornia = cliConfig.options.geoTarget["ccpa"].california;
                var showOnlyInUs = cliConfig.options.geoTarget["ccpa"].us;
                switch (true) {
                    case (showOnlyInEu && !showOnlyInCalifornia && !showOnlyInUs && in_EU === true) ||
                        (!showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs && country_name !== "US") ||
                        (showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs && in_EU === true) ||
                        (!showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs) ||
                        (showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs && in_EU === true):
                        activateGdpr();
                        break;
                    case (showOnlyInEu && !showOnlyInCalifornia && !showOnlyInUs && country_name === "US") ||
                        (!showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs && region_code === "CA") ||
                        (showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs && region_code === "CA") ||
                        (!showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs && country_name === "US") ||
                        (showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs && country_name === "US") ||
                        (!showOnlyInEu && !showOnlyInCalifornia && !showOnlyInUs && region_code === "CA"):
                        activateCcpa();
                        break;
                    case (showOnlyInEu && !showOnlyInCalifornia && !showOnlyInUs) || (showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs) || (showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs):
                        disableBanner();
                        break;
                    default:
                        activateGdpr();
                }
            }
            function disableBanner() {
                categoryScripts.forEach(function (item) {
                    Array.prototype.push.apply(window.CKY_WHITELIST, item.list);
                    Array.prototype.push.apply(patterns.whitelist, item.list);
                });
                window.TYPE_ATTRIBUTE = "text/javascript";
                window.CKY_BLACKLIST = [];
                var cookieExpiry = cliConfig.options.cookieExpiry === undefined ? 365 : cliConfig.options.cookieExpiry;
                cookieYes.setCookie("cky-action", "yes", cookieExpiry);
                cookieYes.setCookie("cky-consent", "yes", cookieExpiry);
                cookieYes.setCookie("cookieyes-analytics", "yes", cookieExpiry);
                cookieYes.setCookie("cookieyes-functional", "yes", cookieExpiry);
                cookieYes.setCookie("cookieyes-advertisement", "yes", cookieExpiry);
                cookieYes.unblock();
            }

            function displayBanner() {
                if (document.getElementById("cky-consent")) {
                    document.getElementById("cky-consent").style.display = "block";
                }
            }

            function activateCcpa() {
                ckyActiveLaw = "ccpa";
                callback(ckyActiveLaw);
                displayBanner();
            }

            function activateGdpr() {
                ckyActiveLaw = "gdpr";
                callback(ckyActiveLaw);
                displayBanner();
            }
        } else {
            // We reached our target server, but it returned an error
        }
    };
    request.onerror = function () {
        // There was a connection error of some sort
    };
    request.send();

    ckyLogCookies = function () {
        function getCookie(name) {
            var re = new RegExp(name + "=([^;]+)");
            var value = re.exec(document.cookie);
            return value != null ? unescape(value[1]) : null;
        }
        let log = [
            { name: "CookieYes Consent", status: getCookie("cky-consent") },
            { name: "Necessary", status: "yes" },
            { name: "Analytics", status: getCookie("cookieyes-analytics") },
            { name: "Advertisement", status: getCookie("cookieyes-advertisement") },
        ];
        let ip = sessionStorage.getItem("ip");
        let consent_id = getCookie("cookieyesID");
        var request = new XMLHttpRequest();
        var data = new FormData();
        data.append("log", JSON.stringify(log));
        data.append("key", "2a51e749d60e012484a135a4");
        data.append("ip", ip);
        data.append("consent_id", consent_id);
        request.open("POST", "https://app.cookieyes.com/api/v1/log", true);
        request.send(data);
    };
}

function bannerActiveCheck() {
    var isActiveCheckCookiePresent = getCookie("cky-active-check");
    if (!isActiveCheckCookiePresent && window.fetch && window.Promise) {
        fetch("https://active.cookieyes.com/api/2a51e749d60e012484a135a4/log", { method: "POST" }).catch(function (err) {
            console.error(err);
        });
        setCookie("cky-active-check", "yes", 1);
    }
}

function getCookie(name) {
    var cookieList = document.cookie
        .split(";")
        .map(function (cookie) {
            return cookie.split("=");
        })
        .reduce((accumulator, [key, value]) => ({ ...accumulator, [key.trim()]: decodeURIComponent(value) }), {});
    if (name in cookieList) {
        return true;
    } else {
        return false;
    }
}

function setCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        var expires = "; expires=" + date.toGMTString();
    } else var expires = "";
    var cliCookie = name + "=" + value + expires + "; path=/;";
    document.cookie = cliCookie;
}

function randomString(length) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz".split("");

    if (!length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = "";
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
var tldomain = "sprend.com";
var cliConfig = {
    options: {
        plan: "Basic",
        theme: "light",
        colors: {
            gdpr: {
                popup: { pills: { bg: "#f2f5fa", activeBg: "#ffffff", textColor: "#000000", activeTextColor: "#000000" }, acceptCustomButton: { bg: "#ffffff", textColor: "#0342b5", borderColor: "#0342b5" } },
                notice: { bg: "#fff", textColor: "#565662", titleColor: "#565662", borderColor: "#d4d8df" },
                buttons: {
                    accept: { bg: "#0342b5", textColor: "#fff", borderColor: "#0443b5" },
                    reject: { bg: "#dedfe0", textColor: "#717375", borderColor: "transparent" },
                    readMore: { bg: "transparent", textColor: "#565662", borderColor: "transparent" },
                    settings: { bg: "transparent", textColor: "#7f7f7f", borderColor: "transparent" },
                },
            },
        },
        content: {
            gdpr: {
                text: {
                    en: "Sprend uses cookies that help the website to function and also to track how you interact with our website.",
                    se: "Sprend anv\u00e4nder cookies f\u00f6r att webbtj\u00e4nsten skall fungera, och \u00e4ven f\u00f6r att f\u00f6lja upp hur du anv\u00e4nder tj\u00e4nsten.",
                },
                title: { en: "Cookie consent", se: "Samtycke till cookies" },
                buttons: { accept: { en: "Accept All", se: "Acceptera alla" }, reject: { en: "Reject All", se: "Avvisa" }, readMore: { en: "Read More", se: "L\u00e4s mer" }, settings: { en: "Preferences", se: "Inst\u00e4llningar" } },
                auditTable: { type: { en: "Type", se: "Typ" }, cookie: { en: "Cookie", se: "Cookie" }, duration: { en: "Duration", se: "Varaktighet" }, description: { en: "Description", se: "Beskrivning" } },
                saveButton: { en: "Save", se: "Spara" },
                customLogoUrl: null,
                noticeToggler: { en: "Cookies", se: "Cookies" },
                placeHolderText: { en: "Please accept the cookie consent", se: "Acceptera cookies samtycke" },
                privacyPolicyLink: { en: "#", se: "#" },
                customAcceptButton: { en: "Save my preferences", se: "Spara mina preferenser" },
            },
        },
        display: { gdpr: { title: false, notice: true, buttons: { accept: true, reject: true, readMore: false, settings: true }, noticeToggler: true } },
        version: "4.0.0",
        position: "bottom",
        template: {
            id: "classic",
            css:
                ".cky-consent-bar-trigger, .cky-consent-bar, .cky-modal, .cky-consent-bar-trigger *, .cky-consent-bar *, .cky-modal * { box-sizing: border-box; } .cky-consent-bar-trigger *:focus, .cky-consent-bar *:focus, .cky-modal *:focus { outline: 0; } .cky-consent-bar-trigger { position: fixed; right: 30px; padding: 2px 5px; font-size: 13px; cursor: pointer; font-family: inherit; animation: slide-up 0.4s ease; z-index: 9997; } .cky-consent-bar { font-family: inherit; position: fixed; z-index: 9997; } .cky-consent-bar .cky-consent-title { font-size: 15px; font-weight: bold; margin-bottom: 3px; } .cky-consent-bar p { line-height: 20px; font-size: 13px; font-weight: normal; margin-bottom: 0; margin-top: 0; } .cky-btn { font-size: 12px; padding: .5rem 1rem; background: none; cursor: pointer; display: inline-block; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; line-height: 1; transition: all .15s ease-in-out; margin: 0; min-height: auto; font-weight: normal; border-radius: 0; } .cky-btn:hover { opacity: .8; } .cky-btn:focus { outline: 0; } .cky-button-wrapper .cky-btn { margin-right: 15px; } .cky-button-wrapper .cky-btn:last-child { margin-right: 0; } .cky-btn.cky-btn-custom-accept { margin: 1.5rem 1rem; font-weight: 600; white-space: initial; word-break: break-word; } .cky-btn-readMore { cursor: pointer; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-btn-doNotSell { cursor: pointer; white-space: nowrap; font-weight: bold; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: flex; align-items: center; } .cky-consent-bar.cky-logo-active .cky-logo { margin-right: 30px; } @media (max-width: 540px) { .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: block; } } .cky-tab { display: -ms-flexbox; display: flex; } .cky-tab-menu { flex: 0 0 25%; max-width: 25%; } @media (max-width: 991px) { .cky-tab-menu { flex: 0 0 40%; max-width: 40%; } } .cky-tab-content { flex: 0 0 75%; max-width: 75%; background: transparent; padding: 15px 20px; } @media (max-width: 991px) { .cky-tab-content { flex: 0 0 60%; max-width: 60%; } } @media (max-width: 767px) { .cky-tab-content { padding: 15px; } } .cky-tab-item { font-size: 11px; cursor: pointer; font-weight: normal; border-bottom: 1px solid; border-right: 1px solid; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.5; } @media (max-width: 767px) { .cky-tab-item { font-size: 11px; padding: .75rem .75rem; } } .cky-tab-item-active { cursor: initial; border-right: 0; } .cky-tab-content .cky-tab-desc, .cky-tab-content .cky-tab-desc p { font-size: 12px; } .cky-tab-title { font-size: 13px; margin-bottom: 11px; margin-top: 0; font-family: inherit; font-weight: bold; line-height: 1; display: flex; align-items: center; } .cky-tab-content .cky-tab-content-item:not(.cky-tab-content-active) { display: none; } .cky-category-direct { display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; padding-top: 15px; margin-top: 15px; border-top: 1px solid #d4d8df; } .cky-category-direct .cky-btn-custom-accept { margin: 0 0 0 auto; } .cky-category-direct-item { display: -ms-flexbox; display: flex; -webkit-box-align: center; -ms-flex-align: center; align-items: center; margin-right: 32px; margin-bottom: 15px; } .cky-category-direct-item:last-child { margin-right: 0; } .cky-category-direct-item .cky-switch { margin-left: 0; } .cky-category-direct-item .cky-category-direct-name { margin-left: 10px; font-size: 12px; font-weight: 600; } .cky-category-direct +.cky-detail-wrapper { margin-top: 10px; } .cky-table-wrapper { width: 100%; max-width: 100%; overflow: auto; } .cky-cookie-audit-table { font-family: inherit; border-collapse: collapse; width: 100%; margin-top: 10px; } .cky-cookie-audit-table th { background-color: #d9dfe7; border: 1px solid #cbced6; } .cky-cookie-audit-table td { border: 1px solid #d5d8df; } .cky-cookie-audit-table th, .cky-cookie-audit-table td { text-align: left; padding: 10px; font-size: 12px; color: #000000; word-break:normal; } .cky-cookie-audit-table tr:nth-child(2n+1) td { background: #f1f5fa; } .cky-cookie-audit-table tr:nth-child(2n) td { background: #ffffff; } .cky-audit-table-element h5 { margin: 25px 0 2px 0; } .cky-audit-table-element .cky-table-wrapper { margin-bottom: 1rem; } .cky-consent-bar.cky-rtl { direction: rtl; text-align: right; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn { margin-right: 0; margin-left: 15px; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn:last-child { margin-left: 0; } .cky-consent-bar.cky-rtl .cky-btn-readMore { margin-left: 0; margin-right: 6px; } .cky-consent-bar.cky-rtl.cky-logo-active .cky-logo { margin-right: 0px; margin-left: 30px; } .cky-switch { position: relative; min-height: 13px; padding-left: 25px; font-size: 14px; margin-left: 20px; margin-bottom: 0; display: inline-block; } .cky-switch input[type='checkbox'] { display: none !important; } .cky-switch .cky-slider { background-color: #e3e1e8; border-radius: 34px; height: 13px; width: 25px; bottom: 0; cursor: pointer; left: 0; position: absolute; right: 0; transition: .4s; } .cky-switch .cky-slider:before { background-color: #fff; border-radius: 50%; bottom: 2px; content: ''; height: 9px; left: 2px; position: absolute; transition: .4s; width: 9px; } .cky-switch input:checked+.cky-slider { background-color: #008631; } .cky-switch input:disabled+.cky-slider { cursor: initial; } .cky-switch input:checked+.cky-slider:before { transform: translateX(12px); } .cky-modal.cky-fade .cky-modal-dialog { transition: -webkit-transform .3s ease-out; transition: transform .3s ease-out; transition: transform .3s ease-out, -webkit-transform .3s ease-out; -webkit-transform: translate(0, -25%); transform: translate(0, -25%); } .cky-modal.cky-show .cky-modal-dialog { -webkit-transform: translate(0, 0); transform: translate(0, 0); } .cky-modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9998; background-color: rgba(10, 10, 10, 0.22); display: none; } .cky-modal-backdrop.cky-fade { opacity: 0; } .cky-modal-backdrop.cky-show { opacity: 1; display: block; } .cky-modal { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999; display: none; overflow: hidden; outline: 0; min-height: calc(100% - (.5rem * 2)); } .cky-modal.cky-show { display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; } .cky-modal a { text-decoration: none; } .cky-modal .cky-modal-dialog { position: relative; max-width: calc(100% - 16px); width: calc(100% - 16px); margin: .5rem; pointer-events: none; font-family: inherit; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; text-align: left; display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); -webkit-box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); } @media (min-width: 576px) { .cky-modal .cky-modal-dialog { max-width: 500px; width: 500px; margin: 1.75rem auto; } .cky-modal { min-height: calc(100% - (1.75rem * 2)); } } @media (min-width: 991px) { .cky-modal .cky-modal-dialog { max-width: 900px; width: 900px; } } .cky-modal-content { display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; width: 100%; pointer-events: auto; background-clip: padding-box; border: 0; border-radius: 4px; overflow: hidden; outline: 0; margin: 40px; } .cky-modal.cky-rtl { direction: rtl; text-align: right; } .ccpa.cky-modal .cky-modal-dialog { max-width: 300px; width: 300px; border-radius: 5px; } .ccpa.cky-modal .cky-modal-content { margin: 25px; text-align: center; font-weight: 600; } .ccpa.cky-modal .cky-opt-out-text { margin-bottom: 20px; } .cky-consent-bar.cky-classic { width: 100%; display: block; box-shadow: 0 -1px 10px 0 rgba(172, 171, 171, 0.3); } .cky-classic .cky-content-wrapper { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; justify-content: space-between; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; } .cky-classic .cky-button-wrapper { margin-left: 20px; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; flex-wrap: nowrap; } .cky-consent-bar.cky-classic p { text-align: left; } .cky-classic .cky-btn-settings { margin-left: auto; position: relative; padding-right: 1rem; } .cky-classic .cky-btn-settings:before { border-style: solid; border-width: 1px 1px 0 0; content: ''; display: inline-block; height: 4px; right: 8px; position: absolute; border-color: #beb8b8; top: 11px; transform: rotate(135deg); vertical-align: middle; width: 4px; } .cky-classic .cky-btn-settings[expanded]:before { transform: rotate(-45deg); } .cky-classic .cky-consent-bar.cky-rtl .cky-button-wrapper { margin-left: 0; margin-right: 20px; } .cky-classic .cky-consent-bar.cky-rtl p { text-align: right; } @media(min-width: 991px) { .cky-consent-bar.cky-classic { padding: 15px 50px; } } @media(min-width: 1150px) { .cky-consent-bar.cky-classic { padding: 15px 130px; } } @media(min-width: 1415px) { .cky-consent-bar.cky-classic { padding: 15px 160px; } } @media (max-width: 991px) { .cky-classic .cky-button-wrapper { margin-left: 0; margin-top: 20px; } .cky-consent-bar.cky-classic, .cky-consent-bar.cky-classic p, .cky-classic .cky-button-wrapper, .cky-classic .cky-content-wrapper { display: block; text-align: center; } } .cky-detail-wrapper { margin-top: 30px; border: 1px solid #d4d8df; border-radius: 2px; overflow: hidden; } .cky-tab-content { width: 100%; } .cky-tab-item { padding: .5rem 1rem; align-items: center; } .cky-tab-content .cky-tab-desc { min-height: 155px; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } @media (max-width: 767px) { .cky-tab-content .cky-tab-desc { max-height: 155px; } } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-switch { margin-left: 0; margin-right: 20px; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item { border-right: none; border-left: 1px solid; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item.cky-tab-item-active { border-left: 0; }",
            detailType: "sticky",
        },
        tldomain: "sprend.com",
        behaviour: { reload: true, showLogo: true, acceptOnScroll: false, defaultConsent: false, showAuditTable: true, selectedLanguage: "en" },
        customCss: null,
        geoTarget: { gdpr: { eu: false } },
        consentType: "explicit",
        selectedLaws: ["gdpr"],
        consentBarType: "classic",
        showCategoryDirectly: false,
    },
    info: {
        categories: [
            {
                id: 201365,
                slug: "necessary",
                order: 1,
                name: { en: "Necessary", se: "N\u00f6dv\u00e4ndiga" },
                defaultConsent: 1,
                active: 1,
                settings: null,
                type: 1,
                description: {
                    en: "<p>Necessary cookies are crucial for the basic functions of the website and the website will not work in its intended way without them.</p>",
                    se: "<p>N\u00f6dv\u00e4ndiga cookies \u00e4r avg\u00f6rande f\u00f6r webbplatsens grundl\u00e4ggande funktioner och webbplatsen fungerar inte p\u00e5 det avsedda s\u00e4ttet utan dem.</p>",
                },
                scripts: [
                    {
                        id: 70512,
                        name: {
                            en: "Necessary",
                            de: "Necessary",
                            fr: "Necessary",
                            it: "Necessary",
                            es: "Necessary",
                            nl: "Necessary",
                            bg: "Necessary",
                            da: "Necessary",
                            ru: "Necessary",
                            ar: "Necessary",
                            pl: "Necessary",
                            pt: "Necessary",
                            ca: "Necessary",
                            hu: "Necessary",
                            se: "Necessary",
                            cr: "Necessary",
                            zh: "Necessary",
                            uk: "Necessary",
                            sk: "Necessary",
                            tr: "Necessary",
                            lt: "Necessary",
                            cs: "Necessary",
                            fi: "Necessary",
                            no: "Necessary",
                            "pt-br": "Necessary",
                            sl: "Necessary",
                        },
                        description: {
                            en: "These cookies help to perform the critical functions of the website.",
                            de: "These cookies help to perform the critical functions of the website.",
                            fr: "These cookies help to perform the critical functions of the website.",
                            it: "These cookies help to perform the critical functions of the website.",
                            es: "These cookies help to perform the critical functions of the website.",
                            nl: "These cookies help to perform the critical functions of the website.",
                            bg: "These cookies help to perform the critical functions of the website.",
                            da: "These cookies help to perform the critical functions of the website.",
                            ru: "These cookies help to perform the critical functions of the website.",
                            ar: "These cookies help to perform the critical functions of the website.",
                            pl: "These cookies help to perform the critical functions of the website.",
                            pt: "These cookies help to perform the critical functions of the website.",
                            ca: "These cookies help to perform the critical functions of the website.",
                            hu: "These cookies help to perform the critical functions of the website.",
                            se: "These cookies help to perform the critical functions of the website.",
                            cr: "These cookies help to perform the critical functions of the website.",
                            zh: "These cookies help to perform the critical functions of the website.",
                            uk: "These cookies help to perform the critical functions of the website.",
                            sk: "These cookies help to perform the critical functions of the website.",
                            tr: "These cookies help to perform the critical functions of the website.",
                            lt: "These cookies help to perform the critical functions of the website.",
                            cs: "These cookies help to perform the critical functions of the website.",
                            fi: "These cookies help to perform the critical functions of the website.",
                            no: "These cookies help to perform the critical functions of the website.",
                            "pt-br": "These cookies help to perform the critical functions of the website.",
                            sl: "These cookies help to perform the critical functions of the website.",
                        },
                        cookie_ids:
                            "__cfduid, PHPSESSID, JCS_INENTIM, JCS_INENREF, NCS_INENTIM, PHPSESSID, SJECT15, sID, DSID, session-id, csrftoken, sessionid, JSESSIONID, SLG_ROUNDEL_REF, cf_ob_info, cf_use_ob, twostep_auth, wordpress_test_cookie, woocommerce_cart_hash, woocommerce_items_in_cart, wp_woocommerce_session_, viewed_cookie_policy, AWSELB, hs, smSession, XSRF-TOKEN, pmpro_visit, o2switch-PowerBoost-Protect, pi_opt_in, _pxvid, f5_cspm, laravel_session",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                ],
                cookies: [
                    {
                        id: 372422,
                        cookie_id: "sprend-user-lang",
                        description: {
                            en: "This cookie stores the user's choice of language. It is necessary for Sprend to work properly.",
                            de: "No description",
                            fr: "No description",
                            it: "No description",
                            es: "No description",
                            nl: "No description",
                            bg: "No description",
                            da: "No description",
                            ru: "No description",
                            ar: "No description",
                            pl: "No description",
                            pt: "No description",
                            ca: "No description",
                            hu: "No description",
                            se: "Denna cookie lagrar anv\u00e4ndarens spr\u00e5kval. Den \u00e4r n\u00f6dv\u00e4ndig f\u00f6r att Sprend skall fungera bra.",
                            cr: "No description",
                            zh: "No description",
                            uk: "No description",
                            sk: "No description",
                            tr: "No description",
                            lt: "No description",
                            cs: "No description",
                            fi: "No description",
                            no: "No description",
                            "pt-br": "No description",
                            sl: "No description",
                        },
                        duration: "2 years",
                        type: "https",
                        domain: "sprend.com",
                    },
                    {
                        id: 372424,
                        cookie_id: "JSESSIONID",
                        description: {
                            en: "General purpose platform session cookies that are used to maintain users' state across page requests.",
                            de: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            fr: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            it: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            es: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            nl: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            bg: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            da: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            ru: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            ar: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            pl: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            pt: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            ca: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            hu: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            se: "Allm\u00e4n sessionscookie som g\u00f6r det m\u00f6jligt att vara inloggad.",
                            cr: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            zh: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            uk: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            sk: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            tr: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            lt: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            cs: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            fi: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            no: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            "pt-br": "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            sl: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                        },
                        duration: "session",
                        type: "https",
                        domain: "sprend.com",
                    },
                    {
                        id: 374131,
                        cookie_id: "sprend-sign-new-terms-snooze",
                        description: {
                            en: "This cookie lets the user snooze the review of a new version of the Sprend Services Agreement.",
                            se: "Denna cookie g\u00f6r det m\u00f6jligt att v\u00e4nta med att skriva under en ny version av tj\u00e4nsteavtalet.",
                        },
                        duration: "7 days",
                        type: "https",
                        domain: "sprend.com",
                    },
                    {
                        id: 378831,
                        cookie_id: "cky-active-check",
                        description: {
                            en: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            de: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            fr: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            it: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            es: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            nl: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            bg: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            da: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            ru: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            ar: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            pl: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            pt: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            ca: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            hu: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            se: "Denna cookies s\u00e4tts av CookieYes f\u00f6r att kontrollera att cookiesamtyckesrutan \u00e4r aktiv.",
                            cr: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            zh: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            uk: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            sk: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            tr: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            lt: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            cs: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            fi: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            no: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            "pt-br": "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                            sl: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                        },
                        duration: "1 day",
                        type: "https",
                        domain: "preprod.sprend.com",
                    },
                    {
                        id: 378832,
                        cookie_id: "cookieyesID",
                        description: {
                            en: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            de: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            fr: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            it: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            es: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            nl: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            bg: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            da: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            ru: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            ar: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            pl: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            pt: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            ca: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            hu: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            se: "Unik identifierare f\u00f6r bes\u00f6kare som anv\u00e4nds av CookieYes men h\u00e4nsyn till samtycke.",
                            cr: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            zh: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            uk: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            sk: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            tr: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            lt: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            cs: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            fi: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            no: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            "pt-br": "Unique identifier for  visitors used by CookieYes with respect to the consent",
                            sl: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".sprend.com",
                    },
                    {
                        id: 378833,
                        cookie_id: "cky-consent",
                        description: {
                            en: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            de: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            fr: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            it: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            es: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            nl: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            bg: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            da: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            ru: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            ar: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            pl: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            pt: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            ca: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            hu: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            se: "Denna cookie anv\u00e4nds av CookieYes f\u00f6r att komma ih\u00e5g anv\u00e4ndarens samtycke till anv\u00e4ndning av cookies.",
                            cr: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            zh: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            uk: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            sk: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            tr: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            lt: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            cs: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            fi: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            no: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            "pt-br": "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                            sl: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".sprend.com",
                    },
                    {
                        id: 378834,
                        cookie_id: "cookieyes-necessary",
                        description: {
                            en: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            de: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            fr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            it: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            es: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            nl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            bg: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            da: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            ru: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            ar: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            pl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            pt: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            ca: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            hu: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            se: "Denna cookie s\u00e4tts av CookieYes och anv\u00e4nds f\u00f6r att komma ih\u00e5g samtycke till anv\u00e4ndningen av cookies i kategorin N\u00f6dv\u00e4ndiga cookies.",
                            cr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            zh: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            uk: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            sk: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            tr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            lt: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            cs: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            fi: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            no: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            "pt-br": "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                            sl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Necessary' category.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".sprend.com",
                    },
                    {
                        id: 378835,
                        cookie_id: "cookieyes-advertisement",
                        description: {
                            en: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            de: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            fr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            it: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            es: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            nl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            bg: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            da: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            ru: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            ar: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            pl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            pt: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            ca: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            hu: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            se: "Denna cookie s\u00e4tts av CookieYes och anv\u00e4nds f\u00f6r att komma ih\u00e5g samtycke till anv\u00e4ndningen av cookies i kategorin Annonscookies.",
                            cr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            zh: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            uk: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            sk: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            tr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            lt: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            cs: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            fi: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            no: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            "pt-br": "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                            sl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Advertisement' category.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".sprend.com",
                    },
                    {
                        id: 379348,
                        cookie_id: "cookieyes-analytics",
                        description: {
                            en: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            de: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            fr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            it: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            es: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            nl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            bg: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            da: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            ru: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            ar: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            pl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            pt: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            ca: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            hu: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            se: "Denna cookie s\u00e4tts av CookieYes och anv\u00e4nds f\u00f6r att komma ih\u00e5g samtycke till anv\u00e4ndningen av cookies i kategorin Analytiska cookies.",
                            cr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            zh: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            uk: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            sk: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            tr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            lt: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            cs: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            fi: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            no: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            "pt-br": "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                            sl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the 'Analytics' category.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".sprend.com",
                    },
                    {
                        id: 379349,
                        cookie_id: "__cfduid",
                        description: {
                            en:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in Sprend and does not store any personally identifiable information.",
                            de:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            fr:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            it:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            es:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            nl:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            bg:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            da:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            ru:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            ar:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            pl:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            pt:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            ca:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            hu:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            se:
                                "Denna cookie anv\u00e4nds av cdn-tj\u00e4nster s\u00e5som CloudFare f\u00f6r att identifiera individuella klienter bakom en delad ip-adress och anv\u00e4nda s\u00e4kerhetsinst\u00e4llningar. Den \u00e4r inte kopplad till en anv\u00e4ndaridentitet i Sprend, eller lagrar persondata.",
                            cr:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            zh:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            uk:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            sk:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            tr:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            lt:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            cs:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            fi:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            no:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            "pt-br":
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            sl:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                        },
                        duration: "1 month",
                        type: "https",
                        domain: ".cdn-cookieyes.com",
                    },
                    {
                        id: 380721,
                        cookie_id: "UploadTracker",
                        description: {
                            en: "This cookie is used to limit the number of transfers to ten per month for a user of Sprend Free.",
                            se: "Denna cookie anv\u00e4nds f\u00f6r att begr\u00e4nsa antalet \u00f6verf\u00f6ringar till tio per m\u00e5nad f\u00f6r en gratisanv\u00e4ndare.",
                        },
                        duration: "30 days",
                        type: "https",
                        domain: "sprend.com",
                    },
                    {
                        id: 380724,
                        cookie_id: "SPRING_SECURITY_REMEMBER_ME_COOKIE",
                        description: {
                            en: "This cookie makes it possible to auto-login and to make sure long-lasting file transfers are completed.",
                            se: "Denna cookie g\u00f6r det m\u00f6jligt att logga in automatiskt och m\u00f6jligg\u00f6r fil\u00f6verf\u00f6ringar som tar l\u00e5ng tid att slutf\u00f6ra.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: "sprend.com",
                    },
                ],
            },
            {
                id: 201367,
                slug: "analytics",
                order: 3,
                name: { en: "Analytics", se: "Analytiska" },
                defaultConsent: 0,
                active: 1,
                settings: null,
                type: 2,
                description: {
                    en: "<p>Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.</p>",
                    se:
                        "<p>Analytiska cookies anv\u00e4nds f\u00f6r att f\u00f6rst\u00e5 hur bes\u00f6kare interagerar med webbplatsen. Dessa cookies hj\u00e4lper till att ge information om m\u00e4tv\u00e4rden, antal bes\u00f6kare, avvisningsfrekvens, trafikk\u00e4lla etc.</p>",
                },
                cookies: [
                    {
                        id: 372431,
                        cookie_id: "_ga",
                        description: {
                            en: "This cookie is used by Google's analytics and advertising tools.",
                            de:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            fr:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            it:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            es:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            nl:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            bg:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            da:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            ru:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            ar:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            pl:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            pt:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            ca:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            hu:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            se: "Denna cookie anv\u00e4nds av Googles analys- och annonseringsverktyg.",
                            cr:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            zh:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            uk:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            sk:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            tr:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            lt:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            cs:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            fi:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            no:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            "pt-br":
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            sl:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                        },
                        duration: "2 years",
                        type: "https",
                        domain: ".sprend.com",
                    },
                    {
                        id: 372432,
                        cookie_id: "_gid",
                        description: {
                            en: "This cookie is used by Google's analytics and advertising tools.",
                            de:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            fr:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            it:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            es:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            nl:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            bg:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            da:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            ru:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            ar:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            pl:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            pt:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            ca:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            hu:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            se: "Denna cookie anv\u00e4nds av Googles analys- och annonseringsverktyg.",
                            cr:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            zh:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            uk:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            sk:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            tr:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            lt:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            cs:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            fi:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            no:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            "pt-br":
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            sl:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                        },
                        duration: "1 day",
                        type: "https",
                        domain: ".sprend.com",
                    },
                ],
            },
            {
                id: 201369,
                slug: "advertisement",
                order: 5,
                name: { en: "Advertisement", se: "Annons" },
                defaultConsent: 0,
                active: 1,
                settings: null,
                type: 2,
                description: {
                    en: "<p>Advertisement cookies are used to deliver visitors with customized advertisements based on the pages they visited before and analyze the effectiveness of the ad campaign.</p>",
                    se: "<p>Annonscookies anv\u00e4nds f\u00f6r att leverera bes\u00f6kare med anpassade annonser baserat p\u00e5 de sidor de bes\u00f6kte tidigare och analysera effektiviteten i annonskampanjen.</p>",
                },
                scripts: [
                    {
                        id: 68895,
                        name: {
                            en: "Microsoft",
                            de: "Microsoft",
                            fr: "Microsoft",
                            it: "Microsoft",
                            es: "Microsoft",
                            nl: "Microsoft",
                            bg: "Microsoft",
                            da: "Microsoft",
                            ru: "Microsoft",
                            ar: "Microsoft",
                            pl: "Microsoft",
                            pt: "Microsoft",
                            ca: "Microsoft",
                            hu: "Microsoft",
                            se: "Microsoft",
                            cr: "Microsoft",
                            zh: "Microsoft",
                            uk: "Microsoft",
                            sk: "Microsoft",
                            tr: "Microsoft",
                            lt: "Microsoft",
                            cs: "Microsoft",
                            fi: "Microsoft",
                            no: "Microsoft",
                            "pt-br": "Microsoft",
                            sl: "Microsoft",
                        },
                        description: {
                            en: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            de: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            fr: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            it: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            es: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            nl: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            bg: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            da: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            ru: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            ar: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            pl: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            pt: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            ca: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            hu: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            se: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            cr: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            zh: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            uk: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            sk: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            tr: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            lt: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            cs: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            fi: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            no: "Microsoft uses cookies to track user behavior for advertising purposes.",
                            "pt-br": "Microsoft uses cookies to track user behavior for advertising purposes.",
                            sl: "Microsoft uses cookies to track user behavior for advertising purposes.",
                        },
                        cookie_ids: "MUID, CLID, _clck, SM, SRM_B, ANONCHK",
                        active: 1,
                        head_script:
                            '<script type="text/javascript">\n\t\t\t\t<!-- Microsoft Clarity -->\n\t\t\t\t(function(c,l,a,r,i,t,y){\n\t\t\t\t\tc[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};\n\t\t\t\t\tt=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;\n\t\t\t\t\ty=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);\n\t\t\t\t})(window, document, "clarity", "script", "61m0mzfdu8");\n\t\t\t</script>',
                        body_script: null,
                    },
                    {
                        id: 68896,
                        name: {
                            en: "Facebook",
                            de: "Facebook",
                            fr: "Facebook",
                            it: "Facebook",
                            es: "Facebook",
                            nl: "Facebook",
                            bg: "Facebook",
                            da: "Facebook",
                            ru: "Facebook",
                            ar: "Facebook",
                            pl: "Facebook",
                            pt: "Facebook",
                            ca: "Facebook",
                            hu: "Facebook",
                            se: "Facebook",
                            cr: "Facebook",
                            zh: "Facebook",
                            uk: "Facebook",
                            sk: "Facebook",
                            tr: "Facebook",
                            lt: "Facebook",
                            cs: "Facebook",
                            fi: "Facebook",
                            no: "Facebook",
                            "pt-br": "Facebook",
                            sl: "Facebook",
                        },
                        description: {
                            en: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            de: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            fr: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            it: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            es: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            nl: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            bg: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            da: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            ru: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            ar: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            pl: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            pt: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            ca: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            hu: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            se: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            cr: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            zh: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            uk: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            sk: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            tr: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            lt: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            cs: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            fi: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            no: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            "pt-br": "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            sl: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                        },
                        cookie_ids: "wd, _fbp, fr",
                        active: 1,
                        head_script:
                            "<script>\n\t\t\t\t<!-- Facebook Pixel Code -->\n\t\t\t\t!function(f,b,e,v,n,t,s)\n\t\t\t\t{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\n\t\t\t\t\t\t  n.callMethod.apply(n,arguments):n.queue.push(arguments)};\n\t\t\t\t\tif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\n\t\t\t\t\tn.queue=[];t=b.createElement(e);t.async=!0;\n\t\t\t\t\tt.src=v;s=b.getElementsByTagName(e)[0];\n\t\t\t\t\ts.parentNode.insertBefore(t,s)}(window, document,'script',\n\t\t\t\t\t\t  'https://connect.facebook.net/en_US/fbevents.js');\n\t\t\t\tfbq('init', '834543670728674');\n\t\t\t\tfbq('track', 'PageView');\n\t\t\t</script>\n\t\t\t<noscript><img height=\"1\" width=\"1\" style=\"display:none\"\n\t\t\t               src=\"https://www.facebook.com/tr?id=834543670728674&ev=PageView&noscript=1\"\n\t\t\t/></noscript>",
                        body_script: null,
                    },
                    {
                        id: 69988,
                        name: { en: "Google", se: "Google" },
                        description: { en: "Google scripts", se: "Google scripts" },
                        cookie_ids: "_ga, _gid, _gat_gtag_UA_159557369_1",
                        active: 1,
                        head_script:
                            "<script async src=\"https://www.googletagmanager.com/gtag/js?id=UA-159557369-1\"></script>\n\t\t\t<script>\n\t\t\t\t<!-- Global site tag (gtag.js) - Google Analytics -->\n\t\t\t\t\t\t  window.dataLayer = window.dataLayer || [];\n\t\t\t\t\tgtag = function(){dataLayer.push(arguments);}\n\t\t\t\t\tgtag('js', new Date());\n\t\t\t\t\tgtag('config', 'UA-159557369-1');\n\t\t\t</script>",
                        body_script: null,
                    },
                ],
                cookies: [
                    {
                        id: 372417,
                        cookie_id: "CLID",
                        description: {
                            en: "This cookie is used by the analytics tools Microsoft Clarity to understand how visitors use Sprend.",
                            de: "No description",
                            fr: "No description",
                            it: "No description",
                            es: "No description",
                            nl: "No description",
                            bg: "No description",
                            da: "No description",
                            ru: "No description",
                            ar: "No description",
                            pl: "No description",
                            pt: "No description",
                            ca: "No description",
                            hu: "No description",
                            se: "Denna cookie anv\u00e4nds av analysverktyget Microsoft Clarity for att f\u00f6r att f\u00f6rst\u00e5 hur bes\u00f6kare anv\u00e4nder Sprend.",
                            cr: "No description",
                            zh: "No description",
                            uk: "No description",
                            sk: "No description",
                            tr: "No description",
                            lt: "No description",
                            cs: "No description",
                            fi: "No description",
                            no: "No description",
                            "pt-br": "No description",
                            sl: "No description",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: "www.clarity.ms",
                    },
                    {
                        id: 372418,
                        cookie_id: "SM",
                        description: {
                            en: "This cookie is used by the analytics tools Microsoft Clarity to understand how visitors use Sprend.",
                            de: "No description",
                            fr: "No description",
                            it: "No description",
                            es: "No description",
                            nl: "No description",
                            bg: "No description",
                            da: "No description",
                            ru: "No description",
                            ar: "No description",
                            pl: "No description",
                            pt: "No description",
                            ca: "No description",
                            hu: "No description",
                            se: "Denna cookie anv\u00e4nds av analysverktyget Microsoft Clarity for att f\u00f6r att f\u00f6rst\u00e5 hur bes\u00f6kare anv\u00e4nder Sprend.",
                            cr: "No description",
                            zh: "No description",
                            uk: "No description",
                            sk: "No description",
                            tr: "No description",
                            lt: "No description",
                            cs: "No description",
                            fi: "No description",
                            no: "No description",
                            "pt-br": "No description",
                            sl: "No description",
                        },
                        duration: "session",
                        type: "https",
                        domain: ".c.clarity.ms",
                    },
                    {
                        id: 372419,
                        cookie_id: "SRM_B",
                        description: {
                            en: "This is an advertising cookie used by Bing.",
                            de: "No description",
                            fr: "No description",
                            it: "No description",
                            es: "No description",
                            nl: "No description",
                            bg: "No description",
                            da: "No description",
                            ru: "No description",
                            ar: "No description",
                            pl: "No description",
                            pt: "No description",
                            ca: "No description",
                            hu: "No description",
                            se: "Detta \u00e4r en cookie f\u00f6r annonshantering som anv\u00e4nds av Bing.",
                            cr: "No description",
                            zh: "No description",
                            uk: "No description",
                            sk: "No description",
                            tr: "No description",
                            lt: "No description",
                            cs: "No description",
                            fi: "No description",
                            no: "No description",
                            "pt-br": "No description",
                            sl: "No description",
                        },
                        duration: "1 year 24 days",
                        type: "https",
                        domain: ".c.bing.com",
                    },
                    {
                        id: 372420,
                        cookie_id: "_gat_gtag_UA_159557369_1",
                        description: {
                            en: "This cookie is used by Google's advertising tools.",
                            de: "No description",
                            fr: "No description",
                            it: "No description",
                            es: "No description",
                            nl: "No description",
                            bg: "No description",
                            da: "No description",
                            ru: "No description",
                            ar: "No description",
                            pl: "No description",
                            pt: "No description",
                            ca: "No description",
                            hu: "No description",
                            se: "Denna cookie anv\u00e4nds av Googles annonseringsverktyg.",
                            cr: "No description",
                            zh: "No description",
                            uk: "No description",
                            sk: "No description",
                            tr: "No description",
                            lt: "No description",
                            cs: "No description",
                            fi: "No description",
                            no: "No description",
                            "pt-br": "No description",
                            sl: "No description",
                        },
                        duration: "1 minute",
                        type: "http",
                        domain: ".sprend.com",
                    },
                    {
                        id: 372421,
                        cookie_id: "_clck",
                        description: {
                            en: "This cookie is used by the analytics tools Microsoft Clarity to understand how visitors use Sprend.",
                            de: "No description",
                            fr: "No description",
                            it: "No description",
                            es: "No description",
                            nl: "No description",
                            bg: "No description",
                            da: "No description",
                            ru: "No description",
                            ar: "No description",
                            pl: "No description",
                            pt: "No description",
                            ca: "No description",
                            hu: "No description",
                            se: "Denna cookie anv\u00e4nds av analysverktyget Microsoft Clarity for att f\u00f6r att f\u00f6rst\u00e5 hur bes\u00f6kare anv\u00e4nder Sprend.",
                            cr: "No description",
                            zh: "No description",
                            uk: "No description",
                            sk: "No description",
                            tr: "No description",
                            lt: "No description",
                            cs: "No description",
                            fi: "No description",
                            no: "No description",
                            "pt-br": "No description",
                            sl: "No description",
                        },
                        duration: "1 year",
                        type: "http",
                        domain: "sprend.com",
                    },
                    {
                        id: 372427,
                        cookie_id: "MUID",
                        description: {
                            en: "Used by Microsoft as a unique identifier. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            de:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            fr:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            it:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            es:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            nl:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            bg:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            da:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            ru:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            ar:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            pl:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            pt:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            ca:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            hu:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            se: "Anv\u00e4nds av Microsoft som en unik identifierare. Syftet \u00e4r kunna f\u00f6lja en anv\u00e4ndare \u00f6ver flera olika Microsoft-dom\u00e4ner.",
                            cr:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            zh:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            uk:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            sk:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            tr:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            lt:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            cs:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            fi:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            no:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            "pt-br":
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                            sl:
                                "Used by Microsoft as a unique identifier. The cookie is set by embedded Microsoft scripts. The purpose of this cookie is to synchronize the ID across many different Microsoft domains to enable user tracking.",
                        },
                        duration: "1 year 24 days",
                        type: "https",
                        domain: ".clarity.ms",
                    },
                    {
                        id: 372428,
                        cookie_id: "ANONCHK",
                        description: {
                            en: "This cookie is used by Bing for advertising purposes.",
                            de:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            fr:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            it:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            es:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            nl:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            bg:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            da:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            ru:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            ar:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            pl:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            pt:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            ca:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            hu:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            se: "Denna cookie anv\u00e4nds av Bing f\u00f6r annonserings-\u00e4ndam\u00e5l.",
                            cr:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            zh:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            uk:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            sk:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            tr:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            lt:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            cs:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            fi:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            no:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            "pt-br":
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                            sl:
                                "This cookie is used for storing the session ID for a user. This cookie ensures that clicks from advertisement on the Bing search engine are verified and it is used for reporting purposes and for personalization.",
                        },
                        duration: "10 minutes",
                        type: "https",
                        domain: ".c.clarity.ms",
                    },
                    {
                        id: 372429,
                        cookie_id: "_fbp",
                        description: {
                            en: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            de: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            fr: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            it: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            es: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            nl: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            bg: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            da: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            ru: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            ar: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            pl: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            pt: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            ca: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            hu: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            se: "Denna cookie s\u00e4tts av Facebook f\u00f6r att kunna visa annonser f\u00f6r Sprends bes\u00f6kare, p\u00e5 Facebook eller en annan plattform som anv\u00e4nder Facebooks teknologi.",
                            cr: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            zh: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            uk: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            sk: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            tr: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            lt: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            cs: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            fi: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            no: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            "pt-br": "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            sl: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".sprend.com",
                    },
                    {
                        id: 372430,
                        cookie_id: "fr",
                        description: {
                            en: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            de:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            fr:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            it:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            es:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            nl:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            bg:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            da:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            ru:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            ar:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            pl:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            pt:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            ca:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            hu:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            se: "Denna cookie s\u00e4tts av Facebook f\u00f6r att kunna visa annonser f\u00f6r Sprends bes\u00f6kare, p\u00e5 Facebook eller en annan plattform som anv\u00e4nder Facebooks teknologi.",
                            cr:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            zh:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            uk:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            sk:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            tr:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            lt:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            cs:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            fi:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            no:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            "pt-br":
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            sl:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".facebook.com",
                    },
                ],
            },
        ],
        privacyPolicy: {
            title: { en: "Cookie Policy", se: "Cookiehantering" },
            text: {
                en:
                    "<p>This website uses cookies to improve your experience while you navigate through the website. Out of these cookies, the cookies that are categorized as necessary are stored on your browser as they as essential for the working of basic functionalities of the website. </p><p>We also use third-party cookies that help us analyze and understand how you use this website, to store user preferences and provide them with content and advertisements that are relevant to you. These cookies will only be stored on your browser with your consent to do so. You also have the option to opt-out of these cookies.</p>",
                se:
                    "<p>Denna webbplats anv\u00e4nder cookies f\u00f6r att f\u00f6rb\u00e4ttra din upplevelse medan du navigerar genom webbplatsen. Av dessa cookies lagras de cookies som kategoriseras som n\u00f6dv\u00e4ndiga i din webbl\u00e4sare eftersom de \u00e4r v\u00e4sentliga f\u00f6r att de grundl\u00e4ggande funktionerna p\u00e5 webbplatsen ska fungera.</p><p>Vi anv\u00e4nder ocks\u00e5 cookies fr\u00e5n tredje part som hj\u00e4lper oss att analysera och f\u00f6rst\u00e5 hur du anv\u00e4nder denna webbplats, f\u00f6r att lagra anv\u00e4ndarinst\u00e4llningar och f\u00f6rse dem med inneh\u00e5ll och annonser som \u00e4r relevanta f\u00f6r dig. Dessa cookies lagras endast i din webbl\u00e4sare med ditt samtycke till att g\u00f6ra det. Du har ocks\u00e5 m\u00f6jlighet att v\u00e4lja bort dessa cookies.</p>",
            },
        },
    },
};
var cookieyesID = btoa(randomString(32)); //btoa(+new Date);
let loadAnalyticsByDefault = false;
cliConfig.info.categories.forEach(function (category) {
    if (category.slug === "analytics" && category.settings !== null && "loadAnalyticsByDefault" in category.settings) {
        loadAnalyticsByDefault = category.settings.loadAnalyticsByDefault;
    }
});
window.addEventListener("load", function () {
    var createBannerOnLoad = function createBannerOnLoad(ckyActiveLaw) {
        Element.prototype.remove = function () {
            this.parentElement.removeChild(this);
        };
        NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
            for (var i = this.length - 1; i >= 0; i--) {
                if (this[i] && this[i].parentElement) {
                    this[i].parentElement.removeChild(this[i]);
                }
            }
        };
        var options = cliConfig.options;
        var content = options.content;
        var display = options.display;
        var info = cliConfig.info;
        var categories = info.categories;
        var privacyPolicy = info.privacyPolicy;
        var template = options.template;
        var colors = options.colors;
        var behaviour = options.behaviour;
        var selectedLanguage = behaviour.selectedLanguage;
        selectedLanguage = checkSelectedLanguage(selectedLanguage, ckyActiveLaw);
        var position = options.position;
        var head = document.head || document.getElementsByTagName("head")[0];
        var body = document.body || document.getElementsByTagName("body")[0];
        var css = template.css + options.customCss;
        var style = document.createElement("style");
        head.appendChild(style);
        style.type = "text/css";
        style.setAttribute("id", "cky-style");
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        var cookieExpiry = options.cookieExpiry === undefined ? 365 : options.cookieExpiry;
        var cookie = {
            ACCEPT_COOKIE_EXPIRE: cookieExpiry,
            set: function (name, value, days) {
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                    var expires = "; expires=" + date.toGMTString();
                } else var expires = "";
                var cliCookie = name + "=" + value + expires + "; path=/;domain=." + tldomain;
                document.cookie = cliCookie;
            },
            read: function (cname) {
                var name = cname + "=";
                var decodedCookie = decodeURIComponent(document.cookie);
                var ca = decodedCookie.split(";");
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == " ") {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) == 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            },
            erase: function (name) {
                this.set(name, "", -1);
            },
            exists: function (name) {
                return this.read(name) !== null;
            },
        };
        var bannerFunctions = {
            accept: function () {
                acceptCookies("all");
            },
            reject: function () {
                rejectCookies();
            },
            settings: function () {
                switch (template.detailType) {
                    case "sticky":
                        showHideStickyDetail();
                        break;
                    case "popup":
                        showPopupDetail();
                }
            },
            doNotSell: function () {
                ccpaShowPopupDetail();
            },
        };
        var positionValue = {
            bottom: { top: "auto", right: "0", bottom: "0", left: "auto" },
            top: { top: "0", right: "0", bottom: "auto", left: "auto" },
            "bottom-left": { top: "auto", right: "auto", bottom: "20px", left: "20px" },
            "bottom-right": { top: "auto", right: "20px", bottom: "20px", left: "auto" },
            "top-left": { top: "20px", right: "auto", bottom: "auto", left: "20px" },
            "top-right": { top: "20px", right: "20px", bottom: "auto", left: "auto" },
        };
        function getById(element) {
            return document.getElementById(element);
        }
        function getByClass(element) {
            return document.getElementsByClassName(element);
        }
        function renderBanner() {
            createBanner();
            if (selectedLanguage == "ar") {
                document.getElementById("cky-consent").classList.add("cky-rtl");
                if (options.consentBarType == "banner" || options.consentBarType == "box") {
                    setTimeout(function () {
                        document.getElementById("cky-settings-popup").classList.add("cky-rtl");
                    }, 100);
                }
            }
            getById("cky-consent").classList.add("cky-" + options.consentBarType);
            if (options.consentBarType == "box") {
                getById("cky-consent").classList.add("box-" + options.position);
            }
            if (!!content[ckyActiveLaw].customLogoUrl) {
                appendLogo();
            }
            appendText();
            if (options.showCategoryDirectly) {
                renderCategoryBar();
            }
            renderButtons();
        }
        if (options.display[ckyActiveLaw].notice) {
            if (cookie.read("cky-action") === "") {
                if (cookie.read("cookieyesID") === "") {
                    cookie.set("cookieyesID", cookieyesID, cookie.ACCEPT_COOKIE_EXPIRE);
                }
                renderBanner();
                setInitialCookies();
            } else {
                if (display[ckyActiveLaw].noticeToggler) {
                    showToggler();
                }
            }
        }
        if (cookie.read("cky-consent") === "yes") {
            checkAndInsertScripts(info.categories);
        }
        function createBanner() {
            var consentBar;
            if (!!content[ckyActiveLaw].customLogoUrl) {
                consentBar =
                    '<div class="cky-consent-bar" id="cky-consent">\
                                    <div class="cky-content-logo-outer-wrapper" id="cky-content-logo">\
                                        <divs id="cky-content-logo-inner-wrapper">\
                                            <div class="cky-content-wrapper"></div>\
                                        </div>\
                                    </div>\
                                </div>';
            } else {
                consentBar = '<div class="cky-consent-bar" id="cky-consent">\
                                    <div class="cky-content-wrapper"></div>\
                                </div>';
            }
            body.insertAdjacentHTML("beforeend", consentBar);
            document.getElementById("cky-consent").style.display = "block";
            ckyConsentBar = getById("cky-consent");
            ckyConsentBar.style.background = colors[ckyActiveLaw].notice.bg;
            ckyConsentBar.style.color = colors[ckyActiveLaw].notice.textColor;
            ckyConsentBar.style.borderWidth = "1px";
            ckyConsentBar.style.borderStyle = "solid";
            ckyConsentBar.style.borderColor = colors[ckyActiveLaw].notice.borderColor;
            ckyConsentBar.style.top = positionValue[position].top;
            ckyConsentBar.style.right = positionValue[position].right;
            ckyConsentBar.style.bottom = positionValue[position].bottom;
            ckyConsentBar.style.left = positionValue[position].left;
            if (ckyActiveLaw === "gdpr") {
                if (cliConfig.options.geoTarget["gdpr"].eu && cookie.read("cky-action") !== "yes") {
                    document.getElementById("cky-consent").style.display = "none";
                }
            } else if (ckyActiveLaw === "ccpa") {
                if ((cliConfig.options.geoTarget["ccpa"].california || cliConfig.options.geoTarget["ccpa"].us) && cookie.read("cky-action") !== "yes") {
                    document.getElementById("cky-consent").style.display = "none";
                }
            }
        }
        function appendLogo() {
            getById("cky-consent").classList.add("cky-logo-active");
            var consentLogo = '<img src="' + content[ckyActiveLaw].customLogoUrl + '" class="img-fluid cky-logo" style="width: 100px" alt="Brand logo">';
            document.querySelector("#cky-consent #cky-content-logo").insertAdjacentHTML("afterbegin", consentLogo);
        }
        function appendText() {
            if (content[ckyActiveLaw].title[selectedLanguage] !== null && /\S/.test(content[ckyActiveLaw].title[selectedLanguage])) {
                var consentTitle = '<div class="cky-consent-title" style="color:' + colors[ckyActiveLaw].notice.titleColor + '">' + content[ckyActiveLaw].title[selectedLanguage] + "</div>";
                if (!!content[ckyActiveLaw].customLogoUrl) {
                    document.querySelector("#cky-consent #cky-content-logo-inner-wrapper").insertAdjacentHTML("afterbegin", consentTitle);
                } else {
                    getById("cky-consent").insertAdjacentHTML("afterbegin", consentTitle);
                }
            }
            var consentText = '<p class="cky-bar-text" style="color:' + colors[ckyActiveLaw].notice.textColor + '">' + content[ckyActiveLaw].text[selectedLanguage] + "</p>";
            getById("cky-consent").getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("beforeend", consentText);
        }
        function renderCategoryBar() {
            var categoryDirectList = '<div class="cky-category-direct" id="cky-category-direct" style="color:' + colors[ckyActiveLaw].notice.textColor + '"></div>';
            if (options.consentBarType === "box") {
                getById("cky-consent").getElementsByClassName("cky-bar-text")[0].insertAdjacentHTML("afterend", categoryDirectList);
            } else {
                getById("cky-consent").getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("afterend", categoryDirectList);
            }
            for (var i = 0; i < categories.length; i++) {
                var category = categories[i];
                var categoryBarItem = '<div class="cky-category-direct-item"><span class="cky-category-direct-name" id="cky-category-direct-' + category.name[selectedLanguage] + '">' + category.name[selectedLanguage] + "</span></div>";
                document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML("beforeend", categoryBarItem);
                createSwitches(category);
            }
        }
        function renderButtons() {
            ckyConsentBar.getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("beforeend", '<div class="cky-button-wrapper"></div>');
            if (display[ckyActiveLaw].buttons["settings"]) {
                appendButton("settings");
                switchStickyOrPopup();
            }
            if (display[ckyActiveLaw].buttons["reject"]) {
                appendButton("reject");
            }
            if (display[ckyActiveLaw].buttons["accept"]) {
                appendButton("accept");
            }
            if (display[ckyActiveLaw].buttons["doNotSell"]) {
                var doNotSellButton = '<a class="cky-btn-doNotSell" id="cky-btn-doNotSell">' + content[ckyActiveLaw].buttons["doNotSell"][selectedLanguage] + "</a>";
                document.querySelector("#cky-consent .cky-button-wrapper").insertAdjacentHTML("beforeend", doNotSellButton);
                document.querySelector("#cky-consent #cky-btn-doNotSell").onclick = bannerFunctions["doNotSell"];
                renderCcpaPopupDetail();
                attachButtonStyles("doNotSell");
            }
            if (display[ckyActiveLaw].buttons["readMore"]) {
                let privacyLink = content[ckyActiveLaw].privacyPolicyLink[selectedLanguage].trim().replace(/\s/g, "");
                if (/^(:\/\/)/.test(privacyLink)) {
                    privacyLink = "http" + privacyLink + "";
                }
                if (!/^(f|ht)tps?:\/\//i.test(privacyLink)) {
                    privacyLink = "http://" + privacyLink + "";
                }
                var readMoreButton = '<a class="cky-btn-readMore" id="cky-btn-readMore" href="' + privacyLink + '" target="_blank">' + content[ckyActiveLaw].buttons["readMore"][selectedLanguage] + "</a>";
                document.querySelector("#cky-consent .cky-bar-text").insertAdjacentHTML("beforeend", readMoreButton);
                attachButtonStyles("readMore");
            }
        }
        function appendButton(btnName) {
            let button = '<button class="cky-btn cky-btn-' + btnName + '" id="cky-btn-' + btnName + '">' + content[ckyActiveLaw].buttons[btnName][selectedLanguage] + "</button>";
            document.querySelector("#cky-consent .cky-button-wrapper").insertAdjacentHTML("beforeend", button);
            attachButtonStyles(btnName);
            document.querySelector("#cky-consent #cky-btn-" + btnName + "").onclick = bannerFunctions[btnName];
        }
        function attachButtonStyles(btnName) {
            document.querySelector("#cky-consent #cky-btn-" + btnName + "").style =
                "\
                color: " +
                colors[ckyActiveLaw].buttons[btnName].textColor +
                ";\
                background-color: " +
                colors[ckyActiveLaw].buttons[btnName].bg +
                ";\
                border-color: " +
                colors[ckyActiveLaw].buttons[btnName].borderColor +
                ";\
            ";
        }
        function switchStickyOrPopup() {
            switch (template.detailType) {
                case "sticky":
                    document.querySelector("#cky-consent #cky-btn-settings").style.borderColor = "transparent";
                    renderStickyDetail();
                    break;
                case "popup":
                    renderPopupDetail();
            }
        }
        function renderStickyDetail() {
            var tabCss = "color:" + colors[ckyActiveLaw].popup.pills.textColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + "";
            var activeTabCss = "background-color:" + colors[ckyActiveLaw].popup.pills.activeBg + ";" + "color:" + colors[ckyActiveLaw].popup.pills.activeTextColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + ";";
            var ckyDetailWrapper =
                '<div class="cky-detail-wrapper" id="cky-detail-wrapper" style="border-color:' +
                colors[ckyActiveLaw].notice.borderColor +
                '">\
                                            <div class="cky-tab">\
                                                <div class="cky-tab-menu" id="cky-tab-menu" style="background-color:' +
                colors[ckyActiveLaw].popup.pills.bg +
                '"></div>\
                                                    <div class="cky-tab-content" id="cky-tab-content" style="background-color:' +
                colors[ckyActiveLaw].notice.bg +
                '">\
                                                    </div>\
                                                </div>\
                                        </div>';
            getById("cky-consent").insertAdjacentHTML("beforeend", ckyDetailWrapper);
            if (behaviour.showLogo) {
                var ckyPoweredLink =
                    '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
                getById("cky-detail-wrapper").insertAdjacentHTML("beforeend", ckyPoweredLink);
            }
            for (var i = 0; i < categories.length + 1; i++) {
                if (i === 0) {
                    var ckyTabItem = '<div class="cky-tab-item cky-tab-item-active" id="cky-tab-item-privacy" tab-target="cky-tab-content-privacy" style="' + activeTabCss + '">' + privacyPolicy.title[selectedLanguage] + "</div>";
                    var ckyTabContentItem =
                        '<div class="cky-tab-content-item cky-tab-content-active" id="cky-tab-content-privacy">\
                                                    <div class="cky-tab-title" style="color:' +
                        colors[ckyActiveLaw].notice.textColor +
                        '">' +
                        privacyPolicy.title[selectedLanguage] +
                        '</div>\
                                                    <div class="cky-tab-desc" style="color:' +
                        colors[ckyActiveLaw].notice.textColor +
                        '">' +
                        privacyPolicy.text[selectedLanguage] +
                        "</div>\
                                                </div>";
                    document.querySelector("#cky-consent #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
                    document.querySelector("#cky-consent #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
                } else {
                    var category = categories[i - 1];
                    var ckyTabItem =
                        '<div class="cky-tab-item" id="cky-tab-item-' +
                        category.name[selectedLanguage] +
                        '" tab-target="cky-tab-content-' +
                        category.name[selectedLanguage] +
                        '" style="' +
                        tabCss +
                        '">' +
                        category.name[selectedLanguage] +
                        "</div>";
                    document.querySelector("#cky-consent #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
                    var ckyTabContentItem =
                        '<div class="cky-tab-content-item" id="cky-tab-content-' +
                        category.name[selectedLanguage] +
                        '">\
                                                    <div class="cky-tab-title" id="cky-tab-title-' +
                        category.name[selectedLanguage] +
                        '" style="color:' +
                        colors[ckyActiveLaw].notice.textColor +
                        '">' +
                        category.name[selectedLanguage] +
                        '</div>\
                                                    <div class="cky-tab-desc" style="color:' +
                        colors[ckyActiveLaw].notice.textColor +
                        '">' +
                        category.description[selectedLanguage] +
                        "</div>\
                                                </div>";
                    document.querySelector("#cky-consent #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
                    if (!options.showCategoryDirectly) {
                        createSwitches(category);
                    }
                    if (behaviour.showAuditTable) {
                        renderAuditTable(true, category);
                    }
                }
            }
            var ckyTabs = document.querySelectorAll("#cky-consent .cky-tab-item");
            for (var i = 0; i < ckyTabs.length; i++) {
                ckyTabs[i].onclick = function () {
                    currentActiveTab = getByClass("cky-tab-item-active")[0];
                    currentActiveTab.classList.remove("cky-tab-item-active");
                    currentActiveTab.setAttribute("style", tabCss);
                    this.classList.add("cky-tab-item-active");
                    this.setAttribute("style", activeTabCss);
                    document.querySelector("#cky-consent .cky-tab-content-active").classList.remove("cky-tab-content-active");
                    var tabId = this.getAttribute("tab-target");
                    getById(tabId).className += " cky-tab-content-active";
                };
            }
            var customAcceptButton =
                '<button class="cky-btn cky-btn-custom-accept"\
            style = "\
                            color: ' +
                colors[ckyActiveLaw].popup.acceptCustomButton.textColor +
                ";\
                            background-color: " +
                colors[ckyActiveLaw].popup.acceptCustomButton.bg +
                ";\
                            border-color: " +
                colors[ckyActiveLaw].popup.acceptCustomButton.borderColor +
                ';\
                        "\
            id="cky-btn-custom-accept">' +
                content[ckyActiveLaw].customAcceptButton[selectedLanguage] +
                "</button>";
            if (options.showCategoryDirectly) {
                document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML("beforeend", customAcceptButton);
            } else {
                document.querySelector("#cky-consent #cky-tab-menu").insertAdjacentHTML("beforeend", customAcceptButton);
            }
            getById("cky-btn-custom-accept").onclick = function () {
                acceptCookies("customAccept");
            };
            getById("cky-detail-wrapper").style.display = "none";
        }
        function renderCcpaPopupDetail() {
            let ccpaDetailPopupOverlay = '<div class="cky-modal-backdrop cky-fade" id="cky-ccpa-modal-backdrop"></div>';
            let ccpaDetailPopup =
                '<div class="cky-modal cky-fade ccpa" id="cky-ccpa-settings-popup">\
                                    <div class="cky-modal-dialog" style="background-color:' +
                colors[ckyActiveLaw].notice.bg +
                '">\
                                        <div class="cky-modal-content" id="cky-modal-content">\
                                        <div class="cky-opt-out-text" style="color:' +
                colors[ckyActiveLaw].notice.textColor +
                ';">' +
                content[ckyActiveLaw].confirmation.text[selectedLanguage] +
                '</div>\
                                            <div class="cky-button-wrapper">\
                                                <button type="button" class="cky-btn cky-btn-cancel" id="cky-btn-cancel"\
                                                style="color:' +
                colors[ckyActiveLaw].buttons["cancel"].textColor +
                ";\
                                                border-color:" +
                colors[ckyActiveLaw].buttons["cancel"].borderColor +
                ";\
                                                background-color:" +
                colors[ckyActiveLaw].buttons["cancel"].bg +
                ';\
                                                ">\
                                                ' +
                content[ckyActiveLaw].buttons.cancel[selectedLanguage] +
                '\
                                                </button>\
                                                <button type="button" class="cky-btn cky-btn-confirm" id="cky-btn-confirm"\
                                                style="color:' +
                colors[ckyActiveLaw].buttons["confirm"].textColor +
                ";\
                                                border-color:" +
                colors[ckyActiveLaw].buttons["confirm"].borderColor +
                ";\
                                                background-color:" +
                colors[ckyActiveLaw].buttons["confirm"].bg +
                ';\
                                                ">\
                                                ' +
                content[ckyActiveLaw].buttons.confirm[selectedLanguage] +
                "\
                                                </button>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>";
            body.insertAdjacentHTML("beforeend", ccpaDetailPopupOverlay);
            body.insertAdjacentHTML("beforeend", ccpaDetailPopup);
            if (behaviour.showLogo) {
                var ckyPoweredLink =
                    '<div style="padding-top: 16px;font-size: 8px;color: ' +
                    colors[ckyActiveLaw].notice.textColor +
                    ';font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
                getById("cky-modal-content").insertAdjacentHTML("beforeend", ckyPoweredLink);
            }
            getById("cky-btn-cancel").onclick = closeCkyCcpaModal;
            getById("cky-btn-confirm").onclick = acceptCookies;
        }
        function calculateTabDescriptionHeight() {
            let calculatedTabMenuHeight = document.querySelector("#cky-tab-menu").offsetHeight;
            calculatedTabMenuHeight = calculatedTabMenuHeight - 60;
            document.querySelectorAll(".cky-tab-desc").forEach(function (item) {
                item.style.height = calculatedTabMenuHeight + "px";
            });
        }
        function createSwitches(category) {
            var cookieStatus = cookie.read("cookieyes-" + category.slug);
            var ckySwitchStatus;
            if (cookieStatus === "") {
                if (JSON.parse(category.defaultConsent)) {
                    ckySwitchStatus = "checked";
                } else {
                    ckySwitchStatus = "";
                }
            } else {
                if (cookieStatus === "yes") {
                    ckySwitchStatus = "checked";
                } else {
                    ckySwitchStatus = "";
                }
            }
            var categoryCheckbox =
                '\
                    <label class="cky-switch" for="cky-checkbox-category' +
                category.name[selectedLanguage] +
                '" onclick="event.stopPropagation();">\
                        <input type="checkbox" id="cky-checkbox-category' +
                category.name[selectedLanguage] +
                '" ' +
                ckySwitchStatus +
                '/>\
                        <div class="cky-slider"></div>\
                    </label>';
            if (options.showCategoryDirectly) {
                getById("cky-category-direct-" + category.name[selectedLanguage] + "").insertAdjacentHTML("beforebegin", categoryCheckbox);
            } else {
                getById("cky-tab-title-" + category.name[selectedLanguage] + "").insertAdjacentHTML("beforeend", categoryCheckbox);
            }
            if (category.type === 1) {
                getById("cky-checkbox-category" + category.name[selectedLanguage] + "").setAttribute("disabled", true);
            }
        }
        function renderPopupDetail() {
            var tabCss = "color:" + colors[ckyActiveLaw].popup.pills.textColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + "";
            var activeTabCss = "background-color:" + colors[ckyActiveLaw].popup.pills.activeBg + ";" + "color:" + colors[ckyActiveLaw].popup.pills.activeTextColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + ";";
            var detailPopupOverlay = '<div class="cky-modal-backdrop cky-fade" id="cky-modal-backdrop"></div>';
            var detailPopup =
                '<div class="cky-modal cky-fade" id="cky-settings-popup">\
                                    <div class="cky-modal-dialog" style="background-color:' +
                colors[ckyActiveLaw].notice.bg +
                '">\
                                    <div class="cky-modal-content" id="cky-modal-content" style="border:1px solid' +
                colors[ckyActiveLaw].notice.borderColor +
                '">\
                                            <div class="cky-tab">\
                                                <div class="cky-tab-menu" id="cky-tab-menu" style="background-color:' +
                colors[ckyActiveLaw].popup.pills.bg +
                '"></div>\
                                                <div class="cky-tab-content" id="cky-tab-content" style="background-color:' +
                colors[ckyActiveLaw].notice.bg +
                '">\
                                                    <button type="button" class="cky-modal-close" id="ckyModalClose">\
                                                        <img src="https://cdn-cookieyes.com/assets/images/icons/close.svg" style="width: 9px" alt="modal-close-icon">\
                                                    </button>\
                                                </div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';
            body.insertAdjacentHTML("beforeend", detailPopupOverlay);
            body.insertAdjacentHTML("beforeend", detailPopup);
            if (behaviour.showLogo) {
                var ckyPoweredLink =
                    '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
                document.querySelector("#cky-settings-popup #cky-modal-content").insertAdjacentHTML("beforeend", ckyPoweredLink);
            }
            for (var i = 0; i < categories.length + 1; i++) {
                if (i === 0) {
                    var ckyTabItem = '<div class="cky-tab-item cky-tab-item-active" id="cky-tab-item-privacy" tab-target="cky-tab-content-privacy" style="' + activeTabCss + '">' + privacyPolicy.title[selectedLanguage] + "</div>";
                    var ckyTabContentItem =
                        '<div class="cky-tab-content-item cky-tab-content-active" id="cky-tab-content-privacy">\
                                                    <div class="cky-tab-title" style="color:' +
                        colors[ckyActiveLaw].notice.textColor +
                        '">' +
                        privacyPolicy.title[selectedLanguage] +
                        '</div>\
                                                    <div class="cky-tab-desc" style="color:' +
                        colors[ckyActiveLaw].notice.textColor +
                        '">' +
                        privacyPolicy.text[selectedLanguage] +
                        "</div>\
                                                </div>";
                    document.querySelector("#cky-settings-popup #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
                    document.querySelector("#cky-settings-popup #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
                } else {
                    var category = categories[i - 1];
                    var ckyTabItem =
                        '<div class="cky-tab-item" id="cky-tab-item-' +
                        category.name[selectedLanguage] +
                        '" tab-target="cky-tab-content-' +
                        category.name[selectedLanguage] +
                        '" style="' +
                        tabCss +
                        '">' +
                        category.name[selectedLanguage] +
                        "</div>";
                    var ckyTabContentItem =
                        '<div class="cky-tab-content-item" id="cky-tab-content-' +
                        category.name[selectedLanguage] +
                        '">\
                                                    <div class="cky-tab-title" id="cky-tab-title-' +
                        category.name[selectedLanguage] +
                        '" style="color:' +
                        colors[ckyActiveLaw].notice.textColor +
                        '">' +
                        category.name[selectedLanguage] +
                        '</div>\
                                                    <div class="cky-tab-desc" style="color:' +
                        colors[ckyActiveLaw].notice.textColor +
                        '">' +
                        category.description[selectedLanguage] +
                        "</>\
                                                </div>";
                    document.querySelector("#cky-settings-popup #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
                    document.querySelector("#cky-settings-popup #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
                    if (!options.showCategoryDirectly) {
                        createSwitches(category);
                    }
                    if (behaviour.showAuditTable) {
                        renderAuditTable(true, category);
                    }
                }
            }
            var ckyTabs = getByClass("cky-tab-item");
            for (var i = 0; i < ckyTabs.length; i++) {
                ckyTabs[i].onclick = function () {
                    currentActiveTab = getByClass("cky-tab-item-active")[0];
                    currentActiveTab.classList.remove("cky-tab-item-active");
                    currentActiveTab.setAttribute("style", tabCss);
                    this.classList.add("cky-tab-item-active");
                    this.setAttribute("style", activeTabCss);
                    document.querySelector("#cky-settings-popup .cky-tab-content-active").classList.remove("cky-tab-content-active");
                    var tabId = this.getAttribute("tab-target");
                    getById(tabId).className += " cky-tab-content-active";
                };
            }
            var customAcceptButton =
                '<button class="cky-btn cky-btn-custom-accept"\
            style = "\
                            color: ' +
                colors[ckyActiveLaw].popup.acceptCustomButton.textColor +
                ";\
                            background-color: " +
                colors[ckyActiveLaw].popup.acceptCustomButton.bg +
                ";\
                            border-color: " +
                colors[ckyActiveLaw].popup.acceptCustomButton.borderColor +
                ';\
                        "\
            id="cky-btn-custom-accept">' +
                content[ckyActiveLaw].customAcceptButton[selectedLanguage] +
                "</button>";
            if (options.showCategoryDirectly) {
                document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML("beforeend", customAcceptButton);
            } else {
                document.querySelector("#cky-settings-popup #cky-tab-menu").insertAdjacentHTML("beforeend", customAcceptButton);
            }
            getById("cky-btn-custom-accept").onclick = function () {
                acceptCookies("customAccept");
                document.querySelector("#cky-modal-backdrop").classList.remove("cky-show");
            };
            document.querySelector("#cky-modal-backdrop").onclick = closeCkyModal;
            document.querySelector("#cky-settings-popup #ckyModalClose").onclick = closeCkyModal;
        }
        function showHideStickyDetail() {
            if (!Element.prototype.toggleAttribute) {
                Element.prototype.toggleAttribute = function (name, force) {
                    if (force !== void 0) force = !!force;
                    if (this.hasAttribute(name)) {
                        if (force) return true;
                        this.removeAttribute(name);
                        return false;
                    }
                    if (force === false) return false;
                    this.setAttribute(name, "");
                    return true;
                };
            }
            getById("cky-btn-settings").toggleAttribute("expanded");
            if (getById("cky-btn-settings").hasAttribute("expanded")) {
                getById("cky-detail-wrapper").style.display = "block";
                calculateTabDescriptionHeight();
            } else {
                getById("cky-detail-wrapper").style.display = "none";
            }
        }
        function showPopupDetail() {
            getById("cky-settings-popup").classList.add("cky-show");
            getByClass("cky-modal-backdrop")[0].classList.add("cky-show");
            calculateTabDescriptionHeight();
        }
        function ccpaShowPopupDetail() {
            getById("cky-ccpa-settings-popup").classList.add("cky-show");
            getById("cky-ccpa-modal-backdrop").classList.add("cky-show");
        }
        function closeCkyModal() {
            getById("cky-settings-popup").classList.remove("cky-show");
            getByClass("cky-modal-backdrop")[0].classList.remove("cky-show");
        }
        function closeCkyCcpaModal() {
            getById("cky-ccpa-settings-popup").classList.remove("cky-show");
            getById("cky-ccpa-modal-backdrop").classList.remove("cky-show");
        }
        function acceptCookies(choice) {
            if (ckyActiveLaw === "gdpr") {
                updateCookies(choice);
            } else if (ckyActiveLaw === "ccpa") {
                ccpaRejectCookies();
            }
            if (typeof ckyLogCookies !== "undefined") {
                window.addEventListener("beforeunload", ckyLogCookies());
            }
            cookie.set("cky-action", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
            if (JSON.parse(behaviour.reload)) {
                location.reload();
            } else {
                cookieYes.unblock();
                showToggler();
            }
        }
        function ccpaRejectCookies() {
            cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
            for (var i = 0; i < info.categories.length; i++) {
                var category = info.categories[i];
                var ckyItemToSave = category;
                if (category.settings.ccpa.doNotSell === "1") {
                    cookie.set("cookieyes-" + ckyItemToSave.slug, "no", cookie.ACCEPT_COOKIE_EXPIRE);
                    removeDeadCookies(category);
                } else {
                    cookie.set("cookieyes-" + ckyItemToSave.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
                }
            }
        }
        function updateCookies(choice) {
            cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
            for (var i = 0; i < info.categories.length; i++) {
                var category = info.categories[i];
                if (category.type !== 1 && choice === "customAccept") {
                    var ckyItemToSave = category;
                    if (display[ckyActiveLaw].buttons.settings) {
                        var ckySwitch = document.getElementById("cky-checkbox-category" + ckyItemToSave.name[selectedLanguage] + "");
                        if (ckySwitch.checked) {
                            cookie.set("cookieyes-" + ckyItemToSave.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
                        } else {
                            cookie.set("cookieyes-" + ckyItemToSave.slug, "no", cookie.ACCEPT_COOKIE_EXPIRE);
                            removeDeadCookies(category);
                        }
                    } else {
                        if (category.defaultConsent) {
                            cookie.set("cookieyes-" + ckyItemToSave.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
                        } else {
                            cookie.set("cookieyes-" + ckyItemToSave.slug, "no", cookie.ACCEPT_COOKIE_EXPIRE);
                        }
                    }
                } else {
                    cookie.set("cookieyes-" + category.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
                }
            }
        }
        function removeDeadCookies(category) {
            if (category.cookies) {
                const cookieList = document.cookie.split("; ");
                let cookieNames = {};
                for (let j = 0; j < cookieList.length; j++) {
                    cookieNames[cookieList[j].split("=")[0]] = "true";
                }
                for (let i = 0; i < category.cookies.length; i++) {
                    if (category.cookies[i].cookie_id in cookieNames) {
                        document.cookie = category.cookies[i].cookie_id + "= ; expires = Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + category.cookies[i].domain;
                    }
                }
            }
        }
        function rejectCookies() {
            cookie.set("cky-action", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
            cookie.set("cky-consent", "no", cookie.ACCEPT_COOKIE_EXPIRE);
            rejectAllCookies();
            if (typeof ckyLogCookies !== "undefined") {
                window.addEventListener("beforeunload", ckyLogCookies());
            }
            if (JSON.parse(behaviour.reload)) {
                location.reload();
            } else {
                showToggler();
            }
        }
        function rejectAllCookies() {
            for (var i = 0; i < info.categories.length; i++) {
                var category = info.categories[i];
                if (category.type !== 1) {
                    cookie.set("cookieyes-" + category.slug, "no", cookie.ACCEPT_COOKIE_EXPIRE);
                    removeDeadCookies(category);
                } else {
                    cookie.set("cookieyes-" + category.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
                }
            }
        }
        function setInitialCookies() {
            if (behaviour.defaultConsent) {
                cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
            } else {
                cookie.set("cky-consent", "no", cookie.ACCEPT_COOKIE_EXPIRE);
            }
            for (var i = 0; i < info.categories.length; i++) {
                var category = info.categories[i];
                if (category.type !== 1 && !(category.slug === "analytics" && loadAnalyticsByDefault) && ckyActiveLaw !== "ccpa") {
                    if (category.defaultConsent) {
                        cookie.set("cookieyes-" + category.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
                    } else {
                        cookie.set("cookieyes-" + category.slug, "no", cookie.ACCEPT_COOKIE_EXPIRE);
                    }
                } else {
                    cookie.set("cookieyes-" + category.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
                }
            }
        }
        function showToggler() {
            if (document.getElementById("cky-consent")) {
                document.getElementById("cky-consent").remove();
            }
            if (document.getElementById("cky-settings-popup")) {
                document.getElementById("cky-settings-popup").remove();
            }
            if (document.getElementById("cky-ccpa-settings-popup")) {
                document.getElementById("cky-ccpa-settings-popup").remove();
            }
            if (document.querySelector("#cky-ccpa-modal-backdrop")) {
                document.querySelector("#cky-ccpa-modal-backdrop").remove();
            }
            if (JSON.parse(display[ckyActiveLaw].noticeToggler)) {
                var cliConsentBarTrigger =
                    '<div class="cky-consent-bar-trigger" id="cky-consent-toggler" onclick="revisitCkyConsent()" style="\
                    background: ' +
                    colors[ckyActiveLaw].notice.bg +
                    ";\
                    color: " +
                    colors[ckyActiveLaw].notice.textColor +
                    ";\
                    border: 1px solid " +
                    colors[ckyActiveLaw].notice.borderColor +
                    ";\
                    top: " +
                    positionValue[position].top +
                    ";\
                    right: " +
                    positionValue[position].right +
                    ";\
                    bottom: " +
                    positionValue[position].bottom +
                    ";\
                    left: " +
                    positionValue[position].left +
                    '\
                    ">' +
                    content[ckyActiveLaw].noticeToggler[selectedLanguage] +
                    "</div>";
                body.insertAdjacentHTML("beforeend", cliConsentBarTrigger);
            }
        }
        function checkAndInsertScripts(categories) {
            for (var i = 0; i < categories.length; i++) {
                var category = categories[i];
                var cookieStatus = cookie.read("cookieyes-" + category.slug);
                if (category.type === 1) {
                    insertScripts(category);
                } else {
                    if (cookieStatus === "yes") {
                        insertScripts(category);
                    }
                }
            }
        }
        function insertScripts(category) {
            if (typeof category.scripts != "undefined") {
                for (var i = 0; i < category.scripts.length; i++) {
                    var scriptItem = category.scripts[i];
                    if (scriptItem.head_script !== null) {
                        var range = document.createRange();
                        range.selectNode(document.getElementsByTagName("body")[0]);
                        var documentFragment = range.createContextualFragment(scriptItem.head_script);
                        document.body.appendChild(documentFragment);
                    }
                    if (scriptItem.body_script !== null) {
                        var range = document.createRange();
                        range.selectNode(document.getElementsByTagName("body")[0]);
                        var documentFragment = range.createContextualFragment(scriptItem.body_script);
                        document.body.appendChild(documentFragment);
                    }
                }
            }
        }
        function renderAuditTable(inBanner, category) {
            if (typeof category.cookies !== "undefined") {
                if (inBanner) {
                    var auditTableId = "cky-cookie-audit-table";
                } else {
                    var auditTableId = "cky-anywhere-cookie-audit-table";
                    var auditTableCategoryName = "<h5>" + category.name[selectedLanguage] + "</h5>";
                    var elems = document.getElementsByClassName("cky-audit-table-element");
                    for (var i = 0; i < elems.length; i++) {
                        elems[i].insertAdjacentHTML("beforeend", auditTableCategoryName);
                    }
                }
                var auditTable =
                    '\
                    <div class="cky-table-wrapper">\
                        <table id="' +
                    auditTableId +
                    category.id +
                    '" class="cky-cookie-audit-table">\
                            <thead>\
                                <tr>\
                                    <th>' +
                    content[ckyActiveLaw].auditTable.cookie[selectedLanguage] +
                    "</th>\
                                    <th>" +
                    content[ckyActiveLaw].auditTable.type[selectedLanguage] +
                    "</th>\
                                    <th>" +
                    content[ckyActiveLaw].auditTable.duration[selectedLanguage] +
                    "</th>\
                                    <th>" +
                    content[ckyActiveLaw].auditTable.description[selectedLanguage] +
                    "</th>\
                                </tr>\
                            </thead>\
                            <tbody>\
                            </tbody>\
                        </table>\
                    </div>";
                if (inBanner) {
                    getById("cky-tab-content-" + category.name[selectedLanguage] + "")
                        .getElementsByClassName("cky-tab-desc")[0]
                        .insertAdjacentHTML("beforeend", auditTable);
                } else {
                    var elems = document.getElementsByClassName("cky-audit-table-element");
                    for (var i = 0; i < elems.length; i++) {
                        elems[i].insertAdjacentHTML("beforeend", auditTable);
                    }
                }
                for (var k = 0; k < category.cookies.length; k++) {
                    var cookies = category.cookies[k];
                    var auditTableRow =
                        "<tr>\
                                                <td>" +
                        cookies.cookie_id +
                        "</td>\
                                                <td>" +
                        cookies.type +
                        "</td>\
                                                <td>" +
                        cookies.duration +
                        "</td>\
                                                <td>" +
                        cookies.description[selectedLanguage] +
                        "</td>\
                                            </tr>";
                    if (inBanner) {
                        document
                            .getElementById("cky-cookie-audit-table" + category.id + "")
                            .getElementsByTagName("tbody")[0]
                            .insertAdjacentHTML("beforeend", auditTableRow);
                    } else {
                        document
                            .getElementById("cky-anywhere-cookie-audit-table" + category.id + "")
                            .getElementsByTagName("tbody")[0]
                            .insertAdjacentHTML("beforeend", auditTableRow);
                    }
                }
            }
        }
        window.revisitCkyConsent = function () {
            const ckyBanner = document.getElementById("cky-consent");
            if (!ckyBanner) {
                renderBanner();
            }
        };
        window.revisitCkySettings = function () {
            if (ckyActiveLaw === "ccpa") {
                if (!document.getElementById("cky-ccpa-settings-popup")) {
                    renderCcpaPopupDetail();
                }
                if (!document.getElementById("cky-ccpa-settings-popup").classList.contains("cky-show")) {
                    ccpaShowPopupDetail();
                }
            }
        };
        var anywhereAuditTable = document.getElementsByClassName("cky-audit-table-element");
        if (anywhereAuditTable.length) {
            for (var i = 0; i < categories.length; i++) {
                var category = categories[i];
                renderAuditTable(false, category);
            }
        }
        if (JSON.parse(behaviour.acceptOnScroll)) {
            body.onscroll = function () {
                if (cookie.read("cky-consent") === "") {
                    acceptCookies("all");
                }
            };
        }
        document.querySelector("body").addEventListener("click", function (event) {
            if (event.target.matches(".cky-banner-element, .cky-banner-element *")) {
                if (!document.getElementById("cky-consent")) {
                    renderBanner();
                }
            }
        });
        var langObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type == "attributes") {
                    if (mutation.attributeName === "lang") {
                        if (document.getElementById("cky-settings-popup")) {
                            document.getElementById("cky-settings-popup").remove();
                        }
                        if (document.getElementById("cky-consent")) {
                            document.getElementById("cky-consent").remove();
                            selectedLanguage = checkSelectedLanguage(selectedLanguage, ckyActiveLaw);
                            renderBanner();
                        }
                    }
                }
            });
        });
        langObserver.observe(document.querySelector("html"), { attributes: true });
    };
    count(createBannerOnLoad);
});
function checkSelectedLanguage(selectedLanguage, ckyActiveLaw) {
    let siteLanguage = document.documentElement.lang;
    if (cliConfig.options.plan === "free" || !siteLanguage) {
        return selectedLanguage;
    }
    if (cliConfig.options.content[ckyActiveLaw].title[siteLanguage]) {
        return siteLanguage;
    }
    const remove_after = siteLanguage.indexOf("-");
    if (remove_after >= 1) {
        siteLanguage = siteLanguage.substring(0, remove_after);
    }
    return cliConfig.options.content[ckyActiveLaw].title[siteLanguage] ? siteLanguage : selectedLanguage;
}
function addPlaceholder(htmlElm) {
    var selectedLanguage = cliConfig.options.behaviour.selectedLanguage;
    let activeLawTemp = ckyActiveLaw ? ckyActiveLaw : cliConfig.options.selectedLaws[0];
    selectedLanguage = checkSelectedLanguage(selectedLanguage, activeLawTemp);
    var htmlElemContent = cliConfig.options.content[activeLawTemp].placeHolderText[selectedLanguage];
    var htmlElemWidth = htmlElm.getAttribute("width");
    var htmlElemHeight = htmlElm.getAttribute("height");
    if (htmlElemWidth == null) {
        htmlElemWidth = htmlElm.offsetWidth;
    }
    if (htmlElemHeight == null) {
        htmlElemHeight = htmlElm.offsetHeight;
    }
    if (htmlElemHeight == 0 || htmlElemWidth == 0) {
        htmlElemContent = "";
    }
    var Placeholder =
        '<div data-src="' +
        htmlElm.src +
        "\" style=\"background-image: url('https://cdn-cookieyes.com/assets/images/cky-placeholder.svg');background-size: 80px;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: flex-end;justify-content: center; width:" +
        htmlElemWidth +
        "px; height:" +
        htmlElemHeight +
        'px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;">' +
        htmlElemContent +
        "</div></div>";
    var youtubeID = getYoutubeID(htmlElm.src);
    if (youtubeID !== false && typeof htmlElm.src !== "undefined ") {
        youtubeThumbnail = "https://img.youtube.com/vi/" + youtubeID + "/maxresdefault.jpg";
        var Placeholder =
            '<div data-src="' +
            htmlElm.src +
            '" style="background-image: linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)), url(' +
            youtubeThumbnail +
            ");background-size: 100% 100%;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: center;justify-content: center; width:" +
            htmlElemWidth +
            "px; height:" +
            htmlElemHeight +
            'px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;display: flex; align-items: center; padding:10px 16px; background-color: rgba(0, 0, 0, 0.8); color: #ffffff;">' +
            htmlElemContent +
            "</div></div>";
    }
    Placeholder.width = htmlElemWidth;
    Placeholder.height = htmlElemHeight;
    if (htmlElm.tagName !== "IMG") {
        htmlElm.insertAdjacentHTML("beforebegin", Placeholder);
    }
}
function getYoutubeID(src) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = src.match(regExp);
    if (match && match[2].length == 11) {
        return match[2];
    } else {
        return false;
    }
}
var categoryScripts = [
    {
        name: "functional",
        list: [/youtube-nocookie.com/, /bing.com/, /vimeo.com/, /spotify.com/, /sharethis.com/, /yahoo.com/, /addtoany.com/, /dailymotion.com/, /slideshare.net/, /soundcloud.com/, /spotify.com/, /tawk.to/, /cky-functional.js/],
    },
    { name: "performance", list: [/cky-performance.js/] },
    {
        name: "analytics",
        list: [/analytics/, /googletagmanager.com/, /google-analytics.com/, /cky-analytics.js/, /hotjar.com/, /js.hs-scripts.com/, /js.hs-analytics.net/, /taboola.com/, /analytics.ycdn.de/, /plugins\/activecampaign-subscription-forms/],
    },
    {
        name: "advertisement",
        list: [
            /.addthis.com/,
            /doubleclick.net/,
            /instagram.com/,
            /amazon-adsystem.com/,
            /facebook.*/,
            /googleadservices.com/,
            /googlesyndication.com/,
            /.pinterest.com/,
            /.linkedin.com/,
            /.twitter.com/,
            /youtube.com/,
            /bluekai.com/,
            /cky-advertisement.js/,
        ],
    },
];
var backupRemovedScripts = { blacklisted: [] };
CKY_BLACKLIST = [];
CKY_WHITELIST = [];
var ckyconsent = getCategoryCookie("cky-consent") ? getCategoryCookie("cky-consent") : "no";
var TYPE_ATTRIBUTE = "javascript/blocked";
categoryScripts.forEach(function (item) {
    if (item.name === "analytics" && loadAnalyticsByDefault) {
        return;
    }
    if (ckyconsent != "yes") {
        Array.prototype.push.apply(CKY_BLACKLIST, item.list);
    } else if (getCategoryCookie("cookieyes-" + item.name) != "yes") {
        Array.prototype.push.apply(CKY_BLACKLIST, item.list);
    }
});
if (cliConfig.options.consentType == "info") {
    window.CKY_BLACKLIST = [];
}
if (navigator.doNotTrack == 1) {
    categoryScripts.forEach(function (item) {
        Array.prototype.push.apply(window.CKY_BLACKLIST, item.list);
    });
}
var patterns = { blacklist: window.CKY_BLACKLIST, whitelist: window.CKY_WHITELIST };
var isOnBlacklist = function isOnBlacklist(src) {
    return (
        src &&
        (!patterns.blacklist ||
            patterns.blacklist.some(function (pattern) {
                return pattern.test(src);
            }))
    );
};
var isOnWhitelist = function isOnWhitelist(src) {
    return (
        src &&
        (!patterns.whitelist ||
            patterns.whitelist.some(function (pattern) {
                return pattern.test(src);
            }))
    );
};
function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
}
function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    }
}
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (_ref) {
        var addedNodes = _ref.addedNodes;
        Array.prototype.forEach.call(addedNodes, function (node) {
            if ((node.nodeType === 1 && node.tagName === "SCRIPT") || node.tagName === "IFRAME") {
                var src = node.src || "";
                var type = node.type;
                if (node.hasAttribute("data-cookieyes")) {
                    if (getCategoryCookie(node.getAttribute("data-cookieyes")) != "yes") {
                        var cat = node.getAttribute("data-cookieyes");
                        if (node.src !== "" && typeof node.src !== undefined) {
                            var webdetail = new URL(node.src);
                            Array.prototype.push.apply(window.CKY_BLACKLIST, [new RegExp(webdetail.hostname)]);
                            Array.prototype.push.apply(patterns.blacklist, [new RegExp(webdetail.hostname)]);
                            categoryScripts.forEach(function (item, index) {
                                if ("cookieyes-" + item.name == cat) {
                                    Array.prototype.push.apply(this[index].list, [new RegExp(webdetail.hostname)]);
                                }
                            }, categoryScripts);
                        }
                    }
                }
                if (isOnBlacklist(src) && getCategoryCookie(node.getAttribute("data-cookieyes")) != "yes") {
                    if (node.tagName === "IFRAME") {
                        addPlaceholder(node);
                    }
                    node.type = "javascript/blocked";
                    node.parentElement.removeChild(node);
                    backupRemovedScripts.blacklisted.push(node.cloneNode());
                    node.addEventListener("beforescriptexecute", function t(e) {
                        e.preventDefault();
                        node.removeEventListener("beforescriptexecute", t);
                    });
                }
            }
        });
    });
});
observer.observe(document.documentElement, { childList: true, subtree: true });
function getCategoryCookie(name) {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return value != null ? unescape(value[1]) : "no";
}
var createElementBackup = document.createElement;
document.createElement = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }
    if (args[0].toLowerCase() !== "script") return createElementBackup.bind(document)(_toConsumableArray(args));
    var scriptElt = createElementBackup.bind(document)(_toConsumableArray(args));
    var originalSetAttribute = scriptElt.setAttribute.bind(scriptElt);
    Object.defineProperties(scriptElt, {
        src: {
            get: function () {
                return scriptElt.getAttribute("src");
            },
            set: function (value) {
                if (isOnBlacklist(value)) {
                    originalSetAttribute("type", TYPE_ATTRIBUTE);
                }
                originalSetAttribute("src", value);
                return true;
            },
        },
        type: {
            set: function (value) {
                var typeValue = isOnBlacklist(scriptElt.src) ? TYPE_ATTRIBUTE : value;
                originalSetAttribute("type", typeValue);
                return true;
            },
        },
    });
    scriptElt.setAttribute = function (name, value) {
        if (name === "type" || name === "src") scriptElt[name] = value;
        else HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value);
    };
    return scriptElt;
};
var cookieYes = {
    setCookie: function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            var expires = "; expires=" + date.toGMTString();
        } else var expires = "";
        var cliCookie = name + "=" + value + expires + "; path=/;";
        document.cookie = cliCookie;
    },
    unblock: function () {
        if (navigator.doNotTrack == 1) {
            return;
        }
        var ckyconsent = getCategoryCookie("cky-consent") ? getCategoryCookie("cky-consent") : "no";
        categoryScripts.forEach(function (item) {
            if (
                (ckyconsent == "yes" && getCategoryCookie("cookieyes-" + item.name) == "yes") ||
                (ckyActiveLaw === "ccpa" && getCategoryCookie("cky-consent") === "no") ||
                (ckyActiveLaw === "ccpa" && getCategoryCookie("cookieyes-" + item.name) === "yes")
            ) {
                Array.prototype.push.apply(CKY_WHITELIST, item.list);
                Array.prototype.push.apply(patterns.whitelist, item.list);
            }
        });
        if (backupRemovedScripts.blacklisted && backupRemovedScripts.blacklisted.length < 1) {
            observer.disconnect();
        }
        observer.disconnect();
        let indexOffset = 0;
        _toConsumableArray(backupRemovedScripts.blacklisted).forEach(function (script, index) {
            if (script.src) {
                if (isOnWhitelist(script.src)) {
                    if (script.type == "javascript/blocked") {
                        window.TYPE_ATTRIBUTE = "text/javascript";
                        script.type = "text/javascript";
                        var scriptNode = document.createElement("script");
                        scriptNode.src = script.src;
                        scriptNode.type = "text/javascript";
                        document.head.appendChild(scriptNode);
                        backupRemovedScripts.blacklisted.splice(index - indexOffset, 1);
                        indexOffset++;
                    } else {
                        var frames = document.getElementsByClassName("wt-cli-iframe-placeholder");
                        for (var i = 0; i < frames.length; i++) {
                            if (script.src == frames.item(i).getAttribute("data-src")) {
                                if (isOnWhitelist(script.src)) {
                                    var iframe = document.createElement("iframe");
                                    var width = frames.item(i).offsetWidth;
                                    var height = frames.item(i).offsetHeight;
                                    iframe.src = script.src;
                                    iframe.width = width;
                                    iframe.height = height;
                                    frames.item(i).parentNode.insertBefore(iframe, frames.item(i));
                                    frames.item(i).parentNode.removeChild(frames.item(i));
                                }
                            }
                        }
                    }
                }
            }
        });
        document.createElement = createElementBackup;
    },
};
