try {
    bannerActiveCheck();
} catch (err) {
    console.error(err);
}

let ckyActiveLaw = "";
let ipdata = {};

function ckyCount(callback) {
    if (cliConfig.options.selectedLaws.length !== 2) {
        ckyActiveLaw = cliConfig.options.selectedLaws[0];
        callback(ckyActiveLaw);
    }

    var request = new XMLHttpRequest();
    request.open("GET", "https://geoip.cookieyes.com/geoip/checker/result.php", true);

    request.onload = function () {
        if (this.status >= 200 && this.status < 400) {
            let data = {};
            try {
                data = JSON.parse(this.response);
            } catch (error) {
                if (cliConfig.options.selectedLaws.length !== 2) {
                    displayBanner();
                } else {
                    activateGdpr();
                }
                return;
            }
            var clientIP = data.ip;
            if (clientIP) {
                ipdata = { ip: clientIP.substring(0, clientIP.lastIndexOf(".")) + ".0", country_name: data.country_name };
            }
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
                cookieYes.setCookie("cookieyes-performance", "yes", cookieExpiry);
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
        if (!ipdata.ip) return;
        function getCookie(name) {
            var re = new RegExp(name + "=([^;]+)");
            var value = re.exec(document.cookie);
            return value != null ? unescape(value[1]) : null;
        }
        let log = [
            { name: "CookieYes Consent", status: getCookie("cky-consent") },
            { name: "Necessary", status: "yes" },
            { name: "Functional", status: getCookie("cookieyes-functional") },
            { name: "Analytics", status: getCookie("cookieyes-analytics") },
            { name: "Performance", status: getCookie("cookieyes-performance") },
            { name: "Advertisement", status: getCookie("cookieyes-advertisement") },
            { name: "Other", status: getCookie("cookieyes-other") },
        ];
        let consent_id = getCookie("cookieyesID");
        var request = new XMLHttpRequest();
        var data = new FormData();
        data.append("log", JSON.stringify(log));
        data.append("key", "23f60220ba8179c107119d98");
        data.append("ip", JSON.stringify(ipdata));
        data.append("consent_id", consent_id);
        request.open("POST", "https://app.cookieyes.com/api/v1/log", true);
        request.send(data);
    };
}

function bannerActiveCheck() {
    var isActiveCheckCookiePresent = getCookie("cky-active-check");
    if (!isActiveCheckCookiePresent && window.fetch && window.Promise) {
        fetch("https://active.cookieyes.com/api/23f60220ba8179c107119d98/log", { method: "POST" }).catch(function (err) {
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
        .reduce(function (accumulator, cookie) {
            accumulator[cookie[0].trim()] = decodeURIComponent(cookie[1]);
            return accumulator;
        }, {});
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
var tldomain = "djangotest.weebly.com";
var cliConfig = {
    options: {
        plan: "Pro",
        theme: "recommended",
        colors: [],
        content: [],
        display: [],
        version: "4.0.0",
        position: "bottom",
        template: {
            id: "classic",
            css:
                ".cky-consent-bar-trigger, .cky-consent-bar, .cky-modal, .cky-consent-bar-trigger *, .cky-consent-bar *, .cky-modal * { box-sizing: border-box; } .cky-consent-bar-trigger *:focus, .cky-consent-bar *:focus, .cky-modal *:focus { outline: 0; } .cky-consent-bar-trigger { position: fixed; right: 30px; padding: 2px 5px; font-size: 13px; cursor: pointer; font-family: inherit; animation: slide-up 0.4s ease; z-index: 9997; } .cky-consent-bar { font-family: inherit; position: fixed; z-index: 9997; } .cky-consent-bar .cky-consent-title { font-size: 15px; font-weight: bold; margin-bottom: 3px; } .cky-consent-bar p { line-height: 20px; font-size: 13px; font-weight: normal; margin-bottom: 0; margin-top: 0; } .cky-btn { font-size: 12px; padding: .5rem 1rem; background: none; cursor: pointer; display: inline-block; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; line-height: 1; transition: all .15s ease-in-out; margin: 0; min-height: auto; font-weight: normal; border-radius: 0; } .cky-btn:hover { opacity: .8; } .cky-btn:focus { outline: 0; } .cky-button-wrapper .cky-btn { margin-right: 15px; } .cky-button-wrapper .cky-btn:last-child { margin-right: 0; } .cky-btn.cky-btn-custom-accept { margin: 1.5rem 1rem; font-weight: 600; white-space: initial; word-break: break-word; } .cky-btn-readMore { cursor: pointer; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-btn-doNotSell { cursor: pointer; white-space: nowrap; font-weight: bold; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: flex; align-items: center; } .cky-consent-bar.cky-logo-active .cky-logo { margin-right: 30px; } @media (max-width: 540px) { .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: block; } } .cky-tab { display: -ms-flexbox; display: flex; } .cky-tab-menu { flex: 0 0 25%; max-width: 25%; } @media (max-width: 991px) { .cky-tab-menu { flex: 0 0 40%; max-width: 40%; } } .cky-tab-content { flex: 0 0 75%; max-width: 75%; background: transparent; padding: 15px 20px; } @media (max-width: 991px) { .cky-tab-content { flex: 0 0 60%; max-width: 60%; } } @media (max-width: 767px) { .cky-tab-content { padding: 15px; } } .cky-tab-item { font-size: 11px; cursor: pointer; font-weight: normal; border-bottom: 1px solid; border-right: 1px solid; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.5; } @media (max-width: 767px) { .cky-tab-item { font-size: 11px; padding: .75rem .75rem; } } .cky-tab-item-active { cursor: initial; border-right: 0; } .cky-tab-content .cky-tab-desc, .cky-tab-content .cky-tab-desc p { font-size: 12px; } .cky-tab-title { font-size: 13px; margin-bottom: 11px; margin-top: 0; font-family: inherit; font-weight: bold; line-height: 1; display: flex; align-items: center; } .cky-tab-content .cky-tab-content-item:not(.cky-tab-content-active) { display: none; } .cky-category-direct { display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; padding-top: 15px; margin-top: 15px; border-top: 1px solid #d4d8df; } .cky-category-direct .cky-btn-custom-accept { margin: 0 0 0 auto; } .cky-category-direct-item { display: -ms-flexbox; display: flex; -webkit-box-align: center; -ms-flex-align: center; align-items: center; margin-right: 32px; margin-bottom: 15px; } .cky-category-direct-item:last-child { margin-right: 0; } .cky-category-direct-item .cky-switch { margin-left: 0; } .cky-category-direct-item .cky-category-direct-name { margin-left: 10px; font-size: 12px; font-weight: 600; } .cky-category-direct +.cky-detail-wrapper { margin-top: 10px; } .cky-table-wrapper { width: 100%; max-width: 100%; overflow: auto; } .cky-cookie-audit-table { font-family: inherit; border-collapse: collapse; width: 100%; margin-top: 10px; } .cky-cookie-audit-table th { background-color: #d9dfe7; border: 1px solid #cbced6; } .cky-cookie-audit-table td { border: 1px solid #d5d8df; } .cky-cookie-audit-table th, .cky-cookie-audit-table td { text-align: left; padding: 10px; font-size: 12px; color: #000000; word-break:normal; } .cky-cookie-audit-table tr:nth-child(2n+1) td { background: #f1f5fa; } .cky-cookie-audit-table tr:nth-child(2n) td { background: #ffffff; } .cky-audit-table-element h5 { margin: 25px 0 2px 0; } .cky-audit-table-element .cky-table-wrapper { margin-bottom: 1rem; } .cky-consent-bar.cky-rtl { direction: rtl; text-align: right; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn { margin-right: 0; margin-left: 15px; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn:last-child { margin-left: 0; } .cky-consent-bar.cky-rtl .cky-btn-readMore { margin-left: 0; margin-right: 6px; } .cky-consent-bar.cky-rtl.cky-logo-active .cky-logo { margin-right: 0px; margin-left: 30px; } .cky-switch { position: relative; min-height: 13px; padding-left: 25px; font-size: 14px; margin-left: 20px; margin-bottom: 0; display: inline-block; } .cky-switch input[type='checkbox'] { display: none !important; } .cky-switch .cky-slider { background-color: #e3e1e8; border-radius: 34px; height: 13px; width: 25px; bottom: 0; cursor: pointer; left: 0; position: absolute; right: 0; transition: .4s; } .cky-switch .cky-slider:before { background-color: #fff; border-radius: 50%; bottom: 2px; content: ''; height: 9px; left: 2px; position: absolute; transition: .4s; width: 9px; } .cky-switch input:checked+.cky-slider { background-color: #008631; } .cky-switch input:disabled+.cky-slider { cursor: initial; } .cky-switch input:checked+.cky-slider:before { transform: translateX(12px); } .cky-modal.cky-fade .cky-modal-dialog { transition: -webkit-transform .3s ease-out; transition: transform .3s ease-out; transition: transform .3s ease-out, -webkit-transform .3s ease-out; -webkit-transform: translate(0, -25%); transform: translate(0, -25%); } .cky-modal.cky-show .cky-modal-dialog { -webkit-transform: translate(0, 0); transform: translate(0, 0); } .cky-modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9998; background-color: rgba(10, 10, 10, 0.22); display: none; } .cky-modal-backdrop.cky-fade { opacity: 0; } .cky-modal-backdrop.cky-show { opacity: 1; display: block; } .cky-modal { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999; display: none; overflow: hidden; outline: 0; min-height: calc(100% - (.5rem * 2)); } .cky-modal.cky-show { display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; } .cky-modal a { text-decoration: none; } .cky-modal .cky-modal-dialog { position: relative; max-width: calc(100% - 16px); width: calc(100% - 16px); margin: .5rem; pointer-events: none; font-family: inherit; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; text-align: left; display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); -webkit-box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); } @media (min-width: 576px) { .cky-modal .cky-modal-dialog { max-width: 500px; width: 500px; margin: 1.75rem auto; } .cky-modal { min-height: calc(100% - (1.75rem * 2)); } } @media (min-width: 991px) { .cky-modal .cky-modal-dialog { max-width: 900px; width: 900px; } } .cky-modal-content { display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; width: 100%; pointer-events: auto; background-clip: padding-box; border: 0; border-radius: 4px; overflow: hidden; outline: 0; margin: 40px; } .cky-modal.cky-rtl { direction: rtl; text-align: right; } .ccpa.cky-modal .cky-modal-dialog { max-width: 300px; width: 300px; border-radius: 5px; } .ccpa.cky-modal .cky-modal-content { margin: 25px; text-align: center; font-weight: 600; } .ccpa.cky-modal .cky-opt-out-text { margin-bottom: 20px; } .cky-consent-bar .cky-consent-close, .cky-modal .cky-modal-close { z-index: 1; padding: 0; background-color: transparent; border: 0; -webkit-appearance: none; font-size: 12px; line-height: 1; color: #9a9a9a; cursor: pointer; min-height: auto; position: absolute; top: 14px; right: 18px; } .cky-consent-bar.cky-classic { width: 100%; display: block; box-shadow: 0 -1px 10px 0 rgba(172, 171, 171, 0.3); } .cky-classic .cky-content-wrapper { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; justify-content: space-between; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; } .cky-classic .cky-button-wrapper { margin-left: 20px; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; flex-wrap: nowrap; } .cky-consent-bar.cky-classic p { text-align: left; } .cky-classic .cky-btn-settings { margin-left: auto; position: relative; padding-right: 1rem; } .cky-classic .cky-btn-settings:before { border-style: solid; border-width: 1px 1px 0 0; content: ''; display: inline-block; height: 4px; right: 8px; position: absolute; border-color: #beb8b8; top: 11px; transform: rotate(135deg); vertical-align: middle; width: 4px; } .cky-classic .cky-btn-settings[expanded]:before { transform: rotate(-45deg); } .cky-classic .cky-consent-bar.cky-rtl .cky-button-wrapper { margin-left: 0; margin-right: 20px; } .cky-classic .cky-consent-bar.cky-rtl p { text-align: right; } @media(min-width: 991px) { .cky-consent-bar.cky-classic { padding: 15px 50px; } } @media(min-width: 1150px) { .cky-consent-bar.cky-classic { padding: 15px 130px; } } @media(min-width: 1415px) { .cky-consent-bar.cky-classic { padding: 15px 160px; } } @media (max-width: 991px) { .cky-classic .cky-button-wrapper { margin-left: 0; margin-top: 20px; } .cky-consent-bar.cky-classic, .cky-consent-bar.cky-classic p, .cky-classic .cky-button-wrapper, .cky-classic .cky-content-wrapper { display: block; text-align: center; } } .cky-detail-wrapper { margin-top: 30px; border: 1px solid #d4d8df; border-radius: 2px; overflow: hidden; } .cky-tab-content { width: 100%; } .cky-tab-item { padding: .5rem 1rem; align-items: center; } .cky-tab-content .cky-tab-desc { min-height: 155px; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } @media (max-width: 767px) { .cky-tab-content .cky-tab-desc { max-height: 155px; } } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-switch { margin-left: 0; margin-right: 20px; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item { border-right: none; border-left: 1px solid; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item.cky-tab-item-active { border-left: 0; }",
            detailType: "sticky",
        },
        tldomain: "djangotest.weebly.com",
        behaviour: { reload: false, showLogo: true, acceptOnScroll: false, defaultConsent: false, showAuditTable: false, selectedLanguage: "en" },
        customCss: null,
        geoTarget: [],
        consentType: "explicit",
        selectedLaws: ["gdpr"],
        consentBarType: "classic",
        showCategoryDirectly: false,
    },
    info: {
        privacyPolicy: {
            title: { en: "Privacy Policy" },
            text: {
                en:
                    "<p>This website uses cookies to improve your experience while you navigate through the website. Out of these cookies, the cookies that are categorized as necessary are stored on your browser as they as essential for the working of basic functionalities of the website. </p><p>We also use third-party cookies that help us analyze and understand how you use this website, to store user preferences and provide them with content and advertisements that are relevant to you. These cookies will only be stored on your browser with your consent to do so. You also have the option to opt-out of these cookies.But opting out of some of these cookies may have an effect on your browsing experience.</p>",
            },
        },
        categories: [
            {
                id: 38589,
                name: { en: "Necessary" },
                description: { en: "<p>Necessary cookies are crucial for the basic functions of the website and the website will not work in its intended way without them.These cookies do not store any personally identifiable data.</p>" },
                slug: "necessary",
                type: 1,
                status: 1,
                active: 1,
                order: 1,
                website_id: 10116,
                settings: { ccpa: { doNotSell: false } },
                created_at: "2020-08-24 08:44:26",
                updated_at: "2021-06-10 11:36:08",
                cookies: [
                    {
                        id: 49351,
                        cookie_id: "hs",
                        description: { en: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes." },
                        type: 1,
                        category_id: 38589,
                        duration: "css",
                        domain: ".www.lg-elektrotechnik.de",
                        website_id: 10116,
                        script_slug: "wix",
                        url_pattern: "static.parastorage.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-14 13:14:58",
                        updated_at: "2021-03-02 09:03:46",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49353,
                        cookie_id: "XSRF-TOKEN",
                        description: { en: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes." },
                        type: 0,
                        category_id: 38589,
                        duration: null,
                        domain: ".www.lg-elektrotechnik.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-14 13:14:58",
                        updated_at: "2020-09-14 13:14:58",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49405,
                        cookie_id: "__cfduid",
                        description: {
                            en:
                                "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                        },
                        type: 1,
                        category_id: 38589,
                        duration: "1 month",
                        domain: ".www.ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49408,
                        cookie_id: "JSESSIONID",
                        description: { en: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests." },
                        type: 1,
                        category_id: 38589,
                        duration: null,
                        domain: "www.ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49446,
                        cookie_id: "has_js",
                        description: { en: "This cookie is used to indicate whether the user's browser has enabled JavaScript." },
                        type: 0,
                        category_id: 38589,
                        duration: null,
                        domain: "www.israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49479,
                        cookie_id: "SERVERID",
                        description: {
                            en:
                                "This cookie is used to assign the user to a specific server, thus to provide a improved and faster server time. It remembers which server had delivered the last page on to the browser. It also helps in load balancing.",
                        },
                        type: 0,
                        category_id: 38589,
                        duration: "10 minutes",
                        domain: ".eyeota.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49487,
                        cookie_id: "ts",
                        description: { en: "This cookie is provided by the PayPal. It is used to support payment service in a website." },
                        type: 1,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".creativecdn.com",
                        website_id: 10116,
                        script_slug: "dailymotion",
                        url_pattern: "dailymotion.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49518,
                        cookie_id: "ARRAffinity",
                        description: { en: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App." },
                        type: 1,
                        category_id: 38589,
                        duration: null,
                        domain: ".ads4.admatic.com.tr",
                        website_id: 10116,
                        script_slug: "azure",
                        url_pattern: "monitor.azure.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49524,
                        cookie_id: "csrftoken",
                        description: { en: "This cookie is associated with Django web development platform for python. Used to help protect the website against Cross-Site Request Forgery attacks" },
                        type: 0,
                        category_id: 38589,
                        duration: "11 months",
                        domain: ".instagram.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49526,
                        cookie_id: "ASP.NET_SessionId",
                        description: {
                            en:
                                "This cookie is used in sites developed with Microsoft.Net. When a user start browsing a unique session ID is created, which keeps track of all the information regarding that session.This information is stored in the web server and it is identified via a GUID.The GUID is essential for any ASP.NET site to function properly.",
                        },
                        type: 1,
                        category_id: 38589,
                        duration: null,
                        domain: "lb.advsnx.net",
                        website_id: 10116,
                        script_slug: "microsoft",
                        url_pattern: "microsoftonline.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49550,
                        cookie_id: "opt_out",
                        description: { en: "This cookie is used for preventing the installation of third party advertiser or other cookies on the browser." },
                        type: 0,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".postrelease.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:26",
                        updated_at: "2020-09-15 08:07:26",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49823,
                        cookie_id: "cookieyesID",
                        description: { en: "Unique identifier for  visitors used by CookieYes with respect to the consent" },
                        type: 0,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: "cookieyes",
                        url_pattern: "cookieyes.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-16 07:38:13",
                        updated_at: "2020-09-16 07:38:13",
                        data_migrated_at: "2021-06-17 05:00:32",
                    },
                    {
                        id: 49824,
                        cookie_id: "cky-consent",
                        description: { en: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website." },
                        type: 0,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: "cookieyes",
                        url_pattern: "cookieyes.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-16 07:38:13",
                        updated_at: "2020-09-16 07:38:13",
                        data_migrated_at: "2021-06-17 05:00:32",
                    },
                    {
                        id: 49825,
                        cookie_id: "cookieyes-necessary",
                        description: { en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Necessary" category.' },
                        type: 0,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-16 07:38:13",
                        updated_at: "2020-09-16 07:38:13",
                        data_migrated_at: "2021-06-17 05:00:32",
                    },
                    {
                        id: 49826,
                        cookie_id: "cookieyes-functional",
                        description: { en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Functional" category.' },
                        type: 0,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-16 07:38:13",
                        updated_at: "2020-09-16 07:38:13",
                        data_migrated_at: "2021-06-17 05:00:32",
                    },
                    {
                        id: 49827,
                        cookie_id: "cookieyes-analytics",
                        description: { en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Analytics" category.' },
                        type: 0,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-16 07:38:13",
                        updated_at: "2020-09-16 07:38:13",
                        data_migrated_at: "2021-06-17 05:00:32",
                    },
                    {
                        id: 49828,
                        cookie_id: "cookieyes-performance",
                        description: { en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Performance" category.' },
                        type: 0,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-16 07:38:13",
                        updated_at: "2020-09-16 07:38:13",
                        data_migrated_at: "2021-06-17 05:00:32",
                    },
                    {
                        id: 49829,
                        cookie_id: "cookieyes-advertisement",
                        description: { en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Advertisement" category.' },
                        type: 0,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-16 07:38:13",
                        updated_at: "2020-09-16 07:38:13",
                        data_migrated_at: "2021-06-17 05:00:32",
                    },
                    {
                        id: 49830,
                        cookie_id: "cookieyes-other",
                        description: { en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as "Other".' },
                        type: 0,
                        category_id: 38589,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-16 07:38:13",
                        updated_at: "2020-09-16 07:38:13",
                        data_migrated_at: "2021-06-17 05:00:32",
                    },
                    {
                        id: 50143,
                        cookie_id: "PHPSESSID",
                        description: {
                            en:
                                "This cookie is native to PHP applications. The cookie is used to store and identify a users' unique session ID for the purpose of managing user session on the website. The cookie is a session cookies and is deleted when all the browser windows are closed.",
                        },
                        type: 0,
                        category_id: 38589,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 54953,
                        cookie_id: "_orig_referrer",
                        description: { en: "This cookie is set by website built on Shopify platform and is used in assoication with shopping cart." },
                        type: 1,
                        category_id: 38589,
                        duration: "2 weeks",
                        domain: ".my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: "shopify",
                        url_pattern: "shopify.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54958,
                        cookie_id: "secure_customer_sig",
                        description: { en: "This cookies is set by websites built on Shopify platform and is used in connection with customer login." },
                        type: 1,
                        category_id: 38589,
                        duration: "20 years",
                        domain: "my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: "shopify",
                        url_pattern: "shopify.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 61499,
                        cookie_id: "laravel_session",
                        description: { en: "laravel uses laravel_session to identify a session instance for a user, this can be changed" },
                        type: 1,
                        category_id: 38589,
                        duration: null,
                        domain: "assets.bnidx.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 66306,
                        cookie_id: "ts_c",
                        description: { en: "This cookie is provided by PayPal when a website is in association with PayPal payment function. This cookie is used to make safe payment through PayPal." },
                        type: 1,
                        category_id: 38589,
                        duration: "1 years  20 days  18 hours  2 minutes",
                        domain: ".paypal.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:40:55",
                        updated_at: "2020-12-18 14:40:55",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 86304,
                        cookie_id: "cookielawinfo-checkbox-necessary",
                        description: { en: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category 'Necessary'." },
                        type: 1,
                        category_id: 38589,
                        duration: "11 months 29 days 23 hours 59 minutes",
                        domain: "www.bottegacivica.it",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-01-25 17:55:04",
                        updated_at: "2021-01-25 17:55:04",
                        data_migrated_at: "2021-06-17 05:04:02",
                    },
                    {
                        id: 86305,
                        cookie_id: "cookielawinfo-checkbox-advertisement",
                        description: { en: "The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category 'Advertisement'." },
                        type: 1,
                        category_id: 38589,
                        duration: "11 months 29 days 23 hours 59 minutes",
                        domain: "www.bottegacivica.it",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-01-25 17:55:04",
                        updated_at: "2021-01-25 17:55:04",
                        data_migrated_at: "2021-06-17 05:04:02",
                    },
                    {
                        id: 86306,
                        cookie_id: "cookielawinfo-checkbox-performance",
                        description: { en: "This cookie is used to keep track of which cookies the user have approved for this site." },
                        type: 1,
                        category_id: 38589,
                        duration: "11 months 29 days 23 hours 59 minutes",
                        domain: "www.bottegacivica.it",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-01-25 17:55:04",
                        updated_at: "2021-01-25 17:55:04",
                        data_migrated_at: "2021-06-17 05:04:02",
                    },
                    {
                        id: 86307,
                        cookie_id: "cookielawinfo-checkbox-analytics",
                        description: { en: "This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category 'Analytics'." },
                        type: 1,
                        category_id: 38589,
                        duration: "11 months 29 days 23 hours 59 minutes",
                        domain: "www.bottegacivica.it",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-01-25 17:55:04",
                        updated_at: "2021-01-25 17:55:04",
                        data_migrated_at: "2021-06-17 05:04:02",
                    },
                    {
                        id: 86308,
                        cookie_id: "wordpress_test_cookie",
                        description: { en: "This cookie is used to check if the cookies are enabled on the users' browser." },
                        type: 1,
                        category_id: 38589,
                        duration: "session",
                        domain: "www.bottegacivica.it",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-01-25 17:55:04",
                        updated_at: "2021-01-25 17:55:04",
                        data_migrated_at: "2021-06-17 05:04:02",
                    },
                    {
                        id: 277994,
                        cookie_id: "cky-active-check",
                        description: { en: "The cookie is set by CookieYes to check if the consent banner is active on the website." },
                        type: 1,
                        category_id: 38589,
                        duration: "1 day",
                        domain: "djangotest.weebly.com",
                        website_id: 10116,
                        script_slug: "cookieyes",
                        url_pattern: "cookieyes.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2021-04-05 11:07:45",
                        updated_at: "2021-04-05 11:07:45",
                        data_migrated_at: "2021-06-17 06:12:26",
                    },
                ],
                scripts: [],
            },
            {
                id: 38590,
                name: { en: "Functional" },
                description: {
                    en:
                        "<p>Functional cookies help to perform certain functionalities like sharing the content of the website on social media platforms, collect feedbacks, and other third-party features.</p>\n\nFor better user experience youtube-nocookie saves data via local storage. Once you accept the functional category the consent is applicable to local storeage data as well.",
                },
                slug: "functional",
                type: 2,
                status: 0,
                active: 1,
                order: 2,
                website_id: 10116,
                settings: { ccpa: { doNotSell: "1" } },
                created_at: "2020-08-24 08:44:26",
                updated_at: "2021-06-10 11:36:08",
                cookies: [
                    {
                        id: 45965,
                        cookie_id: "language",
                        description: { en: "This cookie is used to store the language preference of the user." },
                        type: 0,
                        category_id: 38590,
                        duration: "2 weeks",
                        domain: "djangotest.weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-08-24 10:48:19",
                        updated_at: "2020-08-24 10:48:19",
                        data_migrated_at: "2021-06-17 05:00:09",
                    },
                    {
                        id: 49419,
                        cookie_id: "lang",
                        description: { en: "This cookie is used to store the language preferences of a user to serve up content in that stored language the next time user visit the website." },
                        type: 0,
                        category_id: 38590,
                        duration: null,
                        domain: "cdn.syndication.twimg.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49525,
                        cookie_id: "mid",
                        description: { en: "The cookie is set by Instagram. The cookie is used to distinguish users and to show relevant content, for better user experience and security." },
                        type: 0,
                        category_id: 38590,
                        duration: "9 years",
                        domain: ".instagram.com",
                        website_id: 10116,
                        script_slug: "instagram",
                        url_pattern: "instagram.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 60878,
                        cookie_id: "__sharethis_cookie_test__",
                        description: { en: "This cookie is set by ShareThis, to test whether the browser accepts cookies." },
                        type: 1,
                        category_id: 38590,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:01",
                        updated_at: "2020-12-01 06:19:01",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 61536,
                        cookie_id: "__livechat",
                        description: { en: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website." },
                        type: 1,
                        category_id: 38590,
                        duration: "3 years",
                        domain: "livechatinc.com",
                        website_id: 10116,
                        script_slug: "livechat",
                        url_pattern: "livechatinc.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61537,
                        cookie_id: "CASID",
                        description: { en: "This cookie is used to recognise the visitors using live chat at different times inorder to optimize the chat-box functionality." },
                        type: 1,
                        category_id: 38590,
                        duration: null,
                        domain: "",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61538,
                        cookie_id: "__lc_cid",
                        description: { en: "This is an essential cookie for the website live chat box to function properly." },
                        type: 1,
                        category_id: 38590,
                        duration: "1 years  20 days  17 hours  39 minutes",
                        domain: ".accounts.livechatinc.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61539,
                        cookie_id: "__lc_cst",
                        description: { en: "This cookie is used for the website live chat box to function properly." },
                        type: 1,
                        category_id: 38590,
                        duration: "1 years  20 days  17 hours  39 minutes",
                        domain: ".accounts.livechatinc.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61540,
                        cookie_id: "__lc2_cid",
                        description: { en: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted." },
                        type: 1,
                        category_id: 38590,
                        duration: "1 years  20 days  17 hours  39 minutes",
                        domain: ".accounts.livechatinc.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61541,
                        cookie_id: "__lc2_cst",
                        description: {
                            en:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                        },
                        type: 1,
                        category_id: 38590,
                        duration: "1 years  20 days  17 hours  39 minutes",
                        domain: ".accounts.livechatinc.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61542,
                        cookie_id: "__oauth_redirect_detector",
                        description: { en: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality." },
                        type: 1,
                        category_id: 38590,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "accounts.livechatinc.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                ],
                scripts: [],
            },
            {
                id: 38591,
                name: { en: "Analytics" },
                description: { en: "<p>Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.</p>" },
                slug: "analytics",
                type: 2,
                status: 1,
                active: 1,
                order: 3,
                website_id: 10116,
                settings: { ccpa: { doNotSell: "1" } },
                created_at: "2020-08-24 08:44:26",
                updated_at: "2021-06-10 11:36:08",
                cookies: [
                    {
                        id: 49420,
                        cookie_id: "_ga",
                        description: {
                            en:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                        },
                        type: 0,
                        category_id: 38591,
                        duration: "2 years",
                        domain: ".ishthehague.nl",
                        website_id: 10116,
                        script_slug: "google_analytics",
                        url_pattern: "google-analytics.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:20:38",
                        updated_at: "2020-09-15 05:20:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49421,
                        cookie_id: "_gid",
                        description: {
                            en:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the wbsite is doing. The data collected including the number visitors, the source where they have come from, and the pages viisted in an anonymous form.",
                        },
                        type: 0,
                        category_id: 38591,
                        duration: "1 day",
                        domain: ".ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:20:38",
                        updated_at: "2020-09-15 05:20:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49450,
                        cookie_id: "__gads",
                        description: {
                            en:
                                "This cookie is set by Google and stored under the name dounleclick.com. This cookie is used to track how many times users see a particular advert which helps in measuring the success of the campaign and calculate the revenue generated by the campaign. These cookies can only be read from the domain that it is set on so it will not track any data while browsing through another sites.",
                        },
                        type: 0,
                        category_id: 38591,
                        duration: "2 years",
                        domain: ".israelhayom.co.il",
                        website_id: 10116,
                        script_slug: "google",
                        url_pattern: "google.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49454,
                        cookie_id: "_cb_ls",
                        description: { en: "This cookie is set by websites using real time analytics software by Chartbeat." },
                        type: 0,
                        category_id: 38591,
                        duration: "1 year",
                        domain: "www.israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49455,
                        cookie_id: "_cb",
                        description: { en: "This cookie is set by websites using real time analytics software by Chartbeat." },
                        type: 0,
                        category_id: 38591,
                        duration: "1 year",
                        domain: "www.israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49456,
                        cookie_id: "_chartbeat2",
                        description: { en: "This cookie is set by websites using real time analytics software by Chartbeat." },
                        type: 0,
                        category_id: 38591,
                        duration: "1 year",
                        domain: "www.israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49457,
                        cookie_id: "_cb_svref",
                        description: { en: "This cookie is set by websites using real time analytics software by Chartbeat." },
                        type: 0,
                        category_id: 38591,
                        duration: "30 minutes",
                        domain: "www.israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49469,
                        cookie_id: "demdex",
                        description: { en: "This cookie is set under the domain demdex.net and is used by Adobe Audience Manager to help identify a unique visitor across domains." },
                        type: 0,
                        category_id: 38591,
                        duration: "5 months",
                        domain: ".demdex.net",
                        website_id: 10116,
                        script_slug: "demdex",
                        url_pattern: "demdex.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49470,
                        cookie_id: "UserID1",
                        description: {
                            en:
                                "The cookie sets a unique anonymous ID for a website visitor. This ID is used to continue to identify users across different sessions and track their activities on the website. The data collected is used for analysis.",
                        },
                        type: 0,
                        category_id: 38591,
                        duration: "5 months",
                        domain: ".adfarm1.adition.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49513,
                        cookie_id: "eud",
                        description: { en: "The domain of this cookie is owned by Rocketfuel. This cookie is used to sync with partner systems to identify the users. This cookie contains partner user IDs and last successful match time." },
                        type: 0,
                        category_id: 38591,
                        duration: "1 year",
                        domain: ".rfihub.com",
                        website_id: 10116,
                        script_slug: "rocket_fuel",
                        url_pattern: "rfihub.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 50151,
                        cookie_id: "_gcl_au",
                        description: { en: "This cookie is used by Google Analytics to understand user interaction with the website." },
                        type: 0,
                        category_id: 38591,
                        duration: "2 months",
                        domain: ".wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: "google_analytics",
                        url_pattern: "google-analytics.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 54951,
                        cookie_id: "_y",
                        description: { en: "This cookie is associated with Shopify's analytics suite." },
                        type: 0,
                        category_id: 38591,
                        duration: "1 year",
                        domain: ".my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: "shopify",
                        url_pattern: "shopify.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54952,
                        cookie_id: "_shopify_fs",
                        description: { en: "This cookie is associated with Shopify's analytics suite." },
                        type: 0,
                        category_id: 38591,
                        duration: "1 year",
                        domain: ".my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: "shopify",
                        url_pattern: "shopify.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54954,
                        cookie_id: "_landing_page",
                        description: { en: "This cookie is set by website built on Shopify platform and is used to track landing pages." },
                        type: 1,
                        category_id: 38591,
                        duration: "2 weeks",
                        domain: ".my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: "shopify",
                        url_pattern: "shopify.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54955,
                        cookie_id: "_shopify_s",
                        description: { en: "This cookie is associated with Shopify's analytics suite." },
                        type: 0,
                        category_id: 38591,
                        duration: "30 minutes",
                        domain: ".my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: "shopify",
                        url_pattern: "shopify.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54956,
                        cookie_id: "_s",
                        description: { en: "This cookie is associated with Shopify's analytics suite." },
                        type: 0,
                        category_id: 38591,
                        duration: "30 minutes",
                        domain: ".my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: "shopify",
                        url_pattern: "shopify.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54957,
                        cookie_id: "_shopify_y",
                        description: { en: "This cookie is associated with Shopify's analytics suite." },
                        type: 0,
                        category_id: 38591,
                        duration: "1 year",
                        domain: ".my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: "shopify",
                        url_pattern: "shopify.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 60876,
                        cookie_id: "GPS",
                        description: { en: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location" },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years  19 days  15 hours  21 minutes",
                        domain: ".youtube.com",
                        website_id: 10116,
                        script_slug: "youtube",
                        url_pattern: "youtube.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:18:59",
                        updated_at: "2020-12-01 06:18:59",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 61520,
                        cookie_id: "dekoriapldshopsx",
                        description: { en: "This cookie is sessional type of cookies used store visitors visit information for a period of two weeks." },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years  19 days  15 hours  36 minutes",
                        domain: "www.dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:08",
                        updated_at: "2020-12-02 05:48:08",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61524,
                        cookie_id: "_snrs_sa",
                        description: { en: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  visiting the website or starting the session time." },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: ".dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61525,
                        cookie_id: "_snrs_sb",
                        description: { en: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  existing page or end session time." },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: ".dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61526,
                        cookie_id: "_snrs_p",
                        description: {
                            en:
                                "This cookie is provided by Synerise. This cookie is used to save the client UUID, time of first visit, time of permanent last visit, total number of visits, number views per session, length of session and number of session.",
                        },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years  30 days  14 hours  10 minutes",
                        domain: ".dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61527,
                        cookie_id: "_snrs_uuid",
                        description: { en: "This cookie is provided by Synerise. This cookie is used to store unique variable customer identifier." },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years  30 days  14 hours  10 minutes",
                        domain: ".dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61528,
                        cookie_id: "_snrs_puuid",
                        description: { en: "This cookie is provided by Synerise. This cookie is used to store unique permanent customer identifier." },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years  30 days  14 hours  10 minutes",
                        domain: ".dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61534,
                        cookie_id: "_gat_gtag_UA_1455913_3",
                        description: { en: "Google uses this cookie to distinguish users." },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: ".dekoria.pl",
                        website_id: 10116,
                        script_slug: "google_analytics",
                        url_pattern: "google-analytics.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 66301,
                        cookie_id: "nQ_cookieId",
                        description: {
                            en:
                                "The domain of this cookie is owned by Albacross. It is used as a analytical tools to identify the potential customers by setting a unique Id for the customers. The session Id is used to implement the preference choice made by the customer upon their re-visit.",
                        },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years  19 days   31 minutes",
                        domain: "www.dekoria.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:27:52",
                        updated_at: "2020-12-18 14:27:52",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 86309,
                        cookie_id: "vuid",
                        description: { en: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website." },
                        type: 1,
                        category_id: 38591,
                        duration: "1 years 11 months 28 days 23 hours 59 minutes",
                        domain: ".vimeo.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-01-25 17:55:04",
                        updated_at: "2021-01-25 17:55:04",
                        data_migrated_at: "2021-06-17 05:04:02",
                    },
                ],
                scripts: [],
            },
            {
                id: 38592,
                name: { en: "Performance" },
                description: { en: "<p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.</p>" },
                slug: "performance",
                type: 2,
                status: 0,
                active: 1,
                order: 4,
                website_id: 10116,
                settings: { ccpa: { doNotSell: "1" } },
                created_at: "2020-08-24 08:44:26",
                updated_at: "2021-06-10 11:36:08",
                cookies: [
                    {
                        id: 340015,
                        cookie_id: "_ga",
                        description: { en: "test" },
                        type: 1,
                        category_id: 38592,
                        duration: "1 year",
                        domain: ".jithinmozilor.github.io",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-04-21 11:39:07",
                        updated_at: "2021-04-21 11:39:07",
                        data_migrated_at: "2021-06-17 06:19:49",
                    },
                    {
                        id: 340016,
                        cookie_id: "_gid",
                        description: { en: "test" },
                        type: 1,
                        category_id: 38592,
                        duration: "1 year",
                        domain: ".jithinmozilor.github.io",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-04-21 11:39:41",
                        updated_at: "2021-04-21 11:39:41",
                        data_migrated_at: "2021-06-17 06:19:49",
                    },
                ],
                scripts: [],
            },
            {
                id: 38593,
                name: { en: "Advertisement" },
                description: { en: "<p>Advertisement cookies are used to deliver visitors with customized advertisements based on the pages they visited before and analyze the effectiveness of the ad campaign.</p>" },
                slug: "advertisement",
                type: 2,
                status: 0,
                active: 1,
                order: 5,
                website_id: 10116,
                settings: { ccpa: { doNotSell: "1" } },
                created_at: "2020-08-24 08:44:26",
                updated_at: "2021-06-10 11:36:08",
                cookies: [
                    {
                        id: 49443,
                        cookie_id: "pl_user_id",
                        description: { en: "The domain of this cookie is owned by Powerlinks. This cookie is used to store data of the visitor, and this data is used for optimizing advertisement relevance." },
                        type: 0,
                        category_id: 38593,
                        duration: "2 months",
                        domain: ".powerlinks.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49447,
                        cookie_id: "_fbp",
                        description: { en: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website." },
                        type: 0,
                        category_id: 38593,
                        duration: "2 months",
                        domain: ".israelhayom.co.il",
                        website_id: 10116,
                        script_slug: "facebook",
                        url_pattern: "facebook.*",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49448,
                        cookie_id: "IDE",
                        description: {
                            en:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                        },
                        type: 1,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".doubleclick.net",
                        website_id: 10116,
                        script_slug: "doubleclick",
                        url_pattern: "doubleclick.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49449,
                        cookie_id: "fr",
                        description: {
                            en:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                        },
                        type: 1,
                        category_id: 38593,
                        duration: "2 months",
                        domain: ".facebook.com",
                        website_id: 10116,
                        script_slug: "facebook",
                        url_pattern: "facebook.*",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49462,
                        cookie_id: "rlas3",
                        description: { en: "The cookie is set by rlcdn.com. The cookie is used to serve relevant ads to the visitor as well as limit the time the visitor sees an and also measure the effectiveness of the campaign." },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".rlcdn.com",
                        website_id: 10116,
                        script_slug: "rapleaf",
                        url_pattern: "rlcdn.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49463,
                        cookie_id: "ab",
                        description: { en: "This domain of this cookie is owned by agkn. The cookie is used for targeting and advertising purposes." },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".agkn.com",
                        website_id: 10116,
                        script_slug: "neustar",
                        url_pattern: "agkn.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49464,
                        cookie_id: "tuuid",
                        description: {
                            en:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".bidswitch.net",
                        website_id: 10116,
                        script_slug: "bidswitch",
                        url_pattern: "bidswitch.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49466,
                        cookie_id: "tuuid_lu",
                        description: {
                            en:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".bidswitch.net",
                        website_id: 10116,
                        script_slug: "bidswitch",
                        url_pattern: "bidswitch.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49467,
                        cookie_id: "TDID",
                        description: { en: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising." },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".adsrvr.org",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49468,
                        cookie_id: "_kuid_",
                        description: { en: "The cookie is set by Krux Digital under the domain krxd.net. The cookie stores a unique ID to identify a returning user for the purpose of targeted advertising." },
                        type: 0,
                        category_id: 38593,
                        duration: "5 months",
                        domain: ".krxd.net",
                        website_id: 10116,
                        script_slug: "krux_digital",
                        url_pattern: "krxd.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49471,
                        cookie_id: "pxrc",
                        description: { en: "The purpose of the cookie is to identify a visitor to serve relevant advertisement." },
                        type: 0,
                        category_id: 38593,
                        duration: "1 month",
                        domain: ".rlcdn.com",
                        website_id: 10116,
                        script_slug: "rapleaf",
                        url_pattern: "rlcdn.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49472,
                        cookie_id: "bkdc",
                        description: {
                            en:
                                "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "5 months",
                        domain: ".bluekai.com",
                        website_id: 10116,
                        script_slug: "bluekai",
                        url_pattern: "bluekai.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49474,
                        cookie_id: "bku",
                        description: {
                            en:
                                "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "5 months",
                        domain: ".bluekai.com",
                        website_id: 10116,
                        script_slug: "bluekai",
                        url_pattern: "bluekai.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49476,
                        cookie_id: "TDCPM",
                        description: { en: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising." },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".adsrvr.org",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49477,
                        cookie_id: "dpm",
                        description: { en: "The cookie is set by demdex.net. This cookie assigns a unique ID to each visiting user that allows third-party advertisers target that users with relevant ads." },
                        type: 0,
                        category_id: 38593,
                        duration: "5 months",
                        domain: ".dpm.demdex.net",
                        website_id: 10116,
                        script_slug: "demdex",
                        url_pattern: "demdex.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49478,
                        cookie_id: "mako_uid",
                        description: {
                            en:
                                "This cookie is set under the domain ps.eyeota.net. The cookies is used to collect data about the users' visit to the website such as the pages visited. The data is used to create a users' profile in terms of their interest and demographic. This data is used for targeted advertising and marketing.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".eyeota.net",
                        website_id: 10116,
                        script_slug: "eyeota",
                        url_pattern: "eyeota.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49482,
                        cookie_id: "EE",
                        description: {
                            en:
                                "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "3 months",
                        domain: ".exelator.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49483,
                        cookie_id: "ud",
                        description: {
                            en:
                                "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "3 months",
                        domain: ".exelator.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49485,
                        cookie_id: "uuid",
                        description: { en: "To optimize ad relevance by collecting visitor data from multiple websites such as what pages have been loaded." },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".mathtag.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49488,
                        cookie_id: "uid",
                        description: {
                            en:
                                "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".adotmob.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49503,
                        cookie_id: "DSID",
                        description: { en: "This cookie is setup by doubleclick.net. This cookie is used by Google to make advertising more engaging to users and are stored under doubleclick.net. It contains an encrypted unique ID." },
                        type: 1,
                        category_id: 38593,
                        duration: "1 hour",
                        domain: ".doubleclick.net",
                        website_id: 10116,
                        script_slug: "doubleclick",
                        url_pattern: "doubleclick.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49504,
                        cookie_id: "_rxuuid",
                        description: {
                            en:
                                "The main purpose of this cookie is targeting, advertesing and effective marketing. This cookie is used to set a unique ID to the visitors, which allow third party advertisers to target the visitors with relevant advertisement up to 1 year.",
                        },
                        type: 1,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".1rx.io",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49505,
                        cookie_id: "bsw_uid",
                        description: { en: "This cookie is used to identify the visitors on their visits, across devices. It allows the website to show relevant advertisement to visitors." },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: "rtb.4finance.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49512,
                        cookie_id: "ruds",
                        description: {
                            en:
                                'The domain of this cookie is owned by Rocketfuel. This cookie is a session cookie version of the "rud" cookie. It contain the user ID information. It is used to deliver targeted advertising across the networks.',
                        },
                        type: 0,
                        category_id: 38593,
                        duration: null,
                        domain: ".rfihub.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49514,
                        cookie_id: "rud",
                        description: {
                            en:
                                "The domain of this cookie is owned by Rocketfuel. The main purpose of this cookie is advertising. This cookie is used to identify an user by an alphanumeric ID. It register the user data like IP, location, visited website, ads clicked etc with this it optimize the ads display based on user behaviour.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".rfihub.com",
                        website_id: 10116,
                        script_slug: "rocket_fuel",
                        url_pattern: "rfihub.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49520,
                        cookie_id: "mc",
                        description: { en: "This cookie is associated with Quantserve to track anonymously how a user interact with the website." },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".quantserve.com",
                        website_id: 10116,
                        script_slug: "quantserve",
                        url_pattern: "quantserve.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49532,
                        cookie_id: "_cc_dc",
                        description: {
                            en:
                                "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "8 months",
                        domain: ".crwdcntrl.net",
                        website_id: 10116,
                        script_slug: "lotame",
                        url_pattern: "crwdcntrl.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49533,
                        cookie_id: "_cc_id",
                        description: {
                            en:
                                "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "8 months",
                        domain: ".crwdcntrl.net",
                        website_id: 10116,
                        script_slug: "lotame",
                        url_pattern: "crwdcntrl.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49534,
                        cookie_id: "_cc_cc",
                        description: {
                            en:
                                "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "8 months",
                        domain: ".crwdcntrl.net",
                        website_id: 10116,
                        script_slug: "lotame",
                        url_pattern: "crwdcntrl.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49535,
                        cookie_id: "_cc_aud",
                        description: {
                            en:
                                "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "8 months",
                        domain: ".crwdcntrl.net",
                        website_id: 10116,
                        script_slug: "lotame",
                        url_pattern: "crwdcntrl.net",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49536,
                        cookie_id: "id",
                        description: {
                            en:
                                "New Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nNew Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.",
                        },
                        type: 0,
                        category_id: 38593,
                        duration: "2 years",
                        domain: "go.flx1.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49548,
                        cookie_id: "bito",
                        description: { en: "This cookie is set by bidr.io for advertisement purposes." },
                        type: 0,
                        category_id: 38593,
                        duration: "1 year",
                        domain: ".bidr.io",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 54968,
                        cookie_id: "NID",
                        description: { en: "This cookie is used to a profile based on user's interest and display personalized ads to the users." },
                        type: 1,
                        category_id: 38593,
                        duration: "6 months",
                        domain: ".google.com",
                        website_id: 10116,
                        script_slug: "google",
                        url_pattern: "google.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 60868,
                        cookie_id: "test_cookie",
                        description: { en: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the users'' browser supports cookies." },
                        type: 1,
                        category_id: 38593,
                        duration: "1 years  19 days  15 hours  21 minutes",
                        domain: ".doubleclick.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:18:57",
                        updated_at: "2020-12-01 06:18:57",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60874,
                        cookie_id: "VISITOR_INFO1_LIVE",
                        description: { en: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website." },
                        type: 1,
                        category_id: 38593,
                        duration: "1 years  180 days",
                        domain: ".youtube.com",
                        website_id: 10116,
                        script_slug: "youtube",
                        url_pattern: "youtube.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:18:59",
                        updated_at: "2020-12-01 06:18:59",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 61546,
                        cookie_id: "criteo_write_test",
                        description: { en: "This cookie sets a unique ID for the visitors that allows third-party advretisers to target the visitors with relevant advertisement." },
                        type: 1,
                        category_id: 38593,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "www.dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:11",
                        updated_at: "2020-12-02 05:48:11",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61549,
                        cookie_id: "uuid2",
                        description: {
                            en:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                        },
                        type: 1,
                        category_id: 38593,
                        duration: "1 years  19 days  17 hours  32 minutes",
                        domain: ".adnxs.com",
                        website_id: 10116,
                        script_slug: "appnexus",
                        url_pattern: "adnxs.com",
                        created_from_scan: 1,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:22",
                        updated_at: "2020-12-02 05:48:22",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                ],
                scripts: [],
            },
            {
                id: 38614,
                name: { en: "Other" },
                description: { en: "<p>Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.</p>" },
                slug: "other",
                type: 2,
                status: 0,
                active: 1,
                order: 6,
                website_id: 10116,
                settings: { ccpa: { doNotSell: "1" } },
                created_at: "2020-08-24 10:48:19",
                updated_at: "2021-06-10 11:36:08",
                cookies: [
                    {
                        id: 45964,
                        cookie_id: "is_mobile",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: ".djangotest.weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-08-24 10:48:19",
                        updated_at: "2020-08-24 10:48:19",
                        data_migrated_at: "2021-06-17 05:00:09",
                    },
                    {
                        id: 45973,
                        cookie_id: "sto-id-editor",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-08-24 10:48:19",
                        updated_at: "2020-08-24 10:48:19",
                        data_migrated_at: "2021-06-17 05:00:09",
                    },
                    {
                        id: 45974,
                        cookie_id: "sto-id-pages",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-08-24 10:48:19",
                        updated_at: "2020-08-24 10:48:19",
                        data_migrated_at: "2021-06-17 05:00:09",
                    },
                    {
                        id: 49350,
                        cookie_id: "ssr-caching",
                        description: { en: "WIX - Indicates how a site was rendered." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 minute",
                        domain: "www.lg-elektrotechnik.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-14 13:14:58",
                        updated_at: "2020-09-14 13:14:58",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49354,
                        cookie_id: "TS01e85bed",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: "www.lg-elektrotechnik.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-14 13:14:58",
                        updated_at: "2020-09-14 13:14:58",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49355,
                        cookie_id: "bSession",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "30 minutes",
                        domain: "www.lg-elektrotechnik.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-14 13:14:58",
                        updated_at: "2020-09-14 13:14:58",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49356,
                        cookie_id: "TS017096b3",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: ".www.lg-elektrotechnik.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-14 13:14:58",
                        updated_at: "2020-09-14 13:14:58",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49406,
                        cookie_id: "CFID",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: "www.ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49407,
                        cookie_id: "CFTOKEN",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "www.ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49409,
                        cookie_id: "ISGOOD",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "29 years",
                        domain: "www.ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49410,
                        cookie_id: "__cfruid",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: ".www.ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49411,
                        cookie_id: "civicCookieControl",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "2 months",
                        domain: "www.ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49412,
                        cookie_id: "CFCLIENT_ISHAGUE",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "29 years",
                        domain: "www.ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49413,
                        cookie_id: "CFGLOBALS",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "29 years",
                        domain: "www.ishthehague.nl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 05:15:38",
                        updated_at: "2020-09-15 05:15:38",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49444,
                        cookie_id: "sync_601df59f-1277-41ba-926e-92b25c5e28bd",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 day",
                        domain: "px.powerlinks.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49445,
                        cookie_id: "userID",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "7979 years",
                        domain: ".sphereup.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49452,
                        cookie_id: "__gfp_64b",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "2 years",
                        domain: ".israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49453,
                        cookie_id: "Gtest",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "5 years",
                        domain: ".hit.gemius.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49458,
                        cookie_id: "Gdyn",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "5 years",
                        domain: ".hit.gemius.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49459,
                        cookie_id: "obuid",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "2 months",
                        domain: ".outbrain.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49460,
                        cookie_id: "logglytrackingsession",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: "www.israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49461,
                        cookie_id: "OB-USER-TOKEN",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "2 months",
                        domain: ".israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49465,
                        cookie_id: "c",
                        description: { en: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".bidswitch.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49473,
                        cookie_id: "bkpa",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "5 months",
                        domain: ".bluekai.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49475,
                        cookie_id: "ssh",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "2 years",
                        domain: ".mfadsrvr.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:29",
                    },
                    {
                        id: 49480,
                        cookie_id: "gdpr_status",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "6 months",
                        domain: ".media.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49481,
                        cookie_id: "data-bs",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "11 months",
                        domain: ".media.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49484,
                        cookie_id: "zuid",
                        description: { en: "The cookie domain is owned by Zemanta.This is used to identify the trusted web traffic by the content network, Cloudflare." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".zemanta.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49486,
                        cookie_id: "u",
                        description: { en: "The purpose of this cookie is targeting and marketing.The domain of this cookie is related with a company called Bombora in USA." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".creativecdn.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49489,
                        cookie_id: "partners",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".adotmob.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49490,
                        cookie_id: "actvagnt",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".outbrain.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49491,
                        cookie_id: "mdfrc",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".outbrain.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49492,
                        cookie_id: "ttd",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".outbrain.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49493,
                        cookie_id: "gdpid",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".geistm.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49494,
                        cookie_id: "UIDR",
                        description: {
                            en:
                                "This cookie is set bu scorecardresearch.com. The cookie is used to tracks the users activity across the internet on the browser such as visit timestamp, IP address, and most recently visited webpages. and may the data send to 3rd party for analysis and reporting to help their clients better understand user preferences.",
                        },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".scorecardresearch.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49495,
                        cookie_id: "rtbhs",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".outbrain.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49496,
                        cookie_id: "bdswch",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".outbrain.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49497,
                        cookie_id: "pwrlnks",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".outbrain.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49498,
                        cookie_id: "zmnta",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".outbrain.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49499,
                        cookie_id: "adot",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".outbrain.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49500,
                        cookie_id: "ab_23184267",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "1 week",
                        domain: "zdwidget3-bs.sphereup.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49501,
                        cookie_id: "zdSessionId_23184267",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 day",
                        domain: "www.israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49502,
                        cookie_id: "23184267-ehtoken",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "7 minutes",
                        domain: "www.israelhayom.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49506,
                        cookie_id: "HAPLB5S",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: ".go.sonobi.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:23",
                        updated_at: "2020-09-15 08:07:23",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49507,
                        cookie_id: "tluid",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "2 months",
                        domain: ".3lift.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49508,
                        cookie_id: "am-uid",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "2 years",
                        domain: ".admixer.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49509,
                        cookie_id: "stx_user_id",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".sharethrough.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49510,
                        cookie_id: "smxtrack",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "11 months",
                        domain: ".smadex.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49511,
                        cookie_id: "ayl_visitor",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".omnitagjs.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49515,
                        cookie_id: "__adm_ui",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "11 months",
                        domain: ".admatic.com.tr",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49516,
                        cookie_id: "__adm_uiex",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "11 months",
                        domain: ".admatic.com.tr",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49517,
                        cookie_id: "__adm_usyncc",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "5 days",
                        domain: ".admatic.com.tr",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49521,
                        cookie_id: "cref",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".quantserve.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49522,
                        cookie_id: "device_uuid",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "49 years",
                        domain: ".spot.im",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49523,
                        cookie_id: "ig_did",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "9 years",
                        domain: ".instagram.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49527,
                        cookie_id: "syncUuid",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: "lb.artipbox.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49528,
                        cookie_id: "access_token",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "10 months",
                        domain: ".spot.im",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49529,
                        cookie_id: "spotim-device-v2",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "5 days",
                        domain: ".spot.im",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49530,
                        cookie_id: "AMSYNC",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "10 hours",
                        domain: ".israelhayom-cdnwiz.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49531,
                        cookie_id: "check",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 day",
                        domain: "go.flx1.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49537,
                        cookie_id: "R",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 week",
                        domain: "go.flx1.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49538,
                        cookie_id: "BIGipServerd.co.il_2.0_pool_https",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "www.d.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49539,
                        cookie_id: "TS0127ef94",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: ".d.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:24",
                        updated_at: "2020-09-15 08:07:24",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49540,
                        cookie_id: "AMUUID",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "7979 years",
                        domain: ".israelhayom-cdnwiz.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49541,
                        cookie_id: "AMZAP",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 week",
                        domain: ".israelhayom-cdnwiz.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49542,
                        cookie_id: "AMWEEZMO_A",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 day",
                        domain: ".israelhayom-cdnwiz.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49543,
                        cookie_id: "09092020_DC",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".israelhayom-cdnwiz.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49544,
                        cookie_id: "08092020_ca",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 month",
                        domain: ".israelhayom-cdnwiz.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49545,
                        cookie_id: "PairzonID",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".pairzon.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49546,
                        cookie_id: "BIGipServerb3tacore.zap.co.il",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "www.zap.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49547,
                        cookie_id: "TS01920653",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: ".www.zap.co.il",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 49549,
                        cookie_id: "bitoIsSecure",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".bidr.io",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-15 08:07:25",
                        updated_at: "2020-09-15 08:07:25",
                        data_migrated_at: "2021-06-17 05:00:30",
                    },
                    {
                        id: 50144,
                        cookie_id: "rc2c-lang_code",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50145,
                        cookie_id: "rc2c-currency",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50146,
                        cookie_id: "rc2c-erotica",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50147,
                        cookie_id: "rc2c-listing-layout",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50148,
                        cookie_id: "rc2c-pop",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50149,
                        cookie_id: "rc2c-sort",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50150,
                        cookie_id: "rc2c-view",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50152,
                        cookie_id: "acc_segment",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 week",
                        domain: "www.opineo.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50153,
                        cookie_id: "rc_site_open_7922",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50154,
                        cookie_id: "misTime",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 50155,
                        cookie_id: "mis",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "9 years",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-09-17 07:36:27",
                        updated_at: "2020-09-17 07:36:27",
                        data_migrated_at: "2021-06-17 05:00:33",
                    },
                    {
                        id: 54959,
                        cookie_id: "shopify_web_return_to",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "5 minutes",
                        domain: "my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54960,
                        cookie_id: "_master_udr",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "2 years",
                        domain: "my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54961,
                        cookie_id: "_secure_admin_session_id_csrf",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "3 months",
                        domain: "my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54962,
                        cookie_id: "_secure_admin_session_id",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "3 months",
                        domain: "my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54963,
                        cookie_id: "identity-state",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "1 day",
                        domain: "my-workplaces.myshopify.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54964,
                        cookie_id: "master_device_id",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "2 years",
                        domain: ".shopify.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54965,
                        cookie_id: "_identity_session",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "2 years",
                        domain: "accounts.shopify.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54966,
                        cookie_id: "__Host-_identity_session_same_site",
                        description: { en: "Description is currently not available." },
                        type: 1,
                        category_id: 38614,
                        duration: "2 years",
                        domain: "accounts.shopify.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 54967,
                        cookie_id: "device_id",
                        description: { en: "Description is currently not available." },
                        type: 0,
                        category_id: 38614,
                        duration: "20 years",
                        domain: "accounts.shopify.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-10-16 10:45:37",
                        updated_at: "2020-10-16 10:45:37",
                        data_migrated_at: "2021-06-17 05:00:59",
                    },
                    {
                        id: 60865,
                        cookie_id: "preference",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  30 days",
                        domain: "",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 05:10:26",
                        updated_at: "2020-12-01 05:10:26",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60866,
                        cookie_id: "rc2c-sort-news",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:18:57",
                        updated_at: "2020-12-01 06:18:57",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60867,
                        cookie_id: "_ga_55PYPREWW8",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  20 days  8 hours  52 minutes",
                        domain: ".wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:18:57",
                        updated_at: "2020-12-01 06:18:57",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60870,
                        cookie_id: "_hjid",
                        description: {
                            en:
                                "This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                        },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days   6 minutes",
                        domain: ".wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:18:57",
                        updated_at: "2020-12-01 06:18:57",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60871,
                        cookie_id: "_hjFirstSeen",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  21 minutes",
                        domain: ".wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:18:57",
                        updated_at: "2020-12-01 06:18:57",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60872,
                        cookie_id: "rc2c-login",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  21 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:18:58",
                        updated_at: "2020-12-01 06:18:58",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60873,
                        cookie_id: "filter_slide",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:18:58",
                        updated_at: "2020-12-01 06:18:58",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60877,
                        cookie_id: "USER_INFO",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "past",
                        domain: "",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:01",
                        updated_at: "2020-12-01 06:19:01",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60879,
                        cookie_id: "redcart_info_326",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:03",
                        updated_at: "2020-12-01 06:19:03",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60880,
                        cookie_id: "rc_repository_7922",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  36 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:03",
                        updated_at: "2020-12-01 06:19:03",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60881,
                        cookie_id: "redcart_lvp_7922",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  31 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:03",
                        updated_at: "2020-12-01 06:19:03",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60882,
                        cookie_id: "redcart_info_360",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:03",
                        updated_at: "2020-12-01 06:19:03",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60883,
                        cookie_id: "redcart_info_362",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:04",
                        updated_at: "2020-12-01 06:19:04",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60884,
                        cookie_id: "redcart_info_333",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:04",
                        updated_at: "2020-12-01 06:19:04",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60885,
                        cookie_id: "redcart_info_327",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:04",
                        updated_at: "2020-12-01 06:19:04",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60886,
                        cookie_id: "redcart_info_332",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:05",
                        updated_at: "2020-12-01 06:19:05",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60887,
                        cookie_id: "redcart_info_563",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:05",
                        updated_at: "2020-12-01 06:19:05",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60888,
                        cookie_id: "redcart_info_565",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:05",
                        updated_at: "2020-12-01 06:19:05",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60889,
                        cookie_id: "redcart_info_561",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:05",
                        updated_at: "2020-12-01 06:19:05",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60890,
                        cookie_id: "redcart_info_314",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:06",
                        updated_at: "2020-12-01 06:19:06",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60891,
                        cookie_id: "redcart_info_558",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:06",
                        updated_at: "2020-12-01 06:19:06",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60892,
                        cookie_id: "redcart_info_310",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:06",
                        updated_at: "2020-12-01 06:19:06",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60893,
                        cookie_id: "redcart_info_328",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:06",
                        updated_at: "2020-12-01 06:19:06",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60894,
                        cookie_id: "redcart_info_340",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:06",
                        updated_at: "2020-12-01 06:19:06",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60895,
                        cookie_id: "redcart_info_373",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:07",
                        updated_at: "2020-12-01 06:19:07",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60896,
                        cookie_id: "redcart_info_564",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:07",
                        updated_at: "2020-12-01 06:19:07",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60897,
                        cookie_id: "redcart_info_559",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:07",
                        updated_at: "2020-12-01 06:19:07",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60898,
                        cookie_id: "redcart_info_291",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:07",
                        updated_at: "2020-12-01 06:19:07",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60899,
                        cookie_id: "redcart_info_560",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:08",
                        updated_at: "2020-12-01 06:19:08",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60900,
                        cookie_id: "redcart_info_556",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:08",
                        updated_at: "2020-12-01 06:19:08",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60901,
                        cookie_id: "redcart_info_336",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:15",
                        updated_at: "2020-12-01 06:19:15",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60902,
                        cookie_id: "redcart_info_404",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:16",
                        updated_at: "2020-12-01 06:19:16",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60903,
                        cookie_id: "redcart_info_696",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:17",
                        updated_at: "2020-12-01 06:19:17",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60904,
                        cookie_id: "redcart_info_375",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:17",
                        updated_at: "2020-12-01 06:19:17",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60905,
                        cookie_id: "redcart_info_693",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:17",
                        updated_at: "2020-12-01 06:19:17",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60906,
                        cookie_id: "redcart_info_341",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:17",
                        updated_at: "2020-12-01 06:19:17",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60907,
                        cookie_id: "redcart_info_454",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:18",
                        updated_at: "2020-12-01 06:19:18",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60908,
                        cookie_id: "redcart_info_592",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:18",
                        updated_at: "2020-12-01 06:19:18",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60909,
                        cookie_id: "redcart_info_582",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:18",
                        updated_at: "2020-12-01 06:19:18",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60910,
                        cookie_id: "redcart_info_525",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:19",
                        updated_at: "2020-12-01 06:19:19",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60911,
                        cookie_id: "redcart_info_530",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:19",
                        updated_at: "2020-12-01 06:19:19",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60912,
                        cookie_id: "redcart_info_529",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:19",
                        updated_at: "2020-12-01 06:19:19",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60913,
                        cookie_id: "redcart_info_523",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:19",
                        updated_at: "2020-12-01 06:19:19",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60914,
                        cookie_id: "redcart_info_459",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:19",
                        updated_at: "2020-12-01 06:19:19",
                        data_migrated_at: "2021-06-17 05:01:35",
                    },
                    {
                        id: 60915,
                        cookie_id: "redcart_info_471",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:20",
                        updated_at: "2020-12-01 06:19:20",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60916,
                        cookie_id: "redcart_info_527",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:20",
                        updated_at: "2020-12-01 06:19:20",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60917,
                        cookie_id: "redcart_info_457",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:20",
                        updated_at: "2020-12-01 06:19:20",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60918,
                        cookie_id: "redcart_info_318",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:20",
                        updated_at: "2020-12-01 06:19:20",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60919,
                        cookie_id: "redcart_info_594",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:20",
                        updated_at: "2020-12-01 06:19:20",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60920,
                        cookie_id: "redcart_info_542",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:20",
                        updated_at: "2020-12-01 06:19:20",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60921,
                        cookie_id: "redcart_info_512",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:21",
                        updated_at: "2020-12-01 06:19:21",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60922,
                        cookie_id: "redcart_info_613",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:21",
                        updated_at: "2020-12-01 06:19:21",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60923,
                        cookie_id: "redcart_info_455",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:21",
                        updated_at: "2020-12-01 06:19:21",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60924,
                        cookie_id: "redcart_info_402",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:21",
                        updated_at: "2020-12-01 06:19:21",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60925,
                        cookie_id: "redcart_info_298",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:21",
                        updated_at: "2020-12-01 06:19:21",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60926,
                        cookie_id: "redcart_info_415",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:22",
                        updated_at: "2020-12-01 06:19:22",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60927,
                        cookie_id: "redcart_info_566",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:22",
                        updated_at: "2020-12-01 06:19:22",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60928,
                        cookie_id: "redcart_info_464",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:22",
                        updated_at: "2020-12-01 06:19:22",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60929,
                        cookie_id: "redcart_info_610",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:22",
                        updated_at: "2020-12-01 06:19:22",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60930,
                        cookie_id: "redcart_info_570",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:22",
                        updated_at: "2020-12-01 06:19:22",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60931,
                        cookie_id: "redcart_info_509",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:23",
                        updated_at: "2020-12-01 06:19:23",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60932,
                        cookie_id: "redcart_info_397",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:23",
                        updated_at: "2020-12-01 06:19:23",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60933,
                        cookie_id: "redcart_info_548",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:23",
                        updated_at: "2020-12-01 06:19:23",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60934,
                        cookie_id: "redcart_info_478",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:23",
                        updated_at: "2020-12-01 06:19:23",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60935,
                        cookie_id: "redcart_info_597",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:23",
                        updated_at: "2020-12-01 06:19:23",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60936,
                        cookie_id: "redcart_info_587",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:24",
                        updated_at: "2020-12-01 06:19:24",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60937,
                        cookie_id: "redcart_info_518",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:24",
                        updated_at: "2020-12-01 06:19:24",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60938,
                        cookie_id: "redcart_info_510",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:24",
                        updated_at: "2020-12-01 06:19:24",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60939,
                        cookie_id: "redcart_info_514",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:24",
                        updated_at: "2020-12-01 06:19:24",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60940,
                        cookie_id: "redcart_info_462",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:25",
                        updated_at: "2020-12-01 06:19:25",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60941,
                        cookie_id: "redcart_info_603",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:25",
                        updated_at: "2020-12-01 06:19:25",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60942,
                        cookie_id: "redcart_info_520",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:25",
                        updated_at: "2020-12-01 06:19:25",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60943,
                        cookie_id: "redcart_info_519",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:25",
                        updated_at: "2020-12-01 06:19:25",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60944,
                        cookie_id: "redcart_info_446",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:25",
                        updated_at: "2020-12-01 06:19:25",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60945,
                        cookie_id: "redcart_info_516",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:25",
                        updated_at: "2020-12-01 06:19:25",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60946,
                        cookie_id: "redcart_info_505",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:25",
                        updated_at: "2020-12-01 06:19:25",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60947,
                        cookie_id: "redcart_info_448",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:26",
                        updated_at: "2020-12-01 06:19:26",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60948,
                        cookie_id: "redcart_info_614",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:26",
                        updated_at: "2020-12-01 06:19:26",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60949,
                        cookie_id: "redcart_info_449",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:26",
                        updated_at: "2020-12-01 06:19:26",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60950,
                        cookie_id: "redcart_info_517",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:26",
                        updated_at: "2020-12-01 06:19:26",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60951,
                        cookie_id: "redcart_info_540",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:26",
                        updated_at: "2020-12-01 06:19:26",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60952,
                        cookie_id: "redcart_info_425",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:27",
                        updated_at: "2020-12-01 06:19:27",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60953,
                        cookie_id: "redcart_info_627",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:27",
                        updated_at: "2020-12-01 06:19:27",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60954,
                        cookie_id: "redcart_info_538",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:27",
                        updated_at: "2020-12-01 06:19:27",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60955,
                        cookie_id: "redcart_info_598",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:27",
                        updated_at: "2020-12-01 06:19:27",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60956,
                        cookie_id: "redcart_info_504",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:27",
                        updated_at: "2020-12-01 06:19:27",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60957,
                        cookie_id: "redcart_info_496",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:27",
                        updated_at: "2020-12-01 06:19:27",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60958,
                        cookie_id: "redcart_info_442",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:27",
                        updated_at: "2020-12-01 06:19:27",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 60959,
                        cookie_id: "redcart_info_640",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "wystroj-okien.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-01 06:19:27",
                        updated_at: "2020-12-01 06:19:27",
                        data_migrated_at: "2021-06-17 05:01:36",
                    },
                    {
                        id: 61491,
                        cookie_id: "CookieConsent",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "www.hausbellevue.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61492,
                        cookie_id: "iom_consent",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  25 days  21 hours  32 minutes",
                        domain: ".schneehoehen.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61494,
                        cookie_id: "dcs",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  30 days",
                        domain: "",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61495,
                        cookie_id: "i00",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  255 days  3 hours  57 minutes",
                        domain: "iocnt.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61496,
                        cookie_id: "ioam2018",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  23 hours  27 minutes",
                        domain: ".feratel.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61497,
                        cookie_id: "anProfile",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: ".pro-market.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61498,
                        cookie_id: "BNU",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "past",
                        domain: ".bravenet.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61500,
                        cookie_id: "HASCOOKIES",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  23 days  6 hours  58 minutes",
                        domain: ".bravenet.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61501,
                        cookie_id: "BNETSESSID",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: ".bravenet.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:00:36",
                        updated_at: "2020-12-02 05:00:36",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61516,
                        cookie_id: "RD_IDAKCS4642",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  5 days",
                        domain: "",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:08",
                        updated_at: "2020-12-02 05:48:08",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61517,
                        cookie_id: "__goadservices",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "2 years",
                        domain: ".goadservices.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:08",
                        updated_at: "2020-12-02 05:48:08",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61518,
                        cookie_id: "_snrs_3b1cef05aa7027ed36855884ad7a68d2",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "2 years",
                        domain: "web.snrbox.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:08",
                        updated_at: "2020-12-02 05:48:08",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61519,
                        cookie_id: "history",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  30 days",
                        domain: ".revhunter.tech",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:08",
                        updated_at: "2020-12-02 05:48:08",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61521,
                        cookie_id: "dekoriaplclib",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  32 minutes",
                        domain: ".www.dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:08",
                        updated_at: "2020-12-02 05:48:08",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61522,
                        cookie_id: "dekoriaplwllib",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  16 hours  5 minutes",
                        domain: ".www.dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61523,
                        cookie_id: "www_dekoria_pl_lpcnt_1",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: ".www.dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61529,
                        cookie_id: "__wph_a",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days   8 minutes",
                        domain: "www.dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61530,
                        cookie_id: "__wph_s",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: "www.dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61531,
                        cookie_id: "__wph_st",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  23 minutes",
                        domain: "www.dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61532,
                        cookie_id: "statid",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  20 days  17 hours  39 minutes",
                        domain: ".wp.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61533,
                        cookie_id: "adf",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  16 hours  5 minutes",
                        domain: ".revhunter.tech",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61535,
                        cookie_id: "_dc_gtm_UA-1455913-6",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: ".dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61543,
                        cookie_id: "adv_awc",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "past",
                        domain: "dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61544,
                        cookie_id: "__goadservices_test",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: ".dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:09",
                        updated_at: "2020-12-02 05:48:09",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61545,
                        cookie_id: "cto_tld_test",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  22 minutes",
                        domain: ".dekoria.pl",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:11",
                        updated_at: "2020-12-02 05:48:11",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61547,
                        cookie_id: "cssvarsup",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "past",
                        domain: "",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:14",
                        updated_at: "2020-12-02 05:48:14",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 61548,
                        cookie_id: "anj",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  90 days",
                        domain: ".adnxs.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-02 05:48:22",
                        updated_at: "2020-12-02 05:48:22",
                        data_migrated_at: "2021-06-17 05:01:39",
                    },
                    {
                        id: 66296,
                        cookie_id: "dekoriadedshopsx",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours",
                        domain: "www.dekoria.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:27:52",
                        updated_at: "2020-12-18 14:27:52",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66297,
                        cookie_id: "dekoriadeclib",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  56 minutes",
                        domain: ".www.dekoria.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:27:52",
                        updated_at: "2020-12-18 14:27:52",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66298,
                        cookie_id: "dekoriadewllib",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  16 hours  29 minutes",
                        domain: ".www.dekoria.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:27:52",
                        updated_at: "2020-12-18 14:27:52",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66299,
                        cookie_id: "www_dekoria_de_newspop",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  23 days  7 hours  22 minutes",
                        domain: ".www.dekoria.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:27:52",
                        updated_at: "2020-12-18 14:27:52",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66300,
                        cookie_id: "_gat_gtag_UA_8457682_3",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  46 minutes",
                        domain: ".dekoria.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:27:52",
                        updated_at: "2020-12-18 14:27:52",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66302,
                        cookie_id: "nQ_userVisitId",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  46 minutes",
                        domain: "www.dekoria.de",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:27:52",
                        updated_at: "2020-12-18 14:27:52",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66303,
                        cookie_id: "x-cdn",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: null,
                        domain: "paypal.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:40:55",
                        updated_at: "2020-12-18 14:40:55",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66304,
                        cookie_id: "tsrce",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  3 days",
                        domain: ".paypal.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:40:55",
                        updated_at: "2020-12-18 14:40:55",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66305,
                        cookie_id: "l7_az",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  1 days  1 hours  30 minutes",
                        domain: "paypal.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:40:55",
                        updated_at: "2020-12-18 14:40:55",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66307,
                        cookie_id: "RUL",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 years",
                        domain: ".doubleclick.net",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:40:57",
                        updated_at: "2020-12-18 14:40:57",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 66309,
                        cookie_id: "cf_use_ob",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 years  19 days  15 hours  46 minutes",
                        domain: "cdn2.dekoria.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2020-12-18 14:41:17",
                        updated_at: "2020-12-18 14:41:17",
                        data_migrated_at: "2021-06-17 05:02:01",
                    },
                    {
                        id: 187156,
                        cookie_id: "121",
                        description: { en: "sdsd" },
                        type: 0,
                        category_id: 38614,
                        duration: "32",
                        domain: "sdsd",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-03-11 05:27:34",
                        updated_at: "2021-03-11 05:27:34",
                        data_migrated_at: "2021-06-17 05:14:05",
                    },
                    {
                        id: 277992,
                        cookie_id: "cookieyes-test",
                        description: { en: "No description" },
                        type: 1,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-04-05 11:07:45",
                        updated_at: "2021-04-05 11:07:45",
                        data_migrated_at: "2021-06-17 06:12:26",
                    },
                    {
                        id: 277993,
                        cookie_id: "cookieyes-testq",
                        description: { en: "No description" },
                        type: 0,
                        category_id: 38614,
                        duration: "1 year",
                        domain: ".weebly.com",
                        website_id: 10116,
                        script_slug: null,
                        url_pattern: null,
                        created_from_scan: 0,
                        url_pattern_updated: 0,
                        created_at: "2021-04-05 11:07:45",
                        updated_at: "2021-04-05 11:07:45",
                        data_migrated_at: "2021-06-17 06:12:26",
                    },
                ],
                scripts: [],
            },
        ],
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
        Element.prototype.remove =
            Element.prototype.remove ||
            function () {
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
                const ccpaCloseBtn = '<button type="button" class="cky-consent-close" id="ckyCcpaModalClose"><img src="https://cdn-cookieyes.com/assets/images/icons/close.svg" style="width: 9px" alt="consent-close-icon"></button>';
                document.querySelector("#cky-consent").insertAdjacentHTML("afterbegin", ccpaCloseBtn);
                document.querySelector("#cky-consent #ckyCcpaModalClose").onclick = showToggler;
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
                var readMoreButton = '<a class="cky-btn-readMore" rel="noreferrer" id="cky-btn-readMore" href="' + privacyLink + '" target="_blank">' + content[ckyActiveLaw].buttons["readMore"][selectedLanguage] + "</a>";
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
                    '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" rel="noreferrer" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
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
                    ';font-weight: normal;text-align: right;">Powered by <a target="_blank" rel="noreferrer" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
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
                if (JSON.parse(category.status)) {
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
                    '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" rel="noreferrer" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
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
                checkAndInsertScripts(info.categories);
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
                        if (category.status) {
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
                    if (category.status) {
                        cookie.set("cookieyes-" + category.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
                    } else {
                        cookie.set("cookieyes-" + category.slug, "no", cookie.ACCEPT_COOKIE_EXPIRE);
                    }
                } else {
                    cookie.set("cookieyes-" + category.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
                }
            }
            cookieYes.unblock();
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
                if (category.isAddedToDom) continue;
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
            category.isAddedToDom = true;
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
    ckyCount(createBannerOnLoad);
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
const categoryScripts = [
    { re: "instagram.com", categories: ["functional"] },
    { re: "livechatinc.com", categories: ["functional"] },
    { re: "google-analytics.com", categories: ["analytics"] },
    { re: "google.com", categories: ["analytics", "advertisement"] },
    { re: "demdex.net", categories: ["analytics", "advertisement"] },
    { re: "rfihub.com", categories: ["analytics", "advertisement"] },
    { re: "shopify.com", categories: ["analytics"] },
    { re: "youtube.com", categories: ["analytics", "advertisement"] },
    { re: "facebook.*", categories: ["advertisement"] },
    { re: "doubleclick.net", categories: ["advertisement"] },
    { re: "rlcdn.com", categories: ["advertisement"] },
    { re: "agkn.com", categories: ["advertisement"] },
    { re: "bidswitch.net", categories: ["advertisement"] },
    { re: "krxd.net", categories: ["advertisement"] },
    { re: "bluekai.com", categories: ["advertisement"] },
    { re: "eyeota.net", categories: ["advertisement"] },
    { re: "quantserve.com", categories: ["advertisement"] },
    { re: "crwdcntrl.net", categories: ["advertisement"] },
    { re: "adnxs.com", categories: ["advertisement"] },
    { re: "youtube-nocookie.com", categories: ["functional"] },
    { re: "bing.com", categories: ["functional"] },
    { re: "vimeo.com", categories: ["functional"] },
    { re: "spotify.com", categories: ["functional"] },
    { re: "sharethis.com", categories: ["functional"] },
    { re: "yahoo.com", categories: ["functional"] },
    { re: "addtoany.com", categories: ["functional"] },
    { re: "dailymotion.com", categories: ["functional"] },
    { re: "slideshare.net", categories: ["functional"] },
    { re: "soundcloud.com", categories: ["functional"] },
    { re: "tawk.to", categories: ["functional"] },
    { re: "cky-functional.js", categories: ["functional"] },
    { re: "cky-performance.js", categories: ["performance"] },
    { re: "analytics", categories: ["analytics"] },
    { re: "googletagmanager.com", categories: ["analytics"] },
    { re: "cky-analytics.js", categories: ["analytics"] },
    { re: "hotjar.com", categories: ["analytics"] },
    { re: "js.hs-scripts.com", categories: ["analytics"] },
    { re: "js.hs-analytics.net", categories: ["analytics"] },
    { re: "taboola.com", categories: ["analytics"] },
    { re: "analytics.ycdn.de", categories: ["analytics"] },
    { re: "plugins/activecampaign-subscription-forms", categories: ["analytics"] },
    { re: ".addthis.com", categories: ["advertisement"] },
    { re: "amazon-adsystem.com", categories: ["advertisement"] },
    { re: "googleadservices.com", categories: ["advertisement"] },
    { re: "googlesyndication.com", categories: ["advertisement"] },
    { re: ".pinterest.com", categories: ["advertisement"] },
    { re: ".linkedin.com", categories: ["advertisement"] },
    { re: ".twitter.com", categories: ["advertisement"] },
    { re: "cky-advertisement.js", categories: ["advertisement"] },
];
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
var backupRemovedScripts = { blacklisted: [] };
CKY_BLACKLIST = [];
CKY_WHITELIST = [];
var ckyconsent = getCategoryCookie("cky-consent") ? getCategoryCookie("cky-consent") : "no";
var TYPE_ATTRIBUTE = "javascript/blocked";
if (navigator.doNotTrack == 1) {
    categoryScripts.forEach(function (item) {
        CKY_BLACKLIST.push(new RegExp(escapeRegExp(item.re)));
    });
} else if (cliConfig.options.consentType !== "info") {
    categoryScripts.forEach(function (item) {
        if (item.categories.length === 1 && item.categories[0] && loadAnalyticsByDefault) return;
        if (ckyconsent !== "yes") {
            CKY_BLACKLIST.push(new RegExp(escapeRegExp(item.re)));
            return;
        }
        for (let i = 0; i < item.categories.length; i++) {
            if (getCategoryCookie("cookieyes-" + item.categories[i]) !== "yes") {
                CKY_BLACKLIST.push(new RegExp(escapeRegExp(item.re)));
                break;
            }
        }
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
                if (node.hasAttribute("data-cookieyes")) {
                    for (let i = 0; i < cliConfig.info.categories.length; i++) {
                        if (cliConfig.info.categories[i].type === 1 && node.getAttribute("data-cookieyes").replace("cookieyes-", "") === cliConfig.info.categories[i].slug) return;
                    }
                    if (getCategoryCookie(node.getAttribute("data-cookieyes")) != "yes") {
                        var cat = node.getAttribute("data-cookieyes");
                        if (node.src !== "" && typeof node.src !== undefined) {
                            var webdetail = new URL(node.src);
                            var category = categoryScripts.find(function (cat) {
                                return cat.re === webdetail.hostname.replace(/^www./, "");
                            });
                            if (category) {
                                if (!category.isReplaced) {
                                    category.categories = [cat.replace("cookieyes-", "")];
                                    category.isReplaced = true;
                                } else if (category.categories.indexOf(cat.replace("cookieyes-", "")) === -1) {
                                    category.categories.push(cat.replace("cookieyes-", ""));
                                }
                                if (!isOnBlacklist(src)) {
                                    Array.prototype.push.apply(window.CKY_BLACKLIST, [new RegExp(escapeRegExp(webdetail.hostname.replace(/^www./, "")))]);
                                    Array.prototype.push.apply(patterns.blacklist, [new RegExp(escapeRegExp(webdetail.hostname.replace(/^www./, "")))]);
                                }
                            } else {
                                Array.prototype.push.apply(window.CKY_BLACKLIST, [new RegExp(escapeRegExp(webdetail.hostname.replace(/^www./, "")))]);
                                Array.prototype.push.apply(patterns.blacklist, [new RegExp(escapeRegExp(webdetail.hostname.replace(/^www./, "")))]);
                                categoryScripts.push({ re: webdetail.hostname.replace(/^www./, ""), categories: [cat.replace("cookieyes-", "")] });
                            }
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
    if (args[0].toLowerCase() !== "script") return createElementBackup.apply(document, _toConsumableArray(args));
    var scriptElt = createElementBackup.apply(document, _toConsumableArray(args));
    var originalSetAttribute = scriptElt.setAttribute.bind(scriptElt);
    Object.defineProperties(scriptElt, {
        src: {
            get: function () {
                return scriptElt.getAttribute("src");
            },
            set: function (value) {
                var isNeccessary = scriptElt.hasAttribute("data-cookieyes") && scriptElt.getAttribute("data-cookieyes") === "cookieyes-necessary";
                if (isOnBlacklist(value) && !isNeccessary) {
                    originalSetAttribute("type", TYPE_ATTRIBUTE);
                }
                originalSetAttribute("src", value);
                return true;
            },
        },
        type: {
            set: function (value) {
                var isNeccessary = scriptElt.hasAttribute("data-cookieyes") && scriptElt.getAttribute("data-cookieyes") === "cookieyes-necessary";
                var typeValue = isOnBlacklist(scriptElt.src) && !isNeccessary ? TYPE_ATTRIBUTE : value;
                originalSetAttribute("type", typeValue);
                return true;
            },
        },
    });
    scriptElt.setAttribute = function (name, value) {
        if (name === "type" || name === "src") {
            scriptElt[name] = value;
            return;
        }
        if (name === "data-cookieyes" && value === "cookieyes-necessary") originalSetAttribute("type", "text/javascript");
        HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value);
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
        if (navigator.doNotTrack == 1) return;
        var ckyconsent = getCategoryCookie("cky-consent") ? getCategoryCookie("cky-consent") : "no";
        categoryScripts.forEach(function (item) {
            if ((ckyconsent == "yes" && !isCategoryAccepted(item)) || (ckyActiveLaw === "ccpa" && getCategoryCookie("cky-consent") === "no") || (ckyActiveLaw === "ccpa" && !isCategoryAccepted(item))) {
                Array.prototype.push.apply(window.CKY_WHITELIST, [new RegExp(escapeRegExp(item.re))]);
                Array.prototype.push.apply(patterns.whitelist, [new RegExp(escapeRegExp(item.re))]);
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
function isCategoryAccepted(item) {
    return item.categories.some(function (category) {
        return getCategoryCookie("cookieyes-" + category) === "no";
    });
}
Array.prototype.find =
    Array.prototype.find ||
    function (callback) {
        if (this === null) {
            throw new TypeError("Array.prototype.find called on null or undefined");
        } else if (typeof callback !== "function") {
            throw new TypeError("callback must be a function");
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        for (var i = 0; i < length; i++) {
            var element = list[i];
            if (callback.call(thisArg, element, i, list)) {
                return element;
            }
        }
    };
function escapeRegExp(url) {
    return url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
