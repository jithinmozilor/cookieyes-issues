/******/ (() => { // webpackBootstrap
  var __webpack_exports__ = {};
  /*!*************************!*\
    !*** ./classic-gdpr.js ***!
    \*************************/
  const _ckyStore = {
    _ipData: {},
    _backupNodes: [],
    _language: {
      _store: new Map(),
      _default: "en",
      _current: "en",
      _supported: ["en", "de", "fr", "it", "es"]
    },
    _expiry: 365,
    _categories: [{
      "slug": "necessary",
      "isNecessary": true,
      "defaultConsent": true,
      "ccpaDoNotSell": false,
      "cookies": [{
        "cookieID": "_GRECAPTCHA",
        "domain": ".google.com"
      }]
    }, {
      "slug": "functional",
      "isNecessary": false,
      "defaultConsent": false,
      "ccpaDoNotSell": false,
      "cookies": []
    }, {
      "slug": "analytics",
      "isNecessary": false,
      "defaultConsent": false,
      "ccpaDoNotSell": false,
      "cookies": [{
        "cookieID": "_ga",
        "domain": ".mozilor.com"
      }, {
        "cookieID": "_gid",
        "domain": ".mozilor.com"
      }, {
        "cookieID": "_gat_gtag_UA_114405147_3",
        "domain": ".mozilor.com"
      }]
    }, {
      "slug": "performance",
      "isNecessary": false,
      "defaultConsent": false,
      "ccpaDoNotSell": false,
      "cookies": []
    }, {
      "slug": "advertisement",
      "isNecessary": false,
      "defaultConsent": false,
      "ccpaDoNotSell": false,
      "cookies": [{
        "cookieID": "_fbp",
        "domain": ".mozilor.com"
      }]
    }],
    _providersToBlock: [{
      "re": "tawk.to",
      "categories": ["functional"]
    }, {
      "re": "hotjar.com",
      "categories": ["analytics"]
    }, {
      "re": "vimeo.com",
      "categories": ["analytics"]
    }, {
      "re": "google-analytics.com",
      "categories": ["analytics", "performance"]
    }, {
      "re": "youtube.com",
      "categories": ["advertisement"]
    }, {
      "re": "doubleclick.net",
      "categories": ["advertisement"]
    }],
    _activeLaw: "gdpr",
    _rootDomain: "www.mozilor.com"
  };
  window._ckyAPIs = {
    onActionCallback: () => { }
  };

  async function _ckyGeoIP() {
    try {
      const geoIPResponse = await _ckyRequest("https://geoip.https://jithinmozilor.github.io//geoip/checker/result.php", "GET");
      if (geoIPResponse.status !== 200) throw new Error();
      const {
        ip: clientIP,
        in_eu: userInEu,
        country_name: countryName,
        region_code: regionCode
      } = await geoIPResponse.json();
      _ckyStore._ipData = {
        clientIP,
        userInEu,
        countryName,
        userInUS: countryName === "US",
        userInCF: countryName === "US" && regionCode === "CA"
      };
    } catch (err) {
      console.error(err);
      _ckyStore._ipData = {
        userInEu: true
      };
    }
  }

  async function _ckyLogCookies() {
    try {
      if (!_ckyStore._ipData.clientIP || !_ckyStore._ipData.countryName) return;

      const log = _ckyGetCurrentLogConsent();

      const consentId = _ckyGetCookie("cookieyesID");

      await _ckyRequest("https://app.https://jithinmozilor.github.io//api/v1/log", "POST", {
        log,
        ip: {
          ip: _ckyStore._ipData.clientIP,
          country_name: _ckyStore._ipData.countryName
        },
        consent_id: consentId
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function _ckyBannerActiveCheck() {
    try {
      if (_ckyGetCookie("cky-active-check")) return;
      await _ckyRequest("https://active.https://jithinmozilor.github.io//api/abcdefg/log", "POST");

      _ckySetCookie("cky-active-check", "yes", 1);
    } catch (err) {
      console.error(err);
    }
  }

  _ckyBannerActiveCheck();

  function _ckyGetCookie(name) {
    const value = new RegExp(`${name}=([^;]+)`).exec(document.cookie);
    return value && Array.isArray(value) && value[1] ? unescape(value[1]) : null;
  }

  function _ckySetCookie(name, value, days = 0, domain = _ckyStore._rootDomain) {
    const date = new Date();
    const toSetTime = days === 0 ? 0 : date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${new Date(toSetTime).toUTCString()}; path=/;domain=${domain}`;
  }

  function _ckyRandomString(length) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz";
    const response = [];

    for (let i = 0; i < length; i++) response.push(chars[Math.floor(Math.random() * chars.length)]);

    return btoa(response.join(""));
  }

  function _ckyRequest(url, method, data = {}) {
    const headers = {};
    let body = null;

    if (method === "POST") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }

    return fetch(url, {
      method,
      headers,
      body
    });
  }

  function _ckyGetYoutubeID(src) {
    const match = src.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (match && Array.isArray(match) && match[2] && match[2].length === 11) return match[2];
    return false;
  }

  function _ckyGetCurrentLogConsent() {
    return ["CookieYes Consent", "Necessary", "Functional", "Analytics", "Advertisement", "Other"].map(name => ({
      name,
      status: name === "Necessary" ? "yes" : name === "CookieYes Consent" ? _ckyGetCookie("cky-consent") : _ckyGetCookie(`cky-${name.toLowerCase()}`)
    }));
  }

  function _ckyCleanHostName(name) {
    return name.replace(/^www./, "");
  }

  function _ckyIsCategoryToBeBlocked(category) {
    return _ckyGetCookie(`cookieyes-${category}`) !== "yes" && _ckyStore._categories.filter(cat => cat.name === category && cat.type !== 1).length >= 1;
  }

  function _ckyShouldBlockProvider(formattedRE) {
    const provider = _ckyStore._providersToBlock.find(prov => new RegExp(prov.re).test(formattedRE));

    return provider && provider.categories.some(category => _ckyGetCookie(`cookieyes-${category}`) === "no");
  }

  function _ckyDecode(encoded) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = encoded;
    return textArea.value;
  }

  function _ckyTabOnClick(tabID, tabContentID) {
    document.querySelector(".cky-tab-item-active").classList.remove("cky-tab-item-active");
    document.getElementById(tabID).classList.add("cky-tab-item-active");
    document.querySelector(".cky-tab-content-active").classList.remove("cky-tab-content-active");
    document.getElementById(tabContentID).classList.add("cky-tab-content-active");
  }

  function _ckyToggleDetail() {
    document.getElementById("cky-btn-settings").toggleAttribute("expanded");
    const wrapperElement = document.getElementById("cky-detail-wrapper");
    const isVisible = wrapperElement.style.display === "block";
    wrapperElement.style.display = isVisible ? "none" : "block";
    if (isVisible) return;
    let calculatedTabMenuHeight = document.querySelector("#cky-tab-menu").offsetHeight - 60;
    document.querySelectorAll(".cky-tab-desc").forEach(item => item.style.height = `${calculatedTabMenuHeight}px`);
  }

  function _ckyAttachNoticeStyles() {
    if (document.getElementById("cky-style")) return;
    document.head.insertAdjacentHTML("beforeend", `<style id="cky-style">.cky-consent-bar,.cky-consent-bar *,.cky-consent-bar-trigger,.cky-consent-bar-trigger *,.cky-modal,.cky-modal *{box-sizing:border-box}.cky-consent-bar :focus,.cky-consent-bar-trigger :focus,.cky-modal :focus{outline:0}.cky-consent-bar-trigger{position:fixed;right:30px;padding:2px 5px;font-size:13px;cursor:pointer;font-family:inherit;animation:slide-up .4s ease;z-index:9997}.cky-consent-bar{font-family:inherit;position:fixed;z-index:9997}.cky-consent-bar .cky-consent-title{font-size:15px;font-weight:700;margin-bottom:3px}.cky-consent-bar p{line-height:20px;font-size:13px;font-weight:400;margin-bottom:0;margin-top:0}.cky-btn{font-size:12px;padding:.5rem 1rem;background:0 0;cursor:pointer;display:inline-block;text-align:center;white-space:nowrap;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;border:1px solid transparent;line-height:1;transition:all .15s ease-in-out;margin:0;min-height:auto;font-weight:400;border-radius:0}.cky-btn:hover{opacity:.8}.cky-btn:focus{outline:0}.cky-button-wrapper .cky-btn{margin-right:15px}.cky-button-wrapper .cky-btn:last-child{margin-right:0}.cky-btn.cky-btn-custom-accept{margin:1.5rem 1rem;font-weight:600;white-space:initial;word-break:break-word}.cky-btn-readMore{cursor:pointer;font-size:13px;text-decoration:underline;margin-left:3px}.cky-btn-doNotSell{cursor:pointer;white-space:nowrap;font-weight:700;font-size:13px;text-decoration:underline;margin-left:3px}.cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper{display:flex;align-items:center}.cky-consent-bar.cky-logo-active .cky-logo{margin-right:30px}@media (max-width:540px){.cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper{display:block}}.cky-tab{display:-ms-flexbox;display:flex}.cky-tab-menu{flex:0 0 25%;max-width:25%}@media (max-width:991px){.cky-tab-menu{flex:0 0 40%;max-width:40%}}.cky-tab-content{flex:0 0 75%;max-width:75%;background:0 0;padding:15px 20px}@media (max-width:991px){.cky-tab-content{flex:0 0 60%;max-width:60%}}@media (max-width:767px){.cky-tab-content{padding:15px}}.cky-tab-item{font-size:11px;cursor:pointer;font-weight:400;border-bottom:1px solid;border-right:1px solid;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:1.5}@media (max-width:767px){.cky-tab-item{font-size:11px;padding:.75rem .75rem}}.cky-tab-item-active{cursor:initial;border-right:0}.cky-tab-content .cky-tab-desc,.cky-tab-content .cky-tab-desc p{font-size:12px}.cky-tab-title{font-size:13px;margin-bottom:11px;margin-top:0;font-family:inherit;font-weight:700;line-height:1;display:flex;align-items:center}.cky-tab-content .cky-tab-content-item:not(.cky-tab-content-active){display:none}.cky-category-direct{display:-ms-flexbox;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap;padding-top:15px;margin-top:15px;border-top:1px solid #d4d8df}.cky-category-direct .cky-btn-custom-accept{margin:0 0 0 auto}.cky-category-direct-item{display:-ms-flexbox;display:flex;-webkit-box-align:center;-ms-flex-align:center;align-items:center;margin-right:32px;margin-bottom:15px}.cky-category-direct-item:last-child{margin-right:0}.cky-category-direct-item .cky-switch{margin-left:0}.cky-category-direct-item .cky-category-direct-name{margin-left:10px;font-size:12px;font-weight:600}.cky-category-direct+.cky-detail-wrapper{margin-top:10px}.cky-table-wrapper{width:100%;max-width:100%;overflow:auto}.cky-cookie-audit-table{font-family:inherit;border-collapse:collapse;width:100%;margin-top:10px}.cky-cookie-audit-table th{background-color:#d9dfe7;border:1px solid #cbced6}.cky-cookie-audit-table td{border:1px solid #d5d8df}.cky-cookie-audit-table td,.cky-cookie-audit-table th{text-align:left;padding:10px;font-size:12px;color:#000;word-break:normal}.cky-cookie-audit-table tr:nth-child(2n+1) td{background:#f1f5fa}.cky-cookie-audit-table tr:nth-child(2n) td{background:#fff}.cky-audit-table-element h5{margin:25px 0 2px 0}.cky-audit-table-element .cky-table-wrapper{margin-bottom:1rem}.cky-consent-bar.cky-rtl{direction:rtl;text-align:right}.cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn{margin-right:0;margin-left:15px}.cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn:last-child{margin-left:0}.cky-consent-bar.cky-rtl .cky-btn-readMore{margin-left:0;margin-right:6px}.cky-consent-bar.cky-rtl.cky-logo-active .cky-logo{margin-right:0;margin-left:30px}.cky-switch{position:relative;min-height:13px;padding-left:25px;font-size:14px;margin-left:20px;margin-bottom:0;display:inline-block}.cky-switch input[type=checkbox]{display:none!important}.cky-switch .cky-slider{background-color:#e3e1e8;border-radius:34px;height:13px;width:25px;bottom:0;cursor:pointer;left:0;position:absolute;right:0;transition:.4s}.cky-switch .cky-slider:before{background-color:#fff;border-radius:50%;bottom:2px;content:'';height:9px;left:2px;position:absolute;transition:.4s;width:9px}.cky-switch input:checked+.cky-slider{background-color:#008631}.cky-switch input:disabled+.cky-slider{cursor:initial}.cky-switch input:checked+.cky-slider:before{transform:translateX(12px)}.cky-modal.cky-fade .cky-modal-dialog{transition:-webkit-transform .3s ease-out;transition:transform .3s ease-out;transition:transform .3s ease-out,-webkit-transform .3s ease-out;-webkit-transform:translate(0,-25%);transform:translate(0,-25%)}.cky-modal.cky-show .cky-modal-dialog{-webkit-transform:translate(0,0);transform:translate(0,0)}.cky-modal-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;z-index:9998;background-color:rgba(10,10,10,.22);display:none}.cky-modal-backdrop.cky-fade{opacity:0}.cky-modal-backdrop.cky-show{opacity:1;display:block}.cky-modal{position:fixed;top:0;right:0;bottom:0;left:0;z-index:99999;display:none;overflow:hidden;outline:0;min-height:calc(100% - (.5rem * 2))}.cky-modal.cky-show{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}.cky-modal a{text-decoration:none}.cky-modal .cky-modal-dialog{position:relative;max-width:calc(100% - 16px);width:calc(100% - 16px);margin:.5rem;pointer-events:none;font-family:inherit;font-size:1rem;font-weight:400;line-height:1.5;color:#212529;text-align:left;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;box-shadow:0 10px 20px 0 rgba(0,0,0,.17);-webkit-box-shadow:0 10px 20px 0 rgba(0,0,0,.17)}@media (min-width:576px){.cky-modal .cky-modal-dialog{max-width:500px;width:500px;margin:1.75rem auto}.cky-modal{min-height:calc(100% - (1.75rem * 2))}}@media (min-width:991px){.cky-modal .cky-modal-dialog{max-width:900px;width:900px}}.cky-modal-content{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;width:100%;pointer-events:auto;background-clip:padding-box;border:0;border-radius:4px;overflow:hidden;outline:0;margin:40px}.cky-modal.cky-rtl{direction:rtl;text-align:right}.ccpa.cky-modal .cky-modal-dialog{max-width:300px;width:300px;border-radius:5px}.ccpa.cky-modal .cky-modal-content{margin:25px;text-align:center;font-weight:600}.ccpa.cky-modal .cky-opt-out-text{margin-bottom:20px}.cky-consent-bar .cky-consent-close,.cky-modal .cky-modal-close{z-index:1;padding:0;background-color:transparent;border:0;-webkit-appearance:none;font-size:12px;line-height:1;color:#9a9a9a;cursor:pointer;min-height:auto;position:absolute;top:14px;right:18px}.cky-detail-wrapper{margin-top:30px;border:1px solid #d4d8df;border-radius:2px;overflow:hidden}.cky-tab-content{width:100%}.cky-tab-item{padding:.5rem 1rem;align-items:center}.cky-tab-content .cky-tab-desc{min-height:155px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}@media (max-width:767px){.cky-tab-content .cky-tab-desc{max-height:155px}}.cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-switch{margin-left:0;margin-right:20px}.cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item{border-right:none;border-left:1px solid}.cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item.cky-tab-item-active{border-left:0}.cky-consent-bar.cky-classic{width:100%;display:block;box-shadow:0 -1px 10px 0 rgba(172,171,171,.3)}.cky-classic .cky-content-wrapper{display:-webkit-box;display:-moz-box;display:-ms-flexbox;display:-webkit-flex;display:flex;justify-content:space-between;-webkit-box-align:center;-moz-box-align:center;-ms-flex-align:center;-webkit-align-items:center;align-items:center}.cky-classic .cky-button-wrapper{margin-left:20px;display:-webkit-box;display:-moz-box;display:-ms-flexbox;display:-webkit-flex;display:flex;-webkit-box-align:center;-moz-box-align:center;-ms-flex-align:center;-webkit-align-items:center;align-items:center;flex-wrap:nowrap}.cky-consent-bar.cky-classic p{text-align:left}.cky-classic .cky-btn-settings{margin-left:auto;position:relative;padding-right:1rem}.cky-classic .cky-btn-settings:before{border-style:solid;border-width:1px 1px 0 0;content:'';display:inline-block;height:4px;right:8px;position:absolute;border-color:#beb8b8;top:11px;transform:rotate(135deg);vertical-align:middle;width:4px}.cky-classic .cky-btn-settings[expanded]:before{transform:rotate(-45deg)}.cky-classic .cky-consent-bar.cky-rtl .cky-button-wrapper{margin-left:0;margin-right:20px}.cky-classic .cky-consent-bar.cky-rtl p{text-align:right}@media(min-width:991px){.cky-consent-bar.cky-classic{padding:15px 50px}}@media(min-width:1150px){.cky-consent-bar.cky-classic{padding:15px 130px}}@media(min-width:1415px){.cky-consent-bar.cky-classic{padding:15px 160px}}@media (max-width:991px){.cky-classic .cky-button-wrapper{margin-left:0;margin-top:20px}.cky-classic .cky-button-wrapper,.cky-classic .cky-content-wrapper,.cky-consent-bar.cky-classic,.cky-consent-bar.cky-classic p{display:block;text-align:center}}.cky-consent-bar-trigger{background:#fff;color:#565662;border:1px solid #d4d8df;top:auto;right:0;bottom:0;left:auto}.cky-consent-bar .cky-consent-title{color:#565662}.cky-btn-readMore{color:#565662;background-color:transparent;border-color:transparent}.cky-consent-all{background:#fff;color:#565662;border:1px solid #d4d8df;top:auto;right:0;bottom:0;left:auto}.cky-bar-text{color:#565662}.cky-consent-close img{width:9px}.cky-tab-menu{background-color:#f2f5fa}.cky-tab-item{color:#000;border-color:#d4d8df}.cky-tab-item-active{color:#000;border-color:#d4d8df;background-color:#fff}.cky-tab-title{color:#565662}.cky-category-direct{color:#565662}.cky-btn-custom-accept{color:#0342b5;background-color:#fff;border-color:#0342b5}.cky-classic .cky-btn-settings{color:#7f7f7f;background-color:transparent;border-color:transparent}.cky-classic .cky-btn-accept{color:#fff;background-color:#0342b5;border-color:#0443b5}.cky-classic .cky-btn-reject{color:#717375;background-color:#dedfe0;border-color:transparent}.cky-detail-wrapper{display:none;border-color:#d4d8df}.cky-tab-content{background-color:#fff}.cky-tab-content .cky-tab-desc{color:#565662}.cky-tab-content-item{color:#565662}</style>`);
  }

  function _ckyAddPlaceholder(htmlElm, uniqueID) {
    const htmlElemWidth = htmlElm.getAttribute("width") || htmlElm.offsetWidth;
    const htmlElemHeight = htmlElm.getAttribute("height") || htmlElm.offsetHeight;
    if (htmlElemHeight === 0 || htmlElemWidth === 0) return;

    const youtubeID = _ckyGetYoutubeID(htmlElm.src);

    htmlElm.insertAdjacentHTML("beforebegin", `<div id="${uniqueID}" data-src="${htmlElm.src}" style="width:${htmlElemWidth}px;height:${htmlElemHeight}px;${htmlElm.src && youtubeID ? `` : `backgroundImage:linear-gradient(rgba(255,255,255,.2),rgba(255,255,255,.2)),url('https://img.youtube.com/vi/${youtubeID}/maxresdefault.jpg');`}" class="wt-cli-iframe-placeholder ${htmlElm.src && youtubeID ? `cky-iframe-placeholder-normal` : `cky-iframe-placeholder-youtube`}"><div class="wt-cli-inner-text" cky-i18n="gdpr.blocker.placeHolder">Please accept the cookie consent</div></div>`);
  }

  function _ckyGetAuditTable() {
    return `<h5 cky-i18n="detail.tabItem.necessary.title">Necessary</h5><div class="cky-table-wrapper"><table id="cky-anywhere-cookie-audit-table-necessary" class="cky-cookie-audit-table">${document.getElementById("cky-cookie-audit-table-necessary").innerHTML}</table></div><h5 cky-i18n="detail.tabItem.functional.title">Functional</h5><div class="cky-table-wrapper"><table id="cky-anywhere-cookie-audit-table-functional" class="cky-cookie-audit-table">${document.getElementById("cky-cookie-audit-table-functional").innerHTML}</table></div><h5 cky-i18n="detail.tabItem.analytics.title">Analytics</h5><div class="cky-table-wrapper"><table id="cky-anywhere-cookie-audit-table-analytics" class="cky-cookie-audit-table">${document.getElementById("cky-cookie-audit-table-analytics").innerHTML}</table></div><h5 cky-i18n="detail.tabItem.performance.title">Performance</h5><div class="cky-table-wrapper"><table id="cky-anywhere-cookie-audit-table-performance" class="cky-cookie-audit-table">${document.getElementById("cky-cookie-audit-table-performance").innerHTML}</table></div><h5 cky-i18n="detail.tabItem.advertisement.title">Advertisement</h5><div class="cky-table-wrapper"><table id="cky-anywhere-cookie-audit-table-advertisement" class="cky-cookie-audit-table">${document.getElementById("cky-cookie-audit-table-advertisement").innerHTML}</table></div>`;
  }

  function _ckyRenderAuditTable() {
    const auditTableElements = document.getElementsByClassName("cky-audit-table-element");
    if (!auditTableElements.length) return;

    _ckyAttachNoticeStyles();

    for (const auditTableElement of auditTableElements) auditTableElement.insertAdjacentHTML("beforeend", _ckyGetAuditTable());
  }

  function _ckyRemoveBanner() {
    _ckyRemoveElement("cky-consent");
  }

  function _ckyRegisterListeners() {
    _ckyAttachListener("cky-btn-custom-accept", _ckyAcceptReject());

    _ckyAttachListener("cky-btn-settings", () => _ckyToggleDetail());

    _ckyAttachListener("cky-btn-reject", _ckyAcceptReject());

    _ckyAttachListener("cky-btn-accept", _ckyAcceptReject("all"));

    _ckyAttachListener("cky-tab-item-privacy", () => _ckyTabOnClick("cky-tab-item-privacy", "cky-tab-content-privacy"));

    for (const {
      slug
    } of _ckyStore._categories) _ckyAttachListener(`cky-tab-item-${slug}`, () => _ckyTabOnClick(`cky-tab-item-${slug}`, `cky-tab-content-${slug}`));
  }

  function _ckyAcceptReject(option = "custom") {
    return () => {
      _ckyAcceptCookies(option);

      _ckyRemoveBanner();
    };
  }

  function _ckyAttachListener(id, fn) {
    const item = document.getElementById(id);
    item && item.addEventListener("click", fn);
  }

  function _ckyRemoveElement(id) {
    const item = document.getElementById(id);
    item && item.remove();
  }

  const _ckyCreateElementBackup = document.createElement;

  document.createElement = (...args) => {
    const createdElement = _ckyCreateElementBackup.call(document, ...args);

    if (createdElement.nodeName.toLowerCase() !== "script") return createdElement;
    const originalSetAttribute = createdElement.setAttribute.bind(createdElement);

    createdElement.setAttribute = (name, value) => {
      const canBlock = createdElement.hasAttribute("data-cookieyes") && _ckyIsCategoryToBeBlocked(createdElement.getAttribute("data-cookieyes").replace("cookieyes-", ""));

      if (!canBlock) return originalSetAttribute(name, value);
      if (name === "src") originalSetAttribute("type", "javascript/blocked"); else if (name === "type") value = "javascript/blocked";
      originalSetAttribute(name, value);
    };

    return createdElement;
  };

  function _ckyMutationObserver(mutations) {
    for (const {
      addedNodes
    } of mutations) {
      for (const node of addedNodes) {
        if (!node.src || !node.nodeName || !["script", "iframe"].includes(node.nodeName.toLowerCase())) continue;
        const webdetail = new URL(node.src);

        const cleanedHostname = _ckyCleanHostName(webdetail.hostname);

        _ckyAddProviderToList(node, cleanedHostname);

        if (!_ckyShouldBlockProvider(cleanedHostname)) continue;

        const uniqueID = _ckyRandomString(8);

        if (node.nodeName.toLowerCase() === "iframe") _ckyAddPlaceholder(node, uniqueID); else node.type = "javascript/blocked";
        node.remove();

        _ckyStore._backupNodes.push({
          position: document.head.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINS ? "head" : "body",
          node: node.cloneNode(),
          uniqueID
        });
      }
    }
  }

  function _ckyUnblock() {
    if (navigator.doNotTrack === 1) return;

    const ckyconsent = _ckyGetCookie("cky-consent");

    if (!ckyconsent || ckyconsent !== "yes") return;

    _nodeListObserver.disconnect();

    document.createElement = _ckyCreateElementBackup;
    _ckyStore._backupNodes = _ckyStore._backupNodes.filter(({
      position,
      node,
      uniqueID
    }) => {
      if (_ckyShouldBlockProvider(node.src)) return true;

      if (node.nodeName.toLowerCase() === "script") {
        const scriptNode = document.createElement("script");
        scriptNode.src = node.src;
        scriptNode.type = "text/javascript";
        document[position].appendChild(scriptNode);
      } else {
        const iframe = document.createElement("iframe");
        iframe.src = node.src;
        const frame = document.getElementById(uniqueID);
        iframe.width = frame.offsetWidth;
        iframe.height = frame.offsetHeight;
        frame.parentNode.insertBefore(iframe, frame);
        frame.parentNode.removeChild(frame);
      }

      return false;
    });
  }

  function _ckyAddProviderToList(node, cleanedHostname) {
    const nodeCategory = node.hasAttribute("data-cookieyes") && node.getAttribute("data-cookieyes");
    if (!nodeCategory) return;
    const categoryName = nodeCategory.replace("cookieyes-", "");

    for (const category of _ckyStore._categories) if (category.isNecessary && category.slug === categoryName) return;

    const provider = _ckyStore._providersToBlock.find(prov => prov.re === cleanedHostname);

    if (!provider) _ckyStore._providersToBlock.push({
      re: cleanedHostname,
      categories: [categoryName]
    }); else if (!provider.isOverriden) {
      provider.categories = [categoryName];
      provider.isOverriden = true;
    } else if (!provider.categories.includes(categoryName)) provider.categories.push(categoryName);
  }

  const _nodeListObserver = new MutationObserver(_ckyMutationObserver);

  _nodeListObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  function _ckyAcceptCookies(choice = "all") {
    _ckySetCookie("cky-action", "yes", _ckyStore._expiry);

    const responseCategories = {
      accepted: [],
      rejected: []
    };
    let rejectedAll = true;

    for (const category of _ckyStore._categories) {
      let valueToSet = !category.isNecessary && choice === "custom" && !document.getElementById(`cky-checkbox-category-${category.slug}`).checked ? "no" : "yes";

      _ckySetCookie(`cookieyes-${category.slug}`, valueToSet, _ckyStore._expiry);

      if (valueToSet === "no") {
        responseCategories.rejected.push(category.slug);

        _ckyRemoveDeadCookies(category);
      } else responseCategories.accepted.push(category.slug);

      rejectedAll = rejectedAll && valueToSet === "no";
    }

    _ckySetCookie("cky-consent", rejectedAll ? "no" : "yes", _ckyStore._expiry);

    window.addEventListener("beforeunload", _ckyLogCookies);

    _ckyUnblock();

    _ckyAPIs.onActionCallback(responseCategories);
  }

  function _ckySetInitialState() {
    _ckySetCookie("cky-consent", "no", _ckyStore._expiry);

    for (const category of _ckyStore._categories) {
      _ckySetCookie(`cookieyes-${category.slug}`, category.isNecessary || category.defaultConsent ? "yes" : "no", _ckyStore._expiry);
    }

    _ckyUnblock();
  }

  function _ckyDisableBlocker() {
    _ckySetCookie("cky-action", "yes", _ckyStore._expiry);

    _ckySetCookie("cky-consent", "yes", _ckyStore._expiry);

    for (const category of _ckyStore._categories) _ckySetCookie(`cookieyes-${category.slug}`, "yes", _ckyStore._expiry);

    _ckyUnblock();
  }

  function _ckyRemoveDeadCookies({
    cookies
  }) {
    for ({
      cookieID,
      domain
    } of cookies) if (_ckyGetCookie(cookieID)) _ckySetCookie(cookieID, "", 0, domain);
  }

  async function _ckyWindowLoadHandler() {
    try {
      window.removeEventListener('load', _ckyWindowLoadHandler);
      if (!_ckyGetCookie("cookieyesID")) _ckySetCookie("cookieyesID", _ckyRandomString(32), _ckyStore._expiry);
      await _ckyInit();

      _ckyRenderAuditTable();
    } catch (err) {
      console.error(err);
    }
  }

  window.addEventListener("load", _ckyWindowLoadHandler);

  window.revisitCkyConsent = function () {
    if (document.getElementById("cky-consent-toggler")) document.getElementById("cky-consent-toggler").remove();
    !document.getElementById("cky-consent") && _ckyRenderBanner();
  };

  function _ckyRenderBanner() {
    document.body.insertAdjacentHTML("beforeend", `<div class="cky-consent-bar cky-classic cky-consent-all" id="cky-consent"><div class="cky-consent-title" cky-i18n="gdpr.notice.title">Cookie consent</div><div class="cky-content-wrapper"><p class="cky-bar-text" cky-i18n="gdpr.notice.text">This website uses cookies that help the website to function and also to track how you interact with our website. But for us to provide the best user experience, enable the specific cookies from Settings, and click on Accept.</p><div class="cky-button-wrapper"><button class="cky-btn cky-btn-settings" id="cky-btn-settings" cky-i18n="gdpr.buttons.settings.title">Preferences</button><button class="cky-btn cky-btn-reject" id="cky-btn-reject" cky-i18n="gdpr.buttons.reject.title">Reject All</button><button class="cky-btn cky-btn-accept" id="cky-btn-accept" cky-i18n="gdpr.buttons.accept.title">Accept All</button></div></div><div class="cky-detail-wrapper" id="cky-detail-wrapper"><div class="cky-tab"><div class="cky-tab-menu" id="cky-tab-menu"><div class="cky-tab-item cky-tab-item-active" id="cky-tab-item-privacy" cky-i18n="detail.tabItem.privacy.title">Privacy Policy</div><div class="cky-tab-item" id="cky-tab-item-necessary" cky-i18n="detail.tabItem.necessary.title">Necessary</div><div class="cky-tab-item" id="cky-tab-item-functional" cky-i18n="detail.tabItem.functional.title">Functional</div><div class="cky-tab-item" id="cky-tab-item-analytics" cky-i18n="detail.tabItem.analytics.title">Analytics</div><div class="cky-tab-item" id="cky-tab-item-performance" cky-i18n="detail.tabItem.performance.title">Performance</div><div class="cky-tab-item" id="cky-tab-item-advertisement" cky-i18n="detail.tabItem.advertisement.title">Advertisement</div><button class="cky-btn cky-btn-custom-accept" id="cky-btn-custom-accept" cky-i18n="gdpr.buttons.custom.title">Save my preferences</button></div><div class="cky-tab-content" id="cky-tab-content"><div class="cky-tab-content-item cky-tab-content-active" id="cky-tab-content-privacy"><div class="cky-tab-title" id="cky-tab-title-privacy" cky-i18n="detail.tabItem.privacy.title">Privacy Policy</div><div class="cky-tab-desc" cky-i18n="detail.tabItem.privacy.text"><p>This website uses cookies to improve your experience while you navigate through the website. Out of these cookies, the cookies that are categorized as necessary are stored on your browser as they as essential for the working of basic functionalities of the website.</p><p>We also use third-party cookies that help us analyze and understand how you use this website, to store user preferences and provide them with content and advertisements that are relevant to you. These cookies will only be stored on your browser with your consent to do so. You also have the option to opt-out of these cookies.But opting out of some of these cookies may have an effect on your browsing experience.</p></div></div><div class="cky-tab-content-item" id="cky-tab-content-necessary"><div class="cky-tab-title" id="cky-tab-title-necessary" cky-i18n="detail.tabItem.necessary.title">Necessary<label class="cky-switch" for="cky-checkbox-category-necessary" onclick="event.stopPropagation();"><input type="checkbox" id="cky-checkbox-category-necessary" checked disabled><div class="cky-slider"></div></label></div><div class="cky-tab-desc" cky-i18n="detail.tabItem.necessary.text"><p>Necessary cookies are crucial for the basic functions of the website and the website will not work in its intended way without them.</p><p>These cookies do not store any personally identifiable data.</p><div class="cky-table-wrapper" id="cky-table-wrapper-necessary"><table id="cky-cookie-audit-table-necessary" class="cky-cookie-audit-table"><thead><tr><th cky-i18n="auditTable.cookie">Cookie</th><th cky-i18n="auditTable.type">Type</th><th cky-i18n="auditTable.duration">Duration</th><th cky-i18n="auditTable.description">Description</th></tr></thead><tbody><tr><td cky-i18n="cookies._GRECAPTCHA.cookie_id">_GRECAPTCHA</td><td cky-i18n="cookies._GRECAPTCHA.type">1</td><td cky-i18n="cookies._GRECAPTCHA.duration">5 months 27 days</td><td cky-i18n="cookies._GRECAPTCHA.description">This cookie is set by Google. In addition to certain standard Google cookies, reCAPTCHA sets a necessary cookie (_GRECAPTCHA) when executed for the purpose of providing its risk analysis.</td></tr></tbody></table></div></div></div><div class="cky-tab-content-item" id="cky-tab-content-functional"><div class="cky-tab-title" id="cky-tab-title-functional" cky-i18n="detail.tabItem.functional.title">Functional<label class="cky-switch" for="cky-checkbox-category-functional" onclick="event.stopPropagation();"><input type="checkbox" id="cky-checkbox-category-functional"><div class="cky-slider"></div></label></div><div class="cky-tab-desc" cky-i18n="detail.tabItem.functional.text"><p>Functional cookies help to perform certain functionalities like sharing the content of the website on social media platforms, collect feedbacks, and other third-party features.</p><div class="cky-table-wrapper" id="cky-table-wrapper-functional"><table id="cky-cookie-audit-table-functional" class="cky-cookie-audit-table"><thead><tr><th cky-i18n="auditTable.cookie">Cookie</th><th cky-i18n="auditTable.type">Type</th><th cky-i18n="auditTable.duration">Duration</th><th cky-i18n="auditTable.description">Description</th></tr></thead><tbody></tbody></table></div></div></div><div class="cky-tab-content-item" id="cky-tab-content-analytics"><div class="cky-tab-title" id="cky-tab-title-analytics" cky-i18n="detail.tabItem.analytics.title">Analytics<label class="cky-switch" for="cky-checkbox-category-analytics" onclick="event.stopPropagation();"><input type="checkbox" id="cky-checkbox-category-analytics"><div class="cky-slider"></div></label></div><div class="cky-tab-desc" cky-i18n="detail.tabItem.analytics.text"><p>Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.</p><div class="cky-table-wrapper" id="cky-table-wrapper-analytics"><table id="cky-cookie-audit-table-analytics" class="cky-cookie-audit-table"><thead><tr><th cky-i18n="auditTable.cookie">Cookie</th><th cky-i18n="auditTable.type">Type</th><th cky-i18n="auditTable.duration">Duration</th><th cky-i18n="auditTable.description">Description</th></tr></thead><tbody><tr><td cky-i18n="cookies._ga.cookie_id">_ga</td><td cky-i18n="cookies._ga.type">1</td><td cky-i18n="cookies._ga.duration">2 years</td><td cky-i18n="cookies._ga.description">This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.</td></tr><tr><td cky-i18n="cookies._gid.cookie_id">_gid</td><td cky-i18n="cookies._gid.type">1</td><td cky-i18n="cookies._gid.duration">1 day</td><td cky-i18n="cookies._gid.description">This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.</td></tr><tr><td cky-i18n="cookies._gat_gtag_UA_114405147_3.cookie_id">_gat_gtag_UA_114405147_3</td><td cky-i18n="cookies._gat_gtag_UA_114405147_3.type">1</td><td cky-i18n="cookies._gat_gtag_UA_114405147_3.duration">1 minute</td><td cky-i18n="cookies._gat_gtag_UA_114405147_3.description">Google uses this cookie to distinguish users.</td></tr></tbody></table></div></div></div><div class="cky-tab-content-item" id="cky-tab-content-performance"><div class="cky-tab-title" id="cky-tab-title-performance" cky-i18n="detail.tabItem.performance.title">Performance<label class="cky-switch" for="cky-checkbox-category-performance" onclick="event.stopPropagation();"><input type="checkbox" id="cky-checkbox-category-performance"><div class="cky-slider"></div></label></div><div class="cky-tab-desc" cky-i18n="detail.tabItem.performance.text"><p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.</p><div class="cky-table-wrapper" id="cky-table-wrapper-performance"><table id="cky-cookie-audit-table-performance" class="cky-cookie-audit-table"><thead><tr><th cky-i18n="auditTable.cookie">Cookie</th><th cky-i18n="auditTable.type">Type</th><th cky-i18n="auditTable.duration">Duration</th><th cky-i18n="auditTable.description">Description</th></tr></thead><tbody></tbody></table></div></div></div><div class="cky-tab-content-item" id="cky-tab-content-advertisement"><div class="cky-tab-title" id="cky-tab-title-advertisement" cky-i18n="detail.tabItem.advertisement.title">Advertisement<label class="cky-switch" for="cky-checkbox-category-advertisement" onclick="event.stopPropagation();"><input type="checkbox" id="cky-checkbox-category-advertisement"><div class="cky-slider"></div></label></div><div class="cky-tab-desc" cky-i18n="detail.tabItem.advertisement.text"><p>Advertisement cookies are used to deliver visitors with customized advertisements based on the pages they visited before and analyze the effectiveness of the ad campaign.</p><div class="cky-table-wrapper" id="cky-table-wrapper-advertisement"><table id="cky-cookie-audit-table-advertisement" class="cky-cookie-audit-table"><thead><tr><th cky-i18n="auditTable.cookie">Cookie</th><th cky-i18n="auditTable.type">Type</th><th cky-i18n="auditTable.duration">Duration</th><th cky-i18n="auditTable.description">Description</th></tr></thead><tbody><tr><td cky-i18n="cookies._fbp.cookie_id">_fbp</td><td cky-i18n="cookies._fbp.type">1</td><td cky-i18n="cookies._fbp.duration">3 months</td><td cky-i18n="cookies._fbp.description">This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.</td></tr></tbody></table></div></div></div></div></div><div style="background:#d9dfe7;padding:6px 32px;font-size:8px;color:#111;font-weight:400;text-align:right" id="powered-by" cky-i18n="gdpr.notice.powered._p1 gdpr.notice.powered._p2">Powered by&nbsp;<a style="font-weight:700;color:#040404;font-size:9px;text-decoration:none" target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredByGDPR&utm_term=main&utm_content=CTA">CookieYes</a></div></div></div>`);

    _ckyRegisterListeners();

    if (_ckyStore._language._current !== "ar") return;
    document.getElementById("cky-consent").classList.add("cky-rtl");
  }

  async function _ckyInit() {
    try {
      _ckyGeoIP();

      _ckyAttachNoticeStyles();

      if (_ckyGetCookie("cky-action")) return _ckyRemoveBanner();

      _ckySetInitialState();

      _ckyRenderBanner();
    } catch (err) {
      console.error(err);
    }
  }
  /******/
})()
  ;
  //# sourceMappingURL=classic-gdpr-build-bundle-full.js.map