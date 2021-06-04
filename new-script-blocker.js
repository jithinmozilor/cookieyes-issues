try {
  bannerActiveCheck();
} catch (err) {
  console.error(err);
}

let ckyActiveLaw = "";
let ipdata = {};

function count(callback) {
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
          { name: "Test", status: getCookie("cookieyes-test") },
          { name: "new-1", status: getCookie("cookieyes-new-1") },
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
      data.append("key", "283620d36e7db014be743e51");
      data.append("ip", JSON.stringify(ipdata));
      data.append("consent_id", consent_id);
      request.open("POST", "https://app.cookieyes.com/api/v1/log", true);
      request.send(data);
  };
}

function bannerActiveCheck() {
  var isActiveCheckCookiePresent = getCookie("cky-active-check");
  if (!isActiveCheckCookiePresent && window.fetch && window.Promise) {
      fetch("https://active.cookieyes.com/api/283620d36e7db014be743e51/log", { method: "POST" }).catch(function (err) {
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
var tldomain = "jithinmozilor.github.io";
var cliConfig = {
  options: {
      plan: "free",
      theme: "light",
      colors: {
          gdpr: {
              popup: { pills: { bg: "#f2f5fa", activeBg: "#ffffff", textColor: "#000000", activeTextColor: "#000000" }, acceptCustomButton: { bg: "#ffffff", textColor: "#0342b5", borderColor: "#0342b5" } },
              notice: { bg: "#fff", textColor: "#565662", titleColor: "#565662", borderColor: "#d4d8df" },
              buttons: {
                  accept: { bg: "#0342b5", textColor: "#fff", borderColor: "#0443b5" },
                  reject: { bg: "#dedfe0", textColor: "#717375", borderColor: "transparent" },
                  readMore: { bg: "transparent", textColor: "#565662", borderColor: "transparent" },
                  settings: { bg: "transparent", textColor: "#7f7f7f", borderColor: "#ebebeb" },
              },
          },
      },
      content: {
          gdpr: {
              text: {
                  ar:
                      "\u064a\u0633\u062a\u062e\u062f\u0645 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628 \u0647\u0630\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062a\u064a \u062a\u0633\u0627\u0639\u062f \u0641\u064a \u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u062a\u062a\u0628\u0639 \u0643\u064a\u0641\u064a\u0629 \u062a\u0641\u0627\u0639\u0644\u0643 \u0645\u0639\u0647 \u062d\u062a\u0649 \u0646\u062a\u0645\u0643\u0646 \u0645\u0646 \u062a\u0632\u0648\u064a\u062f\u0643 \u0628\u062a\u062c\u0631\u0628\u0629 \u0645\u0633\u062a\u062e\u062f\u0645 \u0645\u062d\u0633\u0646\u0629 \u0648\u0645\u062e\u0635\u0635\u0629. \u0644\u0646 \u0646\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0625\u0644\u0627 \u0625\u0630\u0627 \u0643\u0646\u062a \u062a\u0648\u0627\u0641\u0642 \u0639\u0644\u064a\u0647\u0627 \u0628\u0627\u0644\u0646\u0642\u0631 \u0641\u0648\u0642 \u0642\u0628\u0648\u0644. \u064a\u0645\u0643\u0646\u0643 \u0623\u064a\u0636\u064b\u0627 \u0625\u062f\u0627\u0631\u0629 \u062a\u0641\u0636\u064a\u0644\u0627\u062a \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0641\u0631\u062f\u064a\u0629 \u0645\u0646 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a.",
                  bg:
                      "\u0422\u043e\u0437\u0438 \u0443\u0435\u0431\u0441\u0430\u0439\u0442 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438, \u043a\u043e\u0438\u0442\u043e \u043f\u043e\u043c\u0430\u0433\u0430\u0442 \u043d\u0430 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u0430 \u0434\u0430 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0438\u0440\u0430 \u0438 \u0434\u0430 \u043f\u0440\u043e\u0441\u043b\u0435\u0434\u044f\u0432\u0430 \u043a\u0430\u043a \u0441\u0438 \u0432\u0437\u0430\u0438\u043c\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0430\u0442\u0435 \u0441 \u043d\u0435\u0433\u043e, \u0437\u0430 \u0434\u0430 \u043c\u043e\u0436\u0435\u043c \u0434\u0430 \u0412\u0438 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u0438\u043c \u043f\u043e\u0434\u043e\u0431\u0440\u0435\u043d\u043e \u0438 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043d\u043e \u043f\u043e\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043b\u0441\u043a\u043e \u0438\u0437\u0436\u0438\u0432\u044f\u0432\u0430\u043d\u0435. \u041d\u0438\u0435 \u0449\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043c\u0435 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u0442\u0435 \u0441\u0430\u043c\u043e \u0430\u043a\u043e \u0441\u0435 \u0441\u044a\u0433\u043b\u0430\u0441\u0438\u0442\u0435 \u0441 \u0442\u044f\u0445, \u043a\u0430\u0442\u043e \u043a\u043b\u0438\u043a\u043d\u0435\u0442\u0435 \u0432\u044a\u0440\u0445\u0443 \u041f\u0440\u0438\u0435\u043c\u0430\u043c. \u041c\u043e\u0436\u0435\u0442\u0435 \u0441\u044a\u0449\u043e \u0434\u0430 \u0443\u043f\u0440\u0430\u0432\u043b\u044f\u0432\u0430\u0442\u0435 \u0438\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u043d\u0438 \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0438\u0442\u0430\u043d\u0438\u044f \u0437\u0430 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u043e\u0442 \u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438.",
                  ca:
                      "Aquest lloc web utilitza cookies que ajuden el funcionament del lloc web i per fer un seguiment de com interactueu amb ell, de manera que us puguem proporcionar una experi\u00e8ncia d\u2019usuari millorada i personalitzada. \u00danicament utilitzarem les cookies si hi consentiu fent clic a Accepta. Tamb\u00e9 podeu gestionar les prefer\u00e8ncies de cookies individuals des de Configuraci\u00f3.",
                  cr:
                      "Ova web stranica koristi kola\u010di\u0107e koji poma\u017eu u funkcioniranju web stranice i za pra\u0107enje va\u0161e interakcije s njom kako bismo vam mogli pru\u017eiti pobolj\u0161ano i prilago\u0111eno korisni\u010dko iskustvo. Kola\u010di\u0107e \u0107emo koristiti samo ako na njih pristanete klikom na Prihvati. Tako\u0111er mo\u017eete upravljati pojedina\u010dnim postavkama kola\u010di\u0107a u Postavkama.",
                  cs:
                      "Tento web pou\u017e\u00edv\u00e1 soubory cookie, kter\u00e9 pom\u00e1haj\u00ed fungov\u00e1n\u00ed webu a tak\u00e9 ke sledov\u00e1n\u00ed va\u0161\u00ed interakce s na\u0161\u00edm webem. Abychom v\u0161ak zajistili co nejlep\u0161\u00ed u\u017eivatelsk\u00fd z\u00e1\u017eitek, povolte konkr\u00e9tn\u00ed soubory cookie v Nastaven\u00ed a klikn\u011bte na P\u0159ijmout.",
                  de:
                      "Diese Website verwendet Cookies, mit denen die Website funktioniert und wie Sie mit ihr interagieren, damit wir Ihnen eine verbesserte und angepasste Benutzererfahrung bieten k\u00f6nnen. Wir werden die Cookies nur verwenden, wenn Sie dem zustimmen, indem Sie auf Akzeptieren klicken. Sie k\u00f6nnen auch einzelne Cookie-Einstellungen in den Einstellungen verwalten.",
                  en:
                      "This website uses cookies that help the website to function and also to track how you interact with our website. But for us to provide the best user experience, enable the specific cookies from Settings, and click on Accept.",
                  fi:
                      "T\u00e4m\u00e4 verkkosivusto k\u00e4ytt\u00e4\u00e4 ev\u00e4steit\u00e4, jotka auttavat verkkosivustoa toimimaan ja my\u00f6s seuraamaan, miten olet vuorovaikutuksessa verkkosivustomme kanssa. Mutta jotta voimme tarjota parhaan k\u00e4ytt\u00f6kokemuksen, ota tietyt ev\u00e4steet k\u00e4ytt\u00f6\u00f6n Asetuksista ja napsauta Hyv\u00e4ksy.",
                  hu:
                      "Ez a weboldal cookie-kat haszn\u00e1l, amelyek seg\u00edtik a weboldal m\u0171k\u00f6d\u00e9s\u00e9t, \u00e9s nyomon k\u00f6vetik, hogy mik\u00e9nt m\u0171k\u00f6dnek egy\u00fctt vele, hogy jobb \u00e9s szem\u00e9lyre szabott felhaszn\u00e1l\u00f3i \u00e9lm\u00e9nyt ny\u00fajthassunk \u00d6nnek. Csak akkor haszn\u00e1ljuk a cookie-kat, ha beleegyezik az Elfogad\u00e1s gombra kattintva. Az egyedi cookie-be\u00e1ll\u00edt\u00e1sokat a Be\u00e1ll\u00edt\u00e1sok k\u00f6z\u00f6tt is kezelheti.",
                  lt:
                      "\u0160ioje svetain\u0117je naudojami slapukai, kurie padeda svetainei veikti ir taip pat sekti, kaip j\u016bs bendraujate su m\u016bs\u0173 svetaine. Bet kad gal\u0117tume suteikti geriausi\u0105 vartotojo patirt\u012f, nustatymuose \u012fgalinkite konkre\u010dius slapukus ir spustel\u0117kite Priimti.",
                  no:
                      "Dette nettstedet bruker informasjonskapsler som hjelper nettstedet til \u00e5 fungere, og ogs\u00e5 for \u00e5 spore hvordan du samhandler med nettstedet v\u00e5rt. Men for at vi skal gi den beste brukeropplevelsen, aktiver de spesifikke informasjonskapslene fra Innstillinger, og klikk p\u00e5 Godta.",
                  pl:
                      "Ta strona korzysta z plik\u00f3w cookie, kt\u00f3re pomagaj\u0105 jej funkcjonowa\u0107 i \u015bledzi\u0107 spos\u00f3b interakcji z ni\u0105, dzi\u0119ki czemu mo\u017cemy zapewni\u0107 lepsz\u0105 i spersonalizowan\u0105 obs\u0142ug\u0119. B\u0119dziemy u\u017cywa\u0107 plik\u00f3w cookie tylko wtedy, gdy wyrazisz na to zgod\u0119, klikaj\u0105c Akceptuj. Mo\u017cesz r\u00f3wnie\u017c zarz\u0105dza\u0107 indywidualnymi preferencjami dotycz\u0105cymi plik\u00f3w cookie w Ustawieniach.",
                  pt:
                      "Este site usa cookies que ajudam as fun\u00e7\u00f5es do site e rastreiam como voc\u00ea interage com ele, para que possamos lhe fornecer uma experi\u00eancia de usu\u00e1rio aprimorada e personalizada. S\u00f3 usaremos os cookies se voc\u00ea consentir, clicando em Aceitar. Voc\u00ea tamb\u00e9m pode gerenciar prefer\u00eancias de cookies individuais em Configura\u00e7\u00f5es.",
                  ru:
                      "\u042d\u0442\u043e\u0442 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 \u0444\u0430\u0439\u043b\u044b cookie, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043f\u043e\u043c\u043e\u0433\u0430\u044e\u0442 \u0435\u043c\u0443 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0438 \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0442\u044c, \u043a\u0430\u043a \u0432\u044b \u0441 \u043d\u0438\u043c \u0432\u0437\u0430\u0438\u043c\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0443\u0435\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u043c\u044b \u043c\u043e\u0433\u043b\u0438 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u0438\u0442\u044c \u0432\u0430\u043c \u0443\u043b\u0443\u0447\u0448\u0435\u043d\u043d\u044b\u0439 \u0438 \u0438\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u044b\u0439 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u0441\u043a\u0438\u0439 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441. \u041c\u044b \u0431\u0443\u0434\u0435\u043c \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u0444\u0430\u0439\u043b\u044b cookie \u0442\u043e\u043b\u044c\u043a\u043e \u0432 \u0442\u043e\u043c \u0441\u043b\u0443\u0447\u0430\u0435, \u0435\u0441\u043b\u0438 \u0432\u044b \u0434\u0430\u0434\u0438\u0442\u0435 \u0441\u043e\u0433\u043b\u0430\u0441\u0438\u0435 \u043d\u0430 \u044d\u0442\u043e, \u043d\u0430\u0436\u0430\u0432 \u00ab\u041f\u0440\u0438\u043d\u044f\u0442\u044c\u00bb. \u0412\u044b \u0442\u0430\u043a\u0436\u0435 \u043c\u043e\u0436\u0435\u0442\u0435 \u0443\u043f\u0440\u0430\u0432\u043b\u044f\u0442\u044c \u0438\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u044b\u043c\u0438 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u043c\u0438 \u0444\u0430\u0439\u043b\u043e\u0432 cookie \u0432 \u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u0445.",
                  sk:
                      "T\u00e1to webov\u00e1 str\u00e1nka pou\u017e\u00edva cookies, ktor\u00e9 pom\u00e1haj\u00fa webovej str\u00e1nke fungova\u0165 a tie\u017e sledova\u0165 va\u0161u interakciu s na\u0161ou webovou str\u00e1nkou. Aby sme v\u0161ak zaistili \u010do najlep\u0161iu pou\u017e\u00edvate\u013esk\u00fa sk\u00fasenos\u0165, povo\u013ete konkr\u00e9tne cookies v Nastaveniach a kliknite na Prija\u0165.",
                  sl:
                      "Ta spletna stran uporablja pi\u0161kotke, ki pomagajo spletnemu mestu pri delovanju in tudi za sledenje na\u010dinu interakcije z na\u0161o spletno stranjo. Za nas, da zagotovimo najbolj\u0161o uporabni\u0161ko izku\u0161njo, je priporo\u010dljivo, da omogo\u010dite dolo\u010dene pi\u0161kotke iz Nastavitve in kliknite na Sprejmi.",
                  sv:
                      "Denna webbplats anv\u00e4nder cookies som hj\u00e4lper webbplatsens funktioner och f\u00f6r att sp\u00e5ra hur du interagerar med den s\u00e5 att vi kan ge dig f\u00f6rb\u00e4ttrad och anpassad anv\u00e4ndarupplevelse. Vi anv\u00e4nder endast kakorna om du godk\u00e4nner det genom att klicka p\u00e5 Acceptera. Du kan ocks\u00e5 hantera individuella cookieinst\u00e4llningar fr\u00e5n Inst\u00e4llningar.",
                  tr:
                      "Bu web sitesi, web sitesinin \u00e7al\u0131\u015fmas\u0131na yard\u0131mc\u0131 olan ve ayr\u0131ca web sitemizle nas\u0131l etkile\u015fim kurdu\u011funuzu takip eden tan\u0131mlama bilgileri kullan\u0131r. Ancak en iyi kullan\u0131c\u0131 deneyimini sa\u011flamam\u0131z i\u00e7in Ayarlar'dan belirli \u00e7erezleri etkinle\u015ftirin ve Kabul Et'e t\u0131klay\u0131n.",
                  uk:
                      "\u0426\u0435\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0454 \u0444\u0430\u0439\u043b\u0438 cookie, \u044f\u043a\u0456 \u0434\u043e\u043f\u043e\u043c\u0430\u0433\u0430\u044e\u0442\u044c \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443 \u0444\u0443\u043d\u043a\u0446\u0456\u043e\u043d\u0443\u0432\u0430\u0442\u0438, \u0430 \u0442\u0430\u043a\u043e\u0436 \u0432\u0456\u0434\u0441\u0442\u0435\u0436\u0443\u0432\u0430\u0442\u0438, \u044f\u043a \u0432\u0438 \u0432\u0437\u0430\u0454\u043c\u043e\u0434\u0456\u0454\u0442\u0435 \u0437 \u043d\u0430\u0448\u0438\u043c \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u043e\u043c. \u0410\u043b\u0435 \u0434\u043b\u044f \u043d\u0430\u0441, \u0449\u043e\u0431 \u0437\u0430\u0431\u0435\u0437\u043f\u0435\u0447\u0438\u0442\u0438 \u043d\u0430\u0439\u043a\u0440\u0430\u0449\u0443 \u0432\u0437\u0430\u0454\u043c\u043e\u0434\u0456\u044e \u0437 \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0435\u043c, \u0443\u0432\u0456\u043c\u043a\u043d\u0456\u0442\u044c \u043f\u0435\u0432\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0432 \u043d\u0430\u043b\u0430\u0448\u0442\u0443\u0432\u0430\u043d\u043d\u044f\u0445 \u0442\u0430 \u043d\u0430\u0442\u0438\u0441\u043d\u0456\u0442\u044c \u041f\u0440\u0438\u0439\u043d\u044f\u0442\u0438.",
                  zh:
                      "\u672c\u7f51\u7ad9\u4f7f\u7528Cookie\u6765\u5e2e\u52a9\u7f51\u7ad9\u6b63\u5e38\u8fd0\u884c\uff0c\u5e76\u8ddf\u8e2a\u60a8\u4e0e\u6211\u4eec\u7f51\u7ad9\u7684\u4e92\u52a8\u65b9\u5f0f\u3002 \u4f46\u662f\uff0c\u4e3a\u4e86\u8ba9\u6211\u4eec\u63d0\u4f9b\u6700\u4f73\u7684\u7528\u6237\u4f53\u9a8c\uff0c\u8bf7\u4ece\u201c\u8bbe\u7f6e\u201d\u4e2d\u542f\u7528\u7279\u5b9a\u7684cookie\uff0c\u7136\u540e\u5355\u51fb\u201c\u63a5\u53d7\u201d\u3002",
                  "pt-br":
                      "Este site usa cookies que ajudam o site a funcionar e tamb\u00e9m para acompanhar como voc\u00ea interage com nosso site. Mas para fornecermos a melhor experi\u00eancia do usu\u00e1rio, habilitar os cookies espec\u00edficos das Configura\u00e7\u00f5es e clicar em Aceitar.",
              },
              title: {
                  ar: "\u0645\u0648\u0627\u0641\u0642\u0629 \u0645\u0644\u0641 \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637",
                  bg: "\u0421\u044a\u0433\u043b\u0430\u0441\u0438\u0435 \u0441 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438",
                  ca: "Consentiment de cookies",
                  cr: "Suglasnost s kola\u010di\u0107ima",
                  cs: "Souhlas se soubory cookie",
                  de: "Cookie Zustimmung",
                  en: "Cookie consent",
                  fi: "Ev\u00e4steiden suostumus",
                  hu: "Cookie-beleegyez\u00e9s",
                  lt: "Slapuko sutikimas",
                  no: "Cookie Samtykke",
                  pl: "Zgoda na pliki cookie",
                  pt: "Consentimento de cookie",
                  ru: "\u0441\u043e\u0433\u043b\u0430\u0441\u0438\u0435 \u043d\u0430 cookie",
                  sk: "S\u00fahlas s cookies",
                  sl: "Soglasje za pi\u0161kotek",
                  sv: "Samtycke till cookies",
                  tr: "\u00c7erez izni",
                  uk: "\u0417\u0433\u043e\u0434\u0430 \u043d\u0430 \u0444\u0430\u0439\u043b\u0438 cookie",
                  zh: "Cookie\u540c\u610f",
                  "pt-br": "Consentimento do cookie",
              },
              buttons: {
                  accept: {
                      ar: "\u0642\u0628\u0648\u0644 \u0627\u0644\u0643\u0644",
                      bg: "\u043f\u0440\u0438\u0435\u043c\u0430\u043c",
                      ca: "Accepta-ho tot",
                      cr: "Prihvatiti sve",
                      cs: "P\u0159ijmout v\u0161e",
                      de: "Alle akzeptieren",
                      en: "Accept All",
                      fi: "Hyv\u00e4ksy kaikki",
                      hu: "Az \u00f6sszes elfogad\u00e1sa",
                      lt: "Priimti visk\u0105",
                      no: "Aksepter alt",
                      pl: "Akceptuj wszystko",
                      pt: "Aceite tudo",
                      ru: "\u041f\u0440\u0438\u043d\u044f\u0442\u044c \u0432\u0441\u0435",
                      sk: "Prija\u0165 v\u0161etko",
                      sl: "Sprejmi vse",
                      sv: "Acceptera alla",
                      tr: "Accept All",
                      uk: "\u041f\u0440\u0438\u0439\u043d\u044f\u0442\u0438 \u0432\u0441\u0456\u0445",
                      zh: "\u63a5\u53d7\u6240\u6709\u7684",
                      "pt-br": "Aceitar tudo",
                  },
                  reject: {
                      ar: "\u0631\u0641\u0636",
                      bg: "\u041e\u0442\u0445\u0432\u044a\u0440\u043b\u044f\u043d\u0435",
                      ca: "Rebutjar",
                      cr: "Odbiti",
                      cs: "Odm\u00edtnout",
                      de: "Alles ablehnen",
                      en: "Reject All",
                      fi: "Hyl\u00e4t\u00e4",
                      hu: "Elutas\u00edt",
                      lt: "Atmesti",
                      no: "Avvis",
                      pl: "Odrzuca\u0107",
                      pt: "Rejeitar",
                      ru: "\u043e\u0442\u043a\u043b\u043e\u043d\u044f\u0442\u044c",
                      sk: "Odmietnu\u0165",
                      sl: "Zavrne",
                      sv: "Avvisa",
                      tr: "Reddetmek",
                      uk: "\u0412\u0456\u0434\u0445\u0438\u043b\u0438\u0442\u0438",
                      zh: "\u62d2\u7edd",
                      "pt-br": "Rejeitar",
                  },
                  readMore: {
                      ar: "\u0627\u0642\u0631\u0623 \u0623\u0643\u062b\u0631",
                      bg: "\u041f\u0440\u043e\u0447\u0435\u0442\u0435\u0442\u0435 \u043e\u0449\u0435",
                      ca: "Llegeix m\u00e9s",
                      cr: "\u010citaj vi\u0161e",
                      cs: "P\u0159e\u010dt\u011bte si v\u00edce",
                      de: "Weiterlesen",
                      en: "Read More",
                      fi: "Lue lis\u00e4\u00e4",
                      hu: "Olvass tov\u00e1bb",
                      lt: "Skaityti daugiau",
                      no: "Les mer",
                      pl: "Czytaj wi\u0119cej",
                      pt: "consulte Mais informa\u00e7\u00e3o",
                      ru: "\u0427\u0438\u0442\u0430\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435",
                      sk: "\u010c\u00edtaj viac",
                      sl: "Preberite ve\u010d",
                      sv: "L\u00e4s mer",
                      tr: "Daha fazla oku",
                      uk: "\u0427\u0438\u0442\u0430\u0442\u0438 \u0434\u0430\u043b\u0456",
                      zh: "\u9605\u8bfb\u66f4\u591a",
                      "pt-br": "Leia Mais",
                  },
                  settings: {
                      ar: "\u0627\u0644\u062a\u0641\u0636\u064a\u0644\u0627\u062a",
                      bg: "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
                      ca: "Prefer\u00e8ncies",
                      cr: "Postavke",
                      cs: "P\u0159edvolby",
                      de: "Einstellungen",
                      en: "Preferences",
                      fi: "Asetukset",
                      hu: "preferenci\u00e1k",
                      lt: "Nuostatos",
                      no: "Preferanser",
                      pl: "Preferencje",
                      pt: "Prefer\u00eancias",
                      ru: "\u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0442\u0435\u043d\u0438\u044f",
                      sk: "Predvo\u013eby",
                      sl: "Nastavitve",
                      sv: "Inst\u00e4llningar",
                      tr: "Tercihler",
                      uk: "\u041f\u0440\u0435\u0444\u0435\u0440\u0435\u043d\u0446\u0456\u0457",
                      zh: "\u4f18\u5148",
                      "pt-br": "Prefer\u00eancias",
                  },
              },
              auditTable: {
                  type: {
                      ar: "\u0646\u0648\u0639",
                      bg: "\u0422\u0438\u043f",
                      ca: "Tipus",
                      cr: "Tip",
                      cs: "Typ",
                      de: "Art",
                      en: "Type",
                      fi: "Tyyppi",
                      hu: "T\u00edpus",
                      lt: "Tipas",
                      no: "Type",
                      pl: "Typ",
                      pt: "Tipo",
                      ru: "\u0422\u0438\u043f",
                      sk: "Typ",
                      sl: "Vrsta",
                      sv: "Typ",
                      tr: "Type",
                      uk: "\u0422\u0438\u043f",
                      zh: "\u7c7b\u578b",
                      "pt-br": "Tipo",
                  },
                  cookie: {
                      ar: "\u0628\u0633\u0643\u0648\u064a\u062a",
                      bg: "Cookie",
                      ca: "Cookie",
                      cr: "Kola\u010di\u0107",
                      cs: "Cookie",
                      de: "Cookie",
                      en: "Cookie",
                      fi: "Ev\u00e4ste",
                      hu: "Cookie",
                      lt: "Cookie",
                      no: "Cookie",
                      pl: "Plik cookie",
                      pt: "Cookie",
                      ru: "Cookie",
                      sk: "Cookie",
                      sl: "Pi\u0161kotek",
                      sv: "Cookie",
                      tr: "Cookie",
                      uk: "Cookie",
                      zh: "Cookie",
                      "pt-br": "Cookie",
                  },
                  duration: {
                      ar: "\u0627\u0644\u0645\u062f\u0629 \u0627\u0644\u0632\u0645\u0646\u064a\u0629",
                      bg: "\u043f\u0440\u043e\u0434\u044a\u043b\u0436\u0438\u0442\u0435\u043b\u043d\u043e\u0441\u0442",
                      ca: "Durada",
                      cr: "Trajanje",
                      cs: "Doba trv\u00e1n\u00ed",
                      de: "Dauer",
                      en: "Duration",
                      fi: "Kesto",
                      hu: "Id\u0151tartam",
                      lt: "Trukm\u0117",
                      no: "Varighet",
                      pl: "Czas trwania",
                      pt: "Dura\u00e7\u00e3o",
                      ru: "\u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c",
                      sk: "Trvanie",
                      sl: "Trajanje",
                      sv: "Varaktighet",
                      tr: "S\u00fcresi",
                      uk: "\u0422\u0440\u0438\u0432\u0430\u043b\u0456\u0441\u0442\u044c",
                      zh: "\u671f\u95f4",
                      "pt-br": "Dura\u00e7\u00e3o",
                  },
                  description: {
                      ar: "\u0648\u0635\u0641",
                      bg: "\u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
                      ca: "Descripci\u00f3",
                      cr: "Opis",
                      cs: "Popis",
                      de: "Beschreibung",
                      en: "Description",
                      fi: "Kuvaus",
                      hu: "Le\u00edr\u00e1s",
                      lt: "apib\u016bdinimas",
                      no: "Beskrivelse",
                      pl: "Opis",
                      pt: "Descri\u00e7\u00e3o",
                      ru: "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435",
                      sk: "Popis",
                      sl: "Opis",
                      sv: "Beskrivning",
                      tr: "A\u00e7\u0131klama",
                      uk: "\u041e\u043f\u0438\u0441",
                      zh: "\u63cf\u8ff0",
                      "pt-br": "Descri\u00e7\u00e3o",
                  },
              },
              saveButton: {
                  ar: "\u062d\u0641\u0638",
                  bg: "\u0417\u0430\u043f\u0430\u0437\u0438",
                  ca: "Salvar",
                  cr: "U\u0161tedjeti",
                  cs: "Ulo\u017eit",
                  de: "sparen",
                  en: "Save",
                  fi: "Tallentaa",
                  hu: "Megment",
                  lt: "Sutaupyti",
                  no: "Lagre",
                  pl: "Zapisa\u0107",
                  pt: "Salvar",
                  ru: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438 \u044d\u0442\u043e",
                  sk: "Save",
                  sl: "Shranite",
                  sv: "Spara",
                  tr: "Kaydetmek",
                  uk: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438",
                  zh: "\u6551",
                  "pt-br": "Salvar",
              },
              customLogoUrl: null,
              noticeToggler: {
                  ar: "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062e\u0635\u0648\u0635\u064a\u0629",
                  bg: "\u0414\u0435\u0442\u0430\u0439\u043b\u0438 \u0437\u0430 \u043f\u043e\u0432\u0435\u0440\u0438\u0442\u0435\u043b\u043d\u043e\u0441\u0442",
                  ca: "Detalls de privadesa",
                  cr: "Pojedinosti o privatnosti",
                  cs: "Podrobnosti o ochran\u011b osobn\u00edch \u00fadaj\u016f",
                  de: "Cookie-Einstellungen",
                  en: "Cookie Settings",
                  fi: "Yksityisyyden yksityiskohdat",
                  hu: "Adatv\u00e9delmi r\u00e9szletek",
                  lt: "Informacija apie privatum\u0105",
                  no: "Personverndetaljer",
                  pl: "Szczeg\u00f3\u0142y dotycz\u0105ce prywatno\u015bci",
                  pt: "Detalhes de privacidade",
                  ru: "\u0421\u0432\u0435\u0434\u0435\u043d\u0438\u044f \u043e \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438",
                  sk: "Detaily o ochrane osobn\u00fdch \u00fadajov",
                  sl: "Podrobnosti o zasebnosti",
                  sv: "Sekretessinformation",
                  tr: "Gizlilik Ayr\u0131nt\u0131lar\u0131",
                  uk: "\u0414\u0435\u0442\u0430\u043b\u0456 \u043a\u043e\u043d\u0444\u0456\u0434\u0435\u043d\u0446\u0456\u0439\u043d\u043e\u0441\u0442\u0456",
                  zh: "\u9690\u79c1\u8be6\u60c5",
                  "pt-br": "Detalhes de privacidade",
              },
              placeHolderText: {
                  ar: "\u064a\u064f\u0631\u062c\u0649 \u0642\u0628\u0648\u0644 \u0645\u0648\u0627\u0641\u0642\u0629 \u0645\u0644\u0641 \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637",
                  bg:
                      "\u041c\u043e\u043b\u044f, \u043f\u0440\u0438\u0435\u043c\u0435\u0442\u0435 \u0441\u044a\u0433\u043b\u0430\u0441\u0438\u0435\u0442\u043e \u0437\u0430 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u0442\u0435",
                  ca: "Si us plau, accepti el consentiment de la galeta",
                  cr: "Prihvatite pristanak za kola\u010di\u0107e",
                  cs: "P\u0159ijm\u011bte pros\u00edm souhlas se soubory cookie",
                  de: "Bitte akzeptieren Sie die Cookie-Zustimmung",
                  en: "Please accept the cookie consent",
                  fi: "Hyv\u00e4ksy ev\u00e4steen suostumus",
                  hu: "K\u00e9rj\u00fck, fogadja el a cookie-k beleegyez\u00e9s\u00e9t",
                  lt: "Pra\u0161ome sutikti su slapuko sutikimu",
                  no: "Godta samtykke fra informasjonskapsel",
                  pl: "Prosimy o zaakceptowanie zgody na pliki cookie",
                  pt: "Por favor, aceite o consentimento do cookie",
                  ru: "\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u0440\u0438\u043c\u0438\u0442\u0435 \u0441\u043e\u0433\u043b\u0430\u0441\u0438\u0435 cookie",
                  sk: "Prijmite s\u00fahlas so s\u00faborom cookie",
                  sl: "Prosimo, sprejmite soglasje za pi\u0161kotek",
                  sv: "Acceptera cookies samtycke",
                  tr: "L\u00fctfen \u00e7erez onay\u0131n\u0131 kabul edin",
                  uk: "\u041f\u0440\u0438\u0439\u043c\u0456\u0442\u044c \u0437\u0433\u043e\u0434\u0443 \u043d\u0430 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u0430\u043d\u043d\u044f \u0444\u0430\u0439\u043b\u0456\u0432 cookie",
                  zh: "\u8bf7\u63a5\u53d7Cookie\u540c\u610f",
                  "pt-br": "Por favor, aceite o consentimento do cookie",
              },
              privacyPolicyLink: { ar: "#", bg: "#", ca: "#", cr: "#", cs: "#", de: "#", en: "#", fi: "#", hu: "#", lt: "#", no: "#", pl: "#", pt: "#", ru: "#", sk: "#", sl: "#", sv: "#", tr: "#", uk: "#", zh: "#", "pt-br": "#" },
              customAcceptButton: {
                  ar: "\u062d\u0641\u0638 \u0627\u0644\u062a\u0641\u0636\u064a\u0644\u0627\u062a \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u064a",
                  bg: "\u0417\u0430\u043f\u0430\u0437\u0435\u0442\u0435 \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0438\u0442\u0430\u043d\u0438\u044f\u0442\u0430 \u043c\u0438",
                  ca: "Desar les meves prefer\u00e8ncies",
                  cr: "Spremi moje postavke",
                  cs: "Ulo\u017eit moje p\u0159edvolby",
                  de: "Speichern Sie meine Einstellungen",
                  en: "Save my preferences",
                  fi: "Tallenna asetukset",
                  hu: "Mentse el a be\u00e1ll\u00edt\u00e1sokat",
                  lt: "I\u0161saugoti mano nuostatas",
                  no: "Lagre mine preferanser",
                  pl: "Zapisz moje preferencje",
                  pt: "Salvar minhas prefer\u00eancias",
                  ru: "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043c\u043e\u0438 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
                  sk: "Ulo\u017ei\u0165 moje predvo\u013eby",
                  sl: "Shrani moje nastavitve",
                  sv: "Spara mina preferenser",
                  tr: "Tercihlerimi kaydet",
                  uk: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438 \u043c\u043e\u0457 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438",
                  zh: "\u4fdd\u5b58\u6211\u7684\u504f\u597d",
                  "pt-br": "Salve minhas prefer\u00eancias",
              },
          },
      },
      display: { gdpr: { title: false, notice: true, buttons: { accept: true, reject: true, readMore: false, settings: true }, noticeToggler: false } },
      version: "4.0.0",
      position: "bottom",
      template: {
          id: "banner",
          css:
              ".cky-consent-bar-trigger, .cky-consent-bar, .cky-modal, .cky-consent-bar-trigger *, .cky-consent-bar *, .cky-modal * { box-sizing: border-box; } .cky-consent-bar-trigger *:focus, .cky-consent-bar *:focus, .cky-modal *:focus { outline: 0; } .cky-consent-bar-trigger { position: fixed; right: 30px; padding: 2px 5px; font-size: 13px; cursor: pointer; font-family: inherit; animation: slide-up 0.4s ease; z-index: 9997; } .cky-consent-bar { font-family: inherit; position: fixed; z-index: 9997; } .cky-consent-bar .cky-consent-title { font-size: 15px; font-weight: bold; margin-bottom: 3px; } .cky-consent-bar p { line-height: 20px; font-size: 13px; font-weight: normal; margin-bottom: 0; margin-top: 0; } .cky-btn { font-size: 12px; padding: .5rem 1rem; background: none; cursor: pointer; display: inline-block; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; line-height: 1; transition: all .15s ease-in-out; margin: 0; min-height: auto; font-weight: normal; border-radius: 0; } .cky-btn:hover { opacity: .8; } .cky-btn:focus { outline: 0; } .cky-button-wrapper .cky-btn { margin-right: 15px; } .cky-button-wrapper .cky-btn:last-child { margin-right: 0; } .cky-btn.cky-btn-custom-accept { margin: 1.5rem 1rem; font-weight: 600; white-space: initial; word-break: break-word; } .cky-btn-readMore { cursor: pointer; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-btn-doNotSell { cursor: pointer; white-space: nowrap; font-weight: bold; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: flex; align-items: center; } .cky-consent-bar.cky-logo-active .cky-logo { margin-right: 30px; } @media (max-width: 540px) { .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: block; } } .cky-tab { display: -ms-flexbox; display: flex; } .cky-tab-menu { flex: 0 0 25%; max-width: 25%; } @media (max-width: 991px) { .cky-tab-menu { flex: 0 0 40%; max-width: 40%; } } .cky-tab-content { flex: 0 0 75%; max-width: 75%; background: transparent; padding: 15px 20px; } @media (max-width: 991px) { .cky-tab-content { flex: 0 0 60%; max-width: 60%; } } @media (max-width: 767px) { .cky-tab-content { padding: 15px; } } .cky-tab-item { font-size: 11px; cursor: pointer; font-weight: normal; border-bottom: 1px solid; border-right: 1px solid; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.5; } @media (max-width: 767px) { .cky-tab-item { font-size: 11px; padding: .75rem .75rem; } } .cky-tab-item-active { cursor: initial; border-right: 0; } .cky-tab-content .cky-tab-desc, .cky-tab-content .cky-tab-desc p { font-size: 12px; } .cky-tab-title { font-size: 13px; margin-bottom: 11px; margin-top: 0; font-family: inherit; font-weight: bold; line-height: 1; display: flex; align-items: center; } .cky-tab-content .cky-tab-content-item:not(.cky-tab-content-active) { display: none; } .cky-category-direct { display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; padding-top: 15px; margin-top: 15px; border-top: 1px solid #d4d8df; } .cky-category-direct .cky-btn-custom-accept { margin: 0 0 0 auto; } .cky-category-direct-item { display: -ms-flexbox; display: flex; -webkit-box-align: center; -ms-flex-align: center; align-items: center; margin-right: 32px; margin-bottom: 15px; } .cky-category-direct-item:last-child { margin-right: 0; } .cky-category-direct-item .cky-switch { margin-left: 0; } .cky-category-direct-item .cky-category-direct-name { margin-left: 10px; font-size: 12px; font-weight: 600; } .cky-category-direct +.cky-detail-wrapper { margin-top: 10px; } .cky-table-wrapper { width: 100%; max-width: 100%; overflow: auto; } .cky-cookie-audit-table { font-family: inherit; border-collapse: collapse; width: 100%; margin-top: 10px; } .cky-cookie-audit-table th { background-color: #d9dfe7; border: 1px solid #cbced6; } .cky-cookie-audit-table td { border: 1px solid #d5d8df; } .cky-cookie-audit-table th, .cky-cookie-audit-table td { text-align: left; padding: 10px; font-size: 12px; color: #000000; word-break:normal; } .cky-cookie-audit-table tr:nth-child(2n+1) td { background: #f1f5fa; } .cky-cookie-audit-table tr:nth-child(2n) td { background: #ffffff; } .cky-audit-table-element h5 { margin: 25px 0 2px 0; } .cky-audit-table-element .cky-table-wrapper { margin-bottom: 1rem; } .cky-consent-bar.cky-rtl { direction: rtl; text-align: right; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn { margin-right: 0; margin-left: 15px; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn:last-child { margin-left: 0; } .cky-consent-bar.cky-rtl .cky-btn-readMore { margin-left: 0; margin-right: 6px; } .cky-consent-bar.cky-rtl.cky-logo-active .cky-logo { margin-right: 0px; margin-left: 30px; } .cky-switch { position: relative; min-height: 13px; padding-left: 25px; font-size: 14px; margin-left: 20px; margin-bottom: 0; display: inline-block; } .cky-switch input[type='checkbox'] { display: none !important; } .cky-switch .cky-slider { background-color: #e3e1e8; border-radius: 34px; height: 13px; width: 25px; bottom: 0; cursor: pointer; left: 0; position: absolute; right: 0; transition: .4s; } .cky-switch .cky-slider:before { background-color: #fff; border-radius: 50%; bottom: 2px; content: ''; height: 9px; left: 2px; position: absolute; transition: .4s; width: 9px; } .cky-switch input:checked+.cky-slider { background-color: #008631; } .cky-switch input:disabled+.cky-slider { cursor: initial; } .cky-switch input:checked+.cky-slider:before { transform: translateX(12px); } .cky-modal.cky-fade .cky-modal-dialog { transition: -webkit-transform .3s ease-out; transition: transform .3s ease-out; transition: transform .3s ease-out, -webkit-transform .3s ease-out; -webkit-transform: translate(0, -25%); transform: translate(0, -25%); } .cky-modal.cky-show .cky-modal-dialog { -webkit-transform: translate(0, 0); transform: translate(0, 0); } .cky-modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9998; background-color: rgba(10, 10, 10, 0.22); display: none; } .cky-modal-backdrop.cky-fade { opacity: 0; } .cky-modal-backdrop.cky-show { opacity: 1; display: block; } .cky-modal { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999; display: none; overflow: hidden; outline: 0; min-height: calc(100% - (.5rem * 2)); } .cky-modal.cky-show { display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; } .cky-modal a { text-decoration: none; } .cky-modal .cky-modal-dialog { position: relative; max-width: calc(100% - 16px); width: calc(100% - 16px); margin: .5rem; pointer-events: none; font-family: inherit; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; text-align: left; display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); -webkit-box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); } @media (min-width: 576px) { .cky-modal .cky-modal-dialog { max-width: 500px; width: 500px; margin: 1.75rem auto; } .cky-modal { min-height: calc(100% - (1.75rem * 2)); } } @media (min-width: 991px) { .cky-modal .cky-modal-dialog { max-width: 900px; width: 900px; } } .cky-modal-content { display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; width: 100%; pointer-events: auto; background-clip: padding-box; border: 0; border-radius: 4px; overflow: hidden; outline: 0; margin: 40px; } .cky-modal.cky-rtl { direction: rtl; text-align: right; } .ccpa.cky-modal .cky-modal-dialog { max-width: 300px; width: 300px; border-radius: 5px; } .ccpa.cky-modal .cky-modal-content { margin: 25px; text-align: center; font-weight: 600; } .ccpa.cky-modal .cky-opt-out-text { margin-bottom: 20px; } .cky-consent-bar .cky-consent-close, .cky-modal .cky-modal-close { z-index: 1; padding: 0; background-color: transparent; border: 0; -webkit-appearance: none; font-size: 12px; line-height: 1; color: #9a9a9a; cursor: pointer; min-height: auto; position: absolute; top: 14px; right: 18px; } .cky-consent-bar.cky-banner { padding: 15px; width: 100%; box-shadow: 0 -1px 10px 0 rgba(172, 171, 171, 0.3); } .cky-banner .cky-content-wrapper { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; justify-content: space-between; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; } .cky-banner .cky-button-wrapper { margin-left: 20px; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; flex-wrap: nowrap; } .cky-consent-bar.cky-banner.cky-rtl .cky-button-wrapper { margin-left: 0; margin-right: 20px; } @media (max-width: 991px) { .cky-banner .cky-button-wrapper { margin-left: 0; margin-top: 20px; } .cky-consent-bar.cky-banner, .cky-consent-bar.cky-banner p, .cky-banner .cky-button-wrapper, .cky-banner .cky-content-wrapper { display: block; text-align: center; } } .cky-modal .cky-row { margin: 0 -15px; } .cky-modal .cky-close:focus { outline: 0; } .cky-modal.cky-rtl .cky-modal-close { left: 20px; right: 0; } .cky-modal.cky-rtl .cky-tab-item { border-right: none; border-left: 1px solid; } .cky-modal.cky-rtl .cky-tab-item.cky-tab-item-active { border-left: 0; } .cky-modal.cky-rtl .cky-switch { margin-left: 0; margin-right: 20px; } .cky-modal.cky-rtl .cky-modal-dialog { text-align: right; } .cky-fade { transition: opacity .15s linear; } .cky-tab { overflow: hidden; } .cky-tab-menu { text-align: center; } .cky-tab-content .cky-tab-content-item { width: 100%; } .cky-tab-item { padding: .5rem 2rem; text-align: left; } .cky-tab-content .cky-tab-desc { width: 100%; min-height: 225px; max-height: 300px; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } @media (max-width: 767px) { .cky-tab-content .cky-tab-desc { max-height: 225px; } } @media(max-width:475px) { .cky-modal-content { margin: 30px; } .cky-btn-custom-accept { margin: 1rem 0.2rem; padding: 0.5rem 0.3rem; } }",
          detailType: "popup",
      },
      tldomain: "jithinmozilor.github.io",
      behaviour: { reload: false, showLogo: true, acceptOnScroll: false, defaultConsent: false, showAuditTable: true, selectedLanguage: "en" },
      customCss: "",
      geoTarget: { gdpr: { eu: false } },
      consentType: "explicit",
      selectedLaws: ["gdpr"],
      consentBarType: "banner",
      showCategoryDirectly: false,
  },
  info: {
      categories: [
          {
              id: 23748,
              slug: "necessary",
              order: 1,
              name: {
                  en: "Necessary",
                  de: "Notwendige",
                  bg: "\u041d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e",
                  ar: "\u0636\u0631\u0648\u0631\u064a",
                  ru: "\u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e",
                  pt: "Necess\u00e1rio",
                  ca: "Necessari",
                  hu: "Sz\u00fcks\u00e9ges",
                  pl: "niezb\u0119dne",
                  cr: "Potrebno",
                  sv: "N\u00f6dv\u00e4ndig",
                  zh: "\u5fc5\u8981\u7684",
                  uk: "\u041d\u0435\u043e\u0431\u0445\u0456\u0434\u043d\u043e",
                  sk: "Nevyhnutn\u00e9",
                  tr: "Gerekli",
                  lt: "B\u016btinas",
                  cs: "Nezbytn\u00e9",
                  fi: "V\u00e4ltt\u00e4m\u00e4t\u00f6n",
                  no: "N\u00f8dvendig",
                  "pt-br": "Necess\u00e1rio",
                  sl: "Potrebno",
              },
              defaultConsent: 1,
              active: 1,
              settings: { ccpa: { doNotSell: false } },
              type: 1,
              description: {
                  en: "<p>Necessary cookies are crucial for the basic functions of the website and the website will not work in its intended way without them.</p> <p>These cookies do not store any personally identifiable data.</p>",
                  de:
                      "<p>Notwendige Cookies sind f\u00fcr die Grundfunktionen der Website von entscheidender Bedeutung. Ohne sie kann die Website nicht in der vorgesehenen Weise funktionieren.</p><p>Diese Cookies speichern keine personenbezogenen Daten.</p>",
                  bg:
                      "<p>\u041d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0438\u0442\u0435 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u0441\u0430 \u043e\u0442 \u0440\u0435\u0448\u0430\u0432\u0430\u0449\u043e \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0437\u0430 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u0442\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043d\u0430 \u0441\u0430\u0439\u0442\u0430 \u0438 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u044a\u0442 \u043d\u044f\u043c\u0430 \u0434\u0430 \u0440\u0430\u0431\u043e\u0442\u0438 \u043f\u043e \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0431\u0435\u0437 \u0442\u044f\u0445.</p><p>\u0422\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u043d\u0435 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u0442 \u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438.</p>",
                  ar:
                      "<p>\u062a\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0636\u0631\u0648\u0631\u064a\u0629 \u0636\u0631\u0648\u0631\u064a\u0629 \u0644\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0644\u0646 \u064a\u0639\u0645\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0627\u0644\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0645\u0642\u0635\u0648\u062f\u0629 \u0628\u062f\u0648\u0646\u0647\u0627.</p> <p>\u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0644\u0627 \u062a\u062e\u0632\u0646 \u0623\u064a \u0628\u064a\u0627\u0646\u0627\u062a \u0634\u062e\u0635\u064a\u0629.</p>",
                  ru:
                      "<p>\u041d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u044b\u0435 \u0444\u0430\u0439\u043b\u044b cookie \u044f\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u043e\u0441\u043d\u043e\u0432\u043d\u044b\u043c\u0438 \u0444\u0443\u043d\u043a\u0446\u0438\u044f\u043c\u0438 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0430, \u0438 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u043f\u043e \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044e.</p> <p>\u042d\u0442\u0438 \u043a\u0443\u043a\u0438 \u043d\u0435 \u0445\u0440\u0430\u043d\u044f\u0442 \u043a\u0430\u043a\u0438\u0435-\u043b\u0438\u0431\u043e \u043b\u0438\u0447\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435.</p>",
                  pt:
                      "<p>Os cookies necess\u00e1rios s\u00e3o cruciais para as fun\u00e7\u00f5es b\u00e1sicas do site e o site n\u00e3o funcionar\u00e1 da maneira pretendida sem eles.</p> <p>Esses cookies n\u00e3o armazenam nenhum dado de identifica\u00e7\u00e3o pessoal.</p>",
                  ca:
                      "<p>Les cookies necess\u00e0ries s\u00f3n crucials per a les funcions b\u00e0siques del lloc web i el lloc web no funcionar\u00e0 de la manera prevista sense elles.</p> <p>Aquestes cookies no emmagatzemen cap dada d\u2019identificaci\u00f3 personal.</p>",
                  hu:
                      "<p>A sz\u00fcks\u00e9ges s\u00fctik d\u00f6nt\u0151 fontoss\u00e1g\u00faak a weboldal alapvet\u0151 funkci\u00f3i szempontj\u00e1b\u00f3l, \u00e9s a weboldal ezek n\u00e9lk\u00fcl nem fog megfelel\u0151en m\u0171k\u00f6dni.</p> <p>Ezek a s\u00fctik nem t\u00e1rolnak szem\u00e9lyazonos\u00edt\u00e1sra alkalmas adatokat.</p>",
                  pl:
                      "<p> Niezb\u0119dne pliki cookie maj\u0105 kluczowe znaczenie dla podstawowych funkcji witryny i witryna nie b\u0119dzie dzia\u0142a\u0107 w zamierzony spos\u00f3b bez nich. </p> <p> Te pliki cookie nie przechowuj\u0105 \u017cadnych danych umo\u017cliwiaj\u0105cych identyfikacj\u0119 osoby. </p>",
                  cr:
                      "<p>Potrebni kola\u010di\u0107i presudni su za osnovne funkcije web stranice i web stranica bez njih ne\u0107e raditi na predvi\u0111eni na\u010din.</p> <p>Ovi kola\u010di\u0107i ne pohranjuju nikakve osobne podatke.</p>",
                  sv:
                      "<p>N\u00f6dv\u00e4ndiga cookies \u00e4r avg\u00f6rande f\u00f6r webbplatsens grundl\u00e4ggande funktioner och webbplatsen fungerar inte p\u00e5 det avsedda s\u00e4ttet utan dem.</p> <p>Dessa cookies lagrar inga personligt identifierbara uppgifter.</p>",
                  zh:
                      "<p>\u5fc5\u8981\u7684cookie\u5bf9\u4e8e\u7f51\u7ad9\u7684\u57fa\u672c\u529f\u80fd\u81f3\u5173\u91cd\u8981\uff0c\u6ca1\u6709\u5b83\u4eec\uff0c\u7f51\u7ad9\u5c06\u65e0\u6cd5\u6b63\u5e38\u5de5\u4f5c\u3002</ p> <p>\u8fd9\u4e9bcookie\u4e0d\u4f1a\u5b58\u50a8\u4efb\u4f55\u4e2a\u4eba\u8eab\u4efd\u6570\u636e\u3002</p>",
                  uk:
                      "<p>\u041d\u0435\u043e\u0431\u0445\u0456\u0434\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u043c\u0430\u044e\u0442\u044c \u0432\u0438\u0440\u0456\u0448\u0430\u043b\u044c\u043d\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u043d\u044f \u0434\u043b\u044f \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u0445 \u0444\u0443\u043d\u043a\u0446\u0456\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443, \u0456 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u0431\u0435\u0437 \u043d\u0438\u0445 \u043d\u0435 \u043f\u0440\u0430\u0446\u044e\u0432\u0430\u0442\u0438\u043c\u0435 \u043d\u0430\u043b\u0435\u0436\u043d\u0438\u043c \u0447\u0438\u043d\u043e\u043c. </p> <p> \u0426\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u043d\u0435 \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u044e\u0442\u044c \u0436\u043e\u0434\u043d\u0438\u0445 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u0438\u0445 \u0434\u0430\u043d\u0438\u0445.</p>",
                  sk:
                      "<p>Potrebn\u00e9 s\u00fabory cookie s\u00fa pre z\u00e1kladn\u00e9 funkcie webov\u00fdch str\u00e1nok z\u00e1sadn\u00e9 a webov\u00e9 str\u00e1nky bez nich nebud\u00fa fungova\u0165 zam\u00fd\u0161\u013ean\u00fdm sp\u00f4sobom. </p> <p> Tieto s\u00fabory cookie neukladaj\u00fa \u017eiadne osobn\u00e9 identifika\u010dn\u00e9 \u00fadaje.</p>",
                  tr:
                      "<p>Gerekli \u00e7erezler, web sitesinin temel i\u015flevleri i\u00e7in \u00e7ok \u00f6nemlidir ve web sitesi bunlar olmadan ama\u00e7land\u0131\u011f\u0131 \u015fekilde \u00e7al\u0131\u015fmayacakt\u0131r. </p> <p> Bu \u00e7erezler ki\u015fisel olarak tan\u0131mlanabilecek herhangi bir veriyi saklamaz.</p>",
                  lt:
                      "<p>B\u016btini slapukai yra labai svarb\u016bs pagrindin\u0117ms svetain\u0117s funkcijoms atlikti, o svetain\u0117 be j\u0173 neveiks numatytu b\u016bdu.</p> <p>\u0160ie slapukai nesaugo asmens identifikavimo duomen\u0173.</p>",
                  cs:
                      "<p>Nezbytn\u00e9 soubory cookie jsou z\u00e1sadn\u00ed pro z\u00e1kladn\u00ed funkce webu a web bez nich nebude fungovat zam\u00fd\u0161len\u00fdm zp\u016fsobem. </p> <p> Tyto soubory cookie neukl\u00e1daj\u00ed \u017e\u00e1dn\u00e1 osobn\u00ed identifika\u010dn\u00ed data.</p>",
                  fi:
                      "<p>Tarvittavat ev\u00e4steet ovat ratkaisevan t\u00e4rkeit\u00e4 verkkosivuston perustoiminnoille, eik\u00e4 verkkosivusto toimi tarkoitetulla tavalla ilman niit\u00e4.</p> <p>N\u00e4m\u00e4 ev\u00e4steet eiv\u00e4t tallenna henkil\u00f6kohtaisia tietoja.</p>",
                  no:
                      "<p>N\u00f8dvendige cookies er avgj\u00f8rende for grunnleggende funksjoner p\u00e5 nettstedet, og nettstedet fungerer ikke p\u00e5 den tiltenkte m\u00e5ten uten dem. </p> <p> Disse cookies lagrer ikke personlig identifiserbare data.</p>",
                  "pt-br":
                      "<p>Os cookies necess\u00e1rios s\u00e3o cruciais para as fun\u00e7\u00f5es b\u00e1sicas do site e o site n\u00e3o funcionar\u00e1 como pretendido sem eles.</p> <p>Esses cookies n\u00e3o armazenam nenhum dado pessoalmente identific\u00e1vel.</p>",
                  sl:
                      "<p>Potrebni pi\u0161kotki so klju\u010dni za osnovne funkcije spletne strani in spletna stran brez njih ne bo delovala na svoj predviden na\u010din.</p> <p>Ti pi\u0161kotki ne shranjujejo nobenih osebnih podatkov, ki bi jih bilo mogo\u010de identificirati.</p>",
              },
              scripts: [
                  {
                      id: 20443,
                      name: { en: "Necessary", de: "Necessary", fr: "Necessary", it: "Necessary", es: "Necessary", nl: "Necessary", bg: "Necessary", ar: "Necessary" },
                      description: {
                          en: "Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                          de: "Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                          fr: "Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                          it: "Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                          es: "Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                          nl: "Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                          bg: "Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                          ar: "Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
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
                      id: 51941,
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
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 51942,
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
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 51943,
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
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 51944,
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
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 51945,
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
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 51946,
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
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 51947,
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
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 60802,
                      cookie_id: "__cfduid",
                      description: {
                          en:
                              "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
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
                          ar:
                              "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                      },
                      duration: "1 years  30 days",
                      type: "https",
                      domain: ".cdn-cookieyes.com",
                  },
                  {
                      id: 82027,
                      cookie_id: "cookielawinfo-checkbox-necessary",
                      description: {
                          en: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                          de: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                          fr: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                          it: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                          es: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                          nl: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                          bg: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                          ar: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                      },
                      duration: "1 years  20 days  1 hours  16 minutes",
                      type: "https",
                      domain: "wordpress-178723-1219816.cloudwaysapps.com",
                  },
                  {
                      id: 82028,
                      cookie_id: "cookielawinfo-checkbox-non-necessary",
                      description: {
                          en: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                          de: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                          fr: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                          it: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                          es: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                          nl: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                          bg: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                          ar: "This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                      },
                      duration: "1 years  20 days  1 hours  16 minutes",
                      type: "https",
                      domain: "wordpress-178723-1219816.cloudwaysapps.com",
                  },
                  {
                      id: 88152,
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
                      domain: "wordpress-178723-1219816.cloudwaysapps.com",
                  },
                  {
                      id: 399927,
                      cookie_id: "cookieyes-other",
                      description: {
                          en: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          de: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          fr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          it: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          es: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          nl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          bg: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          da: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          ru: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          ar: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          pl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          pt: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          ca: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          hu: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          sv: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          cr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          zh: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          uk: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          sk: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          tr: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          lt: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          cs: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          fi: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          no: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          "pt-br": "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                          sl: "This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies categorized as 'Other'.",
                      },
                      duration: "1 year",
                      type: "https",
                      domain: ".jithinmozilor.github.io",
                  },
              ],
          },
          {
              id: 214831,
              slug: "test",
              order: 1,
              name: {
                  en: "Test",
                  de: "Test",
                  bg: "Test",
                  ru: "Test",
                  ar: "Test",
                  pl: "Test",
                  pt: "Test",
                  ca: "Test",
                  hu: "Test",
                  sv: "Test",
                  cr: "Test",
                  zh: "Test",
                  uk: "Test",
                  sk: "Test",
                  tr: "Test",
                  lt: "Test",
                  cs: "Test",
                  fi: "Test",
                  no: "Test",
                  "pt-br": "Test",
                  sl: "Test",
              },
              defaultConsent: 0,
              active: 1,
              settings: { ccpa: { doNotSell: false } },
              type: 2,
              description: {
                  en: "test category",
                  de: "test category",
                  bg: "test category",
                  ru: "test category",
                  ar: "test category",
                  pl: "test category",
                  pt: "test category",
                  ca: "test category",
                  hu: "test category",
                  sv: "test category",
                  cr: "test category",
                  zh: "test category",
                  uk: "test category",
                  sk: "test category",
                  tr: "test category",
                  lt: "test category",
                  cs: "test category",
                  fi: "test category",
                  no: "test category",
                  "pt-br": "test category",
                  sl: "test category",
              },
              cookies: [{ id: 399931, cookie_id: "_gat", description: { en: "Cookie", de: "Cookie" }, duration: "365", type: "http", domain: "https://jithinmozilor.github.io/" }],
          },
          {
              id: 221567,
              slug: "new-1",
              order: 1,
              name: {
                  en: "new-1",
                  de: "new-1",
                  bg: "new-1",
                  ru: "new-1",
                  ar: "new-1",
                  pl: "new-1",
                  pt: "new-1",
                  ca: "new-1",
                  hu: "new-1",
                  sv: "new-1",
                  cr: "new-1",
                  zh: "new-1",
                  uk: "new-1",
                  sk: "new-1",
                  tr: "new-1",
                  lt: "new-1",
                  cs: "new-1",
                  fi: "new-1",
                  no: "new-1",
                  "pt-br": "new-1",
                  sl: "new-1",
              },
              defaultConsent: 1,
              active: 1,
              settings: { ccpa: { doNotSell: false } },
              type: 2,
              description: {
                  en: "sdsd",
                  de: "sdsd",
                  bg: "sdsd",
                  ru: "sdsd",
                  ar: "sdsd",
                  pl: "sdsd",
                  pt: "sdsd",
                  ca: "sdsd",
                  hu: "sdsd",
                  sv: "sdsd",
                  cr: "sdsd",
                  zh: "sdsd",
                  uk: "sdsd",
                  sk: "sdsd",
                  tr: "sdsd",
                  lt: "sdsd",
                  cs: "sdsd",
                  fi: "sdsd",
                  no: "sdsd",
                  "pt-br": "sdsd",
                  sl: "sdsd",
              },
          },
          {
              id: 23749,
              slug: "functional",
              order: 2,
              name: {
                  en: "Functional",
                  de: "Funktionale",
                  bg: "\u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u0435\u043d",
                  ar: "\u0648\u0638\u064a\u0641\u064a",
                  ru: "\u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f",
                  pt: "Funcional",
                  ca: "Funcional",
                  hu: "Funkcion\u00e1lis",
                  pl: "Funkcjonalny",
                  cr: "Funcional",
                  sv: "Funktionell",
                  zh: "\u529f\u80fd\u6027",
                  uk: "\u0424\u0443\u043d\u043a\u0446\u0456\u043e\u043d\u0430\u043b\u044c\u043d\u0438\u0439",
                  sk: "Funk\u010dn\u00e9",
                  tr: "\u0130\u015flevsel",
                  lt: "Funkcinis",
                  cs: "Funk\u010dn\u00ed",
                  fi: "Toimiva",
                  no: "Funksjonell",
                  "pt-br": "Funcional",
                  sl: "Funkcionalno",
              },
              defaultConsent: 0,
              active: 1,
              settings: { ccpa: { doNotSell: false } },
              type: 2,
              description: {
                  en: "<p>Functional cookies help to perform certain functionalities like sharing the content of the website on social media platforms, collect feedbacks, and other third-party features.</p>",
                  de:
                      "<p>Funktionale Cookies unterst\u00fctzen bei der Ausf\u00fchrung bestimmter Funktionen, z. B. beim Teilen des Inhalts der Website auf Social Media-Plattformen, beim Sammeln von Feedbacks und anderen Funktionen von Drittanbietern.</p>",
                  bg:
                      "<p>\u0424\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u043d\u0438\u0442\u0435 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u043f\u043e\u043c\u0430\u0433\u0430\u0442 \u0437\u0430 \u0438\u0437\u043f\u044a\u043b\u043d\u0435\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043a\u0430\u0442\u043e \u0441\u043f\u043e\u0434\u0435\u043b\u044f\u043d\u0435 \u043d\u0430 \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u043d\u0438\u0435\u0442\u043e \u043d\u0430 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u0430 \u0432 \u0441\u043e\u0446\u0438\u0430\u043b\u043d\u0438\u0442\u0435 \u043c\u0435\u0434\u0438\u0439\u043d\u0438 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0438, \u0441\u044a\u0431\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u043e\u0431\u0440\u0430\u0442\u043d\u0438 \u0432\u0440\u044a\u0437\u043a\u0438 \u0438 \u0434\u0440\u0443\u0433\u0438 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043d\u0430 \u0442\u0440\u0435\u0442\u0438 \u0441\u0442\u0440\u0430\u043d\u0438.</p>",
                  ar:
                      "<p>\u062a\u0633\u0627\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629 \u0639\u0644\u0649 \u0623\u062f\u0627\u0621 \u0648\u0638\u0627\u0626\u0641 \u0645\u0639\u064a\u0646\u0629 \u0645\u062b\u0644 \u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0645\u0646\u0635\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a \u060c \u0648\u062c\u0645\u0639 \u0627\u0644\u062a\u0639\u0644\u064a\u0642\u0627\u062a \u060c \u0648\u063a\u064a\u0631\u0647\u0627 \u0645\u0646 \u0645\u064a\u0632\u0627\u062a \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062b\u0627\u0644\u062b.</p>",
                  ru:
                      "<p>\u041f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b \u0441\u043e\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0445 \u0441\u0435\u0442\u0435\u0439, \u043e\u0442\u0437\u044b\u0432\u044b \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u043e\u043d\u0435\u0440\u043e\u0432 \u0438 \u0434\u0440\u0443\u0433\u0438\u0435 \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0438\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043d\u0430 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0435 \u0441\u043e\u0432\u043c\u0435\u0441\u0442\u043d\u043e \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442 \u043d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u0434\u043b\u044f \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0438 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0445 \u0444\u0430\u0439\u043b\u043e\u0432 cookie.</p>",
                  pt: "<p>Os cookies funcionais ajudam a realizar certas funcionalidades, como compartilhar o conte\u00fado do site em plataformas de m\u00eddia social, coletar feedbacks e outros recursos de terceiros.</p>",
                  ca: "<p>Les cookies funcionals ajuden a realitzar determinades funcionalitats com compartir el contingut del lloc web a les plataformes de xarxes socials, recopilar comentaris i altres funcions de tercers.</p>",
                  hu:
                      "<p>A funkcion\u00e1lis s\u00fctik seg\u00edtenek bizonyos funkci\u00f3k v\u00e9grehajt\u00e1s\u00e1ban, p\u00e9ld\u00e1ul a weboldal tartalm\u00e1nak megoszt\u00e1s\u00e1ban a k\u00f6z\u00f6ss\u00e9gi m\u00e9dia platformokon, visszajelz\u00e9sek gy\u0171jt\u00e9s\u00e9ben \u00e9s m\u00e1s, harmadik f\u00e9lt\u0151l sz\u00e1rmaz\u00f3 funkci\u00f3kban.</p>",
                  pl:
                      "<p> Funkcjonalne pliki cookie pomagaj\u0105 wykonywa\u0107 pewne funkcje, takie jak udost\u0119pnianie zawarto\u015bci witryny na platformach medi\u00f3w spo\u0142eczno\u015bciowych, zbieranie informacji zwrotnych i inne funkcje stron trzecich. </p>",
                  cr:
                      "<p>Funkcionalni kola\u010di\u0107i poma\u017eu u izvo\u0111enju odre\u0111enih funkcionalnosti poput dijeljenja sadr\u017eaja web mjesta na platformama dru\u0161tvenih medija, prikupljanja povratnih informacija i ostalih zna\u010dajki tre\u0107ih strana.</p>",
                  sv: "<p>Funktionella cookies hj\u00e4lper till att utf\u00f6ra vissa funktioner som att dela inneh\u00e5llet p\u00e5 webbplatsen p\u00e5 sociala medieplattformar, samla in feedback och andra tredjepartsfunktioner.</p>",
                  zh:
                      "<p>\u529f\u80fdcookie\u6709\u52a9\u4e8e\u6267\u884c\u67d0\u4e9b\u529f\u80fd\uff0c\u4f8b\u5982\u5728\u793e\u4ea4\u5a92\u4f53\u5e73\u53f0\u4e0a\u5171\u4eab\u7f51\u7ad9\u7684\u5185\u5bb9\uff0c\u6536\u96c6\u53cd\u9988\u548c\u5176\u4ed6\u7b2c\u4e09\u65b9\u529f\u80fd\u3002</p>",
                  uk:
                      "<p>\u0424\u0443\u043d\u043a\u0446\u0456\u043e\u043d\u0430\u043b\u044c\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0434\u043e\u043f\u043e\u043c\u0430\u0433\u0430\u044e\u0442\u044c \u0432\u0438\u043a\u043e\u043d\u0443\u0432\u0430\u0442\u0438 \u043f\u0435\u0432\u043d\u0456 \u0444\u0443\u043d\u043a\u0446\u0456\u043e\u043d\u0430\u043b\u044c\u043d\u0456 \u043c\u043e\u0436\u043b\u0438\u0432\u043e\u0441\u0442\u0456, \u0442\u0430\u043a\u0456 \u044f\u043a \u043e\u0431\u043c\u0456\u043d \u0432\u043c\u0456\u0441\u0442\u043e\u043c \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443 \u043d\u0430 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430\u0445 \u0441\u043e\u0446\u0456\u0430\u043b\u044c\u043d\u0438\u0445 \u043c\u0435\u0434\u0456\u0430, \u0437\u0431\u0456\u0440 \u0432\u0456\u0434\u0433\u0443\u043a\u0456\u0432 \u0442\u0430 \u0456\u043d\u0448\u0456 \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0456 \u0444\u0443\u043d\u043a\u0446\u0456\u0457.</p>",
                  sk:
                      "<p>Funk\u010dn\u00e9 s\u00fabory cookie pom\u00e1haj\u00fa vykon\u00e1va\u0165 ur\u010dit\u00e9 funkcie, ako je zdie\u013eanie obsahu webov\u00fdch str\u00e1nok na platform\u00e1ch soci\u00e1lnych m\u00e9di\u00ed, zhroma\u017e\u010fovanie sp\u00e4tn\u00fdch v\u00e4zieb a \u010fal\u0161ie funkcie tret\u00edch str\u00e1n.</p>",
                  tr:
                      "<p>\u0130\u015flevsel \u00e7erezler, web sitesinin i\u00e7eri\u011fini sosyal medya platformlar\u0131nda payla\u015fmak, geri bildirim toplamak ve di\u011fer \u00fc\u00e7\u00fcnc\u00fc taraf \u00f6zellikleri gibi belirli i\u015flevlerin ger\u00e7ekle\u015ftirilmesine yard\u0131mc\u0131 olur.</p>",
                  lt:
                      "<p>Funkciniai cookies padeda atlikti tam tikras funkcijas, pavyzd\u017eiui, dalytis svetain\u0117s turiniu socialin\u0117s \u017einiasklaidos platformose, rinkti atsiliepimus ir kitas tre\u010di\u0173j\u0173 \u0161ali\u0173 funkcijas.</p>",
                  cs:
                      "<p>Funk\u010dn\u00ed soubory cookie pom\u00e1haj\u00ed prov\u00e1d\u011bt ur\u010dit\u00e9 funkce, jako je sd\u00edlen\u00ed obsahu webov\u00fdch str\u00e1nek na platform\u00e1ch soci\u00e1ln\u00edch m\u00e9di\u00ed, shroma\u017e\u010fov\u00e1n\u00ed zp\u011btn\u00fdch vazeb a dal\u0161\u00ed funkce t\u0159et\u00edch stran.</p>",
                  fi:
                      "<p>Toiminnalliset ev\u00e4steet auttavat suorittamaan tiettyj\u00e4 toimintoja, kuten verkkosivuston sis\u00e4ll\u00f6n jakamista sosiaalisen median alustoilla, palautteiden ker\u00e4\u00e4mist\u00e4 ja muita kolmannen osapuolen ominaisuuksia.</p>",
                  no: "<p>Funksjonelle cookies hjelper deg med \u00e5 utf\u00f8re visse funksjoner som \u00e5 dele innholdet p\u00e5 nettstedet p\u00e5 sosiale medieplattformer, samle tilbakemeldinger og andre tredjepartsfunksjoner.</p>",
                  "pt-br": "<p>Cookies funcionais ajudam a executar certas funcionalidades, como compartilhar o conte\u00fado do site em plataformas de m\u00eddia social, coletar feedbacks e outros recursos de terceiros.</p>",
                  sl:
                      "<p>Funkcionalni pi\u0161kotki pomagajo izvajati dolo\u010dene funkcionalnosti, kot so skupna raba vsebine spletnega mesta na platformah dru\u017ebenih medijev, zbiranje povratnih informacij in druge funkcije tretjih oseb.</p>",
              },
              cookies: [{ id: 80739, cookie_id: "1", description: { en: "this is analytics cookie", es: "this is analytics cookie" }, duration: "1", type: "http", domain: "https://wordpress-178723-1219816.cloudwaysapps.com/" }],
          },
          {
              id: 23750,
              slug: "analytics",
              order: 3,
              name: {
                  en: "Analytics",
                  de: "Analyse",
                  bg: "\u0430\u043d\u0430\u043b\u0438\u0437",
                  ar: "\u062a\u062d\u0644\u064a\u0644\u0627\u062a",
                  ru: "\u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430",
                  pt: "Analytics",
                  ca: "Anal\u00edtica",
                  hu: "Analitika",
                  pl: "Analityka",
                  cr: "Analitika",
                  sv: "Analytics",
                  zh: "\u5206\u6790\u5de5\u5177",
                  uk: "\u0410\u043d\u0430\u043b\u0456\u0442\u0438\u043a\u0430",
                  sk: "Analytika",
                  tr: "Analitik",
                  lt: "Analytics",
                  cs: "Analytics",
                  fi: "Analytics",
                  no: "Analytics",
                  "pt-br": "Anal\u00edticos",
                  sl: "Analytics",
              },
              defaultConsent: 0,
              active: 1,
              settings: { ccpa: { doNotSell: false }, loadAnalyticsByDefault: true },
              type: 2,
              description: {
                  en: "<p>Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.</p>",
                  de: "<p>Analyse-Cookies werden verwendet um zu verstehen, wie Besucher mit der Website interagieren. Diese Cookies dienen zu Aussagen \u00fcber die Anzahl der Besucher, Absprungrate, Herkunft der Besucher usw.</p>",
                  bg:
                      "<p>\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u0447\u043d\u0438\u0442\u0435 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442, \u0437\u0430 \u0434\u0430 \u0441\u0435 \u0440\u0430\u0437\u0431\u0435\u0440\u0435 \u043a\u0430\u043a \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438\u0442\u0435 \u0432\u0437\u0430\u0438\u043c\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0430\u0442 \u0441 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u0430. \u0422\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u043f\u043e\u043c\u0430\u0433\u0430\u0442 \u0437\u0430 \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u044f\u043d\u0435\u0442\u043e \u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f \u0437\u0430 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438\u0442\u0435 \u0437\u0430 \u0431\u0440\u043e\u044f \u043d\u0430 \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438\u0442\u0435, \u0441\u0442\u0435\u043f\u0435\u043d\u0442\u0430 \u043d\u0430 \u043e\u0442\u043f\u0430\u0434\u0430\u043d\u0435, \u0438\u0437\u0442\u043e\u0447\u043d\u0438\u043a\u0430 \u043d\u0430 \u0442\u0440\u0430\u0444\u0438\u043a\u0430 \u0438 \u0434\u0440.</p>",
                  ar:
                      "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u064a\u0629 \u0644\u0641\u0647\u0645 \u0643\u064a\u0641\u064a\u0629 \u062a\u0641\u0627\u0639\u0644 \u0627\u0644\u0632\u0648\u0627\u0631 \u0645\u0639 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628. \u062a\u0633\u0627\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0641\u064a \u062a\u0648\u0641\u064a\u0631 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0646 \u0627\u0644\u0645\u0642\u0627\u064a\u064a\u0633 \u0648\u0639\u062f\u062f \u0627\u0644\u0632\u0648\u0627\u0631 \u0648\u0645\u0639\u062f\u0644 \u0627\u0644\u0627\u0631\u062a\u062f\u0627\u062f \u0648\u0645\u0635\u062f\u0631 \u0627\u0644\u062d\u0631\u0643\u0629 \u0648\u0645\u0627 \u0625\u0644\u0649 \u0630\u0644\u0643.</p>",
                  ru:
                      "<p>\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u043a\u0443\u043a\u0438 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442\u0441\u044f, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043d\u044f\u0442\u044c, \u043a\u0430\u043a \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438 \u0432\u0437\u0430\u0438\u043c\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044e\u0442 \u0441 \u0441\u0430\u0439\u0442\u043e\u043c. \u042d\u0442\u0438 \u0444\u0430\u0439\u043b\u044b cookie \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u044e\u0442 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044e \u043e \u0442\u0430\u043a\u0438\u0445 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044f\u0445, \u043a\u0430\u043a \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0435\u0439, \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c \u043e\u0442\u043a\u0430\u0437\u043e\u0432, \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a \u0442\u0440\u0430\u0444\u0438\u043a\u0430 \u0438 \u0442. \u0414.</p>",
                  pt:
                      "<p>Cookies anal\u00edticos s\u00e3o usados para entender como os visitantes interagem com o site. Esses cookies ajudam a fornecer informa\u00e7\u00f5es sobre as m\u00e9tricas do n\u00famero de visitantes, taxa de rejei\u00e7\u00e3o, origem do tr\u00e1fego, etc.</p>",
                  ca:
                      "<p>Les cookies anal\u00edtiques s\u2019utilitzen per entendre com interactuen els visitants amb el lloc web. Aquestes cookies ajuden a proporcionar informaci\u00f3 sobre m\u00e8triques, el nombre de visitants, el percentatge de rebots, la font de tr\u00e0nsit, etc.</p>",
                  hu:
                      "<p>Analitikai s\u00fctiket haszn\u00e1lnak annak meg\u00e9rt\u00e9s\u00e9re, hogy a l\u00e1togat\u00f3k hogyan l\u00e9pnek kapcsolatba a weboldallal. Ezek a cookie-k seg\u00edts\u00e9get ny\u00fajtanak a l\u00e1togat\u00f3k sz\u00e1m\u00e1r\u00f3l, a visszafordul\u00e1si ar\u00e1nyr\u00f3l, a forgalmi forr\u00e1sr\u00f3l stb.</p>",
                  pl:
                      "<p> Analityczne pliki cookie s\u0142u\u017c\u0105 do zrozumienia, w jaki spos\u00f3b u\u017cytkownicy wchodz\u0105 w interakcj\u0119 z witryn\u0105. Te pliki cookie pomagaj\u0105 dostarcza\u0107 informacje o metrykach liczby odwiedzaj\u0105cych, wsp\u00f3\u0142czynniku odrzuce\u0144, \u017ar\u00f3dle ruchu itp. </p> ",
                  cr:
                      "<p>Analiti\u010dki kola\u010di\u0107i koriste se za razumijevanje na\u010dina na koji posjetitelji komuniciraju s web stranicom. Ovi kola\u010di\u0107i poma\u017eu u pru\u017eanju podataka o metri\u010dkim podacima o broju posjetitelja, stopi napu\u0161tanja po\u010detne stranice, izvoru prometa itd.</p>",
                  sv:
                      "<p>Analytiska cookies anv\u00e4nds f\u00f6r att f\u00f6rst\u00e5 hur bes\u00f6kare interagerar med webbplatsen. Dessa cookies hj\u00e4lper till att ge information om m\u00e4tv\u00e4rden, antal bes\u00f6kare, avvisningsfrekvens, trafikk\u00e4lla etc.</p>",
                  zh:
                      "<p>\u5206\u6790\u6027Cookie\u7528\u4e8e\u4e86\u89e3\u8bbf\u95ee\u8005\u5982\u4f55\u4e0e\u7f51\u7ad9\u4e92\u52a8\u3002 \u8fd9\u4e9bCookie\u6709\u52a9\u4e8e\u63d0\u4f9b\u6709\u5173\u8bbf\u95ee\u8005\u6570\u91cf\uff0c\u8df3\u51fa\u7387\uff0c\u6d41\u91cf\u6765\u6e90\u7b49\u6307\u6807\u7684\u4fe1\u606f\u3002</p>",
                  uk:
                      "<p>\u0410\u043d\u0430\u043b\u0456\u0442\u0438\u0447\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u044e\u0442\u044c\u0441\u044f \u0434\u043b\u044f \u0440\u043e\u0437\u0443\u043c\u0456\u043d\u043d\u044f \u0432\u0437\u0430\u0454\u043c\u043e\u0434\u0456\u0457 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456\u0432 \u0456\u0437 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u043e\u043c. \u0426\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0434\u043e\u043f\u043e\u043c\u0430\u0433\u0430\u044e\u0442\u044c \u043d\u0430\u0434\u0430\u0432\u0430\u0442\u0438 \u0456\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0456\u044e \u043f\u0440\u043e \u043f\u043e\u043a\u0430\u0437\u043d\u0438\u043a\u0438, \u043a\u0456\u043b\u044c\u043a\u0456\u0441\u0442\u044c \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456\u0432, \u043f\u043e\u043a\u0430\u0437\u043d\u0438\u043a \u0432\u0456\u0434\u043c\u043e\u0432, \u0434\u0436\u0435\u0440\u0435\u043b\u043e \u0442\u0440\u0430\u0444\u0456\u043a\u0443 \u0442\u043e\u0449\u043e.</p>",
                  sk:
                      "<p>Analytick\u00e9 cookies sa pou\u017e\u00edvaj\u00fa na pochopenie toho, ako n\u00e1v\u0161tevn\u00edci interaguj\u00fa s webovou str\u00e1nkou. Tieto s\u00fabory cookie pom\u00e1haj\u00fa poskytova\u0165 inform\u00e1cie o metrik\u00e1ch po\u010dtu n\u00e1v\u0161tevn\u00edkov, miere okam\u017eit\u00fdch odchodov, zdroji n\u00e1v\u0161tevnosti at\u010f.</p>",
                  tr:
                      "<p>Analitik \u00e7erezler, ziyaret\u00e7ilerin web sitesiyle nas\u0131l etkile\u015fime girdi\u011fini anlamak i\u00e7in kullan\u0131l\u0131r. Bu \u00e7erezler, ziyaret\u00e7i say\u0131s\u0131, hemen \u00e7\u0131kma oran\u0131, trafik kayna\u011f\u0131 vb. Gibi \u00f6l\u00e7\u00fcmler hakk\u0131nda bilgi sa\u011flamaya yard\u0131mc\u0131 olur.</p>",
                  lt:
                      "<p>Analitiniai cookies naudojami norint suprasti, kaip lankytojai s\u0105veikauja su svetaine. \u0160ie slapukai padeda pateikti informacij\u0105 apie lankytoj\u0173 skai\u010diaus metrik\u0105, atmetimo rodikl\u012f, srauto \u0161altin\u012f ir kt.</p>",
                  cs:
                      "<p>Analytick\u00e9 soubory cookie se pou\u017e\u00edvaj\u00ed k pochopen\u00ed interakce n\u00e1v\u0161t\u011bvn\u00edk\u016f s webem. Tyto soubory cookie pom\u00e1haj\u00ed poskytovat informace o metrik\u00e1ch po\u010det n\u00e1v\u0161t\u011bvn\u00edk\u016f, m\u00edru okam\u017eit\u00e9ho opu\u0161t\u011bn\u00ed, zdroj provozu atd.</p>",
                  fi:
                      "<p>Analyyttisi\u00e4 ev\u00e4steit\u00e4 k\u00e4ytet\u00e4\u00e4n ymm\u00e4rt\u00e4m\u00e4\u00e4n, miten k\u00e4vij\u00e4t ovat vuorovaikutuksessa verkkosivuston kanssa. N\u00e4m\u00e4 ev\u00e4steet auttavat tarjoamaan tietoa k\u00e4vij\u00f6iden lukum\u00e4\u00e4r\u00e4st\u00e4, poistumisprosentista, liikenteen l\u00e4hteest\u00e4 jne.</p>",
                  no:
                      "<p>Analytiske cookies brukes til \u00e5 forst\u00e5 hvordan bes\u00f8kende samhandler med nettstedet. Disse cookies hjelper deg med \u00e5 gi informasjon om beregningene antall bes\u00f8kende, fluktfrekvens, trafikkilde osv.</p>",
                  "pt-br":
                      "<p>Cookies anal\u00edticos s\u00e3o usados para entender como os visitantes interagem com o site. Esses cookies ajudam a fornecer informa\u00e7\u00f5es sobre m\u00e9tricas o n\u00famero de visitantes, taxa de rejei\u00e7\u00e3o, fonte de tr\u00e1fego, etc.</p>",
                  sl:
                      "<p>Analiti\u010dni pi\u0161kotki se uporabljajo za razumevanje interakcije obiskovalcev s spletno stranjo. Ti pi\u0161kotki pomagajo zagotoviti informacije o meritvi \u0161tevilo obiskovalcev, hitrost odskoka, prometni vir itd.</p>",
              },
              scripts: [
                  {
                      id: 73241,
                      name: {
                          en: "Google Analytics",
                          de: "Google Analytics",
                          fr: "Google Analytics",
                          it: "Google Analytics",
                          es: "Google Analytics",
                          nl: "Google Analytics",
                          bg: "Google Analytics",
                          da: "Google Analytics",
                          ru: "Google Analytics",
                          ar: "Google Analytics",
                          pl: "Google Analytics",
                          pt: "Google Analytics",
                          ca: "Google Analytics",
                          hu: "Google Analytics",
                          sv: "Google Analytics",
                          cr: "Google Analytics",
                          zh: "Google Analytics",
                          uk: "Google Analytics",
                          sk: "Google Analytics",
                          tr: "Google Analytics",
                          lt: "Google Analytics",
                          cs: "Google Analytics",
                          fi: "Google Analytics",
                          no: "Google Analytics",
                          "pt-br": "Google Analytics",
                          sl: "Google Analytics",
                      },
                      description: {
                          en: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          de: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          fr: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          it: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          es: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          nl: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          bg: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          da: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          ru: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          ar: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          pl: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          pt: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          ca: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          hu: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          sv: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          cr: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          zh: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          uk: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          sk: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          tr: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          lt: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          cs: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          fi: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          no: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          "pt-br": "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                          sl: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                      },
                      cookie_ids: "_ga, _gid",
                      active: 1,
                      head_script: null,
                      body_script: null,
                  },
                  {
                      id: 76222,
                      name: {
                          en: "GA",
                          de: "GA",
                          fr: "GA",
                          it: "GA",
                          es: "GA",
                          nl: "GA",
                          bg: "GA",
                          da: "GA",
                          ru: "GA",
                          ar: "GA",
                          pl: "GA",
                          pt: "GA",
                          ca: "GA",
                          hu: "GA",
                          sv: "GA",
                          cr: "GA",
                          zh: "GA",
                          uk: "GA",
                          sk: "GA",
                          tr: "GA",
                          lt: "GA",
                          cs: "GA",
                          fi: "GA",
                          no: "GA",
                          "pt-br": "GA",
                          sl: "GA",
                      },
                      description: {
                          en: "GA",
                          de: "GA",
                          fr: "GA",
                          it: "GA",
                          es: "GA",
                          nl: "GA",
                          bg: "GA",
                          da: "GA",
                          ru: "GA",
                          ar: "GA",
                          pl: "GA",
                          pt: "GA",
                          ca: "GA",
                          hu: "GA",
                          sv: "GA",
                          cr: "GA",
                          zh: "GA",
                          uk: "GA",
                          sk: "GA",
                          tr: "GA",
                          lt: "GA",
                          cs: "GA",
                          fi: "GA",
                          no: "GA",
                          "pt-br": "GA",
                          sl: "GA",
                      },
                      cookie_ids: "1",
                      active: 1,
                      head_script:
                          "<script>\n    window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;\n    ga('create', 'UA-175925062-1', 'auto');\n    ga('send', 'pageview');\n  </script>\n  <script async src='https://www.google-analytics.com/analytics.js'></script>",
                      body_script: null,
                  },
              ],
              cookies: [
                  {
                      id: 399928,
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
                          sv:
                              "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
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
                      domain: ".jithinmozilor.github.io",
                  },
                  {
                      id: 399929,
                      cookie_id: "_gid",
                      description: {
                          en:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
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
                          sv:
                              "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
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
                      domain: ".jithinmozilor.github.io",
                  },
              ],
          },
          {
              id: 23751,
              slug: "performance",
              order: 4,
              name: {
                  en: "Performance",
                  de: "Leistungs",
                  bg: "\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u043d\u043e\u0441\u0442",
                  ar: "\u0623\u062f\u0627\u0621",
                  ru: "\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c",
                  pt: "Desempenho",
                  ca: "Rendiment",
                  hu: "Teljes\u00edtm\u00e9ny",
                  pl: "Wyst\u0119p",
                  cr: "Izvo\u0111enje",
                  sv: "Prestanda",
                  zh: "\u8868\u73b0",
                  uk: "\u041f\u0440\u043e\u0434\u0443\u043a\u0442\u0438\u0432\u043d\u0456\u0441\u0442\u044c",
                  sk: "V\u00fdkon",
                  tr: "Performans",
                  lt: "Spektaklis",
                  cs: "V\u00fdkon",
                  fi: "Suorituskyky\u00e4",
                  no: "Ytelse",
                  "pt-br": "Desempenho",
                  sl: "Uspe\u0161nosti",
              },
              defaultConsent: 0,
              active: 1,
              settings: { ccpa: { doNotSell: false } },
              type: 2,
              description: {
                  en: "<p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.</p>",
                  de: "<p>Leistungs-Cookies werden verwendet, um die wichtigsten Leistungsindizes der Website zu verstehen und zu analysieren. Dies tr\u00e4gt dazu bei, den Besuchern ein besseres Nutzererlebnis zu bieten.</p>",
                  bg:
                      "<p>\u0411\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u0442\u0435 \u0437\u0430 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442 \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442 \u0437\u0430 \u0440\u0430\u0437\u0431\u0438\u0440\u0430\u043d\u0435 \u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043d\u0435 \u043d\u0430 \u043a\u043b\u044e\u0447\u043e\u0432\u0438\u0442\u0435 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u0437\u0430 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442 \u043d\u0430 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u0430, \u043a\u043e\u0438\u0442\u043e \u043f\u043e\u043c\u0430\u0433\u0430\u0442 \u0434\u0430 \u0441\u0435 \u043e\u0441\u0438\u0433\u0443\u0440\u0438 \u043f\u043e-\u0434\u043e\u0431\u0440\u043e \u043f\u043e\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043b\u0441\u043a\u043e \u0438\u0437\u0436\u0438\u0432\u044f\u0432\u0430\u043d\u0435 \u0437\u0430 \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438\u0442\u0435.</p>",
                  ar:
                      "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0627\u0644\u0623\u062f\u0627\u0621 \u0644\u0641\u0647\u0645 \u0648\u062a\u062d\u0644\u064a\u0644 \u0641\u0647\u0627\u0631\u0633 \u0627\u0644\u0623\u062f\u0627\u0621 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 \u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628 \u0648\u0627\u0644\u062a\u064a \u062a\u0633\u0627\u0639\u062f \u0641\u064a \u062a\u0642\u062f\u064a\u0645 \u062a\u062c\u0631\u0628\u0629 \u0645\u0633\u062a\u062e\u062f\u0645 \u0623\u0641\u0636\u0644 \u0644\u0644\u0632\u0627\u0626\u0631\u064a\u0646.</p>",
                  ru:
                      "<p>\u041a\u0443\u043a\u0438-\u0444\u0430\u0439\u043b\u044b \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u0438 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442\u0441\u044f \u0434\u043b\u044f \u043f\u043e\u043d\u0438\u043c\u0430\u043d\u0438\u044f \u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u043a\u043b\u044e\u0447\u0435\u0432\u044b\u0445 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0435\u0439 \u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0430, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043f\u043e\u043c\u043e\u0433\u0430\u044e\u0442 \u0432\u0430\u043c \u043f\u043e\u0432\u044b\u0441\u0438\u0442\u044c \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u043e\u0431\u0441\u043b\u0443\u0436\u0438\u0432\u0430\u043d\u0438\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439.</p>",
                  pt: "<p>Os cookies de desempenho s\u00e3o usados para compreender e analisar os principais \u00edndices de desempenho do site, o que ajuda a oferecer uma melhor experi\u00eancia do usu\u00e1rio aos visitantes.</p>",
                  ca: "<p>Les galetes de rendiment s\u2019utilitzen per comprendre i analitzar els \u00edndexs de rendiment clau del lloc web que ajuden a oferir una millor experi\u00e8ncia d\u2019usuari als visitants.</p>",
                  hu:
                      "<p>A teljes\u00edtm\u00e9ny-s\u00fctiket a weboldal kulcsfontoss\u00e1g\u00fa teljes\u00edtm\u00e9nymutat\u00f3inak meg\u00e9rt\u00e9s\u00e9re \u00e9s elemz\u00e9s\u00e9re haszn\u00e1lj\u00e1k, amelyek hozz\u00e1j\u00e1rulnak a l\u00e1togat\u00f3k jobb felhaszn\u00e1l\u00f3i \u00e9lm\u00e9ny\u00e9nek biztos\u00edt\u00e1s\u00e1hoz.</p>",
                  pl:
                      "<p> Wydajno\u015bciowe pliki cookie s\u0142u\u017c\u0105 do zrozumienia i analizy kluczowych wska\u017anik\u00f3w wydajno\u015bci witryny, co pomaga zapewni\u0107 lepsze wra\u017cenia u\u017cytkownika dla odwiedzaj\u0105cych. </p>",
                  cr: "<p>Kola\u010di\u0107i izvedbe koriste se za razumijevanje i analizu klju\u010dnih indeksa izvedbe web stranice \u0161to poma\u017ee u pru\u017eanju boljeg korisni\u010dkog iskustva posjetiteljima.</p>",
                  sv:
                      "<p>Prestanda cookies anv\u00e4nds f\u00f6r att f\u00f6rst\u00e5 och analysera de viktigaste prestandaindexen p\u00e5 webbplatsen som hj\u00e4lper till att leverera en b\u00e4ttre anv\u00e4ndarupplevelse f\u00f6r bes\u00f6karna.</p>",
                  zh:
                      "<p>\u6548\u679cCookie\u7528\u4e8e\u4e86\u89e3\u548c\u5206\u6790\u7f51\u7ad9\u7684\u5173\u952e\u6027\u80fd\u6307\u6807\uff0c\u8fd9\u6709\u52a9\u4e8e\u4e3a\u8bbf\u95ee\u8005\u63d0\u4f9b\u66f4\u597d\u7684\u7528\u6237\u4f53\u9a8c\u3002</p>",
                  uk:
                      "<p>\u0424\u0430\u0439\u043b\u0438 cookie \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u044e\u0442\u044c\u0441\u044f \u0434\u043b\u044f \u0440\u043e\u0437\u0443\u043c\u0456\u043d\u043d\u044f \u0442\u0430 \u0430\u043d\u0430\u043b\u0456\u0437\u0443 \u043a\u043b\u044e\u0447\u043e\u0432\u0438\u0445 \u043f\u043e\u043a\u0430\u0437\u043d\u0438\u043a\u0456\u0432 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0456 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443, \u0449\u043e \u0434\u043e\u043f\u043e\u043c\u0430\u0433\u0430\u0454 \u0437\u0430\u0431\u0435\u0437\u043f\u0435\u0447\u0438\u0442\u0438 \u043a\u0440\u0430\u0449\u0438\u0439 \u0434\u043e\u0441\u0432\u0456\u0434 \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432 \u0434\u043b\u044f \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456\u0432.</p>",
                  sk:
                      "<p>V\u00fdkonnostn\u00e9 cookies sa pou\u017e\u00edvaj\u00fa na pochopenie a anal\u00fdzu k\u013e\u00fa\u010dov\u00fdch indexov v\u00fdkonnosti webov\u00fdch str\u00e1nok, \u010do pom\u00e1ha zlep\u0161ova\u0165 u\u017e\u00edvate\u013esk\u00fa sk\u00fasenos\u0165 pre n\u00e1v\u0161tevn\u00edkov.</p>",
                  tr:
                      "<p>Performans \u00e7erezleri, ziyaret\u00e7ilere daha iyi bir kullan\u0131c\u0131 deneyimi sunmaya yard\u0131mc\u0131 olan web sitesinin temel performans indekslerini anlamak ve analiz etmek i\u00e7in kullan\u0131l\u0131r.</p>",
                  lt: "<p>Na\u0161umo cookies naudojami norint suprasti ir i\u0161analizuoti pagrindinius svetain\u0117s na\u0161umo indeksus, kurie padeda lankytojams suteikti geresn\u0119 vartotojo patirt\u012f.</p>",
                  cs:
                      "<p>V\u00fdkonnostn\u00ed cookies se pou\u017e\u00edvaj\u00ed k pochopen\u00ed a anal\u00fdze kl\u00ed\u010dov\u00fdch index\u016f v\u00fdkonu webu, co\u017e pom\u00e1h\u00e1 zajistit lep\u0161\u00ed u\u017eivatelsk\u00fd komfort pro n\u00e1v\u0161t\u011bvn\u00edky.</p>",
                  fi:
                      "<p>Suorituskykyev\u00e4steit\u00e4 k\u00e4ytet\u00e4\u00e4n verkkosivuston t\u00e4rkeimpien suorituskykyindeksien ymm\u00e4rt\u00e4miseen ja analysointiin, mik\u00e4 auttaa tarjoamaan vierailijoille paremman k\u00e4ytt\u00f6kokemuksen.</p>",
                  no: "<p>Ytelsescookies cookies til \u00e5 forst\u00e5 og analysere de viktigste ytelsesindeksene til nettstedet som hjelper til med \u00e5 gi en bedre brukeropplevelse for de bes\u00f8kende.</p>",
                  "pt-br":
                      "<p>Os cookies de desempenho s\u00e3o usados para entender e analisar os principais \u00edndices de desempenho do site, o que ajuda a oferecer uma melhor experi\u00eancia do usu\u00e1rio para os visitantes.</p>",
                  sl:
                      "<p>Pi\u0161kotki uspe\u0161nosti se uporabljajo za razumevanje in analizo klju\u010dnih kazal uspe\u0161nosti spletne strani, ki pomagajo pri zagotavljanju bolj\u0161e uporabni\u0161ke izku\u0161nje za obiskovalce.</p>",
              },
              cookies: [
                  {
                      id: 399930,
                      cookie_id: "_gat",
                      description: {
                          en: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          de: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          fr: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          it: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          es: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          nl: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          bg: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          da: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          ru: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          ar: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          pl: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          pt: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          ca: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          hu: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          sv: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          cr: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          zh: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          uk: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          sk: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          tr: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          lt: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          cs: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          fi: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          no: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          "pt-br": "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                          sl: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                      },
                      duration: "1 minute",
                      type: "https",
                      domain: ".jithinmozilor.github.io",
                  },
              ],
          },
          {
              id: 23752,
              slug: "advertisement",
              order: 5,
              name: {
                  en: "Advertisement",
                  de: "Werbe",
                  bg: "\u0440\u0435\u043a\u043b\u0430\u043c\u0430",
                  ar: "\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a",
                  ru: "\u0440\u0435\u043a\u043b\u0430\u043c\u0430",
                  pt: "An\u00fancio",
                  ca: "Anunci",
                  hu: "Hirdet\u00e9s",
                  pl: "Reklama",
                  cr: "Oglas",
                  sv: "Annons",
                  zh: "\u5e7f\u544a",
                  uk: "\u0420\u0435\u043a\u043b\u0430\u043c\u0430",
                  sk: "Reklama",
                  tr: "Reklam",
                  lt: "Reklama",
                  cs: "Reklama",
                  fi: "Mainos",
                  no: "Annonse",
                  "pt-br": "An\u00fancio",
                  sl: "Oglas",
              },
              defaultConsent: 0,
              active: 1,
              settings: { ccpa: { doNotSell: false } },
              type: 2,
              description: {
                  en: "<p>Advertisement cookies are used to deliver visitors with customized advertisements based on the pages they visited before and analyze the effectiveness of the ad campaign.</p>",
                  de: "<p>Werbe-Cookies werden verwendet, um Besuchern auf der Grundlage der von ihnen zuvor besuchten Seiten ma\u00dfgeschneiderte Werbung zu liefern und die Wirksamkeit von Werbekampagne nzu analysieren.</p>",
                  bg:
                      "<p>\u0420\u0435\u043a\u043b\u0430\u043c\u043d\u0438\u0442\u0435 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u0441\u0435 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442 \u0437\u0430 \u0434\u043e\u0441\u0442\u0430\u0432\u044f\u043d\u0435 \u043d\u0430 \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438 \u0441 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043d\u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u0438 \u0432\u044a\u0437 \u043e\u0441\u043d\u043e\u0432\u0430 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0438\u0442\u0435, \u043a\u043e\u0438\u0442\u043e \u0441\u0430 \u043f\u043e\u0441\u0435\u0442\u0438\u043b\u0438 \u043f\u0440\u0435\u0434\u0438, \u0438 \u0430\u043d\u0430\u043b\u0438\u0437 \u043d\u0430 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0442\u0430 \u043d\u0430 \u0440\u0435\u043a\u043b\u0430\u043c\u043d\u0430\u0442\u0430 \u043a\u0430\u043c\u043f\u0430\u043d\u0438\u044f.</p>",
                  ar:
                      "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0644\u062a\u0632\u0648\u064a\u062f \u0627\u0644\u0632\u0627\u0626\u0631\u064a\u0646 \u0628\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u062e\u0635\u0635\u0629 \u0627\u0633\u062a\u0646\u0627\u062f\u064b\u0627 \u0625\u0644\u0649 \u0627\u0644\u0635\u0641\u062d\u0627\u062a \u0627\u0644\u062a\u064a \u0632\u0627\u0631\u0648\u0647\u0627 \u0645\u0646 \u0642\u0628\u0644 \u0648\u062a\u062d\u0644\u064a\u0644 \u0641\u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u062d\u0645\u0644\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064a\u0629.</p>",
                  ru:
                      "<p>\u0420\u0435\u043a\u043b\u0430\u043c\u043d\u044b\u0435 \u0444\u0430\u0439\u043b\u044b cookie \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442\u0441\u044f \u0434\u043b\u044f \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u0439 \u0440\u0435\u043a\u043b\u0430\u043c\u044b \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u0435 \u043f\u043e\u0441\u0435\u0449\u0430\u0435\u043c\u044b\u0445 \u0438\u043c\u0438 \u0441\u0442\u0440\u0430\u043d\u0438\u0446 \u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u043d\u043e\u0439 \u043a\u0430\u043c\u043f\u0430\u043d\u0438\u0438.</p>",
                  pt:
                      "<p>Os cookies de publicidade s\u00e3o usados para entregar aos visitantes an\u00fancios personalizados com base nas p\u00e1ginas que eles visitaram antes e analisar a efic\u00e1cia da campanha publicit\u00e1ria.</p>",
                  ca:
                      "<p>Les galetes publicit\u00e0ries s\u2019utilitzen per oferir als visitants anuncis personalitzats en funci\u00f3 de les p\u00e0gines que van visitar abans i analitzar l\u2019efic\u00e0cia de la campanya publicit\u00e0ria.</p>",
                  hu:
                      "<p>A hirdet\u00e9si s\u00fctiket arra haszn\u00e1lj\u00e1k, hogy a l\u00e1togat\u00f3kat szem\u00e9lyre szabott hirdet\u00e9sekkel juttass\u00e1k el a kor\u00e1bban megl\u00e1togatott oldalak alapj\u00e1n, \u00e9s elemezz\u00e9k a hirdet\u00e9si kamp\u00e1ny hat\u00e9konys\u00e1g\u00e1t.</p>",
                  pl:
                      "<p> Reklamowe pliki cookie s\u0142u\u017c\u0105 do dostarczania u\u017cytkownikom spersonalizowanych reklam w oparciu o strony, kt\u00f3re odwiedzili wcze\u015bniej, oraz do analizowania skuteczno\u015bci kampanii reklamowej. </p>",
                  cr: "<p>Reklamni kola\u010di\u0107i koriste se za prikazivanje posjetitelja s prilago\u0111enim oglasima na temelju stranica koje su prije posjetili i za analizu u\u010dinkovitosti oglasne kampanje.</p>",
                  sv: "<p>Annonscookies anv\u00e4nds f\u00f6r att leverera bes\u00f6kare med anpassade annonser baserat p\u00e5 de sidor de bes\u00f6kte tidigare och analysera effektiviteten i annonskampanjen.</p>",
                  zh:
                      "<p>\u5e7f\u544aCookie\u7528\u4e8e\u6839\u636e\u8bbf\u95ee\u8005\u4e4b\u524d\u8bbf\u95ee\u7684\u9875\u9762\u5411\u8bbf\u95ee\u8005\u63d0\u4f9b\u81ea\u5b9a\u4e49\u5e7f\u544a\uff0c\u5e76\u5206\u6790\u5e7f\u544a\u6d3b\u52a8\u7684\u6709\u6548\u6027\u3002</p>",
                  uk:
                      "<p>\u0420\u0435\u043a\u043b\u0430\u043c\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u044e\u0442\u044c\u0441\u044f \u0434\u043b\u044f \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456\u0432 \u0437 \u0456\u043d\u0434\u0438\u0432\u0456\u0434\u0443\u0430\u043b\u044c\u043d\u043e\u044e \u0440\u0435\u043a\u043b\u0430\u043c\u043e\u044e \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u0456 \u0441\u0442\u043e\u0440\u0456\u043d\u043e\u043a, \u044f\u043a\u0456 \u0432\u043e\u043d\u0438 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u043b\u0438 \u0440\u0430\u043d\u0456\u0448\u0435, \u0442\u0430 \u0430\u043d\u0430\u043b\u0456\u0437\u0443 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0456 \u0440\u0435\u043a\u043b\u0430\u043c\u043d\u043e\u0457 \u043a\u0430\u043c\u043f\u0430\u043d\u0456\u0457.</p>",
                  sk:
                      "<p>S\u00fabory cookie reklamy sa pou\u017e\u00edvaj\u00fa na doru\u010denie n\u00e1v\u0161tevn\u00edkom prisp\u00f4soben\u00fdch rekl\u00e1m na z\u00e1klade str\u00e1nok, ktor\u00e9 nav\u0161t\u00edvili predt\u00fdm, a na anal\u00fdzu efekt\u00edvnosti reklamnej kampane.</p>",
                  tr:
                      "<p>Reklam \u00e7erezleri, ziyaret\u00e7ilere daha \u00f6nce ziyaret ettikleri sayfalara g\u00f6re \u00f6zelle\u015ftirilmi\u015f reklamlar sunmak ve reklam kampanyas\u0131n\u0131n etkinli\u011fini analiz etmek i\u00e7in kullan\u0131l\u0131r.</p>",
                  lt: "<p>Reklaminiai cookies naudojami norint pateikti lankytojams pritaikyt\u0105 reklam\u0105 pagal puslapius, kuriuose jie anks\u010diau lank\u0117si, ir analizuoti reklamos kampanijos efektyvum\u0105.</p>",
                  cs:
                      "<p>Soubory cookie reklamy se pou\u017e\u00edvaj\u00ed k doru\u010dov\u00e1n\u00ed n\u00e1v\u0161t\u011bvn\u00edk\u016f p\u0159izp\u016fsoben\u00fdmi reklamami na z\u00e1klad\u011b str\u00e1nek, kter\u00e9 nav\u0161t\u00edvili d\u0159\u00edve, a k anal\u00fdze \u00fa\u010dinnosti reklamn\u00ed kampan\u011b.</p>",
                  fi:
                      "<p>Mainosev\u00e4steit\u00e4 k\u00e4ytet\u00e4\u00e4n tarjoamaan k\u00e4vij\u00f6ille r\u00e4\u00e4t\u00e4l\u00f6ityj\u00e4 mainoksia sivujen perusteella, joilla he ovat k\u00e4yneet aiemmin, ja analysoimaan mainoskampanjan tehokkuutta.</p>",
                  no: "<p>Annonsecookies brukes til \u00e5 levere bes\u00f8kende med tilpassede annonser basert p\u00e5 sidene de bes\u00f8kte f\u00f8r og analysere effektiviteten av annonsekampanjen.</p>",
                  "pt-br":
                      "<p>Os cookies de an\u00fancios s\u00e3o usados para entregar aos visitantes an\u00fancios personalizados com base nas p\u00e1ginas que visitaram antes e analisar a efic\u00e1cia da campanha publicit\u00e1ria.</p>",
                  sl: "<p>Ogla\u0161evalski pi\u0161kotki se uporabljajo za zagotavljanje obiskovalcev s prilagojenimi oglasi na podlagi strani, ki so jih obiskali prej, in za analizo u\u010dinkovitosti ogla\u0161evalske akcije.</p>",
              },
          },
          {
              id: 51395,
              slug: "other",
              order: 6,
              name: {
                  en: "Other",
                  de: "Andere",
                  bg: "\u0414\u0440\u0443\u0433\u0438",
                  ru: "\u0434\u0440\u0443\u0433\u0438\u0435",
                  ar: "\u0627\u0644\u0622\u062e\u0631\u064a\u0646",
                  pl: "Innych",
                  pt: "Outros",
                  ca: "altres",
                  hu: "m\u00e1sok",
                  cr: "Drugi",
                  zh: "\u5176\u4ed6",
                  uk: "\u0456\u043d\u0448\u0456",
                  sk: "Ostatn\u00e9",
                  tr: "Di\u011ferleri",
                  lt: "Kiti",
                  cs: "Ostatn\u00ed",
                  fi: "Muut",
                  no: "Andre",
                  "pt-br": "Outros",
                  sl: "Drugi",
                  sv: "andra",
              },
              defaultConsent: 0,
              active: 1,
              settings: { ccpa: { doNotSell: false } },
              type: 2,
              description: {
                  en: "No description",
                  de: "No description",
                  bg:
                      "<p>\u0414\u0440\u0443\u0433\u0438 \u043d\u0435\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0437\u0438\u0440\u0430\u043d\u0438 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u0441\u0430 \u0442\u0435\u0437\u0438, \u043a\u043e\u0438\u0442\u043e \u0441\u0435 \u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u0442 \u0438 \u0432\u0441\u0435 \u043e\u0449\u0435 \u043d\u0435 \u0441\u0430 \u043a\u043b\u0430\u0441\u0438\u0444\u0438\u0446\u0438\u0440\u0430\u043d\u0438 \u0432 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f.</p>",
                  ru:
                      "<p>\u0414\u0440\u0443\u0433\u0438\u0435 \u0444\u0430\u0439\u043b\u044b cookie \u0431\u0435\u0437 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0439 - \u044d\u0442\u043e \u0442\u0435, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0443\u044e\u0442\u0441\u044f \u0438 \u0435\u0449\u0435 \u043d\u0435 \u0431\u044b\u043b\u0438 \u043e\u0442\u043d\u0435\u0441\u0435\u043d\u044b \u043a \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438.</p>",
                  ar:
                      "<p>\u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0623\u062e\u0631\u0649 \u063a\u064a\u0631 \u0627\u0644\u0645\u0635\u0646\u0641\u0629 \u0647\u064a \u062a\u0644\u0643 \u0627\u0644\u062a\u064a \u064a\u062a\u0645 \u062a\u062d\u0644\u064a\u0644\u0647\u0627 \u0648\u0644\u0645 \u064a\u062a\u0645 \u062a\u0635\u0646\u064a\u0641\u0647\u0627 \u0641\u064a \u0641\u0626\u0629 \u062d\u062a\u0649 \u0627\u0644\u0622\u0646.</p>",
                  pl: "<p>Inne pliki cookie bez kategorii to te, kt\u00f3re s\u0105 analizowane i nie zosta\u0142y jeszcze sklasyfikowane w \u017cadnej kategorii.</p>",
                  pt: "<p>Outros cookies n\u00e3o categorizados s\u00e3o aqueles que est\u00e3o a ser analisados e ainda n\u00e3o foram classificados numa categoria.</p>",
                  ca: "<p>Altres cookies sense categoria s\u00f3n aquelles que s\u2019estan analitzant i que encara no s\u2019han classificat en cap categoria.</p>",
                  hu: "<p>Egy\u00e9b kategoriz\u00e1latlan s\u00fctik azok, amelyeket elemeznek, \u00e9s amelyeket m\u00e9g nem soroltak be kateg\u00f3ri\u00e1ba.</p>",
                  cr: "<p>Ostali nekategorizirani kola\u010di\u0107i su oni koji se analiziraju i jo\u0161 nisu klasificirani u kategoriju.</p>",
                  zh: "<p>\u5176\u4ed6\u672a\u5206\u7c7b\u7684\u997c\u5e72\u662f\u90a3\u4e9b\u6b63\u5728\u5206\u6790\u4f46\u5c1a\u672a\u5206\u7c7b\u7684\u997c\u5e72</p>",
                  uk:
                      "<p>\u0406\u043d\u0448\u0456 \u043d\u0435\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0437\u043e\u0432\u0430\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie - \u0446\u0435 \u0442\u0456, \u044f\u043a\u0456 \u0430\u043d\u0430\u043b\u0456\u0437\u0443\u044e\u0442\u044c\u0441\u044f \u0456 \u0434\u043e\u0441\u0456 \u043d\u0435 \u043a\u043b\u0430\u0441\u0438\u0444\u0456\u043a\u043e\u0432\u0430\u043d\u0456 \u0432 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0456\u044e.</p>",
                  sk: "<p>Ostatn\u00e9 nekategorizovan\u00e9 s\u00fabory cookie s\u00fa tie, ktor\u00e9 sa analyzuj\u00fa a zatia\u013e neboli zatrieden\u00e9 do kateg\u00f3rie.</p>",
                  tr: "<p>Di\u011fer kategorize edilmemi\u015f \u00e7erezler, analiz edilmekte olan ve hen\u00fcz bir kategoriye ayr\u0131lmam\u0131\u015f olan \u00e7erezlerdir.</p>",
                  lt: "<p>Kiti kategorijai nepriskiriami slapukai yra tie, kurie yra analizuojami ir dar n\u0117ra klasifikuojami \u012f kategorij\u0105.</p>",
                  cs: "<p>Jin\u00e9 neza\u0159azen\u00e9 soubory cookie jsou ty, kter\u00e9 jsou analyzov\u00e1ny a dosud nebyly za\u0159azeny do \u017e\u00e1dn\u00e9 kategorie.</p>",
                  fi: "<p>Muut luokittelemattomat ev\u00e4steet ovat analysoitavia ev\u00e4steit\u00e4, joita ei ole viel\u00e4 luokiteltu luokkaan.</p>",
                  no: "<p>Andre ukategoriserte informasjonskapsler er de som blir analysert og som forel\u00f8pig ikke er klassifisert i en kategori.</p>",
                  "pt-br": "<p>Outros cookies n\u00e3o categorizados s\u00e3o aqueles que est\u00e3o sendo analisados e ainda n\u00e3o foram classificados em uma categoria.</p>",
                  sl: "<p>Drugi nekategorizirani pi\u0161kotki so tisti, ki se analizirajo in \u0161e niso uvr\u0161\u010deni v kategorijo.</p>",
                  sv: "<p>Andra okategoriserade kakor \u00e4r de som analyseras och som \u00e4nnu inte har klassificerats i en kategori.</p>",
              },
              cookies: [
                  {
                      id: 60803,
                      cookie_id: "prism_800008741",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "1 years  30 days",
                      type: "http",
                      domain: "",
                  },
                  {
                      id: 88148,
                      cookie_id: "cky-active-check",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "23 hours 59 minutes",
                      type: "http",
                      domain: "wordpress-178723-1219816.cloudwaysapps.com",
                  },
                  {
                      id: 88149,
                      cookie_id: "_hjTLDTest",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "session",
                      type: "http",
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 88150,
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
                      duration: "11 months 29 days 23 hours 59 minutes",
                      type: "https",
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 88151,
                      cookie_id: "_hjFirstSeen",
                      description: { en: "No description", de: "No description", fr: "No description", it: "No description", es: "No description", nl: "No description", bg: "No description", ar: "No description" },
                      duration: "29 minutes",
                      type: "http",
                      domain: ".cloudwaysapps.com",
                  },
                  {
                      id: 399924,
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
                          sv: "No description",
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
                      domain: ".jithinmozilor.github.io",
                  },
                  {
                      id: 399925,
                      cookie_id: "_hjIncludedInPageviewSample",
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
                          sv: "No description",
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
                      duration: "2 minutes",
                      type: "http",
                      domain: "jithinmozilor.github.io",
                  },
                  {
                      id: 399926,
                      cookie_id: "_hjAbsoluteSessionInProgress",
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
                          sv: "No description",
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
                      duration: "30 minutes",
                      type: "http",
                      domain: ".jithinmozilor.github.io",
                  },
              ],
          },
      ],
      privacyPolicy: {
          title: {
              en: "Privacy Policy",
              de: "Datenschutz-Bestimmungen",
              bg: "\u0414\u0435\u043a\u043b\u0430\u0440\u0430\u0446\u0438\u044f \u0437\u0430 \u043f\u043e\u0432\u0435\u0440\u0438\u0442\u0435\u043b\u043d\u043e\u0441\u0442",
              ar: "\u0633\u064a\u0627\u0633\u0629 \u062e\u0627\u0635\u0629",
              ru: "\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438",
              pt: "Pol\u00edtica de Privacidade",
              ca: "Pol\u00edtica de privacitat",
              hu: "Pol\u00edtica de Privacidade",
              pl: "Polityka prywatno\u015bci",
              cr: "Pravila o privatnostiy",
              sv: "Pol\u00edtica de privacitat",
              zh: "Privacy Policy",
              uk: "\u041f\u043e\u043b\u0456\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0456\u0434\u0435\u043d\u0446\u0456\u0439\u043d\u043e\u0441\u0442\u0456",
              sk: "Privacy Policy",
              tr: "Gizlilik Politikas\u0131",
              lt: "Privatumo politika",
              cs: "Z\u00e1sady ochrany osobn\u00edch \u00fadaj\u016f",
              fi: "Tietosuojak\u00e4yt\u00e4nt\u00f6",
              no: "Personvernregler",
              "pt-br": "Pol\u00edtica de Privacidade",
              sl: "Pravilnik o zasebnosti",
          },
          text: {
              en:
                  "<p>This website uses cookies to improve your experience while you navigate through the website. Out of these cookies, the cookies that are categorized as necessary are stored on your browser as they as essential for the working of basic functionalities of the website. </p><p>We also use third-party cookies that help us analyze and understand how you use this website, to store user preferences and provide them with content and advertisements that are relevant to you. These cookies will only be stored on your browser with your consent to do so. You also have the option to opt-out of these cookies.But opting out of some of these cookies may have an effect on your browsing experience.</p>",
              de:
                  "<p>Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern, w\u00e4hrend Sie durch die Website navigieren. Von diesen Cookies werden die nach Bedarf kategorisierten Cookies in Ihrem Browser gespeichert, da sie f\u00fcr das Funktionieren der Grundfunktionen der Website von wesentlicher Bedeutung sind.</p><p>Wir verwenden auch Cookies von Drittanbietern, mit denen wir analysieren und nachvollziehen k\u00f6nnen, wie Sie diese Website nutzen, um Benutzereinstellungen zu speichern und ihnen f\u00fcr Sie relevante Inhalte und Anzeigen bereitzustellen.</p><p>Diese Cookies werden nur mit Ihrer Zustimmung in Ihrem Browser gespeichert. Sie haben auch die M\u00f6glichkeit, diese Cookies zu deaktivieren. Das Deaktivieren einiger dieser Cookies kann sich jedoch auf Ihr Surferlebnis auswirken.</p>",
              bg:
                  "<p>\u0422\u043e\u0437\u0438 \u0441\u0430\u0439\u0442 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438, \u0437\u0430 \u0434\u0430 \u043f\u043e\u0434\u043e\u0431\u0440\u0438 \u0412\u0430\u0448\u0438\u044f \u043e\u043f\u0438\u0442, \u0434\u043e\u043a\u0430\u0442\u043e \u043d\u0430\u0432\u0438\u0433\u0438\u0440\u0430\u0442\u0435 \u0432 \u0441\u0430\u0439\u0442\u0430. \u041e\u0442 \u0442\u0435\u0437\u0438 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438, \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u0442\u0435, \u043a\u043e\u0438\u0442\u043e \u0441\u0430 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0437\u0438\u0440\u0430\u043d\u0438 \u043a\u0430\u0442\u043e \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0438, \u0441\u0435 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u0442 \u0432\u044a\u0432 \u0412\u0430\u0448\u0438\u044f \u0431\u0440\u0430\u0443\u0437\u044a\u0440, \u0442\u044a\u0439 \u043a\u0430\u0442\u043e \u0442\u0435 \u0441\u0430 \u043e\u0442 \u0441\u044a\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043e \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0437\u0430 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u0430 \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u0442\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u043d\u043e\u0441\u0442\u0438 \u043d\u0430 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u0430.</p><p>\u0421\u044a\u0449\u043e \u0442\u0430\u043a\u0430 \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u043c\u0435 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u043d\u0430 \u0442\u0440\u0435\u0442\u0438 \u0441\u0442\u0440\u0430\u043d\u0438, \u043a\u043e\u0438\u0442\u043e \u043d\u0438 \u043f\u043e\u043c\u0430\u0433\u0430\u0442 \u0434\u0430 \u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0430\u043c\u0435 \u0438 \u0440\u0430\u0437\u0431\u0435\u0440\u0435\u043c \u043a\u0430\u043a \u0438\u0437\u043f\u043e\u043b\u0437\u0432\u0430\u0442\u0435 \u0442\u043e\u0437\u0438 \u0443\u0435\u0431\u0441\u0430\u0439\u0442, \u0434\u0430 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u043c\u0435 \u043f\u0440\u0435\u0434\u043f\u043e\u0447\u0438\u0442\u0430\u043d\u0438\u044f\u0442\u0430 \u043d\u0430 \u043f\u043e\u0442\u0440\u0435\u0431\u0438\u0442\u0435\u043b\u0438\u0442\u0435 \u0438 \u0434\u0430 \u0438\u043c \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u044f\u043c\u0435 \u0441\u044a\u0434\u044a\u0440\u0436\u0430\u043d\u0438\u0435 \u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u0438, \u043a\u043e\u0438\u0442\u043e \u0441\u0430 \u043f\u043e\u0434\u0445\u043e\u0434\u044f\u0449\u0438 \u0437\u0430 \u0432\u0430\u0441. \u0422\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u0449\u0435 \u0441\u0435 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u0442 \u0441\u0430\u043c\u043e \u0432 \u0431\u0440\u0430\u0443\u0437\u044a\u0440\u0430 \u0432\u0438 \u0441 \u0432\u0430\u0448\u0435 \u0441\u044a\u0433\u043b\u0430\u0441\u0438\u0435 \u0437\u0430 \u0442\u043e\u0432\u0430. \u0421\u044a\u0449\u043e \u0442\u0430\u043a\u0430 \u0438\u043c\u0430\u0442\u0435 \u0432\u044a\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442 \u0434\u0430 \u0441\u0435 \u043e\u0442\u043a\u0430\u0436\u0435\u0442\u0435 \u043e\u0442 \u0442\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c. \u041d\u043e \u0438\u0437\u043a\u043b\u044e\u0447\u0432\u0430\u043d\u0435\u0442\u043e \u043d\u0430 \u043d\u044f\u043a\u043e\u0438 \u043e\u0442 \u0442\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u043c\u043e\u0436\u0435 \u0434\u0430 \u043f\u043e\u0432\u043b\u0438\u044f\u0435 \u043d\u0430 \u043e\u043f\u0438\u0442\u0430 \u0432\u0438 \u043f\u0440\u0438 \u0441\u044a\u0440\u0444\u0438\u0440\u0430\u043d\u0435.</p>",
              ar:
                  "<p>\u064a\u0633\u062a\u062e\u062f\u0645 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628 \u0647\u0630\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0644\u062a\u062d\u0633\u064a\u0646 \u062a\u062c\u0631\u0628\u062a\u0643 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u062a\u0646\u0642\u0644 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639. \u0645\u0646 \u0628\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u060c \u064a\u062a\u0645 \u062a\u062e\u0632\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0645\u0635\u0646\u0641\u0629 \u062d\u0633\u0628 \u0627\u0644\u0636\u0631\u0648\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0627\u0644\u062e\u0627\u0635 \u0628\u0643 \u0644\u0623\u0646\u0647\u0627 \u0636\u0631\u0648\u0631\u064a\u0629 \u0644\u0639\u0645\u0644 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0644\u0644\u0645\u0648\u0642\u0639. </p><p>\u0646\u0633\u062a\u062e\u062f\u0645 \u0623\u064a\u0636\u064b\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062b\u0627\u0644\u062b \u0627\u0644\u062a\u064a \u062a\u0633\u0627\u0639\u062f\u0646\u0627 \u0639\u0644\u0649 \u062a\u062d\u0644\u064a\u0644 \u0648\u0641\u0647\u0645 \u0643\u064a\u0641\u064a\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u060c \u0644\u062a\u062e\u0632\u064a\u0646 \u062a\u0641\u0636\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0648\u062a\u0632\u0648\u064a\u062f\u0647\u0645 \u0628\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0630\u0627\u062a \u0627\u0644\u0635\u0644\u0629 \u0628\u0643. \u0633\u064a\u062a\u0645 \u062a\u062e\u0632\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0641\u0642\u0637 \u0639\u0644\u0649 \u0645\u062a\u0635\u0641\u062d\u0643 \u0628\u0645\u0648\u0627\u0641\u0642\u062a\u0643 \u0639\u0644\u0649 \u0627\u0644\u0642\u064a\u0627\u0645 \u0628\u0630\u0644\u0643. \u0644\u062f\u064a\u0643 \u0623\u064a\u0636\u064b\u0627 \u062e\u064a\u0627\u0631 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0645\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647. \u0644\u0643\u0646 \u0625\u0644\u063a\u0627\u0621 \u0627\u0634\u062a\u0631\u0627\u0643 \u0628\u0639\u0636 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0642\u062f \u064a\u0643\u0648\u0646 \u0644\u0647 \u062a\u0623\u062b\u064a\u0631 \u0639\u0644\u0649 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u062a\u0635\u0641\u062d \u0644\u062f\u064a\u0643.</p>",
              ru:
                  "<p>\u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0430\u0442\u044c\u0441\u044f \u043f\u043e \u044d\u0442\u043e\u043c\u0443 \u0441\u0430\u0439\u0442\u0443, \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044f \u0432\u0430\u0448 \u0441\u0430\u0439\u0442. \u0418\u0437 \u044d\u0442\u0438\u0445 \u0444\u0430\u0439\u043b\u043e\u0432 cookie \u044d\u0442\u043e \u0444\u0430\u0439\u043b\u044b, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043a\u043b\u0430\u0441\u0441\u0438\u0444\u0438\u0446\u0438\u0440\u0443\u044e\u0442\u0441\u044f \u043a\u0430\u043a \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u044b\u0435 \u0438 \u0445\u0440\u0430\u043d\u044f\u0442\u0441\u044f \u0432 \u0432\u0430\u0448\u0435\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. </p><p>\u041c\u044b \u0442\u0430\u043a\u0436\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0438\u0435 \u0444\u0430\u0439\u043b\u044b cookie, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043c\u043e\u0447\u044c \u043d\u0430\u043c \u043f\u0440\u043e\u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0438 \u043f\u043e\u043d\u044f\u0442\u044c, \u043a\u0430\u043a \u0432\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0435 \u044d\u0442\u043e\u0442 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442, \u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u043a\u043e\u043d\u0442\u0435\u043d\u0442 \u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u0443 \u0432\u043c\u0435\u0441\u0442\u0435 \u0441 \u043d\u0438\u043c\u0438. \u042d\u0442\u0438 \u043a\u0443\u043a\u0438 \u0431\u0443\u0434\u0443\u0442 \u0445\u0440\u0430\u043d\u0438\u0442\u044c\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u0432 \u0432\u0430\u0448\u0435\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. \u0423 \u0432\u0430\u0441 \u0442\u0430\u043a\u0436\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u044c \u043e\u0442\u043a\u0430\u0437\u0430\u0442\u044c\u0441\u044f \u043e\u0442 \u044d\u0442\u0438\u0445 \u0444\u0430\u0439\u043b\u043e\u0432 cookie.</p>",
              pt:
                  "<p>Este site usa cookies para melhorar sua experi\u00eancia enquanto voc\u00ea navega pelo site. Destes cookies, os cookies que s\u00e3o categorizados como necess\u00e1rios s\u00e3o armazenados no seu navegador, pois s\u00e3o essenciais para o funcionamento das funcionalidades b\u00e1sicas do site.</p><p>Tamb\u00e9m usamos cookies de terceiros que nos ajudam a analisar e entender como voc\u00ea usa este site, para armazenar as prefer\u00eancias do usu\u00e1rio e fornecer-lhes conte\u00fado e an\u00fancios relevantes para voc\u00ea. Esses cookies s\u00f3 ser\u00e3o armazenados em seu navegador com o seu consentimento para faz\u00ea-lo. Voc\u00ea tamb\u00e9m tem a op\u00e7\u00e3o de cancelar o recebimento desses cookies. Mas o cancelamento de alguns desses cookies pode afetar sua experi\u00eancia de navega\u00e7\u00e3o.</p>",
              ca:
                  "<p>Aquest lloc web utilitza cookies per millorar la vostra experi\u00e8ncia mentre navegueu pel lloc web. D\u2019aquestes cookies, les cookies que es classifiquen com a necess\u00e0ries s\u2019emmagatzemen al vostre navegador, ja que s\u00f3n essencials per al funcionament de les funcionalitats b\u00e0siques del lloc web.</p><p>Tamb\u00e9 fem servir cookies de tercers que ens ajuden a analitzar i entendre com utilitzeu aquest lloc web, per emmagatzemar les prefer\u00e8ncies dels usuaris i proporcionar-los contingut i anuncis que siguin rellevants per a vosaltres. Aquestes cookies nom\u00e9s s\u2019emmagatzemaran al vostre navegador amb el vostre consentiment. Tamb\u00e9 teniu l\u2019opci\u00f3 de desactivar aquestes cookies, per\u00f2 desactivar algunes d\u2019aquestes cookies pot afectar la vostra experi\u00e8ncia de navegaci\u00f3.</p>",
              hu:
                  "<p>Ez a weboldal s\u00fctiket haszn\u00e1l az \u00d6n \u00e9lm\u00e9ny\u00e9nek jav\u00edt\u00e1sa \u00e9rdek\u00e9ben, mik\u00f6zben \u00d6n a webhelyen navig\u00e1l. Ezen cookie-k k\u00f6z\u00fcl a sz\u00fcks\u00e9g szerint kategoriz\u00e1lt s\u00fctiket az \u00d6n b\u00f6ng\u00e9sz\u0151je t\u00e1rolja, mivel elengedhetetlenek a weboldal alapvet\u0151 funkci\u00f3inak m\u0171k\u00f6d\u00e9s\u00e9hez.</p><p>Harmadik f\u00e9lt\u0151l sz\u00e1rmaz\u00f3 s\u00fctiket is haszn\u00e1lunk, amelyek seg\u00edtenek elemezni \u00e9s meg\u00e9rteni, hogyan haszn\u00e1lja ezt a weboldalt, a felhaszn\u00e1l\u00f3i preferenci\u00e1k t\u00e1rol\u00e1s\u00e1hoz, valamint az \u00d6n sz\u00e1m\u00e1ra relev\u00e1ns tartalom \u00e9s hirdet\u00e9sek biztos\u00edt\u00e1s\u00e1hoz. Ezeket a s\u00fctiket csak az \u00d6n b\u00f6ng\u00e9sz\u0151j\u00e9ben t\u00e1roljuk az \u00d6n beleegyez\u00e9s\u00e9vel. \u00d6nnek lehet\u0151s\u00e9ge van ezekr\u0151l a s\u00fctikr\u0151l is lemondani. De ezeknek a s\u00fctiknek a kikapcsol\u00e1sa hat\u00e1ssal lehet a b\u00f6ng\u00e9sz\u00e9si \u00e9lm\u00e9ny\u00e9re.</p>",
              pl:
                  "<p>Ta strona korzysta z plik\u00f3w cookie, aby poprawi\u0107 Twoje wra\u017cenia podczas przegl\u0105dania witryny. Z tych plik\u00f3w cookie, kt\u00f3re s\u0105 sklasyfikowane jako niezb\u0119dne, s\u0105 przechowywane w przegl\u0105darce, poniewa\u017c s\u0105 niezb\u0119dne do dzia\u0142ania podstawowych funkcji strony internetowej.</p> <p>U\u017cywamy r\u00f3wnie\u017c plik\u00f3w cookie stron trzecich, kt\u00f3re pomagaj\u0105 nam analizowa\u0107 i zrozumie\u0107, w jaki spos\u00f3b korzystasz z tej witryny, przechowywa\u0107 preferencje u\u017cytkownika i dostarcza\u0107 im tre\u015bci i reklamy, kt\u00f3re s\u0105 dla Ciebie istotne. Te pliki cookie b\u0119d\u0105 przechowywane w Twojej przegl\u0105darce tylko za Twoj\u0105 zgod\u0105. Mo\u017cesz r\u00f3wnie\u017c zrezygnowa\u0107 z tych plik\u00f3w cookie, ale rezygnacja z niekt\u00f3rych z tych plik\u00f3w cookie mo\u017ce mie\u0107 wp\u0142yw na wygod\u0119 przegl\u0105dania.</p>",
              cr:
                  "<p>Ova web stranica koristi kola\u010di\u0107e za pobolj\u0161anje va\u0161eg iskustva tijekom navigacije web stranicom. Od ovih kola\u010di\u0107a, kola\u010di\u0107i koji su kategorizirani prema potrebi pohranjuju se u va\u0161em pregledniku jer su neophodni za rad osnovnih funkcija web mjesta.</p><p>Tako\u0111er koristimo kola\u010di\u0107e tre\u0107ih strana koji nam poma\u017eu analizirati i razumjeti kako upotrebljavate ovu web stranicu, za pohranu korisni\u010dkih postavki i pru\u017eanje sadr\u017eaja i reklama koji su za vas relevantni. Ovi \u0107e se kola\u010di\u0107i pohraniti u va\u0161 preglednik samo uz va\u0161 pristanak za to. Tako\u0111er imate mogu\u0107nost odjave od ovih kola\u010di\u0107a. Ali isklju\u010divanje nekih od tih kola\u010di\u0107a mo\u017ee utjecati na va\u0161e iskustvo pregledavanja.</p>",
              sv:
                  "<p>Denna webbplats anv\u00e4nder cookies f\u00f6r att f\u00f6rb\u00e4ttra din upplevelse medan du navigerar genom webbplatsen. Av dessa cookies lagras de cookies som kategoriseras som n\u00f6dv\u00e4ndiga i din webbl\u00e4sare eftersom de \u00e4r v\u00e4sentliga f\u00f6r att de grundl\u00e4ggande funktionerna p\u00e5 webbplatsen ska fungera.</p><p>Vi anv\u00e4nder ocks\u00e5 cookies fr\u00e5n tredje part som hj\u00e4lper oss att analysera och f\u00f6rst\u00e5 hur du anv\u00e4nder denna webbplats, f\u00f6r att lagra anv\u00e4ndarinst\u00e4llningar och f\u00f6rse dem med inneh\u00e5ll och annonser som \u00e4r relevanta f\u00f6r dig. Dessa cookies lagras endast i din webbl\u00e4sare med ditt samtycke till att g\u00f6ra det. Du har ocks\u00e5 m\u00f6jlighet att v\u00e4lja bort dessa cookies. Men att v\u00e4lja bort vissa av dessa cookies kan ha en inverkan p\u00e5 din surfupplevelse.</p>",
              zh:
                  "<p>\u5f53\u60a8\u6d4f\u89c8\u7f51\u7ad9\u65f6\uff0c\u8be5\u7f51\u7ad9\u4f7f\u7528cookie\u6765\u6539\u5584\u60a8\u7684\u4f53\u9a8c\u3002 \u5728\u8fd9\u4e9bCookie\u4e2d\uff0c\u6839\u636e\u9700\u8981\u5206\u7c7b\u7684Cookie\u4f1a\u5b58\u50a8\u5728\u60a8\u7684\u6d4f\u89c8\u5668\u4e2d\uff0c\u56e0\u4e3a\u5b83\u4eec\u662f\u7f51\u7ad9\u57fa\u672c\u529f\u80fd\u6b63\u5e38\u8fd0\u884c\u6240\u5fc5\u9700\u7684\u3002 </ p> <p>\u6211\u4eec\u8fd8\u4f7f\u7528\u7b2c\u4e09\u65b9cookie\uff0c\u4ee5\u5e2e\u52a9\u6211\u4eec\u5206\u6790\u548c\u4e86\u89e3\u60a8\u5982\u4f55\u4f7f\u7528\u672c\u7f51\u7ad9\uff0c\u5b58\u50a8\u7528\u6237\u504f\u597d\u5e76\u4e3a\u4ed6\u4eec\u63d0\u4f9b\u4e0e\u60a8\u76f8\u5173\u7684\u5185\u5bb9\u548c\u5e7f\u544a\u3002 \u8fd9\u4e9bCookie\u4ec5\u5728\u60a8\u540c\u610f\u7684\u60c5\u51b5\u4e0b\u5b58\u50a8\u5728\u6d4f\u89c8\u5668\u4e2d\u3002 \u60a8\u8fd8\u53ef\u4ee5\u9009\u62e9\u4e0d\u4f7f\u7528\u8fd9\u4e9bcookie\u3002\u4f46\u662f\uff0c\u9009\u62e9\u4e0d\u4f7f\u7528\u5176\u4e2d\u7684\u4e00\u4e9bcookie\u53ef\u80fd\u4f1a\u5f71\u54cd\u60a8\u7684\u6d4f\u89c8\u4f53\u9a8c\u3002</ p>",
              uk:
                  "<p>\u0426\u0435\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0454 \u0444\u0430\u0439\u043b\u0438 cookie \u0434\u043b\u044f \u043f\u043e\u043a\u0440\u0430\u0449\u0435\u043d\u043d\u044f \u0432\u0430\u0448\u043e\u0433\u043e \u0434\u043e\u0441\u0432\u0456\u0434\u0443 \u043f\u0456\u0434 \u0447\u0430\u0441 \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0443 \u043f\u043e \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443. \u0417 \u0446\u0438\u0445 \u0444\u0430\u0439\u043b\u0456\u0432 cookie \u0444\u0430\u0439\u043b\u0438 cookie, \u043a\u043b\u0430\u0441\u0438\u0444\u0456\u043a\u043e\u0432\u0430\u043d\u0456 \u0437\u0430 \u043d\u0435\u043e\u0431\u0445\u0456\u0434\u043d\u0456\u0441\u0442\u044e, \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u044e\u0442\u044c\u0441\u044f \u0443 \u0432\u0430\u0448\u043e\u043c\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456, \u043e\u0441\u043a\u0456\u043b\u044c\u043a\u0438 \u0432\u043e\u043d\u0438 \u0454 \u0432\u0430\u0436\u043b\u0438\u0432\u0438\u043c\u0438 \u0434\u043b\u044f \u0440\u043e\u0431\u043e\u0442\u0438 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u0445 \u0444\u0443\u043d\u043a\u0446\u0456\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443. </p><p>\u041c\u0438 \u0442\u0430\u043a\u043e\u0436 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0454\u043c\u043e \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie, \u044f\u043a\u0456 \u0434\u043e\u043f\u043e\u043c\u0430\u0433\u0430\u044e\u0442\u044c \u043d\u0430\u043c \u0430\u043d\u0430\u043b\u0456\u0437\u0443\u0432\u0430\u0442\u0438 \u0442\u0430 \u0440\u043e\u0437\u0443\u043c\u0456\u0442\u0438, \u044f\u043a \u0432\u0438 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0454\u0442\u0435 \u0446\u0435\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442, \u0434\u043b\u044f \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u043d\u043d\u044f \u043d\u0430\u043b\u0430\u0448\u0442\u0443\u0432\u0430\u043d\u044c \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432 \u0442\u0430 \u043d\u0430\u0434\u0430\u043d\u043d\u044f \u0457\u043c \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u043d\u043e\u0433\u043e \u0434\u043b\u044f \u0432\u0430\u0441 \u0432\u043c\u0456\u0441\u0442\u0443 \u0442\u0430 \u0440\u0435\u043a\u043b\u0430\u043c\u0438. \u0426\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u0442\u0438\u043c\u0443\u0442\u044c\u0441\u044f \u0443 \u0432\u0430\u0448\u043e\u043c\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456 \u043b\u0438\u0448\u0435 \u0437 \u0432\u0430\u0448\u043e\u0457 \u0437\u0433\u043e\u0434\u0438 \u043d\u0430 \u0446\u0435. \u0412\u0438 \u0442\u0430\u043a\u043e\u0436 \u043c\u043e\u0436\u0435\u0442\u0435 \u0432\u0456\u0434\u043c\u043e\u0432\u0438\u0442\u0438\u0441\u044c \u0432\u0456\u0434 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u0430\u043d\u043d\u044f \u0446\u0438\u0445 \u0444\u0430\u0439\u043b\u0456\u0432 cookie, \u0430\u043b\u0435 \u0432\u0456\u0434\u043c\u043e\u0432\u0430 \u0432\u0456\u0434 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u0430\u043d\u043d\u044f \u0446\u0438\u0445 \u0444\u0430\u0439\u043b\u0456\u0432 cookie \u043c\u043e\u0436\u0435 \u0432\u043f\u043b\u0438\u043d\u0443\u0442\u0438 \u043d\u0430 \u0432\u0430\u0448 \u043f\u0435\u0440\u0435\u0433\u043b\u044f\u0434 \u0432\u0435\u0431-\u0441\u0442\u043e\u0440\u0456\u043d\u043e\u043a.</p>",
              sk:
                  "<p>T\u00e1to webov\u00e1 str\u00e1nka pou\u017e\u00edva s\u00fabory cookie na zlep\u0161enie v\u00e1\u0161ho z\u00e1\u017eitku pri prech\u00e1dzan\u00ed webovou str\u00e1nkou. Z t\u00fdchto s\u00faborov cookie sa vo va\u0161om prehliada\u010di ukladaj\u00fa s\u00fabory cookie, ktor\u00e9 s\u00fa kategorizovan\u00e9 pod\u013ea potreby, preto\u017ee s\u00fa nevyhnutn\u00e9 pre fungovanie z\u00e1kladn\u00fdch funkci\u00ed webovej str\u00e1nky. </p><p>Pou\u017e\u00edvame tie\u017e s\u00fabory cookie tret\u00edch str\u00e1n, ktor\u00e9 n\u00e1m pom\u00e1haj\u00fa analyzova\u0165 a porozumie\u0165 tomu, ako pou\u017e\u00edvate t\u00fato webov\u00fa str\u00e1nku, na ukladanie preferenci\u00ed pou\u017e\u00edvate\u013eov a na poskytovanie obsahu a rekl\u00e1m, ktor\u00e9 s\u00fa pre v\u00e1s relevantn\u00e9. Tieto s\u00fabory cookie sa vo va\u0161om prehliada\u010di ulo\u017eia iba s va\u0161\u00edm s\u00fahlasom. M\u00e1te tie\u017e mo\u017enos\u0165 deaktivova\u0165 tieto s\u00fabory cookie. Deaktiv\u00e1cia niektor\u00fdch z t\u00fdchto s\u00faborov cookie v\u0161ak m\u00f4\u017ee ma\u0165 vplyv na va\u0161u sk\u00fasenos\u0165 s prehliadan\u00edm.</p>",
              tr:
                  "<p>Bu web sitesi, web sitesinde gezinirken deneyiminizi iyile\u015ftirmek i\u00e7in tan\u0131mlama bilgileri kullan\u0131r. Bu \u00e7erezlerin d\u0131\u015f\u0131nda, gerekli \u015fekilde kategorize edilen \u00e7erezler, web sitesinin temel i\u015flevlerinin \u00e7al\u0131\u015fmas\u0131 i\u00e7in gerekli olduklar\u0131 i\u00e7in taray\u0131c\u0131n\u0131zda saklan\u0131r.</p><p>Ayr\u0131ca, bu web sitesini nas\u0131l kulland\u0131\u011f\u0131n\u0131z\u0131 analiz etmemize ve anlamam\u0131za, kullan\u0131c\u0131 tercihlerini saklamam\u0131za ve onlara sizinle alakal\u0131 i\u00e7erik ve reklamlar sunmam\u0131za yard\u0131mc\u0131 olan \u00fc\u00e7\u00fcnc\u00fc taraf \u00e7erezleri de kullan\u0131yoruz. Bu \u00e7erezler, yaln\u0131zca sizin izninizle taray\u0131c\u0131n\u0131zda saklanacakt\u0131r. Ayr\u0131ca, bu \u00e7erezleri devre d\u0131\u015f\u0131 b\u0131rakma se\u00e7ene\u011finiz de vard\u0131r, ancak bu \u00e7erezlerden baz\u0131lar\u0131n\u0131 devre d\u0131\u015f\u0131 b\u0131rakman\u0131z, tarama deneyiminizi etkileyebilir.</p>",
              lt:
                  "<p>\u0160i svetain\u0117 naudoja slapukus, kad pagerint\u0173 j\u016bs\u0173 patirt\u012f nar\u0161ant svetain\u0117je. I\u0161 \u0161i\u0173 slapuk\u0173 slapukai, kurie yra priskirti reikiamoms kategorijoms, yra saugomi j\u016bs\u0173 nar\u0161ykl\u0117je, nes jie yra b\u016btini norint atlikti pagrindines svetain\u0117s funkcijas. </p><p>Mes taip pat naudojame tre\u010di\u0173j\u0173 \u0161ali\u0173 slapukus, kurie padeda mums i\u0161analizuoti ir suprasti, kaip naudojat\u0117s \u0161ia svetaine, kad i\u0161saugotume vartotoj\u0173 nuostatas ir pateikt\u0173 jums aktual\u0173 turin\u012f ir reklam\u0105. \u0160ie slapukai bus saugomi j\u016bs\u0173 nar\u0161ykl\u0117je tik gavus j\u016bs\u0173 sutikim\u0105. J\u016bs taip pat turite galimyb\u0119 atsisakyti \u0161i\u0173 slapuk\u0173. Ta\u010diau atsisakymas kai kuri\u0173 i\u0161 \u0161i\u0173 slapuk\u0173 gali tur\u0117ti \u012ftakos j\u016bs\u0173 nar\u0161ymo patir\u010diai.</p>",
              cs:
                  "<p>Tento web pou\u017e\u00edv\u00e1 soubory cookie k vylep\u0161en\u00ed va\u0161eho z\u00e1\u017eitku p\u0159i proch\u00e1zen\u00ed webem. Z t\u011bchto soubor\u016f cookie jsou soubory cookie, kter\u00e9 jsou podle pot\u0159eby kategorizov\u00e1ny, ulo\u017eeny ve va\u0161em prohl\u00ed\u017ee\u010di, proto\u017ee jsou nezbytn\u00e9 pro fungov\u00e1n\u00ed z\u00e1kladn\u00edch funkc\u00ed webu. </p> <p> Pou\u017e\u00edv\u00e1me tak\u00e9 soubory cookie t\u0159et\u00edch stran, kter\u00e9 n\u00e1m pom\u00e1haj\u00ed analyzovat a porozum\u011bt tomu, jak pou\u017e\u00edv\u00e1te tento web, abychom ukl\u00e1dali preference u\u017eivatel\u016f a poskytovali jim obsah a reklamy, kter\u00e9 jsou pro v\u00e1s relevantn\u00ed. Tyto cookies budou ulo\u017eeny ve va\u0161em prohl\u00ed\u017ee\u010di pouze s va\u0161\u00edm souhlasem. M\u00e1te tak\u00e9 mo\u017enost se z t\u011bchto soubor\u016f cookie odhl\u00e1sit. Odhl\u00e1\u0161en\u00ed z n\u011bkter\u00fdch z t\u011bchto soubor\u016f cookie v\u0161ak m\u016f\u017ee m\u00edt vliv na va\u0161e proch\u00e1zen\u00ed.</p>",
              fi:
                  "<p>T\u00e4m\u00e4 verkkosivusto k\u00e4ytt\u00e4\u00e4 ev\u00e4steit\u00e4 k\u00e4ytt\u00f6kokemuksen parantamiseen selatessasi verkkosivustoa. N\u00e4ist\u00e4 ev\u00e4steist\u00e4 tarpeelliseksi luokitellut ev\u00e4steet tallennetaan selaimeesi, koska ne ovat v\u00e4ltt\u00e4m\u00e4tt\u00f6mi\u00e4 verkkosivuston perustoimintojen toiminnalle. </p><p>K\u00e4yt\u00e4mme my\u00f6s kolmansien osapuolten ev\u00e4steit\u00e4, jotka auttavat meit\u00e4 analysoimaan ja ymm\u00e4rt\u00e4m\u00e4\u00e4n, miten k\u00e4yt\u00e4t t\u00e4t\u00e4 verkkosivustoa, tallentamaan k\u00e4ytt\u00e4jien mieltymykset ja tarjoamaan heille sinulle merkityksellist\u00e4 sis\u00e4lt\u00f6\u00e4 ja mainoksia. N\u00e4m\u00e4 ev\u00e4steet tallennetaan selaimeesi vain suostumuksellasi siihen. Sinulla on my\u00f6s mahdollisuus kielt\u00e4yty\u00e4 n\u00e4ist\u00e4 ev\u00e4steist\u00e4, mutta joistakin n\u00e4ist\u00e4 ev\u00e4steist\u00e4 poistaminen voi vaikuttaa selauskokemukseesi.</p>",
              no:
                  "<p>Dette nettstedet bruker informasjonskapsler for \u00e5 forbedre opplevelsen din mens du navigerer gjennom nettstedet. Ut av disse informasjonskapslene lagres informasjonskapslene som er kategorisert som n\u00f8dvendige i nettleseren din, da de er avgj\u00f8rende for \u00e5 fungere med grunnleggende funksjoner p\u00e5 nettstedet. </p> <p> Vi bruker ogs\u00e5 tredjeparts informasjonskapsler som hjelper oss med \u00e5 analysere og forst\u00e5 hvordan du bruker dette nettstedet, for \u00e5 lagre brukerinnstillinger og gi dem innhold og annonser som er relevante for deg. Disse informasjonskapslene lagres bare i nettleseren din med ditt samtykke til \u00e5 gj\u00f8re det. Du har ogs\u00e5 muligheten til \u00e5 velge bort disse informasjonskapslene, men \u00e5 velge bort noen av disse informasjonskapslene kan ha en innvirkning p\u00e5 nettleseropplevelsen din.</p>",
              "pt-br":
                  "<p>Este site usa cookies para melhorar sua experi\u00eancia enquanto voc\u00ea navega pelo site. Desses cookies, os cookies categorizados conforme necess\u00e1rio s\u00e3o armazenados no seu navegador, pois s\u00e3o essenciais para o funcionamento das funcionalidades b\u00e1sicas do site. </p><p>Tamb\u00e9m usamos cookies de terceiros que nos ajudam a analisar e entender como voc\u00ea usa este site, para armazenar as prefer\u00eancias do usu\u00e1rio e fornecer-lhes conte\u00fado e an\u00fancios que s\u00e3o relevantes para voc\u00ea. Esses cookies s\u00f3 ser\u00e3o armazenados no seu navegador com o seu consentimento para faz\u00ea-lo. Voc\u00ea tamb\u00e9m tem a op\u00e7\u00e3o de desativar esses cookies. Mas optar por alguns desses cookies pode ter um efeito na sua experi\u00eancia de navega\u00e7\u00e3o.</p>",
              sl:
                  "<p>Ta spletna stran uporablja pi\u0161kotke za izbolj\u0161anje va\u0161e izku\u0161nje med navigacijo po spletni strani. Od teh pi\u0161kotkov so pi\u0161kotki, ki so po potrebi kategorizirani, shranjeni v va\u0161em brskalniku, saj so bistveni za delovanje osnovnih funkcionalnosti spletnega mesta.</p><p>Uporabljamo tudi pi\u0161kotke tretjih oseb, ki nam pomagajo analizirati in razumeti, kako uporabljate to spletno mesto, shranjujemo uporabni\u0161ke nastavitve in jim posredujemo vsebine in oglase, ki so pomembni za vas. Ti pi\u0161kotki bodo shranjeni samo v va\u0161em brskalniku z va\u0161o privolijo, da to storite. Prav tako imate mo\u017enost, da umaknete te pi\u0161kotke. Toda umik iz nekaterih od teh pi\u0161kotkov lahko vpliva na va\u0161o izku\u0161njo brskanja.</p>",
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



// Since version 2.0.0
// @mujeebu - render script/iframe upon consent
// Mutation observer


function addPlaceholder(htmlElm) {
    var selectedLanguage = cliConfig.options.behaviour.selectedLanguage;
    let activeLawTemp = ckyActiveLaw ? ckyActiveLaw : cliConfig.options.selectedLaws[0];
    selectedLanguage = checkSelectedLanguage(selectedLanguage, activeLawTemp);
    var htmlElemContent = cliConfig.options.content[activeLawTemp].placeHolderText[selectedLanguage];
    var htmlElemWidth = htmlElm.getAttribute('width');
    var htmlElemHeight = htmlElm.getAttribute('height');
    if (htmlElemWidth == null) {
        htmlElemWidth = htmlElm.offsetWidth;
    }
    if (htmlElemHeight == null) {
        htmlElemHeight = htmlElm.offsetHeight;
    }
    if (htmlElemHeight == 0 || htmlElemWidth == 0) {
        htmlElemContent = '';
    }
    var Placeholder = '<div data-src="' + htmlElm.src + '" style="background-image: url(\'https://cdn-cookieyes.com/assets/images/cky-placeholder.svg\');background-size: 80px;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: flex-end;justify-content: center; width:' + htmlElemWidth + 'px; height:' + htmlElemHeight + 'px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;">' + htmlElemContent + '</div></div>';
    var youtubeID = getYoutubeID( htmlElm.src );
    if ( youtubeID !== false && typeof htmlElm.src !== 'undefined ' ) {
        youtubeThumbnail = "https://img.youtube.com/vi/" + youtubeID + "/maxresdefault.jpg";
        var Placeholder = '<div data-src="' + htmlElm.src + '" style="background-image: linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)), url('+youtubeThumbnail+');background-size: 100% 100%;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: center;justify-content: center; width:' + htmlElemWidth + 'px; height:' + htmlElemHeight + 'px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;display: flex; align-items: center; padding:10px 16px; background-color: rgba(0, 0, 0, 0.8); color: #ffffff;">' + htmlElemContent + '</div></div>';
    }
    Placeholder.width = htmlElemWidth;
    Placeholder.height = htmlElemHeight;
    if (htmlElm.tagName !== 'IMG') {
        htmlElm.insertAdjacentHTML('beforebegin', Placeholder);
    }
}
function getYoutubeID( src ) {
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = src.match( regExp );
    if ( match && match[2].length == 11 ) {
        return match[2];
    } else {
        return false;
    }
}
// var categoryScripts = [{
//         "name": "functional",
//         "list": [
//             /youtube-nocookie.com/,
//             /bing.com/,
//             /vimeo.com/,
//             /spotify.com/,
//             /sharethis.com/,
//             /yahoo.com/,
//             /addtoany.com/,
//             /dailymotion.com/,
//             /slideshare.net/,
//             /soundcloud.com/,
//             /spotify.com/,
//             ///maps.googleapis.com/,
//             ///www.google.com\/maps/,
//             /tawk.to/,
//             /cky-functional.js/
//         ]
//     },
//     {
//         "name": "performance",
//         "list": [
//             /cky-performance.js/
//         ]
//     },
//     {
//         "name": "analytics",
//         "list": [
//             /analytics/,
//             /googletagmanager.com/,
//             /google-analytics.com/,
//             /cky-analytics.js/,
//             /hotjar.com/,
//             /js.hs-scripts.com/,
//             /js.hs-analytics.net/,
//             /taboola.com/,
//         /analytics.ycdn.de/,
//         /plugins\/activecampaign-subscription-forms/
//         ]
//     },
//     {
//         "name": "advertisement",
//         "list": [
//             /.addthis.com/,
//             /doubleclick.net/,
//             /instagram.com/,
//             /amazon-adsystem.com/,
//             /facebook.*/,
//             /googleadservices.com/,
//             /googlesyndication.com/,
//             /.pinterest.com/,
//             /.linkedin.com/,
//             /.twitter.com/,
//             /youtube.com/,
//             /bluekai.com/,
//             /cky-advertisement.js/
//         ]
//     }
// ];

const categoryScriptsNew = [
    {
      "re": "youtube-nocookie\.com",
      "categories": ["analytics", "functional"]
    },
    {
      "re": "facebook\.*",
      "categories": ["necessary", "functional"]
    },
    {
      "re": "hotjar\.com",
      "categories": ["analytics", "functional"]
    },
    {
      "re": "js\.hs-scripts.com",
      "categories": ["analytics", "functional"]
    },
    {
      "re": "tawk\.to",
      "categories": ["analytics", "functional"]
    },
    {
      "re": "googletagmanager\.com",
      "categories": ["analytics", "functional"]
    },
]

var backupRemovedScripts = {
    blacklisted: []
};
CKY_BLACKLIST = [];
CKY_WHITELIST = [];
var ckyconsent = (getCategoryCookie("cky-consent")) ? getCategoryCookie("cky-consent") : 'no';
var TYPE_ATTRIBUTE = 'javascript/blocked';

if (navigator.doNotTrack == 1) {
    categoryScriptsNew.forEach(function (item) {
       CKY_BLACKLIST.push(new RegExp(item.re));
    });
} else if(cliConfig.options.consentType !== "info") {
    categoryScriptsNew.forEach(function (item) {
      if (item.name === "analytics" && loadAnalyticsByDefault) return;
      if (ckyconsent !== "yes") {
        CKY_BLACKLIST.push(new RegExp(item.re));
        return
      } 
      for(let i = 0; i < item.categories.length ; i++ ) {
        if (getCategoryCookie("cookieyes-" + item.categories[i]) !== "yes") {
          CKY_BLACKLIST.push(new RegExp(item.re));
          break
        }
      }
    });
}

var patterns = {
    blacklist: window.CKY_BLACKLIST,
    whitelist: window.CKY_WHITELIST
};

var isOnBlacklist = function isOnBlacklist(src) {
    return src && (!patterns.blacklist || patterns.blacklist.some(function (pattern) {
        return pattern.test(src);
    }));
};

var isOnWhitelist = function isOnWhitelist(src) {
    return src && (!patterns.whitelist || patterns.whitelist.some(function (pattern) {
        return pattern.test(src);
    }));
};

function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]")
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

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (_ref) {
        var addedNodes = _ref.addedNodes;
        Array.prototype.forEach.call(addedNodes, function (node) {
            if (node.nodeType === 1 && node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
                var src = node.src || '';
                var type = node.type;

                if (node.hasAttribute("data-cookieyes")) {
                    if (getCategoryCookie(node.getAttribute("data-cookieyes")) != 'yes') {
                        var cat = node.getAttribute("data-cookieyes");
                        if(node.src!== '' && typeof node.src!== undefined){
                            var webdetail = new URL(node.src);
                            Array.prototype.push.apply(window.CKY_BLACKLIST, [new RegExp(webdetail.hostname)]);
                            Array.prototype.push.apply(patterns.blacklist, [new RegExp(webdetail.hostname)]);
                            categoryScriptsNew.push(
                                {
                                  "re": webdetail.hostname,
                                  "categories": [cat.replace('cookieyes-', '')]
                            })
                        }
                    }
                }

                if (isOnBlacklist(src) && getCategoryCookie(node.getAttribute("data-cookieyes")) != 'yes') {
                    if (node.tagName === 'IFRAME') {
                        addPlaceholder(node);
                    }

                    node.type = 'javascript/blocked';
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

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

function getCategoryCookie(name) {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : 'no';
}

var createElementBackup = document.createElement;
document.createElement = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }
    if (args[0].toLowerCase() !== 'script')
        return createElementBackup.apply(document, _toConsumableArray(args));
    var scriptElt = createElementBackup.apply(document, _toConsumableArray(args));
    var originalSetAttribute = scriptElt.setAttribute.bind(scriptElt);
    Object.defineProperties(scriptElt, {
        'src': {
            get: function () {
                return scriptElt.getAttribute('src')
            },
            set: function (value) {
                if (isOnBlacklist(value)) {
                    originalSetAttribute('type', TYPE_ATTRIBUTE)
                }
                originalSetAttribute('src', value);
                return true
            }
        },
        'type': {
            set: function (value) {
                var typeValue = isOnBlacklist(scriptElt.src) ? TYPE_ATTRIBUTE : value;
                originalSetAttribute('type', typeValue);
                return true
            }
        }
    });
    scriptElt.setAttribute = function (name, value) {
        if (name === 'type' || name === 'src') {
            scriptElt[name] = value;
            return
        }
        if(name === 'data-cookieyes' && value === 'cookieyes-necessary') originalSetAttribute("type", 'text/javascript');
        HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value);
    }
    return scriptElt;
}

var cookieYes = {

    setCookie: function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else
            var expires = "";
        var cliCookie = name + "=" + value + expires + "; path=/;";
        //var cliCookie = name + "=" + value + expires + "; path=/;SameSite=None;Secure;";        
        document.cookie = cliCookie;
    },

    unblock: function () {

        if (navigator.doNotTrack == 1) return;

        var ckyconsent = (getCategoryCookie("cky-consent")) ? getCategoryCookie("cky-consent") : 'no';

        categoryScriptsNew.forEach(function (item) {

            if ((ckyconsent == 'yes' && !isCategoryAccepted(item)) || 
                (ckyActiveLaw === "ccpa" && getCategoryCookie("cky-consent") === 'no') ||
                (ckyActiveLaw === "ccpa" && !isCategoryAccepted(item))) {
                    CKY_WHITELIST.push(CKY_WHITELIST, new RegExp(item.re));
                    patterns.whitelist.push(new RegExp(item.re));
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
                    if (script.type == 'javascript/blocked') {

                        window.TYPE_ATTRIBUTE = 'text/javascript';

                        script.type = 'text/javascript';
                        var scriptNode = document.createElement('script');
                        scriptNode.src = script.src;
                        scriptNode.type = 'text/javascript';
                        document.head.appendChild(scriptNode);
                        backupRemovedScripts.blacklisted.splice(index - indexOffset, 1);
                        indexOffset++;
                    } else {
                        var frames = document.getElementsByClassName("wt-cli-iframe-placeholder");
                        for (var i = 0; i < frames.length; i++) {
                            if (script.src == frames.item(i).getAttribute('data-src')) {
                                if (isOnWhitelist(script.src)) {
                                    var iframe = document.createElement('iframe');
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
    }
};