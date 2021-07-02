

try {
  bannerActiveCheck();
}
catch (err) {
  console.error(err);
}

let ckyActiveLaw = '';
let ipdata = {}

function ckyCount(callback) {

  if (cliConfig.options.selectedLaws.length !== 2) {
    ckyActiveLaw = cliConfig.options.selectedLaws[0];
    callback(ckyActiveLaw);
  }


  var request = new XMLHttpRequest();
  request.open('GET', 'https://geoip.cookieyes.com/geoip/checker/result.php', true);

  request.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      let data = {}
      try {
        data = JSON.parse(this.response);
      } catch (error) {
        if (cliConfig.options.selectedLaws.length !== 2) {
          displayBanner();
        } else {
          activateGdpr();
        }
        return
      }
      var clientIP = data.ip;
      if (clientIP) { ipdata = { ip: clientIP.substring(0, clientIP.lastIndexOf('.')) + '.0', country_name: data.country_name } }
      var in_EU = data.in_eu;
      var country_name = data.country;
      var region_code = data.region_code
      if (ckyActiveLaw) {
        if (ckyActiveLaw === 'gdpr') {
          var showOnlyInEu = cliConfig.options.geoTarget['gdpr'].eu;
        } else if (ckyActiveLaw === 'ccpa') {
          cookieYes.unblock();
          var showOnlyInCalifornia = cliConfig.options.geoTarget['ccpa'].california;
          var showOnlyInUs = cliConfig.options.geoTarget['ccpa'].us;
        }
        switch (true) {
          case (ckyActiveLaw === 'gdpr' && showOnlyInEu && in_EU === false ||
            ckyActiveLaw === 'ccpa' && showOnlyInCalifornia && country_name !== 'US' && region_code !== 'CA' ||
            ckyActiveLaw === 'ccpa' && showOnlyInUs && country_name !== 'US'): disableBanner();
            break;
          default: displayBanner();
        }
      } else {
        var showOnlyInEu = cliConfig.options.geoTarget['gdpr'].eu;
        var showOnlyInCalifornia = cliConfig.options.geoTarget['ccpa'].california
        var showOnlyInUs = cliConfig.options.geoTarget['ccpa'].us
        switch (true) {
          case (showOnlyInEu && !showOnlyInCalifornia && !showOnlyInUs && in_EU === true ||
            !showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs && country_name !== 'US' ||
            showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs && in_EU === true ||
            !showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs ||
            showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs && in_EU === true): activateGdpr();
            break;
          case (showOnlyInEu && !showOnlyInCalifornia && !showOnlyInUs && country_name === 'US' ||
            !showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs && region_code === 'CA' ||
            showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs && region_code === 'CA' ||
            !showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs && country_name === 'US' ||
            showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs && country_name === 'US') ||
            (!showOnlyInEu && !showOnlyInCalifornia && !showOnlyInUs && region_code === 'CA'): activateCcpa();
            break;
          case (showOnlyInEu && !showOnlyInCalifornia && !showOnlyInUs ||
            showOnlyInEu && showOnlyInCalifornia && !showOnlyInUs ||
            showOnlyInEu && !showOnlyInCalifornia && showOnlyInUs): disableBanner();
            break;
          default: activateGdpr();
        }
      }
      function disableBanner() {
        categoryScripts.forEach(function (item) {
          Array.prototype.push.apply(window.CKY_WHITELIST, item.list);
          Array.prototype.push.apply(patterns.whitelist, item.list);
        });
        window.TYPE_ATTRIBUTE = 'text/javascript';
        window.CKY_BLACKLIST = [];
        var cookieExpiry = cliConfig.options.cookieExpiry === undefined ? 365 : cliConfig.options.cookieExpiry;
        cookieYes.setCookie('cky-action', 'yes', cookieExpiry);
        cookieYes.setCookie('cky-consent', 'yes', cookieExpiry);
        cookieYes.setCookie('cookieyes-analytics', 'yes', cookieExpiry);
        cookieYes.setCookie('cookieyes-functional', 'yes', cookieExpiry);
        cookieYes.setCookie('cookieyes-advertisement', 'yes', cookieExpiry);
        cookieYes.setCookie('cookieyes-performance', 'yes', cookieExpiry);
        cookieYes.unblock();
      }

      function displayBanner() {
        if (document.getElementById('cky-consent')) {
          document.getElementById('cky-consent').style.display = 'block';
        }
      }

      function activateCcpa() {
        ckyActiveLaw = 'ccpa';
        callback(ckyActiveLaw);
        displayBanner();
      }

      function activateGdpr() {
        ckyActiveLaw = 'gdpr';
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




};

function bannerActiveCheck() {
  var isActiveCheckCookiePresent = getCookie('cky-active-check');
  if (!isActiveCheckCookiePresent && window.fetch && window.Promise) {
    fetch('https://active.cookieyes.com/api/a260231864e4c56338cac906/log', { method: 'POST' })
      .catch(function (err) {
        console.error(err);
      });
    setCookie('cky-active-check', 'yes', 1);
  }
}

function getCookie(name) {
  var cookieList = document.cookie.split(';')
    .map(function (cookie) {
      return cookie.split('=');
    })
    .reduce(function (accumulator, cookie) {
      accumulator[cookie[0].trim()] = decodeURIComponent(cookie[1])
      return accumulator
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
    var expires = '; expires=' + date.toGMTString();
  } else var expires = '';
  var cliCookie = name + '=' + value + expires + '; path=/;';
  document.cookie = cliCookie;
}

function randomString(length) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');

  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }

  var str = '';
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
var tldomain = 'jithinmozilor.github.io'; var cliConfig = { "options": { "version": "4.0.0", "selectedLaws": ["gdpr"], "consentType": "implicit", "consentBarType": "classic", "theme": "dark", "plan": "free", "showCategoryDirectly": false, "geoTarget": [], "template": { "id": "classic", "detailType": "sticky", "css": ".cky-consent-bar-trigger, .cky-consent-bar, .cky-modal, .cky-consent-bar-trigger *, .cky-consent-bar *, .cky-modal * { box-sizing: border-box; } .cky-consent-bar-trigger *:focus, .cky-consent-bar *:focus, .cky-modal *:focus { outline: 0; } .cky-consent-bar-trigger { position: fixed; right: 30px; padding: 2px 5px; font-size: 13px; cursor: pointer; font-family: inherit; animation: slide-up 0.4s ease; z-index: 9997; } .cky-consent-bar { font-family: inherit; position: fixed; z-index: 9997; } .cky-consent-bar .cky-consent-title { font-size: 15px; font-weight: bold; margin-bottom: 3px; } .cky-consent-bar p { line-height: 20px; font-size: 13px; font-weight: normal; margin-bottom: 0; margin-top: 0; } .cky-btn { font-size: 12px; padding: .5rem 1rem; background: none; cursor: pointer; display: inline-block; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; line-height: 1; transition: all .15s ease-in-out; margin: 0; min-height: auto; font-weight: normal; border-radius: 0; } .cky-btn:hover { opacity: .8; } .cky-btn:focus { outline: 0; } .cky-button-wrapper .cky-btn { margin-right: 15px; } .cky-button-wrapper .cky-btn:last-child { margin-right: 0; } .cky-btn.cky-btn-custom-accept { margin: 1.5rem 1rem; font-weight: 600; white-space: initial; word-break: break-word; } .cky-btn-readMore { cursor: pointer; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-btn-doNotSell { cursor: pointer; white-space: nowrap; font-weight: bold; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: flex; align-items: center; } .cky-consent-bar.cky-logo-active .cky-logo { margin-right: 30px; } @media (max-width: 540px) { .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: block; } } .cky-tab { display: -ms-flexbox; display: flex; } .cky-tab-menu { flex: 0 0 25%; max-width: 25%; } @media (max-width: 991px) { .cky-tab-menu { flex: 0 0 40%; max-width: 40%; } } .cky-tab-content { flex: 0 0 75%; max-width: 75%; background: transparent; padding: 15px 20px; } @media (max-width: 991px) { .cky-tab-content { flex: 0 0 60%; max-width: 60%; } } @media (max-width: 767px) { .cky-tab-content { padding: 15px; } } .cky-tab-item { font-size: 11px; cursor: pointer; font-weight: normal; border-bottom: 1px solid; border-right: 1px solid; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.5; } @media (max-width: 767px) { .cky-tab-item { font-size: 11px; padding: .75rem .75rem; } } .cky-tab-item-active { cursor: initial; border-right: 0; } .cky-tab-content .cky-tab-desc, .cky-tab-content .cky-tab-desc p { font-size: 12px; } .cky-tab-title { font-size: 13px; margin-bottom: 11px; margin-top: 0; font-family: inherit; font-weight: bold; line-height: 1; display: flex; align-items: center; } .cky-tab-content .cky-tab-content-item:not(.cky-tab-content-active) { display: none; } .cky-category-direct { display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; padding-top: 15px; margin-top: 15px; border-top: 1px solid #d4d8df; } .cky-category-direct .cky-btn-custom-accept { margin: 0 0 0 auto; } .cky-category-direct-item { display: -ms-flexbox; display: flex; -webkit-box-align: center; -ms-flex-align: center; align-items: center; margin-right: 32px; margin-bottom: 15px; } .cky-category-direct-item:last-child { margin-right: 0; } .cky-category-direct-item .cky-switch { margin-left: 0; } .cky-category-direct-item .cky-category-direct-name { margin-left: 10px; font-size: 12px; font-weight: 600; } .cky-category-direct +.cky-detail-wrapper { margin-top: 10px; } .cky-table-wrapper { width: 100%; max-width: 100%; overflow: auto; } .cky-cookie-audit-table { font-family: inherit; border-collapse: collapse; width: 100%; margin-top: 10px; } .cky-cookie-audit-table th { background-color: #d9dfe7; border: 1px solid #cbced6; } .cky-cookie-audit-table td { border: 1px solid #d5d8df; } .cky-cookie-audit-table th, .cky-cookie-audit-table td { text-align: left; padding: 10px; font-size: 12px; color: #000000; word-break:normal; } .cky-cookie-audit-table tr:nth-child(2n+1) td { background: #f1f5fa; } .cky-cookie-audit-table tr:nth-child(2n) td { background: #ffffff; } .cky-audit-table-element h5 { margin: 25px 0 2px 0; } .cky-audit-table-element .cky-table-wrapper { margin-bottom: 1rem; } .cky-consent-bar.cky-rtl { direction: rtl; text-align: right; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn { margin-right: 0; margin-left: 15px; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn:last-child { margin-left: 0; } .cky-consent-bar.cky-rtl .cky-btn-readMore { margin-left: 0; margin-right: 6px; } .cky-consent-bar.cky-rtl.cky-logo-active .cky-logo { margin-right: 0px; margin-left: 30px; } .cky-switch { position: relative; min-height: 13px; padding-left: 25px; font-size: 14px; margin-left: 20px; margin-bottom: 0; display: inline-block; } .cky-switch input[type='checkbox'] { display: none !important; } .cky-switch .cky-slider { background-color: #e3e1e8; border-radius: 34px; height: 13px; width: 25px; bottom: 0; cursor: pointer; left: 0; position: absolute; right: 0; transition: .4s; } .cky-switch .cky-slider:before { background-color: #fff; border-radius: 50%; bottom: 2px; content: ''; height: 9px; left: 2px; position: absolute; transition: .4s; width: 9px; } .cky-switch input:checked+.cky-slider { background-color: #008631; } .cky-switch input:disabled+.cky-slider { cursor: initial; } .cky-switch input:checked+.cky-slider:before { transform: translateX(12px); } .cky-modal.cky-fade .cky-modal-dialog { transition: -webkit-transform .3s ease-out; transition: transform .3s ease-out; transition: transform .3s ease-out, -webkit-transform .3s ease-out; -webkit-transform: translate(0, -25%); transform: translate(0, -25%); } .cky-modal.cky-show .cky-modal-dialog { -webkit-transform: translate(0, 0); transform: translate(0, 0); } .cky-modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9998; background-color: rgba(10, 10, 10, 0.22); display: none; } .cky-modal-backdrop.cky-fade { opacity: 0; } .cky-modal-backdrop.cky-show { opacity: 1; display: block; } .cky-modal { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999; display: none; overflow: hidden; outline: 0; min-height: calc(100% - (.5rem * 2)); } .cky-modal.cky-show { display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; } .cky-modal a { text-decoration: none; } .cky-modal .cky-modal-dialog { position: relative; max-width: calc(100% - 16px); width: calc(100% - 16px); margin: .5rem; pointer-events: none; font-family: inherit; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; text-align: left; display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); -webkit-box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); } @media (min-width: 576px) { .cky-modal .cky-modal-dialog { max-width: 500px; width: 500px; margin: 1.75rem auto; } .cky-modal { min-height: calc(100% - (1.75rem * 2)); } } @media (min-width: 991px) { .cky-modal .cky-modal-dialog { max-width: 900px; width: 900px; } } .cky-modal-content { display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; width: 100%; pointer-events: auto; background-clip: padding-box; border: 0; border-radius: 4px; overflow: hidden; outline: 0; margin: 40px; } .cky-modal.cky-rtl { direction: rtl; text-align: right; } .ccpa.cky-modal .cky-modal-dialog { max-width: 300px; width: 300px; border-radius: 5px; } .ccpa.cky-modal .cky-modal-content { margin: 25px; text-align: center; font-weight: 600; } .ccpa.cky-modal .cky-opt-out-text { margin-bottom: 20px; } .cky-consent-bar .cky-consent-close, .cky-modal .cky-modal-close { z-index: 1; padding: 0; background-color: transparent; border: 0; -webkit-appearance: none; font-size: 12px; line-height: 1; color: #9a9a9a; cursor: pointer; min-height: auto; position: absolute; top: 14px; right: 18px; } .cky-consent-bar.cky-classic { width: 100%; display: block; box-shadow: 0 -1px 10px 0 rgba(172, 171, 171, 0.3); } .cky-classic .cky-content-wrapper { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; justify-content: space-between; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; } .cky-classic .cky-button-wrapper { margin-left: 20px; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; flex-wrap: nowrap; } .cky-consent-bar.cky-classic p { text-align: left; } .cky-classic .cky-btn-settings { margin-left: auto; position: relative; padding-right: 1rem; } .cky-classic .cky-btn-settings:before { border-style: solid; border-width: 1px 1px 0 0; content: ''; display: inline-block; height: 4px; right: 8px; position: absolute; border-color: #beb8b8; top: 11px; transform: rotate(135deg); vertical-align: middle; width: 4px; } .cky-classic .cky-btn-settings[expanded]:before { transform: rotate(-45deg); } .cky-classic .cky-consent-bar.cky-rtl .cky-button-wrapper { margin-left: 0; margin-right: 20px; } .cky-classic .cky-consent-bar.cky-rtl p { text-align: right; } @media(min-width: 991px) { .cky-consent-bar.cky-classic { padding: 15px 50px; } } @media(min-width: 1150px) { .cky-consent-bar.cky-classic { padding: 15px 130px; } } @media(min-width: 1415px) { .cky-consent-bar.cky-classic { padding: 15px 160px; } } @media (max-width: 991px) { .cky-classic .cky-button-wrapper { margin-left: 0; margin-top: 20px; } .cky-consent-bar.cky-classic, .cky-consent-bar.cky-classic p, .cky-classic .cky-button-wrapper, .cky-classic .cky-content-wrapper { display: block; text-align: center; } } .cky-detail-wrapper { margin-top: 30px; border: 1px solid #d4d8df; border-radius: 2px; overflow: hidden; } .cky-tab-content { width: 100%; } .cky-tab-item { padding: .5rem 1rem; align-items: center; } .cky-tab-content .cky-tab-desc { min-height: 155px; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } @media (max-width: 767px) { .cky-tab-content .cky-tab-desc { max-height: 155px; } } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-switch { margin-left: 0; margin-right: 20px; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item { border-right: none; border-left: 1px solid; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item.cky-tab-item-active { border-left: 0; }" }, "customCss": null, "colors": [], "position": "bottom", "content": [], "display": [], "behaviour": { "reload": false, "acceptOnScroll": false, "defaultConsent": false, "showLogo": true, "showAuditTable": true, "selectedLanguage": "en" }, "tldomain": "jithinmozilor.github.io" }, "info": { "privacyPolicy": { "title": { "en": "Privacy Policy", "fr": "Politique de confidentialit\u00e9", "it": "politica sulla riservatezza", "es": "Pol\u00edtica de privacidad", "nl": "Privacybeleid", "da": "Fortrolighedspolitik", "ar": "\u0633\u064a\u0627\u0633\u0629 \u062e\u0627\u0635\u0629" }, "text": { "en": "<p>This website uses cookies to improve your experience while you navigate through the website. Out of these cookies, the cookies that are categorized as necessary are stored on your browser as they as essential for the working of basic functionalities of the website. <\/p><p>We also use third-party cookies that help us analyze and understand how you use this website, to store user preferences and provide them with content and advertisements that are relevant to you. These cookies will only be stored on your browser with your consent to do so. You also have the option to opt-out of these cookies.But opting out of some of these cookies may have an effect on your browsing experience.<\/p>", "fr": "<p>Ce site utilise des cookies pour am\u00e9liorer votre exp\u00e9rience de navigation sur le site. Hors de ces cookies, les cookies class\u00e9s comme n\u00e9cessaires sont stock\u00e9s dans votre navigateur car ils sont essentiels au fonctionnement des fonctionnalit\u00e9s de base du site. Nous utilisons \u00e9galement des cookies tiers qui nous aident \u00e0 analyser et \u00e0 comprendre comment vous utilisez ce site Web, \u00e0 stocker les pr\u00e9f\u00e9rences de l'utilisateur et \u00e0 lui fournir un contenu et des publicit\u00e9s pertinents pour vous.<\/p><p>Ces cookies ne seront stock\u00e9s sur votre navigateur qu'avec votre consentement.Vous avez \u00e9galement la possibilit\u00e9 de d\u00e9sactiver ces cookies.Toutefois, la d\u00e9sactivation de certains de ces cookies peut avoir une incidence sur votre exp\u00e9rience de navigation.<\/p>", "it": "<p>Questo sito Web utilizza i cookie per migliorare la tua esperienza durante la navigazione nel sito Web. Di questi cookie, i cookie classificati come necessari vengono memorizzati nel browser in quanto essenziali per il funzionamento delle funzionalit\u00e0 di base del sito Web. Utilizziamo anche cookie di terze parti che ci aiutano ad analizzare e comprendere come utilizzi questo sito Web, per memorizzare le preferenze degli utenti e fornire loro contenuti e pubblicit\u00e0 pertinenti per te.<\/p><p>Questi cookie verranno memorizzati sul tuo browser solo con il tuo consenso. Hai anche la possibilit\u00e0 di disattivare questi cookie. La disattivazione di alcuni di questi cookie pu\u00f2 influire sulla tua esperienza di navigazione.<\/p>", "es": "<p>Este sitio web utiliza cookies para mejorar su experiencia mientras navega por el sitio web. Fuera de estas cookies, las cookies que se clasifican como necesarias se almacenan en su navegador, ya que son esenciales para el funcionamiento de las funcionalidades b\u00e1sicas del sitio web. Tambi\u00e9n utilizamos cookies de terceros que nos ayudan a analizar y comprender c\u00f3mo utiliza este sitio web para almacenar las preferencias de los usuarios y proporcionarles contenido y anuncios que sean relevantes para usted.<\/p><p>Estas cookies solo se almacenar\u00e1n en su navegador con su consentimiento para hacerlo. Tambi\u00e9n tiene la opci\u00f3n de optar por no recibir estas cookies. Sin embargo, la exclusi\u00f3n de algunas de estas cookies puede afectar su experiencia de navegaci\u00f3n.<\/p>", "nl": "<p>Deze website maakt gebruik van cookies om uw ervaring te verbeteren terwijl u door de website navigeert. Van deze cookies worden de cookies die als noodzakelijk zijn gecategoriseerd, in uw browser opgeslagen omdat ze essentieel zijn voor de werking van de basisfuncties van de website. We gebruiken ook cookies van derden die ons helpen analyseren en begrijpen hoe u deze website gebruikt, om gebruikersvoorkeuren op te slaan en hen te voorzien van inhoud en advertenties die voor u relevant zijn.<\/p><p>Deze cookies worden alleen in uw browser opgeslagen met uw toestemming om dit te doen. U hebt ook de optie om u af te melden voor deze cookies.<\/p><p>Het afmelden voor sommige van deze cookies kan echter een effect hebben op uw browse-ervaring.<\/p>", "da": "<p>Dette websted bruger cookies til at forbedre din oplevelse, mens du navigerer gennem webstedet. Ud af disse cookies gemmes de cookies, der er kategoriseret efter behov, i din browser, da de er v\u00e6sentlige for, at websitetens grundl\u00e6ggende funktionaliteter fungerer. <\/p><p>Vi bruger ogs\u00e5 tredjepartscookies, der hj\u00e6lper os med at analysere og forst\u00e5, hvordan du bruger dette websted, til at gemme brugerpr\u00e6ferencer og give dem indhold og reklamer, der er relevante for dig. Disse cookies gemmes kun i din browser med dit samtykke hertil. Du har ogs\u00e5 muligheden for at frav\u00e6lge disse cookies. Men at frav\u00e6lge nogle af disse cookies kan have en indvirkning p\u00e5 din browseroplevelse.<\/p>", "ar": "<p>\u064a\u0633\u062a\u062e\u062f\u0645 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628 \u0647\u0630\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0644\u062a\u062d\u0633\u064a\u0646 \u062a\u062c\u0631\u0628\u062a\u0643 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u062a\u0646\u0642\u0644 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639. \u0645\u0646 \u0628\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u060c \u064a\u062a\u0645 \u062a\u062e\u0632\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0645\u0635\u0646\u0641\u0629 \u062d\u0633\u0628 \u0627\u0644\u0636\u0631\u0648\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0627\u0644\u062e\u0627\u0635 \u0628\u0643 \u0644\u0623\u0646\u0647\u0627 \u0636\u0631\u0648\u0631\u064a\u0629 \u0644\u0639\u0645\u0644 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0644\u0644\u0645\u0648\u0642\u0639. <\/p><p>\u0646\u0633\u062a\u062e\u062f\u0645 \u0623\u064a\u0636\u064b\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062b\u0627\u0644\u062b \u0627\u0644\u062a\u064a \u062a\u0633\u0627\u0639\u062f\u0646\u0627 \u0639\u0644\u0649 \u062a\u062d\u0644\u064a\u0644 \u0648\u0641\u0647\u0645 \u0643\u064a\u0641\u064a\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u060c \u0644\u062a\u062e\u0632\u064a\u0646 \u062a\u0641\u0636\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0648\u062a\u0632\u0648\u064a\u062f\u0647\u0645 \u0628\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0630\u0627\u062a \u0627\u0644\u0635\u0644\u0629 \u0628\u0643. \u0633\u064a\u062a\u0645 \u062a\u062e\u0632\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0641\u0642\u0637 \u0639\u0644\u0649 \u0645\u062a\u0635\u0641\u062d\u0643 \u0628\u0645\u0648\u0627\u0641\u0642\u062a\u0643 \u0639\u0644\u0649 \u0627\u0644\u0642\u064a\u0627\u0645 \u0628\u0630\u0644\u0643. \u0644\u062f\u064a\u0643 \u0623\u064a\u0636\u064b\u0627 \u062e\u064a\u0627\u0631 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0645\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647. \u0644\u0643\u0646 \u0625\u0644\u063a\u0627\u0621 \u0627\u0634\u062a\u0631\u0627\u0643 \u0628\u0639\u0636 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0642\u062f \u064a\u0643\u0648\u0646 \u0644\u0647 \u062a\u0623\u062b\u064a\u0631 \u0639\u0644\u0649 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u062a\u0635\u0641\u062d \u0644\u062f\u064a\u0643.<\/p>" } }, "categories": [{ "id": 15776, "name": { "en": "Necessaryy", "fr": "N\u00e9cessaire", "it": "Necessaria", "es": "Necesaria", "nl": "Noodzakelijk", "da": "N\u00f8dvendig", "ar": "\u0636\u0631\u0648\u0631\u064a" }, "description": { "en": "<p>Necessary cookies are crucial for the basic functions of the website and the website will not work in its intended way without them.<\/p> <p>These cookies do not store any personally identifiable data.<\/p>", "fr": "<p>Les cookies n\u00e9cessaires sont cruciaux pour les fonctions de base du site Web et celui-ci ne fonctionnera pas comme pr\u00e9vu sans eux.<\/p><p>Ces cookies ne stockent aucune donn\u00e9e personnellement identifiable.<\/p>", "it": "<p>I cookie necessari sono fondamentali per le funzioni di base del sito Web e il sito Web non funzioner\u00e0 nel modo previsto senza di essi.<\/p><p>Questi cookie non memorizzano dati identificativi personali.<\/p>", "es": "<p>Las cookies necesarias son cruciales para las funciones b\u00e1sicas del sitio web y el sitio web no funcionar\u00e1 de la forma prevista sin ellas.<\/p><p>Estas cookies no almacenan ning\u00fan dato de identificaci\u00f3n personal.<\/p>", "nl": "<p>Noodzakelijke cookies zijn cruciaal voor de basisfuncties van de website en zonder deze werkt de website niet op de beoogde manier.<\/p><p>Deze cookies slaan geen persoonlijk identificeerbare gegevens op.<\/p>", "da": "<p>N\u00f8dvendige cookies er afg\u00f8rende for de grundl\u00e6ggende funktioner p\u00e5 webstedet, og webstedet fungerer ikke p\u00e5 sin tilsigtede m\u00e5de uden dem.<\/p><p>Disse cookies gemmer ikke personligt identificerbare data.<\/p>", "ar": "<p>\u062a\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0636\u0631\u0648\u0631\u064a\u0629 \u0636\u0631\u0648\u0631\u064a\u0629 \u0644\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0644\u0646 \u064a\u0639\u0645\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0627\u0644\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0645\u0642\u0635\u0648\u062f\u0629 \u0628\u062f\u0648\u0646\u0647\u0627.<\/p> <p>\u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0644\u0627 \u062a\u062e\u0632\u0646 \u0623\u064a \u0628\u064a\u0627\u0646\u0627\u062a \u0634\u062e\u0635\u064a\u0629.<\/p>" }, "slug": "necessary", "type": 1, "status": 1, "active": 1, "order": 1, "website_id": 8677, "settings": { "ccpa": { "doNotSell": false } }, "created_at": "2021-03-30 11:49:25", "updated_at": "2021-06-28 06:34:10", "cookies": [{ "id": 6956, "cookie_id": "123", "description": { "en": "This is cookie which is present in the domain abcd.com", "fr": "abcd", "it": "abcd", "es": "abcd", "nl": "abcd", "da": "abcd", "ar": "abcd" }, "type": 0, "category_id": 15776, "duration": "365", "domain": "abcd.com", "website_id": 8677, "script_slug": null, "url_pattern": "abcd.com", "created_from_scan": 1, "url_pattern_updated": 0, "created_at": "2021-06-09 04:05:19", "updated_at": "2021-06-09 04:14:47", "data_migrated_at": null }], "scripts": [] }, { "id": 15777, "name": { "en": "Functional", "fr": "Fonctionnelle", "it": "Funzionale", "es": "Funcional", "nl": "functioneel", "da": "Funktionel", "ar": "\u0648\u0638\u064a\u0641\u064a" }, "description": { "en": "<p>Functional cookies help to perform certain functionalities like sharing the content of the website on social media platforms, collect feedbacks, and other third-party features.<\/p>", "fr": "<p>Les cookies fonctionnels permettent d'ex\u00e9cuter certaines fonctionnalit\u00e9s telles que le partage du contenu du site Web sur des plateformes de m\u00e9dias sociaux, la collecte de commentaires et d'autres fonctionnalit\u00e9s tierces.<\/p>", "it": "<p>I cookie funzionali aiutano a svolgere determinate funzionalit\u00e0 come la condivisione del contenuto del sito Web su piattaforme di social media, la raccolta di feedback e altre funzionalit\u00e0 di terze parti.<\/p>", "es": "<p>Las cookies funcionales ayudan a realizar ciertas funcionalidades, como compartir el contenido del sitio web en plataformas de redes sociales, recopilar comentarios y otras caracter\u00edsticas de terceros.<\/p>", "nl": "<p>Functionele cookies helpen bepaalde functionaliteiten uit te voeren, zoals het delen van de inhoud van de website op sociale mediaplatforms, het verzamelen van feedback en andere functies van derden.<\/p>", "da": "<p>Funktionelle cookies hj\u00e6lper med at udf\u00f8re visse funktionaliteter, som at dele indholdet af webstedet p\u00e5 sociale medieplatforme, indsamle feedbacks og andre tredjepartsfunktioner.<\/p>", "ar": "<p>\u062a\u0633\u0627\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629 \u0639\u0644\u0649 \u0623\u062f\u0627\u0621 \u0648\u0638\u0627\u0626\u0641 \u0645\u0639\u064a\u0646\u0629 \u0645\u062b\u0644 \u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0645\u0646\u0635\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a \u060c \u0648\u062c\u0645\u0639 \u0627\u0644\u062a\u0639\u0644\u064a\u0642\u0627\u062a \u060c \u0648\u063a\u064a\u0631\u0647\u0627 \u0645\u0646 \u0645\u064a\u0632\u0627\u062a \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062b\u0627\u0644\u062b.<\/p>" }, "slug": "functional", "type": 2, "status": 0, "active": 0, "order": 2, "website_id": 8677, "settings": { "ccpa": { "doNotSell": false } }, "created_at": "2021-03-30 11:49:25", "updated_at": "2021-06-28 06:34:10", "cookies": [], "scripts": [] }, { "id": 15778, "name": { "en": "Analytics", "fr": "Analytique", "it": "analitica", "es": "Anal\u00edtica", "nl": "Analytics", "da": "Analytics", "ar": "\u062a\u062d\u0644\u064a\u0644\u0627\u062a" }, "description": { "en": "<p>Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.<\/p>", "fr": "<p>Les cookies analytiques sont utilis\u00e9s pour comprendre comment les visiteurs interagissent avec le site Web. Ces cookies aident \u00e0 fournir des informations sur le nombre de visiteurs, le taux de rebond, la source de trafic, etc.<\/p>", "it": "<p>I cookie analitici vengono utilizzati per comprendere come i visitatori interagiscono con il sito Web. Questi cookie aiutano a fornire informazioni sulle metriche di numero di visitatori, frequenza di rimbalzo, fonte di traffico, ecc.<\/p>", "es": "<p>Las cookies anal\u00edticas se utilizan para comprender c\u00f3mo interact\u00faan los visitantes con el sitio web. Estas cookies ayudan a proporcionar informaci\u00f3n sobre m\u00e9tricas el n\u00famero de visitantes, el porcentaje de rebote, la fuente de tr\u00e1fico, etc.<\/p>", "nl": "<p>Analytische cookies worden gebruikt om te begrijpen hoe bezoekers omgaan met de website. Deze cookies helpen informatie te verstrekken over de statistieken van het aantal bezoekers, het bouncepercentage, de verkeersbron, enz.<\/p>", "da": "<p>Analytiske cookies bruges til at forst\u00e5, hvordan bes\u00f8gende interagerer med webstedet. Disse cookies hj\u00e6lper med at give information om m\u00e5linger af antallet af bes\u00f8gende, afvisningsprocent, trafikskilde osv.<\/p>", "ar": "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u064a\u0629 \u0644\u0641\u0647\u0645 \u0643\u064a\u0641\u064a\u0629 \u062a\u0641\u0627\u0639\u0644 \u0627\u0644\u0632\u0648\u0627\u0631 \u0645\u0639 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628. \u062a\u0633\u0627\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0641\u064a \u062a\u0648\u0641\u064a\u0631 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0646 \u0627\u0644\u0645\u0642\u0627\u064a\u064a\u0633 \u0648\u0639\u062f\u062f \u0627\u0644\u0632\u0648\u0627\u0631 \u0648\u0645\u0639\u062f\u0644 \u0627\u0644\u0627\u0631\u062a\u062f\u0627\u062f \u0648\u0645\u0635\u062f\u0631 \u0627\u0644\u062d\u0631\u0643\u0629 \u0648\u0645\u0627 \u0625\u0644\u0649 \u0630\u0644\u0643.<\/p>" }, "slug": "analytics", "type": 2, "status": 0, "active": 1, "order": 3, "website_id": 8677, "settings": { "ccpa": { "doNotSell": false } }, "created_at": "2021-03-30 11:49:25", "updated_at": "2021-06-28 06:34:10", "cookies": [{ "id": 6955, "cookie_id": "123", "description": { "en": "xzzxcx", "fr": "xzzxcx", "it": "xzzxcx", "es": "xzzxcx", "nl": "xzzxcx", "da": "xzzxcx", "ar": "xzzxcx" }, "type": 0, "category_id": 15778, "duration": "365", "domain": "sasa", "website_id": 8677, "script_slug": null, "url_pattern": null, "created_from_scan": 0, "url_pattern_updated": 0, "created_at": "2021-06-09 04:01:57", "updated_at": "2021-06-09 04:01:57", "data_migrated_at": null }], "scripts": [] }, { "id": 15779, "name": { "en": "Performance", "fr": "les r\u00e9sultats", "it": "il rendimento", "es": "el rendimiento", "nl": "Prestatie", "da": "Ydeevne", "ar": "\u0623\u062f\u0627\u0621" }, "description": { "en": "<p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.<\/p>", "fr": "<p>Les cookies de performance sont utilis\u00e9s pour comprendre et analyser les indices de performance cl\u00e9s du site Web, ce qui permet de fournir une meilleure exp\u00e9rience utilisateur aux visiteurs.<\/p>", "it": "<p>I cookie per le prestazioni vengono utilizzati per comprendere e analizzare gli indici di prestazione chiave del sito Web che aiutano a fornire ai visitatori un'esperienza utente migliore.<\/p>", "es": "<p>Las cookies de rendimiento se utilizan para comprender y analizar los \u00edndices de rendimiento clave del sitio web, lo que ayuda a proporcionar una mejor experiencia de usuario para los visitantes.<\/p>", "nl": "<p>Prestatiecookies worden gebruikt om de belangrijkste prestatie-indexen van de website te begrijpen en te analyseren, wat helpt bij het leveren van een betere gebruikerservaring voor de bezoekers.<\/p>", "da": "<p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.<\/p>", "ar": "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0627\u0644\u0623\u062f\u0627\u0621 \u0644\u0641\u0647\u0645 \u0648\u062a\u062d\u0644\u064a\u0644 \u0641\u0647\u0627\u0631\u0633 \u0627\u0644\u0623\u062f\u0627\u0621 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 \u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628 \u0648\u0627\u0644\u062a\u064a \u062a\u0633\u0627\u0639\u062f \u0641\u064a \u062a\u0642\u062f\u064a\u0645 \u062a\u062c\u0631\u0628\u0629 \u0645\u0633\u062a\u062e\u062f\u0645 \u0623\u0641\u0636\u0644 \u0644\u0644\u0632\u0627\u0626\u0631\u064a\u0646.<\/p>" }, "slug": "performance", "type": 2, "status": 0, "active": 1, "order": 4, "website_id": 8677, "settings": { "ccpa": { "doNotSell": false } }, "created_at": "2021-03-30 11:49:25", "updated_at": "2021-06-28 06:34:10", "cookies": [], "scripts": [] }, { "id": 15780, "name": { "en": "Advertisement", "fr": "Publicit\u00e9", "it": "la pubblicit\u00e0", "es": "Anuncio", "nl": "Advertentie", "da": "Reklame", "ar": "\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a" }, "description": { "en": "<p>Advertisement cookies are used to deliver visitors with customized advertisements based on the pages they visited before and analyze the effectiveness of the ad campaign.<\/p>", "fr": "<p>Les cookies de publicit\u00e9 sont utilis\u00e9s pour fournir aux visiteurs des publicit\u00e9s personnalis\u00e9es bas\u00e9es sur les pages visit\u00e9es pr\u00e9c\u00e9demment et analyser l'efficacit\u00e9 de la campagne publicitaire.<\/p>", "it": "<p>I cookie pubblicitari vengono utilizzati per fornire ai visitatori annunci pubblicitari personalizzati in base alle pagine visitate in precedenza e per analizzare l'efficacia della campagna pubblicitaria.<\/p>", "es": "<p>Las cookies publicitarias se utilizan para entregar a los visitantes anuncios personalizados basados \u200b\u200ben las p\u00e1ginas que visitaron antes y analizar la efectividad de la campa\u00f1a publicitaria.<\/p>", "nl": "<p>Advertentiecookies worden gebruikt om bezoekers gepersonaliseerde advertenties te bezorgen op basis van de eerder bezochte pagina's en om de effectiviteit van de advertentiecampagne te analyseren.<\/p>", "da": "<p>Annonce-cookies bruges til at levere bes\u00f8gende med tilpassede reklamer baseret p\u00e5 de sider, de har bes\u00f8gt f\u00f8r, og analysere effektiviteten af \u200b\u200bannoncekampagnen.<\/p>", "ar": "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0644\u062a\u0632\u0648\u064a\u062f \u0627\u0644\u0632\u0627\u0626\u0631\u064a\u0646 \u0628\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u062e\u0635\u0635\u0629 \u0627\u0633\u062a\u0646\u0627\u062f\u064b\u0627 \u0625\u0644\u0649 \u0627\u0644\u0635\u0641\u062d\u0627\u062a \u0627\u0644\u062a\u064a \u0632\u0627\u0631\u0648\u0647\u0627 \u0645\u0646 \u0642\u0628\u0644 \u0648\u062a\u062d\u0644\u064a\u0644 \u0641\u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u062d\u0645\u0644\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064a\u0629.<\/p>" }, "slug": "advertisement", "type": 2, "status": 0, "active": 1, "order": 5, "website_id": 8677, "settings": { "ccpa": { "doNotSell": false } }, "created_at": "2021-03-30 11:49:25", "updated_at": "2021-06-28 06:34:10", "cookies": [], "scripts": [] }] } }; var cookieyesID = btoa(randomString(32));//btoa(+new Date);
let loadAnalyticsByDefault = false; let isBannerLoadedOnce = false; cliConfig.info.categories.forEach(function (category) { if (category.slug === 'analytics' && category.settings !== null && "loadAnalyticsByDefault" in category.settings) { loadAnalyticsByDefault = category.settings.loadAnalyticsByDefault; } })
window.addEventListener('load', function () {
  if (isBannerLoadedOnce) return
  isBannerLoadedOnce = true; var createBannerOnLoad = function createBannerOnLoad(ckyActiveLaw) {
    Element.prototype.remove = Element.prototype.remove || function () { this.parentElement.removeChild(this); }
    NodeList.prototype.remove = HTMLCollection.prototype.remove = function () { for (var i = this.length - 1; i >= 0; i--) { if (this[i] && this[i].parentElement) { this[i].parentElement.removeChild(this[i]); } } }
    var options = cliConfig.options; var content = options.content; var display = options.display; var info = cliConfig.info; var categories = info.categories; var privacyPolicy = info.privacyPolicy; var template = options.template; var colors = options.colors; var behaviour = options.behaviour; var selectedLanguage = behaviour.selectedLanguage; selectedLanguage = checkSelectedLanguage(selectedLanguage, ckyActiveLaw); var position = options.position; var body = document.body || document.getElementsByTagName('body')[0]; appendStyle(); var cookieExpiry = options.cookieExpiry === undefined ? 365 : options.cookieExpiry; var cookie = {
      ACCEPT_COOKIE_EXPIRE: cookieExpiry, set: function (name, value, days) {
        if (days) { var date = new Date(); date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); var expires = "; expires=" + date.toGMTString(); } else
          var expires = ""; var cliCookie = name + "=" + value + expires + "; path=/;domain=." + tldomain; document.cookie = cliCookie;
      }, read: function (cname) {
        var name = cname + "="; var decodedCookie = decodeURIComponent(document.cookie); var ca = decodedCookie.split(';'); for (var i = 0; i < ca.length; i++) {
          var c = ca[i]; while (c.charAt(0) == ' ') { c = c.substring(1); }
          if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
        }
        return "";
      }, erase: function (name) { this.set(name, "", -1); }, exists: function (name) { return (this.read(name) !== null); }
    }; var bannerFunctions = { "accept": function () { acceptCookies("all"); }, "reject": function () { rejectCookies(); }, "settings": function () { switch (template.detailType) { case "sticky": showHideStickyDetail(); break; case "popup": showPopupDetail(); } }, "doNotSell": function () { ccpaShowPopupDetail(); } }
    var positionValue = { "bottom": { "top": "auto", "right": "0", "bottom": "0", "left": "auto" }, "top": { "top": "0", "right": "0", "bottom": "auto", "left": "auto" }, "bottom-left": { "top": "auto", "right": "auto", "bottom": "20px", "left": "20px" }, "bottom-right": { "top": "auto", "right": "20px", "bottom": "20px", "left": "auto" }, "top-left": { "top": "20px", "right": "auto", "bottom": "auto", "left": "20px" }, "top-right": { "top": "20px", "right": "20px", "bottom": "auto", "left": "auto" } }
    function getById(element) { return document.getElementById(element); }
    function getByClass(element) { return document.getElementsByClassName(element); }
    function renderBanner() {
      createBanner(); if (selectedLanguage == "ar") { document.getElementById("cky-consent").classList.add("cky-rtl"); if (options.consentBarType == "banner" || options.consentBarType == "box") { setTimeout(function () { document.getElementById("cky-settings-popup").classList.add("cky-rtl"); }, 100); } }
      getById("cky-consent").classList.add("cky-" + options.consentBarType); if (options.consentBarType == "box") { getById("cky-consent").classList.add("box-" + options.position); }
      if (!!content[ckyActiveLaw].customLogoUrl) { appendLogo(); }
      appendText(); if (options.showCategoryDirectly) { renderCategoryBar(); }
      renderButtons();
    }
    // if (options.display[ckyActiveLaw].notice) {
    //   if (cookie.read("cky-action") === '') {
    //     if (cookie.read('cookieyesID') === '') { cookie.set('cookieyesID', cookieyesID, cookie.ACCEPT_COOKIE_EXPIRE); }
    //     renderBanner(); setInitialCookies();
    //   } else { if (display[ckyActiveLaw].noticeToggler) { showToggler(); } }
    // }
    if ((cookie.read("cky-consent") === 'yes')) { checkAndInsertScripts(info.categories); }
    function createBanner() {
      var consentBar; if (!!content[ckyActiveLaw].customLogoUrl) {
        consentBar = '<div class="cky-consent-bar" id="cky-consent">\
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
      body.insertAdjacentHTML('beforeend', consentBar); document.getElementById('cky-consent').style.display = 'block'; ckyConsentBar = getById("cky-consent"); ckyConsentBar.style.background = colors[ckyActiveLaw].notice.bg; ckyConsentBar.style.color = colors[ckyActiveLaw].notice.textColor; ckyConsentBar.style.borderWidth = "1px"; ckyConsentBar.style.borderStyle = "solid"; ckyConsentBar.style.borderColor = colors[ckyActiveLaw].notice.borderColor; ckyConsentBar.style.top = positionValue[position].top; ckyConsentBar.style.right = positionValue[position].right; ckyConsentBar.style.bottom = positionValue[position].bottom; ckyConsentBar.style.left = positionValue[position].left; if (ckyActiveLaw === 'gdpr') { if (cliConfig.options.geoTarget['gdpr'].eu && cookie.read("cky-action") !== "yes") { document.getElementById("cky-consent").style.display = "none"; } } else if (ckyActiveLaw === 'ccpa') { const ccpaCloseBtn = '<button type="button" class="cky-consent-close" id="ckyCcpaModalClose"><img src="https://cdn-cookieyes.com/assets/images/icons/close.svg" style="width: 9px" alt="consent-close-icon"></button>'; document.querySelector("#cky-consent").insertAdjacentHTML("afterbegin", ccpaCloseBtn); document.querySelector("#cky-consent #ckyCcpaModalClose").onclick = showToggler; if ((cliConfig.options.geoTarget['ccpa'].california || cliConfig.options.geoTarget['ccpa'].us) && cookie.read("cky-action") !== "yes") { document.getElementById("cky-consent").style.display = "none"; } }
    }
    function appendLogo() {
      getById("cky-consent").classList.add('cky-logo-active'); var consentLogo = '<img src="' + content[ckyActiveLaw].customLogoUrl + '" class="img-fluid cky-logo" style="width: 100px" alt="Brand logo">'
      document.querySelector("#cky-consent #cky-content-logo").insertAdjacentHTML("afterbegin", consentLogo);
    }
    function appendText() {
      if ((content[ckyActiveLaw].title[selectedLanguage] !== null) && (/\S/.test(content[ckyActiveLaw].title[selectedLanguage]))) { var consentTitle = '<div class="cky-consent-title" style="color:' + colors[ckyActiveLaw].notice.titleColor + '">' + content[ckyActiveLaw].title[selectedLanguage] + '</div>'; if (!!content[ckyActiveLaw].customLogoUrl) { document.querySelector("#cky-consent #cky-content-logo-inner-wrapper").insertAdjacentHTML("afterbegin", consentTitle); } else { getById("cky-consent").insertAdjacentHTML("afterbegin", consentTitle); } }
      var consentText = '<p class="cky-bar-text" style="color:' + colors[ckyActiveLaw].notice.textColor + '">' + content[ckyActiveLaw].text[selectedLanguage] + '</p>'; getById("cky-consent").getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML('beforeend', consentText);
    }
    function renderCategoryBar() {
      var categoryDirectList = '<div class="cky-category-direct" id="cky-category-direct" style="color:' + colors[ckyActiveLaw].notice.textColor + '"></div>'; if (options.consentBarType === 'box') { getById("cky-consent").getElementsByClassName("cky-bar-text")[0].insertAdjacentHTML('afterend', categoryDirectList); } else { getById("cky-consent").getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML('afterend', categoryDirectList); }
      for (var i = 0; i < categories.length; i++) { var category = categories[i]; var categoryBarItem = '<div class="cky-category-direct-item"><span class="cky-category-direct-name" id="cky-category-direct-' + category.name[selectedLanguage] + '">' + category.name[selectedLanguage] + '</span></div>'; document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML('beforeend', categoryBarItem); createSwitches(category); }
    }
    function renderButtons() {
      ckyConsentBar.getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML('beforeend', '<div class="cky-button-wrapper"></div>'); if (display[ckyActiveLaw].buttons['settings']) { appendButton('settings'); switchStickyOrPopup(); }
      if (display[ckyActiveLaw].buttons['reject']) { appendButton('reject'); }
      if (display[ckyActiveLaw].buttons['accept']) { appendButton('accept'); }
      if (display[ckyActiveLaw].buttons['doNotSell']) { var doNotSellButton = '<a class="cky-btn-doNotSell" id="cky-btn-doNotSell">' + content[ckyActiveLaw].buttons['doNotSell'][selectedLanguage] + '</a>'; document.querySelector("#cky-consent .cky-button-wrapper").insertAdjacentHTML('beforeend', doNotSellButton); document.querySelector("#cky-consent #cky-btn-doNotSell").onclick = bannerFunctions['doNotSell']; renderCcpaPopupDetail(); attachButtonStyles('doNotSell'); }
      if (display[ckyActiveLaw].buttons['readMore']) {
        let privacyLink = content[ckyActiveLaw].privacyPolicyLink[selectedLanguage].trim().replace(/\s/g, ''); if (/^(:\/\/)/.test(privacyLink)) { privacyLink = 'http' + privacyLink + ''; }
        if (!/^(f|ht)tps?:\/\//i.test(privacyLink)) { privacyLink = 'http://' + privacyLink + ''; }
        var readMoreButton = '<a class="cky-btn-readMore" rel="noreferrer" id="cky-btn-readMore" href="' + privacyLink + '" target="_blank">' + content[ckyActiveLaw].buttons['readMore'][selectedLanguage] + '</a>'; document.querySelector("#cky-consent .cky-bar-text").insertAdjacentHTML('beforeend', readMoreButton); attachButtonStyles('readMore');
      }
    }
    function appendButton(btnName) { let button = '<button class="cky-btn cky-btn-' + btnName + '" id="cky-btn-' + btnName + '">' + content[ckyActiveLaw].buttons[btnName][selectedLanguage] + '</button>'; document.querySelector("#cky-consent .cky-button-wrapper").insertAdjacentHTML('beforeend', button); attachButtonStyles(btnName); document.querySelector("#cky-consent #cky-btn-" + btnName + "").onclick = bannerFunctions[btnName]; }
    function attachButtonStyles(btnName) {
      document.querySelector("#cky-consent #cky-btn-" + btnName + "").style = "\
              color: "+ colors[ckyActiveLaw].buttons[btnName].textColor + ";\
              background-color: "+ colors[ckyActiveLaw].buttons[btnName].bg + ";\
              border-color: "+ colors[ckyActiveLaw].buttons[btnName].borderColor + ";\
          ";
    }
    function switchStickyOrPopup() { switch (template.detailType) { case "sticky": document.querySelector("#cky-consent #cky-btn-settings").style.borderColor = "transparent"; renderStickyDetail(); break; case "popup": renderPopupDetail(); } }
    function renderStickyDetail() {
      var tabCss = "color:" + colors[ckyActiveLaw].popup.pills.textColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + ""; var activeTabCss = "background-color:" + colors[ckyActiveLaw].popup.pills.activeBg + ";" + "color:" + colors[ckyActiveLaw].popup.pills.activeTextColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + ";"; var ckyDetailWrapper = '<div class="cky-detail-wrapper" id="cky-detail-wrapper" style="border-color:' + colors[ckyActiveLaw].notice.borderColor + '">\
                                          <div class="cky-tab">\
                                              <div class="cky-tab-menu" id="cky-tab-menu" style="background-color:'+ colors[ckyActiveLaw].popup.pills.bg + '"></div>\
                                                  <div class="cky-tab-content" id="cky-tab-content" style="background-color:'+ colors[ckyActiveLaw].notice.bg + '">\
                                                  </div>\
                                              </div>\
                                      </div>'; getById("cky-consent").insertAdjacentHTML('beforeend', ckyDetailWrapper); if (behaviour.showLogo) { var ckyPoweredLink = '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" rel="noreferrer" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>'; getById("cky-detail-wrapper").insertAdjacentHTML('beforeend', ckyPoweredLink); }
      for (var i = 0; i < categories.length + 1; i++) {
        if (i === 0) {
          var ckyTabItem = '<div class="cky-tab-item cky-tab-item-active" id="cky-tab-item-privacy" tab-target="cky-tab-content-privacy" style="' + activeTabCss + '">' + privacyPolicy.title[selectedLanguage] + '</div>'; var ckyTabContentItem = '<div class="cky-tab-content-item cky-tab-content-active" id="cky-tab-content-privacy">\
                                                  <div class="cky-tab-title" style="color:'+ colors[ckyActiveLaw].notice.textColor + '">' + privacyPolicy.title[selectedLanguage] + '</div>\
                                                  <div class="cky-tab-desc" style="color:'+ colors[ckyActiveLaw].notice.textColor + '">' +
            privacyPolicy.text[selectedLanguage] + '</div>\
                                              </div>'; document.querySelector("#cky-consent #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem); document.querySelector("#cky-consent #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
        } else {
          var category = categories[i - 1]; var ckyTabItem = '<div class="cky-tab-item" id="cky-tab-item-' + category.name[selectedLanguage] + '" tab-target="cky-tab-content-' + category.name[selectedLanguage] + '" style="' + tabCss + '">' + category.name[selectedLanguage] + '</div>'; document.querySelector("#cky-consent #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem); var ckyTabContentItem = '<div class="cky-tab-content-item" id="cky-tab-content-' + category.name[selectedLanguage] + '">\
                                                  <div class="cky-tab-title" id="cky-tab-title-'+ category.name[selectedLanguage] + '" style="color:' + colors[ckyActiveLaw].notice.textColor + '">' +
            category.name[selectedLanguage] + '</div>\
                                                  <div class="cky-tab-desc" style="color:'+ colors[ckyActiveLaw].notice.textColor + '">' +
            category.description[selectedLanguage] + '</div>\
                                              </div>'; document.querySelector("#cky-consent #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem); if (!options.showCategoryDirectly) { createSwitches(category); }
          if (behaviour.showAuditTable) { renderAuditTable(true, category, ckyActiveLaw, selectedLanguage); }
        }
      }
      var ckyTabs = document.querySelectorAll("#cky-consent .cky-tab-item"); for (var i = 0; i < ckyTabs.length; i++) { ckyTabs[i].onclick = function () { currentActiveTab = getByClass("cky-tab-item-active")[0]; currentActiveTab.classList.remove("cky-tab-item-active"); currentActiveTab.setAttribute("style", tabCss); this.classList.add("cky-tab-item-active"); this.setAttribute("style", activeTabCss); document.querySelector("#cky-consent .cky-tab-content-active").classList.remove("cky-tab-content-active"); var tabId = this.getAttribute("tab-target"); getById(tabId).className += ' cky-tab-content-active'; } }
      var customAcceptButton = '<button class="cky-btn cky-btn-custom-accept"\
          style = "\
                          color: '+ colors[ckyActiveLaw].popup.acceptCustomButton.textColor + ';\
                          background-color: '+ colors[ckyActiveLaw].popup.acceptCustomButton.bg + ';\
                          border-color: '+ colors[ckyActiveLaw].popup.acceptCustomButton.borderColor + ';\
                      "\
          id="cky-btn-custom-accept">'+ content[ckyActiveLaw].customAcceptButton[selectedLanguage] + '</button>'; if (options.showCategoryDirectly) { document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML('beforeend', customAcceptButton); } else { document.querySelector("#cky-consent #cky-tab-menu").insertAdjacentHTML('beforeend', customAcceptButton); }
      getById("cky-btn-custom-accept").onclick = function () { acceptCookies("customAccept"); }
      getById("cky-detail-wrapper").style.display = "none";
    }
    function renderCcpaPopupDetail() {
      let ccpaDetailPopupOverlay = '<div class="cky-modal-backdrop cky-fade" id="cky-ccpa-modal-backdrop"></div>'
      let ccpaDetailPopup = '<div class="cky-modal cky-fade ccpa" id="cky-ccpa-settings-popup">\
                                  <div class="cky-modal-dialog" style="background-color:'+ colors[ckyActiveLaw].notice.bg + '">\
                                      <div class="cky-modal-content" id="cky-modal-content">\
                                      <div class="cky-opt-out-text" style="color:'+ colors[ckyActiveLaw].notice.textColor + ';">' + content[ckyActiveLaw].confirmation.text[selectedLanguage] + '</div>\
                                          <div class="cky-button-wrapper">\
                                              <button type="button" class="cky-btn cky-btn-cancel" id="cky-btn-cancel"\
                                              style="color:'+ colors[ckyActiveLaw].buttons['cancel'].textColor + ';\
                                              border-color:'+ colors[ckyActiveLaw].buttons['cancel'].borderColor + ';\
                                              background-color:'+ colors[ckyActiveLaw].buttons['cancel'].bg + ';\
                                              ">\
                                              '+ content[ckyActiveLaw].buttons.cancel[selectedLanguage] + '\
                                              </button>\
                                              <button type="button" class="cky-btn cky-btn-confirm" id="cky-btn-confirm"\
                                              style="color:'+ colors[ckyActiveLaw].buttons['confirm'].textColor + ';\
                                              border-color:'+ colors[ckyActiveLaw].buttons['confirm'].borderColor + ';\
                                              background-color:'+ colors[ckyActiveLaw].buttons['confirm'].bg + ';\
                                              ">\
                                              '+ content[ckyActiveLaw].buttons.confirm[selectedLanguage] + '\
                                              </button>\
                                          </div>\
                                      </div>\
                                  </div>\
                              </div>'
      body.insertAdjacentHTML('beforeend', ccpaDetailPopupOverlay); body.insertAdjacentHTML('beforeend', ccpaDetailPopup); if (behaviour.showLogo) {
        var ckyPoweredLink = '<div style="padding-top: 16px;font-size: 8px;color: ' + colors[ckyActiveLaw].notice.textColor + ';font-weight: normal;text-align: right;">Powered by <a target="_blank" rel="noreferrer" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>'
        getById("cky-modal-content").insertAdjacentHTML('beforeend', ckyPoweredLink);
      }
      getById("cky-btn-cancel").onclick = closeCkyCcpaModal; getById("cky-btn-confirm").onclick = acceptCookies;
    }
    function calculateTabDescriptionHeight() { let calculatedTabMenuHeight = document.querySelector('#cky-tab-menu').offsetHeight; calculatedTabMenuHeight = calculatedTabMenuHeight - 60; document.querySelectorAll('.cky-tab-desc').forEach(function (item) { item.style.height = calculatedTabMenuHeight + 'px'; }) }
    function createSwitches(category) {
      var cookieStatus = cookie.read('cookieyes-' + category.slug); var ckySwitchStatus; if (cookieStatus === '') { if (JSON.parse(category.status)) { ckySwitchStatus = "checked"; } else { ckySwitchStatus = ''; } } else { if (cookieStatus === "yes") { ckySwitchStatus = "checked"; } else { ckySwitchStatus = ''; } }
      var categoryCheckbox = '\
                  <label class="cky-switch" for="cky-checkbox-category'+ category.name[selectedLanguage] + '" onclick="event.stopPropagation();">\
                      <input type="checkbox" id="cky-checkbox-category'+ category.name[selectedLanguage] + '" ' + ckySwitchStatus + '/>\
                      <div class="cky-slider"></div>\
                  </label>'; if (options.showCategoryDirectly) { getById("cky-category-direct-" + category.name[selectedLanguage] + "").insertAdjacentHTML('beforebegin', categoryCheckbox); } else { getById("cky-tab-title-" + category.name[selectedLanguage] + "").insertAdjacentHTML('beforeend', categoryCheckbox); }
      if (category.type === 1) { getById("cky-checkbox-category" + category.name[selectedLanguage] + "").setAttribute("disabled", true); }
    }
    function renderPopupDetail() {
      var tabCss = "color:" + colors[ckyActiveLaw].popup.pills.textColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + ""; var activeTabCss = "background-color:" + colors[ckyActiveLaw].popup.pills.activeBg + ";" + "color:" + colors[ckyActiveLaw].popup.pills.activeTextColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + ";"; var detailPopupOverlay = '<div class="cky-modal-backdrop cky-fade" id="cky-modal-backdrop"></div>'; var detailPopup = '<div class="cky-modal cky-fade" id="cky-settings-popup">\
                                  <div class="cky-modal-dialog" style="background-color:'+ colors[ckyActiveLaw].notice.bg + '">\
                                  <div class="cky-modal-content" id="cky-modal-content" style="border:1px solid'+ colors[ckyActiveLaw].notice.borderColor + '">\
                                          <div class="cky-tab">\
                                              <div class="cky-tab-menu" id="cky-tab-menu" style="background-color:'+ colors[ckyActiveLaw].popup.pills.bg + '"></div>\
                                              <div class="cky-tab-content" id="cky-tab-content" style="background-color:'+ colors[ckyActiveLaw].notice.bg + '">\
                                                  <button type="button" class="cky-modal-close" id="ckyModalClose">\
                                                      <img src="https://cdn-cookieyes.com/assets/images/icons/close.svg" style="width: 9px" alt="modal-close-icon">\
                                                  </button>\
                                              </div>\
                                          </div>\
                                      </div>\
                                  </div>\
                              </div>'; body.insertAdjacentHTML('beforeend', detailPopupOverlay); body.insertAdjacentHTML('beforeend', detailPopup); if (behaviour.showLogo) { var ckyPoweredLink = '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" rel="noreferrer" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>'; document.querySelector("#cky-settings-popup #cky-modal-content").insertAdjacentHTML('beforeend', ckyPoweredLink); }
      for (var i = 0; i < categories.length + 1; i++) {
        if (i === 0) {
          var ckyTabItem = '<div class="cky-tab-item cky-tab-item-active" id="cky-tab-item-privacy" tab-target="cky-tab-content-privacy" style="' + activeTabCss + '">' + privacyPolicy.title[selectedLanguage] + '</div>'; var ckyTabContentItem = '<div class="cky-tab-content-item cky-tab-content-active" id="cky-tab-content-privacy">\
                                                  <div class="cky-tab-title" style="color:'+ colors[ckyActiveLaw].notice.textColor + '">' + privacyPolicy.title[selectedLanguage] + '</div>\
                                                  <div class="cky-tab-desc" style="color:'+ colors[ckyActiveLaw].notice.textColor + '">' +
            privacyPolicy.text[selectedLanguage] + '</div>\
                                              </div>'; document.querySelector("#cky-settings-popup #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem); document.querySelector("#cky-settings-popup #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
        } else {
          var category = categories[i - 1]; var ckyTabItem = '<div class="cky-tab-item" id="cky-tab-item-' + category.name[selectedLanguage] + '" tab-target="cky-tab-content-' + category.name[selectedLanguage] + '" style="' + tabCss + '">' + category.name[selectedLanguage] + '</div>'; var ckyTabContentItem = '<div class="cky-tab-content-item" id="cky-tab-content-' + category.name[selectedLanguage] + '">\
                                                  <div class="cky-tab-title" id="cky-tab-title-'+ category.name[selectedLanguage] + '" style="color:' + colors[ckyActiveLaw].notice.textColor + '">' +
            category.name[selectedLanguage] + '</div>\
                                                  <div class="cky-tab-desc" style="color:'+ colors[ckyActiveLaw].notice.textColor + '">' +
            category.description[selectedLanguage] + '</>\
                                              </div>'; document.querySelector("#cky-settings-popup #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem); document.querySelector("#cky-settings-popup #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem); if (!options.showCategoryDirectly) { createSwitches(category); }
          if (behaviour.showAuditTable) { renderAuditTable(true, category, ckyActiveLaw, selectedLanguage); }
        }
      }
      var ckyTabs = getByClass('cky-tab-item'); for (var i = 0; i < ckyTabs.length; i++) { ckyTabs[i].onclick = function () { currentActiveTab = getByClass("cky-tab-item-active")[0]; currentActiveTab.classList.remove("cky-tab-item-active"); currentActiveTab.setAttribute("style", tabCss); this.classList.add("cky-tab-item-active"); this.setAttribute("style", activeTabCss); document.querySelector("#cky-settings-popup .cky-tab-content-active").classList.remove("cky-tab-content-active"); var tabId = this.getAttribute("tab-target"); getById(tabId).className += ' cky-tab-content-active'; } }
      var customAcceptButton = '<button class="cky-btn cky-btn-custom-accept"\
          style = "\
                          color: '+ colors[ckyActiveLaw].popup.acceptCustomButton.textColor + ';\
                          background-color: '+ colors[ckyActiveLaw].popup.acceptCustomButton.bg + ';\
                          border-color: '+ colors[ckyActiveLaw].popup.acceptCustomButton.borderColor + ';\
                      "\
          id="cky-btn-custom-accept">'+ content[ckyActiveLaw].customAcceptButton[selectedLanguage] + '</button>'; if (options.showCategoryDirectly) { document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML('beforeend', customAcceptButton); } else { document.querySelector("#cky-settings-popup #cky-tab-menu").insertAdjacentHTML('beforeend', customAcceptButton); }
      getById("cky-btn-custom-accept").onclick = function () { acceptCookies("customAccept"); document.querySelector("#cky-modal-backdrop").classList.remove("cky-show"); }
      document.querySelector("#cky-modal-backdrop").onclick = closeCkyModal; document.querySelector("#cky-settings-popup #ckyModalClose").onclick = closeCkyModal;
    }
    function showHideStickyDetail() {
      if (!Element.prototype.toggleAttribute) {
        Element.prototype.toggleAttribute = function (name, force) {
          if (force !== void 0)
            force = !!force; if (this.hasAttribute(name)) {
              if (force)
                return true; this.removeAttribute(name); return false;
            }
          if (force === false)
            return false; this.setAttribute(name, ""); return true;
        };
      }
      getById('cky-btn-settings').toggleAttribute("expanded"); if (getById("cky-btn-settings").hasAttribute("expanded")) { getById("cky-detail-wrapper").style.display = "block"; calculateTabDescriptionHeight(); } else { getById("cky-detail-wrapper").style.display = "none"; }
    }
    function showPopupDetail() { getById("cky-settings-popup").classList.add("cky-show"); getByClass("cky-modal-backdrop")[0].classList.add("cky-show"); calculateTabDescriptionHeight(); }
    function ccpaShowPopupDetail() { getById("cky-ccpa-settings-popup").classList.add("cky-show"); getById("cky-ccpa-modal-backdrop").classList.add("cky-show"); }
    function closeCkyModal() { getById("cky-settings-popup").classList.remove("cky-show"); getByClass("cky-modal-backdrop")[0].classList.remove("cky-show"); }
    function closeCkyCcpaModal() { getById("cky-ccpa-settings-popup").classList.remove("cky-show"); getById("cky-ccpa-modal-backdrop").classList.remove("cky-show"); }
    function acceptCookies(choice) {
      if (ckyActiveLaw === 'gdpr') { updateCookies(choice); } else if (ckyActiveLaw === 'ccpa') { ccpaRejectCookies(); }
      if (typeof ckyLogCookies !== "undefined") { window.addEventListener("beforeunload", ckyLogCookies()); }
      cookie.set('cky-action', 'yes', cookie.ACCEPT_COOKIE_EXPIRE); if (JSON.parse(behaviour.reload)) { location.reload(); } else { checkAndInsertScripts(info.categories); cookieYes.unblock(); showToggler(); }
    }
    function ccpaRejectCookies() { cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE); for (var i = 0; i < info.categories.length; i++) { var category = info.categories[i]; var ckyItemToSave = category; if (category.settings.ccpa.doNotSell === "1") { cookie.set("cookieyes-" + ckyItemToSave.slug, "no", cookie.ACCEPT_COOKIE_EXPIRE); removeDeadCookies(category); } else { cookie.set("cookieyes-" + ckyItemToSave.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE); } } }
    function updateCookies(choice) { cookie.set('cky-consent', 'yes', cookie.ACCEPT_COOKIE_EXPIRE); for (var i = 0; i < info.categories.length; i++) { var category = info.categories[i]; if ((category.type !== 1) && choice === "customAccept") { var ckyItemToSave = category; if (display[ckyActiveLaw].buttons.settings) { var ckySwitch = document.getElementById("cky-checkbox-category" + ckyItemToSave.name[selectedLanguage] + ""); if (ckySwitch.checked) { cookie.set('cookieyes-' + ckyItemToSave.slug, 'yes', cookie.ACCEPT_COOKIE_EXPIRE); } else { cookie.set('cookieyes-' + ckyItemToSave.slug, 'no', cookie.ACCEPT_COOKIE_EXPIRE); removeDeadCookies(category); } } else { if (category.status) { cookie.set('cookieyes-' + ckyItemToSave.slug, 'yes', cookie.ACCEPT_COOKIE_EXPIRE); } else { cookie.set('cookieyes-' + ckyItemToSave.slug, 'no', cookie.ACCEPT_COOKIE_EXPIRE); } } } else { cookie.set('cookieyes-' + category.slug, 'yes', cookie.ACCEPT_COOKIE_EXPIRE); } } }
    function removeDeadCookies(category) {
      if (category.cookies) {
        const cookieList = document.cookie.split('; '); let cookieNames = {}; for (let j = 0; j < cookieList.length; j++) { cookieNames[cookieList[j].split("=")[0]] = "true"; }
        for (let i = 0; i < category.cookies.length; i++) { if (category.cookies[i].cookie_id in cookieNames) { document.cookie = category.cookies[i].cookie_id + "= ; expires = Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + category.cookies[i].domain; } }
      }
    }
    function rejectCookies() {
      cookie.set('cky-action', 'yes', cookie.ACCEPT_COOKIE_EXPIRE); cookie.set('cky-consent', 'no', cookie.ACCEPT_COOKIE_EXPIRE); rejectAllCookies(); if (typeof ckyLogCookies !== "undefined") { window.addEventListener("beforeunload", ckyLogCookies()); }
      if (JSON.parse(behaviour.reload)) { location.reload(); } else { showToggler(); }
    }
    function rejectAllCookies() { for (var i = 0; i < info.categories.length; i++) { var category = info.categories[i]; if (category.type !== 1) { cookie.set('cookieyes-' + category.slug, 'no', cookie.ACCEPT_COOKIE_EXPIRE); removeDeadCookies(category); } else { cookie.set('cookieyes-' + category.slug, 'yes', cookie.ACCEPT_COOKIE_EXPIRE); } } }
    function setInitialCookies() {
      if (behaviour.defaultConsent) { cookie.set('cky-consent', 'yes', cookie.ACCEPT_COOKIE_EXPIRE); } else { cookie.set('cky-consent', 'no', cookie.ACCEPT_COOKIE_EXPIRE); }
      for (var i = 0; i < info.categories.length; i++) { var category = info.categories[i]; if (category.type !== 1 && !(category.slug === 'analytics' && loadAnalyticsByDefault) && ckyActiveLaw !== 'ccpa') { if (category.status) { cookie.set('cookieyes-' + category.slug, 'yes', cookie.ACCEPT_COOKIE_EXPIRE); } else { cookie.set('cookieyes-' + category.slug, 'no', cookie.ACCEPT_COOKIE_EXPIRE); } } else { cookie.set('cookieyes-' + category.slug, 'yes', cookie.ACCEPT_COOKIE_EXPIRE); } }
      cookieYes.unblock();
    }
    function showToggler() {
      if (document.getElementById('cky-consent')) { document.getElementById("cky-consent").remove(); }
      if (document.getElementById('cky-settings-popup')) { document.getElementById('cky-settings-popup').remove(); }
      if (document.getElementById('cky-ccpa-settings-popup')) { document.getElementById('cky-ccpa-settings-popup').remove(); }
      if (document.querySelector('#cky-ccpa-modal-backdrop')) { document.querySelector('#cky-ccpa-modal-backdrop').remove(); }
      if (JSON.parse(display[ckyActiveLaw].noticeToggler)) {
        var cliConsentBarTrigger = '<div class="cky-consent-bar-trigger" id="cky-consent-toggler" onclick="revisitCkyConsent()" style="\
                  background: '+ colors[ckyActiveLaw].notice.bg + ';\
                  color: '+ colors[ckyActiveLaw].notice.textColor + ';\
                  border: 1px solid '+ colors[ckyActiveLaw].notice.borderColor + ';\
                  top: '+ positionValue[position].top + ';\
                  right: '+ positionValue[position].right + ';\
                  bottom: '+ positionValue[position].bottom + ';\
                  left: '+ positionValue[position].left + '\
                  ">'+ content[ckyActiveLaw].noticeToggler[selectedLanguage] + '</div>'; body.insertAdjacentHTML('beforeend', cliConsentBarTrigger);
      }
    }
    function checkAndInsertScripts(categories) {
      for (var i = 0; i < categories.length; i++) {
        var category = categories[i]; if (category.isAddedToDom) continue
        var cookieStatus = cookie.read('cookieyes-' + category.slug); if (category.type === 1) { insertScripts(category); } else { if (cookieStatus === 'yes') { insertScripts(category); } }
      }
    }
    function insertScripts(category) {
      category.isAddedToDom = true; if (typeof category.scripts != 'undefined') {
        for (var i = 0; i < category.scripts.length; i++) {
          var scriptItem = category.scripts[i]; if (scriptItem.head_script !== null) { var range = document.createRange(); range.selectNode(document.getElementsByTagName("body")[0]); var documentFragment = range.createContextualFragment(scriptItem.head_script); document.body.appendChild(documentFragment); }
          if (scriptItem.body_script !== null) { var range = document.createRange(); range.selectNode(document.getElementsByTagName("body")[0]); var documentFragment = range.createContextualFragment(scriptItem.body_script); document.body.appendChild(documentFragment); }
        }
      }
    }
    window.revisitCkyConsent = function () { const ckyBanner = document.getElementById('cky-consent'); if (!ckyBanner) { renderBanner(); } }
    window.revisitCkySettings = function () {
      if (ckyActiveLaw === "ccpa") {
        if (!document.getElementById("cky-ccpa-settings-popup")) { renderCcpaPopupDetail(); }
        if (!document.getElementById("cky-ccpa-settings-popup").classList.contains("cky-show")) { ccpaShowPopupDetail(); }
      }
    }
    if (JSON.parse(behaviour.acceptOnScroll)) { body.onscroll = function () { if (cookie.read("cky-consent") === '') { acceptCookies("all"); } } }
    document.querySelector('body').addEventListener('click', function (event) { if (event.target.matches(".cky-banner-element, .cky-banner-element *")) { if (!document.getElementById('cky-consent')) { renderBanner(); } } }); var langObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type == "attributes") {
          if (mutation.attributeName === "lang") {
            if (document.getElementById("cky-settings-popup")) { document.getElementById("cky-settings-popup").remove(); }
            if (document.getElementById("cky-consent")) { document.getElementById("cky-consent").remove(); selectedLanguage = checkSelectedLanguage(selectedLanguage, ckyActiveLaw); renderBanner(); }
          }
        }
      })
    }); langObserver.observe(document.querySelector("html"), { attributes: true });
  }
  var defaultLawGdpr = ckyActiveLaw ? ckyActiveLaw : "gdpr"; var anywhereAuditTable = document.getElementsByClassName("cky-audit-table-element"); if (anywhereAuditTable.length) { for (var i = 0; i < cliConfig.info.categories.length; i++) { var category = cliConfig.info.categories[i]; renderAuditTable(false, category, defaultLawGdpr, checkSelectedLanguage(cliConfig.options.behaviour.selectedLanguage, defaultLawGdpr)); } }
  ckyCount(createBannerOnLoad);
}); function appendStyle() { if (document.getElementById("cky-style")) return; var css = cliConfig.options.template.css + cliConfig.options.customCss; var style = document.createElement("style"); document.getElementsByTagName("head")[0].appendChild(style); style.type = "text/css"; style.setAttribute("id", "cky-style"); if (style.styleSheet) { style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } }
function renderAuditTable(inBanner, category, law, language) {
  // appendStyle(); if (category.cookies.length) {
  //   if (inBanner) { var auditTableId = "cky-cookie-audit-table"; } else {
  //     var auditTableId = "cky-anywhere-cookie-audit-table"; var auditTableCategoryName = '<h5>' + category.name[language] + '</h5>'
  //     var elems = document.getElementsByClassName('cky-audit-table-element'); for (var i = 0; i < elems.length; i++) { elems[i].insertAdjacentHTML("beforeend", auditTableCategoryName); }
  //   }
  //   var auditTable = '\
  //         <div class="cky-table-wrapper">\
  //             <table id="'+ auditTableId +
  //     category.id + '" class="cky-cookie-audit-table">\
  //                 <thead>\
  //                     <tr>\
  //                         <th>'+
  //     cliConfig.options.content[law].auditTable.cookie[language] + "</th>\
  //                         <th>"+
  //     cliConfig.options.content[law].auditTable.type[language] + "</th>\
  //                         <th>"+
  //     cliConfig.options.content[law].auditTable.duration[language] + "</th>\
  //                         <th>"+
  //     cliConfig.options.content[law].auditTable.description[language] + "</th>\
  //                     </tr>\
  //                 </thead>\
  //                 <tbody>\
  //                 </tbody>\
  //             </table>\
  //         </div>"; if (inBanner) { document.getElementById("cky-tab-content-" + category.name[language] + "").getElementsByClassName("cky-tab-desc")[0].insertAdjacentHTML("beforeend", auditTable); } else { var elems = document.getElementsByClassName('cky-audit-table-element'); for (var i = 0; i < elems.length; i++) { elems[i].insertAdjacentHTML("beforeend", auditTable); } }
  //   for (var k = 0; k < category.cookies.length; k++) {
  //     var cookies = category.cookies[k]; var auditTableRow = "<tr>\
  //                                     <td>"+
  //       cookies.cookie_id + "</td>\
  //                                     <td>"+
  //       cookies.type + "</td>\
  //                                     <td>"+
  //       cookies.duration + "</td>\
  //                                     <td>"+
  //       cookies.description[language] + "</td>\
  //                                 </tr>"; if (inBanner) { document.getElementById("cky-cookie-audit-table" + category.id + "").getElementsByTagName("tbody")[0].insertAdjacentHTML("beforeend", auditTableRow); }
  //     else { document.getElementById("cky-anywhere-cookie-audit-table" + category.id + "").getElementsByTagName("tbody")[0].insertAdjacentHTML("beforeend", auditTableRow); }
  //   }
  // }
}
function checkSelectedLanguage(selectedLanguage, ckyActiveLaw) {
  let siteLanguage = document.documentElement.lang; if (cliConfig.options.plan === 'free' || !siteLanguage) { return selectedLanguage }
  if (cliConfig.options.content[ckyActiveLaw].title[siteLanguage]) { return siteLanguage }
  const remove_after = siteLanguage.indexOf('-'); if (remove_after >= 1) { siteLanguage = siteLanguage.substring(0, remove_after); }
  return (cliConfig.options.content[ckyActiveLaw].title[siteLanguage] ? siteLanguage : selectedLanguage);
} const categoryScripts = [{ "re": "youtube-nocookie.com", "categories": ["functional"] }, { "re": "bing.com", "categories": ["functional"] }, { "re": "vimeo.com", "categories": ["functional"] }, { "re": "spotify.com", "categories": ["functional"] }, { "re": "sharethis.com", "categories": ["functional"] }, { "re": "yahoo.com", "categories": ["functional"] }, { "re": "addtoany.com", "categories": ["functional"] }, { "re": "dailymotion.com", "categories": ["functional"] }, { "re": "slideshare.net", "categories": ["functional"] }, { "re": "soundcloud.com", "categories": ["functional"] }, { "re": "tawk.to", "categories": ["functional"] }, { "re": "cky-functional.js", "categories": ["functional"] }, { "re": "cky-performance.js", "categories": ["performance"] }, { "re": "analytics", "categories": ["analytics"] }, { "re": "googletagmanager.com", "categories": ["analytics"] }, { "re": "google-analytics.com", "categories": ["analytics"] }, { "re": "cky-analytics.js", "categories": ["analytics"] }, { "re": "hotjar.com", "categories": ["analytics"] }, { "re": "js.hs-scripts.com", "categories": ["analytics"] }, { "re": "js.hs-analytics.net", "categories": ["analytics"] }, { "re": "taboola.com", "categories": ["analytics"] }, { "re": "analytics.ycdn.de", "categories": ["analytics"] }, { "re": "plugins\/activecampaign-subscription-forms", "categories": ["analytics"] }, { "re": ".addthis.com", "categories": ["advertisement"] }, { "re": "doubleclick.net", "categories": ["advertisement"] }, { "re": "instagram.com", "categories": ["advertisement"] }, { "re": "amazon-adsystem.com", "categories": ["advertisement"] }, { "re": "facebook.*", "categories": ["advertisement"] }, { "re": "googleadservices.com", "categories": ["advertisement"] }, { "re": "googlesyndication.com", "categories": ["advertisement"] }, { "re": ".pinterest.com", "categories": ["advertisement"] }, { "re": ".linkedin.com", "categories": ["advertisement"] }, { "re": ".twitter.com", "categories": ["advertisement"] }, { "re": "youtube.com", "categories": ["advertisement"] }, { "re": "bluekai.com", "categories": ["advertisement"] }, { "re": "cky-advertisement.js", "categories": ["advertisement"] }];
function addPlaceholder(htmlElm) {
  var selectedLanguage = cliConfig.options.behaviour.selectedLanguage; let activeLawTemp = ckyActiveLaw ? ckyActiveLaw : cliConfig.options.selectedLaws[0]; selectedLanguage = checkSelectedLanguage(selectedLanguage, activeLawTemp); var htmlElemContent = cliConfig.options.content[activeLawTemp].placeHolderText[selectedLanguage]; var htmlElemWidth = htmlElm.getAttribute('width'); var htmlElemHeight = htmlElm.getAttribute('height'); if (htmlElemWidth == null) { htmlElemWidth = htmlElm.offsetWidth; }
  if (htmlElemHeight == null) { htmlElemHeight = htmlElm.offsetHeight; }
  if (htmlElemHeight == 0 || htmlElemWidth == 0) { htmlElemContent = ''; }
  var Placeholder = '<div data-src="' + htmlElm.src + '" style="background-image: url(\'https://cdn-cookieyes.com/assets/images/cky-placeholder.svg\');background-size: 80px;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: flex-end;justify-content: center; width:' + htmlElemWidth + 'px; height:' + htmlElemHeight + 'px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;">' + htmlElemContent + '</div></div>'; var youtubeID = getYoutubeID(htmlElm.src); if (youtubeID !== false && typeof htmlElm.src !== 'undefined ') { youtubeThumbnail = "https://img.youtube.com/vi/" + youtubeID + "/maxresdefault.jpg"; var Placeholder = '<div data-src="' + htmlElm.src + '" style="background-image: linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)), url(' + youtubeThumbnail + ');background-size: 100% 100%;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: center;justify-content: center; width:' + htmlElemWidth + 'px; height:' + htmlElemHeight + 'px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;display: flex; align-items: center; padding:10px 16px; background-color: rgba(0, 0, 0, 0.8); color: #ffffff;">' + htmlElemContent + '</div></div>'; }
  Placeholder.width = htmlElemWidth; Placeholder.height = htmlElemHeight; if (htmlElm.tagName !== 'IMG') { htmlElm.insertAdjacentHTML('beforebegin', Placeholder); }
}
function getYoutubeID(src) { var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; var match = src.match(regExp); if (match && match[2].length == 11) { return match[2]; } else { return false; } }
var backupRemovedScripts = { blacklisted: [] }; CKY_BLACKLIST = []; CKY_WHITELIST = []; var ckyconsent = (getCategoryCookie("cky-consent")) ? getCategoryCookie("cky-consent") : 'no'; var TYPE_ATTRIBUTE = 'javascript/blocked'; if (navigator.doNotTrack == 1) { categoryScripts.forEach(function (item) { CKY_BLACKLIST.push(new RegExp(escapeRegExp(item.re))); }); } else if (cliConfig.options.consentType !== "info") {
  categoryScripts.forEach(function (item) {
    if (item.categories.length === 1 && item.categories[0] && loadAnalyticsByDefault) return; if (ckyconsent !== "yes") { CKY_BLACKLIST.push(new RegExp(escapeRegExp(item.re))); return }
    for (let i = 0; i < item.categories.length; i++) { if (getCategoryCookie("cookieyes-" + item.categories[i]) !== "yes") { CKY_BLACKLIST.push(new RegExp(escapeRegExp(item.re))); break } }
  });
}
var patterns = { blacklist: window.CKY_BLACKLIST, whitelist: window.CKY_WHITELIST }; var isOnBlacklist = function isOnBlacklist(src) { return src && (!patterns.blacklist || patterns.blacklist.some(function (pattern) { return pattern.test(src); })); }; var isOnWhitelist = function isOnWhitelist(src) { return src && (!patterns.whitelist || patterns.whitelist.some(function (pattern) { return pattern.test(src); })); }; function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }
function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]")
    return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; }
    return arr2;
  }
}
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (_ref) {
    var addedNodes = _ref.addedNodes; Array.prototype.forEach.call(addedNodes, function (node) {
      if (node.nodeType === 1 && node.tagName === 'SCRIPT' || node.tagName === 'IFRAME') {
        var src = node.src || ''; if (node.hasAttribute("data-cookieyes")) {
          for (let i = 0; i < cliConfig.info.categories.length; i++) {
            if (cliConfig.info.categories[i].type === 1 && node.getAttribute("data-cookieyes").replace("cookieyes-", "") === cliConfig.info.categories[i].slug)
              return;
          }
          if (getCategoryCookie(node.getAttribute("data-cookieyes")) != "yes") {
            var cat = node.getAttribute("data-cookieyes"); if (node.src !== "" && typeof node.src !== undefined) {
              var webdetail = new URL(node.src); var category = categoryScripts.find(function (cat) { return cat.re === webdetail.hostname.replace(/^www./, ""); }); if (category) {
                if (!category.isReplaced) { category.categories = [cat.replace("cookieyes-", "")]; category.isReplaced = true; } else if (category.categories.indexOf(cat.replace("cookieyes-", "")) === -1) { category.categories.push(cat.replace("cookieyes-", "")); }
                if (!isOnBlacklist(src)) { Array.prototype.push.apply(window.CKY_BLACKLIST, [new RegExp(escapeRegExp(webdetail.hostname.replace(/^www./, "")))]); Array.prototype.push.apply(patterns.blacklist, [new RegExp(escapeRegExp(webdetail.hostname.replace(/^www./, "")))]); }
              } else { Array.prototype.push.apply(window.CKY_BLACKLIST, [new RegExp(escapeRegExp(webdetail.hostname.replace(/^www./, ""))),]); Array.prototype.push.apply(patterns.blacklist, [new RegExp(escapeRegExp(webdetail.hostname.replace(/^www./, ""))),]); categoryScripts.push({ re: webdetail.hostname.replace(/^www./, ""), categories: [cat.replace("cookieyes-", "")], }); }
            }
          }
        }
        if (isOnBlacklist(src) && getCategoryCookie(node.getAttribute("data-cookieyes")) != 'yes') {
          if (node.tagName === 'IFRAME') { addPlaceholder(node); }
          node.type = 'javascript/blocked'; node.parentElement.removeChild(node); backupRemovedScripts.blacklisted.push(node.cloneNode()); node.addEventListener("beforescriptexecute", function t(e) { e.preventDefault(); node.removeEventListener("beforescriptexecute", t); });
        }
      }
    });
  });
}); observer.observe(document.documentElement, { childList: true, subtree: true }); function getCategoryCookie(name) { var re = new RegExp(name + "=([^;]+)"); var value = re.exec(document.cookie); return (value != null) ? unescape(value[1]) : 'no'; }
var createElementBackup = document.createElement; document.createElement = function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) { args[_key] = arguments[_key]; }
  if (args[0].toLowerCase() !== 'script')
    return createElementBackup.apply(document, _toConsumableArray(args)); var scriptElt = createElementBackup.apply(document, _toConsumableArray(args)); var originalSetAttribute = scriptElt.setAttribute.bind(scriptElt); Object.defineProperties(scriptElt, {
      'src': {
        get: function () { return scriptElt.getAttribute('src') }, set: function (value) {
          var isNeccessary = scriptElt.hasAttribute("data-cookieyes") && scriptElt.getAttribute("data-cookieyes") === "cookieyes-necessary"; if (isOnBlacklist(value) && !isNeccessary) { originalSetAttribute('type', TYPE_ATTRIBUTE) }
          originalSetAttribute('src', value); return true
        }
      }, 'type': { set: function (value) { var isNeccessary = scriptElt.hasAttribute("data-cookieyes") && scriptElt.getAttribute("data-cookieyes") === "cookieyes-necessary"; var typeValue = isOnBlacklist(scriptElt.src) && !isNeccessary ? TYPE_ATTRIBUTE : value; originalSetAttribute('type', typeValue); return true } }
    }); scriptElt.setAttribute = function (name, value) {
      if (name === 'type' || name === 'src') { scriptElt[name] = value; return }
      if (name === 'data-cookieyes' && value === 'cookieyes-necessary') originalSetAttribute("type", 'text/javascript'); HTMLScriptElement.prototype.setAttribute.call(scriptElt, name, value);
    }
  return scriptElt;
}
var cookieYes = {
  setCookie: function (name, value, days) {
    if (days) { var date = new Date(); date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); var expires = "; expires=" + date.toGMTString(); } else
      var expires = ""; var cliCookie = name + "=" + value + expires + "; path=/;"; document.cookie = cliCookie;
  }, unblock: function () {
    if (navigator.doNotTrack == 1) return; var ckyconsent = (getCategoryCookie("cky-consent")) ? getCategoryCookie("cky-consent") : 'no'; categoryScripts.forEach(function (item) { if ((ckyconsent == 'yes' && !isCategoryAccepted(item)) || (ckyActiveLaw === "ccpa" && getCategoryCookie("cky-consent") === 'no') || (ckyActiveLaw === "ccpa" && !isCategoryAccepted(item))) { Array.prototype.push.apply(window.CKY_WHITELIST, [new RegExp(escapeRegExp(item.re))]); Array.prototype.push.apply(patterns.whitelist, [new RegExp(escapeRegExp(item.re))]); } }); if (backupRemovedScripts.blacklisted && backupRemovedScripts.blacklisted.length < 1) { observer.disconnect(); }
    observer.disconnect(); let indexOffset = 0; _toConsumableArray(backupRemovedScripts.blacklisted).forEach(function (script, index) { if (script.src) { if (isOnWhitelist(script.src)) { if (script.type == 'javascript/blocked') { window.TYPE_ATTRIBUTE = 'text/javascript'; script.type = 'text/javascript'; var scriptNode = document.createElement('script'); scriptNode.src = script.src; scriptNode.type = 'text/javascript'; document.head.appendChild(scriptNode); backupRemovedScripts.blacklisted.splice(index - indexOffset, 1); indexOffset++; } else { var frames = document.getElementsByClassName("wt-cli-iframe-placeholder"); for (var i = 0; i < frames.length; i++) { if (script.src == frames.item(i).getAttribute('data-src')) { if (isOnWhitelist(script.src)) { var iframe = document.createElement('iframe'); var width = frames.item(i).offsetWidth; var height = frames.item(i).offsetHeight; iframe.src = script.src; iframe.width = width; iframe.height = height; frames.item(i).parentNode.insertBefore(iframe, frames.item(i)); frames.item(i).parentNode.removeChild(frames.item(i)); } } } } } } }); document.createElement = createElementBackup;
  }
}; function isCategoryAccepted(item) { return item.categories.some(function (category) { return getCategoryCookie("cookieyes-" + category) === "no"; }) }
Array.prototype.find = Array.prototype.find || function (callback) {
  if (this === null) { throw new TypeError('Array.prototype.find called on null or undefined'); } else if (typeof callback !== 'function') { throw new TypeError('callback must be a function'); }
  var list = Object(this); var length = list.length >>> 0; var thisArg = arguments[1]; for (var i = 0; i < length; i++) { var element = list[i]; if (callback.call(thisArg, element, i, list)) { return element; } }
}; function escapeRegExp(url) { return url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }