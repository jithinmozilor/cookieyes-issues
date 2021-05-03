const cliConfig = require('./gdpr.json');
const position = require('./position.json');

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

function _ckySetToSessionStorage(key, value = "") {
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
    _ckySetToSessionStorage("isEU", userInEu);
    const ipdata = {
      ip: `${clientIP.substring(0, clientIP.lastIndexOf("."))}.0`,
      country_name: countryName,
    };
    _ckySetToSessionStorage("ip", ipdata);
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
      "CookieYes Consent",
      "Necessary",
      "Functional",
      "Analytics",
      "Advertisement",
      "Other",
    ].map((name) => ({
      name,
      status:
        name === "Necessary"
          ? "yes"
          : name === "CookieYes Consent"
          ? _ckyGetCookie("cky-consent")
          : _ckyGetCookie(`cky-${name.toLowerCase()}`),
    }));
    const userIP = _ckySetToSessionStorage("ip");
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

const cookieExpiry = options.cookieExpiry === undefined ? 365 : options.cookieExpiry;

_ckyBannerActiveCheck();

// PART - 2

// **** DONE FUNCTONS ***** //
function _ckyRenderBanner() {
  _ckyCreateBanner();
  if (selectedLanguage == "ar")
    document.getElementById("cky-consent").classList.add("cky-rtl");
  document
    .getElementById("cky-consent")
    .classList.add(`cky-${options.consentBarType}`);
  _ckyAppendLogo();
  _ckyAppendText();
  _ckyRenderCategoryBar();
  _ckyRenderButtons();
}

function _ckyCreateBanner() {
  const consentBar = `<div class="cky-consent-bar" id="cky-consent"><div class="cky-content-logo-outer-wrapper" id="cky-content-logo"><divs id="cky-content-logo-inner-wrapper"><div class="cky-content-wrapper"></div></div></div></div>`;
  body.insertAdjacentHTML("beforeend", consentBar);
  // MOVE TO CSS
  const ckyConsentBar = document.getElementById("cky-consent");
  ckyConsentBar.style.display = "block";
  ckyConsentBar.style.background = colors[ckyActiveLaw].notice.bg;
  ckyConsentBar.style.color = colors[ckyActiveLaw].notice.textColor;
  ckyConsentBar.style.borderWidth = "1px";
  ckyConsentBar.style.borderStyle = "solid";
  ckyConsentBar.style.borderColor = colors[ckyActiveLaw].notice.borderColor;
  ckyConsentBar.style.top = positionValue[position].top;
  ckyConsentBar.style.right = positionValue[position].right;
  ckyConsentBar.style.bottom = positionValue[position].bottom;
  ckyConsentBar.style.left = positionValue[position].left;
  if (
    cliConfig.options.geoTarget["gdpr"].eu &&
    _ckyGetCookie("cky-action") !== "yes"
  )
    document.getElementById("cky-consent").style.display = "none";
}

function _ckyAppendLogo() {
  document.getElementById("cky-consent").classList.add("cky-logo-active");
  // MOVE TO CSS
  const consentLogo = `<img src="${content[ckyActiveLaw].customLogoUrl}" class="img-fluid cky-logo" style="width: 100px" alt="Brand logo">`;
  document
    .querySelector("#cky-consent #cky-content-logo")
    .insertAdjacentHTML("afterbegin", consentLogo);
}

function _ckyAppendText() {
  const consentTitle = `<div class="cky-consent-title" style="color:${colors[ckyActiveLaw].notice.titleColor}">${content[ckyActiveLaw].title[selectedLanguage]}</div>`;
  document
    .querySelector("#cky-consent #cky-content-logo-inner-wrapper")
    .insertAdjacentHTML("afterbegin", consentTitle);
  const consentText = `<p class="cky-bar-text" style="color:${colors[ckyActiveLaw].notice.textColor}">${content[ckyActiveLaw].text[selectedLanguage]}</p>`;
  document
    .getElementById("cky-consent")
    .getElementsByClassName("cky-content-wrapper")[0]
    .insertAdjacentHTML("beforeend", consentText);
}

function _ckyRenderCategoryBar() {
  const categoryDirectList = `<div class="cky-category-direct" id="cky-category-direct" style="color:${colors[ckyActiveLaw].notice.textColor}"></div>`;
  document
    .getElementById("cky-consent")
    .getElementsByClassName("cky-bar-text")[0]
    .insertAdjacentHTML("afterend", categoryDirectList);
  for (const category of categories) {
    const categoryBarItem = `<div class="cky-category-direct-item"><span class="cky-category-direct-name" id="cky-category-direct-${category.name[selectedLanguage]}">${category.name[selectedLanguage]}</span></div>`;
    document
      .querySelector("#cky-consent #cky-category-direct")
      .insertAdjacentHTML("beforeend", categoryBarItem);
    _ckyCreateSwitches(category);
  }
}

function _ckyCreateSwitches(category) {
  const cookieStatus = _ckyGetCookie(`cookieyes-${category.slug}`);
  let ckySwitchStatus =
    cookieStatus === "yes" || (!cookieStatus && category.defaultConsent)
      ? "checked"
      : "";
  const categoryCheckbox = `<label class="cky-switch" for="cky-checkbox-category${category.name[selectedLanguage]}" onclick="event.stopPropagation();"><input type="checkbox" id="cky-checkbox-category${category.name[selectedLanguage]}" ${ckySwitchStatus}/><div class="cky-slider"></div></label>`;
  document
    .getElementById(`cky-category-direct-${category.name[selectedLanguage]}`)
    .insertAdjacentHTML("beforebegin", categoryCheckbox);
  if (category.type === 1)
    document
      .getElementById(`cky-checkbox-category${category.name[selectedLanguage]}`)
      .setAttribute("disabled", true);
}

function ckyBannerActions(btnName) {
  switch (btnName) {
    case "accept":
      return _ckyAcceptCookies;
    case "reject":
      return _ckyRejectCookies;
    case "settings":
      return  _ckyShowHideStickyDetail;
    default:
      return () => {}
  }
};

function _ckyRenderButtons() {
  ckyConsentBar
    .getElementsByClassName("cky-content-wrapper")[0]
    .insertAdjacentHTML("beforeend", '<div class="cky-button-wrapper"></div>');
  _ckyAppendButton("settings");
  _ckyRenderStickyDetail();
  _ckyAppendButton("reject");
  _ckyAppendButton("accept");
  let privacyLink = content[ckyActiveLaw].privacyPolicyLink[selectedLanguage]
    .trim()
    .replace(/\s/g, "");
  // if (/^(:\/\/)/.test(privacyLink)) privacyLink = `http${privacyLink}`;
  // else if (!/^(f|ht)tps?:\/\//i.test(privacyLink))
  //   privacyLink = `http://${privacyLink}`;
  const readMoreButton = `<a class="cky-btn-readMore" id="cky-btn-readMore" href="${privacyLink}" target="_blank">${content[ckyActiveLaw].buttons["readMore"][selectedLanguage]}</a>`;
  document
    .querySelector("#cky-consent .cky-bar-text")
    .insertAdjacentHTML("beforeend", readMoreButton);
  _ckyAttachButtonStyles("readMore");
}

function _ckyAppendButton(btnName) {
  const button = `<button class="cky-btn cky-btn-${btnName}" id="cky-btn-${btnName}">${content[ckyActiveLaw].buttons[btnName][selectedLanguage]}</button>`;
  document
    .querySelector("#cky-consent .cky-button-wrapper")
    .insertAdjacentHTML("beforeend", button);
  _ckyAttachButtonStyles(btnName);
  document.querySelector(`#cky-consent #cky-btn-${btnName}`).onclick = ckyBannerActions(btnName);
}

function _ckyAttachButtonStyles(btnName) {
  document.querySelector(
    `#cky-consent #cky-btn-${btnName}`
  ).style = `color:${colors[ckyActiveLaw].buttons[btnName].textColor};background-color:${colors[ckyActiveLaw].buttons[btnName].bg};border-color:${colors[ckyActiveLaw].buttons[btnName].borderColor};`;
}

const tabCss = `color:${colors[ckyActiveLaw].popup.pills.textColor};border-color:${colors[ckyActiveLaw].notice.borderColor}`;
const activeTabCss = `background-color:${colors[ckyActiveLaw].popup.pills.activeBg};color:${colors[ckyActiveLaw].popup.pills.activeTextColor};border-color:${colors[ckyActiveLaw].notice.borderColor};`;

function _ckyRenderStickyDetail() {
  const ckyDetailWrapper = `<div class="cky-detail-wrapper" id="cky-detail-wrapper" style="border-color:${colors[ckyActiveLaw].notice.borderColor}"><div class="cky-tab"><div class="cky-tab-menu" id="cky-tab-menu" style="background-color:${colors[ckyActiveLaw].popup.pills.bg}"></div><div class="cky-tab-content" id="cky-tab-content" style="background-color:${colors[ckyActiveLaw].notice.bg}"></div></div></div>`;
  document
    .getElementById("cky-consent")
    .insertAdjacentHTML("beforeend", ckyDetailWrapper);
  // MOVE TO CSS
  const ckyPoweredLink =
    '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
  document
    .getElementById("cky-detail-wrapper")
    .insertAdjacentHTML("beforeend", ckyPoweredLink);
  for (const category of categories) _ckyRenderStickyTabAndAddClick(category);
  const customAcceptButton = `<button class="cky-btn cky-btn-custom-accept"style = "color: ${colors[ckyActiveLaw].popup.acceptCustomButton.textColor};background-color: ${colors[ckyActiveLaw].popup.acceptCustomButton.bg};border-color: ${colors[ckyActiveLaw].popup.acceptCustomButton.borderColor};"id="cky-btn-custom-accept">${content[ckyActiveLaw].customAcceptButton[selectedLanguage]}</button>`;
  document
    .querySelector("#cky-consent #cky-category-direct")
    .insertAdjacentHTML("beforeend", customAcceptButton);
  document.getElementById("cky-btn-custom-accept").onclick = () =>
    _ckyAcceptCookies("customAccept");
  document.getElementById("cky-detail-wrapper").style.display = "none";
}

function _ckyRenderStickyTabAndAddClick(category) {
  const isNecessaryCategory = category.slug === "necessary";
  const ckyTabItem = `<div class="cky-tab-item${
    isNecessaryCategory ? " cky-tab-item-active" : ""
  }" id="cky-tab-item-${
    isNecessaryCategory ? "privacy" : category.name[selectedLanguage]
  }" tab-target="cky-tab-content-${
    isNecessaryCategory ? "privacy" : category.name[selectedLanguage]
  }" style="${isNecessaryCategory ? activeTabCss : tabCss}">${
    privacyPolicy.title[selectedLanguage]
  }</div>`;
  const ckyTabContentItem = `<div class="cky-tab-content-item${
    isNecessaryCategory ? " cky-tab-content-active" : ""
  }" id="cky-tab-content-${
    isNecessaryCategory ? "privacy" : category.name[selectedLanguage]
  }"><div class="cky-tab-title" id="cky-tab-title-${
    isNecessaryCategory ? "privacy" : category.name[selectedLanguage]
  }" style="color:${colors[ckyActiveLaw].notice.textColor}">${
    isNecessaryCategory
      ? privacyPolicy.title[selectedLanguage]
      : category.name[selectedLanguage]
  }</div><div class="cky-tab-desc" style="color:${
    colors[ckyActiveLaw].notice.textColor
  }">${
    isNecessaryCategory
      ? privacyPolicy.text[selectedLanguage]
      : category.description[selectedLanguage]
  }</div></div>`;
  document
    .querySelector("#cky-consent #cky-tab-menu")
    .insertAdjacentHTML("beforeend", ckyTabItem);
  document
    .querySelector("#cky-consent #cky-tab-content")
    .insertAdjacentHTML("beforeend", ckyTabContentItem);
  if (!isNecessaryCategory) {
    _ckyCreateSwitches(category);
    _ckyRenderAuditTable(true, category);
  }
  setTimeout(() => {
    const ckyTab = document.getElementById(
      `cky-tab-item-${
        isNecessaryCategory ? "privacy" : category.name[selectedLanguage]
      }`
    );
    const currentActiveTab = document.getElementsByClassName(
      "cky-tab-item-active"
    )[0];
    currentActiveTab.classList.remove("cky-tab-item-active");
    currentActiveTab.setAttribute("style", _CKY_TAB_CSS);
    ckyTab.classList.add("cky-tab-item-active");
    ckyTab.setAttribute("style", _CKY_ACTIVE_TAB_CSS);
    document
      .querySelector("#cky-consent .cky-tab-content-active")
      .classList.remove("cky-tab-content-active");
    const tabId = ckyTab.getAttribute("tab-target");
    document.getElementById(tabId).className = `${
      document.getElementById(tabId).className
    } cky-tab-content-active`;
  });
}

function _ckyShowHideStickyDetail() {
  document.getElementById(
    "cky-detail-wrapper"
  ).style.display = document
    .getElementById("cky-btn-settings")
    .toggleAttribute("expanded")
    ? "block"
    : "none";
}

function _ckyRenderAuditTable(inBanner, category) {
  const auditTable = `<div class="cky-table-wrapper"><table id="${
    inBanner ? "cky-cookie-audit-table" : "cky-anywhere-cookie-audit-table"
  }${category.id}" class="cky-cookie-audit-table"><thead><tr><th>${
    content[ckyActiveLaw].auditTable.cookie[selectedLanguage]
  }</th><th>${
    content[ckyActiveLaw].auditTable.type[selectedLanguage]
  }</th><th>${
    content[ckyActiveLaw].auditTable.duration[selectedLanguage]
  }</th><th>${
    content[ckyActiveLaw].auditTable.description[selectedLanguage]
  }</th></tr></thead><tbody></tbody></table></div>`;
  if (inBanner)
    document
      .getElementById(`cky-tab-content-${category.name[selectedLanguage]}`)
      .getElementsByClassName("cky-tab-desc")[0]
      .insertAdjacentHTML("beforeend", auditTable);
  else {
    const auditTableCategoryName = `<h5>${category.name[selectedLanguage]}</h5>`;
    const auditTableElements = document.getElementsByClassName(
      "cky-audit-table-element"
    );
    for (const auditTableElement of auditTableElements) {
      auditTableElement.insertAdjacentHTML("beforeend", auditTableCategoryName);
      auditTableElement.insertAdjacentHTML("beforeend", auditTable);
    }
  }
  for (const cookie of category.cookies) {
    const auditTableRow = `<tr><td>${cookie.cookie_id}</td><td>${cookie.type}</td><td>${cookie.duration}</td><td>${cookie.description[selectedLanguage]}</td></tr>`;
    document
      .getElementById(
        `${
          inBanner
            ? "cky-cookie-audit-table"
            : "cky-anywhere-cookie-audit-table"
        }${category.id}`
      )
      .getElementsByTagName("tbody")[0]
      .insertAdjacentHTML("beforeend", auditTableRow);
  }
}

function _ckyAcceptCookies(choice = "all") {
  _ckyUpdateCookies(choice);
  window.addEventListener("beforeunload", _ckyLogCookies);
  _ckySetCookie("cky-action", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
  location.reload();
}

function _ckyUpdateCookies(choice) {
  _ckySetCookie("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
  for (const category of info.categories) {
    let valueToSet = "yes";
    if (category.type !== 1 && choice === "customAccept") {
      const ckySwitch = document.getElementById(
        `cky-checkbox-category${category.name[selectedLanguage]}`
      );
      if (!ckySwitch.checked) valueToSet = "no";
    }
    _ckySetCookie(
      `cookieyes-${category.slug}`,
      valueToSet,
      cookie.ACCEPT_COOKIE_EXPIRE
    );
  }
}

function _ckyRejectCookies() {
  _ckySetCookie("cky-action", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
  _ckySetCookie("cky-consent", "no", cookie.ACCEPT_COOKIE_EXPIRE);
  _ckyRejectAllCookies();
  window.addEventListener("beforeunload", _ckyLogCookies);
  location.reload();
}

function _ckyRejectAllCookies() {
  for (const category of info.categories)
    _ckySetCookie(
      `cookieyes-${category.slug}`,
      category.type !== 1 ? "no" : "yes",
      cookie.ACCEPT_COOKIE_EXPIRE
    );
}

function _ckySetInitialCookies() {
  _ckySetCookie("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
  // CHECk CODE
  for (const category of info.categories)
    _ckySetCookie(
      `cookieyes-${category.slug}`,
      category.type !== 1 && !category.defaultConsent ? "no" : "yes",
      cookie.ACCEPT_COOKIE_EXPIRE
    );
}

function _ckyShowToggler() {
  if (document.getElementById("cky-consent"))
    document.getElementById("cky-consent").remove();
  if (document.getElementById("cky-settings-popup"))
    document.getElementById("cky-settings-popup").remove();
  if (document.getElementById("cky-ccpa-settings-popup"))
    document.getElementById("cky-ccpa-settings-popup").remove();
  if (document.querySelector("#cky-ccpa-modal-backdrop"))
    document.querySelector("#cky-ccpa-modal-backdrop").remove();
  if (!display[ckyActiveLaw].noticeToggler) return;
  const cliConsentBarTrigger = `<div class="cky-consent-bar-trigger" id="cky-consent-toggler" onclick="_ckyRevisitCkyConsent()" style="background: ${colors[ckyActiveLaw].notice.bg};color: ${colors[ckyActiveLaw].notice.textColor};border: 1px solid ${colors[ckyActiveLaw].notice.borderColor};top: ${positionValue[position].top};right: ${positionValue[position].right};bottom: ${positionValue[position].bottom};left: ${positionValue[position].left}">${content[ckyActiveLaw].noticeToggler[selectedLanguage]}</div>`;
  body.insertAdjacentHTML("beforeend", cliConsentBarTrigger);
}

function _ckyCheckAndInsertScripts(categories) {
  for (const category of categories) {
    const cookieStatus = _ckyGetCookie(`cookieyes-${category.slug}`);
    if (category.type === 1 || cookieStatus === "yes")
      _ckyInsertScripts(category);
  }
}

function _ckyInsertScripts(category) {
  for (const script of category.scripts) {
    _ckyCreateContextualFragment("head", script.head_script);
    _ckyCreateContextualFragment("body", script.body_script);
  }
}

function _ckyCreateContextualFragment(tag, script) {
  if (!script) return;
  const headRange = document.createRange();
  headRange.selectNode(document.getElementsByTagName(tag)[0]);
  const documentFragment = headRange.createContextualFragment(script);
  document.body.appendChild(documentFragment);
}

function _ckyRevisitCkyConsent() {
  const ckyBanner = document.getElementById("cky-consent");
  if (!ckyBanner) _ckyRenderBanner();
}

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

const ckyLangObserver = new MutationObserver(_ckyLanguageObserver);

function _ckyLanguageObserver(mutations) {
  for (const mutation of mutations) {
    if (mutation.type !== "attributes" && mutation.attributeName !== "lang") {
      continue
    }
    selectedLanguage = _ckyCheckSelectedLanguage(
      selectedLanguage,
      ckyActiveLaw
    );
    const ckySettingsPopup = document.getElementById("cky-settings-popup");
    const ckyConsentBar = document.getElementById("cky-consent")
    if (ckySettingsPopup) ckySettingsPopup.remove();
    if (ckyConsentBar) {
      ckyConsentBar.remove();
      _ckyRenderBanner();
    }
  }
}

function _ckyAttachNoticeStyles() {
  const style = document.createElement("style");
  document.head.appendChild(style);
  style.setAttribute("id", "cky-style");
  style.appendChild(document.createTextNode(`${template.css}${options.customCss}`));
}

window.addEventListener("load", function () {
  const options = cliConfig.options;
  const display = options.display;
  const categories = cliConfig.info.categories;

  _ckyAttachNoticeStyles();

  if (!_ckyGetCookie("cky-action")) {
    if (!_ckyGetCookie("cookieyesID")) {
      _ckySetCookie("cookieyesID", cookieyesID, cookieExpiry);
    }
    _ckyRenderBanner();
    _ckySetInitialCookies();
  } else if (display[ckyActiveLaw].noticeToggler) {
    _ckyShowToggler();
  }

  if (_ckyGetCookie("cky-consent") === "yes") _ckyCheckAndInsertScripts(categories);
  const anywhereAuditTable = document.getElementsByClassName(
    "cky-audit-table-element"
  );

  if (anywhereAuditTable.length) {
    for (const category of categories) {
      _ckyRenderAuditTable(false, category);
    }
  }

  ckyLangObserver.observe(document.querySelector("html"), {
    attributes: true,
  });

  _ckyGeoIP();

  // document.querySelector("body").addEventListener("click", function (event) {
  //   if (event.target.matches(".cky-banner-element, .cky-banner-element *") && !document.getElementById("cky-consent")) {
  //       _ckyRenderBanner();
  //   }
  // });
});

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

const createElementBackup = document.createElement;
document.createElement = function (...args) {
  const newCreatedElement = createElementBackup.call(document, ...args);
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
        if (_ckyIsOnBlacklist(value))
          originalSetAttribute("type", TYPE_ATTRIBUTE);
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
    else originalSetAttribute(name, value);
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
  backupRemovedScripts.blacklisted.forEach(function (script, index) {
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
