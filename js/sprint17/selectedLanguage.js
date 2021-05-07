try {
  bannerActiveCheck();
} catch (err) {
  console.error(err);
}

var ckyActiveLaw = "";
let ipdata = {};

function count(callback) {
  if (cliConfig.options.selectedLaws.length !== 2) {
      ckyActiveLaw = cliConfig.options.selectedLaws[0];
      console.log(ckyActiveLaw);
      callback(ckyActiveLaw);
  }

  var request = new XMLHttpRequest();
  request.open("GET", "https://geoip.cookieyes.com/geoip/checker/result.php", true);

  request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
          let data = {};
          try {
              data = JSON.parse(this.response);
          } catch {
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
      ];
      let consent_id = getCookie("cookieyesID");
      var request = new XMLHttpRequest();
      var data = new FormData();
      data.append("log", JSON.stringify(log));
      data.append("key", "6b154ddc456d4f03a9359567");
      data.append("ip", ipdata.ip);
      data.append("consent_id", consent_id);
      request.open("POST", "https://app.cookieyes.com/api/v1/log", true);
      request.send(data);
  };
}

console.log(ckyActiveLaw);

function bannerActiveCheck() {
  var isActiveCheckCookiePresent = getCookie("cky-active-check");
  if (!isActiveCheckCookiePresent && window.fetch && window.Promise) {
      fetch("https://active.cookieyes.com/api/6b154ddc456d4f03a9359567/log", { method: "POST" }).catch(function (err) {
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
var tldomain = "fccinnovation.co.uk";
var cliConfig = {
  options: {
      plan: "Basic",
      colors: {
          gdpr: {
              popup: { pills: { bg: "#f2f5fa", activeBg: "#ffffff", textColor: "#000000", activeTextColor: "#000000" } },
              notice: { bg: "#fff", textColor: "#565662", borderColor: "#d4d8df" },
              buttons: {
                  accept: { bg: "#DA11D4", textColor: "#fff", borderColor: "#DA11D4" },
                  reject: { bg: "#dedfe0", textColor: "#717375", borderColor: "transparent" },
                  readMore: { bg: "transparent", textColor: "#565662", borderColor: "transparent" },
                  settings: { bg: "transparent", textColor: "#7f7f7f", borderColor: "#ebebeb" },
              },
          },
      },
      content: {
          gdpr: {
              text: {
                  bg:
                      "\u0422\u043e\u0437\u0438 \u0441\u0430\u0439\u0442 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438, \u0437\u0430 \u0434\u0430 \u043f\u043e\u0434\u043e\u0431\u0440\u0438 \u0412\u0430\u0448\u0438\u044f \u043e\u043f\u0438\u0442. \u041d\u0438\u0435 \u0449\u0435 \u043f\u0440\u0438\u0435\u043c\u0435\u043c, \u0447\u0435 \u0441\u0442\u0435 \u0441\u044a\u0433\u043b\u0430\u0441\u043d\u0438 \u0441 \u0442\u043e\u0432\u0430, \u043d\u043e \u043c\u043e\u0436\u0435\u0442\u0435 \u0434\u0430 \u0441\u0435 \u043e\u0442\u043a\u0430\u0436\u0435\u0442\u0435, \u0430\u043a\u043e \u0436\u0435\u043b\u0430\u0435\u0442\u0435.",
                  da: "Dette websted bruger cookies til at forbedre din oplevelse. Vi antager, at du er ok med dette, men du kan frav\u00e6lge det, hvis du \u00f8nsker det.",
                  de: "Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern. Wir gehen davon aus, dass Sie damit einverstanden sind. Sie k\u00f6nnen dies jedoch ablehnen, wenn Sie m\u00f6chten.",
                  en:
                      "Our website uses cookies that help the website function, provide social media features, advertise our products and understand which content is most useful.\n\nWe will not use non-essential cookies unless consent is given by clicking the Accept button. You can switch off particular cookie types via 'Settings' before clicking 'Accept' to continue your visit without them.",
                  es: "Este sitio web utiliza cookies para mejorar su experiencia. Asumiremos que est\u00e1 de acuerdo con esto, pero puede optar por no participar si lo desea.",
                  fr: "Ce site utilise des cookies pour am\u00e9liorer votre exp\u00e9rience. Nous supposerons que cela vous convient, mais vous pouvez vous d\u00e9sabonner si vous le souhaitez.",
                  it: "Questo sito Web utilizza i cookie per migliorare la tua esperienza. Daremo per scontato che tu sia d'accordo con questo, ma puoi decidere di rinunciare se lo desideri.",
                  nl: "Deze website maakt gebruik van cookies om uw ervaring te verbeteren. We gaan ervan uit dat je hiermee akkoord gaat, maar je kunt je afmelden als je dat wilt.",
              },
              title: { bg: "Cookie consent", da: "Cookie samtykke", de: "Cookie Zustimmung", en: "Cookie consent", es: "Cookie consent", fr: "Cookie consent", it: "Cookie consent", nl: "Cookie consent" },
              buttons: {
                  accept: { bg: "\u043f\u0440\u0438\u0435\u043c\u0430\u043c", da: "Acceptere", de: "Akzeptieren", en: "Accept", es: "Aceptar", fr: "Acceptez", it: "Accettare", nl: "Aanvaarden" },
                  reject: { bg: "\u041e\u0442\u0445\u0432\u044a\u0440\u043b\u044f\u043d\u0435", da: "Afvise", de: "Ablehnen", en: "Reject", es: "Rechazar", fr: "Rejeter", it: "Rifiutare", nl: "Rfwijzen" },
                  readMore: {
                      bg: "\u041f\u0440\u043e\u0447\u0435\u0442\u0435\u0442\u0435 \u043e\u0449\u0435",
                      da: "L\u00e6s mere",
                      de: "Weiterlesen",
                      en: "Read More",
                      es: "Lee mas",
                      fr: "Lire la suite",
                      it: "Leggi di pi\u00f9",
                      nl: "Lees verder",
                  },
                  settings: { bg: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438", da: "Indstillinger", de: "Die Einstellungen", en: "Settings", es: "Ajustes", fr: "R\u00e9glages", it: "Impostazioni", nl: "Instellingen" },
              },
              saveButton: { bg: "Save", da: "Gemme", de: "sparen", en: "Save", es: "Save", fr: "Save", it: "Save", nl: "Save" },
              customLogoUrl: null,
              noticeToggler: { bg: "Privacy Details", da: "Privatlivsdetail", de: "Details zum Datenschutz", en: "Privacy Details", es: "Privacy Details", fr: "Privacy Details", it: "Privacy Details", nl: "Privacy Details" },
              placeHolderText: {
                  ar: "\u064a\u064f\u0631\u062c\u0649 \u0642\u0628\u0648\u0644 \u0645\u0648\u0627\u0641\u0642\u0629 \u0645\u0644\u0641 \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637",
                  bg:
                      "\u041c\u043e\u043b\u044f, \u043f\u0440\u0438\u0435\u043c\u0435\u0442\u0435 \u0441\u044a\u0433\u043b\u0430\u0441\u0438\u0435\u0442\u043e \u0437\u0430 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u0442\u0435",
                  da: "Accepter cookie-samtykke",
                  de: "Bitte akzeptieren Sie die Cookie-Zustimmung",
                  en: "Please accept the cookie consent",
                  es: "Por favor, acepte el consentimiento de cookies",
                  fr: "Veuillez accepter le consentement des cookies",
                  it: "Accetta il consenso sui cookie",
                  nl: "Accepteer de cookietoestemming",
                  ru: "\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u0440\u0438\u043c\u0438\u0442\u0435 \u0441\u043e\u0433\u043b\u0430\u0441\u0438\u0435 cookie",
              },
              privacyPolicyLink: {
                  ar: "https://www.fccinnovation.co.uk/privacy-statement",
                  bg: "https://www.fccinnovation.co.uk/privacy-statement",
                  da: "https://www.fccinnovation.co.uk/privacy-statement",
                  de: "https://www.fccinnovation.co.uk/privacy-statement",
                  en: "https://www.fccinnovation.co.uk/privacy-statement",
                  es: "https://www.fccinnovation.co.uk/privacy-statement",
                  fr: "https://www.fccinnovation.co.uk/privacy-statement",
                  it: "https://www.fccinnovation.co.uk/privacy-statement",
                  nl: "https://www.fccinnovation.co.uk/privacy-statement",
                  ru: "https://www.fccinnovation.co.uk/privacy-statement",
              },
          },
      },
      display: { gdpr: { title: false, notice: true, buttons: { accept: true, reject: false, readMore: true, settings: true }, noticeToggler: false } },
      version: "2.0.0",
      position: "bottom",
      template: {
          id: "banner",
          css:
              ".cky-consent-bar-trigger, .cky-consent-bar, .cky-modal, .cky-consent-bar-trigger *, .cky-consent-bar *, .cky-modal * { box-sizing: border-box; } .cky-consent-bar-trigger *:focus, .cky-consent-bar *:focus, .cky-modal *:focus { outline: 0; } .cky-consent-bar-trigger { position: fixed; right: 30px; padding: 2px 5px; font-size: 13px; cursor: pointer; font-family: inherit; animation: slide-up 0.4s ease; z-index: 9997; } .cky-consent-bar { font-family: inherit; position: fixed; z-index: 9997; } .cky-consent-bar .cky-banner-title { margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: 500; } .cky-consent-bar p { font-family: inherit; margin-bottom: 0; margin-top: 0; } .cky-btn { background: none; cursor: pointer; display: inline-block; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; line-height: 1; transition: all .15s ease-in-out; margin: 0; min-height: auto; } .cky-consent-bar .cky-btn { margin-right: 15px; border: 1px solid; } .cky-consent-bar .cky-btn:last-child { margin-right: 0; } .cky-btn-readMore { cursor: pointer; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-category-direct { display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; padding-top: 15px; margin-top: 15px; border-top: 1px solid #d4d8df; } .cky-category-direct-item { display: -ms-flexbox; display: flex; -webkit-box-align: center; -ms-flex-align: center; align-items: center; margin-right: 32px; margin-bottom: 15px; } .cky-category-direct-item:last-child { margin-right: 0; } .cky-category-direct-item .cky-switch { margin-left: 0; } .cky-category-direct-item .cky-category-direct-name { margin-left: 10px; font-size: 12px; font-weight: 600; } .cky-category-direct +.cky-detail-wrapper { margin-top: 10px; } .cky-container-fluid { padding-right: 15px; padding-left: 15px; margin-right: auto; margin-left: auto; } .cky-row { display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; } .cky-align-items-stretch { -ms-flex-align: stretch; align-items: stretch; } .cky-d-flex { display: -ms-flexbox; display: flex; } .cky-px-0 { padding-left: 0; padding-right: 0; } .cky-btn:hover { opacity: .8; } .cky-btn:focus { outline: 0; } .cky-table-wrapper { width: 100%; max-width: 100%; overflow: auto; } .cky-cookie-audit-table { font-family: inherit; border-collapse: collapse; width: 100%; margin-top: 10px; } .cky-cookie-audit-table th { background-color: #d9dfe7; border: 1px solid #cbced6; } .cky-cookie-audit-table td { border: 1px solid #d5d8df; } .cky-cookie-audit-table th, .cky-cookie-audit-table td { text-align: left; padding: 10px; font-size: 12px; color: #000000; word-break:normal; } .cky-cookie-audit-table tr:nth-child(2n+1) td { background: #f1f5fa; } .cky-cookie-audit-table tr:nth-child(2n) td { background: #ffffff; } .cky-audit-table-element h5 { margin: 25px 0 2px 0; } .cky-audit-table-element .cky-table-wrapper { margin-bottom: 1rem; } .cky-consent-bar.cky-rtl { direction: rtl; text-align: right; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn { margin-right: 0; margin-left: 15px; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn:last-child { margin-left: 0; } .cky-consent-bar.cky-rtl .cky-btn-readMore { margin-left: 0; margin-right: 6px; } .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: flex; align-items: center; } @media (max-width: 540px) { .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: block; } } .cky-consent-bar.cky-logo-active .cky-logo { margin-right: 30px; } .cky-consent-bar.cky-rtl.cky-logo-active .cky-logo { margin-right: 0px; margin-left: 30px; } .cky-consent-bar { padding: 15px; width: 100%; box-shadow: 0 -1px 10px 0 rgba(172, 171, 171, 0.3); } .cky-consent-title { margin-top: 0; font-size: 15px; margin-bottom: 3px; } .cky-content-wrapper { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; justify-content: space-between; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; } .cky-consent-bar p { line-height: 20px; font-size: 13px; font-weight: normal; } .cky-button-wrapper { margin-left: 20px; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; flex-wrap: nowrap; } @media (max-width: 991px) { .cky-consent-bar, .cky-consent-bar p, .cky-button-wrapper, .cky-content-wrapper { display: block; text-align: center; } .cky-button-wrapper { margin-left: 0; margin-top: 20px; } } .cky-btn { font-size: 12px; font-weight: 500; padding: .5rem 1rem; } @media (min-width: 992px) { .cky-consent-bar .cky-btn-reject { margin-right: 85px; } } .cky-col-4 { -ms-flex: 0 0 33.333333%; flex: 0 0 33.333333%; max-width: 33.333333%; } .cky-col-8 { -ms-flex: 0 0 66.666667%; flex: 0 0 66.666667%; max-width: 66.666667%; } .cky-btn-readMore { cursor: pointer; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-consent-bar.cky-rtl .cky-button-wrapper { margin-left: 0; margin-right: 20px; }  .cky-modal-open { overflow: hidden; } .cky-modal-open .cky-modal { overflow-x: hidden; overflow-y: auto; } .cky-modal.cky-fade .cky-modal-dialog { transition: -webkit-transform .3s ease-out; transition: transform .3s ease-out; transition: transform .3s ease-out, -webkit-transform .3s ease-out; -webkit-transform: translate(0, -25%); transform: translate(0, -25%); } .cky-modal.cky-show .cky-modal-dialog { -webkit-transform: translate(0, 0); transform: translate(0, 0); } .cky-modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9998; background-color: rgba(10, 10, 10, 0.22); display: none; } .cky-modal-backdrop.cky-fade { opacity: 0; } .cky-modal-backdrop.cky-show { opacity: 1; display: block; } .cky-modal { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999; display: none; overflow: hidden; outline: 0; min-height: calc(100% - (.5rem * 2)); } .cky-modal.cky-show { display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; } .cky-modal a { text-decoration: none; } .cky-modal .cky-modal-dialog { position: relative; max-width: calc(100% - 16px); width: calc(100% - 16px); margin: .5rem; pointer-events: none; font-family: inherit; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; text-align: left; display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); -webkit-box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); } @media (min-width: 576px) { .cky-modal .cky-modal-dialog { max-width: 500px; width: 500px; margin: 1.75rem auto; } .cky-modal { min-height: calc(100% - (1.75rem * 2)); } } @media (min-width: 992px) { .cky-modal .cky-modal-dialog { max-width: 900px; width: 900px; } } .cky-modal-content { display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; width: 100%; pointer-events: auto; background-clip: padding-box; border: 0; border-radius: 4px; overflow: hidden; outline: 0; margin: 40px; } .cky-modal .cky-row { margin: 0 -15px; } .cky-modal .cky-modal-close { z-index: 1; padding: 0; background-color: transparent; border: 0; -webkit-appearance: none; font-size: 12px; line-height: 1; color: #9a9a9a; cursor: pointer; min-height: auto; position: absolute; top: 14px; right: 18px; } .cky-modal .cky-close:focus { outline: 0; } .cky-switch-wrapper { margin-top: 30px; padding-top: 22px; border-top: 1px solid #f3f4f8; display: -ms-flexbox; display: flex; align-items: center; -webkit-align-items: center; justify-content: space-between; height: 90px; } .cky-switch { position: relative; min-height: 13px; padding-left: 25px; font-size: 14px; margin-left: 20px; margin-bottom: 0; display: inline-block; } .cky-switch input[type='checkbox'] { display: none !important; } .cky-switch .cky-slider { background-color: #e3e1e8; height: 13px; width: 25px; bottom: 0; cursor: pointer; left: 0; position: absolute; right: 0; transition: .4s; } .cky-switch .cky-slider:before { background-color: #fff; bottom: 2px; content: ''; height: 9px; left: 2px; position: absolute; transition: .4s; width: 9px; } .cky-switch input:checked+.cky-slider { background-color: #008631; } .cky-switch input:disabled+.cky-slider { cursor: initial; } .cky-switch input:checked+.cky-slider:before { transform: translateX(12px); } .cky-switch .cky-slider { border-radius: 34px; } .cky-switch .cky-slider:before { border-radius: 50%; } @media (max-width: 767px) { .cky-tab-content { padding-left: 15px; } } .cky-fade { transition: opacity .15s linear; } .cky-tab { display: -ms-flexbox; display: flex; overflow: hidden; } .cky-tab-menu { flex: 0 0 25%; max-width: 25%; text-align: center; } @media (max-width: 991px) { .cky-tab-menu { flex: 0 0 40%; max-width: 40%; } } .cky-tab-content { flex: 0 0 75%; max-width: 75%; background: transparent; padding: 15px 20px; } @media (max-width: 991px) { .cky-tab-content { flex: 0 0 60%; max-width: 60%; } } @media (max-width: 767px) { .cky-tab-content { padding: 15px; } } .cky-tab-content .cky-tab-content-item { width: 100%; } .cky-tab-content .cky-tab-content-item:not(.cky-tab-content-active) { display: none; } .cky-fade { transition: opacity .15s linear; } .cky-tab-item { font-size: 11px; padding: .5rem 2rem; cursor: pointer; font-weight: normal; border-bottom: 1px solid; border-right: 1px solid; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } @media (max-width: 767px) { .cky-tab-item { font-size: 11px; padding: .75rem .75rem; } } .cky-tab-item-active { cursor: initial; border-right: 0; } .cky-tab-content .cky-tab-desc { height: 225px; max-height: 225px; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } .cky-tab-content .cky-tab-desc, .cky-tab-content .cky-tab-desc p { font-size: 12px; } .cky-tab-title { font-size: 13px; margin-bottom: 11px; margin-top: 0; font-family: inherit; font-weight: bold; line-height: 1; display: flex; align-items: center; } .cky-modal .cky-powered-link { background: #efefef; padding: 13px 32px; color: #a1a1a1; font-weight: 500; } .cky-modal .cky-powered-link a { font-weight: bold; color: #a1a1a1; font-size: 14px; } .cky-modal.cky-rtl { direction: rtl; text-align: right; } .cky-modal.cky-rtl .cky-modal-close { left: 20px; right: 0; } .cky-modal.cky-rtl .cky-tab-item { border-right: none; border-left: 1px solid; } .cky-modal.cky-rtl .cky-tab-item.cky-tab-item-active { border-left: 0; } .cky-modal.cky-rtl .cky-switch { margin-left: 0; margin-right: 20px; } .cky-modal.cky-rtl .cky-modal-dialog { text-align: right; } @media(max-width:475px) { .cky-modal-content { margin: 30px; } }",
          detailType: "popup",
      },
      tldomain: "fccinnovation.co.uk",
      behaviour: { reload: true, showLogo: false, acceptOnScroll: false, defaultConsent: false, showAuditTable: true, selectedLanguage: "en" },
      customCss: null,
      consentType: "custom",
      selectedLaws: ["gdpr"],
      consentBarType: "banner",
      showCategoryDirectly: false,
  },
  info: {
      categories: [
          {
              id: 12073,
              slug: "necessary",
              order: 1,
              name: {
                  en: "Necessary",
                  de: "Notwendige",
                  fr: "N\u00e9cessaire",
                  it: "Necessaria",
                  es: "Necesaria",
                  nl: "Noodzakelijk",
                  bg: "\u041d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e",
                  ar: "\u0636\u0631\u0648\u0631\u064a",
                  da: "N\u00f8dvendig",
              },
              defaultConsent: 1,
              active: 1,
              settings: null,
              type: 1,
              description: {
                  en: "<p>Necessary cookies are crucial for the basic functions of the website and the website will not work in its intended way without them.</p> <p>These cookies do not store any personally identifiable data.</p>",
                  de:
                      "<p>Notwendige Cookies sind f\u00fcr die Grundfunktionen der Website von entscheidender Bedeutung. Ohne sie kann die Website nicht in der vorgesehenen Weise funktionieren.</p><p>Diese Cookies speichern keine personenbezogenen Daten.</p>",
                  fr:
                      "<p>Les cookies n\u00e9cessaires sont cruciaux pour les fonctions de base du site Web et celui-ci ne fonctionnera pas comme pr\u00e9vu sans eux.</p><p>Ces cookies ne stockent aucune donn\u00e9e personnellement identifiable.</p>",
                  it:
                      "<p>I cookie necessari sono fondamentali per le funzioni di base del sito Web e il sito Web non funzioner\u00e0 nel modo previsto senza di essi.</p><p>Questi cookie non memorizzano dati identificativi personali.</p>",
                  es:
                      "<p>Las cookies necesarias son cruciales para las funciones b\u00e1sicas del sitio web y el sitio web no funcionar\u00e1 de la forma prevista sin ellas.</p><p>Estas cookies no almacenan ning\u00fan dato de identificaci\u00f3n personal.</p>",
                  nl: "<p>Noodzakelijke cookies zijn cruciaal voor de basisfuncties van de website en zonder deze werkt de website niet op de beoogde manier.</p><p>Deze cookies slaan geen persoonlijk identificeerbare gegevens op.</p>",
                  bg:
                      "<p>\u041d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0438\u0442\u0435 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u0441\u0430 \u043e\u0442 \u0440\u0435\u0448\u0430\u0432\u0430\u0449\u043e \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0437\u0430 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u0442\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043d\u0430 \u0441\u0430\u0439\u0442\u0430 \u0438 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u044a\u0442 \u043d\u044f\u043c\u0430 \u0434\u0430 \u0440\u0430\u0431\u043e\u0442\u0438 \u043f\u043e \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0431\u0435\u0437 \u0442\u044f\u0445.</p><p>\u0422\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u043d\u0435 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u0442 \u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438.</p>",
                  ar:
                      "<p>\u062a\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0636\u0631\u0648\u0631\u064a\u0629 \u0636\u0631\u0648\u0631\u064a\u0629 \u0644\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0644\u0646 \u064a\u0639\u0645\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0627\u0644\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0645\u0642\u0635\u0648\u062f\u0629 \u0628\u062f\u0648\u0646\u0647\u0627.</p> <p>\u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0644\u0627 \u062a\u062e\u0632\u0646 \u0623\u064a \u0628\u064a\u0627\u0646\u0627\u062a \u0634\u062e\u0635\u064a\u0629.</p>",
                  da:
                      "<p>N\u00f8dvendige cookies er afg\u00f8rende for de grundl\u00e6ggende funktioner p\u00e5 webstedet, og webstedet fungerer ikke p\u00e5 sin tilsigtede m\u00e5de uden dem.</p><p>Disse cookies gemmer ikke personligt identificerbare data.</p>",
              },
              scripts: [
                  {
                      id: 6100,
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
                      id: 7319,
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
                      duration: "11 months",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
                  {
                      id: 7320,
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
                      duration: "11 months",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
                  {
                      id: 7321,
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
                      duration: "11 months",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
                  {
                      id: 7322,
                      cookie_id: "cky-consent",
                      description: {
                          en: "The cookie is set by CookieYes to remember the user consent to the use of cookies on the website.",
                          de: "The cookie is set by CookieYes to remember the user consent to the use of cookies on the website.",
                          fr: "The cookie is set by CookieYes to remember the user consent to the use of cookies on the website.",
                          it: "The cookie is set by CookieYes to remember the user consent to the use of cookies on the website.",
                          es: "The cookie is set by CookieYes to remember the user consent to the use of cookies on the website.",
                          nl: "The cookie is set by CookieYes to remember the user consent to the use of cookies on the website.",
                          bg: "The cookie is set by CookieYes to remember the user consent to the use of cookies on the website.",
                          ar: "The cookie is set by CookieYes to remember the user consent to the use of cookies on the website.",
                      },
                      duration: "11 months",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
                  {
                      id: 7323,
                      cookie_id: "__cfduid",
                      description: {
                          en:
                              "The cookie is set by CloudFare. The cookie is used to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.\n\nThis cookie is set by HubSpot\u2019s CDN provider, Cloudflare. It helps Cloudflare detect malicious visitors to your website and minimizes blocking legitimate users.\nIt may be placed on your visitors' devices to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It is necessary for supporting Cloudflare's security features.\nLearn more about this cookie from Cloudflare.\nIt is a session cookie that lasts a maximum of 30 days.",
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
                      duration: "30 days",
                      type: "https",
                      domain: ".hubspot.com / .hscollectedforms.net",
                  },
                  {
                      id: 7325,
                      cookie_id: "crumb",
                      description: {
                          en: "This cookie is set by websites that uses SquareSpace platform. The cookie is used to prevent cross-site request forgery (CSRF).",
                          de: "This cookie is set by websites that uses SquareSpace platform. The cookie is used to prevent cross-site request forgery (CSRF).",
                          fr: "This cookie is set by websites that uses SquareSpace platform. The cookie is used to prevent cross-site request forgery (CSRF).",
                          it: "This cookie is set by websites that uses SquareSpace platform. The cookie is used to prevent cross-site request forgery (CSRF).",
                          es: "This cookie is set by websites that uses SquareSpace platform. The cookie is used to prevent cross-site request forgery (CSRF).",
                          nl: "This cookie is set by websites that uses SquareSpace platform. The cookie is used to prevent cross-site request forgery (CSRF).",
                          bg: "This cookie is set by websites that uses SquareSpace platform. The cookie is used to prevent cross-site request forgery (CSRF).",
                          ar: "This cookie is set by websites that uses SquareSpace platform. The cookie is used to prevent cross-site request forgery (CSRF).",
                      },
                      duration: "Never Expire",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
                  {
                      id: 7327,
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
                      duration: "11 months",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
                  {
                      id: 7328,
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
                      duration: "11 months",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
                  {
                      id: 7332,
                      cookie_id: "cookieyesID",
                      description: {
                          en: "Unique identifier for  visitors used by CookieYes with respect to the consent",
                          de: "Unique identifier for  visitors used by CooieYes with respect to the consent",
                          fr: "Unique identifier for  visitors used by CooieYes with respect to the consent",
                          it: "Unique identifier for  visitors used by CooieYes with respect to the consent",
                          es: "Unique identifier for  visitors used by CooieYes with respect to the consent",
                          nl: "Unique identifier for  visitors used by CooieYes with respect to the consent",
                          bg: "Unique identifier for  visitors used by CooieYes with respect to the consent",
                          ar: "Unique identifier for  visitors used by CooieYes with respect to the consent",
                      },
                      duration: "11 months",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
                  {
                      id: 7345,
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
                      duration: "11 months",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
                  {
                      id: 8126,
                      cookie_id: "cky-action",
                      description: {
                          en: "Used by Cookieyes to action your cookie consent.",
                          de: "Used by Cookieyes to action your cookie consent.",
                          fr: "Used by Cookieyes to action your cookie consent.",
                          it: "Used by Cookieyes to action your cookie consent.",
                          es: "Used by Cookieyes to action your cookie consent.",
                          nl: "Used by Cookieyes to action your cookie consent.",
                          bg: "Used by Cookieyes to action your cookie consent.",
                          da: "Used by Cookieyes to action your cookie consent.",
                      },
                      duration: "11 months",
                      type: "http",
                      domain: "www.fccinnovation.co.uk",
                  },
              ],
          },
          {
              id: 12074,
              slug: "functional",
              order: 2,
              name: {
                  en: "Functional",
                  de: "Funktionale",
                  fr: "Fonctionnelle",
                  it: "Funzionale",
                  es: "Funcional",
                  nl: "functioneel",
                  bg: "\u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u0435\u043d",
                  ar: "\u0648\u0638\u064a\u0641\u064a",
                  da: "Funktionel",
              },
              defaultConsent: 1,
              active: 1,
              settings: null,
              type: 2,
              description: {
                  en: "<p>Functional cookies help to perform certain functionalities like sharing the content of the website on social media platforms, collect feedbacks, and other third-party features.</p>",
                  de:
                      "<p>Funktionale Cookies unterst\u00fctzen bei der Ausf\u00fchrung bestimmter Funktionen, z. B. beim Teilen des Inhalts der Website auf Social Media-Plattformen, beim Sammeln von Feedbacks und anderen Funktionen von Drittanbietern.</p>",
                  fr:
                      "<p>Les cookies fonctionnels permettent d'ex\u00e9cuter certaines fonctionnalit\u00e9s telles que le partage du contenu du site Web sur des plateformes de m\u00e9dias sociaux, la collecte de commentaires et d'autres fonctionnalit\u00e9s tierces.</p>",
                  it:
                      "<p>I cookie funzionali aiutano a svolgere determinate funzionalit\u00e0 come la condivisione del contenuto del sito Web su piattaforme di social media, la raccolta di feedback e altre funzionalit\u00e0 di terze parti.</p>",
                  es: "<p>Las cookies funcionales ayudan a realizar ciertas funcionalidades, como compartir el contenido del sitio web en plataformas de redes sociales, recopilar comentarios y otras caracter\u00edsticas de terceros.</p>",
                  nl: "<p>Functionele cookies helpen bepaalde functionaliteiten uit te voeren, zoals het delen van de inhoud van de website op sociale mediaplatforms, het verzamelen van feedback en andere functies van derden.</p>",
                  bg:
                      "<p>\u0424\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u043d\u0438\u0442\u0435 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u043f\u043e\u043c\u0430\u0433\u0430\u0442 \u0437\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043a\u0430\u0442\u043e \u0441\u043f\u043e\u0434\u0435\u043b\u044f\u043d\u0435 \u043d\u0430 \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u0430 \u0432 \u0441\u043e\u0446\u0438\u0430\u043b\u043d\u0438\u0442\u0435 \u043c\u0435\u0434\u0438\u0439\u043d\u0438 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0438, \u0441\u044a\u0431\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u043e\u0431\u0440\u0430\u0442\u043d\u0438 \u0432\u0440\u044a\u0437\u043a\u0438 \u0438 \u0434\u0440\u0443\u0433\u0438 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043d\u0430 \u0442\u0440\u0435\u0442\u0438 \u0441\u0442\u0440\u0430\u043d\u0438.</p>",
                  ar:
                      "<p>\u062a\u0633\u0627\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629 \u0639\u0644\u0649 \u0623\u062f\u0627\u0621 \u0648\u0638\u0627\u0626\u0641 \u0645\u0639\u064a\u0646\u0629 \u0645\u062b\u0644 \u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0645\u0646\u0635\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a \u060c \u0648\u062c\u0645\u0639 \u0627\u0644\u062a\u0639\u0644\u064a\u0642\u0627\u062a \u060c \u0648\u063a\u064a\u0631\u0647\u0627 \u0645\u0646 \u0645\u064a\u0632\u0627\u062a \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062b\u0627\u0644\u062b.</p>",
                  da: "<p>Funktionelle cookies hj\u00e6lper med at udf\u00f8re visse funktionaliteter, som at dele indholdet af webstedet p\u00e5 sociale medieplatforme, indsamle feedbacks og andre tredjepartsfunktioner.</p>",
              },
              scripts: [
                  {
                      id: 7095,
                      name: { en: "LinkedIn", de: "LinkedIn", fr: "LinkedIn", it: "LinkedIn", es: "LinkedIn", nl: "LinkedIn", bg: "LinkedIn", ar: "LinkedIn" },
                      description: {
                          en: "LinkedIn installs cookies from pages where its contents are embedded or button to share content to the social media platform have been added.",
                          de: "LinkedIn installs cookies from pages where its contents are embedded or button to share content to the social media platform have been added.",
                          fr: "LinkedIn installs cookies from pages where its contents are embedded or button to share content to the social media platform have been added.",
                          it: "LinkedIn installs cookies from pages where its contents are embedded or button to share content to the social media platform have been added.",
                          es: "LinkedIn installs cookies from pages where its contents are embedded or button to share content to the social media platform have been added.",
                          nl: "LinkedIn installs cookies from pages where its contents are embedded or button to share content to the social media platform have been added.",
                          bg: "LinkedIn installs cookies from pages where its contents are embedded or button to share content to the social media platform have been added.",
                          ar: "LinkedIn installs cookies from pages where its contents are embedded or button to share content to the social media platform have been added.",
                      },
                      cookie_ids: "bcookie, lidc",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 15316,
                      name: { en: "Tawk To", de: "Tawk To", fr: "Tawk To", it: "Tawk To", es: "Tawk To", nl: "Tawk To", bg: "Tawk To", da: "Tawk To", ru: "Tawk To", ar: "Tawk To" },
                      description: {
                          en: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                          de: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                          fr: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                          it: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                          es: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                          nl: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                          bg: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                          da: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                          ru: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                          ar: "Script to allow Instant Chat across the FCC Innovation website, supplied by Tawk.To.",
                      },
                      cookie_ids: "TawkConnectionTime, _tawkuuid",
                      active: 1,
                      head_script: null,
                      body_script:
                          "<!--Start of Tawk.to Script-->\n<script type=\"text/javascript\">\nvar Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();\n(function(){\nvar s1=document.createElement(\"script\"),s0=document.getElementsByTagName(\"script\")[0];\ns1.async=true;\ns1.src='https://embed.tawk.to/5f2a8c24ed9d9d2627085788/default';\ns1.charset='UTF-8';\ns1.setAttribute('crossorigin','*');\ns0.parentNode.insertBefore(s1,s0);\n})();\n</script>\n<!--End of Tawk.to Script-->",
                  },
              ],
              cookies: [
                  {
                      id: 7346,
                      cookie_id: "RecentRedirect",
                      description: {
                          en: "Prevents redirection loops where urls have been changed.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "56 seconds",
                      type: "https",
                      domain: ".www.fccinnovation.co.uk",
                  },
                  {
                      id: 8133,
                      cookie_id: "PREF",
                      description: {
                          en: "This cookie is set by Youtube. Used to store user preferences like language or any other customizations for YouTube Videos embedded in different sites.",
                          de: "This cookie is set by Youtube. Used to store user preferences like language or any other customizations for YouTube Videos embedded in different sites.",
                          fr: "This cookie is set by Youtube. Used to store user preferences like language or any other customizations for YouTube Videos embedded in different sites.",
                          it: "This cookie is set by Youtube. Used to store user preferences like language or any other customizations for YouTube Videos embedded in different sites.",
                          es: "This cookie is set by Youtube. Used to store user preferences like language or any other customizations for YouTube Videos embedded in different sites.",
                          nl: "This cookie is set by Youtube. Used to store user preferences like language or any other customizations for YouTube Videos embedded in different sites.",
                          bg: "This cookie is set by Youtube. Used to store user preferences like language or any other customizations for YouTube Videos embedded in different sites.",
                          da: "This cookie is set by Youtube. Used to store user preferences like language or any other customizations for YouTube Videos embedded in different sites.",
                      },
                      duration: "8 months",
                      type: "http",
                      domain: ".youtube.com",
                  },
                  {
                      id: 11631,
                      cookie_id: "_twitter_sess",
                      description: {
                          en: "Allows content from Twitter to be shown on the website pages and the pages to be shared on Twitter.",
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
                      domain: ".twitter.com",
                  },
                  {
                      id: 11634,
                      cookie_id: "external_referer",
                      description: {
                          en: "We use a Twitter widget to deliver live feeds of our latest Twitter posts. This cookie enables us to link with twitter to authorise our use of the widget.",
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
                      domain: ".twitter.com",
                  },
                  {
                      id: 11636,
                      cookie_id: "trkCode",
                      description: {
                          en: 'This cookie is used by LinkedIn to support the functionality of adding a panel invite labeled "Follow Us".',
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "52 seconds",
                      type: "http",
                      domain: "www.linkedin.com",
                  },
                  {
                      id: 11637,
                      cookie_id: "trkInfo",
                      description: {
                          en: 'This cookie is used by LinkedIn to support the functionality of adding a panel invite labeled "Follow Us".',
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "52 seconds",
                      type: "http",
                      domain: "www.linkedin.com",
                  },
                  {
                      id: 11638,
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
                      domain: ".www.linkedin.com",
                  },
                  {
                      id: 11639,
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
                      domain: ".linkedin.com",
                  },
                  {
                      id: 11640,
                      cookie_id: "bcookie",
                      description: {
                          en: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          de: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          fr: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          it: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          es: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          nl: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          bg: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          ar: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".linkedin.com",
                  },
                  {
                      id: 11642,
                      cookie_id: "lidc",
                      description: {
                          en: "This cookie is set by LinkedIn and used for routing.",
                          de: "This cookie is set by LinkedIn and used for routing.",
                          fr: "This cookie is set by LinkedIn and used for routing.",
                          it: "This cookie is set by LinkedIn and used for routing.",
                          es: "This cookie is set by LinkedIn and used for routing.",
                          nl: "This cookie is set by LinkedIn and used for routing.",
                          bg: "This cookie is set by LinkedIn and used for routing.",
                          ar: "This cookie is set by LinkedIn and used for routing.",
                      },
                      duration: "1 day",
                      type: "http",
                      domain: ".linkedin.com",
                  },
                  {
                      id: 11645,
                      cookie_id: "rtc",
                      description: {
                          en: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "2 minutes",
                      type: "http",
                      domain: ".linkedin.com",
                  },
                  {
                      id: 11646,
                      cookie_id: "lissc1",
                      description: {
                          en: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "4 weeks",
                      type: "https",
                      domain: ".www.linkedin.com",
                  },
                  {
                      id: 11647,
                      cookie_id: "lissc2",
                      description: {
                          en: "This cookie is set by linkedIn. The purpose of the cookie is to enable LinkedIn functionalities on the page.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "4 weeks",
                      type: "https",
                      domain: ".www.linkedin.com",
                  },
                  {
                      id: 11654,
                      cookie_id: "devicePixelRatio",
                      description: {
                          en: "This cookie is used to make the site responsive to the user's screen size.",
                          de: "This cookie is used to make the site responsive to the user's screen size.",
                          fr: "This cookie is used to make the site responsive to the user's screen size.",
                          it: "This cookie is used to make the site responsive to the user's screen size.",
                          es: "This cookie is used to make the site responsive to the user's screen size.",
                          nl: "This cookie is used to make the site responsive to the user's screen size.",
                          bg: "This cookie is used to make the site responsive to the user's screen size.",
                          ar: "This cookie is used to make the site responsive to the user's screen size.",
                      },
                      duration: "1 day",
                      type: "http",
                      domain: "www.tumblr.com",
                  },
                  {
                      id: 11655,
                      cookie_id: "documentWidth",
                      description: {
                          en: "This cookie is used to make the site responsive to the user's screen size.",
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
                      domain: "www.tumblr.com",
                  },
                  {
                      id: 11657,
                      cookie_id: "gdpr_status",
                      description: {
                          en: "Determines whether the visitor has accepted the cookie consent box. This ensures that the cookie consent box will not be presented again upon re-entry. Used by our tawk.to instant chat widget.",
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
                      domain: ".aaxads.com",
                  },
                  {
                      id: 11658,
                      cookie_id: "sb",
                      description: {
                          en: "This cookie is used by Facebook to enable its functionalities.",
                          de: "This cookie is used by Facebook to enable its functionalities.",
                          fr: "This cookie is used by Facebook to enable its functionalities.",
                          it: "This cookie is used by Facebook to enable its functionalities.",
                          es: "This cookie is used by Facebook to enable its functionalities.",
                          nl: "This cookie is used by Facebook to enable its functionalities.",
                          bg: "This cookie is used by Facebook to enable its functionalities.",
                          ar: "This cookie is used by Facebook to enable its functionalities.",
                      },
                      duration: "2 years",
                      type: "https",
                      domain: ".facebook.com",
                  },
                  {
                      id: 11659,
                      cookie_id: "_js_datr",
                      description: {
                          en: "This cookie is set by Facebook. The cookie is generated on the website as a part of their services embedded on the website.",
                          de: "This cookie is set by Facebook. The cookie is generated on the website as a part of their services embedded on the website.",
                          fr: "This cookie is set by Facebook. The cookie is generated on the website as a part of their services embedded on the website.",
                          it: "This cookie is set by Facebook. The cookie is generated on the website as a part of their services embedded on the website.",
                          es: "This cookie is set by Facebook. The cookie is generated on the website as a part of their services embedded on the website.",
                          nl: "This cookie is set by Facebook. The cookie is generated on the website as a part of their services embedded on the website.",
                          bg: "This cookie is set by Facebook. The cookie is generated on the website as a part of their services embedded on the website.",
                          ar: "This cookie is set by Facebook. The cookie is generated on the website as a part of their services embedded on the website.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".facebook.com",
                  },
                  {
                      id: 11660,
                      cookie_id: "wd",
                      description: {
                          en: "The cookie is set by facebook or Facebook social plugins to measure and store the dimensions of the browser window. This cookie is used by Facebook to optimize the rendering of the page.",
                          de: "The cookie is set by facebook or Facebook social plugins to measure and store the dimensions of the browser window. This cookie is used by Facebook to optimize the rendering of the page.",
                          fr: "The cookie is set by facebook or Facebook social plugins to measure and store the dimensions of the browser window. This cookie is used by Facebook to optimize the rendering of the page.",
                          it: "The cookie is set by facebook or Facebook social plugins to measure and store the dimensions of the browser window. This cookie is used by Facebook to optimize the rendering of the page.",
                          es: "The cookie is set by facebook or Facebook social plugins to measure and store the dimensions of the browser window. This cookie is used by Facebook to optimize the rendering of the page.",
                          nl: "The cookie is set by facebook or Facebook social plugins to measure and store the dimensions of the browser window. This cookie is used by Facebook to optimize the rendering of the page.",
                          bg: "The cookie is set by facebook or Facebook social plugins to measure and store the dimensions of the browser window. This cookie is used by Facebook to optimize the rendering of the page.",
                          ar: "The cookie is set by facebook or Facebook social plugins to measure and store the dimensions of the browser window. This cookie is used by Facebook to optimize the rendering of the page.",
                      },
                      duration: "1 week",
                      type: "http",
                      domain: ".facebook.com",
                  },
                  {
                      id: 46156,
                      cookie_id: "_p_hfp_client_id",
                      description: {
                          en: "This cookie allows us to show Google reviews through an Elfsight app.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "1 minute",
                      type: "https",
                      domain: ".apps.elfsight.com",
                  },
                  {
                      id: 52518,
                      cookie_id: "TawkConnectionTime",
                      description: {
                          en: "This cookie allows our instant chat feature to work.",
                          de: "This cookie allows our instant chat feature to work.",
                          fr: "This cookie allows our instant chat feature to work.",
                          it: "This cookie allows our instant chat feature to work.",
                          es: "This cookie allows our instant chat feature to work.",
                          nl: "This cookie allows our instant chat feature to work.",
                          bg: "This cookie allows our instant chat feature to work.",
                          da: "This cookie allows our instant chat feature to work.",
                          ru: "This cookie allows our instant chat feature to work.",
                          ar: "This cookie allows our instant chat feature to work.",
                          pl: "This cookie allows our instant chat feature to work.",
                      },
                      duration: "Session",
                      type: "https",
                      domain: "www.fccinnovation.co.uk",
                  },
              ],
          },
          {
              id: 12075,
              slug: "analytics",
              order: 3,
              name: {
                  en: "Analytics",
                  de: "Analyse",
                  fr: "Analytique",
                  it: "analitica",
                  es: "Anal\u00edtica",
                  nl: "Analytics",
                  bg: "\u0430\u043d\u0430\u043b\u0438\u0437",
                  ar: "\u062a\u062d\u0644\u064a\u0644\u0627\u062a",
                  da: "Analytics",
              },
              defaultConsent: 1,
              active: 1,
              settings: null,
              type: 2,
              description: {
                  en: "<p>Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.</p>",
                  de: "<p>Analyse-Cookies werden verwendet um zu verstehen, wie Besucher mit der Website interagieren. Diese Cookies dienen zu Aussagen \u00fcber die Anzahl der Besucher, Absprungrate, Herkunft der Besucher usw.</p>",
                  fr:
                      "<p>Les cookies analytiques sont utilis\u00e9s pour comprendre comment les visiteurs interagissent avec le site Web. Ces cookies aident \u00e0 fournir des informations sur le nombre de visiteurs, le taux de rebond, la source de trafic, etc.</p>",
                  it:
                      "<p>I cookie analitici vengono utilizzati per comprendere come i visitatori interagiscono con il sito Web. Questi cookie aiutano a fornire informazioni sulle metriche di numero di visitatori, frequenza di rimbalzo, fonte di traffico, ecc.</p>",
                  es:
                      "<p>Las cookies anal\u00edticas se utilizan para comprender c\u00f3mo interact\u00faan los visitantes con el sitio web. Estas cookies ayudan a proporcionar informaci\u00f3n sobre m\u00e9tricas el n\u00famero de visitantes, el porcentaje de rebote, la fuente de tr\u00e1fico, etc.</p>",
                  nl:
                      "<p>Analytische cookies worden gebruikt om te begrijpen hoe bezoekers omgaan met de website. Deze cookies helpen informatie te verstrekken over de statistieken van het aantal bezoekers, het bouncepercentage, de verkeersbron, enz.</p>",
                  bg:
                      "<p>\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u0447\u043d\u0438\u0442\u0435 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442, \u0437\u0430 \u0434\u0430 \u0441\u0435 \u0440\u0430\u0437\u0431\u0435\u0440\u0435 \u043a\u0430\u043a \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438\u0442\u0435 \u0432\u0437\u0430\u0438\u043c\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0430\u0442 \u0441 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u0430. \u0422\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u043f\u043e\u043c\u0430\u0433\u0430\u0442 \u0437\u0430 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u044f\u043d\u0435\u0442\u043e \u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0437\u0430 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438\u0442\u0435 \u0437\u0430 \u0431\u0440\u043e\u044f \u043d\u0430 \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438\u0442\u0435, \u0441\u0442\u0435\u043f\u0435\u043d\u0442\u0430 \u043d\u0430 \u043e\u0442\u043f\u0430\u0434\u0430\u043d\u0435, \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u043a\u0430 \u043d\u0430 \u0442\u0440\u0430\u0444\u0438\u043a\u0430 \u0438 \u0434\u0440.</p>",
                  ar:
                      "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u064a\u0629 \u0644\u0641\u0647\u0645 \u0643\u064a\u0641\u064a\u0629 \u062a\u0641\u0627\u0639\u0644 \u0627\u0644\u0632\u0648\u0627\u0631 \u0645\u0639 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628. \u062a\u0633\u0627\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0641\u064a \u062a\u0648\u0641\u064a\u0631 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0646 \u0627\u0644\u0645\u0642\u0627\u064a\u064a\u0633 \u0648\u0639\u062f\u062f \u0627\u0644\u0632\u0648\u0627\u0631 \u0648\u0645\u0639\u062f\u0644 \u0627\u0644\u0627\u0631\u062a\u062f\u0627\u062f \u0648\u0645\u0635\u062f\u0631 \u0627\u0644\u062d\u0631\u0643\u0629 \u0648\u0645\u0627 \u0625\u0644\u0649 \u0630\u0644\u0643.</p>",
                  da:
                      "<p>Analytiske cookies bruges til at forst\u00e5, hvordan bes\u00f8gende interagerer med webstedet. Disse cookies hj\u00e6lper med at give information om m\u00e5linger af antallet af bes\u00f8gende, afvisningsprocent, trafikskilde osv.</p>",
              },
              scripts: [
                  {
                      id: 6107,
                      name: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", da: "Google Analytics" },
                      description: { en: "Google Analytics", de: "Google Analytics", fr: "Google Analytics", it: "Google Analytics", es: "Google Analytics", nl: "Google Analytics", bg: "Google Analytics", da: "Google Analytics" },
                      cookie_ids: "_ga",
                      active: 1,
                      head_script:
                          "<!-- Global site tag (gtag.js) - Google Analytics -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=UA-39251943-2\"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', 'UA-39251943-2');\n</script>",
                      body_script: null,
                  },
                  {
                      id: 7098,
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
                      id: 16011,
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
                      cookie_ids: "lissc",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 17798,
                      name: {
                          en: "Hubspot Code",
                          de: "Hubspot Code",
                          fr: "Hubspot Code",
                          it: "Hubspot Code",
                          es: "Hubspot Code",
                          nl: "Hubspot Code",
                          bg: "Hubspot Code",
                          da: "Hubspot Code",
                          ru: "Hubspot Code",
                          ar: "Hubspot Code",
                          pl: "Hubspot Code",
                      },
                      description: {
                          en: "This script connects our site to our CRM.",
                          de: "This script connects our site to our CRM.",
                          fr: "This script connects our site to our CRM.",
                          it: "This script connects our site to our CRM.",
                          es: "This script connects our site to our CRM.",
                          nl: "This script connects our site to our CRM.",
                          bg: "This script connects our site to our CRM.",
                          da: "This script connects our site to our CRM.",
                          ru: "This script connects our site to our CRM.",
                          ar: "This script connects our site to our CRM.",
                          pl: "This script connects our site to our CRM.",
                      },
                      cookie_ids: "tbc",
                      active: 1,
                      head_script: null,
                      body_script: '<!-- Start of HubSpot Embed Code -->\n<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/6429256.js"></script>\n<!-- End of HubSpot Embed Code -->',
                  },
              ],
              cookies: [
                  {
                      id: 8127,
                      cookie_id: "_ga",
                      description: {
                          en:
                              "This cookie name is associated with Google Universal Analytics - which is a significant update to Google's more commonly used analytics service. This cookie is used to distinguish unique users by assigning a randomly generated number as a client identifier. It is included in each page request in a site and used to calculate visitor, session and campaign data for the sites analytics reports. By default it is set to expire after 2 years, although this is customisable by website owners.",
                          de:
                              "This cookie name is associated with Google Universal Analytics - which is a significant update to Google's more commonly used analytics service. This cookie is used to distinguish unique users by assigning a randomly generated number as a client identifier. It is included in each page request in a site and used to calculate visitor, session and campaign data for the sites analytics reports. By default it is set to expire after 2 years, although this is customisable by website owners.",
                          fr:
                              "This cookie name is associated with Google Universal Analytics - which is a significant update to Google's more commonly used analytics service. This cookie is used to distinguish unique users by assigning a randomly generated number as a client identifier. It is included in each page request in a site and used to calculate visitor, session and campaign data for the sites analytics reports. By default it is set to expire after 2 years, although this is customisable by website owners.",
                          it:
                              "This cookie name is associated with Google Universal Analytics - which is a significant update to Google's more commonly used analytics service. This cookie is used to distinguish unique users by assigning a randomly generated number as a client identifier. It is included in each page request in a site and used to calculate visitor, session and campaign data for the sites analytics reports. By default it is set to expire after 2 years, although this is customisable by website owners.",
                          es:
                              "This cookie name is associated with Google Universal Analytics - which is a significant update to Google's more commonly used analytics service. This cookie is used to distinguish unique users by assigning a randomly generated number as a client identifier. It is included in each page request in a site and used to calculate visitor, session and campaign data for the sites analytics reports. By default it is set to expire after 2 years, although this is customisable by website owners.",
                          nl:
                              "This cookie name is associated with Google Universal Analytics - which is a significant update to Google's more commonly used analytics service. This cookie is used to distinguish unique users by assigning a randomly generated number as a client identifier. It is included in each page request in a site and used to calculate visitor, session and campaign data for the sites analytics reports. By default it is set to expire after 2 years, although this is customisable by website owners.",
                          bg:
                              "This cookie name is associated with Google Universal Analytics - which is a significant update to Google's more commonly used analytics service. This cookie is used to distinguish unique users by assigning a randomly generated number as a client identifier. It is included in each page request in a site and used to calculate visitor, session and campaign data for the sites analytics reports. By default it is set to expire after 2 years, although this is customisable by website owners.",
                          da:
                              "This cookie name is associated with Google Universal Analytics - which is a significant update to Google's more commonly used analytics service. This cookie is used to distinguish unique users by assigning a randomly generated number as a client identifier. It is included in each page request in a site and used to calculate visitor, session and campaign data for the sites analytics reports. By default it is set to expire after 2 years, although this is customisable by website owners.",
                      },
                      duration: "2 years",
                      type: "https",
                      domain: ".fccinnovation.co.uk / .hubspot.com",
                  },
                  {
                      id: 8128,
                      cookie_id: "_gid",
                      description: {
                          en:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          de:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          fr:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          it:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          es:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          nl:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          bg:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          da:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                      },
                      duration: "24 hours",
                      type: "https",
                      domain: ".fccinnovation.co.uk / .hubspot.com",
                  },
                  {
                      id: 11643,
                      cookie_id: "uid",
                      description: {
                          en:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments. The cookies are set for functionality and tracking of 'share' buttons.",
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
                      domain: ".scorecardresearch.com",
                  },
                  {
                      id: 11644,
                      cookie_id: "UIDR",
                      description: {
                          en:
                              "This cookie is used to measure the number and behavior of the visitors to the website anonymously. The data includes the number of visits, average duration of the visit on the website, pages visited, etc. for the purpose of better understanding user preferences for targeted advertisments. The cookies are set for functionality and tracking of 'share' buttons.",
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
                      id: 29557,
                      cookie_id: "SS_SESSION_ID",
                      description: {
                          en: "Used by Square Space to identify unique visitors to our website.",
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
                      domain: ".www.fccinnovation.co.uk",
                  },
                  {
                      id: 46157,
                      cookie_id: "lissc",
                      description: {
                          en: "This cookie is provided by LinkedIn. This cookie is used for tracking embedded service.",
                          de: "This cookie is provided by LinkedIn. This cookie is used for tracking embedded service.",
                          fr: "This cookie is provided by LinkedIn. This cookie is used for tracking embedded service.",
                          it: "This cookie is provided by LinkedIn. This cookie is used for tracking embedded service.",
                          es: "This cookie is provided by LinkedIn. This cookie is used for tracking embedded service.",
                          nl: "This cookie is provided by LinkedIn. This cookie is used for tracking embedded service.",
                          bg: "This cookie is provided by LinkedIn. This cookie is used for tracking embedded service.",
                          ar: "This cookie is provided by LinkedIn. This cookie is used for tracking embedded service.",
                      },
                      duration: "1 year",
                      type: "http",
                      domain: ".linkedin.com",
                  },
                  {
                      id: 52532,
                      cookie_id: "_hstc",
                      description: {
                          en:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          de:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          fr:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          it:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          es:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          nl:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          bg:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          da:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          ru:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          ar:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                          pl:
                              "The main cookie for tracking visitors.\nIt contains the domain, utk, initial timestamp (first visit), last timestamp (last visit), current timestamp (this visit), and session number (increments for each subsequent session).\nIt expires in 13 months.",
                      },
                      duration: "13 months",
                      type: "http",
                      domain: ".fccinnovation.co.uk",
                  },
                  {
                      id: 52533,
                      cookie_id: "_hssrc",
                      description: {
                          en:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          de:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          fr:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          it:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          es:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          nl:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          bg:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          da:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          ru:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          ar:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                          pl:
                              'Whenever HubSpot changes the session cookie, this cookie is also set to determine if the visitor has restarted their browser.\nIf this cookie does not exist when HubSpot manages cookies, it is considered a new session.\nIt contains the value "1" when present.\nIt expires at the end of the session.',
                      },
                      duration: "Session",
                      type: "https",
                      domain: ".fccinnovation.co.uk",
                  },
                  {
                      id: 52534,
                      cookie_id: "_hssc",
                      description: {
                          en:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          de:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          fr:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          it:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          es:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          nl:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          bg:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          da:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          ru:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          ar:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                          pl:
                              "This cookie keeps track of sessions.\nThis is used to determine if HubSpot should increment the session number and timestamps in the __hstc cookie.\nIt contains the domain, viewCount (increments each pageView in a session), and session start timestamp.\nIt expires in 30 minutes.",
                      },
                      duration: "30 minutes",
                      type: "https",
                      domain: ".fccinnovation.co.uk",
                  },
              ],
          },
          {
              id: 12076,
              slug: "performance",
              order: 4,
              name: {
                  en: "Performance",
                  de: "Leistungs",
                  fr: "les r\u00e9sultats",
                  it: "il rendimento",
                  es: "el rendimiento",
                  nl: "Prestatie",
                  bg: "\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u043d\u043e\u0441\u0442",
                  ar: "\u0623\u062f\u0627\u0621",
                  da: "Ydeevne",
              },
              defaultConsent: 1,
              active: 1,
              settings: null,
              type: 2,
              description: {
                  en: "<p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.</p>",
                  de: "<p>Leistungs-Cookies werden verwendet, um die wichtigsten Leistungsindizes der Website zu verstehen und zu analysieren. Dies tr\u00e4gt dazu bei, den Besuchern ein besseres Nutzererlebnis zu bieten.</p>",
                  fr: "<p>Les cookies de performance sont utilis\u00e9s pour comprendre et analyser les indices de performance cl\u00e9s du site Web, ce qui permet de fournir une meilleure exp\u00e9rience utilisateur aux visiteurs.</p>",
                  it: "<p>I cookie per le prestazioni vengono utilizzati per comprendere e analizzare gli indici di prestazione chiave del sito Web che aiutano a fornire ai visitatori un'esperienza utente migliore.</p>",
                  es: "<p>Las cookies de rendimiento se utilizan para comprender y analizar los \u00edndices de rendimiento clave del sitio web, lo que ayuda a proporcionar una mejor experiencia de usuario para los visitantes.</p>",
                  nl: "<p>Prestatiecookies worden gebruikt om de belangrijkste prestatie-indexen van de website te begrijpen en te analyseren, wat helpt bij het leveren van een betere gebruikerservaring voor de bezoekers.</p>",
                  bg:
                      "<p>\u0411\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u0442\u0435 \u0437\u0430 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442 \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442 \u0437\u0430 \u0440\u0430\u0437\u0431\u0438\u0440\u0430\u043d\u0435 \u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u043a\u043b\u044e\u0447\u043e\u0432\u0438\u0442\u0435 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u0437\u0430 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442 \u043d\u0430 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u0430, \u043a\u043e\u0438\u0442\u043e \u043f\u043e\u043c\u0430\u0433\u0430\u0442 \u0434\u0430 \u0441\u0435 \u043e\u0441\u0438\u0433\u0443\u0440\u0438 \u043f\u043e-\u0434\u043e\u0431\u0440\u043e \u043f\u043e\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043b\u0441\u043a\u043e \u0438\u0437\u0436\u0438\u0432\u044f\u0432\u0430\u043d\u0435 \u0437\u0430 \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438\u0442\u0435.</p>",
                  ar:
                      "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0627\u0644\u0623\u062f\u0627\u0621 \u0644\u0641\u0647\u0645 \u0648\u062a\u062d\u0644\u064a\u0644 \u0641\u0647\u0627\u0631\u0633 \u0627\u0644\u0623\u062f\u0627\u0621 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 \u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628 \u0648\u0627\u0644\u062a\u064a \u062a\u0633\u0627\u0639\u062f \u0641\u064a \u062a\u0642\u062f\u064a\u0645 \u062a\u062c\u0631\u0628\u0629 \u0645\u0633\u062a\u062e\u062f\u0645 \u0623\u0641\u0636\u0644 \u0644\u0644\u0632\u0627\u0626\u0631\u064a\u0646.</p>",
                  da: "<p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.</p>",
              },
              scripts: [
                  {
                      id: 16012,
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
                      cookie_ids: "_gat",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 27639,
                      name: {
                          en: "Pingdom Script",
                          de: "Pingdom Script",
                          fr: "Pingdom Script",
                          it: "Pingdom Script",
                          es: "Pingdom Script",
                          nl: "Pingdom Script",
                          bg: "Pingdom Script",
                          da: "Pingdom Script",
                          ru: "Pingdom Script",
                          ar: "Pingdom Script",
                          pl: "Pingdom Script",
                      },
                      description: {
                          en: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          de: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          fr: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          it: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          es: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          nl: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          bg: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          da: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          ru: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          ar: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                          pl: "Pingdom allows us to monitor user experience, telling us which pages are loading at which speeds from which browsers. It will flag load speed and up-time issues for us.",
                      },
                      cookie_ids: "tbc",
                      active: 1,
                      head_script: '<script src="//rum-static.pingdom.net/pa-60212088a15bce001100007d.js" async></script>',
                      body_script: null,
                  },
              ],
              cookies: [
                  {
                      id: 8129,
                      cookie_id: "_gat",
                      description: {
                          en:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          de:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          fr:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          it:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          es:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          nl:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          bg:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                          da:
                              "This cookie name is associated with Google Universal Analytics, according to documentation it is used to throttle the request rate - limiting the collection of data on high traffic sites. It expires after 10 minutes.",
                      },
                      duration: "10 minutes",
                      type: "https",
                      domain: ".fccinnovation.co.uk",
                  },
              ],
          },
          {
              id: 12077,
              slug: "advertisement",
              order: 5,
              name: {
                  en: "Advertisement",
                  de: "Werbe",
                  fr: "Publicit\u00e9",
                  it: "la pubblicit\u00e0",
                  es: "Anuncio",
                  nl: "Advertentie",
                  bg: "\u0440\u0435\u043a\u043b\u0430\u043c\u0430",
                  ar: "\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a",
                  da: "Reklame",
              },
              defaultConsent: 1,
              active: 1,
              settings: null,
              type: 2,
              description: {
                  en: "<p>Advertisement cookies are used to deliver visitors with customized advertisements based on the pages they visited before and analyze the effectiveness of the ad campaign.</p>",
                  de: "<p>Werbe-Cookies werden verwendet, um Besuchern auf der Grundlage der von ihnen zuvor besuchten Seiten ma\u00dfgeschneiderte Werbung zu liefern und die Wirksamkeit von Werbekampagne nzu analysieren.</p>",
                  fr:
                      "<p>Les cookies de publicit\u00e9 sont utilis\u00e9s pour fournir aux visiteurs des publicit\u00e9s personnalis\u00e9es bas\u00e9es sur les pages visit\u00e9es pr\u00e9c\u00e9demment et analyser l'efficacit\u00e9 de la campagne publicitaire.</p>",
                  it: "<p>I cookie pubblicitari vengono utilizzati per fornire ai visitatori annunci pubblicitari personalizzati in base alle pagine visitate in precedenza e per analizzare l'efficacia della campagna pubblicitaria.</p>",
                  es:
                      "<p>Las cookies publicitarias se utilizan para entregar a los visitantes anuncios personalizados basados \u200b\u200ben las p\u00e1ginas que visitaron antes y analizar la efectividad de la campa\u00f1a publicitaria.</p>",
                  nl: "<p>Advertentiecookies worden gebruikt om bezoekers gepersonaliseerde advertenties te bezorgen op basis van de eerder bezochte pagina's en om de effectiviteit van de advertentiecampagne te analyseren.</p>",
                  bg:
                      "<p>\u0420\u0435\u043a\u043b\u0430\u043c\u043d\u0438\u0442\u0435 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442 \u0437\u0430 \u0434\u043e\u0441\u0442\u0430\u0432\u044f\u043d\u0435 \u043d\u0430 \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438 \u0441 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043d\u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u0438 \u0432\u044a\u0437 \u043e\u0441\u043d\u043e\u0432\u0430 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0438\u0442\u0435, \u043a\u043e\u0438\u0442\u043e \u0441\u0430 \u043f\u043e\u0441\u0435\u0442\u0438\u043b\u0438 \u043f\u0440\u0435\u0434\u0438, \u0438 \u0430\u043d\u0430\u043b\u0438\u0437 \u043d\u0430 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0442\u0430 \u043d\u0430 \u0440\u0435\u043a\u043b\u0430\u043c\u043d\u0430\u0442\u0430 \u043a\u0430\u043c\u043f\u0430\u043d\u0438\u044f.</p>",
                  ar:
                      "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0644\u062a\u0632\u0648\u064a\u062f \u0627\u0644\u0632\u0627\u0626\u0631\u064a\u0646 \u0628\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u062e\u0635\u0635\u0629 \u0627\u0633\u062a\u0646\u0627\u062f\u064b\u0627 \u0625\u0644\u0649 \u0627\u0644\u0635\u0641\u062d\u0627\u062a \u0627\u0644\u062a\u064a \u0632\u0627\u0631\u0648\u0647\u0627 \u0645\u0646 \u0642\u0628\u0644 \u0648\u062a\u062d\u0644\u064a\u0644 \u0641\u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u062d\u0645\u0644\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064a\u0629.</p>",
                  da: "<p>Annonce-cookies bruges til at levere bes\u00f8gende med tilpassede reklamer baseret p\u00e5 de sider, de har bes\u00f8gt f\u00f8r, og analysere effektiviteten af \u200b\u200bannoncekampagnen.</p>",
              },
              scripts: [
                  {
                      id: 7094,
                      name: { en: "Twitter", de: "Twitter", fr: "Twitter", it: "Twitter", es: "Twitter", nl: "Twitter", bg: "Twitter", ar: "Twitter" },
                      description: {
                          en: "Twitter stores cookies from the website that has its embedded content. It also stores cookies to track user behavior to provide them with relevant advertisement.",
                          de: "Twitter stores cookies from the website that has its embedded content. It also stores cookies to track user behavior to provide them with relevant advertisement.",
                          fr: "Twitter stores cookies from the website that has its embedded content. It also stores cookies to track user behavior to provide them with relevant advertisement.",
                          it: "Twitter stores cookies from the website that has its embedded content. It also stores cookies to track user behavior to provide them with relevant advertisement.",
                          es: "Twitter stores cookies from the website that has its embedded content. It also stores cookies to track user behavior to provide them with relevant advertisement.",
                          nl: "Twitter stores cookies from the website that has its embedded content. It also stores cookies to track user behavior to provide them with relevant advertisement.",
                          bg: "Twitter stores cookies from the website that has its embedded content. It also stores cookies to track user behavior to provide them with relevant advertisement.",
                          ar: "Twitter stores cookies from the website that has its embedded content. It also stores cookies to track user behavior to provide them with relevant advertisement.",
                      },
                      cookie_ids: "personalization_id",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 7096,
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
                      cookie_ids: "bscookie",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 7097,
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
                      id: 7099,
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
                      id: 7100,
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
                      cookie_ids: "_js_datr",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 7101,
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
                      id: 14021,
                      name: {
                          en: "Google Ads Global Site Tag",
                          de: "Google Ads Global Site Tag",
                          fr: "Google Ads Global Site Tag",
                          it: "Google Ads Global Site Tag",
                          es: "Google Ads Global Site Tag",
                          nl: "Google Ads Global Site Tag",
                          bg: "Google Ads Global Site Tag",
                          da: "Google Ads Global Site Tag",
                          ru: "Google Ads Global Site Tag",
                          ar: "Google Ads Global Site Tag",
                      },
                      description: {
                          en: "Site Tag for FCC Innovation Google Ads account.",
                          de: "Site Tag for FCC Innovation Google Ads account.",
                          fr: "Site Tag for FCC Innovation Google Ads account.",
                          it: "Site Tag for FCC Innovation Google Ads account.",
                          es: "Site Tag for FCC Innovation Google Ads account.",
                          nl: "Site Tag for FCC Innovation Google Ads account.",
                          bg: "Site Tag for FCC Innovation Google Ads account.",
                          da: "Site Tag for FCC Innovation Google Ads account.",
                          ru: "Site Tag for FCC Innovation Google Ads account.",
                          ar: "Site Tag for FCC Innovation Google Ads account.",
                      },
                      cookie_ids: "_ga",
                      active: 1,
                      head_script:
                          "<!-- Global site tag (gtag.js) - Google Ads: 879152794 -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=AW-879152794\"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', 'AW-879152794');\n</script>",
                      body_script: null,
                  },
              ],
              cookies: [
                  {
                      id: 7318,
                      cookie_id: "AWSALB",
                      description: {
                          en: "AWSALB is a cookie generated by the Application load balancer in the Amazon Web Services. It works slightly different from AWSELB.",
                          de: "AWSALB is a cookie generated by the Application load balancer in the Amazon Web Services. It works slightly different from AWSELB.",
                          fr: "AWSALB is a cookie generated by the Application load balancer in the Amazon Web Services. It works slightly different from AWSELB.",
                          it: "AWSALB is a cookie generated by the Application load balancer in the Amazon Web Services. It works slightly different from AWSELB.",
                          es: "AWSALB is a cookie generated by the Application load balancer in the Amazon Web Services. It works slightly different from AWSELB.",
                          nl: "AWSALB is a cookie generated by the Application load balancer in the Amazon Web Services. It works slightly different from AWSELB.",
                          bg: "AWSALB is a cookie generated by the Application load balancer in the Amazon Web Services. It works slightly different from AWSELB.",
                          ar: "AWSALB is a cookie generated by the Application load balancer in the Amazon Web Services. It works slightly different from AWSELB.",
                      },
                      duration: "1 week",
                      type: "http",
                      domain: "widget-mediator.zopim.com",
                  },
                  {
                      id: 8130,
                      cookie_id: "VISITOR_INFO1_LIVE",
                      description: {
                          en: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          de: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          fr: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          it: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          es: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          nl: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          bg: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                          da: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                      },
                      duration: "5 months",
                      type: "https",
                      domain: ".youtube.com",
                  },
                  {
                      id: 8131,
                      cookie_id: "GPS",
                      description: {
                          en: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          de: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          fr: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          it: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          es: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          nl: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          bg: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                          da: "This cookie is set by Youtube and registers a unique ID for tracking users based on their geographical location",
                      },
                      duration: "30 minutes",
                      type: "http",
                      domain: ".youtube.com",
                  },
                  {
                      id: 8132,
                      cookie_id: "YSC",
                      description: {
                          en: "This cookie is set by Youtube and is used to track the views of embedded videos.",
                          de: "This cookie is set by Youtube and is used to track the views of embedded videos.",
                          fr: "This cookie is set by Youtube and is used to track the views of embedded videos.",
                          it: "This cookie is set by Youtube and is used to track the views of embedded videos.",
                          es: "This cookie is set by Youtube and is used to track the views of embedded videos.",
                          nl: "This cookie is set by Youtube and is used to track the views of embedded videos.",
                          bg: "This cookie is set by Youtube and is used to track the views of embedded videos.",
                          da: "This cookie is set by Youtube and is used to track the views of embedded videos.",
                      },
                      duration: "Never expire",
                      type: "https",
                      domain: ".youtube.com",
                  },
                  {
                      id: 11632,
                      cookie_id: "personalization_id",
                      description: {
                          en: "This cookie is set by twitter.com. It is used integrate the sharing features of this social media. It also stores information about how the user uses the website for tracking and targeting.",
                          de: "This cookie is set by twitter.com. It is used integrate the sharing features of this social media. It also stores information about how the user uses the website for tracking and targeting.",
                          fr: "This cookie is set by twitter.com. It is used integrate the sharing features of this social media. It also stores information about how the user uses the website for tracking and targeting.",
                          it: "This cookie is set by twitter.com. It is used integrate the sharing features of this social media. It also stores information about how the user uses the website for tracking and targeting.",
                          es: "This cookie is set by twitter.com. It is used integrate the sharing features of this social media. It also stores information about how the user uses the website for tracking and targeting.",
                          nl: "This cookie is set by twitter.com. It is used integrate the sharing features of this social media. It also stores information about how the user uses the website for tracking and targeting.",
                          bg: "This cookie is set by twitter.com. It is used integrate the sharing features of this social media. It also stores information about how the user uses the website for tracking and targeting.",
                          ar: "This cookie is set by twitter.com. It is used integrate the sharing features of this social media. It also stores information about how the user uses the website for tracking and targeting.",
                      },
                      duration: "2 years",
                      type: "http",
                      domain: ".twitter.com",
                  },
                  {
                      id: 11633,
                      cookie_id: "guest_id",
                      description: {
                          en: "This cookie is set by Twitter to identify and track the website visitor.",
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
                      domain: ".twitter.com",
                  },
                  {
                      id: 11635,
                      cookie_id: "ct0",
                      description: {
                          en: "This cookie enable us to track visitor activity from our Twitter ads on our website, and also to allow users to share content from our websites.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "6 hours",
                      type: "http",
                      domain: ".twitter.com",
                  },
                  {
                      id: 11641,
                      cookie_id: "bscookie",
                      description: {
                          en: "This cookie is a browser ID cookie set by Linked share Buttons and ad tags.",
                          de: "This cookie is a browser ID cookie set by Linked share Buttons and ad tags.",
                          fr: "This cookie is a browser ID cookie set by Linked share Buttons and ad tags.",
                          it: "This cookie is a browser ID cookie set by Linked share Buttons and ad tags.",
                          es: "This cookie is a browser ID cookie set by Linked share Buttons and ad tags.",
                          nl: "This cookie is a browser ID cookie set by Linked share Buttons and ad tags.",
                          bg: "This cookie is a browser ID cookie set by Linked share Buttons and ad tags.",
                          ar: "This cookie is a browser ID cookie set by Linked share Buttons and ad tags.",
                      },
                      duration: "2 years",
                      type: "https",
                      domain: ".www.linkedin.com",
                  },
                  {
                      id: 11648,
                      cookie_id: "loid",
                      description: {
                          en: "Set by reddit.com. Reddit sets this cookie for tracking user conversions from reddit.com advertising to our the website.",
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
                      domain: ".reddit.com",
                  },
                  {
                      id: 11649,
                      cookie_id: "d2_token",
                      description: {
                          en: "Set by reddit.com. Reddit sets this cookie for tracking user conversions from reddit.com advertising to our the website.",
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
                      domain: ".reddit.com",
                  },
                  {
                      id: 11650,
                      cookie_id: "eu_cookie_v2",
                      description: {
                          en: "Set by reddit.com. Reddit sets this cookie for tracking user conversions from reddit.com advertising to our the website.",
                          de: "Description is currently not available.",
                          fr: "Description is currently not available.",
                          it: "Description is currently not available.",
                          es: "Description is currently not available.",
                          nl: "Description is currently not available.",
                          bg: "Description is currently not available.",
                          ar: "Description is currently not available.",
                      },
                      duration: "10 years",
                      type: "http",
                      domain: ".reddit.com",
                  },
                  {
                      id: 11651,
                      cookie_id: "session_tracker",
                      description: {
                          en: "Set by reddit.com. Reddit sets this cookie for tracking user conversions from reddit.com advertising to our the website.",
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
                      domain: ".reddit.com",
                  },
                  {
                      id: 11652,
                      cookie_id: "edgebucket",
                      description: {
                          en: "Set by reddit.com. Reddit sets this cookie for tracking user conversions from reddit.com advertising to our the website.",
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
                      domain: ".reddit.com",
                  },
                  {
                      id: 11653,
                      cookie_id: "session",
                      description: {
                          en: "Set by reddit.com. Reddit sets this cookie for tracking user conversions from reddit.com advertising to our the website.",
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
                      domain: "www.reddit.com",
                  },
                  {
                      id: 11656,
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
                      id: 11661,
                      cookie_id: "aasd",
                      description: {
                          en: "This cookie is used by reddit.com",
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
                      domain: "www.reddit.com",
                  },
                  {
                      id: 52517,
                      cookie_id: "hubspotuk",
                      description: {
                          en:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          de:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          fr:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          it:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          es:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          nl:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          bg:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          da:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          ru:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          ar:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                          pl:
                              "This cookie connects our website to our CRM. If your IP address is recognised as belonging to a company, our CRM may be able to match that IP address and company and tell us that someone at that company visited the site. It does not give us a name of an individual.",
                      },
                      duration: "1 year",
                      type: "https",
                      domain: ".fccinnovation.co.uk",
                  },
                  {
                      id: 52526,
                      cookie_id: "_hjid",
                      description: {
                          en:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          de:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          fr:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          it:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          es:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          nl:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          bg:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          da:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          ru:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          ar:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                          pl:
                              "Hotjar cookie. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                      },
                      duration: "365 days",
                      type: "https",
                      domain: ".hubspot.com",
                  },
                  {
                      id: 52527,
                      cookie_id: "_hjTLDTest",
                      description: {
                          en:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          de:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          fr:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          it:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          es:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          nl:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          bg:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          da:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          ru:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          ar:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                          pl:
                              "When the Hotjar script executes we try to determine the most generic cookie path we should use, instead of the page hostname. This is done so that cookies can be shared across subdomains (where applicable). To determine this, we try to store the _hjTLDTest cookie for different URL substring alternatives until it fails. After this check, the cookie is removed.",
                      },
                      duration: "Session",
                      type: "http",
                      domain: ".hubspot.com",
                  },
                  {
                      id: 52528,
                      cookie_id: "_hjAbsoluteSessionInProgress",
                      description: {
                          en: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          de: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          fr: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          it: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          es: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          nl: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          bg: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          da: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          ru: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          ar: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                          pl: "This cookie is used to detect the first pageview session of a user. This is a True/False flag set by the cookie.",
                      },
                      duration: "30 mins",
                      type: "https",
                      domain: ".hubspot.com",
                  },
                  {
                      id: 52529,
                      cookie_id: "_gcl_au",
                      description: {
                          en: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          de: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          fr: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          it: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          es: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          nl: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          bg: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          da: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          ru: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          ar: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                          pl: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services",
                      },
                      duration: "Never expire",
                      type: "https",
                      domain: ".hubspot.com",
                  },
                  {
                      id: 52530,
                      cookie_id: "_fbp",
                      description: {
                          en: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          de: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          fr: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          it: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          es: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          nl: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          bg: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          da: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          ru: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          ar: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                          pl: "Used by Facebook to deliver a series of advertisement products such as real time bidding from third party advertisers",
                      },
                      duration: "Never expire",
                      type: "https",
                      domain: ".hubspot.com",
                  },
                  {
                      id: 52535,
                      cookie_id: "IDE",
                      description: {
                          en: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          de: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          fr: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          it: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          es: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          nl: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          bg: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          da: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          ru: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          ar: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                          pl: "This domain is owned by Doubleclick (Google). The main business activity is: Doubleclick is Googles real time bidding advertising exchange",
                      },
                      duration: "Never expire",
                      type: "https",
                      domain: ".doubleclick.net",
                  },
                  {
                      id: 52536,
                      cookie_id: "DV",
                      description: {
                          en: "Associated with Google.",
                          de: "Associated with Google.",
                          fr: "Associated with Google.",
                          it: "Associated with Google.",
                          es: "Associated with Google.",
                          nl: "Associated with Google.",
                          bg: "Associated with Google.",
                          da: "Associated with Google.",
                          ru: "Associated with Google.",
                          ar: "Associated with Google.",
                          pl: "Associated with Google.",
                      },
                      duration: "13 months",
                      type: "http",
                      domain: "www.google.com",
                  },
                  {
                      id: 52537,
                      cookie_id: "CONSENT",
                      description: {
                          en: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          de: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          fr: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          it: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          es: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          nl: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          bg: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          da: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          ru: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          ar: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          pl: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                      },
                      duration: "Never expire",
                      type: "https",
                      domain: ".google.com / .youtube.com / .google.co.uk",
                  },
                  {
                      id: 52538,
                      cookie_id: "1P_JAR",
                      description: {
                          en: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          de: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          fr: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          it: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          es: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          nl: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          bg: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          da: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          ru: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          ar: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                          pl: "This cookie carries out information about how the end user uses the website and any advertising that the end user may have seen before visiting the said website.",
                      },
                      duration: "Never expire",
                      type: "https",
                      domain: ".google.com",
                  },
              ],
          },
      ],
      privacyPolicy: {
          title: {
              en: "Cookie Notice",
              de: "Datenschutz-Bestimmungen",
              fr: "Politique de confidentialit\u00e9",
              it: "politica sulla riservatezza",
              es: "Pol\u00edtica de privacidad",
              nl: "Privacybeleid",
              bg: "\u0414\u0435\u043a\u043b\u0430\u0440\u0430\u0446\u0438\u044f \u0437\u0430 \u043f\u043e\u0432\u0435\u0440\u0438\u0442\u0435\u043b\u043d\u043e\u0441\u0442",
              ar: "\u0633\u064a\u0627\u0633\u0629 \u062e\u0627\u0635\u0629",
              da: "Fortrolighedspolitik",
          },
          text: {
              en:
                  "<p>This website uses cookies to improve your experience while you navigate through the website. Out of these cookies, the cookies that are categorized as necessary are stored on your browser as they as essential for the working of basic functionalities of the website. </p><p>We also use third-party cookies that help us analyze and understand how you use this website, to store user preferences and provide them with content and advertisements that are relevant to you. These cookies will only be stored on your browser with your consent to do so. You also have the option to opt-out of these cookies.But opting out of some of these cookies may have an effect on your browsing experience.</p>",
              de:
                  "<p>Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern, w\u00e4hrend Sie durch die Website navigieren. Von diesen Cookies werden die nach Bedarf kategorisierten Cookies in Ihrem Browser gespeichert, da sie f\u00fcr das Funktionieren der Grundfunktionen der Website von wesentlicher Bedeutung sind.</p><p>Wir verwenden auch Cookies von Drittanbietern, mit denen wir analysieren und nachvollziehen k\u00f6nnen, wie Sie diese Website nutzen, um Benutzereinstellungen zu speichern und ihnen f\u00fcr Sie relevante Inhalte und Anzeigen bereitzustellen.</p><p>Diese Cookies werden nur mit Ihrer Zustimmung in Ihrem Browser gespeichert. Sie haben auch die M\u00f6glichkeit, diese Cookies zu deaktivieren. Das Deaktivieren einiger dieser Cookies kann sich jedoch auf Ihr Surferlebnis auswirken.</p>",
              fr:
                  "<p>Ce site utilise des cookies pour am\u00e9liorer votre exp\u00e9rience de navigation sur le site. Hors de ces cookies, les cookies class\u00e9s comme n\u00e9cessaires sont stock\u00e9s dans votre navigateur car ils sont essentiels au fonctionnement des fonctionnalit\u00e9s de base du site. Nous utilisons \u00e9galement des cookies tiers qui nous aident \u00e0 analyser et \u00e0 comprendre comment vous utilisez ce site Web, \u00e0 stocker les pr\u00e9f\u00e9rences de l'utilisateur et \u00e0 lui fournir un contenu et des publicit\u00e9s pertinents pour vous.</p><p>Ces cookies ne seront stock\u00e9s sur votre navigateur qu'avec votre consentement.Vous avez \u00e9galement la possibilit\u00e9 de d\u00e9sactiver ces cookies.Toutefois, la d\u00e9sactivation de certains de ces cookies peut avoir une incidence sur votre exp\u00e9rience de navigation.</p>",
              it:
                  "<p>Questo sito Web utilizza i cookie per migliorare la tua esperienza durante la navigazione nel sito Web. Di questi cookie, i cookie classificati come necessari vengono memorizzati nel browser in quanto essenziali per il funzionamento delle funzionalit\u00e0 di base del sito Web. Utilizziamo anche cookie di terze parti che ci aiutano ad analizzare e comprendere come utilizzi questo sito Web, per memorizzare le preferenze degli utenti e fornire loro contenuti e pubblicit\u00e0 pertinenti per te.</p><p>Questi cookie verranno memorizzati sul tuo browser solo con il tuo consenso. Hai anche la possibilit\u00e0 di disattivare questi cookie. La disattivazione di alcuni di questi cookie pu\u00f2 influire sulla tua esperienza di navigazione.</p>",
              es:
                  "<p>Este sitio web utiliza cookies para mejorar su experiencia mientras navega por el sitio web. Fuera de estas cookies, las cookies que se clasifican como necesarias se almacenan en su navegador, ya que son esenciales para el funcionamiento de las funcionalidades b\u00e1sicas del sitio web. Tambi\u00e9n utilizamos cookies de terceros que nos ayudan a analizar y comprender c\u00f3mo utiliza este sitio web para almacenar las preferencias de los usuarios y proporcionarles contenido y anuncios que sean relevantes para usted.</p><p>Estas cookies solo se almacenar\u00e1n en su navegador con su consentimiento para hacerlo. Tambi\u00e9n tiene la opci\u00f3n de optar por no recibir estas cookies. Sin embargo, la exclusi\u00f3n de algunas de estas cookies puede afectar su experiencia de navegaci\u00f3n.</p>",
              nl:
                  "<p>Deze website maakt gebruik van cookies om uw ervaring te verbeteren terwijl u door de website navigeert. Van deze cookies worden de cookies die als noodzakelijk zijn gecategoriseerd, in uw browser opgeslagen omdat ze essentieel zijn voor de werking van de basisfuncties van de website. We gebruiken ook cookies van derden die ons helpen analyseren en begrijpen hoe u deze website gebruikt, om gebruikersvoorkeuren op te slaan en hen te voorzien van inhoud en advertenties die voor u relevant zijn.</p><p>Deze cookies worden alleen in uw browser opgeslagen met uw toestemming om dit te doen. U hebt ook de optie om u af te melden voor deze cookies.</p><p>Het afmelden voor sommige van deze cookies kan echter een effect hebben op uw browse-ervaring.</p>",
              bg:
                  "<p>\u0422\u043e\u0437\u0438 \u0441\u0430\u0439\u0442 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438, \u0437\u0430 \u0434\u0430 \u043f\u043e\u0434\u043e\u0431\u0440\u0438 \u0412\u0430\u0448\u0438\u044f \u043e\u043f\u0438\u0442, \u0434\u043e\u043a\u0430\u0442\u043e \u043d\u0430\u0432\u0438\u0433\u0438\u0440\u0430\u0442\u0435 \u0432 \u0441\u0430\u0439\u0442\u0430. \u041e\u0442 \u0442\u0435\u0437\u0438 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438, \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u0442\u0435, \u043a\u043e\u0438\u0442\u043e \u0441\u0430 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0437\u0438\u0440\u0430\u043d\u0438 \u043a\u0430\u0442\u043e \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0438, \u0441\u0435 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u0442 \u0432\u044a\u0432 \u0412\u0430\u0448\u0438\u044f \u0431\u0440\u0430\u0443\u0437\u044a\u0440, \u0442\u044a\u0439 \u043a\u0430\u0442\u043e \u0442\u0435 \u0441\u0430 \u043e\u0442 \u0441\u044a\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043e \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0437\u0430 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u0430 \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u0442\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u043d\u043e\u0441\u0442\u0438 \u043d\u0430 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u0430.</p><p>\u0421\u044a\u0449\u043e \u0442\u0430\u043a\u0430 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043c\u0435 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u043d\u0430 \u0442\u0440\u0435\u0442\u0438 \u0441\u0442\u0440\u0430\u043d\u0438, \u043a\u043e\u0438\u0442\u043e \u043d\u0438 \u043f\u043e\u043c\u0430\u0433\u0430\u0442 \u0434\u0430 \u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043c\u0435 \u0438 \u0440\u0430\u0437\u0431\u0435\u0440\u0435\u043c \u043a\u0430\u043a \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442\u0435 \u0442\u043e\u0437\u0438 \u0443\u0435\u0431\u0441\u0430\u0439\u0442, \u0434\u0430 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u043c\u0435 \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0438\u0442\u0430\u043d\u0438\u044f\u0442\u0430 \u043d\u0430 \u043f\u043e\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043b\u0438\u0442\u0435 \u0438 \u0434\u0430 \u0438\u043c \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u044f\u043c\u0435 \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u043d\u0438\u0435 \u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u0438, \u043a\u043e\u0438\u0442\u043e \u0441\u0430 \u043f\u043e\u0434\u0445\u043e\u0434\u044f\u0449\u0438 \u0437\u0430 \u0432\u0430\u0441. \u0422\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u0449\u0435 \u0441\u0435 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u0442 \u0441\u0430\u043c\u043e \u0432 \u0431\u0440\u0430\u0443\u0437\u044a\u0440\u0430 \u0432\u0438 \u0441 \u0432\u0430\u0448\u0435 \u0441\u044a\u0433\u043b\u0430\u0441\u0438\u0435 \u0437\u0430 \u0442\u043e\u0432\u0430. \u0421\u044a\u0449\u043e \u0442\u0430\u043a\u0430 \u0438\u043c\u0430\u0442\u0435 \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442 \u0434\u0430 \u0441\u0435 \u043e\u0442\u043a\u0430\u0436\u0435\u0442\u0435 \u043e\u0442 \u0442\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c. \u041d\u043e \u0438\u0437\u043a\u043b\u044e\u0447\u0432\u0430\u043d\u0435\u0442\u043e \u043d\u0430 \u043d\u044f\u043a\u043e\u0438 \u043e\u0442 \u0442\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u043c\u043e\u0436\u0435 \u0434\u0430 \u043f\u043e\u0432\u043b\u0438\u044f\u0435 \u043d\u0430 \u043e\u043f\u0438\u0442\u0430 \u0432\u0438 \u043f\u0440\u0438 \u0441\u044a\u0440\u0444\u0438\u0440\u0430\u043d\u0435.</p>",
              ar:
                  "<p>\u064a\u0633\u062a\u062e\u062f\u0645 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628 \u0647\u0630\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0644\u062a\u062d\u0633\u064a\u0646 \u062a\u062c\u0631\u0628\u062a\u0643 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u062a\u0646\u0642\u0644 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639. \u0645\u0646 \u0628\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u060c \u064a\u062a\u0645 \u062a\u062e\u0632\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0645\u0635\u0646\u0641\u0629 \u062d\u0633\u0628 \u0627\u0644\u0636\u0631\u0648\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0627\u0644\u062e\u0627\u0635 \u0628\u0643 \u0644\u0623\u0646\u0647\u0627 \u0636\u0631\u0648\u0631\u064a\u0629 \u0644\u0639\u0645\u0644 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0644\u0644\u0645\u0648\u0642\u0639. </p><p>\u0646\u0633\u062a\u062e\u062f\u0645 \u0623\u064a\u0636\u064b\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062b\u0627\u0644\u062b \u0627\u0644\u062a\u064a \u062a\u0633\u0627\u0639\u062f\u0646\u0627 \u0639\u0644\u0649 \u062a\u062d\u0644\u064a\u0644 \u0648\u0641\u0647\u0645 \u0643\u064a\u0641\u064a\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u060c \u0644\u062a\u062e\u0632\u064a\u0646 \u062a\u0641\u0636\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0648\u062a\u0632\u0648\u064a\u062f\u0647\u0645 \u0628\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0630\u0627\u062a \u0627\u0644\u0635\u0644\u0629 \u0628\u0643. \u0633\u064a\u062a\u0645 \u062a\u062e\u0632\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0641\u0642\u0637 \u0639\u0644\u0649 \u0645\u062a\u0635\u0641\u062d\u0643 \u0628\u0645\u0648\u0627\u0641\u0642\u062a\u0643 \u0639\u0644\u0649 \u0627\u0644\u0642\u064a\u0627\u0645 \u0628\u0630\u0644\u0643. \u0644\u062f\u064a\u0643 \u0623\u064a\u0636\u064b\u0627 \u062e\u064a\u0627\u0631 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0645\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647. \u0644\u0643\u0646 \u0625\u0644\u063a\u0627\u0621 \u0627\u0634\u062a\u0631\u0627\u0643 \u0628\u0639\u0636 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0642\u062f \u064a\u0643\u0648\u0646 \u0644\u0647 \u062a\u0623\u062b\u064a\u0631 \u0639\u0644\u0649 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u062a\u0635\u0641\u062d \u0644\u062f\u064a\u0643.</p>",
              da:
                  "<p>Dette websted bruger cookies til at forbedre din oplevelse, mens du navigerer gennem webstedet. Ud af disse cookies gemmes de cookies, der er kategoriseret efter behov, i din browser, da de er v\u00e6sentlige for, at websitetens grundl\u00e6ggende funktionaliteter fungerer. </p><p>Vi bruger ogs\u00e5 tredjepartscookies, der hj\u00e6lper os med at analysere og forst\u00e5, hvordan du bruger dette websted, til at gemme brugerpr\u00e6ferencer og give dem indhold og reklamer, der er relevante for dig. Disse cookies gemmes kun i din browser med dit samtykke hertil. Du har ogs\u00e5 muligheden for at frav\u00e6lge disse cookies. Men at frav\u00e6lge nogle af disse cookies kan have en indvirkning p\u00e5 din browseroplevelse.</p>",
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
  var createBannerOnLoad = function createBannerOnLoad() {
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
      console.log('1');
      console.log
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
              acceptCookies();
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
          if (options.consentBarType == "box") {
              getById("cky-consent").classList.add("box-" + options.position);
          }
          if (!!content["gdpr"].customLogoUrl) {
              appendLogo();
          }
          appendText();
          renderButtons();
          if (options.showCategoryDirectly) {
              renderCategoryBar();
          }
      }
      if (options.display["gdpr"].notice) {
          if (cookie.read("cky-action") === "") {
              if (cookie.read("cookieyesID") === "") {
                  cookie.set("cookieyesID", cookieyesID, cookie.ACCEPT_COOKIE_EXPIRE);
              }
              renderBanner();
              setInitialCookies();
          } else {
              if (display["gdpr"].noticeToggler) {
                  showToggler();
              }
          }
      }
      if (cookie.read("cky-consent") === "yes") {
          checkAndInsertScripts(info.categories);
      }
      function createBanner() {
          var consentBar;
          if (!!content["gdpr"].customLogoUrl) {
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
          ckyConsentBar = getById("cky-consent");
          ckyConsentBar.style.background = colors["gdpr"].notice.bg;
          ckyConsentBar.style.color = colors["gdpr"].notice.textColor;
          ckyConsentBar.style.borderWidth = "1px";
          ckyConsentBar.style.borderStyle = "solid";
          ckyConsentBar.style.borderColor = colors["gdpr"].notice.borderColor;
          ckyConsentBar.style.top = positionValue[position].top;
          ckyConsentBar.style.right = positionValue[position].right;
          ckyConsentBar.style.bottom = positionValue[position].bottom;
          ckyConsentBar.style.left = positionValue[position].left;
      }
      function appendLogo() {
          getById("cky-consent").classList.add("cky-logo-active");
          var consentLogo = '<img src="' + content["gdpr"].customLogoUrl + '" class="img-fluid cky-logo" style="width: 100px" alt="Brand logo">';
          getById("cky-content-logo").insertAdjacentHTML("afterbegin", consentLogo);
      }
      function appendText() {
          if (content["gdpr"].title[selectedLanguage] !== null && /\S/.test(content["gdpr"].title[selectedLanguage])) {
              var consentTitle = '<h4 class="cky-consent-title">' + content["gdpr"].title[selectedLanguage] + "</h4>";
              if (!!content["gdpr"].customLogoUrl) {
                  getById("cky-content-logo-inner-wrapper").insertAdjacentHTML("afterbegin", consentTitle);
              } else {
                  getById("cky-consent").insertAdjacentHTML("afterbegin", consentTitle);
              }
          }
          var consentText = '<p class="cky-bar-text">' + content["gdpr"].text[selectedLanguage] + "</p>";
          getById("cky-consent").getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("beforeend", consentText);
      }
      function renderCategoryBar() {
          var categoryDirectList = '<div class="cky-category-direct" id="cky-category-direct" style="color:' + colors["gdpr"].notice.textColor + '"></div>';
          if (options.consentBarType === "box") {
              getById("cky-consent").getElementsByClassName("cky-bar-text")[0].insertAdjacentHTML("beforebegin", categoryDirectList);
          } else {
              getById("cky-consent").getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("afterend", categoryDirectList);
          }
          for (var i = 0; i < categories.length; i++) {
              var category = categories[i];
              var categoryBarItem = '<div class="cky-category-direct-item"><span class="cky-category-direct-name" id="cky-category-direct-' + category.name[selectedLanguage] + '">' + category.name[selectedLanguage] + "</span></div>";
              getById("cky-category-direct").insertAdjacentHTML("beforeend", categoryBarItem);
              createSwitches(category);
          }
      }
      function renderButtons() {
          ckyConsentBar.getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("beforeend", '<div class="cky-button-wrapper"></div>');
          for (var key in display["gdpr"].buttons) {
              if (display["gdpr"].buttons[key]) {
                  if (key === "readMore") {
                      var privacyLink = content["gdpr"].privacyPolicyLink[selectedLanguage].trim().replace(/\s/g, "");
                      if (/^(:\/\/)/.test(privacyLink)) {
                          privacyLink = "http" + privacyLink + "";
                      }
                      if (!/^(f|ht)tps?:\/\//i.test(privacyLink)) {
                          privacyLink = "http://" + privacyLink + "";
                      }
                      var button = '<a class="cky-btn-' + key + '" id="cky-btn-' + key + '" href="' + privacyLink + '" target="_blank">' + content["gdpr"].buttons[key][selectedLanguage] + "</a>";
                      getByClass("cky-bar-text")[0].insertAdjacentHTML("beforeend", button);
                  } else {
                      var button = '<button class="cky-btn cky-btn-' + key + '" id="cky-btn-' + key + '">' + content["gdpr"].buttons[key][selectedLanguage] + "</button>";
                      if (key === "settings") {
                          getById("cky-btn-accept").insertAdjacentHTML("beforebegin", button);
                      } else {
                          getByClass("cky-button-wrapper")[0].insertAdjacentHTML("beforeend", button);
                      }
                      getById("cky-btn-" + key + "").onclick = bannerFunctions[key];
                  }
                  getById("cky-btn-" + key + "").style.color = colors["gdpr"].buttons[key].textColor;
                  getById("cky-btn-" + key + "").style.backgroundColor = colors["gdpr"].buttons[key].bg;
                  getById("cky-btn-" + key + "").style.borderColor = colors["gdpr"].buttons[key].borderColor;
                  if (key === "settings") {
                      switchStickyOrPopup();
                  }
              }
          }
      }
      function switchStickyOrPopup() {
          switch (template.detailType) {
              case "sticky":
                  getById("cky-btn-settings").style.borderColor = "transparent";
                  renderStickyDetail();
                  break;
              case "popup":
                  renderPopupDetail();
          }
      }
      function renderStickyDetail() {
          var tabCss = "color:" + colors["gdpr"].popup.pills.textColor + ";" + "border-color:" + colors["gdpr"].notice.borderColor + "";
          var activeTabCss = "background-color:" + colors["gdpr"].popup.pills.activeBg + ";" + "color:" + colors["gdpr"].popup.pills.activeTextColor + ";" + "border-color:" + colors["gdpr"].notice.borderColor + ";";
          var ckyDetailWrapper =
              '<div class="cky-detail-wrapper" id="cky-detail-wrapper" style="border-color:' +
              colors["gdpr"].notice.borderColor +
              '">\
                                          <div class="cky-tab">\
                                              <div class="cky-tab-menu" id="cky-tab-menu" style="background-color:' +
              colors["gdpr"].popup.pills.bg +
              '"></div>\
                                                  <div class="cky-tab-content" id="cky-tab-content" style="background-color:' +
              colors["gdpr"].notice.bg +
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
                                                  <h4 class="cky-tab-title" style="color:' +
                      colors["gdpr"].notice.textColor +
                      '">' +
                      privacyPolicy.title[selectedLanguage] +
                      '</h4>\
                                                  <div class="cky-tab-desc" style="color:' +
                      colors["gdpr"].notice.textColor +
                      '">' +
                      privacyPolicy.text[selectedLanguage] +
                      "</div>\
                                              </div>";
                  getById("cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
                  getById("cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
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
                  getById("cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
                  var ckyTabContentItem =
                      '<div class="cky-tab-content-item" id="cky-tab-content-' +
                      category.name[selectedLanguage] +
                      '">\
                                                  <h4 class="cky-tab-title" id="cky-tab-title-' +
                      category.name[selectedLanguage] +
                      '" style="color:' +
                      colors["gdpr"].notice.textColor +
                      '">' +
                      category.name[selectedLanguage] +
                      '</h4>\
                                                  <div class="cky-tab-desc" style="color:' +
                      colors["gdpr"].notice.textColor +
                      '">' +
                      category.description[selectedLanguage] +
                      "</div>\
                                              </div>";
                  getById("cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
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
                  getByClass("cky-tab-content-active")[0].classList.remove("cky-tab-content-active");
                  var tabId = this.getAttribute("tab-target");
                  getById(tabId).className += " cky-tab-content-active";
              };
          }
          getById("cky-detail-wrapper").style.display = "none";
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
          var tabCss = "color:" + colors["gdpr"].popup.pills.textColor + ";" + "border-color:" + colors["gdpr"].notice.borderColor + "";
          var activeTabCss = "background-color:" + colors["gdpr"].popup.pills.activeBg + ";" + "color:" + colors["gdpr"].popup.pills.activeTextColor + ";" + "border-color:" + colors["gdpr"].notice.borderColor + ";";
          var detailPopupOverlay = '<div class="cky-modal-backdrop cky-fade"></div>';
          var detailPopup =
              '<div class="cky-modal cky-fade" id="cky-settings-popup">\
                                  <div class="cky-modal-dialog" style="background-color:' +
              colors["gdpr"].notice.bg +
              '">\
                                  <div class="cky-modal-content" id="cky-modal-content" style="border:1px solid' +
              colors["gdpr"].notice.borderColor +
              '">\
                                          <div class="cky-tab">\
                                              <div class="cky-tab-menu" id="cky-tab-menu" style="background-color:' +
              colors["gdpr"].popup.pills.bg +
              '"></div>\
                                              <div class="cky-tab-content" id="cky-tab-content" style="background-color:' +
              colors["gdpr"].notice.bg +
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
              getById("cky-modal-content").insertAdjacentHTML("beforeend", ckyPoweredLink);
          }
          for (var i = 0; i < categories.length + 1; i++) {
              if (i === 0) {
                  var ckyTabItem = '<div class="cky-tab-item cky-tab-item-active" id="cky-tab-item-privacy" tab-target="cky-tab-content-privacy" style="' + activeTabCss + '">' + privacyPolicy.title[selectedLanguage] + "</div>";
                  var ckyTabContentItem =
                      '<div class="cky-tab-content-item cky-tab-content-active" id="cky-tab-content-privacy">\
                                                  <h4 class="cky-tab-title" style="color:' +
                      colors["gdpr"].notice.textColor +
                      '">' +
                      privacyPolicy.title[selectedLanguage] +
                      '</h4>\
                                                  <div class="cky-tab-desc" style="color:' +
                      colors["gdpr"].notice.textColor +
                      '">' +
                      privacyPolicy.text[selectedLanguage] +
                      "</div>\
                                              </div>";
                  getById("cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
                  getById("cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
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
                                                  <h4 class="cky-tab-title" id="cky-tab-title-' +
                      category.name[selectedLanguage] +
                      '" style="color:' +
                      colors["gdpr"].notice.textColor +
                      '">' +
                      category.name[selectedLanguage] +
                      '</h4>\
                                                  <div class="cky-tab-desc" style="color:' +
                      colors["gdpr"].notice.textColor +
                      '">' +
                      category.description[selectedLanguage] +
                      "</>\
                                              </div>";
                  getById("cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
                  getById("cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
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
                  getByClass("cky-tab-content-active")[0].classList.remove("cky-tab-content-active");
                  var tabId = this.getAttribute("tab-target");
                  getById(tabId).className += " cky-tab-content-active";
              };
          }
          getByClass("cky-modal-backdrop")[0].onclick = closeCkyModal;
          getById("ckyModalClose").onclick = closeCkyModal;
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
          } else {
              getById("cky-detail-wrapper").style.display = "none";
          }
      }
      function showPopupDetail() {
          getById("cky-settings-popup").classList.add("cky-show");
          getByClass("cky-modal-backdrop")[0].classList.add("cky-show");
      }
      function closeCkyModal() {
          getById("cky-settings-popup").classList.remove("cky-show");
          getByClass("cky-modal-backdrop")[0].classList.remove("cky-show");
      }
      function acceptCookies() {
          updateCookies();
          if (typeof ckyLogCookies !== "undefined") {
              ckyLogCookies();
          }
          cookie.set("cky-action", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
          if (JSON.parse(behaviour.reload)) {
              location.reload();
          } else {
              cookieYes.unblock();
              showToggler();
          }
      }
      function updateCookies() {
          cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
          for (var i = 0; i < info.categories.length; i++) {
              var category = info.categories[i];
              if (category.type !== 1) {
                  var ckyItemToSave = category;
                  if (display["gdpr"].buttons.settings) {
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
              ckyLogCookies();
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
          if (JSON.parse(display["gdpr"].noticeToggler)) {
              var cliConsentBarTrigger =
                  '<div class="cky-consent-bar-trigger" id="cky-consent-toggler" onclick="revisitCkyConsent()" style="\
                  background: ' +
                  colors["gdpr"].notice.bg +
                  ";\
                  color: " +
                  colors["gdpr"].notice.textColor +
                  ";\
                  border: 1px solid " +
                  colors["gdpr"].notice.borderColor +
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
                  content["gdpr"].noticeToggler[selectedLanguage] +
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
                                  <th>\
                                      Cookie\
                                  </th>\
                                  <th>\
                                      Type\
                                  </th>\
                                  <th>\
                                      Duration\
                                  </th>\
                                  <th>\
                                      Description\
                                  </th>\
                              </tr>\
                          </thead>\
                          <tbody>\
                          <tbody>\
                      </table>\
                  </div>';
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
                  acceptCookies();
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
  };
  count(createBannerOnLoad);
});
function checkSelectedLanguage(selectedLanguage, ckyActiveLaw) {
  console.log('1');
  let siteLanguage = document.documentElement.lang;
  if (cliConfig.options.plan === "free" || !siteLanguage) {
      return selectedLanguage;
  }
  console.log(ckyActiveLaw);
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
  console.log('1');
  // selectedLanguage = checkSelectedLanguage(selectedLanguage, activeLawTemp);
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
  if (args[0].toLowerCase() !== "script") return createElementBackup.apply(document, _toConsumableArray(args));
  var scriptElt = createElementBackup.apply(document, _toConsumableArray(args));
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
