// SAMPLE SCRIPT OF A USER WITH
// GDPR - CLASSIC TYPE - DARK THEME

// SCRIPT IS DIDVIDED INTO 3 PARTS

// 1 COMES FROM WEBSITE.PHP
// 2 COMES FROM CLI-SCRIPT ( V- 1, 2, 3 ,4 )
// 3 COMES FROM SCRRIPT-BLOCKER FILE

// PART -1

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
    body,
  });
}

function _ckyGetFromSessionStorage(key, value = "") {
  sessionStorage.setItem(key, JSON.stringify(value));
}

async function _ckyGeoIP() {
  try {
    const geoIPResponse = await _ckyRequest(
      "https://geoip.cookieyes.com/geoip/checker/result.php",
      "GET"
    );
    if (geoIPResponse.status !== 200) throw new Error("something went wrong");
    const {
      ip: clientIP,
      in_eu: userInEu,
      country_name: countryName,
    } = await geoIPResponse.json();
    _ckyGetFromSessionStorage("isEU", userInEu);
    const ipdata = {
      ip: clientIP.substring(0, clientIP.lastIndexOf(".")) + ".0",
      country_name: countryName,
    };
    _ckyGetFromSessionStorage("ip", ipdata);
  } catch (err) {
    console.log(err);
  }
}

function _ckyGetCookie(name) {
  const value = new RegExp(`${name}=([^;]+)`).exec(document.cookie);
  return value && Array.isArray(value) && value[1] ? unescape(value[1]) : null;
}

function _ckySetCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toGMTString();
  }
  document.cookie = `${name}=${value}${expires}; path=/;`;
}

async function _ckyLogCookies() {
  try {
    const log = [
      {
        name: "CookieYes Consent",
        status: _ckyGetCookie("cky-consent"),
      },
      {
        name: "Necessary",
        status: "yes",
      },
      {
        name: "Functional",
        status: _ckyGetCookie("cookieyes-functional"),
      },
      {
        name: "Analytics",
        status: _ckyGetCookie("cookieyes-analytics"),
      },
      {
        name: "Advertisement",
        status: _ckyGetCookie("cookieyes-advertisement"),
      },
      {
        name: "Other",
        status: _ckyGetCookie("cookieyes-other"),
      },
    ];
    const userIP = _ckyGetFromSessionStorage("ip");
    const consentId = _ckyGetCookie("cookieyesID");
    await _ckyRequest("https://app.cookieyes.com/api/v1/log", "POST", {
      log,
      ip: userIP,
      consent_id: consentId,
    });
  } catch (error) {
    // Handle error
  }
}

async function _ckyBannerActiveCheck() {
  try {
    if (!_ckyGetCookie("cky-active-check")) return;
    await _ckyRequest(
      "https://active.cookieyes.com/api/0c41454aa3b2565cbef79aee/log",
      "POST"
    );
    _ckySetCookie("cky-active-check", "yes", 1);
  } catch (error) {
    // Handle error
  }
}

function _ckyRandomString(length) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz";
  const response = [];
  for (let i = 0; i < length; i++)
    response.push(chars[Math.floor(Math.random() * chars.length)]);
  return btoa(response.join(""));
}

//
const tldomain = "www.abcde.com";
const cookieyesID = _ckyRandomString(32);

const loadAnalyticsByDefault = false; // check afterwards

_ckyBannerActiveCheck();

// PART - 2

// **** DONE FUNCTONS ***** //
function _ckyRenderBanner() {
  _ckyCreateBanner();
  if (selectedLanguage == "ar") document.getElementById("cky-consent").classList.add("cky-rtl");
  document.getElementById("cky-consent").classList.add(`cky-${options.consentBarType}`);
  _ckyAppendLogo();
  _ckyAppendText();
  _ckyRenderCategoryBar();
  _ckyRenderButtons();
}

function _ckyCreateBanner() {
  const consentBar = `<div class="cky-consent-bar" id="cky-consent"><div class="cky-content-logo-outer-wrapper" id="cky-content-logo"><divs id="cky-content-logo-inner-wrapper"><div class="cky-content-wrapper"></div></div></div></div>`
  body.insertAdjacentHTML("beforeend", consentBar);
  document.getElementById("cky-consent").style.display = "block";
  const ckyConsentBar = document.getElementById("cky-consent");
  ckyConsentBar.style.background = colors[ckyActiveLaw].notice.bg;
  ckyConsentBar.style.color = colors[ckyActiveLaw].notice.textColor;
  ckyConsentBar.style.borderWidth = "1px";
  ckyConsentBar.style.borderStyle = "solid";
  ckyConsentBar.style.borderColor = colors[ckyActiveLaw].notice.borderColor;
  ckyConsentBar.style.top = positionValue[position].top;
  ckyConsentBar.style.right = positionValue[position].right;
  ckyConsentBar.style.bottom = positionValue[position].bottom;
  ckyConsentBar.style.left = positionValue[position].left;
  if (cliConfig.options.geoTarget["gdpr"].eu && _ckyGetCookie("cky-action") !== "yes") {
      document.getElementById("cky-consent").style.display = "none";
  }
}

function _ckyAppendLogo() {
  document.getElementById("cky-consent").classList.add("cky-logo-active");
  const consentLogo = `<img src="${content[ckyActiveLaw].customLogoUrl}" class="img-fluid cky-logo" style="width: 100px" alt="Brand logo">`;
  document.querySelector("#cky-consent #cky-content-logo").insertAdjacentHTML("afterbegin", consentLogo);
}

function _ckyAppendText() {
  const consentTitle = `<div class="cky-consent-title" style="color:${colors[ckyActiveLaw].notice.titleColor}">${content[ckyActiveLaw].title[selectedLanguage]}</div>`;
  document.querySelector("#cky-consent #cky-content-logo-inner-wrapper").insertAdjacentHTML("afterbegin", consentTitle);
  const consentText = `<p class="cky-bar-text" style="color:${colors[ckyActiveLaw].notice.textColor}">${content[ckyActiveLaw].text[selectedLanguage]}</p>`;
  document.getElementById("cky-consent").getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("beforeend", consentText);
}

function _ckyRenderCategoryBar() {
  const categoryDirectList = `<div class="cky-category-direct" id="cky-category-direct" style="color:${colors[ckyActiveLaw].notice.textColor}"></div>`;
  document.getElementById("cky-consent").getElementsByClassName("cky-bar-text")[0].insertAdjacentHTML("afterend", categoryDirectList);
  for (const category of categories) {
    const categoryBarItem = `<div class="cky-category-direct-item"><span class="cky-category-direct-name" id="cky-category-direct-${category.name[selectedLanguage]}">${category.name[selectedLanguage]}</span></div>`;
    document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML("beforeend", categoryBarItem);
    _ckyCreateSwitches(category);
  }
}

function _ckyCreateSwitches(category) {
  const cookieStatus = cookie.read("cookieyes-" + category.slug);
  let ckySwitchStatus;
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
  const categoryCheckbox = `<label class="cky-switch" for="cky-checkbox-category${category.name[selectedLanguage]}" onclick="event.stopPropagation();"><input type="checkbox" id="cky-checkbox-category${category.name[selectedLanguage]}" ${ckySwitchStatus}/><div class="cky-slider"></div></label>`;
  document.getElementById(`cky-category-direct-${category.name[selectedLanguage]}`).insertAdjacentHTML("beforebegin", categoryCheckbox);
  if (category.type === 1) {
    document.getElementById(`cky-checkbox-category${category.name[selectedLanguage]}`).setAttribute("disabled", true);
  }
}

function _ckyRenderButtons() {
  ckyConsentBar.getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("beforeend", '<div class="cky-button-wrapper"></div>');
  _ckyAppendButton("settings");
  _ckyRenderStickyDetail();
  _ckyAppendButton("reject");
  _ckyAppendButton("accept");
  let privacyLink = content[ckyActiveLaw].privacyPolicyLink[selectedLanguage].trim().replace(/\s/g, "");
  if (/^(:\/\/)/.test(privacyLink)) {
    privacyLink = "http" + privacyLink + "";
  }
  if (!/^(f|ht)tps?:\/\//i.test(privacyLink)) {
    privacyLink = "http://" + privacyLink + "";
  }
  const readMoreButton = `<a class="cky-btn-readMore" id="cky-btn-readMore" href="${privacyLink}" target="_blank">${content[ckyActiveLaw].buttons["readMore"][selectedLanguage]}</a>`;
  document.querySelector("#cky-consent .cky-bar-text").insertAdjacentHTML("beforeend", readMoreButton);
  _ckyAttachButtonStyles("readMore");
}

function _ckyAppendButton(btnName) {
  const button = `<button class="cky-btn cky-btn-${btnName}" id="cky-btn-${btnName}">${content[ckyActiveLaw].buttons[btnName][selectedLanguage]}</button>`;
  document.querySelector("#cky-consent .cky-button-wrapper").insertAdjacentHTML("beforeend", button);
  _ckyAttachButtonStyles(btnName);
  document.querySelector("#cky-consent #cky-btn-" + btnName + "").onclick = bannerFunctions[btnName];
}

function _ckyAttachButtonStyles(btnName) {
  document.querySelector(`#cky-consent #cky-btn-${btnName}`).style = `color:${colors[ckyActiveLaw].buttons[btnName].textColor};background-color:${colors[ckyActiveLaw].buttons[btnName].bg};border-color:${colors[ckyActiveLaw].buttons[btnName].borderColor};`;
}

function _ckyRenderStickyDetail() {
  const tabCss = `color:${colors[ckyActiveLaw].popup.pills.textColor};border-color:${colors[ckyActiveLaw].notice.borderColor}`;
  const activeTabCss = `background-color:${colors[ckyActiveLaw].popup.pills.activeBg};color:${colors[ckyActiveLaw].popup.pills.activeTextColor};border-color:${colors[ckyActiveLaw].notice.borderColor};`;
  const ckyDetailWrapper = `<div class="cky-detail-wrapper" id="cky-detail-wrapper" style="border-color:${colors[ckyActiveLaw].notice.borderColor}"><div class="cky-tab"><div class="cky-tab-menu" id="cky-tab-menu" style="background-color:${colors[ckyActiveLaw].popup.pills.bg}"></div><div class="cky-tab-content" id="cky-tab-content" style="background-color:${colors[ckyActiveLaw].notice.bg}"></div></div></div>`;
  document.getElementById("cky-consent").insertAdjacentHTML("beforeend", ckyDetailWrapper);
  const ckyPoweredLink = '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
  document.getElementById("cky-detail-wrapper").insertAdjacentHTML("beforeend", ckyPoweredLink);
  for (const category of categories) {
    if (category.slug === 'necessary') {
      const ckyTabItem = `<div class="cky-tab-item cky-tab-item-active" id="cky-tab-item-privacy" tab-target="cky-tab-content-privacy" style="${activeTabCss}">${privacyPolicy.title[selectedLanguage]}</div>`;
      const ckyTabContentItem = `<div class="cky-tab-content-item cky-tab-content-active" id="cky-tab-content-privacy"><div class="cky-tab-title" style="color:${colors[ckyActiveLaw].notice.textColor}">${privacyPolicy.title[selectedLanguage]}</div><div class="cky-tab-desc" style="color:${colors[ckyActiveLaw].notice.textColor}">${privacyPolicy.text[selectedLanguage]}</div></div>`;
      document.querySelector("#cky-consent #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
      document.querySelector("#cky-consent #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
      return
    }
    const ckyTabItem = `<div class="cky-tab-item" id="cky-tab-item-${category.name[selectedLanguage]}" tab-target="cky-tab-content-${category.name[selectedLanguage]}" style="${tabCss}">${category.name[selectedLanguage]}</div>`;
    document.querySelector("#cky-consent #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
    const ckyTabContentItem = `<div class="cky-tab-content-item" id="cky-tab-content-${category.name[selectedLanguage]}"><div class="cky-tab-title" id="cky-tab-title-${category.name[selectedLanguage]}" style="color:${colors[ckyActiveLaw].notice.textColor}">${category.name[selectedLanguage]}</div><div class="cky-tab-desc" style="color:${colors[ckyActiveLaw].notice.textColor}">${category.description[selectedLanguage]}</div></div>`;
    document.querySelector("#cky-consent #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
    _ckyCreateSwitches(category);
    _ckyRenderAuditTable(true, category);
  }
  const ckyTabs = document.querySelectorAll("#cky-consent .cky-tab-item");
  for (const ckyTab of ckyTabs) {
    ckyTab.onclick = () => {
      currentActiveTab = getByClass("cky-tab-item-active")[0];
      currentActiveTab.classList.remove("cky-tab-item-active");
      currentActiveTab.setAttribute("style", tabCss);
      this.classList.add("cky-tab-item-active");
      this.setAttribute("style", activeTabCss);
      document.querySelector("#cky-consent .cky-tab-content-active").classList.remove("cky-tab-content-active");
      const tabId = this.getAttribute("tab-target");
      document.getElementById(tabId).className += " cky-tab-content-active";
    };
  }
  const customAcceptButton = `<button class="cky-btn cky-btn-custom-accept"style = "color: ${colors[ckyActiveLaw].popup.acceptCustomButton.textColor};background-color: ${colors[ckyActiveLaw].popup.acceptCustomButton.bg};border-color: ${colors[ckyActiveLaw].popup.acceptCustomButton.borderColor};"id="cky-btn-custom-accept">${content[ckyActiveLaw].customAcceptButton[selectedLanguage]}</button>`;
  document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML("beforeend", customAcceptButton);
  document.getElementById("cky-btn-custom-accept").onclick = () => _ckyAcceptCookies("customAccept");
  document.getElementById("cky-detail-wrapper").style.display = "none";
}

function _ckyShowHideStickyDetail() {
  document.getElementById("cky-btn-settings").toggleAttribute("expanded");
  if (document.getElementById("cky-btn-settings").hasAttribute("expanded")) {
    document.getElementById("cky-detail-wrapper").style.display = "block";
  } else {
    document.getElementById("cky-detail-wrapper").style.display = "none";
  }
}

function _ckyRenderAuditTable(inBanner, category) {
  const auditTableId = '';
  const auditTable = `<div class="cky-table-wrapper"><table id="${auditTableId}${category.id}" class="cky-cookie-audit-table"><thead><tr><th>${content[ckyActiveLaw].auditTable.cookie[selectedLanguage]}</th><th>${content[ckyActiveLaw].auditTable.type[selectedLanguage]}</th><th>${content[ckyActiveLaw].auditTable.duration[selectedLanguage]}</th><th>${content[ckyActiveLaw].auditTable.description[selectedLanguage]}</th></tr></thead><tbody></tbody></table></div>`;
  if (inBanner) {
    auditTableId = "cky-cookie-audit-table";
    document.getElementById(`cky-tab-content-${category.name[selectedLanguage]}`).getElementsByClassName("cky-tab-desc")[0].insertAdjacentHTML("beforeend", auditTable);
  } else {
    auditTableId = "cky-anywhere-cookie-audit-table";
    const auditTableCategoryName = `<h5>${category.name[selectedLanguage]}</h5>`;
    const auditTableElements = document.getElementsByClassName("cky-audit-table-element");
    for (const auditTableElement of auditTableElements) {
      auditTableElement.insertAdjacentHTML("beforeend", auditTableCategoryName);
      auditTableElement.insertAdjacentHTML("beforeend", auditTable);
    }
  }
  for (const cookie of category.cookies) {
    const auditTableRow = `<tr><td>${cookie.cookie_id}</td><td>${cookie.type}</td><td>${cookie.duration}</td><td>${cookie.description[selectedLanguage]}</td></tr>`;
    if (inBanner) {
      document.getElementById(`cky-cookie-audit-table${category.id}`).getElementsByTagName("tbody")[0].insertAdjacentHTML("beforeend", auditTableRow);
    } else {
      document.getElementById(`cky-anywhere-cookie-audit-table${category.id}`).getElementsByTagName("tbody")[0].insertAdjacentHTML("beforeend", auditTableRow);
    }
  }
}

function _ckyAcceptCookies(choice) {
  _ckyUpdateCookies(choice);
  if (typeof ckyLogCookies !== "undefined") {
    window.addEventListener("beforeunload", ckyLogCookies());
  }
  cookie.set("cky-action", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
  location.reload();
}

function _ckyUpdateCookies(choice) {
  cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
  for (const category of info.categories) {
    if (category.type !== 1 && choice === "customAccept") {
      const ckyItemToSave = category;
      const ckySwitch = document.getElementById(`cky-checkbox-category${ckyItemToSave.name[selectedLanguage]}`);
      if (ckySwitch.checked) {
        cookie.set(`cookieyes-${ckyItemToSave.slug}`,"yes", cookie.ACCEPT_COOKIE_EXPIRE);
      } else {
        cookie.set(`cookieyes-${ckyItemToSave.slug}`, "no", cookie.ACCEPT_COOKIE_EXPIRE);
      }
    } else {
      cookie.set(`cookieyes-${category.slug}`, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
    }
  }
}

function _ckyRejectCookies() {
  cookie.set("cky-action", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
  cookie.set("cky-consent", "no", cookie.ACCEPT_COOKIE_EXPIRE);
  _ckyRejectAllCookies();
  if (typeof ckyLogCookies !== "undefined") {
    window.addEventListener("beforeunload", ckyLogCookies());
  }
  location.reload();
}

function _ckyRejectAllCookies() {
  for (const category of info.categories) {
    if (category.type !== 1) {
      cookie.set(`cookieyes-${category.slug}`, "no", cookie.ACCEPT_COOKIE_EXPIRE);
    } else {
      cookie.set(`cookieyes-${category.slug}`, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
    }
  }
}

function _ckySetInitialCookies() {
  cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
  for (const category of info.categories) {
    if (category.type !== 1 && !(category.slug === "analytics" && loadAnalyticsByDefault) && ckyActiveLaw !== "ccpa") {
      if (category.defaultConsent) {
        cookie.set("cookieyes-" + category.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
      } else {
        cookie.set("cookieyes-" + category.slug, "no", cookie.ACCEPT_COOKIE_EXPIRE);
      }
    } else {
      cookie.set( "cookieyes-" + category.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
    }
  }
}

function _ckyShowToggler() {
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
    const cliConsentBarTrigger = `<div class="cky-consent-bar-trigger" id="cky-consent-toggler" onclick="_ckyRevisitCkyConsent()" style="background: ${colors[ckyActiveLaw].notice.bg};color: ${colors[ckyActiveLaw].notice.textColor};border: 1px solid ${colors[ckyActiveLaw].notice.borderColor};top: ${positionValue[position].top};right: ${positionValue[position].right};bottom: ${positionValue[position].bottom};left: ${positionValue[position].left}">${content[ckyActiveLaw].noticeToggler[selectedLanguage]}</div>`;
    body.insertAdjacentHTML("beforeend", cliConsentBarTrigger);
  }
}

function _ckyCheckAndInsertScripts(categories) {
  for (const category of categories) {
    const cookieStatus = cookie.read("cookieyes-" + category.slug);
    if (category.type === 1 || cookieStatus === "yes") {
      category.scripts && _ckyInsertScripts(category);
    }
  }
}

function _ckyInsertScripts(category) {
  for (const script of category.scripts) {
    if (script.head_script !== null) {
      const range = document.createRange();
      range.selectNode(document.getElementsByTagName("body")[0]);
      const documentFragment = range.createContextualFragment(
        script.head_script
      );
      document.body.appendChild(documentFragment);
    }
    if (script.body_script !== null) {
      const range = document.createRange();
      range.selectNode(document.getElementsByTagName("body")[0]);
      const documentFragment = range.createContextualFragment(
        script.body_script
      );
      document.body.appendChild(documentFragment);
    }
  }
}

function _ckyRevisitCkyConsent() {
  const ckyBanner = document.getElementById("cky-consent");
  if (!ckyBanner) {
    _ckyRenderBanner();
  }
};

function _ckyCheckSelectedLanguage(selectedLanguage, ckyActiveLaw) {
  let siteLanguage = document.documentElement.lang;
  if (!siteLanguage) return selectedLanguage;
  if (cliConfig.options.content[ckyActiveLaw].title[siteLanguage])
    return siteLanguage;
  const removeAfter = siteLanguage.indexOf("-");
  if (removeAfter > 1) siteLanguage = siteLanguage.substring(0, removeAfter);
  return cliConfig.options.content[ckyActiveLaw].title[siteLanguage]
    ? siteLanguage
    : selectedLanguage;
}

let selectedLanguage = _ckyCheckSelectedLanguage(
  cliConfig.options.behaviour.selectedLanguage,
  activeLaw
);

// **** DONE FUNCTONS ***** //

// these code is not reviewed
window.addEventListener("load", function () {
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
      var cliCookie =
        name + "=" + value + expires + "; path=/;domain=." + tldomain;
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
      _ckyAcceptCookies("all");
    },
    reject: function () {
      _ckyRejectCookies();
    },
    settings: function () {
      _ckyShowHideStickyDetail();
    },
  };
  var positionValue = {
    bottom: { top: "auto", right: "0", bottom: "0", left: "auto" },
    top: { top: "0", right: "0", bottom: "auto", left: "auto" },
    "bottom-left": {
      top: "auto",
      right: "auto",
      bottom: "20px",
      left: "20px",
    },
    "bottom-right": {
      top: "auto",
      right: "20px",
      bottom: "20px",
      left: "auto",
    },
    "top-left": {
      top: "20px",
      right: "auto",
      bottom: "auto",
      left: "20px",
    },
    "top-right": {
      top: "20px",
      right: "20px",
      bottom: "auto",
      left: "auto",
    },
  };
  if (options.display[ckyActiveLaw].notice) {
    if (cookie.read("cky-action") === "") {
      if (cookie.read("cookieyesID") === "") {
        cookie.set("cookieyesID", cookieyesID, cookie.ACCEPT_COOKIE_EXPIRE);
      }
      _ckyRenderBanner();
      _ckySetInitialCookies();
    } else {
      if (display[ckyActiveLaw].noticeToggler) {
        _ckyShowToggler();
      }
    }
  }
  if (cookie.read("cky-consent") === "yes") {
    _ckyCheckAndInsertScripts(info.categories);
  }
  var anywhereAuditTable = document.getElementsByClassName(
    "cky-audit-table-element"
  );
  if (anywhereAuditTable.length) {
    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      _ckyRenderAuditTable(false, category);
    }
  }
  if (JSON.parse(behaviour.acceptOnScroll)) {
    body.onscroll = function () {
      if (cookie.read("cky-consent") === "") {
        _ckyAcceptCookies("all");
      }
    };
  }
  document.querySelector("body").addEventListener("click", function (event) {
    if (event.target.matches(".cky-banner-element, .cky-banner-element *")) {
      if (!document.getElementById("cky-consent")) {
        _ckyRenderBanner();
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
            selectedLanguage = checkSelectedLanguage(
              selectedLanguage,
              ckyActiveLaw
            );
            renderBanner();
          }
        }
      }
    });
  });
  langObserver.observe(document.querySelector("html"), {
    attributes: true,
  });
  _ckyGeoIP();
});
// end of these code is not reviewed

// PART- 3
const observer = new MutationObserver(_ckyMutationObserver);
observer.observe(document.documentElement, { childList: true, subtree: true });

function _ckyMutationObserver(mutations) {
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (
        (node.nodeType !== 1 || node.tagName !== "SCRIPT") &&
        node.tagName !== "IFRAME"
      ) {
        continue;
      }
      const src = node.src || "";
      const scriptCategory = node.getAttribute("data-cookieyes");
      if (scriptCategory && _ckyGetCookie(scriptCategory) !== "yes" && src) {
        const webdetail = new URL(src);
        CKY_BLACKLIST.push(new RegExp(webdetail.hostname));
        patterns.blacklist.push(new RegExp(webdetail.hostname));
        for (const categoryScript of categoryScripts) {
          if (`cookieyes-${categoryScript.name}` === scriptCategory) {
            categoryScript.list.push(new RegExp(webdetail.hostname));
          }
        }
      }
      if (isOnBlacklist(src) && _ckyGetCookie(scriptCategory) !== "yes") {
        if (node.tagName === "IFRAME") {
          _ckyAddPlaceholder(node);
        }
        node.type = "javascript/blocked";
        node.remove();
        backupRemovedScripts.blacklisted.push(node.cloneNode());
        const beforeScriptExecute = function (e) {
          e.preventDefault();
          node.removeEventListener("beforescriptexecute", beforeScriptExecute);
        };
        node.addEventListener("beforescriptexecute", beforeScriptExecute);
      }
    }
  }
}

function _ckyAddPlaceholder(htmlElm) {
  if (htmlElm.tagName === "IMG") return;
  let htmlElemContent =
    cliConfig.options.content[activeLaw].placeHolderText[selectedLanguage];
  let htmlElemWidth = htmlElm.getAttribute("width");
  let htmlElemHeight = htmlElm.getAttribute("height");
  if (htmlElemWidth) htmlElemWidth = htmlElm.offsetWidth;
  if (htmlElemHeight) htmlElemHeight = htmlElm.offsetHeight;
  if (htmlElemHeight === 0 || htmlElemWidth === 0) htmlElemContent = "";
  let placeholder = `<div data-src="${htmlElm.src}" style="background-image: url('https://cdn-cookieyes.com/assets/images/cky-placeholder.svg');background-size: 80px;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: flex-end;justify-content: center; width:${htmlElemWidth}px; height:${htmlElemHeight} px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;">${htmlElemContent}</div></div>`;
  if (htmlElm.src && _ckyGetYoutubeID(htmlElm.src)) {
    placeholder = `<div data-src="${htmlElm.src}" style="background-image: linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)), url('https://img.youtube.com/vi/${youtubeID}/maxresdefault.jpg');background-size: 100% 100%;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: center;justify-content: center; width:${htmlElemWidth}px; height:${htmlElemHeight}px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;display: flex; align-items: center; padding:10px 16px; background-color: rgba(0, 0, 0, 0.8); color: #FFFFFF;">${htmlElemContent}</div></div>`;
  }
  placeholder.width = htmlElemWidth;
  placeholder.height = htmlElemHeight;
  htmlElm.insertAdjacentHTML("beforebegin", Placeholder);
}

function _ckyGetYoutubeID(src) {
  const match = src.match(
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  );
  if (match && Array.isArray(match) && match[2] && match[2].length === 11) {
    return match[2];
  }
  return false;
}

const categoryScripts = [
  {
    name: "functional",
    list: [
      /youtube-nocookie.com/,
      /bing.com/,
      /vimeo.com/,
      /spotify.com/,
      /sharethis.com/,
      /yahoo.com/,
      /addtoany.com/,
      /dailymotion.com/,
      /slideshare.net/,
      /soundcloud.com/,
      /spotify.com/,
      /tawk.to/,
      /cky-functional.js/,
    ],
  },
  { name: "performance", list: [/cky-performance.js/] },
  {
    name: "analytics",
    list: [
      /analytics/,
      /googletagmanager.com/,
      /google-analytics.com/,
      /cky-analytics.js/,
      /hotjar.com/,
      /js.hs-scripts.com/,
      /js.hs-analytics.net/,
      /taboola.com/,
      /analytics.ycdn.de/,
      /plugins\/activecampaign-subscription-forms/,
    ],
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

const backupRemovedScripts = { blacklisted: [] };
const CKY_BLACKLIST = [];
const CKY_WHITELIST = [];
const ckyconsent = _ckyGetCookie("cky-consent") || "no";
const TYPE_ATTRIBUTE = "javascript/blocked";
for (const { name, list } of categoryScripts) {
  if (navigator.doNotTrack == 1) {
    CKY_BLACKLIST.push(list);
    continue;
  }
  if (name === "analytics" && loadAnalyticsByDefault) {
    continue;
  }
  if (ckyconsent !== "yes" || _ckyGetCookie(`cookieyes-${name}`) !== "yes") {
    CKY_BLACKLIST.push(list);
  }
}
const patterns = {
  blacklist: CKY_BLACKLIST,
  whitelist: CKY_WHITELIST,
};
function _ckyIsOnBlacklist(src) {
  return src && patterns.blacklist.some((pattern) => pattern.test(src));
}
function _ckyIsOnWhitelist(src) {
  return src && patterns.whitelist.some((pattern) => pattern.test(src));
}

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
  );
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}
function _iterableToArray(iter) {
  if (
    Symbol.iterator in Object(iter) ||
    Object.prototype.toString.call(iter) === "[object Arguments]"
  )
    return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

const createElementBackup = document.createElement;
document.createElement = function () {
  const args = new Array(arguments.length);
  for (let key = 0; key < arguments.length; key++) {
    args[key] = arguments[key];
  }
  const newCreatedElement = createElementBackup.call(
    document,
    _toConsumableArray(args)
  );
  if (args[0].toLowerCase() !== "script") return;
  const originalSetAttribute = newCreatedElement.setAttribute.bind(
    newCreatedElement
  );
  Object.defineProperties(newCreatedElement, {
    src: {
      get: function () {
        return newCreatedElement.getAttribute("src");
      },
      set: function (value) {
        if (_ckyIsOnBlacklist(value)) {
          originalSetAttribute("type", TYPE_ATTRIBUTE);
        }
        originalSetAttribute("src", value);
        return true;
      },
    },
    type: {
      set: function (value) {
        const typeValue = _ckyIsOnBlacklist(newCreatedElement.src)
          ? TYPE_ATTRIBUTE
          : value;
        originalSetAttribute("type", typeValue);
        return true;
      },
    },
  });
  newCreatedElement.setAttribute = function (name, value) {
    if (name === "type" || name === "src") newCreatedElement[name] = value;
    else
      HTMLScriptElement.prototype.setAttribute.call(
        newCreatedElement,
        name,
        value
      );
  };
  return newCreatedElement;
};

function _ckyUnblock() {
  if (navigator.doNotTrack === 1) return;
  const ckyconsent = _ckyGetCookie("cky-consent") || "no";
  for (const { name, list } of categoryScripts) {
    if (ckyconsent === "yes" && _ckyGetCookie(`cookieyes-${name}`) === "yes") {
      CKY_WHITELIST.push(list);
      patterns.whitelist.push(list);
    }
  }
  observer.disconnect();
  let indexOffset = 0;
  _toConsumableArray(backupRemovedScripts.blacklisted).forEach(function (
    script,
    index
  ) {
    if (!script.src || !_ckyIsOnWhitelist(script.src)) {
      return;
    }
    if (script.type === "javascript/blocked") {
      TYPE_ATTRIBUTE = "text/javascript";
      script.type = "text/javascript";
      const scriptNode = document.createElement("script");
      scriptNode.src = script.src;
      scriptNode.type = "text/javascript";
      document.head.appendChild(scriptNode);
      backupRemovedScripts.blacklisted.splice(index - indexOffset, 1);
      indexOffset++;
    } else {
      const frames = document.getElementsByClassName(
        "wt-cli-iframe-placeholder"
      );
      for (const frame of frames) {
        if (
          script.src == frame.getAttribute("data-src") &&
          isOnWhitelist(script.src)
        ) {
          const iframe = document.createElement("iframe");
          const width = frame.offsetWidth;
          const height = frame.offsetHeight;
          iframe.src = script.src;
          iframe.width = width;
          iframe.height = height;
          frame.parentNode.insertBefore(iframe, frame);
          frame.parentNode.removeChild(frame);
        }
      }
    }
  });
  document.createElement = createElementBackup;
}