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
          { name: "Functional", status: getCookie("cookieyes-functional") },
          { name: "performance", status: getCookie("cookieyes-analytics") },
          { name: "Analytics", status: getCookie("cookieyes-performance") },
          { name: "Advertisement", status: getCookie("cookieyes-advertisement") },
          { name: "Other", status: getCookie("cookieyes-other") },
      ];
      let ip = sessionStorage.getItem("ip");
      let consent_id = getCookie("cookieyesID");
      var request = new XMLHttpRequest();
      var data = new FormData();
      data.append("log", JSON.stringify(log));
      data.append("key", "23f60220ba8179c107119d98");
      data.append("ip", ip);
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
      .reduce(function (accumulator, c) {
          accumulator[c.key.trim()] = decodeURIComponent(c.value);
          return accumulator;
      });
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
var tldomain = "jithinmozilor.github.io";
var cliConfig = {
  options: {
      plan: "Pro",
      theme: "recommended",
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
                  de:
                      "Diese Website verwendet Cookies, mit denen die Website funktioniert und wie Sie mit ihr interagieren, damit wir Ihnen eine verbesserte und angepasste Benutzererfahrung bieten k\u00f6nnen. Wir werden die Cookies nur verwenden, wenn Sie dem zustimmen, indem Sie auf Akzeptieren klicken. Sie k\u00f6nnen auch einzelne Cookie-Einstellungen in den Einstellungen verwalten.",
                  en: "You can change your preferences at any time by visiting our",
                  fi:
                      "T\u00e4m\u00e4 verkkosivusto k\u00e4ytt\u00e4\u00e4 ev\u00e4steit\u00e4, jotka auttavat verkkosivustoa toimimaan ja seuraamaan, miten olet vuorovaikutuksessa sen kanssa, jotta voimme tarjota sinulle paremman ja r\u00e4\u00e4t\u00e4l\u00f6idyn k\u00e4ytt\u00f6kokemuksen. K\u00e4yt\u00e4mme ev\u00e4steit\u00e4 vain, jos suostut siihen napsauttamalla Hyv\u00e4ksy.",
                  sl:
                      "Ta spletna stran uporablja pi\u0161kotke, ki pomagajo pri delovanju spletne strani in za sledenje na\u010dinu interakcije z njo, tako da vam lahko zagotovimo izbolj\u0161ano in prilagojeno uporabni\u0161ko izku\u0161njo. Pi\u0161kotke bomo uporabljali le, \u010de se strinjate s tem s klikom na Sprejmi.",
                  "pt-br":
                      "Este site usa cookies que ajudam as fun\u00e7\u00f5es do site e para rastrear como voc\u00ea interage com ele para que possamos fornecer-lhe uma experi\u00eancia de usu\u00e1rio melhorada e personalizada. S\u00f3 usaremos os cookies se voc\u00ea concordar com ele clicando em Aceitar.",
              },
              title: { de: "Cookie Zustimmung", en: "Cookie consent", fi: "Ev\u00e4steiden suostumus", sl: "Soglasje za pi\u0161kotek", "pt-br": "Consentimento do cookie" },
              buttons: {
                  accept: { de: "Alle akzeptieren", en: "Accept", fi: "Hyv\u00e4ksy kaikki", sl: "Sprejmi vse", "pt-br": "Aceitar tudo" },
                  reject: { de: "Ablehnen", en: "Reject", fi: "Hyl\u00e4t\u00e4", sl: "Zavrne", "pt-br": "Rejeitar" },
                  readMore: { de: "Weiterlesen", en: "Read More", fi: "Lue lis\u00e4\u00e4", sl: "Preberite ve\u010d", "pt-br": "Leia Mais" },
                  settings: { de: "Einstellungen", en: "Preferences", fi: "Asetukset", sl: "Nastavitve", "pt-br": "Prefer\u00eancias" },
              },
              auditTable: {
                  type: { de: "Art", en: "Type", fi: "Tyyppi", sl: "Vrsta", "pt-br": "Tipo" },
                  cookie: { de: "Cookie", en: "Cookie", fi: "Ev\u00e4ste", sl: "Pi\u0161kotek", "pt-br": "Cookie" },
                  duration: { de: "Dauer", en: "Duration", fi: "Kesto", sl: "Trajanje", "pt-br": "Dura\u00e7\u00e3o" },
                  description: { de: "Beschreibung", en: "Description", fi: "Kuvaus", sl: "Opis", "pt-br": "Descri\u00e7\u00e3o" },
              },
              saveButton: { de: "sparen", en: "Save", fi: "Tallentaa", sl: "Shranite", "pt-br": "Salvar" },
              customLogoUrl: "https://cdn.shopify.com/s/files/1/1767/6787/files/animation_200_kl2oc0kx.gif?v=1613157563",
              noticeToggler: { de: "Details zum Datenschutz", en: "Privacy Details", fi: "Yksityisyyden yksityiskohdat", sl: "Podrobnosti o zasebnosti", "pt-br": "Detalhes de privacidade" },
              placeHolderText: {
                  de: "Bitte akzeptieren Sie die Cookie-Zustimmung",
                  en: "Please accept the cookie consent",
                  fi: "Hyv\u00e4ksy ev\u00e4steen suostumus",
                  sl: "Prosimo, sprejmite soglasje za pi\u0161kotek",
                  "pt-br": "Por favor, aceite o consentimento do cookie",
              },
              privacyPolicyLink: { de: "#", en: "#", fi: "#", sl: "#", "pt-br": "#" },
              customAcceptButton: { de: "Speichern Sie meine Einstellungen", en: "Save my preferences", fi: "Tallenna asetukset", sl: "Shrani moje nastavitve", "pt-br": "Salve minhas prefer\u00eancias" },
          },
      },
      display: { gdpr: { title: false, notice: true, buttons: { accept: true, reject: true, readMore: false, settings: true }, noticeToggler: true } },
      version: "4.0.0",
      position: "bottom-right",
      template: {
          id: "box",
          css:
              ".cky-consent-bar-trigger, .cky-consent-bar, .cky-modal, .cky-consent-bar-trigger *, .cky-consent-bar *, .cky-modal * { box-sizing: border-box; } .cky-consent-bar-trigger *:focus, .cky-consent-bar *:focus, .cky-modal *:focus { outline: 0; } .cky-consent-bar-trigger { position: fixed; right: 30px; padding: 2px 5px; font-size: 13px; cursor: pointer; font-family: inherit; animation: slide-up 0.4s ease; z-index: 9997; } .cky-consent-bar { font-family: inherit; position: fixed; z-index: 9997; } .cky-consent-bar .cky-consent-title { font-size: 15px; font-weight: bold; margin-bottom: 3px; } .cky-consent-bar p { line-height: 20px; font-size: 13px; font-weight: normal; margin-bottom: 0; margin-top: 0; } .cky-btn { font-size: 12px; padding: .5rem 1rem; background: none; cursor: pointer; display: inline-block; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; line-height: 1; transition: all .15s ease-in-out; margin: 0; min-height: auto; font-weight: normal; border-radius: 0; } .cky-btn:hover { opacity: .8; } .cky-btn:focus { outline: 0; } .cky-button-wrapper .cky-btn { margin-right: 15px; } .cky-button-wrapper .cky-btn:last-child { margin-right: 0; } .cky-btn.cky-btn-custom-accept { margin: 1.5rem 1rem; font-weight: 600; white-space: initial; word-break: break-word; } .cky-btn-readMore { cursor: pointer; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-btn-doNotSell { cursor: pointer; white-space: nowrap; font-weight: bold; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: flex; align-items: center; } .cky-consent-bar.cky-logo-active .cky-logo { margin-right: 30px; } @media (max-width: 540px) { .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: block; } } .cky-tab { display: -ms-flexbox; display: flex; } .cky-tab-menu { flex: 0 0 25%; max-width: 25%; } @media (max-width: 991px) { .cky-tab-menu { flex: 0 0 40%; max-width: 40%; } } .cky-tab-content { flex: 0 0 75%; max-width: 75%; background: transparent; padding: 15px 20px; } @media (max-width: 991px) { .cky-tab-content { flex: 0 0 60%; max-width: 60%; } } @media (max-width: 767px) { .cky-tab-content { padding: 15px; } } .cky-tab-item { font-size: 11px; cursor: pointer; font-weight: normal; border-bottom: 1px solid; border-right: 1px solid; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.5; } @media (max-width: 767px) { .cky-tab-item { font-size: 11px; padding: .75rem .75rem; } } .cky-tab-item-active { cursor: initial; border-right: 0; } .cky-tab-content .cky-tab-desc, .cky-tab-content .cky-tab-desc p { font-size: 12px; } .cky-tab-title { font-size: 13px; margin-bottom: 11px; margin-top: 0; font-family: inherit; font-weight: bold; line-height: 1; display: flex; align-items: center; } .cky-tab-content .cky-tab-content-item:not(.cky-tab-content-active) { display: none; } .cky-category-direct { display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; padding-top: 15px; margin-top: 15px; border-top: 1px solid #d4d8df; } .cky-category-direct .cky-btn-custom-accept { margin: 0 0 0 auto; } .cky-category-direct-item { display: -ms-flexbox; display: flex; -webkit-box-align: center; -ms-flex-align: center; align-items: center; margin-right: 32px; margin-bottom: 15px; } .cky-category-direct-item:last-child { margin-right: 0; } .cky-category-direct-item .cky-switch { margin-left: 0; } .cky-category-direct-item .cky-category-direct-name { margin-left: 10px; font-size: 12px; font-weight: 600; } .cky-category-direct +.cky-detail-wrapper { margin-top: 10px; } .cky-table-wrapper { width: 100%; max-width: 100%; overflow: auto; } .cky-cookie-audit-table { font-family: inherit; border-collapse: collapse; width: 100%; margin-top: 10px; } .cky-cookie-audit-table th { background-color: #d9dfe7; border: 1px solid #cbced6; } .cky-cookie-audit-table td { border: 1px solid #d5d8df; } .cky-cookie-audit-table th, .cky-cookie-audit-table td { text-align: left; padding: 10px; font-size: 12px; color: #000000; word-break:normal; } .cky-cookie-audit-table tr:nth-child(2n+1) td { background: #f1f5fa; } .cky-cookie-audit-table tr:nth-child(2n) td { background: #ffffff; } .cky-audit-table-element h5 { margin: 25px 0 2px 0; } .cky-audit-table-element .cky-table-wrapper { margin-bottom: 1rem; } .cky-consent-bar.cky-rtl { direction: rtl; text-align: right; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn { margin-right: 0; margin-left: 15px; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn:last-child { margin-left: 0; } .cky-consent-bar.cky-rtl .cky-btn-readMore { margin-left: 0; margin-right: 6px; } .cky-consent-bar.cky-rtl.cky-logo-active .cky-logo { margin-right: 0px; margin-left: 30px; } .cky-switch { position: relative; min-height: 13px; padding-left: 25px; font-size: 14px; margin-left: 20px; margin-bottom: 0; display: inline-block; } .cky-switch input[type='checkbox'] { display: none !important; } .cky-switch .cky-slider { background-color: #e3e1e8; border-radius: 34px; height: 13px; width: 25px; bottom: 0; cursor: pointer; left: 0; position: absolute; right: 0; transition: .4s; } .cky-switch .cky-slider:before { background-color: #fff; border-radius: 50%; bottom: 2px; content: ''; height: 9px; left: 2px; position: absolute; transition: .4s; width: 9px; } .cky-switch input:checked+.cky-slider { background-color: #008631; } .cky-switch input:disabled+.cky-slider { cursor: initial; } .cky-switch input:checked+.cky-slider:before { transform: translateX(12px); } .cky-modal.cky-fade .cky-modal-dialog { transition: -webkit-transform .3s ease-out; transition: transform .3s ease-out; transition: transform .3s ease-out, -webkit-transform .3s ease-out; -webkit-transform: translate(0, -25%); transform: translate(0, -25%); } .cky-modal.cky-show .cky-modal-dialog { -webkit-transform: translate(0, 0); transform: translate(0, 0); } .cky-modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9998; background-color: rgba(10, 10, 10, 0.22); display: none; } .cky-modal-backdrop.cky-fade { opacity: 0; } .cky-modal-backdrop.cky-show { opacity: 1; display: block; } .cky-modal { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999; display: none; overflow: hidden; outline: 0; min-height: calc(100% - (.5rem * 2)); } .cky-modal.cky-show { display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; } .cky-modal a { text-decoration: none; } .cky-modal .cky-modal-dialog { position: relative; max-width: calc(100% - 16px); width: calc(100% - 16px); margin: .5rem; pointer-events: none; font-family: inherit; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; text-align: left; display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); -webkit-box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); } @media (min-width: 576px) { .cky-modal .cky-modal-dialog { max-width: 500px; width: 500px; margin: 1.75rem auto; } .cky-modal { min-height: calc(100% - (1.75rem * 2)); } } @media (min-width: 991px) { .cky-modal .cky-modal-dialog { max-width: 900px; width: 900px; } } .cky-modal-content { display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; width: 100%; pointer-events: auto; background-clip: padding-box; border: 0; border-radius: 4px; overflow: hidden; outline: 0; margin: 40px; } .cky-modal.cky-rtl { direction: rtl; text-align: right; } .ccpa.cky-modal .cky-modal-dialog { max-width: 300px; width: 300px; border-radius: 5px; } .ccpa.cky-modal .cky-modal-content { margin: 25px; text-align: center; font-weight: 600; } .ccpa.cky-modal .cky-opt-out-text { margin-bottom: 20px; } .cky-consent-bar.cky-box { padding: 30px; max-width: 476px; display: block; box-shadow: 0 -1px 10px 0 rgba(172, 171, 171, 0.3); } .cky-box .cky-button-wrapper { margin-top: 20px; } .cky-box .cky-category-direct { padding-top: 8px; margin-top: 8px; border-top: 0; } .cky-box .cky-category-direct +.cky-button-wrapper { margin-top: 10px; } @media (max-width: 991px) { .cky-consent-bar.cky-box { max-width: calc(100% - 40px); } } @media (max-width: 991px) { .cky-consent-bar.cky-box { padding: 15px; text-align: center; left: 0px !important; right: 0px !important; max-width: 100%; } .cky-consent-bar.cky-box.box-bottom-left, .cky-consent-bar.box-bottom-right { bottom: 0px !important; } .cky-consent-bar.cky-box.box-top-left, .cky-consent-bar.box-top-right { top: 0px !important; } .cky-box .cky-category-direct-item { margin-right: 25px; margin-bottom: 10px; } } .cky-modal .cky-row { margin: 0 -15px; } .cky-modal .cky-modal-close { z-index: 1; padding: 0; background-color: transparent; border: 0; -webkit-appearance: none; font-size: 12px; line-height: 1; color: #9a9a9a; cursor: pointer; min-height: auto; position: absolute; top: 14px; right: 18px; } .cky-modal .cky-close:focus { outline: 0; } .cky-modal.cky-rtl .cky-modal-close { left: 20px; right: 0; } .cky-modal.cky-rtl .cky-tab-item { border-right: none; border-left: 1px solid; } .cky-modal.cky-rtl .cky-tab-item.cky-tab-item-active { border-left: 0; } .cky-modal.cky-rtl .cky-switch { margin-left: 0; margin-right: 20px; } .cky-modal.cky-rtl .cky-modal-dialog { text-align: right; } .cky-fade { transition: opacity .15s linear; } .cky-tab { overflow: hidden; } .cky-tab-menu { text-align: center; } .cky-tab-content .cky-tab-content-item { width: 100%; } .cky-tab-item { padding: .5rem 2rem; text-align: left; } .cky-tab-content .cky-tab-desc { width: 100%; min-height: 225px; max-height: 300px; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } @media (max-width: 767px) { .cky-tab-content .cky-tab-desc { max-height: 225px; } } @media(max-width:475px) { .cky-modal-content { margin: 30px; } .cky-btn-custom-accept { margin: 1rem 0.2rem; padding: 0.5rem 0.3rem; } }",
          detailType: "popup",
      },
      tldomain: "jithinmozilor.github.io",
      behaviour: { reload: false, showLogo: true, acceptOnScroll: false, defaultConsent: false, showAuditTable: true, selectedLanguage: "en" },
      customCss:
          ".cky-consent-bar { top: 40%!important; bottom: auto !important; left: 50% !important; right: auto !important; transform: translate(-50%, -50%); } .cky-overlay { position:fixed; background: #000000; top:0; left: 0; width: 100%; height: 100%; z-index: 9996; opacity: 0.6; }",
      geoTarget: { gdpr: { eu: false } },
      consentType: "custom",
      selectedLaws: ["gdpr"],
      consentBarType: "box",
      showCategoryDirectly: false,
  },
  info: {
      categories: [
          {
              id: 38589,
              slug: "necessary",
              order: 1,
              name: { en: "Necessary", de: "Notwendige", fi: "V\u00e4ltt\u00e4m\u00e4t\u00f6n", sl: "Potrebno", "pt-br": "Necess\u00e1rio" },
              defaultConsent: 1,
              active: 1,
              settings: { ccpa: { doNotSell: false } },
              type: 1,
              description: {
                  en: "<p>Necessary cookies are crucial for the basic functions of the website and the website will not work in its intended way without them.These cookies do not store any personally identifiable data.</p>",
                  de:
                      "<p>Notwendige Cookies sind f\u00fcr die Grundfunktionen der Website von entscheidender Bedeutung. Ohne sie kann die Website nicht in der vorgesehenen Weise funktionieren.</p><p>Diese Cookies speichern keine personenbezogenen Daten.</p>",
                  fi:
                      "<p>Tarvittavat ev\u00e4steet ovat ratkaisevan t\u00e4rkeit\u00e4 verkkosivuston perustoiminnoille, eik\u00e4 verkkosivusto toimi tarkoitetulla tavalla ilman niit\u00e4.</p> <p>N\u00e4m\u00e4 ev\u00e4steet eiv\u00e4t tallenna henkil\u00f6kohtaisia tietoja.</p>",
                  sl:
                      "<p>Potrebni pi\u0161kotki so klju\u010dni za osnovne funkcije spletne strani in spletna stran brez njih ne bo delovala na svoj predviden na\u010din.</p> <p>Ti pi\u0161kotki ne shranjujejo nobenih osebnih podatkov, ki bi jih bilo mogo\u010de identificirati.</p>",
                  "pt-br":
                      "<p>Os cookies necess\u00e1rios s\u00e3o cruciais para as fun\u00e7\u00f5es b\u00e1sicas do site e o site n\u00e3o funcionar\u00e1 como pretendido sem eles.</p> <p>Esses cookies n\u00e3o armazenam nenhum dado pessoalmente identific\u00e1vel.</p>",
              },
              scripts: [
                  {
                      id: 16867,
                      name: { en: "Necessary", de: "Necessary", fr: "Necessary", it: "Necessary", es: "Necessary", nl: "Necessary", bg: "Necessary", ar: "Necessary" },
                      description: {
                          en: "These cookies help to perform the critical functions of the website.",
                          de: "These cookies help to perform the critical functions of the website.",
                          fr: "These cookies help to perform the critical functions of the website.",
                          it: "These cookies help to perform the critical functions of the website.",
                          es: "These cookies help to perform the critical functions of the website.",
                          nl: "These cookies help to perform the critical functions of the website.",
                          bg: "These cookies help to perform the critical functions of the website.",
                          ar: "These cookies help to perform the critical functions of the website.",
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
                      id: 49351,
                      cookie_id: "hs",
                      description: {
                          en: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          de: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          fr: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          it: "kjfodshk.cx,nl",
                          es: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          nl: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          bg: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          ar: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                      },
                      duration: "css",
                      type: "https",
                      domain: ".www.lg-elektrotechnik.de",
                  },
                  {
                      id: 49353,
                      cookie_id: "XSRF-TOKEN",
                      description: {
                          en: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          de: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          fr: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          it: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          es: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          nl: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          bg: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                          ar: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".www.lg-elektrotechnik.de",
                  },
                  {
                      id: 49405,
                      cookie_id: "__cfduid",
                      description: {
                          en:
                              "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                          de:
                              "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                          fr:
                              "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                          it:
                              "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                          es:
                              "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                          nl:
                              "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                          bg:
                              "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                          ar:
                              "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                      },
                      duration: "1 month",
                      type: "https",
                      domain: ".www.ishthehague.nl",
                  },
                  {
                      id: 49408,
                      cookie_id: "JSESSIONID",
                      description: {
                          en: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                          de: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                          fr: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                          it: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                          es: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                          nl: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                          bg: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                          ar: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "www.ishthehague.nl",
                  },
                  {
                      id: 49446,
                      cookie_id: "has_js",
                      description: {
                          en: "This cookie is used to indicate whether the user's browser has enabled JavaScript.",
                          de: "This cookie is used to indicate whether the user's browser has enabled JavaScript.",
                          fr: "This cookie is used to indicate whether the user's browser has enabled JavaScript.",
                          it: "This cookie is used to indicate whether the user's browser has enabled JavaScript.",
                          es: "This cookie is used to indicate whether the user's browser has enabled JavaScript.",
                          nl: "This cookie is used to indicate whether the user's browser has enabled JavaScript.",
                          bg: "This cookie is used to indicate whether the user's browser has enabled JavaScript.",
                          ar: "This cookie is used to indicate whether the user's browser has enabled JavaScript.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: "www.israelhayom.co.il",
                  },
                  {
                      id: 49479,
                      cookie_id: "SERVERID",
                      description: {
                          en:
                              "This cookie is used to assign the user to a specific server, thus to provide a improved and faster server time. It remembers which server had delivered the last page on to the browser. It also helps in load balancing.",
                          de:
                              "This cookie is used to assign the user to a specific server, thus to provide a improved and faster server time. It remembers which server had delivered the last page on to the browser. It also helps in load balancing.",
                          fr:
                              "This cookie is used to assign the user to a specific server, thus to provide a improved and faster server time. It remembers which server had delivered the last page on to the browser. It also helps in load balancing.",
                          it:
                              "This cookie is used to assign the user to a specific server, thus to provide a improved and faster server time. It remembers which server had delivered the last page on to the browser. It also helps in load balancing.",
                          es:
                              "This cookie is used to assign the user to a specific server, thus to provide a improved and faster server time. It remembers which server had delivered the last page on to the browser. It also helps in load balancing.",
                          nl:
                              "This cookie is used to assign the user to a specific server, thus to provide a improved and faster server time. It remembers which server had delivered the last page on to the browser. It also helps in load balancing.",
                          bg:
                              "This cookie is used to assign the user to a specific server, thus to provide a improved and faster server time. It remembers which server had delivered the last page on to the browser. It also helps in load balancing.",
                          ar:
                              "This cookie is used to assign the user to a specific server, thus to provide a improved and faster server time. It remembers which server had delivered the last page on to the browser. It also helps in load balancing.",
                      },
                      duration: "10 minutes",
                      type: "http",
                      domain: ".eyeota.net",
                  },
                  {
                      id: 49487,
                      cookie_id: "ts",
                      description: {
                          en: "This cookie is provided by the PayPal. It is used to support payment service in a website.",
                          de: "This cookie is provided by the PayPal. It is used to support payment service in a website.",
                          fr: "This cookie is provided by the PayPal. It is used to support payment service in a website.",
                          it: "This cookie is provided by the PayPal. It is used to support payment service in a website.",
                          es: "This cookie is provided by the PayPal. It is used to support payment service in a website.",
                          nl: "This cookie is provided by the PayPal. It is used to support payment service in a website.",
                          bg: "This cookie is provided by the PayPal. It is used to support payment service in a website.",
                          ar: "This cookie is provided by the PayPal. It is used to support payment service in a website.",
                      },
                      duration: "1 year",
                      type: "https",
                      domain: ".creativecdn.com",
                  },
                  {
                      id: 49518,
                      cookie_id: "ARRAffinity",
                      description: {
                          en: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                          de: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                          fr: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                          it: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                          es: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                          nl: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                          bg: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                          ar: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: ".ads4.admatic.com.tr",
                  },
                  {
                      id: 49524,
                      cookie_id: "csrftoken",
                      description: {
                          en: "This cookie is associated with Django web development platform for python. Used to help protect the website against Cross-Site Request Forgery attacks",
                          de: "This cookie is associated with Django web development platform for python. Used to help protect the website against Cross-Site Request Forgery attacks",
                          fr: "This cookie is associated with Django web development platform for python. Used to help protect the website against Cross-Site Request Forgery attacks",
                          it: "This cookie is associated with Django web development platform for python. Used to help protect the website against Cross-Site Request Forgery attacks",
                          es: "This cookie is associated with Django web development platform for python. Used to help protect the website against Cross-Site Request Forgery attacks",
                          nl: "This cookie is associated with Django web development platform for python. Used to help protect the website against Cross-Site Request Forgery attacks",
                          bg: "This cookie is associated with Django web development platform for python. Used to help protect the website against Cross-Site Request Forgery attacks",
                          ar: "This cookie is associated with Django web development platform for python. Used to help protect the website against Cross-Site Request Forgery attacks",
                      },
                      duration: "11 months",
                      type: "http",
                      domain: ".instagram.com",
                  },
                  {
                      id: 49526,
                      cookie_id: "ASP.NET_SessionId",
                      description: {
                          en:
                              "This cookie is used in sites developed with Microsoft.Net. When a user start browsing a unique session ID is created, which keeps track of all the information regarding that session.This information is stored in the web server and it is identified via a GUID.The GUID is essential for any ASP.NET site to function properly.",
                          de:
                              "This cookie is used in sites developed with Microsoft.Net. When a user start browsing a unique session ID is created, which keeps track of all the information regarding that session.This information is stored in the web server and it is identified via a GUID.The GUID is essential for any ASP.NET site to function properly.",
                          fr:
                              "This cookie is used in sites developed with Microsoft.Net. When a user start browsing a unique session ID is created, which keeps track of all the information regarding that session.This information is stored in the web server and it is identified via a GUID.The GUID is essential for any ASP.NET site to function properly.",
                          it:
                              "This cookie is used in sites developed with Microsoft.Net. When a user start browsing a unique session ID is created, which keeps track of all the information regarding that session.This information is stored in the web server and it is identified via a GUID.The GUID is essential for any ASP.NET site to function properly.",
                          es:
                              "This cookie is used in sites developed with Microsoft.Net. When a user start browsing a unique session ID is created, which keeps track of all the information regarding that session.This information is stored in the web server and it is identified via a GUID.The GUID is essential for any ASP.NET site to function properly.",
                          nl:
                              "This cookie is used in sites developed with Microsoft.Net. When a user start browsing a unique session ID is created, which keeps track of all the information regarding that session.This information is stored in the web server and it is identified via a GUID.The GUID is essential for any ASP.NET site to function properly.",
                          bg:
                              "This cookie is used in sites developed with Microsoft.Net. When a user start browsing a unique session ID is created, which keeps track of all the information regarding that session.This information is stored in the web server and it is identified via a GUID.The GUID is essential for any ASP.NET site to function properly.",
                          ar:
                              "This cookie is used in sites developed with Microsoft.Net. When a user start browsing a unique session ID is created, which keeps track of all the information regarding that session.This information is stored in the web server and it is identified via a GUID.The GUID is essential for any ASP.NET site to function properly.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "lb.advsnx.net",
                  },
                  {
                      id: 49550,
                      cookie_id: "opt_out",
                      description: {
                          en: "This cookie is used for preventing the installation of third party advertiser or other cookies on the browser.",
                          de: "This cookie is used for preventing the installation of third party advertiser or other cookies on the browser.",
                          fr: "This cookie is used for preventing the installation of third party advertiser or other cookies on the browser.",
                          it: "This cookie is used for preventing the installation of third party advertiser or other cookies on the browser.",
                          es: "This cookie is used for preventing the installation of third party advertiser or other cookies on the browser.",
                          nl: "This cookie is used for preventing the installation of third party advertiser or other cookies on the browser.",
                          bg: "This cookie is used for preventing the installation of third party advertiser or other cookies on the browser.",
                          ar: "This cookie is used for preventing the installation of third party advertiser or other cookies on the browser.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".postrelease.com",
                  },
                  {
                      id: 49823,
                      cookie_id: "cookieyesID",
                      description: {
                          en: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                          de: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                          fr: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                          it: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                          es: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                          nl: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                          bg: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                          ar: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 49824,
                      cookie_id: "cky-consent",
                      description: {
                          en: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                          de: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                          fr: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                          it: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                          es: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                          nl: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                          bg: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                          ar: "The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 49825,
                      cookie_id: "cookieyes-necessary",
                      description: {
                          en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Necessary" category.',
                          de: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Necessary" category.',
                          fr: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Necessary" category.',
                          it: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Necessary" category.',
                          es: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Necessary" category.',
                          nl: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Necessary" category.',
                          bg: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Necessary" category.',
                          ar: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Necessary" category.',
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 49826,
                      cookie_id: "cookieyes-functional",
                      description: {
                          en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Functional" category.',
                          de: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Functional" category.',
                          fr: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Functional" category.',
                          it: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Functional" category.',
                          es: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Functional" category.',
                          nl: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Functional" category.',
                          bg: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Functional" category.',
                          ar: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Functional" category.',
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 49827,
                      cookie_id: "cookieyes-analytics",
                      description: {
                          en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Analytics" category.',
                          de: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Analytics" category.',
                          fr: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Analytics" category.',
                          it: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Analytics" category.',
                          es: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Analytics" category.',
                          nl: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Analytics" category.',
                          bg: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Analytics" category.',
                          ar: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Analytics" category.',
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 49828,
                      cookie_id: "cookieyes-performance",
                      description: {
                          en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Performance" category.',
                          de: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Performance" category.',
                          fr: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Performance" category.',
                          it: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Performance" category.',
                          es: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Performance" category.',
                          nl: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Performance" category.',
                          bg: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Performance" category.',
                          ar: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Performance" category.',
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 49829,
                      cookie_id: "cookieyes-advertisement",
                      description: {
                          en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Advertisement" category.',
                          de: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Advertisement" category.',
                          fr: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Advertisement" category.',
                          it: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Advertisement" category.',
                          es: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Advertisement" category.',
                          nl: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Advertisement" category.',
                          bg: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Advertisement" category.',
                          ar: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the "Advertisement" category.',
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 49830,
                      cookie_id: "cookieyes-other",
                      description: {
                          en: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as "Other".',
                          de: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as "Other".',
                          fr: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as "Other".',
                          it: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as "Other".',
                          es: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as "Other".',
                          nl: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as "Other".',
                          bg: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as "Other".',
                          ar: 'This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as "Other".',
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 50143,
                      cookie_id: "PHPSESSID",
                      description: {
                          en:
                              "This cookie is native to PHP applications. The cookie is used to store and identify a users' unique session ID for the purpose of managing user session on the website. The cookie is a session cookies and is deleted when all the browser windows are closed.",
                          de:
                              "This cookie is native to PHP applications. The cookie is used to store and identify a users' unique session ID for the purpose of managing user session on the website. The cookie is a session cookies and is deleted when all the browser windows are closed.",
                          fr:
                              "This cookie is native to PHP applications. The cookie is used to store and identify a users' unique session ID for the purpose of managing user session on the website. The cookie is a session cookies and is deleted when all the browser windows are closed.",
                          it:
                              "This cookie is native to PHP applications. The cookie is used to store and identify a users' unique session ID for the purpose of managing user session on the website. The cookie is a session cookies and is deleted when all the browser windows are closed.",
                          es:
                              "This cookie is native to PHP applications. The cookie is used to store and identify a users' unique session ID for the purpose of managing user session on the website. The cookie is a session cookies and is deleted when all the browser windows are closed.",
                          nl:
                              "This cookie is native to PHP applications. The cookie is used to store and identify a users' unique session ID for the purpose of managing user session on the website. The cookie is a session cookies and is deleted when all the browser windows are closed.",
                          bg:
                              "This cookie is native to PHP applications. The cookie is used to store and identify a users' unique session ID for the purpose of managing user session on the website. The cookie is a session cookies and is deleted when all the browser windows are closed.",
                          ar:
                              "This cookie is native to PHP applications. The cookie is used to store and identify a users' unique session ID for the purpose of managing user session on the website. The cookie is a session cookies and is deleted when all the browser windows are closed.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 54953,
                      cookie_id: "_orig_referrer",
                      description: {
                          en: "This cookie is set by website built on Shopify platform and is used in assoication with shopping cart.",
                          de: "This cookie is set by website built on Shopify platform and is used in assoication with shopping cart.",
                          fr: "This cookie is set by website built on Shopify platform and is used in assoication with shopping cart.",
                          it: "This cookie is set by website built on Shopify platform and is used in assoication with shopping cart.",
                          es: "This cookie is set by website built on Shopify platform and is used in assoication with shopping cart.",
                          nl: "This cookie is set by website built on Shopify platform and is used in assoication with shopping cart.",
                          bg: "This cookie is set by website built on Shopify platform and is used in assoication with shopping cart.",
                          ar: "This cookie is set by website built on Shopify platform and is used in assoication with shopping cart.",
                      },
                      duration: "2 weeks",
                      type: "https",
                      domain: ".my-workplaces.myshopify.com",
                  },
                  {
                      id: 54958,
                      cookie_id: "secure_customer_sig",
                      description: {
                          en: "This cookies is set by websites built on Shopify platform and is used in connection with customer login.",
                          de: "This cookies is set by websites built on Shopify platform and is used in connection with customer login.",
                          fr: "This cookies is set by websites built on Shopify platform and is used in connection with customer login.",
                          it: "This cookies is set by websites built on Shopify platform and is used in connection with customer login.",
                          es: "This cookies is set by websites built on Shopify platform and is used in connection with customer login.",
                          nl: "This cookies is set by websites built on Shopify platform and is used in connection with customer login.",
                          bg: "This cookies is set by websites built on Shopify platform and is used in connection with customer login.",
                          ar: "This cookies is set by websites built on Shopify platform and is used in connection with customer login.",
                      },
                      duration: "20 years",
                      type: "https",
                      domain: "my-workplaces.myshopify.com",
                  },
                  {
                      id: 61499,
                      cookie_id: "laravel_session",
                      description: {
                          en: "laravel uses laravel_session to identify a session instance for a user, this can be changed",
                          de: "laravel uses laravel_session to identify a session instance for a user, this can be changed",
                          fr: "laravel uses laravel_session to identify a session instance for a user, this can be changed",
                          it: "laravel uses laravel_session to identify a session instance for a user, this can be changed",
                          es: "laravel uses laravel_session to identify a session instance for a user, this can be changed",
                          nl: "laravel uses laravel_session to identify a session instance for a user, this can be changed",
                          bg: "laravel uses laravel_session to identify a session instance for a user, this can be changed",
                          ar: "laravel uses laravel_session to identify a session instance for a user, this can be changed",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "assets.bnidx.com",
                  },
                  {
                      id: 66306,
                      cookie_id: "ts_c",
                      description: {
                          en: "This cookie is provided by PayPal when a website is in association with PayPal payment function. This cookie is used to make safe payment through PayPal.",
                          de: "This cookie is provided by PayPal when a website is in association with PayPal payment function. This cookie is used to make safe payment through PayPal.",
                          fr: "This cookie is provided by PayPal when a website is in association with PayPal payment function. This cookie is used to make safe payment through PayPal.",
                          it: "This cookie is provided by PayPal when a website is in association with PayPal payment function. This cookie is used to make safe payment through PayPal.",
                          es: "This cookie is provided by PayPal when a website is in association with PayPal payment function. This cookie is used to make safe payment through PayPal.",
                          nl: "This cookie is provided by PayPal when a website is in association with PayPal payment function. This cookie is used to make safe payment through PayPal.",
                          bg: "This cookie is provided by PayPal when a website is in association with PayPal payment function. This cookie is used to make safe payment through PayPal.",
                          ar: "This cookie is provided by PayPal when a website is in association with PayPal payment function. This cookie is used to make safe payment through PayPal.",
                      },
                      duration: "1 years  20 days  18 hours  2 minutes",
                      type: "https",
                      domain: ".paypal.com",
                  },
                  {
                      id: 86304,
                      cookie_id: "cookielawinfo-checkbox-necessary",
                      description: {
                          en: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category 'Necessary'.",
                          de: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category 'Necessary'.",
                          fr: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category 'Necessary'.",
                          it: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category 'Necessary'.",
                          es: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category 'Necessary'.",
                          nl: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category 'Necessary'.",
                          bg: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category 'Necessary'.",
                          ar: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category 'Necessary'.",
                      },
                      duration: "11 months 29 days 23 hours 59 minutes",
                      type: "https",
                      domain: "www.bottegacivica.it",
                  },
                  {
                      id: 86305,
                      cookie_id: "cookielawinfo-checkbox-advertisement",
                      description: {
                          en: "The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category 'Advertisement'.",
                          de: "The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category 'Advertisement'.",
                          fr: "The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category 'Advertisement'.",
                          it: "The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category 'Advertisement'.",
                          es: "The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category 'Advertisement'.",
                          nl: "The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category 'Advertisement'.",
                          bg: "The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category 'Advertisement'.",
                          ar: "The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category 'Advertisement'.",
                      },
                      duration: "11 months 29 days 23 hours 59 minutes",
                      type: "https",
                      domain: "www.bottegacivica.it",
                  },
                  {
                      id: 86306,
                      cookie_id: "cookielawinfo-checkbox-performance",
                      description: {
                          en: "This cookie is used to keep track of which cookies the user have approved for this site.",
                          de: "This cookie is used to keep track of which cookies the user have approved for this site.",
                          fr: "This cookie is used to keep track of which cookies the user have approved for this site.",
                          it: "This cookie is used to keep track of which cookies the user have approved for this site.",
                          es: "This cookie is used to keep track of which cookies the user have approved for this site.",
                          nl: "This cookie is used to keep track of which cookies the user have approved for this site.",
                          bg: "This cookie is used to keep track of which cookies the user have approved for this site.",
                          ar: "This cookie is used to keep track of which cookies the user have approved for this site.",
                      },
                      duration: "11 months 29 days 23 hours 59 minutes",
                      type: "https",
                      domain: "www.bottegacivica.it",
                  },
                  {
                      id: 86307,
                      cookie_id: "cookielawinfo-checkbox-analytics",
                      description: {
                          en: "This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category 'Analytics'.",
                          de: "This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category 'Analytics'.",
                          fr: "This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category 'Analytics'.",
                          it: "This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category 'Analytics'.",
                          es: "This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category 'Analytics'.",
                          nl: "This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category 'Analytics'.",
                          bg: "This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category 'Analytics'.",
                          ar: "This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category 'Analytics'.",
                      },
                      duration: "11 months 29 days 23 hours 59 minutes",
                      type: "https",
                      domain: "www.bottegacivica.it",
                  },
                  {
                      id: 86308,
                      cookie_id: "wordpress_test_cookie",
                      description: {
                          en: "This cookie is used to check if the cookies are enabled on the users' browser.",
                          de: "This cookie is used to check if the cookies are enabled on the users' browser.",
                          fr: "This cookie is used to check if the cookies are enabled on the users' browser.",
                          it: "This cookie is used to check if the cookies are enabled on the users' browser.",
                          es: "This cookie is used to check if the cookies are enabled on the users' browser.",
                          nl: "This cookie is used to check if the cookies are enabled on the users' browser.",
                          bg: "This cookie is used to check if the cookies are enabled on the users' browser.",
                          ar: "This cookie is used to check if the cookies are enabled on the users' browser.",
                      },
                      duration: "session",
                      type: "https",
                      domain: "www.bottegacivica.it",
                  },
                  {
                      id: 277994,
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
                          se: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          cr: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          zh: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          uk: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          sk: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          ts: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          lt: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          cs: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          fi: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          no: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          br: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                          sl: "The cookie is set by CookieYes to check if the consent banner is active on the website.",
                      },
                      duration: "1 day",
                      type: "https",
                      domain: "djangotest.weebly.com",
                  },
              ],
          },
          {
              id: 38590,
              slug: "functional",
              order: 2,
              name: { en: "Functional", de: "Funktionale", fi: "Toimiva", sl: "Funkcionalno", "pt-br": "Funcional" },
              defaultConsent: 1,
              active: 1,
              settings: { ccpa: { doNotSell: "1" } },
              type: 2,
              description: {
                  en:
                      "<p>Functional cookies help to perform certain functionalities like sharing the content of the website on social media platforms, collect feedbacks, and other third-party features.</p>\n\nFor better user experience youtube-nocookie saves data via local storage. Once you accept the functional category the consent is applicable to local storeage data as well.",
                  de:
                      "<p>Funktionale Cookies unterst\u00fctzen bei der Ausf\u00fchrung bestimmter Funktionen, z. B. beim Teilen des Inhalts der Website auf Social Media-Plattformen, beim Sammeln von Feedbacks und anderen Funktionen von Drittanbietern.</p>",
                  fi:
                      "<p>Toiminnalliset ev\u00e4steet auttavat suorittamaan tiettyj\u00e4 toimintoja, kuten verkkosivuston sis\u00e4ll\u00f6n jakamista sosiaalisen median alustoilla, palautteiden ker\u00e4\u00e4mist\u00e4 ja muita kolmannen osapuolen ominaisuuksia.</p>",
                  sl:
                      "<p>Funkcionalni pi\u0161kotki pomagajo izvajati dolo\u010dene funkcionalnosti, kot so skupna raba vsebine spletnega mesta na platformah dru\u017ebenih medijev, zbiranje povratnih informacij in druge funkcije tretjih oseb.</p>",
                  "pt-br": "<p>Cookies funcionais ajudam a executar certas funcionalidades, como compartilhar o conte\u00fado do site em plataformas de m\u00eddia social, coletar feedbacks e outros recursos de terceiros.</p>",
              },
              scripts: [
                  {
                      id: 16935,
                      name: { en: "Instagram", de: "Instagram", fr: "Instagram", it: "Instagram", es: "Instagram", nl: "Instagram", bg: "Instagram", ar: "Instagram" },
                      description: {
                          en: "Instagram installs cookies where its content are embedded, or buttons to share to the social media are included.",
                          de: "Instagram installs cookies where its content are embedded, or buttons to share to the social media are included.",
                          fr: "Instagram installs cookies where its content are embedded, or buttons to share to the social media are included.",
                          it: "Instagram installs cookies where its content are embedded, or buttons to share to the social media are included.",
                          es: "Instagram installs cookies where its content are embedded, or buttons to share to the social media are included.",
                          nl: "Instagram installs cookies where its content are embedded, or buttons to share to the social media are included.",
                          bg: "Instagram installs cookies where its content are embedded, or buttons to share to the social media are included.",
                          ar: "Instagram installs cookies where its content are embedded, or buttons to share to the social media are included.",
                      },
                      cookie_ids: "mid, rur, urlgen",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
              ],
              cookies: [
                  {
                      id: 45965,
                      cookie_id: "language",
                      description: {
                          en: "This cookie is used to store the language preference of the user.",
                          de: "This cookie is used to store the language preference of the user.",
                          fr: "This cookie is used to store the language preference of the user.",
                          it: "This cookie is used to store the language preference of the user.",
                          es: "This cookie is used to store the language preference of the user.",
                          nl: "This cookie is used to store the language preference of the user.",
                          bg: "This cookie is used to store the language preference of the user.",
                          ar: "This cookie is used to store the language preference of the user.",
                      },
                      duration: "2 weeks",
                      type: "http",
                      domain: "djangotest.weebly.com",
                  },
                  {
                      id: 49419,
                      cookie_id: "lang",
                      description: {
                          en: "This cookie is used to store the language preferences of a user to serve up content in that stored language the next time user visit the website.",
                          de: "This cookie is used to store the language preferences of a user to serve up content in that stored language the next time user visit the website.",
                          fr: "This cookie is used to store the language preferences of a user to serve up content in that stored language the next time user visit the website.",
                          it: "This cookie is used to store the language preferences of a user to serve up content in that stored language the next time user visit the website.",
                          es: "This cookie is used to store the language preferences of a user to serve up content in that stored language the next time user visit the website.",
                          nl: "This cookie is used to store the language preferences of a user to serve up content in that stored language the next time user visit the website.",
                          bg: "This cookie is used to store the language preferences of a user to serve up content in that stored language the next time user visit the website.",
                          ar: "This cookie is used to store the language preferences of a user to serve up content in that stored language the next time user visit the website.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: "cdn.syndication.twimg.com",
                  },
                  {
                      id: 49525,
                      cookie_id: "mid",
                      description: {
                          en: "The cookie is set by Instagram. The cookie is used to distinguish users and to show relevant content, for better user experience and security.",
                          de: "The cookie is set by Instagram. The cookie is used to distinguish users and to show relevant content, for better user experience and security.",
                          fr: "The cookie is set by Instagram. The cookie is used to distinguish users and to show relevant content, for better user experience and security.",
                          it: "The cookie is set by Instagram. The cookie is used to distinguish users and to show relevant content, for better user experience and security.",
                          es: "The cookie is set by Instagram. The cookie is used to distinguish users and to show relevant content, for better user experience and security.",
                          nl: "The cookie is set by Instagram. The cookie is used to distinguish users and to show relevant content, for better user experience and security.",
                          bg: "The cookie is set by Instagram. The cookie is used to distinguish users and to show relevant content, for better user experience and security.",
                          ar: "The cookie is set by Instagram. The cookie is used to distinguish users and to show relevant content, for better user experience and security.",
                      },
                      duration: "9 years",
                      type: "http",
                      domain: ".instagram.com",
                  },
                  {
                      id: 60878,
                      cookie_id: "__sharethis_cookie_test__",
                      description: {
                          en: "This cookie is set by ShareThis, to test whether the browser accepts cookies.",
                          de: "This cookie is set by ShareThis, to test whether the browser accepts cookies.",
                          fr: "This cookie is set by ShareThis, to test whether the browser accepts cookies.",
                          it: "This cookie is set by ShareThis, to test whether the browser accepts cookies.",
                          es: "This cookie is set by ShareThis, to test whether the browser accepts cookies.",
                          nl: "This cookie is set by ShareThis, to test whether the browser accepts cookies.",
                          bg: "This cookie is set by ShareThis, to test whether the browser accepts cookies.",
                          ar: "This cookie is set by ShareThis, to test whether the browser accepts cookies.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 61536,
                      cookie_id: "__livechat",
                      description: {
                          en: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                          de: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                          fr: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                          it: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                          es: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                          nl: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                          bg: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                          ar: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                      },
                      duration: "3 years",
                      type: "https",
                      domain: "livechatinc.com",
                  },
                  {
                      id: 61537,
                      cookie_id: "CASID",
                      description: {
                          en: "This cookie is used to recognise the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          de: "This cookie is used to recognise the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          fr: "This cookie is used to recognise the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          it: "This cookie is used to recognise the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          es: "This cookie is used to recognise the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          nl: "This cookie is used to recognise the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          bg: "This cookie is used to recognise the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          ar: "This cookie is used to recognise the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "",
                  },
                  {
                      id: 61538,
                      cookie_id: "__lc_cid",
                      description: {
                          en: "This is an essential cookie for the website live chat box to function properly.",
                          de: "This is an essential cookie for the website live chat box to function properly.",
                          fr: "This is an essential cookie for the website live chat box to function properly.",
                          it: "This is an essential cookie for the website live chat box to function properly.",
                          es: "This is an essential cookie for the website live chat box to function properly.",
                          nl: "This is an essential cookie for the website live chat box to function properly.",
                          bg: "This is an essential cookie for the website live chat box to function properly.",
                          ar: "This is an essential cookie for the website live chat box to function properly.",
                      },
                      duration: "1 years  20 days  17 hours  39 minutes",
                      type: "https",
                      domain: ".accounts.livechatinc.com",
                  },
                  {
                      id: 61539,
                      cookie_id: "__lc_cst",
                      description: {
                          en: "This cookie is used for the website live chat box to function properly.",
                          de: "This cookie is used for the website live chat box to function properly.",
                          fr: "This cookie is used for the website live chat box to function properly.",
                          it: "This cookie is used for the website live chat box to function properly.",
                          es: "This cookie is used for the website live chat box to function properly.",
                          nl: "This cookie is used for the website live chat box to function properly.",
                          bg: "This cookie is used for the website live chat box to function properly.",
                          ar: "This cookie is used for the website live chat box to function properly.",
                      },
                      duration: "1 years  20 days  17 hours  39 minutes",
                      type: "https",
                      domain: ".accounts.livechatinc.com",
                  },
                  {
                      id: 61540,
                      cookie_id: "__lc2_cid",
                      description: {
                          en: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                          de: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                          fr: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                          it: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                          es: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                          nl: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                          bg: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                          ar: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                      },
                      duration: "1 years  20 days  17 hours  39 minutes",
                      type: "https",
                      domain: ".accounts.livechatinc.com",
                  },
                  {
                      id: 61541,
                      cookie_id: "__lc2_cst",
                      description: {
                          en:
                              "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                          de:
                              "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                          fr:
                              "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                          it:
                              "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                          es:
                              "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                          nl:
                              "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                          bg:
                              "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                          ar:
                              "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                      },
                      duration: "1 years  20 days  17 hours  39 minutes",
                      type: "https",
                      domain: ".accounts.livechatinc.com",
                  },
                  {
                      id: 61542,
                      cookie_id: "__oauth_redirect_detector",
                      description: {
                          en: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          de: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          fr: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          it: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          es: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          nl: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          bg: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                          ar: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                      },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "accounts.livechatinc.com",
                  },
              ],
          },
          {
              id: 38591,
              slug: "analytics",
              order: 3,
              name: { en: "performance", de: "Analyse", fi: "Analytics", sl: "Analytics", "pt-br": "Anal\u00edticos" },
              defaultConsent: 1,
              active: 1,
              settings: { ccpa: { doNotSell: "1" } },
              type: 2,
              description: {
                  en: "<p>Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.</p>",
                  de: "<p>Analyse-Cookies werden verwendet um zu verstehen, wie Besucher mit der Website interagieren. Diese Cookies dienen zu Aussagen \u00fcber die Anzahl der Besucher, Absprungrate, Herkunft der Besucher usw.</p>",
                  fi:
                      "<p>Analyyttisi\u00e4 ev\u00e4steit\u00e4 k\u00e4ytet\u00e4\u00e4n ymm\u00e4rt\u00e4m\u00e4\u00e4n, miten k\u00e4vij\u00e4t ovat vuorovaikutuksessa verkkosivuston kanssa. N\u00e4m\u00e4 ev\u00e4steet auttavat tarjoamaan tietoa k\u00e4vij\u00f6iden lukum\u00e4\u00e4r\u00e4st\u00e4, poistumisprosentista, liikenteen l\u00e4hteest\u00e4 jne.</p>",
                  sl:
                      "<p>Analiti\u010dni pi\u0161kotki se uporabljajo za razumevanje interakcije obiskovalcev s spletno stranjo. Ti pi\u0161kotki pomagajo zagotoviti informacije o meritvi \u0161tevilo obiskovalcev, hitrost odskoka, prometni vir itd.</p>",
                  "pt-br":
                      "<p>Cookies anal\u00edticos s\u00e3o usados para entender como os visitantes interagem com o site. Esses cookies ajudam a fornecer informa\u00e7\u00f5es sobre m\u00e9tricas o n\u00famero de visitantes, taxa de rejei\u00e7\u00e3o, fonte de tr\u00e1fego, etc.</p>",
              },
              scripts: [
                  {
                      id: 16868,
                      name: { en: "Wix", de: "Wix", fr: "Wix", it: "Wix", es: "Wix", nl: "Wix", bg: "Wix", ar: "Wix" },
                      description: {
                          en: "Wix is platform that allows you create and host websites.",
                          de: "Wix is platform that allows you create and host websites.",
                          fr: "Wix is platform that allows you create and host websites.",
                          it: "Wix is platform that allows you create and host websites.",
                          es: "Wix is platform that allows you create and host websites.",
                          nl: "Wix is platform that allows you create and host websites.",
                          bg: "Wix is platform that allows you create and host websites.",
                          ar: "Wix is platform that allows you create and host websites.",
                      },
                      cookie_ids: "svSession, requestId",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16894,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          de: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          fr: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          it: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          es: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          nl: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          bg: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          ar: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                      },
                      cookie_ids: "_ga, _gid",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16909,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "__gads",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16911,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_cb_ls",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16912,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_cb",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16913,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_chartbeat2",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16914,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_cb_svref",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16920,
                      name: { en: "Demdex", de: "Demdex", fr: "Demdex", it: "Demdex", es: "Demdex", nl: "Demdex", bg: "Demdex", ar: "Demdex" },
                      description: {
                          en: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          de: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          fr: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          it: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          es: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          nl: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          bg: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          ar: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                      },
                      cookie_ids: "demdex",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16921,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "UserID1",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16932,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "eud",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 17104,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_gcl_au",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 18637,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_y",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 18638,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_shopify_fs",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 18639,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_landing_page",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 18640,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_shopify_s",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 18641,
                      name: { en: "Hojar", de: "Hojar", fr: "Hojar", it: "Hojar", es: "Hojar", nl: "Hojar", bg: "Hojar", ar: "Hojar" },
                      description: {
                          en: "Hotjar helps to - See how visitors are really using your website, collect user feedback and turn more visitors into customers.",
                          de: "Hotjar helps to - See how visitors are really using your website, collect user feedback and turn more visitors into customers.",
                          fr: "Hotjar helps to - See how visitors are really using your website, collect user feedback and turn more visitors into customers.",
                          it: "Hotjar helps to - See how visitors are really using your website, collect user feedback and turn more visitors into customers.",
                          es: "Hotjar helps to - See how visitors are really using your website, collect user feedback and turn more visitors into customers.",
                          nl: "Hotjar helps to - See how visitors are really using your website, collect user feedback and turn more visitors into customers.",
                          bg: "Hotjar helps to - See how visitors are really using your website, collect user feedback and turn more visitors into customers.",
                          ar: "Hotjar helps to - See how visitors are really using your website, collect user feedback and turn more visitors into customers.",
                      },
                      cookie_ids: "_hjIncludedInSample",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 18642,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", ar: "Google Analytics" },
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      cookie_ids: "_shopify_y",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 20456,
                      name: { en: "YouTube", de: "YouTube", fr: "YouTube", it: "YouTube", es: "YouTube", nl: "YouTube", bg: "YouTube", ar: "YouTube" },
                      description: {
                          en: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.",
                          de: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.",
                          fr: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.",
                          it: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.",
                          es: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.",
                          nl: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.",
                          bg: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.",
                          ar: "Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.",
                      },
                      cookie_ids: "GPS",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
              ],
              cookies: [
                  {
                      id: 49352,
                      cookie_id: "svSession",
                      description: {
                          en: "This cookie is placed by Wix website building platform on the Wix websites. The cookie is a persistent cookie and identifies unique visitors and tracks visitors session on the website.",
                          de: "This cookie is placed by Wix website building platform on the Wix websites. The cookie is a persistent cookie and identifies unique visitors and tracks visitors session on the website.",
                          fr: "This cookie is placed by Wix website building platform on the Wix websites. The cookie is a persistent cookie and identifies unique visitors and tracks visitors session on the website.",
                          it: "This cookie is placed by Wix website building platform on the Wix websites. The cookie is a persistent cookie and identifies unique visitors and tracks visitors session on the website.",
                          es: "This cookie is placed by Wix website building platform on the Wix websites. The cookie is a persistent cookie and identifies unique visitors and tracks visitors session on the website.",
                          nl: "This cookie is placed by Wix website building platform on the Wix websites. The cookie is a persistent cookie and identifies unique visitors and tracks visitors session on the website.",
                          bg: "This cookie is placed by Wix website building platform on the Wix websites. The cookie is a persistent cookie and identifies unique visitors and tracks visitors session on the website.",
                          ar: "This cookie is placed by Wix website building platform on the Wix websites. The cookie is a persistent cookie and identifies unique visitors and tracks visitors session on the website.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".www.lg-elektrotechnik.de",
                  },
                  {
                      id: 49420,
                      cookie_id: "_ga",
                      description: {
                          en:
                              "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
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
                          ar:
                              "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".ishthehague.nl",
                  },
                  {
                      id: 49421,
                      cookie_id: "_gid",
                      description: {
                          en:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the wbsite is doing. The data collected including the number visitors, the source where they have come from, and the pages viisted in an anonymous form.",
                          de:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the wbsite is doing. The data collected including the number visitors, the source where they have come from, and the pages viisted in an anonymous form.",
                          fr:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the wbsite is doing. The data collected including the number visitors, the source where they have come from, and the pages viisted in an anonymous form.",
                          it:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the wbsite is doing. The data collected including the number visitors, the source where they have come from, and the pages viisted in an anonymous form.",
                          es:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the wbsite is doing. The data collected including the number visitors, the source where they have come from, and the pages viisted in an anonymous form.",
                          nl:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the wbsite is doing. The data collected including the number visitors, the source where they have come from, and the pages viisted in an anonymous form.",
                          bg:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the wbsite is doing. The data collected including the number visitors, the source where they have come from, and the pages viisted in an anonymous form.",
                          ar:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the wbsite is doing. The data collected including the number visitors, the source where they have come from, and the pages viisted in an anonymous form.",
                      },
                      duration: "1 day",
                      type: "http",
                      domain: ".ishthehague.nl",
                  },
                  {
                      id: 49450,
                      cookie_id: "__gads",
                      description: {
                          en:
                              "This cookie is set by Google and stored under the name dounleclick.com. This cookie is used to track how many times users see a particular advert which helps in measuring the success of the campaign and calculate the revenue generated by the campaign. These cookies can only be read from the domain that it is set on so it will not track any data while browsing through another sites.",
                          de:
                              "This cookie is set by Google and stored under the name dounleclick.com. This cookie is used to track how many times users see a particular advert which helps in measuring the success of the campaign and calculate the revenue generated by the campaign. These cookies can only be read from the domain that it is set on so it will not track any data while browsing through another sites.",
                          fr:
                              "This cookie is set by Google and stored under the name dounleclick.com. This cookie is used to track how many times users see a particular advert which helps in measuring the success of the campaign and calculate the revenue generated by the campaign. These cookies can only be read from the domain that it is set on so it will not track any data while browsing through another sites.",
                          it:
                              "This cookie is set by Google and stored under the name dounleclick.com. This cookie is used to track how many times users see a particular advert which helps in measuring the success of the campaign and calculate the revenue generated by the campaign. These cookies can only be read from the domain that it is set on so it will not track any data while browsing through another sites.",
                          es:
                              "This cookie is set by Google and stored under the name dounleclick.com. This cookie is used to track how many times users see a particular advert which helps in measuring the success of the campaign and calculate the revenue generated by the campaign. These cookies can only be read from the domain that it is set on so it will not track any data while browsing through another sites.",
                          nl:
                              "This cookie is set by Google and stored under the name dounleclick.com. This cookie is used to track how many times users see a particular advert which helps in measuring the success of the campaign and calculate the revenue generated by the campaign. These cookies can only be read from the domain that it is set on so it will not track any data while browsing through another sites.",
                          bg:
                              "This cookie is set by Google and stored under the name dounleclick.com. This cookie is used to track how many times users see a particular advert which helps in measuring the success of the campaign and calculate the revenue generated by the campaign. These cookies can only be read from the domain that it is set on so it will not track any data while browsing through another sites.",
                          ar:
                              "This cookie is set by Google and stored under the name dounleclick.com. This cookie is used to track how many times users see a particular advert which helps in measuring the success of the campaign and calculate the revenue generated by the campaign. These cookies can only be read from the domain that it is set on so it will not track any data while browsing through another sites.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".israelhayom.co.il",
                  },
                  {
                      id: 49454,
                      cookie_id: "_cb_ls",
                      description: {
                          en: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          de: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          fr: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          it: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          es: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          nl: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          bg: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          ar: "This cookie is set by websites using real time analytics software by Chartbeat.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: "www.israelhayom.co.il",
                  },
                  {
                      id: 49455,
                      cookie_id: "_cb",
                      description: {
                          en: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          de: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          fr: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          it: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          es: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          nl: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          bg: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          ar: "This cookie is set by websites using real time analytics software by Chartbeat.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: "www.israelhayom.co.il",
                  },
                  {
                      id: 49456,
                      cookie_id: "_chartbeat2",
                      description: {
                          en: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          de: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          fr: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          it: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          es: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          nl: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          bg: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          ar: "This cookie is set by websites using real time analytics software by Chartbeat.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: "www.israelhayom.co.il",
                  },
                  {
                      id: 49457,
                      cookie_id: "_cb_svref",
                      description: {
                          en: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          de: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          fr: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          it: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          es: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          nl: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          bg: "This cookie is set by websites using real time analytics software by Chartbeat.",
                          ar: "This cookie is set by websites using real time analytics software by Chartbeat.",
                      },
                      duration: "30 minutes",
                      type: "http",
                      domain: "www.israelhayom.co.il",
                  },
                  {
                      id: 49469,
                      cookie_id: "demdex",
                      description: {
                          en: "This cookie is set under the domain demdex.net and is used by Adobe Audience Manager to help identify a unique visitor across domains.",
                          de: "This cookie is set under the domain demdex.net and is used by Adobe Audience Manager to help identify a unique visitor across domains.",
                          fr: "This cookie is set under the domain demdex.net and is used by Adobe Audience Manager to help identify a unique visitor across domains.",
                          it: "This cookie is set under the domain demdex.net and is used by Adobe Audience Manager to help identify a unique visitor across domains.",
                          es: "This cookie is set under the domain demdex.net and is used by Adobe Audience Manager to help identify a unique visitor across domains.",
                          nl: "This cookie is set under the domain demdex.net and is used by Adobe Audience Manager to help identify a unique visitor across domains.",
                          bg: "This cookie is set under the domain demdex.net and is used by Adobe Audience Manager to help identify a unique visitor across domains.",
                          ar: "This cookie is set under the domain demdex.net and is used by Adobe Audience Manager to help identify a unique visitor across domains.",
                      },
                      duration: "5 months",
                      type: "http",
                      domain: ".demdex.net",
                  },
                  {
                      id: 49470,
                      cookie_id: "UserID1",
                      description: {
                          en:
                              "The cookie sets a unique anonymous ID for a website visitor. This ID is used to continue to identify users across different sessions and track their activities on the website. The data collected is used for analysis.",
                          de:
                              "The cookie sets a unique anonymous ID for a website visitor. This ID is used to continue to identify users across different sessions and track their activities on the website. The data collected is used for analysis.",
                          fr:
                              "The cookie sets a unique anonymous ID for a website visitor. This ID is used to continue to identify users across different sessions and track their activities on the website. The data collected is used for analysis.",
                          it:
                              "The cookie sets a unique anonymous ID for a website visitor. This ID is used to continue to identify users across different sessions and track their activities on the website. The data collected is used for analysis.",
                          es:
                              "The cookie sets a unique anonymous ID for a website visitor. This ID is used to continue to identify users across different sessions and track their activities on the website. The data collected is used for analysis.",
                          nl:
                              "The cookie sets a unique anonymous ID for a website visitor. This ID is used to continue to identify users across different sessions and track their activities on the website. The data collected is used for analysis.",
                          bg:
                              "The cookie sets a unique anonymous ID for a website visitor. This ID is used to continue to identify users across different sessions and track their activities on the website. The data collected is used for analysis.",
                          ar:
                              "The cookie sets a unique anonymous ID for a website visitor. This ID is used to continue to identify users across different sessions and track their activities on the website. The data collected is used for analysis.",
                      },
                      duration: "5 months",
                      type: "http",
                      domain: ".adfarm1.adition.com",
                  },
                  {
                      id: 49513,
                      cookie_id: "eud",
                      description: {
                          en: "The domain of this cookie is owned by Rocketfuel. This cookie is used to sync with partner systems to identify the users. This cookie contains partner user IDs and last successful match time.",
                          de: "The domain of this cookie is owned by Rocketfuel. This cookie is used to sync with partner systems to identify the users. This cookie contains partner user IDs and last successful match time.",
                          fr: "The domain of this cookie is owned by Rocketfuel. This cookie is used to sync with partner systems to identify the users. This cookie contains partner user IDs and last successful match time.",
                          it: "The domain of this cookie is owned by Rocketfuel. This cookie is used to sync with partner systems to identify the users. This cookie contains partner user IDs and last successful match time.",
                          es: "The domain of this cookie is owned by Rocketfuel. This cookie is used to sync with partner systems to identify the users. This cookie contains partner user IDs and last successful match time.",
                          nl: "The domain of this cookie is owned by Rocketfuel. This cookie is used to sync with partner systems to identify the users. This cookie contains partner user IDs and last successful match time.",
                          bg: "The domain of this cookie is owned by Rocketfuel. This cookie is used to sync with partner systems to identify the users. This cookie contains partner user IDs and last successful match time.",
                          ar: "The domain of this cookie is owned by Rocketfuel. This cookie is used to sync with partner systems to identify the users. This cookie contains partner user IDs and last successful match time.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".rfihub.com",
                  },
                  {
                      id: 50151,
                      cookie_id: "_gcl_au",
                      description: {
                          en: "This cookie is used by Google Analytics to understand user interaction with the website.",
                          de: "This cookie is used by Google Analytics to understand user interaction with the website.",
                          fr: "This cookie is used by Google Analytics to understand user interaction with the website.",
                          it: "This cookie is used by Google Analytics to understand user interaction with the website.",
                          es: "This cookie is used by Google Analytics to understand user interaction with the website.",
                          nl: "This cookie is used by Google Analytics to understand user interaction with the website.",
                          bg: "This cookie is used by Google Analytics to understand user interaction with the website.",
                          ar: "This cookie is used by Google Analytics to understand user interaction with the website.",
                      },
                      duration: "2 months",
                      type: "http",
                      domain: ".wystroj-okien.pl",
                  },
                  {
                      id: 54951,
                      cookie_id: "_y",
                      description: {
                          en: "This cookie is associated with Shopify's analytics suite.",
                          de: "This cookie is associated with Shopify's analytics suite.",
                          fr: "This cookie is associated with Shopify's analytics suite.",
                          it: "This cookie is associated with Shopify's analytics suite.",
                          es: "This cookie is associated with Shopify's analytics suite.",
                          nl: "This cookie is associated with Shopify's analytics suite.",
                          bg: "This cookie is associated with Shopify's analytics suite.",
                          ar: "This cookie is associated with Shopify's analytics suite.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".my-workplaces.myshopify.com",
                  },
                  {
                      id: 54952,
                      cookie_id: "_shopify_fs",
                      description: {
                          en: "This cookie is associated with Shopify's analytics suite.",
                          de: "This cookie is associated with Shopify's analytics suite.",
                          fr: "This cookie is associated with Shopify's analytics suite.",
                          it: "This cookie is associated with Shopify's analytics suite.",
                          es: "This cookie is associated with Shopify's analytics suite.",
                          nl: "This cookie is associated with Shopify's analytics suite.",
                          bg: "This cookie is associated with Shopify's analytics suite.",
                          ar: "This cookie is associated with Shopify's analytics suite.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".my-workplaces.myshopify.com",
                  },
                  {
                      id: 54954,
                      cookie_id: "_landing_page",
                      description: {
                          en: "This cookie is set by website built on Shopify platform and is used to track landing pages.",
                          de: "This cookie is set by website built on Shopify platform and is used to track landing pages.",
                          fr: "This cookie is set by website built on Shopify platform and is used to track landing pages.",
                          it: "This cookie is set by website built on Shopify platform and is used to track landing pages.",
                          es: "This cookie is set by website built on Shopify platform and is used to track landing pages.",
                          nl: "This cookie is set by website built on Shopify platform and is used to track landing pages.",
                          bg: "This cookie is set by website built on Shopify platform and is used to track landing pages.",
                          ar: "This cookie is set by website built on Shopify platform and is used to track landing pages.",
                      },
                      duration: "2 weeks",
                      type: "https",
                      domain: ".my-workplaces.myshopify.com",
                  },
                  {
                      id: 54955,
                      cookie_id: "_shopify_s",
                      description: {
                          en: "This cookie is associated with Shopify's analytics suite.",
                          de: "This cookie is associated with Shopify's analytics suite.",
                          fr: "This cookie is associated with Shopify's analytics suite.",
                          it: "This cookie is associated with Shopify's analytics suite.",
                          es: "This cookie is associated with Shopify's analytics suite.",
                          nl: "This cookie is associated with Shopify's analytics suite.",
                          bg: "This cookie is associated with Shopify's analytics suite.",
                          ar: "This cookie is associated with Shopify's analytics suite.",
                      },
                      duration: "30 minutes",
                      type: "http",
                      domain: ".my-workplaces.myshopify.com",
                  },
                  {
                      id: 54956,
                      cookie_id: "_s",
                      description: {
                          en: "This cookie is associated with Shopify's analytics suite.",
                          de: "This cookie is associated with Shopify's analytics suite.",
                          fr: "This cookie is associated with Shopify's analytics suite.",
                          it: "This cookie is associated with Shopify's analytics suite.",
                          es: "This cookie is associated with Shopify's analytics suite.",
                          nl: "This cookie is associated with Shopify's analytics suite.",
                          bg: "This cookie is associated with Shopify's analytics suite.",
                          ar: "This cookie is associated with Shopify's analytics suite.",
                      },
                      duration: "30 minutes",
                      type: "http",
                      domain: ".my-workplaces.myshopify.com",
                  },
                  {
                      id: 54957,
                      cookie_id: "_shopify_y",
                      description: {
                          en: "This cookie is associated with Shopify's analytics suite.",
                          de: "This cookie is associated with Shopify's analytics suite.",
                          fr: "This cookie is associated with Shopify's analytics suite.",
                          it: "This cookie is associated with Shopify's analytics suite.",
                          es: "This cookie is associated with Shopify's analytics suite.",
                          nl: "This cookie is associated with Shopify's analytics suite.",
                          bg: "This cookie is associated with Shopify's analytics suite.",
                          ar: "This cookie is associated with Shopify's analytics suite.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".my-workplaces.myshopify.com",
                  },
                  {
                      id: 60876,
                      cookie_id: "GPS",
                      description: {
                          en: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          de: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          fr: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          it: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          es: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          nl: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          bg: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          ar: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                      },
                      duration: "1 years  19 days  15 hours  21 minutes",
                      type: "https",
                      domain: ".youtube.com",
                  },
                  {
                      id: 61520,
                      cookie_id: "dekoriapldshopsx",
                      description: {
                          en: "This cookie is sessional type of cookies used store visitors visit information for a period of two weeks.",
                          de: "This cookie is sessional type of cookies used store visitors visit information for a period of two weeks.",
                          fr: "This cookie is sessional type of cookies used store visitors visit information for a period of two weeks.",
                          it: "This cookie is sessional type of cookies used store visitors visit information for a period of two weeks.",
                          es: "This cookie is sessional type of cookies used store visitors visit information for a period of two weeks.",
                          nl: "This cookie is sessional type of cookies used store visitors visit information for a period of two weeks.",
                          bg: "This cookie is sessional type of cookies used store visitors visit information for a period of two weeks.",
                          ar: "This cookie is sessional type of cookies used store visitors visit information for a period of two weeks.",
                      },
                      duration: "1 years  19 days  15 hours  36 minutes",
                      type: "https",
                      domain: "www.dekoria.pl",
                  },
                  {
                      id: 61524,
                      cookie_id: "_snrs_sa",
                      description: {
                          en: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  visiting the website or starting the session time.",
                          de: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  visiting the website or starting the session time.",
                          fr: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  visiting the website or starting the session time.",
                          it: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  visiting the website or starting the session time.",
                          es: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  visiting the website or starting the session time.",
                          nl: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  visiting the website or starting the session time.",
                          bg: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  visiting the website or starting the session time.",
                          ar: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  visiting the website or starting the session time.",
                      },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: ".dekoria.pl",
                  },
                  {
                      id: 61525,
                      cookie_id: "_snrs_sb",
                      description: {
                          en: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  existing page or end session time.",
                          de: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  existing page or end session time.",
                          fr: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  existing page or end session time.",
                          it: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  existing page or end session time.",
                          es: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  existing page or end session time.",
                          nl: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  existing page or end session time.",
                          bg: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  existing page or end session time.",
                          ar: "This cookie is provided by Synerise. This cookie is used to measure the session length, quantity, start time. The cookie stores the time of  existing page or end session time.",
                      },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: ".dekoria.pl",
                  },
                  {
                      id: 61526,
                      cookie_id: "_snrs_p",
                      description: {
                          en:
                              "This cookie is provided by Synerise. This cookie is used to save the client UUID, time of first visit, time of permanent last visit, total number of visits, number views per session, length of session and number of session.",
                          de:
                              "This cookie is provided by Synerise. This cookie is used to save the client UUID, time of first visit, time of permanent last visit, total number of visits, number views per session, length of session and number of session.",
                          fr:
                              "This cookie is provided by Synerise. This cookie is used to save the client UUID, time of first visit, time of permanent last visit, total number of visits, number views per session, length of session and number of session.",
                          it:
                              "This cookie is provided by Synerise. This cookie is used to save the client UUID, time of first visit, time of permanent last visit, total number of visits, number views per session, length of session and number of session.",
                          es:
                              "This cookie is provided by Synerise. This cookie is used to save the client UUID, time of first visit, time of permanent last visit, total number of visits, number views per session, length of session and number of session.",
                          nl:
                              "This cookie is provided by Synerise. This cookie is used to save the client UUID, time of first visit, time of permanent last visit, total number of visits, number views per session, length of session and number of session.",
                          bg:
                              "This cookie is provided by Synerise. This cookie is used to save the client UUID, time of first visit, time of permanent last visit, total number of visits, number views per session, length of session and number of session.",
                          ar:
                              "This cookie is provided by Synerise. This cookie is used to save the client UUID, time of first visit, time of permanent last visit, total number of visits, number views per session, length of session and number of session.",
                      },
                      duration: "1 years  30 days  14 hours  10 minutes",
                      type: "https",
                      domain: ".dekoria.pl",
                  },
                  {
                      id: 61527,
                      cookie_id: "_snrs_uuid",
                      description: {
                          en: "This cookie is provided by Synerise. This cookie is used to store unique variable customer identifier.",
                          de: "This cookie is provided by Synerise. This cookie is used to store unique variable customer identifier.",
                          fr: "This cookie is provided by Synerise. This cookie is used to store unique variable customer identifier.",
                          it: "This cookie is provided by Synerise. This cookie is used to store unique variable customer identifier.",
                          es: "This cookie is provided by Synerise. This cookie is used to store unique variable customer identifier.",
                          nl: "This cookie is provided by Synerise. This cookie is used to store unique variable customer identifier.",
                          bg: "This cookie is provided by Synerise. This cookie is used to store unique variable customer identifier.",
                          ar: "This cookie is provided by Synerise. This cookie is used to store unique variable customer identifier.",
                      },
                      duration: "1 years  30 days  14 hours  10 minutes",
                      type: "https",
                      domain: ".dekoria.pl",
                  },
                  {
                      id: 61528,
                      cookie_id: "_snrs_puuid",
                      description: {
                          en: "This cookie is provided by Synerise. This cookie is used to store unique permanent customer identifier.",
                          de: "This cookie is provided by Synerise. This cookie is used to store unique permanent customer identifier.",
                          fr: "This cookie is provided by Synerise. This cookie is used to store unique permanent customer identifier.",
                          it: "This cookie is provided by Synerise. This cookie is used to store unique permanent customer identifier.",
                          es: "This cookie is provided by Synerise. This cookie is used to store unique permanent customer identifier.",
                          nl: "This cookie is provided by Synerise. This cookie is used to store unique permanent customer identifier.",
                          bg: "This cookie is provided by Synerise. This cookie is used to store unique permanent customer identifier.",
                          ar: "This cookie is provided by Synerise. This cookie is used to store unique permanent customer identifier.",
                      },
                      duration: "1 years  30 days  14 hours  10 minutes",
                      type: "https",
                      domain: ".dekoria.pl",
                  },
                  {
                      id: 61534,
                      cookie_id: "_gat_gtag_UA_1455913_3",
                      description: {
                          en: "Google uses this cookie to distinguish users.",
                          de: "Google uses this cookie to distinguish users.",
                          fr: "Google uses this cookie to distinguish users.",
                          it: "Google uses this cookie to distinguish users.",
                          es: "Google uses this cookie to distinguish users.",
                          nl: "Google uses this cookie to distinguish users.",
                          bg: "Google uses this cookie to distinguish users.",
                          ar: "Google uses this cookie to distinguish users.",
                      },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: ".dekoria.pl",
                  },
                  {
                      id: 66301,
                      cookie_id: "nQ_cookieId",
                      description: {
                          en:
                              "The domain of this cookie is owned by Albacross. It is used as a analytical tools to identify the potential customers by setting a unique Id for the customers. The session Id is used to implement the preference choice made by the customer upon their re-visit.",
                          de:
                              "The domain of this cookie is owned by Albacross. It is used as a analytical tools to identify the potential customers by setting a unique Id for the customers. The session Id is used to implement the preference choice made by the customer upon their re-visit.",
                          fr:
                              "The domain of this cookie is owned by Albacross. It is used as a analytical tools to identify the potential customers by setting a unique Id for the customers. The session Id is used to implement the preference choice made by the customer upon their re-visit.",
                          it:
                              "The domain of this cookie is owned by Albacross. It is used as a analytical tools to identify the potential customers by setting a unique Id for the customers. The session Id is used to implement the preference choice made by the customer upon their re-visit.",
                          es:
                              "The domain of this cookie is owned by Albacross. It is used as a analytical tools to identify the potential customers by setting a unique Id for the customers. The session Id is used to implement the preference choice made by the customer upon their re-visit.",
                          nl:
                              "The domain of this cookie is owned by Albacross. It is used as a analytical tools to identify the potential customers by setting a unique Id for the customers. The session Id is used to implement the preference choice made by the customer upon their re-visit.",
                          bg:
                              "The domain of this cookie is owned by Albacross. It is used as a analytical tools to identify the potential customers by setting a unique Id for the customers. The session Id is used to implement the preference choice made by the customer upon their re-visit.",
                          ar:
                              "The domain of this cookie is owned by Albacross. It is used as a analytical tools to identify the potential customers by setting a unique Id for the customers. The session Id is used to implement the preference choice made by the customer upon their re-visit.",
                      },
                      duration: "1 years  19 days   31 minutes",
                      type: "https",
                      domain: "www.dekoria.de",
                  },
                  {
                      id: 86309,
                      cookie_id: "vuid",
                      description: {
                          en: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website.",
                          de: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website.",
                          fr: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website.",
                          it: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website.",
                          es: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website.",
                          nl: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website.",
                          bg: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website.",
                          ar: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website.",
                      },
                      duration: "1 years 11 months 28 days 23 hours 59 minutes",
                      type: "https",
                      domain: ".vimeo.com",
                  },
              ],
          },
          {
              id: 38592,
              slug: "performance",
              order: 4,
              name: { en: "Analytics", de: "Leistungs", fi: "Suorituskyky\u00e4", sl: "Uspe\u0161nosti", "pt-br": "Desempenho" },
              defaultConsent: 1,
              active: 1,
              settings: { ccpa: { doNotSell: "1" } },
              type: 2,
              description: {
                  en: "<p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.</p>",
                  de: "<p>Leistungs-Cookies werden verwendet, um die wichtigsten Leistungsindizes der Website zu verstehen und zu analysieren. Dies tr\u00e4gt dazu bei, den Besuchern ein besseres Nutzererlebnis zu bieten.</p>",
                  fi:
                      "<p>Suorituskykyev\u00e4steit\u00e4 k\u00e4ytet\u00e4\u00e4n verkkosivuston t\u00e4rkeimpien suorituskykyindeksien ymm\u00e4rt\u00e4miseen ja analysointiin, mik\u00e4 auttaa tarjoamaan vierailijoille paremman k\u00e4ytt\u00f6kokemuksen.</p>",
                  sl:
                      "<p>Pi\u0161kotki uspe\u0161nosti se uporabljajo za razumevanje in analizo klju\u010dnih kazal uspe\u0161nosti spletne strani, ki pomagajo pri zagotavljanju bolj\u0161e uporabni\u0161ke izku\u0161nje za obiskovalce.</p>",
                  "pt-br":
                      "<p>Os cookies de desempenho s\u00e3o usados para entender e analisar os principais \u00edndices de desempenho do site, o que ajuda a oferecer uma melhor experi\u00eancia do usu\u00e1rio para os visitantes.</p>",
              },
              scripts: [
                  {
                      id: 16889,
                      name: { en: "Performance", de: "Performance", fr: "Performance", it: "Performance", es: "Performance", nl: "Performance", bg: "Performance", ar: "Performance" },
                      description: {
                          en: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          de: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          fr: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          it: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          es: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          nl: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          bg: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          ar: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                      },
                      cookie_ids: "__utma",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16890,
                      name: { en: "Performance", de: "Performance", fr: "Performance", it: "Performance", es: "Performance", nl: "Performance", bg: "Performance", ar: "Performance" },
                      description: {
                          en: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          de: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          fr: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          it: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          es: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          nl: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          bg: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          ar: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                      },
                      cookie_ids: "__utmc",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16891,
                      name: { en: "Performance", de: "Performance", fr: "Performance", it: "Performance", es: "Performance", nl: "Performance", bg: "Performance", ar: "Performance" },
                      description: {
                          en: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          de: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          fr: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          it: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          es: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          nl: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          bg: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          ar: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                      },
                      cookie_ids: "__utmz",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16892,
                      name: { en: "Performance", de: "Performance", fr: "Performance", it: "Performance", es: "Performance", nl: "Performance", bg: "Performance", ar: "Performance" },
                      description: {
                          en: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          de: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          fr: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          it: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          es: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          nl: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          bg: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          ar: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                      },
                      cookie_ids: "__utmt",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16893,
                      name: { en: "Performance", de: "Performance", fr: "Performance", it: "Performance", es: "Performance", nl: "Performance", bg: "Performance", ar: "Performance" },
                      description: {
                          en: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          de: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          fr: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          it: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          es: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          nl: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          bg: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          ar: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                      },
                      cookie_ids: "__utmb",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16895,
                      name: { en: "Performance", de: "Performance", fr: "Performance", it: "Performance", es: "Performance", nl: "Performance", bg: "Performance", ar: "Performance" },
                      description: {
                          en:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          de:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          fr:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          it:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          es:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          nl:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          bg:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          ar:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                      },
                      cookie_ids: "_gat_UA-51008765-1",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16910,
                      name: { en: "Performance", de: "Performance", fr: "Performance", it: "Performance", es: "Performance", nl: "Performance", bg: "Performance", ar: "Performance" },
                      description: {
                          en:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          de:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          fr:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          it:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          es:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          nl:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          bg:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          ar:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                      },
                      cookie_ids: "_gat_UA-9331049-1",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16933,
                      name: { en: "Performance", de: "Performance", fr: "Performance", it: "Performance", es: "Performance", nl: "Performance", bg: "Performance", ar: "Performance" },
                      description: {
                          en: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          de: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          fr: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          it: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          es: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          nl: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          bg: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                          ar: "Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.",
                      },
                      cookie_ids: "d",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
              ],
              cookies: [
                  {
                      id: 49414,
                      cookie_id: "__utma",
                      description: {
                          en:
                              "This cookie is set by Google Analytics and is used to distinguish users and sessions. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          de:
                              "This cookie is set by Google Analytics and is used to distinguish users and sessions. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          fr:
                              "This cookie is set by Google Analytics and is used to distinguish users and sessions. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          it:
                              "This cookie is set by Google Analytics and is used to distinguish users and sessions. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          es:
                              "This cookie is set by Google Analytics and is used to distinguish users and sessions. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          nl:
                              "This cookie is set by Google Analytics and is used to distinguish users and sessions. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          bg:
                              "This cookie is set by Google Analytics and is used to distinguish users and sessions. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          ar:
                              "This cookie is set by Google Analytics and is used to distinguish users and sessions. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".ishthehague.nl",
                  },
                  {
                      id: 49415,
                      cookie_id: "__utmc",
                      description: {
                          en:
                              "The cookie is set by Google Analytics and is deleted when the user closes the browser. The cookie is not used by ga.js. The cookie is used to enable interoperability with urchin.js which is an older version of Google analytics and used in conjunction with the __utmb cookie to determine new sessions/visits.",
                          de:
                              "The cookie is set by Google Analytics and is deleted when the user closes the browser. The cookie is not used by ga.js. The cookie is used to enable interoperability with urchin.js which is an older version of Google analytics and used in conjunction with the __utmb cookie to determine new sessions/visits.",
                          fr:
                              "The cookie is set by Google Analytics and is deleted when the user closes the browser. The cookie is not used by ga.js. The cookie is used to enable interoperability with urchin.js which is an older version of Google analytics and used in conjunction with the __utmb cookie to determine new sessions/visits.",
                          it:
                              "The cookie is set by Google Analytics and is deleted when the user closes the browser. The cookie is not used by ga.js. The cookie is used to enable interoperability with urchin.js which is an older version of Google analytics and used in conjunction with the __utmb cookie to determine new sessions/visits.",
                          es:
                              "The cookie is set by Google Analytics and is deleted when the user closes the browser. The cookie is not used by ga.js. The cookie is used to enable interoperability with urchin.js which is an older version of Google analytics and used in conjunction with the __utmb cookie to determine new sessions/visits.",
                          nl:
                              "The cookie is set by Google Analytics and is deleted when the user closes the browser. The cookie is not used by ga.js. The cookie is used to enable interoperability with urchin.js which is an older version of Google analytics and used in conjunction with the __utmb cookie to determine new sessions/visits.",
                          bg:
                              "The cookie is set by Google Analytics and is deleted when the user closes the browser. The cookie is not used by ga.js. The cookie is used to enable interoperability with urchin.js which is an older version of Google analytics and used in conjunction with the __utmb cookie to determine new sessions/visits.",
                          ar:
                              "The cookie is set by Google Analytics and is deleted when the user closes the browser. The cookie is not used by ga.js. The cookie is used to enable interoperability with urchin.js which is an older version of Google analytics and used in conjunction with the __utmb cookie to determine new sessions/visits.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".ishthehague.nl",
                  },
                  {
                      id: 49416,
                      cookie_id: "__utmz",
                      description: {
                          en: "This cookie is set by Google analytics and is used to store the traffic source or campaign through which the visitor reached your site.",
                          de: "This cookie is set by Google analytics and is used to store the traffic source or campaign through which the visitor reached your site.",
                          fr: "This cookie is set by Google analytics and is used to store the traffic source or campaign through which the visitor reached your site.",
                          it: "This cookie is set by Google analytics and is used to store the traffic source or campaign through which the visitor reached your site.",
                          es: "This cookie is set by Google analytics and is used to store the traffic source or campaign through which the visitor reached your site.",
                          nl: "This cookie is set by Google analytics and is used to store the traffic source or campaign through which the visitor reached your site.",
                          bg: "This cookie is set by Google analytics and is used to store the traffic source or campaign through which the visitor reached your site.",
                          ar: "This cookie is set by Google analytics and is used to store the traffic source or campaign through which the visitor reached your site.",
                      },
                      duration: "6 months",
                      type: "http",
                      domain: ".ishthehague.nl",
                  },
                  {
                      id: 49417,
                      cookie_id: "__utmt",
                      description: {
                          en: "The cookie is set by Google Analytics and is used to throttle request rate.",
                          de: "The cookie is set by Google Analytics and is used to throttle request rate.",
                          fr: "The cookie is set by Google Analytics and is used to throttle request rate.",
                          it: "The cookie is set by Google Analytics and is used to throttle request rate.",
                          es: "The cookie is set by Google Analytics and is used to throttle request rate.",
                          nl: "The cookie is set by Google Analytics and is used to throttle request rate.",
                          bg: "The cookie is set by Google Analytics and is used to throttle request rate.",
                          ar: "The cookie is set by Google Analytics and is used to throttle request rate.",
                      },
                      duration: "10 minutes",
                      type: "http",
                      domain: ".ishthehague.nl",
                  },
                  {
                      id: 49418,
                      cookie_id: "__utmb",
                      description: {
                          en:
                              "The cookie is set by Google Analytics. The cookie is used to determine new sessions/visits. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          de:
                              "The cookie is set by Google Analytics. The cookie is used to determine new sessions/visits. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          fr:
                              "The cookie is set by Google Analytics. The cookie is used to determine new sessions/visits. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          it:
                              "The cookie is set by Google Analytics. The cookie is used to determine new sessions/visits. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          es:
                              "The cookie is set by Google Analytics. The cookie is used to determine new sessions/visits. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          nl:
                              "The cookie is set by Google Analytics. The cookie is used to determine new sessions/visits. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          bg:
                              "The cookie is set by Google Analytics. The cookie is used to determine new sessions/visits. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                          ar:
                              "The cookie is set by Google Analytics. The cookie is used to determine new sessions/visits. The cookie is created when the JavaScript library executes and there are no existing __utma cookies. The cookie is updated every time data is sent to Google Analytics.",
                      },
                      duration: "30 minutes",
                      type: "http",
                      domain: ".ishthehague.nl",
                  },
                  {
                      id: 49422,
                      cookie_id: "_gat_UA-51008765-1",
                      description: {
                          en:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          de:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          fr:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          it:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          es:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          nl:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          bg:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          ar:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                      },
                      duration: "1 minute",
                      type: "http",
                      domain: ".ishthehague.nl",
                  },
                  {
                      id: 49451,
                      cookie_id: "_gat_UA-9331049-1",
                      description: {
                          en:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          de:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          fr:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          it:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          es:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          nl:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          bg:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          ar:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                      },
                      duration: "1 minute",
                      type: "http",
                      domain: ".israelhayom.co.il",
                  },
                  {
                      id: 49519,
                      cookie_id: "d",
                      description: {
                          en: "This cookie tracks anonymous information on how visitors use the website.",
                          de: "This cookie tracks anonymous information on how visitors use the website.",
                          fr: "This cookie tracks anonymous information on how visitors use the website.",
                          it: "This cookie tracks anonymous information on how visitors use the website.",
                          es: "This cookie tracks anonymous information on how visitors use the website.",
                          nl: "This cookie tracks anonymous information on how visitors use the website.",
                          bg: "This cookie tracks anonymous information on how visitors use the website.",
                          ar: "This cookie tracks anonymous information on how visitors use the website.",
                      },
                      duration: "2 months",
                      type: "http",
                      domain: ".quantserve.com",
                  },
                  {
                      id: 60869,
                      cookie_id: "_gat_UA-38602446-1",
                      description: {
                          en:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          de:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          fr:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          it:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          es:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          nl:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          bg:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                          ar:
                              "This is a pattern type cookie set by Google Analytics, where the pattern element on the name contains the unique identity number of the account or website it relates to. It appears to be a variation of the _gat cookie which is used to limit the amount of data recorded by Google on high traffic volume websites.",
                      },
                      duration: "1 years  19 days  15 hours  21 minutes",
                      type: "https",
                      domain: ".wystroj-okien.pl",
                  },
                  {
                      id: 60875,
                      cookie_id: "YSC",
                      description: {
                          en: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                          de: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                          fr: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                          it: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                          es: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                          nl: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                          bg: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                          ar: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: ".youtube.com",
                  },
                  {
                      id: 61493,
                      cookie_id: "_gat",
                      description: {
                          en: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          de: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          fr: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          it: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          es: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          nl: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          bg: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          ar: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                      },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: ".schneehoehen.de",
                  },
              ],
          },
          {
              id: 38593,
              slug: "advertisement",
              order: 5,
              name: { en: "Advertisement", de: "Werbe", fi: "Mainos", sl: "Oglas", "pt-br": "An\u00fancio" },
              defaultConsent: 1,
              active: 1,
              settings: { ccpa: { doNotSell: "1" } },
              type: 2,
              description: {
                  en: "<p>Advertisement cookies are used to deliver visitors with customized advertisements based on the pages they visited before and analyze the effectiveness of the ad campaign.</p>",
                  de: "<p>Werbe-Cookies werden verwendet, um Besuchern auf der Grundlage der von ihnen zuvor besuchten Seiten ma\u00dfgeschneiderte Werbung zu liefern und die Wirksamkeit von Werbekampagne nzu analysieren.</p>",
                  fi:
                      "<p>Mainosev\u00e4steit\u00e4 k\u00e4ytet\u00e4\u00e4n tarjoamaan k\u00e4vij\u00f6ille r\u00e4\u00e4t\u00e4l\u00f6ityj\u00e4 mainoksia sivujen perusteella, joilla he ovat k\u00e4yneet aiemmin, ja analysoimaan mainoskampanjan tehokkuutta.</p>",
                  sl: "<p>Ogla\u0161evalski pi\u0161kotki se uporabljajo za zagotavljanje obiskovalcev s prilagojenimi oglasi na podlagi strani, ki so jih obiskali prej, in za analizo u\u010dinkovitosti ogla\u0161evalske akcije.</p>",
                  "pt-br":
                      "<p>Os cookies de an\u00fancios s\u00e3o usados para entregar aos visitantes an\u00fancios personalizados com base nas p\u00e1ginas que visitaram antes e analisar a efic\u00e1cia da campanha publicit\u00e1ria.</p>",
              },
              scripts: [
                  {
                      id: 16906,
                      name: { en: "Advertisement", de: "Advertisement", fr: "Advertisement", it: "Advertisement", es: "Advertisement", nl: "Advertisement", bg: "Advertisement", ar: "Advertisement" },
                      description: {
                          en: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          de: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          fr: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          it: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          es: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          nl: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          bg: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          ar: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                      },
                      cookie_ids: "pl_user_id",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16907,
                      name: { en: "Facebook", de: "Facebook", fr: "Facebook", it: "Facebook", es: "Facebook", nl: "Facebook", bg: "Facebook", ar: "Facebook" },
                      description: {
                          en: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                          de: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                          fr: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                          it: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                          es: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                          nl: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                          bg: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                          ar: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                      },
                      cookie_ids: "wd, _fbp, fr",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16908,
                      name: { en: "DoubleClick", de: "DoubleClick", fr: "DoubleClick", it: "DoubleClick", es: "DoubleClick", nl: "DoubleClick", bg: "DoubleClick", ar: "DoubleClick" },
                      description: {
                          en: "DoubleClick provides internet ad serving service for online publishers.",
                          de: "DoubleClick provides internet ad serving service for online publishers.",
                          fr: "DoubleClick provides internet ad serving service for online publishers.",
                          it: "DoubleClick provides internet ad serving service for online publishers.",
                          es: "DoubleClick provides internet ad serving service for online publishers.",
                          nl: "DoubleClick provides internet ad serving service for online publishers.",
                          bg: "DoubleClick provides internet ad serving service for online publishers.",
                          ar: "DoubleClick provides internet ad serving service for online publishers.",
                      },
                      cookie_ids: "IDE, test_cookie",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16915,
                      name: { en: "rlcdn.com", de: "rlcdn.com", fr: "rlcdn.com", it: "rlcdn.com", es: "rlcdn.com", nl: "rlcdn.com", bg: "rlcdn.com", ar: "rlcdn.com" },
                      description: {
                          en: "Description unavailable.",
                          de: "Description unavailable.",
                          fr: "Description unavailable.",
                          it: "Description unavailable.",
                          es: "Description unavailable.",
                          nl: "Description unavailable.",
                          bg: "Description unavailable.",
                          ar: "Description unavailable.",
                      },
                      cookie_ids: "rlas3",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16916,
                      name: { en: "Agkn.com", de: "Agkn.com", fr: "Agkn.com", it: "Agkn.com", es: "Agkn.com", nl: "Agkn.com", bg: "Agkn.com", ar: "Agkn.com" },
                      description: {
                          en: "Description unavailable.",
                          de: "Description unavailable.",
                          fr: "Description unavailable.",
                          it: "Description unavailable.",
                          es: "Description unavailable.",
                          nl: "Description unavailable.",
                          bg: "Description unavailable.",
                          ar: "Description unavailable.",
                      },
                      cookie_ids: "ab",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16917,
                      name: { en: "BidSwitch", de: "BidSwitch", fr: "BidSwitch", it: "BidSwitch", es: "BidSwitch", nl: "BidSwitch", bg: "BidSwitch", ar: "BidSwitch" },
                      description: {
                          en: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                          de: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                          fr: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                          it: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                          es: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                          nl: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                          bg: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                          ar: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                      },
                      cookie_ids: "tuuid, tuuid_lu",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16918,
                      name: { en: "CloudFare Service", de: "CloudFare Service", fr: "CloudFare Service", it: "CloudFare Service", es: "CloudFare Service", nl: "CloudFare Service", bg: "CloudFare Service", ar: "CloudFare Service" },
                      description: {
                          en: "CloudFare provides CDN services, DDoS mitigation  Internet security and distributed domain name server services. It uses cookies on websites that uses its services.",
                          de: "CloudFare provides CDN services, DDoS mitigation  Internet security and distributed domain name server services. It uses cookies on websites that uses its services.",
                          fr: "CloudFare provides CDN services, DDoS mitigation  Internet security and distributed domain name server services. It uses cookies on websites that uses its services.",
                          it: "CloudFare provides CDN services, DDoS mitigation  Internet security and distributed domain name server services. It uses cookies on websites that uses its services.",
                          es: "CloudFare provides CDN services, DDoS mitigation  Internet security and distributed domain name server services. It uses cookies on websites that uses its services.",
                          nl: "CloudFare provides CDN services, DDoS mitigation  Internet security and distributed domain name server services. It uses cookies on websites that uses its services.",
                          bg: "CloudFare provides CDN services, DDoS mitigation  Internet security and distributed domain name server services. It uses cookies on websites that uses its services.",
                          ar: "CloudFare provides CDN services, DDoS mitigation  Internet security and distributed domain name server services. It uses cookies on websites that uses its services.",
                      },
                      cookie_ids: "TDCPM, TDID",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16919,
                      name: { en: "Krux Digital", de: "Krux Digital", fr: "Krux Digital", it: "Krux Digital", es: "Krux Digital", nl: "Krux Digital", bg: "Krux Digital", ar: "Krux Digital" },
                      description: {
                          en: "Helps companies worldwide deliver more valuable, more personal marketing, media, and commerce experiences",
                          de: "Helps companies worldwide deliver more valuable, more personal marketing, media, and commerce experiences",
                          fr: "Helps companies worldwide deliver more valuable, more personal marketing, media, and commerce experiences",
                          it: "Helps companies worldwide deliver more valuable, more personal marketing, media, and commerce experiences",
                          es: "Helps companies worldwide deliver more valuable, more personal marketing, media, and commerce experiences",
                          nl: "Helps companies worldwide deliver more valuable, more personal marketing, media, and commerce experiences",
                          bg: "Helps companies worldwide deliver more valuable, more personal marketing, media, and commerce experiences",
                          ar: "Helps companies worldwide deliver more valuable, more personal marketing, media, and commerce experiences",
                      },
                      cookie_ids: "_kuid_",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16922,
                      name: { en: "Advertisement", de: "Advertisement", fr: "Advertisement", it: "Advertisement", es: "Advertisement", nl: "Advertisement", bg: "Advertisement", ar: "Advertisement" },
                      description: {
                          en: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          de: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          fr: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          it: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          es: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          nl: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          bg: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          ar: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                      },
                      cookie_ids: "pxrc",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16923,
                      name: { en: "BlueKai", de: "BlueKai", fr: "BlueKai", it: "BlueKai", es: "BlueKai", nl: "BlueKai", bg: "BlueKai", ar: "BlueKai" },
                      description: {
                          en: "BlueKai is a cloud-based big data platform that enables companies to personalize online, offline, and mobile marketing campaigns.",
                          de: "BlueKai is a cloud-based big data platform that enables companies to personalize online, offline, and mobile marketing campaigns.",
                          fr: "BlueKai is a cloud-based big data platform that enables companies to personalize online, offline, and mobile marketing campaigns.",
                          it: "BlueKai is a cloud-based big data platform that enables companies to personalize online, offline, and mobile marketing campaigns.",
                          es: "BlueKai is a cloud-based big data platform that enables companies to personalize online, offline, and mobile marketing campaigns.",
                          nl: "BlueKai is a cloud-based big data platform that enables companies to personalize online, offline, and mobile marketing campaigns.",
                          bg: "BlueKai is a cloud-based big data platform that enables companies to personalize online, offline, and mobile marketing campaigns.",
                          ar: "BlueKai is a cloud-based big data platform that enables companies to personalize online, offline, and mobile marketing campaigns.",
                      },
                      cookie_ids: "bkdc, bku",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16924,
                      name: { en: "Demdex", de: "Demdex", fr: "Demdex", it: "Demdex", es: "Demdex", nl: "Demdex", bg: "Demdex", ar: "Demdex" },
                      description: {
                          en: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          de: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          fr: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          it: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          es: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          nl: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          bg: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                          ar: "Demdex provides audience management solutions for websites. It collects behavioral data for websites and advertisers and segments the audiences for targetted advertisement.",
                      },
                      cookie_ids: "dpm",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16925,
                      name: { en: "Ps.eyeota.net", de: "Ps.eyeota.net", fr: "Ps.eyeota.net", it: "Ps.eyeota.net", es: "Ps.eyeota.net", nl: "Ps.eyeota.net", bg: "Ps.eyeota.net", ar: "Ps.eyeota.net" },
                      description: {
                          en: "Description unavailable.",
                          de: "Description unavailable.",
                          fr: "Description unavailable.",
                          it: "Description unavailable.",
                          es: "Description unavailable.",
                          nl: "Description unavailable.",
                          bg: "Description unavailable.",
                          ar: "Description unavailable.",
                      },
                      cookie_ids: "ONPLFTRH, mako_uid",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16926,
                      name: { en: "Exelator.com", de: "Exelator.com", fr: "Exelator.com", it: "Exelator.com", es: "Exelator.com", nl: "Exelator.com", bg: "Exelator.com", ar: "Exelator.com" },
                      description: {
                          en: "Description unavailable.",
                          de: "Description unavailable.",
                          fr: "Description unavailable.",
                          it: "Description unavailable.",
                          es: "Description unavailable.",
                          nl: "Description unavailable.",
                          bg: "Description unavailable.",
                          ar: "Description unavailable.",
                      },
                      cookie_ids: "EE, ud",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16927,
                      name: { en: "Crwdcntrl.net", de: "Crwdcntrl.net", fr: "Crwdcntrl.net", it: "Crwdcntrl.net", es: "Crwdcntrl.net", nl: "Crwdcntrl.net", bg: "Crwdcntrl.net", ar: "Crwdcntrl.net" },
                      description: {
                          en: "Description unavailable.",
                          de: "Description unavailable.",
                          fr: "Description unavailable.",
                          it: "Description unavailable.",
                          es: "Description unavailable.",
                          nl: "Description unavailable.",
                          bg: "Description unavailable.",
                          ar: "Description unavailable.",
                      },
                      cookie_ids: "_cc_aud, _cc_cc, _cc_dc, _cc_id",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16928,
                      name: { en: "Source Unknown", de: "Source Unknown", fr: "Source Unknown", it: "Source Unknown", es: "Source Unknown", nl: "Source Unknown", bg: "Source Unknown", ar: "Source Unknown" },
                      description: {
                          en: "The source of these cookies is not known yet.",
                          de: "The source of these cookies is not known yet.",
                          fr: "The source of these cookies is not known yet.",
                          it: "The source of these cookies is not known yet.",
                          es: "The source of these cookies is not known yet.",
                          nl: "The source of these cookies is not known yet.",
                          bg: "The source of these cookies is not known yet.",
                          ar: "The source of these cookies is not known yet.",
                      },
                      cookie_ids: "1P_JAR, SSID, APISID, SIDCC, NID, mt_mop, ruds, uuid, uuidc, _parsely_session, uid, APID, IDSYNC, CONSENT, LSID, _rxuuid, adinj, cto_lwid, uid",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16929,
                      name: {
                          en: "Scorecard Research",
                          de: "Scorecard Research",
                          fr: "Scorecard Research",
                          it: "Scorecard Research",
                          es: "Scorecard Research",
                          nl: "Scorecard Research",
                          bg: "Scorecard Research",
                          ar: "Scorecard Research",
                      },
                      description: {
                          en: "Scorecard Research analyzes user behavior to help understand user preferences on the internet. This can be used to serve users with relevant advertisements.",
                          de: "Scorecard Research analyzes user behavior to help understand user preferences on the internet. This can be used to serve users with relevant advertisements.",
                          fr: "Scorecard Research analyzes user behavior to help understand user preferences on the internet. This can be used to serve users with relevant advertisements.",
                          it: "Scorecard Research analyzes user behavior to help understand user preferences on the internet. This can be used to serve users with relevant advertisements.",
                          es: "Scorecard Research analyzes user behavior to help understand user preferences on the internet. This can be used to serve users with relevant advertisements.",
                          nl: "Scorecard Research analyzes user behavior to help understand user preferences on the internet. This can be used to serve users with relevant advertisements.",
                          bg: "Scorecard Research analyzes user behavior to help understand user preferences on the internet. This can be used to serve users with relevant advertisements.",
                          ar: "Scorecard Research analyzes user behavior to help understand user preferences on the internet. This can be used to serve users with relevant advertisements.",
                      },
                      cookie_ids: "UIDR",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16930,
                      name: { en: "Advertisement", de: "Advertisement", fr: "Advertisement", it: "Advertisement", es: "Advertisement", nl: "Advertisement", bg: "Advertisement", ar: "Advertisement" },
                      description: {
                          en: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          de: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          fr: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          it: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          es: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          nl: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          bg: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          ar: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                      },
                      cookie_ids: "DSID",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16931,
                      name: { en: "Advertisement", de: "Advertisement", fr: "Advertisement", it: "Advertisement", es: "Advertisement", nl: "Advertisement", bg: "Advertisement", ar: "Advertisement" },
                      description: {
                          en: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          de: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          fr: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          it: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          es: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          nl: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          bg: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          ar: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                      },
                      cookie_ids: "bsw_uid",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16934,
                      name: { en: "QuantServe", de: "QuantServe", fr: "QuantServe", it: "QuantServe", es: "QuantServe", nl: "QuantServe", bg: "QuantServe", ar: "QuantServe" },
                      description: {
                          en: "Quantserve allows website owners and advertisers to use Quantserve web beacons in their content to see how their content performs and analyze demographic data.",
                          de: "Quantserve allows website owners and advertisers to use Quantserve web beacons in their content to see how their content performs and analyze demographic data.",
                          fr: "Quantserve allows website owners and advertisers to use Quantserve web beacons in their content to see how their content performs and analyze demographic data.",
                          it: "Quantserve allows website owners and advertisers to use Quantserve web beacons in their content to see how their content performs and analyze demographic data.",
                          es: "Quantserve allows website owners and advertisers to use Quantserve web beacons in their content to see how their content performs and analyze demographic data.",
                          nl: "Quantserve allows website owners and advertisers to use Quantserve web beacons in their content to see how their content performs and analyze demographic data.",
                          bg: "Quantserve allows website owners and advertisers to use Quantserve web beacons in their content to see how their content performs and analyze demographic data.",
                          ar: "Quantserve allows website owners and advertisers to use Quantserve web beacons in their content to see how their content performs and analyze demographic data.",
                      },
                      cookie_ids: "mc",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16936,
                      name: { en: "Google", de: "Google", fr: "Google", it: "Google", es: "Google", nl: "Google", bg: "Google", ar: "Google" },
                      description: {
                          en: "Google Tracks users behavior to provide them with relevant contents and ads.",
                          de: "Google Tracks users behavior to provide them with relevant contents and ads.",
                          fr: "Google Tracks users behavior to provide them with relevant contents and ads.",
                          it: "Google Tracks users behavior to provide them with relevant contents and ads.",
                          es: "Google Tracks users behavior to provide them with relevant contents and ads.",
                          nl: "Google Tracks users behavior to provide them with relevant contents and ads.",
                          bg: "Google Tracks users behavior to provide them with relevant contents and ads.",
                          ar: "Google Tracks users behavior to provide them with relevant contents and ads.",
                      },
                      cookie_ids: "HSID, SAPISID, __gads, GED_PLAYLIST_ACTIVITY",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 16937,
                      name: { en: "Advertisement", de: "Advertisement", fr: "Advertisement", it: "Advertisement", es: "Advertisement", nl: "Advertisement", bg: "Advertisement", ar: "Advertisement" },
                      description: {
                          en: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          de: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          fr: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          it: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          es: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          nl: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          bg: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          ar: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                      },
                      cookie_ids: "bito",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 20455,
                      name: { en: "YouTube", de: "YouTube", fr: "YouTube", it: "YouTube", es: "YouTube", nl: "YouTube", bg: "YouTube", ar: "YouTube" },
                      description: {
                          en: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          de: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          fr: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          it: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          es: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          nl: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          bg: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          ar: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                      },
                      cookie_ids: "VISITOR_INFO1_LIVE",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 20549,
                      name: {
                          en: "Ads.stickyadstv.com",
                          de: "Ads.stickyadstv.com",
                          fr: "Ads.stickyadstv.com",
                          it: "Ads.stickyadstv.com",
                          es: "Ads.stickyadstv.com",
                          nl: "Ads.stickyadstv.com",
                          bg: "Ads.stickyadstv.com",
                          ar: "Ads.stickyadstv.com",
                      },
                      description: {
                          en: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          de: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          fr: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          it: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          es: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          nl: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          bg: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          ar: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                      },
                      cookie_ids: "uid-bp-838",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 20550,
                      name: { en: "AppNexus", de: "AppNexus", fr: "AppNexus", it: "AppNexus", es: "AppNexus", nl: "AppNexus", bg: "AppNexus", ar: "AppNexus" },
                      description: {
                          en: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          de: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          fr: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          it: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          es: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          nl: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          bg: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          ar: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                      },
                      cookie_ids: "uuid2, anj",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 21301,
                      name: { en: "OwnerIQ", de: "OwnerIQ", fr: "OwnerIQ", it: "OwnerIQ", es: "OwnerIQ", nl: "OwnerIQ", bg: "OwnerIQ", ar: "OwnerIQ" },
                      description: {
                          en: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          de: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          fr: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          it: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          es: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          nl: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          bg: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                          ar: "Advertisement cookies are used to provide visitors with relevant ads and marketing campaigns. These cookies track visitors across websites and collect information to provide customized ads.",
                      },
                      cookie_ids: "rc, gguuid, oxc, bsc, si, tapq, p2",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
              ],
              cookies: [
                  {
                      id: 49443,
                      cookie_id: "pl_user_id",
                      description: {
                          en: "The domain of this cookie is owned by Powerlinks. This cookie is used to store data of the visitor, and this data is used for optimizing advertisement relevance.",
                          de: "The domain of this cookie is owned by Powerlinks. This cookie is used to store data of the visitor, and this data is used for optimizing advertisement relevance.",
                          fr: "The domain of this cookie is owned by Powerlinks. This cookie is used to store data of the visitor, and this data is used for optimizing advertisement relevance.",
                          it: "The domain of this cookie is owned by Powerlinks. This cookie is used to store data of the visitor, and this data is used for optimizing advertisement relevance.",
                          es: "The domain of this cookie is owned by Powerlinks. This cookie is used to store data of the visitor, and this data is used for optimizing advertisement relevance.",
                          nl: "The domain of this cookie is owned by Powerlinks. This cookie is used to store data of the visitor, and this data is used for optimizing advertisement relevance.",
                          bg: "The domain of this cookie is owned by Powerlinks. This cookie is used to store data of the visitor, and this data is used for optimizing advertisement relevance.",
                          ar: "The domain of this cookie is owned by Powerlinks. This cookie is used to store data of the visitor, and this data is used for optimizing advertisement relevance.",
                      },
                      duration: "2 months",
                      type: "http",
                      domain: ".powerlinks.com",
                  },
                  {
                      id: 49447,
                      cookie_id: "_fbp",
                      description: {
                          en: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                          de: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                          fr: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                          it: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                          es: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                          nl: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                          bg: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                          ar: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                      },
                      duration: "2 months",
                      type: "http",
                      domain: ".israelhayom.co.il",
                  },
                  {
                      id: 49448,
                      cookie_id: "IDE",
                      description: {
                          en:
                              "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                          de:
                              "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                          fr:
                              "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                          it:
                              "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                          es:
                              "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                          nl:
                              "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                          bg:
                              "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                          ar:
                              "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                      },
                      duration: "1 year",
                      type: "https",
                      domain: ".doubleclick.net",
                  },
                  {
                      id: 49449,
                      cookie_id: "fr",
                      description: {
                          en:
                              "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
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
                          ar:
                              "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                      },
                      duration: "2 months",
                      type: "https",
                      domain: ".facebook.com",
                  },
                  {
                      id: 49462,
                      cookie_id: "rlas3",
                      description: {
                          en: "The cookie is set by rlcdn.com. The cookie is used to serve relevant ads to the visitor as well as limit the time the visitor sees an and also measure the effectiveness of the campaign.",
                          de: "The cookie is set by rlcdn.com. The cookie is used to serve relevant ads to the visitor as well as limit the time the visitor sees an and also measure the effectiveness of the campaign.",
                          fr: "The cookie is set by rlcdn.com. The cookie is used to serve relevant ads to the visitor as well as limit the time the visitor sees an and also measure the effectiveness of the campaign.",
                          it: "The cookie is set by rlcdn.com. The cookie is used to serve relevant ads to the visitor as well as limit the time the visitor sees an and also measure the effectiveness of the campaign.",
                          es: "The cookie is set by rlcdn.com. The cookie is used to serve relevant ads to the visitor as well as limit the time the visitor sees an and also measure the effectiveness of the campaign.",
                          nl: "The cookie is set by rlcdn.com. The cookie is used to serve relevant ads to the visitor as well as limit the time the visitor sees an and also measure the effectiveness of the campaign.",
                          bg: "The cookie is set by rlcdn.com. The cookie is used to serve relevant ads to the visitor as well as limit the time the visitor sees an and also measure the effectiveness of the campaign.",
                          ar: "The cookie is set by rlcdn.com. The cookie is used to serve relevant ads to the visitor as well as limit the time the visitor sees an and also measure the effectiveness of the campaign.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".rlcdn.com",
                  },
                  {
                      id: 49463,
                      cookie_id: "ab",
                      description: {
                          en: "This domain of this cookie is owned by agkn. The cookie is used for targeting and advertising purposes.",
                          de: "This domain of this cookie is owned by agkn. The cookie is used for targeting and advertising purposes.",
                          fr: "This domain of this cookie is owned by agkn. The cookie is used for targeting and advertising purposes.",
                          it: "This domain of this cookie is owned by agkn. The cookie is used for targeting and advertising purposes.",
                          es: "This domain of this cookie is owned by agkn. The cookie is used for targeting and advertising purposes.",
                          nl: "This domain of this cookie is owned by agkn. The cookie is used for targeting and advertising purposes.",
                          bg: "This domain of this cookie is owned by agkn. The cookie is used for targeting and advertising purposes.",
                          ar: "This domain of this cookie is owned by agkn. The cookie is used for targeting and advertising purposes.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".agkn.com",
                  },
                  {
                      id: 49464,
                      cookie_id: "tuuid",
                      description: {
                          en:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          de:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          fr:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          it:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          es:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          nl:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          bg:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          ar:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".bidswitch.net",
                  },
                  {
                      id: 49466,
                      cookie_id: "tuuid_lu",
                      description: {
                          en:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          de:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          fr:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          it:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          es:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          nl:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          bg:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                          ar:
                              "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".bidswitch.net",
                  },
                  {
                      id: 49467,
                      cookie_id: "TDID",
                      description: {
                          en: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          de: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          fr: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          it: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          es: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          nl: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          bg: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          ar: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".adsrvr.org",
                  },
                  {
                      id: 49468,
                      cookie_id: "_kuid_",
                      description: {
                          en: "The cookie is set by Krux Digital under the domain krxd.net. The cookie stores a unique ID to identify a returning user for the purpose of targeted advertising.",
                          de: "The cookie is set by Krux Digital under the domain krxd.net. The cookie stores a unique ID to identify a returning user for the purpose of targeted advertising.",
                          fr: "The cookie is set by Krux Digital under the domain krxd.net. The cookie stores a unique ID to identify a returning user for the purpose of targeted advertising.",
                          it: "The cookie is set by Krux Digital under the domain krxd.net. The cookie stores a unique ID to identify a returning user for the purpose of targeted advertising.",
                          es: "The cookie is set by Krux Digital under the domain krxd.net. The cookie stores a unique ID to identify a returning user for the purpose of targeted advertising.",
                          nl: "The cookie is set by Krux Digital under the domain krxd.net. The cookie stores a unique ID to identify a returning user for the purpose of targeted advertising.",
                          bg: "The cookie is set by Krux Digital under the domain krxd.net. The cookie stores a unique ID to identify a returning user for the purpose of targeted advertising.",
                          ar: "The cookie is set by Krux Digital under the domain krxd.net. The cookie stores a unique ID to identify a returning user for the purpose of targeted advertising.",
                      },
                      duration: "5 months",
                      type: "http",
                      domain: ".krxd.net",
                  },
                  {
                      id: 49471,
                      cookie_id: "pxrc",
                      description: {
                          en: "The purpose of the cookie is to identify a visitor to serve relevant advertisement.",
                          de: "The purpose of the cookie is to identify a visitor to serve relevant advertisement.",
                          fr: "The purpose of the cookie is to identify a visitor to serve relevant advertisement.",
                          it: "The purpose of the cookie is to identify a visitor to serve relevant advertisement.",
                          es: "The purpose of the cookie is to identify a visitor to serve relevant advertisement.",
                          nl: "The purpose of the cookie is to identify a visitor to serve relevant advertisement.",
                          bg: "The purpose of the cookie is to identify a visitor to serve relevant advertisement.",
                          ar: "The purpose of the cookie is to identify a visitor to serve relevant advertisement.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".rlcdn.com",
                  },
                  {
                      id: 49472,
                      cookie_id: "bkdc",
                      description: {
                          en:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          de:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          fr:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          it:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          es:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          nl:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          bg:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          ar:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                      },
                      duration: "5 months",
                      type: "http",
                      domain: ".bluekai.com",
                  },
                  {
                      id: 49474,
                      cookie_id: "bku",
                      description: {
                          en:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          de:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          fr:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          it:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          es:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          nl:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          bg:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                          ar:
                              "This cookie is set by Bluekai. This cookie stores anonymized data about the users' web usage as well as aggregate anonymous activities to build a profile to provide more targeted and relevant marketing and advertising.",
                      },
                      duration: "5 months",
                      type: "http",
                      domain: ".bluekai.com",
                  },
                  {
                      id: 49476,
                      cookie_id: "TDCPM",
                      description: {
                          en: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          de: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          fr: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          it: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          es: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          nl: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          bg: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                          ar: "The cookie is set by CloudFare service to store a unique ID to identify a returning users device which then is used for targeted advertising.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".adsrvr.org",
                  },
                  {
                      id: 49477,
                      cookie_id: "dpm",
                      description: {
                          en: "The cookie is set by demdex.net. This cookie assigns a unique ID to each visiting user that allows third-party advertisers target that users with relevant ads.",
                          de: "The cookie is set by demdex.net. This cookie assigns a unique ID to each visiting user that allows third-party advertisers target that users with relevant ads.",
                          fr: "The cookie is set by demdex.net. This cookie assigns a unique ID to each visiting user that allows third-party advertisers target that users with relevant ads.",
                          it: "The cookie is set by demdex.net. This cookie assigns a unique ID to each visiting user that allows third-party advertisers target that users with relevant ads.",
                          es: "The cookie is set by demdex.net. This cookie assigns a unique ID to each visiting user that allows third-party advertisers target that users with relevant ads.",
                          nl: "The cookie is set by demdex.net. This cookie assigns a unique ID to each visiting user that allows third-party advertisers target that users with relevant ads.",
                          bg: "The cookie is set by demdex.net. This cookie assigns a unique ID to each visiting user that allows third-party advertisers target that users with relevant ads.",
                          ar: "The cookie is set by demdex.net. This cookie assigns a unique ID to each visiting user that allows third-party advertisers target that users with relevant ads.",
                      },
                      duration: "5 months",
                      type: "http",
                      domain: ".dpm.demdex.net",
                  },
                  {
                      id: 49478,
                      cookie_id: "mako_uid",
                      description: {
                          en:
                              "This cookie is set under the domain ps.eyeota.net. The cookies is used to collect data about the users' visit to the website such as the pages visited. The data is used to create a users' profile in terms of their interest and demographic. This data is used for targeted advertising and marketing.",
                          de:
                              "This cookie is set under the domain ps.eyeota.net. The cookies is used to collect data about the users' visit to the website such as the pages visited. The data is used to create a users' profile in terms of their interest and demographic. This data is used for targeted advertising and marketing.",
                          fr:
                              "This cookie is set under the domain ps.eyeota.net. The cookies is used to collect data about the users' visit to the website such as the pages visited. The data is used to create a users' profile in terms of their interest and demographic. This data is used for targeted advertising and marketing.",
                          it:
                              "This cookie is set under the domain ps.eyeota.net. The cookies is used to collect data about the users' visit to the website such as the pages visited. The data is used to create a users' profile in terms of their interest and demographic. This data is used for targeted advertising and marketing.",
                          es:
                              "This cookie is set under the domain ps.eyeota.net. The cookies is used to collect data about the users' visit to the website such as the pages visited. The data is used to create a users' profile in terms of their interest and demographic. This data is used for targeted advertising and marketing.",
                          nl:
                              "This cookie is set under the domain ps.eyeota.net. The cookies is used to collect data about the users' visit to the website such as the pages visited. The data is used to create a users' profile in terms of their interest and demographic. This data is used for targeted advertising and marketing.",
                          bg:
                              "This cookie is set under the domain ps.eyeota.net. The cookies is used to collect data about the users' visit to the website such as the pages visited. The data is used to create a users' profile in terms of their interest and demographic. This data is used for targeted advertising and marketing.",
                          ar:
                              "This cookie is set under the domain ps.eyeota.net. The cookies is used to collect data about the users' visit to the website such as the pages visited. The data is used to create a users' profile in terms of their interest and demographic. This data is used for targeted advertising and marketing.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".eyeota.net",
                  },
                  {
                      id: 49482,
                      cookie_id: "EE",
                      description: {
                          en:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          de:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          fr:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          it:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          es:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          nl:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          bg:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          ar:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                      },
                      duration: "3 months",
                      type: "http",
                      domain: ".exelator.com",
                  },
                  {
                      id: 49483,
                      cookie_id: "ud",
                      description: {
                          en:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          de:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          fr:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          it:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          es:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          nl:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          bg:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                          ar:
                              "This cookie is set by exelator.com. The cookies is used to store information about users' visit to the website. The data includes the number of visits, average time spent on the website, and the pages that have been loaded. This information is used to provide the users customized and targeted ads.",
                      },
                      duration: "3 months",
                      type: "http",
                      domain: ".exelator.com",
                  },
                  {
                      id: 49485,
                      cookie_id: "uuid",
                      description: {
                          en: "To optimize ad relevance by collecting visitor data from multiple websites such as what pages have been loaded.",
                          de: "To optimize ad relevance by collecting visitor data from multiple websites such as what pages have been loaded.",
                          fr: "To optimize ad relevance by collecting visitor data from multiple websites such as what pages have been loaded.",
                          it: "To optimize ad relevance by collecting visitor data from multiple websites such as what pages have been loaded.",
                          es: "To optimize ad relevance by collecting visitor data from multiple websites such as what pages have been loaded.",
                          nl: "To optimize ad relevance by collecting visitor data from multiple websites such as what pages have been loaded.",
                          bg: "To optimize ad relevance by collecting visitor data from multiple websites such as what pages have been loaded.",
                          ar: "To optimize ad relevance by collecting visitor data from multiple websites such as what pages have been loaded.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".mathtag.com",
                  },
                  {
                      id: 49488,
                      cookie_id: "uid",
                      description: {
                          en:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments.",
                          de:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments.",
                          fr:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments.",
                          it:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments.",
                          es:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments.",
                          nl:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments.",
                          bg:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments.",
                          ar:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".adotmob.com",
                  },
                  {
                      id: 49503,
                      cookie_id: "DSID",
                      description: {
                          en: "This cookie is setup by doubleclick.net. This cookie is used by Google to make advertising more engaging to users and are stored under doubleclick.net. It contains an encrypted unique ID.",
                          de: "This cookie is setup by doubleclick.net. This cookie is used by Google to make advertising more engaging to users and are stored under doubleclick.net. It contains an encrypted unique ID.",
                          fr: "This cookie is setup by doubleclick.net. This cookie is used by Google to make advertising more engaging to users and are stored under doubleclick.net. It contains an encrypted unique ID.",
                          it: "This cookie is setup by doubleclick.net. This cookie is used by Google to make advertising more engaging to users and are stored under doubleclick.net. It contains an encrypted unique ID.",
                          es: "This cookie is setup by doubleclick.net. This cookie is used by Google to make advertising more engaging to users and are stored under doubleclick.net. It contains an encrypted unique ID.",
                          nl: "This cookie is setup by doubleclick.net. This cookie is used by Google to make advertising more engaging to users and are stored under doubleclick.net. It contains an encrypted unique ID.",
                          bg: "This cookie is setup by doubleclick.net. This cookie is used by Google to make advertising more engaging to users and are stored under doubleclick.net. It contains an encrypted unique ID.",
                          ar: "This cookie is setup by doubleclick.net. This cookie is used by Google to make advertising more engaging to users and are stored under doubleclick.net. It contains an encrypted unique ID.",
                      },
                      duration: "1 hour",
                      type: "https",
                      domain: ".doubleclick.net",
                  },
                  {
                      id: 49504,
                      cookie_id: "_rxuuid",
                      description: {
                          en:
                              "The main purpose of this cookie is targeting, advertesing and effective marketing. This cookie is used to set a unique ID to the visitors, which allow third party advertisers to target the visitors with relevant advertisement up to 1 year.",
                          de:
                              "The main purpose of this cookie is targeting, advertesing and effective marketing. This cookie is used to set a unique ID to the visitors, which allow third party advertisers to target the visitors with relevant advertisement up to 1 year.",
                          fr:
                              "The main purpose of this cookie is targeting, advertesing and effective marketing. This cookie is used to set a unique ID to the visitors, which allow third party advertisers to target the visitors with relevant advertisement up to 1 year.",
                          it:
                              "The main purpose of this cookie is targeting, advertesing and effective marketing. This cookie is used to set a unique ID to the visitors, which allow third party advertisers to target the visitors with relevant advertisement up to 1 year.",
                          es:
                              "The main purpose of this cookie is targeting, advertesing and effective marketing. This cookie is used to set a unique ID to the visitors, which allow third party advertisers to target the visitors with relevant advertisement up to 1 year.",
                          nl:
                              "The main purpose of this cookie is targeting, advertesing and effective marketing. This cookie is used to set a unique ID to the visitors, which allow third party advertisers to target the visitors with relevant advertisement up to 1 year.",
                          bg:
                              "The main purpose of this cookie is targeting, advertesing and effective marketing. This cookie is used to set a unique ID to the visitors, which allow third party advertisers to target the visitors with relevant advertisement up to 1 year.",
                          ar:
                              "The main purpose of this cookie is targeting, advertesing and effective marketing. This cookie is used to set a unique ID to the visitors, which allow third party advertisers to target the visitors with relevant advertisement up to 1 year.",
                      },
                      duration: "1 year",
                      type: "https",
                      domain: ".1rx.io",
                  },
                  {
                      id: 49505,
                      cookie_id: "bsw_uid",
                      description: {
                          en: "This cookie is used to identify the visitors on their visits, across devices. It allows the website to show relevant advertisement to visitors.",
                          de: "This cookie is used to identify the visitors on their visits, across devices. It allows the website to show relevant advertisement to visitors.",
                          fr: "This cookie is used to identify the visitors on their visits, across devices. It allows the website to show relevant advertisement to visitors.",
                          it: "This cookie is used to identify the visitors on their visits, across devices. It allows the website to show relevant advertisement to visitors.",
                          es: "This cookie is used to identify the visitors on their visits, across devices. It allows the website to show relevant advertisement to visitors.",
                          nl: "This cookie is used to identify the visitors on their visits, across devices. It allows the website to show relevant advertisement to visitors.",
                          bg: "This cookie is used to identify the visitors on their visits, across devices. It allows the website to show relevant advertisement to visitors.",
                          ar: "This cookie is used to identify the visitors on their visits, across devices. It allows the website to show relevant advertisement to visitors.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: "rtb.4finance.com",
                  },
                  {
                      id: 49512,
                      cookie_id: "ruds",
                      description: {
                          en:
                              'The domain of this cookie is owned by Rocketfuel. This cookie is a session cookie version of the "rud" cookie. It contain the user ID information. It is used to deliver targeted advertising across the networks.',
                          de:
                              'The domain of this cookie is owned by Rocketfuel. This cookie is a session cookie version of the "rud" cookie. It contain the user ID information. It is used to deliver targeted advertising across the networks.',
                          fr:
                              'The domain of this cookie is owned by Rocketfuel. This cookie is a session cookie version of the "rud" cookie. It contain the user ID information. It is used to deliver targeted advertising across the networks.',
                          it:
                              'The domain of this cookie is owned by Rocketfuel. This cookie is a session cookie version of the "rud" cookie. It contain the user ID information. It is used to deliver targeted advertising across the networks.',
                          es:
                              'The domain of this cookie is owned by Rocketfuel. This cookie is a session cookie version of the "rud" cookie. It contain the user ID information. It is used to deliver targeted advertising across the networks.',
                          nl:
                              'The domain of this cookie is owned by Rocketfuel. This cookie is a session cookie version of the "rud" cookie. It contain the user ID information. It is used to deliver targeted advertising across the networks.',
                          bg:
                              'The domain of this cookie is owned by Rocketfuel. This cookie is a session cookie version of the "rud" cookie. It contain the user ID information. It is used to deliver targeted advertising across the networks.',
                          ar:
                              'The domain of this cookie is owned by Rocketfuel. This cookie is a session cookie version of the "rud" cookie. It contain the user ID information. It is used to deliver targeted advertising across the networks.',
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".rfihub.com",
                  },
                  {
                      id: 49514,
                      cookie_id: "rud",
                      description: {
                          en:
                              "The domain of this cookie is owned by Rocketfuel. The main purpose of this cookie is advertising. This cookie is used to identify an user by an alphanumeric ID. It register the user data like IP, location, visited website, ads clicked etc with this it optimize the ads display based on user behaviour.",
                          de:
                              "The domain of this cookie is owned by Rocketfuel. The main purpose of this cookie is advertising. This cookie is used to identify an user by an alphanumeric ID. It register the user data like IP, location, visited website, ads clicked etc with this it optimize the ads display based on user behaviour.",
                          fr:
                              "The domain of this cookie is owned by Rocketfuel. The main purpose of this cookie is advertising. This cookie is used to identify an user by an alphanumeric ID. It register the user data like IP, location, visited website, ads clicked etc with this it optimize the ads display based on user behaviour.",
                          it:
                              "The domain of this cookie is owned by Rocketfuel. The main purpose of this cookie is advertising. This cookie is used to identify an user by an alphanumeric ID. It register the user data like IP, location, visited website, ads clicked etc with this it optimize the ads display based on user behaviour.",
                          es:
                              "The domain of this cookie is owned by Rocketfuel. The main purpose of this cookie is advertising. This cookie is used to identify an user by an alphanumeric ID. It register the user data like IP, location, visited website, ads clicked etc with this it optimize the ads display based on user behaviour.",
                          nl:
                              "The domain of this cookie is owned by Rocketfuel. The main purpose of this cookie is advertising. This cookie is used to identify an user by an alphanumeric ID. It register the user data like IP, location, visited website, ads clicked etc with this it optimize the ads display based on user behaviour.",
                          bg:
                              "The domain of this cookie is owned by Rocketfuel. The main purpose of this cookie is advertising. This cookie is used to identify an user by an alphanumeric ID. It register the user data like IP, location, visited website, ads clicked etc with this it optimize the ads display based on user behaviour.",
                          ar:
                              "The domain of this cookie is owned by Rocketfuel. The main purpose of this cookie is advertising. This cookie is used to identify an user by an alphanumeric ID. It register the user data like IP, location, visited website, ads clicked etc with this it optimize the ads display based on user behaviour.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".rfihub.com",
                  },
                  {
                      id: 49520,
                      cookie_id: "mc",
                      description: {
                          en: "This cookie is associated with Quantserve to track anonymously how a user interact with the website.",
                          de: "This cookie is associated with Quantserve to track anonymously how a user interact with the website.",
                          fr: "This cookie is associated with Quantserve to track anonymously how a user interact with the website.",
                          it: "This cookie is associated with Quantserve to track anonymously how a user interact with the website.",
                          es: "This cookie is associated with Quantserve to track anonymously how a user interact with the website.",
                          nl: "This cookie is associated with Quantserve to track anonymously how a user interact with the website.",
                          bg: "This cookie is associated with Quantserve to track anonymously how a user interact with the website.",
                          ar: "This cookie is associated with Quantserve to track anonymously how a user interact with the website.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".quantserve.com",
                  },
                  {
                      id: 49532,
                      cookie_id: "_cc_dc",
                      description: {
                          en:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          de:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          fr:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          it:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          es:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          nl:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          bg:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          ar:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                      },
                      duration: "8 months",
                      type: "http",
                      domain: ".crwdcntrl.net",
                  },
                  {
                      id: 49533,
                      cookie_id: "_cc_id",
                      description: {
                          en:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          de:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          fr:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          it:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          es:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          nl:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          bg:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          ar:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                      },
                      duration: "8 months",
                      type: "http",
                      domain: ".crwdcntrl.net",
                  },
                  {
                      id: 49534,
                      cookie_id: "_cc_cc",
                      description: {
                          en:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          de:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          fr:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          it:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          es:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          nl:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          bg:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          ar:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                      },
                      duration: "8 months",
                      type: "http",
                      domain: ".crwdcntrl.net",
                  },
                  {
                      id: 49535,
                      cookie_id: "_cc_aud",
                      description: {
                          en:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          de:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          fr:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          it:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          es:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          nl:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          bg:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                          ar:
                              "The cookie is set by crwdcntrl.net. The purpose of the cookie is to collect statistical information in an anonymous form about the visitors of the website. The data collected include number of visits, average time spent on the website, and the what pages have been loaded. These data are then used to segment audiences based on the geographical location, demographic, and user interest provide relevant content and for advertisers for targeted advertising.",
                      },
                      duration: "8 months",
                      type: "http",
                      domain: ".crwdcntrl.net",
                  },
                  {
                      id: 49536,
                      cookie_id: "id",
                      description: {
                          en:
                              "New Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nNew Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.",
                          de:
                              "New Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nNew Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.",
                          fr:
                              "New Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nNew Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.",
                          it:
                              "New Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nNew Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.",
                          es:
                              "New Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nNew Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.",
                          nl:
                              "New Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nNew Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.",
                          bg:
                              "New Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nNew Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.",
                          ar:
                              "New Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nNew Cookie Dictionary\r\nNew Cookie Dictionary\r\n100%\r\n10\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\nScreen reader support enabled.\r\n \r\n \r\n \t\t\r\n\r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.\r\n \r\nThe main purpose of this cookie is targeting and advertising. It is used to create a profile of the user's interest and to show relevant ads on their site. This Cookie is set by DoubleClick which is owned by Google.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: "go.flx1.com",
                  },
                  {
                      id: 49548,
                      cookie_id: "bito",
                      description: {
                          en: "This cookie is set by bidr.io for advertisement purposes.",
                          de: "This cookie is set by bidr.io for advertisement purposes.",
                          fr: "This cookie is set by bidr.io for advertisement purposes.",
                          it: "This cookie is set by bidr.io for advertisement purposes.",
                          es: "This cookie is set by bidr.io for advertisement purposes.",
                          nl: "This cookie is set by bidr.io for advertisement purposes.",
                          bg: "This cookie is set by bidr.io for advertisement purposes.",
                          ar: "This cookie is set by bidr.io for advertisement purposes.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".bidr.io",
                  },
                  {
                      id: 54968,
                      cookie_id: "NID",
                      description: {
                          en: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                          de: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                          fr: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                          it: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                          es: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                          nl: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                          bg: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                          ar: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                      },
                      duration: "6 months",
                      type: "https",
                      domain: ".google.com",
                  },
                  {
                      id: 60868,
                      cookie_id: "test_cookie",
                      description: {
                          en: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the users'' browser supports cookies.",
                          de: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the users'' browser supports cookies.",
                          fr: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the users'' browser supports cookies.",
                          it: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the users'' browser supports cookies.",
                          es: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the users'' browser supports cookies.",
                          nl: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the users'' browser supports cookies.",
                          bg: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the users'' browser supports cookies.",
                          ar: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the users'' browser supports cookies.",
                      },
                      duration: "1 years  19 days  15 hours  21 minutes",
                      type: "https",
                      domain: ".doubleclick.net",
                  },
                  {
                      id: 60874,
                      cookie_id: "VISITOR_INFO1_LIVE",
                      description: {
                          en: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          de: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          fr: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          it: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          es: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          nl: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          bg: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          ar: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                      },
                      duration: "1 years  180 days",
                      type: "https",
                      domain: ".youtube.com",
                  },
                  {
                      id: 61546,
                      cookie_id: "criteo_write_test",
                      description: {
                          en: "This cookie sets a unique ID for the visitors that allows third-party advretisers to target the visitors with relevant advertisement.",
                          de: "This cookie sets a unique ID for the visitors that allows third-party advretisers to target the visitors with relevant advertisement.",
                          fr: "This cookie sets a unique ID for the visitors that allows third-party advretisers to target the visitors with relevant advertisement.",
                          it: "This cookie sets a unique ID for the visitors that allows third-party advretisers to target the visitors with relevant advertisement.",
                          es: "This cookie sets a unique ID for the visitors that allows third-party advretisers to target the visitors with relevant advertisement.",
                          nl: "This cookie sets a unique ID for the visitors that allows third-party advretisers to target the visitors with relevant advertisement.",
                          bg: "This cookie sets a unique ID for the visitors that allows third-party advretisers to target the visitors with relevant advertisement.",
                          ar: "This cookie sets a unique ID for the visitors that allows third-party advretisers to target the visitors with relevant advertisement.",
                      },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "www.dekoria.pl",
                  },
                  {
                      id: 61549,
                      cookie_id: "uuid2",
                      description: {
                          en:
                              "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                          de:
                              "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                          fr:
                              "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                          it:
                              "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                          es:
                              "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                          nl:
                              "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                          bg:
                              "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                          ar:
                              "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                      },
                      duration: "1 years  19 days  17 hours  32 minutes",
                      type: "https",
                      domain: ".adnxs.com",
                  },
              ],
          },
          {
              id: 38614,
              slug: "other",
              order: 6,
              name: { en: "Other", de: "Other", fi: "Other", sl: "Other", "pt-br": "Other" },
              defaultConsent: 1,
              active: 1,
              settings: { ccpa: { doNotSell: "1" } },
              type: 2,
              description: {
                  en: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                  de: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                  fi: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                  sl: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                  "pt-br": "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
              },
              cookies: [
                  {
                      id: 45964,
                      cookie_id: "is_mobile",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".djangotest.weebly.com",
                  },
                  {
                      id: 45973,
                      cookie_id: "sto-id-editor",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 45974,
                      cookie_id: "sto-id-pages",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".weebly.com",
                  },
                  {
                      id: 49350,
                      cookie_id: "ssr-caching",
                      description: {
                          en: "WIX - Indicates how a site was rendered.",
                          de: "WIX - Indicates how a site was rendered.",
                          fr: "WIX - Indicates how a site was rendered.",
                          it: "WIX - Indicates how a site was rendered.",
                          es: "WIX - Indicates how a site was rendered.",
                          nl: "WIX - Indicates how a site was rendered.",
                          bg: "WIX - Indicates how a site was rendered.",
                          ar: "WIX - Indicates how a site was rendered.",
                      },
                      duration: "1 minute",
                      type: "http",
                      domain: "www.lg-elektrotechnik.de",
                  },
                  {
                      id: 49354,
                      cookie_id: "TS01e85bed",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: "www.lg-elektrotechnik.de",
                  },
                  {
                      id: 49355,
                      cookie_id: "bSession",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "30 minutes",
                      type: "http",
                      domain: "www.lg-elektrotechnik.de",
                  },
                  {
                      id: 49356,
                      cookie_id: "TS017096b3",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".www.lg-elektrotechnik.de",
                  },
                  {
                      id: 49406,
                      cookie_id: "CFID",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: "www.ishthehague.nl",
                  },
                  {
                      id: 49407,
                      cookie_id: "CFTOKEN",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "www.ishthehague.nl",
                  },
                  {
                      id: 49409,
                      cookie_id: "ISGOOD",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "29 years",
                      type: "https",
                      domain: "www.ishthehague.nl",
                  },
                  {
                      id: 49410,
                      cookie_id: "__cfruid",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: ".www.ishthehague.nl",
                  },
                  {
                      id: 49411,
                      cookie_id: "civicCookieControl",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 months",
                      type: "http",
                      domain: "www.ishthehague.nl",
                  },
                  {
                      id: 49412,
                      cookie_id: "CFCLIENT_ISHAGUE",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "29 years",
                      type: "http",
                      domain: "www.ishthehague.nl",
                  },
                  {
                      id: 49413,
                      cookie_id: "CFGLOBALS",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "29 years",
                      type: "https",
                      domain: "www.ishthehague.nl",
                  },
                  {
                      id: 49444,
                      cookie_id: "sync_601df59f-1277-41ba-926e-92b25c5e28bd",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 day",
                      type: "http",
                      domain: "px.powerlinks.com",
                  },
                  {
                      id: 49445,
                      cookie_id: "userID",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "7979 years",
                      type: "http",
                      domain: ".sphereup.com",
                  },
                  {
                      id: 49452,
                      cookie_id: "__gfp_64b",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".israelhayom.co.il",
                  },
                  {
                      id: 49453,
                      cookie_id: "Gtest",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "5 years",
                      type: "http",
                      domain: ".hit.gemius.pl",
                  },
                  {
                      id: 49458,
                      cookie_id: "Gdyn",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "5 years",
                      type: "http",
                      domain: ".hit.gemius.pl",
                  },
                  {
                      id: 49459,
                      cookie_id: "obuid",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 months",
                      type: "http",
                      domain: ".outbrain.com",
                  },
                  {
                      id: 49460,
                      cookie_id: "logglytrackingsession",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: "www.israelhayom.co.il",
                  },
                  {
                      id: 49461,
                      cookie_id: "OB-USER-TOKEN",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 months",
                      type: "http",
                      domain: ".israelhayom.co.il",
                  },
                  {
                      id: 49465,
                      cookie_id: "c",
                      description: {
                          en: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                          de: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                          fr: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                          it: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                          es: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                          nl: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                          bg: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                          ar: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".bidswitch.net",
                  },
                  {
                      id: 49473,
                      cookie_id: "bkpa",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "5 months",
                      type: "http",
                      domain: ".bluekai.com",
                  },
                  {
                      id: 49475,
                      cookie_id: "ssh",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".mfadsrvr.com",
                  },
                  {
                      id: 49480,
                      cookie_id: "gdpr_status",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "6 months",
                      type: "http",
                      domain: ".media.net",
                  },
                  {
                      id: 49481,
                      cookie_id: "data-bs",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "11 months",
                      type: "http",
                      domain: ".media.net",
                  },
                  {
                      id: 49484,
                      cookie_id: "zuid",
                      description: {
                          en: "The cookie domain is owned by Zemanta.This is used to identify the trusted web traffic by the content network, Cloudflare.",
                          de: "The cookie domain is owned by Zemanta.This is used to identify the trusted web traffic by the content network, Cloudflare.",
                          fr: "The cookie domain is owned by Zemanta.This is used to identify the trusted web traffic by the content network, Cloudflare.",
                          it: "The cookie domain is owned by Zemanta.This is used to identify the trusted web traffic by the content network, Cloudflare.",
                          es: "The cookie domain is owned by Zemanta.This is used to identify the trusted web traffic by the content network, Cloudflare.",
                          nl: "The cookie domain is owned by Zemanta.This is used to identify the trusted web traffic by the content network, Cloudflare.",
                          bg: "The cookie domain is owned by Zemanta.This is used to identify the trusted web traffic by the content network, Cloudflare.",
                          ar: "The cookie domain is owned by Zemanta.This is used to identify the trusted web traffic by the content network, Cloudflare.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".zemanta.com",
                  },
                  {
                      id: 49486,
                      cookie_id: "u",
                      description: {
                          en: "The purpose of this cookie is targeting and marketing.The domain of this cookie is related with a company called Bombora in USA.",
                          de: "The purpose of this cookie is targeting and marketing.The domain of this cookie is related with a company called Bombora in USA.",
                          fr: "The purpose of this cookie is targeting and marketing.The domain of this cookie is related with a company called Bombora in USA.",
                          it: "The purpose of this cookie is targeting and marketing.The domain of this cookie is related with a company called Bombora in USA.",
                          es: "The purpose of this cookie is targeting and marketing.The domain of this cookie is related with a company called Bombora in USA.",
                          nl: "The purpose of this cookie is targeting and marketing.The domain of this cookie is related with a company called Bombora in USA.",
                          bg: "The purpose of this cookie is targeting and marketing.The domain of this cookie is related with a company called Bombora in USA.",
                          ar: "The purpose of this cookie is targeting and marketing.The domain of this cookie is related with a company called Bombora in USA.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".creativecdn.com",
                  },
                  {
                      id: 49489,
                      cookie_id: "partners",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".adotmob.com",
                  },
                  {
                      id: 49490,
                      cookie_id: "actvagnt",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".outbrain.com",
                  },
                  {
                      id: 49491,
                      cookie_id: "mdfrc",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".outbrain.com",
                  },
                  {
                      id: 49492,
                      cookie_id: "ttd",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".outbrain.com",
                  },
                  {
                      id: 49493,
                      cookie_id: "gdpid",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".geistm.com",
                  },
                  {
                      id: 49494,
                      cookie_id: "UIDR",
                      description: {
                          en:
                              "This cookie is set bu scorecardresearch.com. The cookie is used to tracks the users activity across the internet on the browser such as visit timestamp, IP address, and most recently visited webpages. and may the data send to 3rd party for analysis and reporting to help their clients better understand user preferences.",
                          de:
                              "This cookie is set bu scorecardresearch.com. The cookie is used to tracks the users activity across the internet on the browser such as visit timestamp, IP address, and most recently visited webpages. and may the data send to 3rd party for analysis and reporting to help their clients better understand user preferences.",
                          fr:
                              "This cookie is set bu scorecardresearch.com. The cookie is used to tracks the users activity across the internet on the browser such as visit timestamp, IP address, and most recently visited webpages. and may the data send to 3rd party for analysis and reporting to help their clients better understand user preferences.",
                          it:
                              "This cookie is set bu scorecardresearch.com. The cookie is used to tracks the users activity across the internet on the browser such as visit timestamp, IP address, and most recently visited webpages. and may the data send to 3rd party for analysis and reporting to help their clients better understand user preferences.",
                          es:
                              "This cookie is set bu scorecardresearch.com. The cookie is used to tracks the users activity across the internet on the browser such as visit timestamp, IP address, and most recently visited webpages. and may the data send to 3rd party for analysis and reporting to help their clients better understand user preferences.",
                          nl:
                              "This cookie is set bu scorecardresearch.com. The cookie is used to tracks the users activity across the internet on the browser such as visit timestamp, IP address, and most recently visited webpages. and may the data send to 3rd party for analysis and reporting to help their clients better understand user preferences.",
                          bg:
                              "This cookie is set bu scorecardresearch.com. The cookie is used to tracks the users activity across the internet on the browser such as visit timestamp, IP address, and most recently visited webpages. and may the data send to 3rd party for analysis and reporting to help their clients better understand user preferences.",
                          ar:
                              "This cookie is set bu scorecardresearch.com. The cookie is used to tracks the users activity across the internet on the browser such as visit timestamp, IP address, and most recently visited webpages. and may the data send to 3rd party for analysis and reporting to help their clients better understand user preferences.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".scorecardresearch.com",
                  },
                  {
                      id: 49495,
                      cookie_id: "rtbhs",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".outbrain.com",
                  },
                  {
                      id: 49496,
                      cookie_id: "bdswch",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".outbrain.com",
                  },
                  {
                      id: 49497,
                      cookie_id: "pwrlnks",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".outbrain.com",
                  },
                  {
                      id: 49498,
                      cookie_id: "zmnta",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".outbrain.com",
                  },
                  {
                      id: 49499,
                      cookie_id: "adot",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".outbrain.com",
                  },
                  {
                      id: 49500,
                      cookie_id: "ab_23184267",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 week",
                      type: "https",
                      domain: "zdwidget3-bs.sphereup.com",
                  },
                  {
                      id: 49501,
                      cookie_id: "zdSessionId_23184267",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 day",
                      type: "http",
                      domain: "www.israelhayom.co.il",
                  },
                  {
                      id: 49502,
                      cookie_id: "23184267-ehtoken",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "7 minutes",
                      type: "http",
                      domain: "www.israelhayom.co.il",
                  },
                  {
                      id: 49506,
                      cookie_id: "HAPLB5S",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".go.sonobi.com",
                  },
                  {
                      id: 49507,
                      cookie_id: "tluid",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 months",
                      type: "http",
                      domain: ".3lift.com",
                  },
                  {
                      id: 49508,
                      cookie_id: "am-uid",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".admixer.net",
                  },
                  {
                      id: 49509,
                      cookie_id: "stx_user_id",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".sharethrough.com",
                  },
                  {
                      id: 49510,
                      cookie_id: "smxtrack",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "11 months",
                      type: "http",
                      domain: ".smadex.com",
                  },
                  {
                      id: 49511,
                      cookie_id: "ayl_visitor",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".omnitagjs.com",
                  },
                  {
                      id: 49515,
                      cookie_id: "__adm_ui",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "11 months",
                      type: "http",
                      domain: ".admatic.com.tr",
                  },
                  {
                      id: 49516,
                      cookie_id: "__adm_uiex",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "11 months",
                      type: "http",
                      domain: ".admatic.com.tr",
                  },
                  {
                      id: 49517,
                      cookie_id: "__adm_usyncc",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "5 days",
                      type: "http",
                      domain: ".admatic.com.tr",
                  },
                  {
                      id: 49521,
                      cookie_id: "cref",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".quantserve.com",
                  },
                  {
                      id: 49522,
                      cookie_id: "device_uuid",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "49 years",
                      type: "http",
                      domain: ".spot.im",
                  },
                  {
                      id: 49523,
                      cookie_id: "ig_did",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "9 years",
                      type: "https",
                      domain: ".instagram.com",
                  },
                  {
                      id: 49527,
                      cookie_id: "syncUuid",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: "lb.artipbox.net",
                  },
                  {
                      id: 49528,
                      cookie_id: "access_token",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "10 months",
                      type: "https",
                      domain: ".spot.im",
                  },
                  {
                      id: 49529,
                      cookie_id: "spotim-device-v2",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "5 days",
                      type: "https",
                      domain: ".spot.im",
                  },
                  {
                      id: 49530,
                      cookie_id: "AMSYNC",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "10 hours",
                      type: "http",
                      domain: ".israelhayom-cdnwiz.com",
                  },
                  {
                      id: 49531,
                      cookie_id: "check",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 day",
                      type: "http",
                      domain: "go.flx1.com",
                  },
                  {
                      id: 49537,
                      cookie_id: "R",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 week",
                      type: "http",
                      domain: "go.flx1.com",
                  },
                  {
                      id: 49538,
                      cookie_id: "BIGipServerd.co.il_2.0_pool_https",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "www.d.co.il",
                  },
                  {
                      id: 49539,
                      cookie_id: "TS0127ef94",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".d.co.il",
                  },
                  {
                      id: 49540,
                      cookie_id: "AMUUID",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "7979 years",
                      type: "http",
                      domain: ".israelhayom-cdnwiz.com",
                  },
                  {
                      id: 49541,
                      cookie_id: "AMZAP",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 week",
                      type: "http",
                      domain: ".israelhayom-cdnwiz.com",
                  },
                  {
                      id: 49542,
                      cookie_id: "AMWEEZMO_A",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 day",
                      type: "http",
                      domain: ".israelhayom-cdnwiz.com",
                  },
                  {
                      id: 49543,
                      cookie_id: "09092020_DC",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".israelhayom-cdnwiz.com",
                  },
                  {
                      id: 49544,
                      cookie_id: "08092020_ca",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 month",
                      type: "http",
                      domain: ".israelhayom-cdnwiz.com",
                  },
                  {
                      id: 49545,
                      cookie_id: "PairzonID",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".pairzon.com",
                  },
                  {
                      id: 49546,
                      cookie_id: "BIGipServerb3tacore.zap.co.il",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "www.zap.co.il",
                  },
                  {
                      id: 49547,
                      cookie_id: "TS01920653",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: ".www.zap.co.il",
                  },
                  {
                      id: 49549,
                      cookie_id: "bitoIsSecure",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".bidr.io",
                  },
                  {
                      id: 50144,
                      cookie_id: "rc2c-lang_code",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 50145,
                      cookie_id: "rc2c-currency",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 50146,
                      cookie_id: "rc2c-erotica",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 50147,
                      cookie_id: "rc2c-listing-layout",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 50148,
                      cookie_id: "rc2c-pop",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 50149,
                      cookie_id: "rc2c-sort",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 50150,
                      cookie_id: "rc2c-view",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 50152,
                      cookie_id: "acc_segment",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 week",
                      type: "http",
                      domain: "www.opineo.pl",
                  },
                  {
                      id: 50153,
                      cookie_id: "rc_site_open_7922",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 50154,
                      cookie_id: "misTime",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 50155,
                      cookie_id: "mis",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "9 years",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 54959,
                      cookie_id: "shopify_web_return_to",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "5 minutes",
                      type: "https",
                      domain: "my-workplaces.myshopify.com",
                  },
                  {
                      id: 54960,
                      cookie_id: "_master_udr",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 years",
                      type: "https",
                      domain: "my-workplaces.myshopify.com",
                  },
                  {
                      id: 54961,
                      cookie_id: "_secure_admin_session_id_csrf",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "3 months",
                      type: "https",
                      domain: "my-workplaces.myshopify.com",
                  },
                  {
                      id: 54962,
                      cookie_id: "_secure_admin_session_id",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "3 months",
                      type: "https",
                      domain: "my-workplaces.myshopify.com",
                  },
                  {
                      id: 54963,
                      cookie_id: "identity-state",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 day",
                      type: "http",
                      domain: "my-workplaces.myshopify.com",
                  },
                  {
                      id: 54964,
                      cookie_id: "master_device_id",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 years",
                      type: "https",
                      domain: ".shopify.com",
                  },
                  {
                      id: 54965,
                      cookie_id: "_identity_session",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 years",
                      type: "https",
                      domain: "accounts.shopify.com",
                  },
                  {
                      id: 54966,
                      cookie_id: "__Host-_identity_session_same_site",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 years",
                      type: "https",
                      domain: "accounts.shopify.com",
                  },
                  {
                      id: 54967,
                      cookie_id: "device_id",
                      description: {
                          en: "Description is currently not available.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "20 years",
                      type: "http",
                      domain: "accounts.shopify.com",
                  },
                  {
                      id: 60865,
                      cookie_id: "preference",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  30 days",
                      type: "http",
                      domain: "",
                  },
                  {
                      id: 60866,
                      cookie_id: "rc2c-sort-news",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "Never Expire",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60867,
                      cookie_id: "_ga_55PYPREWW8",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  20 days  8 hours  52 minutes",
                      type: "http",
                      domain: ".wystroj-okien.pl",
                  },
                  {
                      id: 60870,
                      cookie_id: "_hjid",
                      description: {
                          en:
                              "This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          de:
                              "This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          fr:
                              "This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          it:
                              "This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          es:
                              "This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          nl:
                              "This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          bg:
                              "This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          ar:
                              "This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                      },
                      duration: "1 years  19 days   6 minutes",
                      type: "https",
                      domain: ".wystroj-okien.pl",
                  },
                  {
                      id: 60871,
                      cookie_id: "_hjFirstSeen",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  21 minutes",
                      type: "http",
                      domain: ".wystroj-okien.pl",
                  },
                  {
                      id: 60872,
                      cookie_id: "rc2c-login",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  21 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60873,
                      cookie_id: "filter_slide",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60877,
                      cookie_id: "USER_INFO",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "past",
                      type: "http",
                      domain: "",
                  },
                  {
                      id: 60879,
                      cookie_id: "redcart_info_326",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60880,
                      cookie_id: "rc_repository_7922",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  36 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60881,
                      cookie_id: "redcart_lvp_7922",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  31 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60882,
                      cookie_id: "redcart_info_360",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60883,
                      cookie_id: "redcart_info_362",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60884,
                      cookie_id: "redcart_info_333",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60885,
                      cookie_id: "redcart_info_327",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60886,
                      cookie_id: "redcart_info_332",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60887,
                      cookie_id: "redcart_info_563",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60888,
                      cookie_id: "redcart_info_565",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60889,
                      cookie_id: "redcart_info_561",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60890,
                      cookie_id: "redcart_info_314",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60891,
                      cookie_id: "redcart_info_558",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60892,
                      cookie_id: "redcart_info_310",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60893,
                      cookie_id: "redcart_info_328",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60894,
                      cookie_id: "redcart_info_340",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60895,
                      cookie_id: "redcart_info_373",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60896,
                      cookie_id: "redcart_info_564",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60897,
                      cookie_id: "redcart_info_559",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60898,
                      cookie_id: "redcart_info_291",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60899,
                      cookie_id: "redcart_info_560",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60900,
                      cookie_id: "redcart_info_556",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60901,
                      cookie_id: "redcart_info_336",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60902,
                      cookie_id: "redcart_info_404",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60903,
                      cookie_id: "redcart_info_696",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60904,
                      cookie_id: "redcart_info_375",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60905,
                      cookie_id: "redcart_info_693",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60906,
                      cookie_id: "redcart_info_341",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60907,
                      cookie_id: "redcart_info_454",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60908,
                      cookie_id: "redcart_info_592",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60909,
                      cookie_id: "redcart_info_582",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60910,
                      cookie_id: "redcart_info_525",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60911,
                      cookie_id: "redcart_info_530",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60912,
                      cookie_id: "redcart_info_529",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60913,
                      cookie_id: "redcart_info_523",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60914,
                      cookie_id: "redcart_info_459",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60915,
                      cookie_id: "redcart_info_471",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60916,
                      cookie_id: "redcart_info_527",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60917,
                      cookie_id: "redcart_info_457",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60918,
                      cookie_id: "redcart_info_318",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60919,
                      cookie_id: "redcart_info_594",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60920,
                      cookie_id: "redcart_info_542",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60921,
                      cookie_id: "redcart_info_512",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60922,
                      cookie_id: "redcart_info_613",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60923,
                      cookie_id: "redcart_info_455",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60924,
                      cookie_id: "redcart_info_402",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60925,
                      cookie_id: "redcart_info_298",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60926,
                      cookie_id: "redcart_info_415",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60927,
                      cookie_id: "redcart_info_566",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60928,
                      cookie_id: "redcart_info_464",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60929,
                      cookie_id: "redcart_info_610",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60930,
                      cookie_id: "redcart_info_570",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60931,
                      cookie_id: "redcart_info_509",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60932,
                      cookie_id: "redcart_info_397",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60933,
                      cookie_id: "redcart_info_548",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60934,
                      cookie_id: "redcart_info_478",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60935,
                      cookie_id: "redcart_info_597",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60936,
                      cookie_id: "redcart_info_587",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60937,
                      cookie_id: "redcart_info_518",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60938,
                      cookie_id: "redcart_info_510",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60939,
                      cookie_id: "redcart_info_514",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60940,
                      cookie_id: "redcart_info_462",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60941,
                      cookie_id: "redcart_info_603",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60942,
                      cookie_id: "redcart_info_520",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60943,
                      cookie_id: "redcart_info_519",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60944,
                      cookie_id: "redcart_info_446",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60945,
                      cookie_id: "redcart_info_516",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60946,
                      cookie_id: "redcart_info_505",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60947,
                      cookie_id: "redcart_info_448",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60948,
                      cookie_id: "redcart_info_614",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60949,
                      cookie_id: "redcart_info_449",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60950,
                      cookie_id: "redcart_info_517",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60951,
                      cookie_id: "redcart_info_540",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60952,
                      cookie_id: "redcart_info_425",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60953,
                      cookie_id: "redcart_info_627",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60954,
                      cookie_id: "redcart_info_538",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60955,
                      cookie_id: "redcart_info_598",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60956,
                      cookie_id: "redcart_info_504",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60957,
                      cookie_id: "redcart_info_496",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60958,
                      cookie_id: "redcart_info_442",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 60959,
                      cookie_id: "redcart_info_640",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "wystroj-okien.pl",
                  },
                  {
                      id: 61491,
                      cookie_id: "CookieConsent",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "Never Expire",
                      type: "https",
                      domain: "www.hausbellevue.com",
                  },
                  {
                      id: 61492,
                      cookie_id: "iom_consent",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  25 days  21 hours  32 minutes",
                      type: "https",
                      domain: ".schneehoehen.de",
                  },
                  {
                      id: 61494,
                      cookie_id: "dcs",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  30 days",
                      type: "https",
                      domain: "",
                  },
                  {
                      id: 61495,
                      cookie_id: "i00",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  255 days  3 hours  57 minutes",
                      type: "https",
                      domain: "iocnt.net",
                  },
                  {
                      id: 61496,
                      cookie_id: "ioam2018",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  23 hours  27 minutes",
                      type: "https",
                      domain: ".feratel.com",
                  },
                  {
                      id: 61497,
                      cookie_id: "anProfile",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "Never Expire",
                      type: "https",
                      domain: ".pro-market.net",
                  },
                  {
                      id: 61498,
                      cookie_id: "BNU",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "past",
                      type: "http",
                      domain: ".bravenet.com",
                  },
                  {
                      id: 61500,
                      cookie_id: "HASCOOKIES",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  23 days  6 hours  58 minutes",
                      type: "https",
                      domain: ".bravenet.com",
                  },
                  {
                      id: 61501,
                      cookie_id: "BNETSESSID",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "Never Expire",
                      type: "https",
                      domain: ".bravenet.com",
                  },
                  {
                      id: 61516,
                      cookie_id: "RD_IDAKCS4642",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  5 days",
                      type: "https",
                      domain: "",
                  },
                  {
                      id: 61517,
                      cookie_id: "__goadservices",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "2 years",
                      type: "https",
                      domain: ".goadservices.com",
                  },
                  {
                      id: 61518,
                      cookie_id: "_snrs_3b1cef05aa7027ed36855884ad7a68d2",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "2 years",
                      type: "https",
                      domain: "web.snrbox.com",
                  },
                  {
                      id: 61519,
                      cookie_id: "history",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  30 days",
                      type: "https",
                      domain: ".revhunter.tech",
                  },
                  {
                      id: 61521,
                      cookie_id: "dekoriaplclib",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  32 minutes",
                      type: "https",
                      domain: ".www.dekoria.pl",
                  },
                  {
                      id: 61522,
                      cookie_id: "dekoriaplwllib",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  16 hours  5 minutes",
                      type: "https",
                      domain: ".www.dekoria.pl",
                  },
                  {
                      id: 61523,
                      cookie_id: "www_dekoria_pl_lpcnt_1",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: ".www.dekoria.pl",
                  },
                  {
                      id: 61529,
                      cookie_id: "__wph_a",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days   8 minutes",
                      type: "https",
                      domain: "www.dekoria.pl",
                  },
                  {
                      id: 61530,
                      cookie_id: "__wph_s",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: "www.dekoria.pl",
                  },
                  {
                      id: 61531,
                      cookie_id: "__wph_st",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  23 minutes",
                      type: "https",
                      domain: "www.dekoria.pl",
                  },
                  {
                      id: 61532,
                      cookie_id: "statid",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  20 days  17 hours  39 minutes",
                      type: "https",
                      domain: ".wp.pl",
                  },
                  {
                      id: 61533,
                      cookie_id: "adf",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  16 hours  5 minutes",
                      type: "https",
                      domain: ".revhunter.tech",
                  },
                  {
                      id: 61535,
                      cookie_id: "_dc_gtm_UA-1455913-6",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "https",
                      domain: ".dekoria.pl",
                  },
                  {
                      id: 61543,
                      cookie_id: "adv_awc",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "past",
                      type: "http",
                      domain: "dekoria.pl",
                  },
                  {
                      id: 61544,
                      cookie_id: "__goadservices_test",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: ".dekoria.pl",
                  },
                  {
                      id: 61545,
                      cookie_id: "cto_tld_test",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  22 minutes",
                      type: "http",
                      domain: ".dekoria.pl",
                  },
                  {
                      id: 61547,
                      cookie_id: "cssvarsup",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "past",
                      type: "http",
                      domain: "",
                  },
                  {
                      id: 61548,
                      cookie_id: "anj",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  90 days",
                      type: "https",
                      domain: ".adnxs.com",
                  },
                  {
                      id: 66296,
                      cookie_id: "dekoriadedshopsx",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours",
                      type: "https",
                      domain: "www.dekoria.de",
                  },
                  {
                      id: 66297,
                      cookie_id: "dekoriadeclib",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  56 minutes",
                      type: "https",
                      domain: ".www.dekoria.de",
                  },
                  {
                      id: 66298,
                      cookie_id: "dekoriadewllib",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  16 hours  29 minutes",
                      type: "https",
                      domain: ".www.dekoria.de",
                  },
                  {
                      id: 66299,
                      cookie_id: "www_dekoria_de_newspop",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  23 days  7 hours  22 minutes",
                      type: "https",
                      domain: ".www.dekoria.de",
                  },
                  {
                      id: 66300,
                      cookie_id: "_gat_gtag_UA_8457682_3",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  46 minutes",
                      type: "http",
                      domain: ".dekoria.de",
                  },
                  {
                      id: 66302,
                      cookie_id: "nQ_userVisitId",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  46 minutes",
                      type: "https",
                      domain: "www.dekoria.de",
                  },
                  {
                      id: 66303,
                      cookie_id: "x-cdn",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "Never Expire",
                      type: "https",
                      domain: "paypal.com",
                  },
                  {
                      id: 66304,
                      cookie_id: "tsrce",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  3 days",
                      type: "https",
                      domain: ".paypal.com",
                  },
                  {
                      id: 66305,
                      cookie_id: "l7_az",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  1 days  1 hours  30 minutes",
                      type: "https",
                      domain: "paypal.com",
                  },
                  {
                      id: 66307,
                      cookie_id: "RUL",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years",
                      type: "http",
                      domain: ".doubleclick.net",
                  },
                  {
                      id: 66309,
                      cookie_id: "cf_use_ob",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  19 days  15 hours  46 minutes",
                      type: "https",
                      domain: "cdn2.dekoria.com",
                  },
                  { id: 187156, cookie_id: "121", description: { en: "sdsd", sl: "sdsd" }, duration: "32", type: "http", domain: "sdsd" },
                  {
                      id: 277992,
                      cookie_id: "cookieyes-test",
                      description: {
                          en: "No description",
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
                          se: "No description",
                          cr: "No description",
                          zh: "No description",
                          uk: "No description",
                          sk: "No description",
                          ts: "No description",
                          lt: "No description",
                          cs: "No description",
                          fi: "No description",
                          no: "No description",
                          br: "No description",
                          sl: "No description",
                      },
                      duration: "1 year",
                      type: "https",
                      domain: ".weebly.com",
                  },
                  {
                      id: 277993,
                      cookie_id: "cookieyes-testq",
                      description: {
                          en: "No description",
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
                          se: "No description",
                          cr: "No description",
                          zh: "No description",
                          uk: "No description",
                          sk: "No description",
                          ts: "No description",
                          lt: "No description",
                          cs: "No description",
                          fi: "No description",
                          no: "No description",
                          br: "No description",
                          sl: "No description",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".weebly.com",
                  },
              ],
          },
      ],
      privacyPolicy: {
          title: { en: "Privacy Policy", de: "Datenschutz-Bestimmungen", fi: "Tietosuojak\u00e4yt\u00e4nt\u00f6", sl: "Pravilnik o zasebnosti", "pt-br": "Pol\u00edtica de Privacidade" },
          text: {
              en:
                  "<p>This website uses cookies to improve your experience while you navigate through the website. Out of these cookies, the cookies that are categorized as necessary are stored on your browser as they as essential for the working of basic functionalities of the website. </p><p>We also use third-party cookies that help us analyze and understand how you use this website, to store user preferences and provide them with content and advertisements that are relevant to you. These cookies will only be stored on your browser with your consent to do so. You also have the option to opt-out of these cookies.But opting out of some of these cookies may have an effect on your browsing experience.</p>",
              de:
                  "<p>Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern, w\u00e4hrend Sie durch die Website navigieren. Von diesen Cookies werden die nach Bedarf kategorisierten Cookies in Ihrem Browser gespeichert, da sie f\u00fcr das Funktionieren der Grundfunktionen der Website von wesentlicher Bedeutung sind.</p><p>Wir verwenden auch Cookies von Drittanbietern, mit denen wir analysieren und nachvollziehen k\u00f6nnen, wie Sie diese Website nutzen, um Benutzereinstellungen zu speichern und ihnen f\u00fcr Sie relevante Inhalte und Anzeigen bereitzustellen.</p><p>Diese Cookies werden nur mit Ihrer Zustimmung in Ihrem Browser gespeichert. Sie haben auch die M\u00f6glichkeit, diese Cookies zu deaktivieren. Das Deaktivieren einiger dieser Cookies kann sich jedoch auf Ihr Surferlebnis auswirken.</p>",
              fi:
                  "<p>T\u00e4m\u00e4 verkkosivusto k\u00e4ytt\u00e4\u00e4 ev\u00e4steit\u00e4 k\u00e4ytt\u00f6kokemuksen parantamiseen selatessasi verkkosivustoa. N\u00e4ist\u00e4 ev\u00e4steist\u00e4 tarpeelliseksi luokitellut ev\u00e4steet tallennetaan selaimeesi, koska ne ovat v\u00e4ltt\u00e4m\u00e4tt\u00f6mi\u00e4 verkkosivuston perustoimintojen toiminnalle. </p><p>K\u00e4yt\u00e4mme my\u00f6s kolmansien osapuolten ev\u00e4steit\u00e4, jotka auttavat meit\u00e4 analysoimaan ja ymm\u00e4rt\u00e4m\u00e4\u00e4n, miten k\u00e4yt\u00e4t t\u00e4t\u00e4 verkkosivustoa, tallentamaan k\u00e4ytt\u00e4jien mieltymykset ja tarjoamaan heille sinulle merkityksellist\u00e4 sis\u00e4lt\u00f6\u00e4 ja mainoksia. N\u00e4m\u00e4 ev\u00e4steet tallennetaan selaimeesi vain suostumuksellasi siihen. Sinulla on my\u00f6s mahdollisuus kielt\u00e4yty\u00e4 n\u00e4ist\u00e4 ev\u00e4steist\u00e4, mutta joistakin n\u00e4ist\u00e4 ev\u00e4steist\u00e4 poistaminen voi vaikuttaa selauskokemukseesi.</p>",
              sl:
                  "<p>Ta spletna stran uporablja pi\u0161kotke za izbolj\u0161anje va\u0161e izku\u0161nje med navigacijo po spletni strani. Od teh pi\u0161kotkov so pi\u0161kotki, ki so po potrebi kategorizirani, shranjeni v va\u0161em brskalniku, saj so bistveni za delovanje osnovnih funkcionalnosti spletnega mesta.</p><p>Uporabljamo tudi pi\u0161kotke tretjih oseb, ki nam pomagajo analizirati in razumeti, kako uporabljate to spletno mesto, shranjujemo uporabni\u0161ke nastavitve in jim posredujemo vsebine in oglase, ki so pomembni za vas. Ti pi\u0161kotki bodo shranjeni samo v va\u0161em brskalniku z va\u0161o privolijo, da to storite. Prav tako imate mo\u017enost, da umaknete te pi\u0161kotke. Toda umik iz nekaterih od teh pi\u0161kotkov lahko vpliva na va\u0161o izku\u0161njo brskanja.</p>",
              "pt-br":
                  "<p>Este site usa cookies para melhorar sua experi\u00eancia enquanto voc\u00ea navega pelo site. Desses cookies, os cookies categorizados conforme necess\u00e1rio s\u00e3o armazenados no seu navegador, pois s\u00e3o essenciais para o funcionamento das funcionalidades b\u00e1sicas do site. </p><p>Tamb\u00e9m usamos cookies de terceiros que nos ajudam a analisar e entender como voc\u00ea usa este site, para armazenar as prefer\u00eancias do usu\u00e1rio e fornecer-lhes conte\u00fado e an\u00fancios que s\u00e3o relevantes para voc\u00ea. Esses cookies s\u00f3 ser\u00e3o armazenados no seu navegador com o seu consentimento para faz\u00ea-lo. Voc\u00ea tamb\u00e9m tem a op\u00e7\u00e3o de desativar esses cookies. Mas optar por alguns desses cookies pode ter um efeito na sua experi\u00eancia de navega\u00e7\u00e3o.</p>",
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
          if (ckyconsent == "yes" && getCategoryCookie("cookieyes-" + item.name) == "yes") {
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
