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
                    cookieYes.unblock();
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
}

function bannerActiveCheck() {
    var isActiveCheckCookiePresent = getCookie("cky-active-check");
    if (!isActiveCheckCookiePresent) {
        fetch("https://active.cookieyes.com/api/e46196fc7007b9bad3685ade/log", { method: "POST" }).catch((err) => {
            console.error(err);
        });
        setCookie("cky-active-check", "yes", 1);
    }
}

function getCookie(name) {
    var cookieList = document.cookie
        .split(";")
        .map((cookie) => cookie.split("="))
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
var tldomain = "www.tyndale.com";
var cliConfig = {
    options: {
        plan: "basic",
        theme: "light",
        colors: {
            ccpa: {
                notice: { bg: "#fff", textColor: "#565662", titleColor: "#565662", borderColor: "#d4d8df" },
                buttons: {
                    cancel: { bg: "#dedfe0", textColor: "#717375", borderColor: "transparent" },
                    confirm: { bg: "#0443b5", textColor: "#fff", borderColor: "#0443b5" },
                    readMore: { bg: "transparent", textColor: "#bdc2d0", borderColor: "transparent" },
                    doNotSell: { bg: "transparent", textColor: "#0443b5", borderColor: "transparent" },
                },
            },
        },
        content: {
            ccpa: {
                text: {
                    ar:
                        '\u064a\u0639\u0627\u0644\u062c \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0623\u0648 \u0623\u062f\u0648\u0627\u062a \u0627\u0644\u0637\u0631\u0641\u064a\u0639\u0627\u0644\u062c \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0623\u0648 \u0623\u062f\u0648\u0627\u062a \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062b\u0627\u0644\u062b \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0634\u062e\u0635\u064a\u0629. \u064a\u0645\u0643\u0646\u0643 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0641\u064a \u0628\u064a\u0639 \u0645\u0639\u0644\u0648\u0645\u0627\u062a\u0643 \u0627\u0644\u0634\u062e\u0635\u064a\u0629 \u0628\u0627\u0644\u0636\u063a\u0637 \u0639\u0644\u0649 \u0631\u0627\u0628\u0637 "\u0639\u062f\u0645 \u0628\u064a\u0639 \u0645\u0639\u0644\u0648\u0645\u0627\u062a\u064a \u0627\u0644\u0634\u062e\u0635\u064a\u0629"',
                    bg:
                        "\u0422\u043e\u0437\u0438 \u0443\u0435\u0431\u0441\u0430\u0439\u0442 \u0438\u043b\u0438 \u043d\u0435\u0433\u043e\u0432\u0438\u0442\u0435 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0438 \u043d\u0430 \u0442\u0440\u0435\u0442\u0438 \u0441\u0442\u0440\u0430\u043d\u0438 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0432\u0430\u0442 \u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438. \u041c\u043e\u0436\u0435\u0442\u0435 \u0434\u0430 \u0441\u0435 \u043e\u0442\u043a\u0430\u0436\u0435\u0442\u0435 \u043e\u0442 \u043f\u0440\u043e\u0434\u0430\u0436\u0431\u0430\u0442\u0430 \u043d\u0430 \u0432\u0430\u0448\u0430\u0442\u0430 \u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f, \u043a\u0430\u0442\u043e \u043a\u043b\u0438\u043a\u043d\u0435\u0442\u0435 \u0432\u044a\u0440\u0445\u0443 \u0432\u0440\u044a\u0437\u043a\u0430\u0442\u0430 \u201e\u041d\u0435 \u043f\u0440\u043e\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043c\u043e\u044f\u0442\u0430 \u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f\u201c.",
                    ca:
                        "Aquest lloc web o les seves eines de tercers processen dades personals. Podeu desactivar la venda de la vostra informaci\u00f3 personal si feu clic a l\u2019enlla\u00e7 \u201cNo vendre la meva informaci\u00f3 personal\u201d.",
                    cr: 'Ova web stranica ili njezini alati tre\u0107e strane obra\u0111uju osobne podatke. Mo\u017eete isklju\u010diti prodaju svojih osobnih podataka klikom na vezu "Ne prodaj moje osobne podatke".',
                    cs:
                        "Tento web nebo jeho n\u00e1stroje t\u0159et\u00edch stran zpracov\u00e1vaj\u00ed osobn\u00ed \u00fadaje. Prodej va\u0161ich osobn\u00edch \u00fadaj\u016f m\u016f\u017eete odhl\u00e1sit kliknut\u00edm na odkaz \u201eNeprod\u00e1vejte m\u00e9 osobn\u00ed \u00fadaje\u201c.",
                    da:
                        'Dette websted eller dets tredjepartsv\u00e6rkt\u00f8jer behandler personlige data. Du kan frav\u00e6lge salget af dine personlige oplysninger ved at klikke p\u00e5 linket "S\u00e6lg ikke mine personlige oplysninger".',
                    de:
                        'Diese Website oder ihre Tools von Drittanbietern verarbeiten personenbezogene Daten. Sie k\u00f6nnen den Verkauf Ihrer pers\u00f6nlichen Daten abbestellen, indem Sie auf den Link "Meine pers\u00f6nlichen Daten nicht verkaufen" klicken.',
                    en: 'This website or its third-party tools process personal data. You can opt out of the sale of your personal information by clicking on the "Do Not Sell My Personal Information" link.',
                    es:
                        'Este sitio web o sus herramientas de terceros procesan datos personales. Puede optar por no participar en la venta de su informaci\u00f3n personal haciendo clic en el enlace "No vender mi informaci\u00f3n personal".',
                    fi:
                        "T\u00e4m\u00e4 verkkosivusto tai sen kolmannen osapuolen ty\u00f6kalut k\u00e4sittelev\u00e4t henkil\u00f6tietoja. Voit kielt\u00e4yty\u00e4 henkil\u00f6kohtaisten tietojesi myynnist\u00e4 napsauttamalla \u00c4l\u00e4 myy henkil\u00f6kohtaisia tietoja -linkki\u00e4.",
                    fr:
                        "Ce site Web ou ses outils tiers traitent des donn\u00e9es personnelles. Vous pouvez refuser la vente de vos informations personnelles en cliquant sur le lien \u00abNe pas vendre mes informations personnelles\u00bb.",
                    hu:
                        "Ez a weboldal vagy harmadik f\u00e9lt\u0151l sz\u00e1rmaz\u00f3 eszk\u00f6zei feldolgozz\u00e1k a szem\u00e9lyes adatokat. A \u201eNe adja el a szem\u00e9lyes adataimat\u201d linkre kattintva letilthatja szem\u00e9lyes adatainak \u00e9rt\u00e9kes\u00edt\u00e9s\u00e9t.",
                    it: 'Questo sito Web oi suoi strumenti di terze parti elaborano i dati personali. Puoi disattivare la vendita delle tue informazioni personali facendo clic sul collegamento "Non vendere le mie informazioni personali".',
                    lt:
                        "\u0160i svetain\u0117 ar jos tre\u010di\u0173j\u0173 \u0161ali\u0173 \u012frankiai tvarko asmens duomenis. Galite atsisakyti savo asmenin\u0117s informacijos pardavimo spustel\u0117dami nuorod\u0105 \u201eNeparduok mano asmenin\u0117s informacijos\u201c.",
                    nl: 'Deze website of zijn tools van derden verwerken persoonsgegevens. U kunt zich afmelden voor de verkoop van uw persoonlijke gegevens door op de link "Mijn persoonlijke gegevens niet verkopen" te klikken.',
                    no: 'Dette nettstedet eller dets tredjepartsverkt\u00f8y behandler personopplysninger. Du kan velge bort salg av din personlige informasjon ved \u00e5 klikke p\u00e5 lenken "Ikke selg min personlige informasjon".',
                    pl:
                        "Ta strona internetowa lub jej narz\u0119dzia stron trzecich przetwarzaj\u0105 dane osobowe. Mo\u017cesz zrezygnowa\u0107 ze sprzeda\u017cy swoich danych osobowych, klikaj\u0105c \u0142\u0105cze \u201eNie sprzedawaj moich danych osobowych\u201d.",
                    pt: 'Este website ou as suas ferramentas de terceiros processam dados pessoais. Pode optar pela venda das suas informa\u00e7\u00f5es pessoais clicando no link "N\u00e3o vender as minhas informa\u00e7\u00f5es pessoais".',
                    ru:
                        "\u042d\u0442\u043e\u0442 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u0438\u043b\u0438 \u0435\u0433\u043e \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0438\u0435 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b \u043e\u0431\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u044e\u0442 \u043b\u0438\u0447\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435. \u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043e\u0442\u043a\u0430\u0437\u0430\u0442\u044c\u0441\u044f \u043e\u0442 \u043f\u0440\u043e\u0434\u0430\u0436\u0438 \u0441\u0432\u043e\u0435\u0439 \u043b\u0438\u0447\u043d\u043e\u0439 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u0438, \u0449\u0435\u043b\u043a\u043d\u0443\u0432 \u0441\u0441\u044b\u043b\u043a\u0443 \u00ab\u041d\u0435 \u043f\u0440\u043e\u0434\u0430\u0432\u0430\u0442\u044c \u043c\u043e\u044e \u043b\u0438\u0447\u043d\u0443\u044e \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044e\u00bb.",
                    se:
                        'Denna webbplats eller dess tredjepartsverktyg behandlar personuppgifter. Du kan v\u00e4lja bort f\u00f6rs\u00e4ljning av din personliga information genom att klicka p\u00e5 l\u00e4nken "S\u00e4lj inte min personliga information".',
                    sk:
                        'T\u00e1to webov\u00e1 str\u00e1nka alebo jej n\u00e1stroje tret\u00edch str\u00e1n sprac\u00favaj\u00fa osobn\u00e9 \u00fadaje. Z predaja va\u0161ich osobn\u00fdch \u00fadajov sa m\u00f4\u017eete odhl\u00e1si\u0165 kliknut\u00edm na odkaz "Nepred\u00e1va\u0165 moje osobn\u00e9 \u00fadaje".',
                    sl: 'To spletno mesto ali njegova orodja tretjih oseb obdelujejo osebne podatke. Iz prodaje va\u0161ih osebnih podatkov se lahko odlo\u010dite tako, da kliknete povezavo "Ne prodajaj mojih osebnih podatkov".',
                    uk:
                        "\u0426\u0435\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u0430\u0431\u043e \u0439\u043e\u0433\u043e \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0456 \u0456\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0438 \u043e\u0431\u0440\u043e\u0431\u043b\u044f\u044e\u0442\u044c \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u0456 \u0434\u0430\u043d\u0456. \u0412\u0438 \u043c\u043e\u0436\u0435\u0442\u0435 \u0432\u0456\u0434\u043c\u043e\u0432\u0438\u0442\u0438\u0441\u044c \u0432\u0456\u0434 \u043f\u0440\u043e\u0434\u0430\u0436\u0443 \u0441\u0432\u043e\u0454\u0457 \u043e\u0441\u043e\u0431\u0438\u0441\u0442\u043e\u0457 \u0456\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0456\u0457, \u043d\u0430\u0442\u0438\u0441\u043d\u0443\u0432\u0448\u0438 \u043f\u043e\u0441\u0438\u043b\u0430\u043d\u043d\u044f \u201c\u041d\u0435 \u043f\u0440\u043e\u0434\u0430\u0432\u0430\u0442\u0438 \u043c\u043e\u044e \u043e\u0441\u043e\u0431\u0438\u0441\u0442\u0443 \u0456\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0456\u044e\u201d.",
                    zh:
                        "\u672c\u7f51\u7ad9\u6216\u5176\u7b2c\u4e09\u65b9\u5de5\u5177\u5904\u7406\u4e2a\u4eba\u6570\u636e\u3002 \u60a8\u53ef\u4ee5\u901a\u8fc7\u5355\u51fb\u201c\u4e0d\u51fa\u552e\u6211\u7684\u4e2a\u4eba\u4fe1\u606f\u201d\u94fe\u63a5\u6765\u9009\u62e9\u4e0d\u51fa\u552e\u4e2a\u4eba\u4fe1\u606f\u3002",
                },
                title: {
                    ar: "\u064a\u0644\u0627\u062d\u0638",
                    bg: "\u0417\u0430\u0431\u0435\u043b\u0435\u0436\u0435\u0442\u0435",
                    ca: "Av\u00eds",
                    cr: "Obavijest",
                    cs: "Ozn\u00e1men\u00ed",
                    da: "Varsel",
                    de: "Beachten",
                    en: "Notice",
                    es: "Aviso",
                    fi: "Ilmoitus",
                    fr: "Avis",
                    hu: "\u00c9rtes\u00edt\u00e9s",
                    it: "Avviso",
                    lt: "Pasteb\u0117ti",
                    nl: "Kennisgeving",
                    no: "Legge merke til",
                    pl: "Og\u0142oszenie",
                    pt: "Aviso",
                    ru: "\u0423\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435",
                    se: "L\u00e4gga m\u00e4rke till",
                    sk: "Ozn\u00e1menie",
                    sl: "Obvestilo",
                    uk: "\u0417\u0430\u0443\u0432\u0430\u0436\u0442\u0435",
                    zh: "\u6ce8\u610f",
                },
                buttons: {
                    cancel: {
                        ar: "\u064a\u0644\u063a\u064a",
                        bg: "\u041e\u0442\u043a\u0430\u0437",
                        ca: "Cancel\u00b7lar",
                        cr: "Otkazati",
                        cs: "zru\u0161en\u00ed",
                        da: "Afbestille",
                        de: "Stornieren",
                        en: "Cancel",
                        es: "Cancelar",
                        fi: "Peruuttaa",
                        fr: "Annuler",
                        hu: "M\u00e9gse",
                        it: "Annulla",
                        lt: "At\u0161aukti",
                        nl: "annuleren",
                        no: "Avbryt",
                        pl: "Anuluj",
                        pt: "Cancelar",
                        ru: "\u041e\u0442\u043c\u0435\u043d\u0430",
                        se: "Avbryt",
                        sk: "Zru\u0161i\u0165",
                        sl: "Preklicati",
                        uk: "\u0421\u043a\u0430\u0441\u0443\u0432\u0430\u0442\u0438",
                        zh: "\u53d6\u6d88",
                    },
                    confirm: {
                        ar: "\u064a\u062a\u0623\u0643\u062f",
                        bg: "\u041f\u043e\u0442\u0432\u044a\u0440\u0434\u0435\u0442\u0435",
                        ca: "Confirmeu",
                        cr: "Potvrditi",
                        cs: "Potvrdit",
                        da: "Bekr\u00e6fte",
                        de: "Weiterlesen",
                        en: "Confirm",
                        es: "Confirmar",
                        fi: "Vahvistaa",
                        fr: "Confirmer",
                        hu: "Meger\u0151s\u00edteni",
                        it: "Confermare",
                        lt: "Patvirtinti",
                        nl: "Bevestigen",
                        no: "Bekrefte",
                        pl: "Potwierdza\u0107",
                        pt: "Confirmar",
                        ru: "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0442\u044c",
                        se: "Bekr\u00e4fta",
                        sk: "Potvrdi\u0165",
                        sl: "Potrditi",
                        uk: "\u041f\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0438",
                        zh: "\u786e\u8ba4",
                    },
                    readMore: {
                        ar: "\u0627\u0642\u0631\u0623 \u0623\u0643\u062b\u0631",
                        bg: "\u041f\u0440\u043e\u0447\u0435\u0442\u0435\u0442\u0435 \u043e\u0449\u0435",
                        ca: "Llegeix m\u00e9s",
                        cr: "\u010citaj vi\u0161e",
                        cs: "P\u0159e\u010dt\u011bte si v\u00edce",
                        da: "L\u00e6s mere",
                        de: "Weiterlesen",
                        en: "Read More",
                        es: "Leer m\u00e1s",
                        fi: "Lue lis\u00e4\u00e4",
                        fr: "Lire la suite",
                        hu: "Olvass tov\u00e1bb",
                        it: "Per saperne di pi\u00f9",
                        lt: "Skaityti daugiau",
                        nl: "Lees verder",
                        no: "Les mer",
                        pl: "Czytaj wi\u0119cej",
                        pt: "Ler Mais",
                        ru: "\u041f\u0440\u043e\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u0431\u043e\u043b\u044c\u0448\u0435",
                        se: "L\u00e4s mer",
                        sk: "\u010c\u00edta\u0165 viac",
                        sl: "Preberite ve\u010d",
                        uk: "\u0427\u0438\u0442\u0430\u0442\u0438 \u0434\u0430\u043b\u0456",
                        zh: "\u9605\u8bfb\u66f4\u591a",
                    },
                    doNotSell: {
                        ar: "\u0644\u0627 \u062a\u0628\u064a\u0639 \u0645\u0639\u0644\u0648\u0645\u0627\u062a\u064a \u0627\u0644\u0634\u062e\u0635\u064a\u0629",
                        bg: "\u041d\u0435 \u043f\u0440\u043e\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043c\u043e\u044f\u0442\u0430 \u043b\u0438\u0447\u043d\u0430 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f",
                        ca: "No venguis la meva informaci\u00f3 personal",
                        cr: "Ne prodajte moje osobne podatke",
                        cs: "Neprod\u00e1vejte m\u00e9 osobn\u00ed \u00fadaje",
                        da: "S\u00e6lg ikke mine personlige oplysninger",
                        de: "Verkaufe meine pers\u00f6nlichen Daten nicht",
                        en: "Do not sell my personal information",
                        es: "No venda mi informaci\u00f3n personal",
                        fi: "\u00c4l\u00e4 myy henkil\u00f6kohtaisia tietojani",
                        fr: "Ne vendez pas mes informations personnelles",
                        hu: "Ne adja el a szem\u00e9lyes adataimat",
                        it: "Non vendere le mie informazioni personali",
                        lt: "Neparduokite mano asmenin\u0117s informacijos",
                        nl: "Verkoop mijn persoonlijke gegevens niet",
                        no: "Ikke selg personlig informasjon",
                        pl: "Nie sprzedawaj moich danych osobowych",
                        pt: "N\u00e3o vender as minhas informa\u00e7\u00f5es pessoais",
                        ru: "\u041d\u0435 \u043f\u0440\u043e\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043c\u043e\u044e \u043b\u0438\u0447\u043d\u0443\u044e \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044e",
                        se: "S\u00e4lj inte min personliga information",
                        sk: "Nepred\u00e1va\u0165 moje osobn\u00e9 \u00fadaje",
                        sl: "Ne prodajajte osebnih podatkov",
                        uk: "\u041d\u0435 \u043f\u0440\u043e\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u043c\u043e\u044e \u043e\u0441\u043e\u0431\u0438\u0441\u0442\u0443 \u0456\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0456\u044e",
                        zh: "\u4e0d\u8981\u51fa\u552e\u6211\u7684\u4e2a\u4eba\u4fe1\u606f",
                    },
                },
                confirmation: {
                    text: {
                        ar: "\u0647\u0644 \u062a\u0631\u063a\u0628 \u062d\u0642\u064b\u0627 \u0641\u064a \u0627\u0644\u0627\u0646\u0633\u062d\u0627\u0628\u061f",
                        bg: "\u041d\u0430\u0438\u0441\u0442\u0438\u043d\u0430 \u043b\u0438 \u0438\u0441\u043a\u0430\u0442\u0435 \u0434\u0430 \u0441\u0435 \u043e\u0442\u043a\u0430\u0436\u0435\u0442\u0435?",
                        ca: "De deb\u00f2 voleu desactivar-la?",
                        cr: "\u017delite li zaista odustati?",
                        cs: "Opravdu si p\u0159ejete odhl\u00e1sit se?",
                        da: "Vil du virkelig frav\u00e6lge det?",
                        de: "M\u00f6chten Sie sich wirklich abmelden?",
                        en: "Do you really wish to opt out?",
                        es: "\u00bfRealmente desea darse de baja?",
                        fi: "Haluatko todella j\u00e4tt\u00e4yty\u00e4 pois?",
                        fr: "Souhaitez-vous vraiment vous d\u00e9sinscrire?",
                        hu: "T\u00e9nyleg le szeretne iratkoz\u00e1st?",
                        it: "Desideri davvero rinunciare?",
                        lt: "Ar tikrai norite atsisakyti?",
                        nl: "Wilt u zich echt afmelden?",
                        no: "Ali se res \u017eelite odjaviti?",
                        pl: "Czy na pewno chcesz zrezygnowa\u0107?",
                        pt: "Quer mesmo optar por n\u00e3o o fazer?",
                        ru: "\u0412\u044b \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u043e\u0442\u043a\u0430\u0437\u0430\u0442\u044c\u0441\u044f?",
                        se: "Vill du verkligen v\u00e4lja bort det?",
                        sk: "Naozaj sa chcete odhl\u00e1si\u0165?",
                        sl: "Ali se res \u017eelite odjaviti?",
                        uk: "\u0412\u0438 \u0434\u0456\u0439\u0441\u043d\u043e \u0431\u0430\u0436\u0430\u0454\u0442\u0435 \u0432\u0456\u0434\u043c\u043e\u0432\u0438\u0442\u0438\u0441\u044c?",
                        zh: "\u60a8\u771f\u7684\u8981\u9009\u62e9\u9000\u51fa\u5417\uff1f",
                    },
                },
                placeHolderText: {
                    ar: "\u064a\u064f\u0631\u062c\u0649 \u0642\u0628\u0648\u0644 \u0645\u0648\u0627\u0641\u0642\u0629 \u0645\u0644\u0641 \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637",
                    bg:
                        "\u041c\u043e\u043b\u044f, \u043f\u0440\u0438\u0435\u043c\u0435\u0442\u0435 \u0441\u044a\u0433\u043b\u0430\u0441\u0438\u0435\u0442\u043e \u0437\u0430 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u0442\u0435",
                    br: "Por favor, aceite o consentimento do cookie",
                    ca: "Si us plau, accepti el consentiment de la galeta",
                    cr: "Prihvatite pristanak za kola\u010di\u0107e",
                    cs: "P\u0159ijm\u011bte pros\u00edm souhlas se soubory cookie",
                    da: "Accepter cookie-samtykke",
                    de: "Bitte akzeptieren Sie die Cookie-Zustimmung",
                    en: "Please accept the cookie consent",
                    es: "Por favor, acepte el consentimiento de cookies",
                    fi: "Hyv\u00e4ksy ev\u00e4steen suostumus",
                    fr: "Veuillez accepter le consentement des cookies",
                    hu: "K\u00e9rj\u00fck, fogadja el a cookie-k beleegyez\u00e9s\u00e9t",
                    it: "Accetta il consenso sui cookie",
                    lt: "Pra\u0161ome sutikti su slapuko sutikimu",
                    nl: "Accepteer de cookietoestemming",
                    no: "Godta samtykke fra informasjonskapsel",
                    pl: "Prosimy o zaakceptowanie zgody na pliki cookie",
                    pt: "Por favor, aceite o consentimento do cookie",
                    ru: "\u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u0440\u0438\u043c\u0438\u0442\u0435 \u0441\u043e\u0433\u043b\u0430\u0441\u0438\u0435 cookie",
                    se: "Acceptera cookies samtycke",
                    sk: "Prijmite s\u00fahlas so s\u00faborom cookie",
                    sl: "Prosimo, sprejmite soglasje za pi\u0161kotek",
                    ts: "L\u00fctfen \u00e7erez onay\u0131n\u0131 kabul edin",
                    uk: "\u041f\u0440\u0438\u0439\u043c\u0456\u0442\u044c \u0437\u0433\u043e\u0434\u0443 \u043d\u0430 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u0430\u043d\u043d\u044f \u0444\u0430\u0439\u043b\u0456\u0432 cookie",
                    zh: "\u8bf7\u63a5\u53d7Cookie\u540c\u610f",
                },
                privacyPolicyLink: {
                    ar: "#",
                    bg: "#",
                    ca: "#",
                    cr: "#",
                    cs: "#",
                    da: "#",
                    de: "#",
                    en: "#",
                    es: "#",
                    fi: "#",
                    fr: "#",
                    hu: "#",
                    it: "#",
                    lt: "#",
                    nl: "#",
                    no: "#",
                    pl: "#",
                    pt: "#",
                    ru: "#",
                    se: "#",
                    sk: "#",
                    sl: "#",
                    uk: "#",
                    zh: "#",
                },
            },
        },
        display: { ccpa: { title: false, notice: true, buttons: { cancel: true, confirm: true, readMore: false, doNotSell: true }, noticeToggler: false } },
        version: "4.0.0",
        position: "bottom",
        template: {
            id: "classic",
            css:
                ".cky-consent-bar-trigger, .cky-consent-bar, .cky-modal, .cky-consent-bar-trigger *, .cky-consent-bar *, .cky-modal * { box-sizing: border-box; } .cky-consent-bar-trigger *:focus, .cky-consent-bar *:focus, .cky-modal *:focus { outline: 0; } .cky-consent-bar-trigger { position: fixed; right: 30px; padding: 2px 5px; font-size: 13px; cursor: pointer; font-family: inherit; animation: slide-up 0.4s ease; z-index: 9997; } .cky-consent-bar { font-family: inherit; position: fixed; z-index: 9997; } .cky-consent-bar .cky-consent-title { font-size: 15px; font-weight: bold; margin-bottom: 3px; } .cky-consent-bar p { line-height: 20px; font-size: 13px; font-weight: normal; margin-bottom: 0; margin-top: 0; } .cky-btn { font-size: 12px; padding: .5rem 1rem; background: none; cursor: pointer; display: inline-block; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; line-height: 1; transition: all .15s ease-in-out; margin: 0; min-height: auto; font-weight: normal; border-radius: 0; } .cky-btn:hover { opacity: .8; } .cky-btn:focus { outline: 0; } .cky-button-wrapper .cky-btn { margin-right: 15px; } .cky-button-wrapper .cky-btn:last-child { margin-right: 0; } .cky-btn.cky-btn-custom-accept { margin: 1.5rem 1rem; font-weight: 600; white-space: initial; word-break: break-word; } .cky-btn-readMore { cursor: pointer; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-btn-doNotSell { cursor: pointer; white-space: nowrap; font-weight: bold; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: flex; align-items: center; } .cky-consent-bar.cky-logo-active .cky-logo { margin-right: 30px; } @media (max-width: 540px) { .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: block; } } .cky-tab { display: -ms-flexbox; display: flex; } .cky-tab-menu { flex: 0 0 25%; max-width: 25%; } @media (max-width: 991px) { .cky-tab-menu { flex: 0 0 40%; max-width: 40%; } } .cky-tab-content { flex: 0 0 75%; max-width: 75%; background: transparent; padding: 15px 20px; } @media (max-width: 991px) { .cky-tab-content { flex: 0 0 60%; max-width: 60%; } } @media (max-width: 767px) { .cky-tab-content { padding: 15px; } } .cky-tab-item { font-size: 11px; cursor: pointer; font-weight: normal; border-bottom: 1px solid; border-right: 1px solid; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.5; } @media (max-width: 767px) { .cky-tab-item { font-size: 11px; padding: .75rem .75rem; } } .cky-tab-item-active { cursor: initial; border-right: 0; } .cky-tab-content .cky-tab-desc, .cky-tab-content .cky-tab-desc p { font-size: 12px; } .cky-tab-title { font-size: 13px; margin-bottom: 11px; margin-top: 0; font-family: inherit; font-weight: bold; line-height: 1; display: flex; align-items: center; } .cky-tab-content .cky-tab-content-item:not(.cky-tab-content-active) { display: none; } .cky-category-direct { display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; padding-top: 15px; margin-top: 15px; border-top: 1px solid #d4d8df; } .cky-category-direct .cky-btn-custom-accept { margin: 0 0 0 auto; } .cky-category-direct-item { display: -ms-flexbox; display: flex; -webkit-box-align: center; -ms-flex-align: center; align-items: center; margin-right: 32px; margin-bottom: 15px; } .cky-category-direct-item:last-child { margin-right: 0; } .cky-category-direct-item .cky-switch { margin-left: 0; } .cky-category-direct-item .cky-category-direct-name { margin-left: 10px; font-size: 12px; font-weight: 600; } .cky-category-direct +.cky-detail-wrapper { margin-top: 10px; } .cky-table-wrapper { width: 100%; max-width: 100%; overflow: auto; } .cky-cookie-audit-table { font-family: inherit; border-collapse: collapse; width: 100%; margin-top: 10px; } .cky-cookie-audit-table th { background-color: #d9dfe7; border: 1px solid #cbced6; } .cky-cookie-audit-table td { border: 1px solid #d5d8df; } .cky-cookie-audit-table th, .cky-cookie-audit-table td { text-align: left; padding: 10px; font-size: 12px; color: #000000; word-break:normal; } .cky-cookie-audit-table tr:nth-child(2n+1) td { background: #f1f5fa; } .cky-cookie-audit-table tr:nth-child(2n) td { background: #ffffff; } .cky-audit-table-element h5 { margin: 25px 0 2px 0; } .cky-audit-table-element .cky-table-wrapper { margin-bottom: 1rem; } .cky-consent-bar.cky-rtl { direction: rtl; text-align: right; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn { margin-right: 0; margin-left: 15px; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn:last-child { margin-left: 0; } .cky-consent-bar.cky-rtl .cky-btn-readMore { margin-left: 0; margin-right: 6px; } .cky-consent-bar.cky-rtl.cky-logo-active .cky-logo { margin-right: 0px; margin-left: 30px; } .cky-switch { position: relative; min-height: 13px; padding-left: 25px; font-size: 14px; margin-left: 20px; margin-bottom: 0; display: inline-block; } .cky-switch input[type='checkbox'] { display: none !important; } .cky-switch .cky-slider { background-color: #e3e1e8; border-radius: 34px; height: 13px; width: 25px; bottom: 0; cursor: pointer; left: 0; position: absolute; right: 0; transition: .4s; } .cky-switch .cky-slider:before { background-color: #fff; border-radius: 50%; bottom: 2px; content: ''; height: 9px; left: 2px; position: absolute; transition: .4s; width: 9px; } .cky-switch input:checked+.cky-slider { background-color: #008631; } .cky-switch input:disabled+.cky-slider { cursor: initial; } .cky-switch input:checked+.cky-slider:before { transform: translateX(12px); } .cky-modal.cky-fade .cky-modal-dialog { transition: -webkit-transform .3s ease-out; transition: transform .3s ease-out; transition: transform .3s ease-out, -webkit-transform .3s ease-out; -webkit-transform: translate(0, -25%); transform: translate(0, -25%); } .cky-modal.cky-show .cky-modal-dialog { -webkit-transform: translate(0, 0); transform: translate(0, 0); } .cky-modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9998; background-color: rgba(10, 10, 10, 0.22); display: none; } .cky-modal-backdrop.cky-fade { opacity: 0; } .cky-modal-backdrop.cky-show { opacity: 1; display: block; } .cky-modal { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999; display: none; overflow: hidden; outline: 0; min-height: calc(100% - (.5rem * 2)); } .cky-modal.cky-show { display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; } .cky-modal a { text-decoration: none; } .cky-modal .cky-modal-dialog { position: relative; max-width: calc(100% - 16px); width: calc(100% - 16px); margin: .5rem; pointer-events: none; font-family: inherit; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; text-align: left; display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); -webkit-box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); } @media (min-width: 576px) { .cky-modal .cky-modal-dialog { max-width: 500px; width: 500px; margin: 1.75rem auto; } .cky-modal { min-height: calc(100% - (1.75rem * 2)); } } @media (min-width: 991px) { .cky-modal .cky-modal-dialog { max-width: 900px; width: 900px; } } .cky-modal-content { display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; width: 100%; pointer-events: auto; background-clip: padding-box; border: 0; border-radius: 4px; overflow: hidden; outline: 0; margin: 40px; } .cky-modal.cky-rtl { direction: rtl; text-align: right; } .ccpa.cky-modal .cky-modal-dialog { max-width: 300px; width: 300px; border-radius: 5px; } .ccpa.cky-modal .cky-modal-content { margin: 25px; text-align: center; font-weight: 600; } .ccpa.cky-modal .cky-opt-out-text { margin-bottom: 20px; } .cky-consent-bar.cky-classic { width: 100%; display: block; box-shadow: 0 -1px 10px 0 rgba(172, 171, 171, 0.3); } .cky-classic .cky-content-wrapper { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; justify-content: space-between; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; } .cky-classic .cky-button-wrapper { margin-left: 20px; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; flex-wrap: nowrap; } .cky-consent-bar.cky-classic p { text-align: left; } .cky-classic .cky-btn-settings { margin-left: auto; position: relative; padding-right: 1rem; } .cky-classic .cky-btn-settings:before { border-style: solid; border-width: 1px 1px 0 0; content: ''; display: inline-block; height: 4px; right: 8px; position: absolute; border-color: #beb8b8; top: 11px; transform: rotate(135deg); vertical-align: middle; width: 4px; } .cky-classic .cky-btn-settings[expanded]:before { transform: rotate(-45deg); } .cky-classic .cky-consent-bar.cky-rtl .cky-button-wrapper { margin-left: 0; margin-right: 20px; } .cky-classic .cky-consent-bar.cky-rtl p { text-align: right; } @media(min-width: 991px) { .cky-consent-bar.cky-classic { padding: 15px 50px; } } @media(min-width: 1150px) { .cky-consent-bar.cky-classic { padding: 15px 130px; } } @media(min-width: 1415px) { .cky-consent-bar.cky-classic { padding: 15px 160px; } } @media (max-width: 991px) { .cky-classic .cky-button-wrapper { margin-left: 0; margin-top: 20px; } .cky-consent-bar.cky-classic, .cky-consent-bar.cky-classic p, .cky-classic .cky-button-wrapper, .cky-classic .cky-content-wrapper { display: block; text-align: center; } } .cky-detail-wrapper { margin-top: 30px; border: 1px solid #d4d8df; border-radius: 2px; overflow: hidden; } .cky-tab-content { width: 100%; } .cky-tab-item { padding: .5rem 1rem; align-items: center; } .cky-tab-content .cky-tab-desc { min-height: 155px; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } @media (max-width: 767px) { .cky-tab-content .cky-tab-desc { max-height: 155px; } } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-switch { margin-left: 0; margin-right: 20px; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item { border-right: none; border-left: 1px solid; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item.cky-tab-item-active { border-left: 0; }",
            detailType: "sticky",
        },
        tldomain: "www.tyndale.com",
        behaviour: { reload: true, showLogo: true, acceptOnScroll: false, defaultConsent: false, showAuditTable: true, selectedLanguage: "en" },
        customCss: null,
        geoTarget: { ccpa: { us: false, california: false } },
        consentType: "explicit",
        selectedLaws: ["ccpa"],
        consentBarType: "classic",
        showCategoryDirectly: false,
    },
    info: {
        categories: [
            {
                id: 160954,
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
                    da: "N\u00f8dvendig",
                    ru: "\u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e",
                    ar: "\u0636\u0631\u0648\u0631\u064a",
                    pl: "niezb\u0119dny",
                    pt: "Necess\u00e1rio",
                    ca: "Necessari",
                    hu: "Sz\u00fcks\u00e9ges",
                    se: "N\u00f6dv\u00e4ndig",
                    cr: "Potrebno",
                    zh: "\u5fc5\u8981\u7684",
                    uk: "\u041d\u0435\u043e\u0431\u0445\u0456\u0434\u043d\u043e",
                    sk: "Nevyhnutn\u00e9",
                    ts: "Gerekli",
                    lt: "B\u016btinas",
                    cs: "Nezbytn\u00e9",
                    fi: "V\u00e4ltt\u00e4m\u00e4t\u00f6n",
                    no: "N\u00f8dvendig",
                    br: "Necess\u00e1rio",
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
                    fr:
                        "<p>Les cookies n\u00e9cessaires sont cruciaux pour les fonctions de base du site Web et celui-ci ne fonctionnera pas comme pr\u00e9vu sans eux.</p><p>Ces cookies ne stockent aucune donn\u00e9e personnellement identifiable.</p>",
                    it:
                        "<p>I cookie necessari sono fondamentali per le funzioni di base del sito Web e il sito Web non funzioner\u00e0 nel modo previsto senza di essi.</p><p>Questi cookie non memorizzano dati identificativi personali.</p>",
                    es:
                        "<p>Las cookies necesarias son cruciales para las funciones b\u00e1sicas del sitio web y el sitio web no funcionar\u00e1 de la forma prevista sin ellas.</p><p>Estas cookies no almacenan ning\u00fan dato de identificaci\u00f3n personal.</p>",
                    nl: "<p>Noodzakelijke cookies zijn cruciaal voor de basisfuncties van de website en zonder deze werkt de website niet op de beoogde manier.</p><p>Deze cookies slaan geen persoonlijk identificeerbare gegevens op.</p>",
                    bg:
                        "<p>\u041d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u0438\u0442\u0435 \u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438 \u0441\u0430 \u043e\u0442 \u0440\u0435\u0448\u0430\u0432\u0430\u0449\u043e \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0437\u0430 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u0442\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043d\u0430 \u0441\u0430\u0439\u0442\u0430 \u0438 \u0443\u0435\u0431\u0441\u0430\u0439\u0442\u044a\u0442 \u043d\u044f\u043c\u0430 \u0434\u0430 \u0440\u0430\u0431\u043e\u0442\u0438 \u043f\u043e \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0431\u0435\u0437 \u0442\u044f\u0445.</p><p>\u0422\u0435\u0437\u0438 \u201e\u0431\u0438\u0441\u043a\u0432\u0438\u0442\u043a\u0438\u201c \u043d\u0435 \u0441\u044a\u0445\u0440\u0430\u043d\u044f\u0432\u0430\u0442 \u043b\u0438\u0447\u043d\u0438 \u0434\u0430\u043d\u043d\u0438.</p>",
                    da:
                        "<p>N\u00f8dvendige cookies er afg\u00f8rende for de grundl\u00e6ggende funktioner p\u00e5 webstedet, og webstedet fungerer ikke p\u00e5 sin tilsigtede m\u00e5de uden dem.</p><p>Disse cookies gemmer ikke personligt identificerbare data.</p>",
                    ru:
                        "<p>\u041d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u044b\u0435 \u0444\u0430\u0439\u043b\u044b cookie \u044f\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u043e\u0441\u043d\u043e\u0432\u043d\u044b\u043c\u0438 \u0444\u0443\u043d\u043a\u0446\u0438\u044f\u043c\u0438 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0430, \u0438 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u043d\u0435 \u0431\u0443\u0434\u0435\u0442 \u0440\u0430\u0431\u043e\u0442\u0430\u0442\u044c \u043f\u043e \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044e.</p> <p>\u042d\u0442\u0438 \u043a\u0443\u043a\u0438 \u043d\u0435 \u0445\u0440\u0430\u043d\u044f\u0442 \u043a\u0430\u043a\u0438\u0435-\u043b\u0438\u0431\u043e \u043b\u0438\u0447\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435.</p>",
                    ar:
                        "<p>\u062a\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0636\u0631\u0648\u0631\u064a\u0629 \u0636\u0631\u0648\u0631\u064a\u0629 \u0644\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0644\u0644\u0645\u0648\u0642\u0639 \u0648\u0644\u0646 \u064a\u0639\u0645\u0644 \u0627\u0644\u0645\u0648\u0642\u0639 \u0628\u0627\u0644\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0645\u0642\u0635\u0648\u062f\u0629 \u0628\u062f\u0648\u0646\u0647\u0627.</p> <p>\u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0644\u0627 \u062a\u062e\u0632\u0646 \u0623\u064a \u0628\u064a\u0627\u0646\u0627\u062a \u0634\u062e\u0635\u064a\u0629.</p>",
                    pl:
                        "<p> Niezb\u0119dne pliki cookie maj\u0105 kluczowe znaczenie dla podstawowych funkcji witryny i witryna nie b\u0119dzie dzia\u0142a\u0107 w zamierzony spos\u00f3b bez nich. </p> <p> Te pliki cookie nie przechowuj\u0105 \u017cadnych danych umo\u017cliwiaj\u0105cych identyfikacj\u0119 osoby. </p>",
                    pt:
                        "<p>Os cookies necess\u00e1rios s\u00e3o cruciais para as fun\u00e7\u00f5es b\u00e1sicas do site e o site n\u00e3o funcionar\u00e1 da maneira pretendida sem eles.</p> <p>Esses cookies n\u00e3o armazenam nenhum dado de identifica\u00e7\u00e3o pessoal.</p>",
                    ca:
                        "<p>Les cookies necess\u00e0ries s\u00f3n crucials per a les funcions b\u00e0siques del lloc web i el lloc web no funcionar\u00e0 de la manera prevista sense elles.</p> <p>Aquestes cookies no emmagatzemen cap dada d\u2019identificaci\u00f3 personal.</p>",
                    hu:
                        "<p>A sz\u00fcks\u00e9ges s\u00fctik d\u00f6nt\u0151 fontoss\u00e1g\u00faak a weboldal alapvet\u0151 funkci\u00f3i szempontj\u00e1b\u00f3l, \u00e9s a weboldal ezek n\u00e9lk\u00fcl nem fog megfelel\u0151en m\u0171k\u00f6dni.</p> <p>Ezek a s\u00fctik nem t\u00e1rolnak szem\u00e9lyazonos\u00edt\u00e1sra alkalmas adatokat.</p>",
                    se:
                        "<p>N\u00f6dv\u00e4ndiga cookies \u00e4r avg\u00f6rande f\u00f6r webbplatsens grundl\u00e4ggande funktioner och webbplatsen fungerar inte p\u00e5 det avsedda s\u00e4ttet utan dem.</p> <p>Dessa cookies lagrar inga personligt identifierbara uppgifter.</p>",
                    cr:
                        "<p>Potrebni kola\u010di\u0107i presudni su za osnovne funkcije web stranice i web stranica bez njih ne\u0107e raditi na predvi\u0111eni na\u010din.</p> <p>Ovi kola\u010di\u0107i ne pohranjuju nikakve osobne podatke.</p>",
                    zh:
                        "<p>\u5fc5\u8981\u7684cookie\u5bf9\u4e8e\u7f51\u7ad9\u7684\u57fa\u672c\u529f\u80fd\u81f3\u5173\u91cd\u8981\uff0c\u6ca1\u6709\u5b83\u4eec\uff0c\u7f51\u7ad9\u5c06\u65e0\u6cd5\u6b63\u5e38\u5de5\u4f5c\u3002</ p> <p>\u8fd9\u4e9bcookie\u4e0d\u4f1a\u5b58\u50a8\u4efb\u4f55\u4e2a\u4eba\u8eab\u4efd\u6570\u636e\u3002</p>",
                    uk:
                        "<p>\u041d\u0435\u043e\u0431\u0445\u0456\u0434\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u043c\u0430\u044e\u0442\u044c \u0432\u0438\u0440\u0456\u0448\u0430\u043b\u044c\u043d\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u043d\u044f \u0434\u043b\u044f \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u0445 \u0444\u0443\u043d\u043a\u0446\u0456\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443, \u0456 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u0431\u0435\u0437 \u043d\u0438\u0445 \u043d\u0435 \u043f\u0440\u0430\u0446\u044e\u0432\u0430\u0442\u0438\u043c\u0435 \u043d\u0430\u043b\u0435\u0436\u043d\u0438\u043c \u0447\u0438\u043d\u043e\u043c. </p> <p> \u0426\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u043d\u0435 \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u044e\u0442\u044c \u0436\u043e\u0434\u043d\u0438\u0445 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u0438\u0445 \u0434\u0430\u043d\u0438\u0445.</p>",
                    sk:
                        "<p>Potrebn\u00e9 s\u00fabory cookie s\u00fa pre z\u00e1kladn\u00e9 funkcie webov\u00fdch str\u00e1nok z\u00e1sadn\u00e9 a webov\u00e9 str\u00e1nky bez nich nebud\u00fa fungova\u0165 zam\u00fd\u0161\u013ean\u00fdm sp\u00f4sobom. </p> <p> Tieto s\u00fabory cookie neukladaj\u00fa \u017eiadne osobn\u00e9 identifika\u010dn\u00e9 \u00fadaje.</p>",
                    ts:
                        "<p>Gerekli \u00e7erezler, web sitesinin temel i\u015flevleri i\u00e7in \u00e7ok \u00f6nemlidir ve web sitesi bunlar olmadan ama\u00e7land\u0131\u011f\u0131 \u015fekilde \u00e7al\u0131\u015fmayacakt\u0131r. </p> <p> Bu \u00e7erezler ki\u015fisel olarak tan\u0131mlanabilecek herhangi bir veriyi saklamaz.</p>",
                    lt:
                        "<p>B\u016btini slapukai yra labai svarb\u016bs pagrindin\u0117ms svetain\u0117s funkcijoms atlikti, o svetain\u0117 be j\u0173 neveiks numatytu b\u016bdu.</p> <p>\u0160ie slapukai nesaugo asmens identifikavimo duomen\u0173.</p>",
                    cs:
                        "<p>Nezbytn\u00e9 soubory cookie jsou z\u00e1sadn\u00ed pro z\u00e1kladn\u00ed funkce webu a web bez nich nebude fungovat zam\u00fd\u0161len\u00fdm zp\u016fsobem. </p> <p> Tyto soubory cookie neukl\u00e1daj\u00ed \u017e\u00e1dn\u00e1 osobn\u00ed identifika\u010dn\u00ed data.</p>",
                    fi:
                        "<p>Tarvittavat ev\u00e4steet ovat ratkaisevan t\u00e4rkeit\u00e4 verkkosivuston perustoiminnoille, eik\u00e4 verkkosivusto toimi tarkoitetulla tavalla ilman niit\u00e4.</p> <p>N\u00e4m\u00e4 ev\u00e4steet eiv\u00e4t tallenna henkil\u00f6kohtaisia tietoja.</p>",
                    no:
                        "<p>N\u00f8dvendige cookies er avgj\u00f8rende for grunnleggende funksjoner p\u00e5 nettstedet, og nettstedet fungerer ikke p\u00e5 den tiltenkte m\u00e5ten uten dem. </p> <p> Disse cookies lagrer ikke personlig identifiserbare data.</p>",
                    br:
                        "<p>Os cookies necess\u00e1rios s\u00e3o cruciais para as fun\u00e7\u00f5es b\u00e1sicas do site e o site n\u00e3o funcionar\u00e1 como pretendido sem eles.</p> <p>Esses cookies n\u00e3o armazenam nenhum dado pessoalmente identific\u00e1vel.</p>",
                    sl:
                        "<p>Potrebni pi\u0161kotki so klju\u010dni za osnovne funkcije spletne strani in spletna stran brez njih ne bo delovala na svoj predviden na\u010din.</p> <p>Ti pi\u0161kotki ne shranjujejo nobenih osebnih podatkov, ki bi jih bilo mogo\u010de identificirati.</p>",
                },
                scripts: [
                    {
                        id: 56248,
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
                            ts: "Necessary",
                            lt: "Necessary",
                            cs: "Necessary",
                            fi: "Necessary",
                            no: "Necessary",
                            br: "Necessary",
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
                            ts: "These cookies help to perform the critical functions of the website.",
                            lt: "These cookies help to perform the critical functions of the website.",
                            cs: "These cookies help to perform the critical functions of the website.",
                            fi: "These cookies help to perform the critical functions of the website.",
                            no: "These cookies help to perform the critical functions of the website.",
                            br: "These cookies help to perform the critical functions of the website.",
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
                        id: 295636,
                        cookie_id: "cookielawinfo-checkbox-necessary",
                        description: {
                            en: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            de: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            fr: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            it: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            es: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            nl: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            bg: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            da: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            ru: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            ar: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            pl: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            pt: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            ca: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            hu: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            se: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            cr: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            zh: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            uk: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            sk: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            ts: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            lt: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            cs: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            fi: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            no: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            br: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                            sl: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Necessary".',
                        },
                        duration: "1 year",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295637,
                        cookie_id: "cookielawinfo-checkbox-non-necessary",
                        description: {
                            en: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            de: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            fr: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            it: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            es: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            nl: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            bg: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            da: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            ru: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            ar: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            pl: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            pt: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            ca: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            hu: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            se: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            cr: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            zh: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            uk: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            sk: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            ts: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            lt: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            cs: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            fi: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            no: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            br: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                            sl: 'This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category "Non-necessary".',
                        },
                        duration: "1 year",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295638,
                        cookie_id: "cookielawinfo-checkbox-advertisement",
                        description: {
                            en: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            de: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            fr: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            it: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            es: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            nl: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            bg: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            da: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            ru: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            ar: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            pl: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            pt: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            ca: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            hu: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            se: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            cr: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            zh: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            uk: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            sk: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            ts: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            lt: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            cs: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            fi: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            no: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            br: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                            sl: 'The cookie is set by GDPR cookie consent to record the user consent for the cookies in the category "Advertisement".',
                        },
                        duration: "1 year",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295639,
                        cookie_id: "cookielawinfo-checkbox-analytics",
                        description: {
                            en: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            de: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            fr: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            it: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            es: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            nl: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            bg: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            da: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            ru: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            ar: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            pl: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            pt: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            ca: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            hu: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            se: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            cr: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            zh: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            uk: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            sk: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            ts: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            lt: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            cs: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            fi: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            no: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            br: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                            sl: 'This cookies is set by GDPR Cookie Consent WordPress Plugin. The cookie is used to remember the user consent for the cookies under the category "Analytics".',
                        },
                        duration: "1 year",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295640,
                        cookie_id: "cookielawinfo-checkbox-performance",
                        description: {
                            en: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            de: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            fr: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            it: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            es: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            nl: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            bg: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            da: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            ru: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            ar: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            pl: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            pt: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            ca: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            hu: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            se: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            cr: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            zh: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            uk: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            sk: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            ts: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            lt: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            cs: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            fi: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            no: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            br: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                            sl: 'This cookie is set by GDPR Cookie Consent plugin. The cookie is used to store the user consent for the cookies in the category "Performance".',
                        },
                        duration: "1 year",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295641,
                        cookie_id: "ARRAffinity",
                        description: {
                            en: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            de: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            fr: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            it: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            es: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            nl: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            bg: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            da: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            ru: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            ar: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            pl: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            pt: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            ca: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            hu: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            se: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            cr: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            zh: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            uk: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            sk: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            ts: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            lt: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            cs: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            fi: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            no: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            br: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                            sl: "This cookie is set by websites that run on Windows Azure cloud platform. The cookie is used to affinitize a client to an instance of an Azure Web App.",
                        },
                        duration: "session",
                        type: "https",
                        domain: ".tynadmin.tyndale.com",
                    },
                    {
                        id: 295642,
                        cookie_id: "OptanonConsent",
                        description: {
                            en: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            de: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            fr: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            it: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            es: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            nl: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            bg: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            da: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            ru: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            ar: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            pl: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            pt: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            ca: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            hu: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            se: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            cr: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            zh: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            uk: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            sk: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            ts: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            lt: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            cs: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            fi: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            no: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            br: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                            sl: "This cookie is set by OneTrust cookie consent solution. The cookies is used for storing the information about the users consent based on which the cookies will be set on the browser.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295643,
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
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            cr:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            zh:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            uk:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            sk:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            ts:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            lt:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            cs:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            fi:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            no:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            br:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                            sl:
                                "The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                        },
                        duration: "1 month",
                        type: "https",
                        domain: ".cookielaw.org",
                    },
                    {
                        id: 295644,
                        cookie_id: "JSESSIONID",
                        description: {
                            en: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
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
                            se: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            cr: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            zh: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            uk: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            sk: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            ts: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            lt: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            cs: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            fi: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            no: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            br: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                            sl: "Used by sites written in JSP. General purpose platform session cookies that are used to maintain users' state across page requests.",
                        },
                        duration: "",
                        type: "https",
                        domain: "newton.newtonsoftware.com",
                    },
                    {
                        id: 295645,
                        cookie_id: "AWSELB",
                        description: {
                            en: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            de: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            fr: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            it: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            es: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            nl: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            bg: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            da: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            ru: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            ar: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            pl: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            pt: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            ca: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            hu: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            se: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            cr: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            zh: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            uk: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            sk: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            ts: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            lt: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            cs: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            fi: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            no: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            br: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                            sl: "This cookie is associated with Amazon Web Services and is used for managing sticky sessions across production servers.",
                        },
                        duration: "",
                        type: "https",
                        domain: "newton.newtonsoftware.com",
                    },
                    {
                        id: 295646,
                        cookie_id: "XSRF-TOKEN",
                        description: {
                            en: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            de: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            fr: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            it: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            es: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            nl: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            bg: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            da: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            ru: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            ar: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            pl: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            pt: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            ca: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            hu: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            se: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            cr: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            zh: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            uk: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            sk: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            ts: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            lt: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            cs: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            fi: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            no: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            br: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                            sl: "The cookie is set by Wix website building platform on Wix website. The cookie is used for security purposes.",
                        },
                        duration: "session",
                        type: "https",
                        domain: "gleam.io",
                    },
                ],
            },
            {
                id: 160955,
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
                    da: "Funktionel",
                    ru: "\u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u0430\u044f",
                    ar: "\u0648\u0638\u064a\u0641\u064a",
                    pl: "Funkcjonalny",
                    pt: "Funcional",
                    ca: "Funcional",
                    hu: "Funkcion\u00e1lis",
                    se: "Funktionell",
                    cr: "Funcional",
                    zh: "\u529f\u80fd\u6027",
                    uk: "\u0424\u0443\u043d\u043a\u0446\u0456\u043e\u043d\u0430\u043b\u044c\u043d\u0438\u0439",
                    sk: "Funk\u010dn\u00e9",
                    ts: "\u0130\u015flevsel",
                    lt: "Funkcinis",
                    cs: "Funk\u010dn\u00ed",
                    fi: "Toimiva",
                    no: "Funksjonell",
                    br: "Funcional",
                    sl: "Funkcionalno",
                },
                defaultConsent: 0,
                active: 1,
                settings: { ccpa: { doNotSell: "1" } },
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
                    da: "<p>Funktionelle cookies hj\u00e6lper med at udf\u00f8re visse funktionaliteter, som at dele indholdet af webstedet p\u00e5 sociale medieplatforme, indsamle feedbacks og andre tredjepartsfunktioner.</p>",
                    ru:
                        "<p>\u041f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b \u0441\u043e\u0446\u0438\u0430\u043b\u044c\u043d\u044b\u0445 \u0441\u0435\u0442\u0435\u0439, \u043e\u0442\u0437\u044b\u0432\u044b \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u043e\u043d\u0435\u0440\u043e\u0432 \u0438 \u0434\u0440\u0443\u0433\u0438\u0435 \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0438\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u043d\u0430 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0435 \u0441\u043e\u0432\u043c\u0435\u0441\u0442\u043d\u043e \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442 \u043d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0444\u0443\u043d\u043a\u0446\u0438\u0438 \u0434\u043b\u044f \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0438 \u0444\u0443\u043d\u043a\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0445 \u0444\u0430\u0439\u043b\u043e\u0432 cookie.</p>",
                    ar:
                        "<p>\u062a\u0633\u0627\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0648\u0638\u064a\u0641\u064a\u0629 \u0639\u0644\u0649 \u0623\u062f\u0627\u0621 \u0648\u0638\u0627\u0626\u0641 \u0645\u0639\u064a\u0646\u0629 \u0645\u062b\u0644 \u0645\u0634\u0627\u0631\u0643\u0629 \u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0645\u0648\u0642\u0639 \u0639\u0644\u0649 \u0645\u0646\u0635\u0627\u062a \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062c\u062a\u0645\u0627\u0639\u064a \u060c \u0648\u062c\u0645\u0639 \u0627\u0644\u062a\u0639\u0644\u064a\u0642\u0627\u062a \u060c \u0648\u063a\u064a\u0631\u0647\u0627 \u0645\u0646 \u0645\u064a\u0632\u0627\u062a \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062b\u0627\u0644\u062b.</p>",
                    pl:
                        "<p> Funkcjonalne pliki cookie pomagaj\u0105 wykonywa\u0107 pewne funkcje, takie jak udost\u0119pnianie zawarto\u015bci witryny na platformach medi\u00f3w spo\u0142eczno\u015bciowych, zbieranie informacji zwrotnych i inne funkcje stron trzecich. </p>",
                    pt: "<p>Os cookies funcionais ajudam a realizar certas funcionalidades, como compartilhar o conte\u00fado do site em plataformas de m\u00eddia social, coletar feedbacks e outros recursos de terceiros.</p>",
                    ca: "<p>Les cookies funcionals ajuden a realitzar determinades funcionalitats com compartir el contingut del lloc web a les plataformes de xarxes socials, recopilar comentaris i altres funcions de tercers.</p>",
                    hu:
                        "<p>A funkcion\u00e1lis s\u00fctik seg\u00edtenek bizonyos funkci\u00f3k v\u00e9grehajt\u00e1s\u00e1ban, p\u00e9ld\u00e1ul a weboldal tartalm\u00e1nak megoszt\u00e1s\u00e1ban a k\u00f6z\u00f6ss\u00e9gi m\u00e9dia platformokon, visszajelz\u00e9sek gy\u0171jt\u00e9s\u00e9ben \u00e9s m\u00e1s, harmadik f\u00e9lt\u0151l sz\u00e1rmaz\u00f3 funkci\u00f3kban.</p>",
                    se: "<p>Funktionella cookies hj\u00e4lper till att utf\u00f6ra vissa funktioner som att dela inneh\u00e5llet p\u00e5 webbplatsen p\u00e5 sociala medieplattformar, samla in feedback och andra tredjepartsfunktioner.</p>",
                    cr:
                        "<p>Funkcionalni kola\u010di\u0107i poma\u017eu u izvo\u0111enju odre\u0111enih funkcionalnosti poput dijeljenja sadr\u017eaja web mjesta na platformama dru\u0161tvenih medija, prikupljanja povratnih informacija i ostalih zna\u010dajki tre\u0107ih strana.</p>",
                    zh:
                        "<p>\u529f\u80fdcookie\u6709\u52a9\u4e8e\u6267\u884c\u67d0\u4e9b\u529f\u80fd\uff0c\u4f8b\u5982\u5728\u793e\u4ea4\u5a92\u4f53\u5e73\u53f0\u4e0a\u5171\u4eab\u7f51\u7ad9\u7684\u5185\u5bb9\uff0c\u6536\u96c6\u53cd\u9988\u548c\u5176\u4ed6\u7b2c\u4e09\u65b9\u529f\u80fd\u3002</p>",
                    uk:
                        "<p>\u0424\u0443\u043d\u043a\u0446\u0456\u043e\u043d\u0430\u043b\u044c\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0434\u043e\u043f\u043e\u043c\u0430\u0433\u0430\u044e\u0442\u044c \u0432\u0438\u043a\u043e\u043d\u0443\u0432\u0430\u0442\u0438 \u043f\u0435\u0432\u043d\u0456 \u0444\u0443\u043d\u043a\u0446\u0456\u043e\u043d\u0430\u043b\u044c\u043d\u0456 \u043c\u043e\u0436\u043b\u0438\u0432\u043e\u0441\u0442\u0456, \u0442\u0430\u043a\u0456 \u044f\u043a \u043e\u0431\u043c\u0456\u043d \u0432\u043c\u0456\u0441\u0442\u043e\u043c \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443 \u043d\u0430 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430\u0445 \u0441\u043e\u0446\u0456\u0430\u043b\u044c\u043d\u0438\u0445 \u043c\u0435\u0434\u0456\u0430, \u0437\u0431\u0456\u0440 \u0432\u0456\u0434\u0433\u0443\u043a\u0456\u0432 \u0442\u0430 \u0456\u043d\u0448\u0456 \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0456 \u0444\u0443\u043d\u043a\u0446\u0456\u0457.</p>",
                    sk:
                        "<p>Funk\u010dn\u00e9 s\u00fabory cookie pom\u00e1haj\u00fa vykon\u00e1va\u0165 ur\u010dit\u00e9 funkcie, ako je zdie\u013eanie obsahu webov\u00fdch str\u00e1nok na platform\u00e1ch soci\u00e1lnych m\u00e9di\u00ed, zhroma\u017e\u010fovanie sp\u00e4tn\u00fdch v\u00e4zieb a \u010fal\u0161ie funkcie tret\u00edch str\u00e1n.</p>",
                    ts:
                        "<p>\u0130\u015flevsel \u00e7erezler, web sitesinin i\u00e7eri\u011fini sosyal medya platformlar\u0131nda payla\u015fmak, geri bildirim toplamak ve di\u011fer \u00fc\u00e7\u00fcnc\u00fc taraf \u00f6zellikleri gibi belirli i\u015flevlerin ger\u00e7ekle\u015ftirilmesine yard\u0131mc\u0131 olur.</p>",
                    lt:
                        "<p>Funkciniai cookies padeda atlikti tam tikras funkcijas, pavyzd\u017eiui, dalytis svetain\u0117s turiniu socialin\u0117s \u017einiasklaidos platformose, rinkti atsiliepimus ir kitas tre\u010di\u0173j\u0173 \u0161ali\u0173 funkcijas.</p>",
                    cs:
                        "<p>Funk\u010dn\u00ed soubory cookie pom\u00e1haj\u00ed prov\u00e1d\u011bt ur\u010dit\u00e9 funkce, jako je sd\u00edlen\u00ed obsahu webov\u00fdch str\u00e1nek na platform\u00e1ch soci\u00e1ln\u00edch m\u00e9di\u00ed, shroma\u017e\u010fov\u00e1n\u00ed zp\u011btn\u00fdch vazeb a dal\u0161\u00ed funkce t\u0159et\u00edch stran.</p>",
                    fi:
                        "<p>Toiminnalliset ev\u00e4steet auttavat suorittamaan tiettyj\u00e4 toimintoja, kuten verkkosivuston sis\u00e4ll\u00f6n jakamista sosiaalisen median alustoilla, palautteiden ker\u00e4\u00e4mist\u00e4 ja muita kolmannen osapuolen ominaisuuksia.</p>",
                    no: "<p>Funksjonelle cookies hjelper deg med \u00e5 utf\u00f8re visse funksjoner som \u00e5 dele innholdet p\u00e5 nettstedet p\u00e5 sosiale medieplattformer, samle tilbakemeldinger og andre tredjepartsfunksjoner.</p>",
                    br: "<p>Cookies funcionais ajudam a executar certas funcionalidades, como compartilhar o conte\u00fado do site em plataformas de m\u00eddia social, coletar feedbacks e outros recursos de terceiros.</p>",
                    sl:
                        "<p>Funkcionalni pi\u0161kotki pomagajo izvajati dolo\u010dene funkcionalnosti, kot so skupna raba vsebine spletnega mesta na platformah dru\u017ebenih medijev, zbiranje povratnih informacij in druge funkcije tretjih oseb.</p>",
                },
                scripts: [
                    {
                        id: 56262,
                        name: {
                            en: "Pubmatic",
                            de: "Pubmatic",
                            fr: "Pubmatic",
                            it: "Pubmatic",
                            es: "Pubmatic",
                            nl: "Pubmatic",
                            bg: "Pubmatic",
                            da: "Pubmatic",
                            ru: "Pubmatic",
                            ar: "Pubmatic",
                            pl: "Pubmatic",
                            pt: "Pubmatic",
                            ca: "Pubmatic",
                            hu: "Pubmatic",
                            se: "Pubmatic",
                            cr: "Pubmatic",
                            zh: "Pubmatic",
                            uk: "Pubmatic",
                            sk: "Pubmatic",
                            ts: "Pubmatic",
                            lt: "Pubmatic",
                            cs: "Pubmatic",
                            fi: "Pubmatic",
                            no: "Pubmatic",
                            br: "Pubmatic",
                            sl: "Pubmatic",
                        },
                        description: {
                            en: "Pubmatic provides website owners with programmatic advertising solutions.",
                            de: "Pubmatic provides website owners with programmatic advertising solutions.",
                            fr: "Pubmatic provides website owners with programmatic advertising solutions.",
                            it: "Pubmatic provides website owners with programmatic advertising solutions.",
                            es: "Pubmatic provides website owners with programmatic advertising solutions.",
                            nl: "Pubmatic provides website owners with programmatic advertising solutions.",
                            bg: "Pubmatic provides website owners with programmatic advertising solutions.",
                            da: "Pubmatic provides website owners with programmatic advertising solutions.",
                            ru: "Pubmatic provides website owners with programmatic advertising solutions.",
                            ar: "Pubmatic provides website owners with programmatic advertising solutions.",
                            pl: "Pubmatic provides website owners with programmatic advertising solutions.",
                            pt: "Pubmatic provides website owners with programmatic advertising solutions.",
                            ca: "Pubmatic provides website owners with programmatic advertising solutions.",
                            hu: "Pubmatic provides website owners with programmatic advertising solutions.",
                            se: "Pubmatic provides website owners with programmatic advertising solutions.",
                            cr: "Pubmatic provides website owners with programmatic advertising solutions.",
                            zh: "Pubmatic provides website owners with programmatic advertising solutions.",
                            uk: "Pubmatic provides website owners with programmatic advertising solutions.",
                            sk: "Pubmatic provides website owners with programmatic advertising solutions.",
                            ts: "Pubmatic provides website owners with programmatic advertising solutions.",
                            lt: "Pubmatic provides website owners with programmatic advertising solutions.",
                            cs: "Pubmatic provides website owners with programmatic advertising solutions.",
                            fi: "Pubmatic provides website owners with programmatic advertising solutions.",
                            no: "Pubmatic provides website owners with programmatic advertising solutions.",
                            br: "Pubmatic provides website owners with programmatic advertising solutions.",
                            sl: "Pubmatic provides website owners with programmatic advertising solutions.",
                        },
                        cookie_ids: "PugT, SPugT",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56263,
                        name: {
                            en: "AddThis",
                            de: "AddThis",
                            fr: "AddThis",
                            it: "AddThis",
                            es: "AddThis",
                            nl: "AddThis",
                            bg: "AddThis",
                            da: "AddThis",
                            ru: "AddThis",
                            ar: "AddThis",
                            pl: "AddThis",
                            pt: "AddThis",
                            ca: "AddThis",
                            hu: "AddThis",
                            se: "AddThis",
                            cr: "AddThis",
                            zh: "AddThis",
                            uk: "AddThis",
                            sk: "AddThis",
                            ts: "AddThis",
                            lt: "AddThis",
                            cs: "AddThis",
                            fi: "AddThis",
                            no: "AddThis",
                            br: "AddThis",
                            sl: "AddThis",
                        },
                        description: {
                            en: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            de: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            fr: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            it: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            es: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            nl: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            bg: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            da: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ru: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ar: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            pl: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            pt: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ca: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            hu: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            se: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            cr: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            zh: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            uk: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            sk: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ts: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            lt: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            cs: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            fi: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            no: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            br: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            sl: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                        },
                        cookie_ids: "na_id, ouid, __atuvs, __atuvc",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                ],
                cookies: [
                    {
                        id: 295677,
                        cookie_id: "PugT",
                        description: {
                            en: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            de: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            fr: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            it: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            es: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            nl: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            bg: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            da: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            ru: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            ar: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            pl: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            pt: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            ca: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            hu: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            se: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            cr: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            zh: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            uk: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            sk: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            ts: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            lt: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            cs: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            fi: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            no: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            br: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                            sl: "This cookie is set by pubmatic.com. The purpose of the cookie is to check when the cookies were last updated on the browser in order to limit the number of calls to the server-side cookie store.",
                        },
                        duration: "1 month",
                        type: "https",
                        domain: ".pubmatic.com",
                    },
                    {
                        id: 295678,
                        cookie_id: "__lc_cid",
                        description: {
                            en: "This is an essential cookie for the website live chat box to function properly.",
                            de: "This is an essential cookie for the website live chat box to function properly.",
                            fr: "This is an essential cookie for the website live chat box to function properly.",
                            it: "This is an essential cookie for the website live chat box to function properly.",
                            es: "This is an essential cookie for the website live chat box to function properly.",
                            nl: "This is an essential cookie for the website live chat box to function properly.",
                            bg: "This is an essential cookie for the website live chat box to function properly.",
                            da: "This is an essential cookie for the website live chat box to function properly.",
                            ru: "This is an essential cookie for the website live chat box to function properly.",
                            ar: "This is an essential cookie for the website live chat box to function properly.",
                            pl: "This is an essential cookie for the website live chat box to function properly.",
                            pt: "This is an essential cookie for the website live chat box to function properly.",
                            ca: "This is an essential cookie for the website live chat box to function properly.",
                            hu: "This is an essential cookie for the website live chat box to function properly.",
                            se: "This is an essential cookie for the website live chat box to function properly.",
                            cr: "This is an essential cookie for the website live chat box to function properly.",
                            zh: "This is an essential cookie for the website live chat box to function properly.",
                            uk: "This is an essential cookie for the website live chat box to function properly.",
                            sk: "This is an essential cookie for the website live chat box to function properly.",
                            ts: "This is an essential cookie for the website live chat box to function properly.",
                            lt: "This is an essential cookie for the website live chat box to function properly.",
                            cs: "This is an essential cookie for the website live chat box to function properly.",
                            fi: "This is an essential cookie for the website live chat box to function properly.",
                            no: "This is an essential cookie for the website live chat box to function properly.",
                            br: "This is an essential cookie for the website live chat box to function properly.",
                            sl: "This is an essential cookie for the website live chat box to function properly.",
                        },
                        duration: "2 years",
                        type: "https",
                        domain: ".accounts.livechatinc.com",
                    },
                    {
                        id: 295679,
                        cookie_id: "__lc_cst",
                        description: {
                            en: "This cookie is used for the website live chat box to function properly.",
                            de: "This cookie is used for the website live chat box to function properly.",
                            fr: "This cookie is used for the website live chat box to function properly.",
                            it: "This cookie is used for the website live chat box to function properly.",
                            es: "This cookie is used for the website live chat box to function properly.",
                            nl: "This cookie is used for the website live chat box to function properly.",
                            bg: "This cookie is used for the website live chat box to function properly.",
                            da: "This cookie is used for the website live chat box to function properly.",
                            ru: "This cookie is used for the website live chat box to function properly.",
                            ar: "This cookie is used for the website live chat box to function properly.",
                            pl: "This cookie is used for the website live chat box to function properly.",
                            pt: "This cookie is used for the website live chat box to function properly.",
                            ca: "This cookie is used for the website live chat box to function properly.",
                            hu: "This cookie is used for the website live chat box to function properly.",
                            se: "This cookie is used for the website live chat box to function properly.",
                            cr: "This cookie is used for the website live chat box to function properly.",
                            zh: "This cookie is used for the website live chat box to function properly.",
                            uk: "This cookie is used for the website live chat box to function properly.",
                            sk: "This cookie is used for the website live chat box to function properly.",
                            ts: "This cookie is used for the website live chat box to function properly.",
                            lt: "This cookie is used for the website live chat box to function properly.",
                            cs: "This cookie is used for the website live chat box to function properly.",
                            fi: "This cookie is used for the website live chat box to function properly.",
                            no: "This cookie is used for the website live chat box to function properly.",
                            br: "This cookie is used for the website live chat box to function properly.",
                            sl: "This cookie is used for the website live chat box to function properly.",
                        },
                        duration: "2 years",
                        type: "https",
                        domain: ".accounts.livechatinc.com",
                    },
                    {
                        id: 295680,
                        cookie_id: "__lc2_cid",
                        description: {
                            en: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            de: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            fr: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            it: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            es: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            nl: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            bg: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            da: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            ru: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            ar: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            pl: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            pt: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            ca: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            hu: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            se: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            cr: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            zh: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            uk: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            sk: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            ts: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            lt: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            cs: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            fi: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            no: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            br: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                            sl: "This cookie is used to enable the website live chat-box function. It is used to reconnect the customer with the last agent with whom the customer had chatted.",
                        },
                        duration: "2 years",
                        type: "https",
                        domain: ".accounts.livechatinc.com",
                    },
                    {
                        id: 295681,
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
                            da:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            ru:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            ar:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            pl:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            pt:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            ca:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            hu:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            se:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            cr:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            zh:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            uk:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            sk:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            ts:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            lt:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            cs:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            fi:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            no:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            br:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                            sl:
                                "This cookie is necessary to enable the website live chat-box function. It is used to distinguish different users using live chat at different times that is to reconnect the last agent with whom the customer had chatted.",
                        },
                        duration: "2 years",
                        type: "https",
                        domain: ".accounts.livechatinc.com",
                    },
                    {
                        id: 295682,
                        cookie_id: "__atuvc",
                        description: {
                            en: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            de: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            fr: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            it: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            es: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            nl: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            bg: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            da: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            ru: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            ar: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            pl: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            pt: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            ca: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            hu: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            se: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            cr: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            zh: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            uk: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            sk: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            ts: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            lt: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            cs: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            fi: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            no: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            br: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            sl: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                        },
                        duration: "1 year 1 month",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295683,
                        cookie_id: "__atuvs",
                        description: {
                            en: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            de: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            fr: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            it: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            es: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            nl: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            bg: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            da: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            ru: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            ar: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            pl: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            pt: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            ca: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            hu: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            se: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            cr: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            zh: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            uk: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            sk: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            ts: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            lt: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            cs: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            fi: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            no: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            br: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                            sl: "This cookie is set by Addthis to make sure you see the updated count if you share a page and return to it before our share count cache is updated.",
                        },
                        duration: "30 minutes",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295684,
                        cookie_id: "__oauth_redirect_detector",
                        description: {
                            en: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            de: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            fr: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            it: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            es: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            nl: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            bg: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            da: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            ru: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            ar: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            pl: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            pt: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            ca: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            hu: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            se: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            cr: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            zh: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            uk: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            sk: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            ts: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            lt: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            cs: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            fi: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            no: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            br: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                            sl: "This cookie is used to recognize the visitors using live chat at different times inorder to optimize the chat-box functionality.",
                        },
                        duration: "",
                        type: "https",
                        domain: "accounts.livechatinc.com",
                    },
                    {
                        id: 295685,
                        cookie_id: "__livechat",
                        description: {
                            en: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            de: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            fr: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            it: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            es: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            nl: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            bg: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            da: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            ru: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            ar: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            pl: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            pt: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            ca: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            hu: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            se: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            cr: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            zh: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            uk: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            sk: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            ts: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            lt: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            cs: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            fi: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            no: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            br: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                            sl: "This cookie is set by the provider LiveChat.Inc. This cookie is used to enable live chat with customers on the website.",
                        },
                        duration: "2 years",
                        type: "https",
                        domain: ".livechatinc.com",
                    },
                    {
                        id: 295686,
                        cookie_id: "ugid",
                        description: {
                            en: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            de: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            fr: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            it: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            es: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            nl: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            bg: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            da: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            ru: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            ar: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            pl: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            pt: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            ca: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            hu: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            se: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            cr: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            zh: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            uk: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            sk: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            ts: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            lt: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            cs: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            fi: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            no: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            br: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                            sl: "This cookie is set by the provider Unsplash. This cookie is used for enabling the video content on the website.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".unsplash.com",
                    },
                ],
            },
            {
                id: 160956,
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
                    da: "Analytics",
                    ru: "\u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430",
                    ar: "\u062a\u062d\u0644\u064a\u0644\u0627\u062a",
                    pl: "Analityka",
                    pt: "Analytics",
                    ca: "Anal\u00edtica",
                    hu: "Analitika",
                    se: "Analytics",
                    cr: "Analitika",
                    zh: "\u5206\u6790\u5de5\u5177",
                    uk: "\u0410\u043d\u0430\u043b\u0456\u0442\u0438\u043a\u0430",
                    sk: "Analytika",
                    ts: "Analitik",
                    lt: "Analytics",
                    cs: "Analytics",
                    fi: "Analytics",
                    no: "Analytics",
                    br: "Anal\u00edticos",
                    sl: "Analytics",
                },
                defaultConsent: 0,
                active: 1,
                settings: { ccpa: { doNotSell: "1" } },
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
                    da:
                        "<p>Analytiske cookies bruges til at forst\u00e5, hvordan bes\u00f8gende interagerer med webstedet. Disse cookies hj\u00e6lper med at give information om m\u00e5linger af antallet af bes\u00f8gende, afvisningsprocent, trafikskilde osv.</p>",
                    ru:
                        "<p>\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u043a\u0443\u043a\u0438 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442\u0441\u044f, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043d\u044f\u0442\u044c, \u043a\u0430\u043a \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0438 \u0432\u0437\u0430\u0438\u043c\u043e\u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044e\u0442 \u0441 \u0441\u0430\u0439\u0442\u043e\u043c. \u042d\u0442\u0438 \u0444\u0430\u0439\u043b\u044b cookie \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u044e\u0442 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044e \u043e \u0442\u0430\u043a\u0438\u0445 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044f\u0445, \u043a\u0430\u043a \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u0435\u0439, \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c \u043e\u0442\u043a\u0430\u0437\u043e\u0432, \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a \u0442\u0440\u0430\u0444\u0438\u043a\u0430 \u0438 \u0442. \u0414.</p>",
                    ar:
                        "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062a\u062d\u0644\u064a\u0644\u064a\u0629 \u0644\u0641\u0647\u0645 \u0643\u064a\u0641\u064a\u0629 \u062a\u0641\u0627\u0639\u0644 \u0627\u0644\u0632\u0648\u0627\u0631 \u0645\u0639 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628. \u062a\u0633\u0627\u0639\u062f \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0641\u064a \u062a\u0648\u0641\u064a\u0631 \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0639\u0646 \u0627\u0644\u0645\u0642\u0627\u064a\u064a\u0633 \u0648\u0639\u062f\u062f \u0627\u0644\u0632\u0648\u0627\u0631 \u0648\u0645\u0639\u062f\u0644 \u0627\u0644\u0627\u0631\u062a\u062f\u0627\u062f \u0648\u0645\u0635\u062f\u0631 \u0627\u0644\u062d\u0631\u0643\u0629 \u0648\u0645\u0627 \u0625\u0644\u0649 \u0630\u0644\u0643.</p>",
                    pl:
                        "<p> Analityczne pliki cookie s\u0142u\u017c\u0105 do zrozumienia, w jaki spos\u00f3b u\u017cytkownicy wchodz\u0105 w interakcj\u0119 z witryn\u0105. Te pliki cookie pomagaj\u0105 dostarcza\u0107 informacje o metrykach liczby odwiedzaj\u0105cych, wsp\u00f3\u0142czynniku odrzuce\u0144, \u017ar\u00f3dle ruchu itp. </p> ",
                    pt:
                        "<p>Cookies anal\u00edticos s\u00e3o usados para entender como os visitantes interagem com o site. Esses cookies ajudam a fornecer informa\u00e7\u00f5es sobre as m\u00e9tricas do n\u00famero de visitantes, taxa de rejei\u00e7\u00e3o, origem do tr\u00e1fego, etc.</p>",
                    ca:
                        "<p>Les cookies anal\u00edtiques s\u2019utilitzen per entendre com interactuen els visitants amb el lloc web. Aquestes cookies ajuden a proporcionar informaci\u00f3 sobre m\u00e8triques, el nombre de visitants, el percentatge de rebots, la font de tr\u00e0nsit, etc.</p>",
                    hu:
                        "<p>Analitikai s\u00fctiket haszn\u00e1lnak annak meg\u00e9rt\u00e9s\u00e9re, hogy a l\u00e1togat\u00f3k hogyan l\u00e9pnek kapcsolatba a weboldallal. Ezek a cookie-k seg\u00edts\u00e9get ny\u00fajtanak a l\u00e1togat\u00f3k sz\u00e1m\u00e1r\u00f3l, a visszafordul\u00e1si ar\u00e1nyr\u00f3l, a forgalmi forr\u00e1sr\u00f3l stb.</p>",
                    se:
                        "<p>Analytiska cookies anv\u00e4nds f\u00f6r att f\u00f6rst\u00e5 hur bes\u00f6kare interagerar med webbplatsen. Dessa cookies hj\u00e4lper till att ge information om m\u00e4tv\u00e4rden, antal bes\u00f6kare, avvisningsfrekvens, trafikk\u00e4lla etc.</p>",
                    cr:
                        "<p>Analiti\u010dki kola\u010di\u0107i koriste se za razumijevanje na\u010dina na koji posjetitelji komuniciraju s web stranicom. Ovi kola\u010di\u0107i poma\u017eu u pru\u017eanju podataka o metri\u010dkim podacima o broju posjetitelja, stopi napu\u0161tanja po\u010detne stranice, izvoru prometa itd.</p>",
                    zh:
                        "<p>\u5206\u6790\u6027Cookie\u7528\u4e8e\u4e86\u89e3\u8bbf\u95ee\u8005\u5982\u4f55\u4e0e\u7f51\u7ad9\u4e92\u52a8\u3002 \u8fd9\u4e9bCookie\u6709\u52a9\u4e8e\u63d0\u4f9b\u6709\u5173\u8bbf\u95ee\u8005\u6570\u91cf\uff0c\u8df3\u51fa\u7387\uff0c\u6d41\u91cf\u6765\u6e90\u7b49\u6307\u6807\u7684\u4fe1\u606f\u3002</p>",
                    uk:
                        "<p>\u0410\u043d\u0430\u043b\u0456\u0442\u0438\u0447\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u044e\u0442\u044c\u0441\u044f \u0434\u043b\u044f \u0440\u043e\u0437\u0443\u043c\u0456\u043d\u043d\u044f \u0432\u0437\u0430\u0454\u043c\u043e\u0434\u0456\u0457 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456\u0432 \u0456\u0437 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u043e\u043c. \u0426\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0434\u043e\u043f\u043e\u043c\u0430\u0433\u0430\u044e\u0442\u044c \u043d\u0430\u0434\u0430\u0432\u0430\u0442\u0438 \u0456\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0456\u044e \u043f\u0440\u043e \u043f\u043e\u043a\u0430\u0437\u043d\u0438\u043a\u0438, \u043a\u0456\u043b\u044c\u043a\u0456\u0441\u0442\u044c \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456\u0432, \u043f\u043e\u043a\u0430\u0437\u043d\u0438\u043a \u0432\u0456\u0434\u043c\u043e\u0432, \u0434\u0436\u0435\u0440\u0435\u043b\u043e \u0442\u0440\u0430\u0444\u0456\u043a\u0443 \u0442\u043e\u0449\u043e.</p>",
                    sk:
                        "<p>Analytick\u00e9 cookies sa pou\u017e\u00edvaj\u00fa na pochopenie toho, ako n\u00e1v\u0161tevn\u00edci interaguj\u00fa s webovou str\u00e1nkou. Tieto s\u00fabory cookie pom\u00e1haj\u00fa poskytova\u0165 inform\u00e1cie o metrik\u00e1ch po\u010dtu n\u00e1v\u0161tevn\u00edkov, miere okam\u017eit\u00fdch odchodov, zdroji n\u00e1v\u0161tevnosti at\u010f.</p>",
                    ts:
                        "<p>Analitik \u00e7erezler, ziyaret\u00e7ilerin web sitesiyle nas\u0131l etkile\u015fime girdi\u011fini anlamak i\u00e7in kullan\u0131l\u0131r. Bu \u00e7erezler, ziyaret\u00e7i say\u0131s\u0131, hemen \u00e7\u0131kma oran\u0131, trafik kayna\u011f\u0131 vb. Gibi \u00f6l\u00e7\u00fcmler hakk\u0131nda bilgi sa\u011flamaya yard\u0131mc\u0131 olur.</p>",
                    lt:
                        "<p>Analitiniai cookies naudojami norint suprasti, kaip lankytojai s\u0105veikauja su svetaine. \u0160ie slapukai padeda pateikti informacij\u0105 apie lankytoj\u0173 skai\u010diaus metrik\u0105, atmetimo rodikl\u012f, srauto \u0161altin\u012f ir kt.</p>",
                    cs:
                        "<p>Analytick\u00e9 soubory cookie se pou\u017e\u00edvaj\u00ed k pochopen\u00ed interakce n\u00e1v\u0161t\u011bvn\u00edk\u016f s webem. Tyto soubory cookie pom\u00e1haj\u00ed poskytovat informace o metrik\u00e1ch po\u010det n\u00e1v\u0161t\u011bvn\u00edk\u016f, m\u00edru okam\u017eit\u00e9ho opu\u0161t\u011bn\u00ed, zdroj provozu atd.</p>",
                    fi:
                        "<p>Analyyttisi\u00e4 ev\u00e4steit\u00e4 k\u00e4ytet\u00e4\u00e4n ymm\u00e4rt\u00e4m\u00e4\u00e4n, miten k\u00e4vij\u00e4t ovat vuorovaikutuksessa verkkosivuston kanssa. N\u00e4m\u00e4 ev\u00e4steet auttavat tarjoamaan tietoa k\u00e4vij\u00f6iden lukum\u00e4\u00e4r\u00e4st\u00e4, poistumisprosentista, liikenteen l\u00e4hteest\u00e4 jne.</p>",
                    no:
                        "<p>Analytiske cookies brukes til \u00e5 forst\u00e5 hvordan bes\u00f8kende samhandler med nettstedet. Disse cookies hjelper deg med \u00e5 gi informasjon om beregningene antall bes\u00f8kende, fluktfrekvens, trafikkilde osv.</p>",
                    br:
                        "<p>Cookies anal\u00edticos s\u00e3o usados para entender como os visitantes interagem com o site. Esses cookies ajudam a fornecer informa\u00e7\u00f5es sobre m\u00e9tricas o n\u00famero de visitantes, taxa de rejei\u00e7\u00e3o, fonte de tr\u00e1fego, etc.</p>",
                    sl:
                        "<p>Analiti\u010dni pi\u0161kotki se uporabljajo za razumevanje interakcije obiskovalcev s spletno stranjo. Ti pi\u0161kotki pomagajo zagotoviti informacije o meritvi \u0161tevilo obiskovalcev, hitrost odskoka, prometni vir itd.</p>",
                },
                scripts: [
                    {
                        id: 56259,
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
                            se: "Google Analytics",
                            cr: "Google Analytics",
                            zh: "Google Analytics",
                            uk: "Google Analytics",
                            sk: "Google Analytics",
                            ts: "Google Analytics",
                            lt: "Google Analytics",
                            cs: "Google Analytics",
                            fi: "Google Analytics",
                            no: "Google Analytics",
                            br: "Google Analytics",
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
                            se: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            cr: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            zh: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            uk: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            sk: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            ts: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            lt: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            cs: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            fi: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            no: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            br: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                            sl: "Google Analytics lets you measure your advertising ROI as well as track your Flash, video, and social networking sites and applications",
                        },
                        cookie_ids: "_ga, _gid",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56260,
                        name: {
                            en: "Pardot",
                            de: "Pardot",
                            fr: "Pardot",
                            it: "Pardot",
                            es: "Pardot",
                            nl: "Pardot",
                            bg: "Pardot",
                            da: "Pardot",
                            ru: "Pardot",
                            ar: "Pardot",
                            pl: "Pardot",
                            pt: "Pardot",
                            ca: "Pardot",
                            hu: "Pardot",
                            se: "Pardot",
                            cr: "Pardot",
                            zh: "Pardot",
                            uk: "Pardot",
                            sk: "Pardot",
                            ts: "Pardot",
                            lt: "Pardot",
                            cs: "Pardot",
                            fi: "Pardot",
                            no: "Pardot",
                            br: "Pardot",
                            sl: "Pardot",
                        },
                        description: {
                            en: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            de: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            fr: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            it: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            es: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            nl: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            bg: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            da: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            ru: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            ar: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            pl: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            pt: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            ca: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            hu: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            se: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            cr: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            zh: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            uk: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            sk: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            ts: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            lt: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            cs: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            fi: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            no: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            br: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                            sl: "Pardot is a marketing automation software that allows you to create more leads and generate more pipeline.",
                        },
                        cookie_ids: "visitor_id#hash",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56261,
                        name: {
                            en: "AddThis",
                            de: "AddThis",
                            fr: "AddThis",
                            it: "AddThis",
                            es: "AddThis",
                            nl: "AddThis",
                            bg: "AddThis",
                            da: "AddThis",
                            ru: "AddThis",
                            ar: "AddThis",
                            pl: "AddThis",
                            pt: "AddThis",
                            ca: "AddThis",
                            hu: "AddThis",
                            se: "AddThis",
                            cr: "AddThis",
                            zh: "AddThis",
                            uk: "AddThis",
                            sk: "AddThis",
                            ts: "AddThis",
                            lt: "AddThis",
                            cs: "AddThis",
                            fi: "AddThis",
                            no: "AddThis",
                            br: "AddThis",
                            sl: "AddThis",
                        },
                        description: {
                            en: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            de: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            fr: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            it: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            es: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            nl: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            bg: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            da: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ru: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ar: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            pl: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            pt: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ca: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            hu: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            se: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            cr: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            zh: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            uk: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            sk: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ts: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            lt: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            cs: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            fi: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            no: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            br: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            sl: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                        },
                        cookie_ids: "uvc",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                ],
                cookies: [
                    {
                        id: 295672,
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
                            se:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            cr:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            zh:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            uk:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            sk:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            ts:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            lt:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            cs:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            fi:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            no:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            br:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                            sl:
                                "This cookie is installed by Google Analytics. The cookie is used to calculate visitor, session, campaign data and keep track of site usage for the site's analytics report. The cookies store information anonymously and assign a randomly generated number to identify unique visitors.",
                        },
                        duration: "2 years",
                        type: "https",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295673,
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
                            se:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            cr:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            zh:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            uk:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            sk:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            ts:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            lt:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            cs:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            fi:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            no:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            br:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                            sl:
                                "This cookie is installed by Google Analytics. The cookie is used to store information of how visitors use a website and helps in creating an analytics report of how the website is doing. The data collected including the number visitors, the source where they have come from, and the pages visted in an anonymous form.",
                        },
                        duration: "1 day",
                        type: "https",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295674,
                        cookie_id: "visitor_id",
                        description: {
                            en: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            de: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            fr: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            it: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            es: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            nl: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            bg: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            da: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            ru: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            ar: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            pl: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            pt: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            ca: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            hu: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            se: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            cr: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            zh: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            uk: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            sk: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            ts: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            lt: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            cs: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            fi: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            no: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            br: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                            sl: "This cookie include cookie name plus the unique identifier of the visitor account. The value stored is the unique ID of the visitor which is used for tracking the visitor.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295675,
                        cookie_id: "uvc",
                        description: {
                            en: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            de: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            fr: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            it: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            es: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            nl: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            bg: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            da: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            ru: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            ar: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            pl: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            pt: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            ca: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            hu: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            se: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            cr: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            zh: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            uk: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            sk: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            ts: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            lt: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            cs: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            fi: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            no: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            br: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                            sl: "The cookie is set by addthis.com to determine the usage of Addthis.com service. ",
                        },
                        duration: "1 year 1 month",
                        type: "https",
                        domain: ".addthis.com",
                    },
                    {
                        id: 295676,
                        cookie_id: "vuid",
                        description: {
                            en: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            de: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            fr: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            it: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            es: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            nl: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            bg: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            da: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            ru: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            ar: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            pl: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            pt: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            ca: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            hu: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            se: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            cr: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            zh: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            uk: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            sk: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            ts: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            lt: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            cs: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            fi: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            no: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            br: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                            sl: "This domain of this cookie is owned by Vimeo. This cookie is used by vimeo to collect tracking information. It sets a unique ID to embed videos to the website. ",
                        },
                        duration: "2 years",
                        type: "https",
                        domain: ".vimeo.com",
                    },
                ],
            },
            {
                id: 160957,
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
                    da: "Ydeevne",
                    ru: "\u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c",
                    ar: "\u0623\u062f\u0627\u0621",
                    pl: "Wyst\u0119p",
                    pt: "Desempenho",
                    ca: "Rendiment",
                    hu: "Teljes\u00edtm\u00e9ny",
                    se: "Prestanda",
                    cr: "Izvo\u0111enje",
                    zh: "\u8868\u73b0",
                    uk: "\u041f\u0440\u043e\u0434\u0443\u043a\u0442\u0438\u0432\u043d\u0456\u0441\u0442\u044c",
                    sk: "V\u00fdkon",
                    ts: "Performans",
                    lt: "Spektaklis",
                    cs: "V\u00fdkon",
                    fi: "Suorituskyky\u00e4",
                    no: "Ytelse",
                    br: "Desempenho",
                    sl: "Uspe\u0161nosti",
                },
                defaultConsent: 0,
                active: 1,
                settings: { ccpa: { doNotSell: "1" } },
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
                    da: "<p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.</p>",
                    ru:
                        "<p>\u041a\u0443\u043a\u0438-\u0444\u0430\u0439\u043b\u044b \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u0438 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442\u0441\u044f \u0434\u043b\u044f \u043f\u043e\u043d\u0438\u043c\u0430\u043d\u0438\u044f \u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u043a\u043b\u044e\u0447\u0435\u0432\u044b\u0445 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0435\u0439 \u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0430, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043f\u043e\u043c\u043e\u0433\u0430\u044e\u0442 \u0432\u0430\u043c \u043f\u043e\u0432\u044b\u0441\u0438\u0442\u044c \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u043e\u0431\u0441\u043b\u0443\u0436\u0438\u0432\u0430\u043d\u0438\u044f \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439.</p>",
                    ar:
                        "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u062e\u0627\u0635\u0629 \u0628\u0627\u0644\u0623\u062f\u0627\u0621 \u0644\u0641\u0647\u0645 \u0648\u062a\u062d\u0644\u064a\u0644 \u0641\u0647\u0627\u0631\u0633 \u0627\u0644\u0623\u062f\u0627\u0621 \u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629 \u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628 \u0648\u0627\u0644\u062a\u064a \u062a\u0633\u0627\u0639\u062f \u0641\u064a \u062a\u0642\u062f\u064a\u0645 \u062a\u062c\u0631\u0628\u0629 \u0645\u0633\u062a\u062e\u062f\u0645 \u0623\u0641\u0636\u0644 \u0644\u0644\u0632\u0627\u0626\u0631\u064a\u0646.</p>",
                    pl:
                        "<p> Wydajno\u015bciowe pliki cookie s\u0142u\u017c\u0105 do zrozumienia i analizy kluczowych wska\u017anik\u00f3w wydajno\u015bci witryny, co pomaga zapewni\u0107 lepsze wra\u017cenia u\u017cytkownika dla odwiedzaj\u0105cych. </p>",
                    pt: "<p>Os cookies de desempenho s\u00e3o usados para compreender e analisar os principais \u00edndices de desempenho do site, o que ajuda a oferecer uma melhor experi\u00eancia do usu\u00e1rio aos visitantes.</p>",
                    ca: "<p>Les galetes de rendiment s\u2019utilitzen per comprendre i analitzar els \u00edndexs de rendiment clau del lloc web que ajuden a oferir una millor experi\u00e8ncia d\u2019usuari als visitants.</p>",
                    hu:
                        "<p>A teljes\u00edtm\u00e9ny-s\u00fctiket a weboldal kulcsfontoss\u00e1g\u00fa teljes\u00edtm\u00e9nymutat\u00f3inak meg\u00e9rt\u00e9s\u00e9re \u00e9s elemz\u00e9s\u00e9re haszn\u00e1lj\u00e1k, amelyek hozz\u00e1j\u00e1rulnak a l\u00e1togat\u00f3k jobb felhaszn\u00e1l\u00f3i \u00e9lm\u00e9ny\u00e9nek biztos\u00edt\u00e1s\u00e1hoz.</p>",
                    se:
                        "<p>Prestanda cookies anv\u00e4nds f\u00f6r att f\u00f6rst\u00e5 och analysera de viktigaste prestandaindexen p\u00e5 webbplatsen som hj\u00e4lper till att leverera en b\u00e4ttre anv\u00e4ndarupplevelse f\u00f6r bes\u00f6karna.</p>",
                    cr: "<p>Kola\u010di\u0107i izvedbe koriste se za razumijevanje i analizu klju\u010dnih indeksa izvedbe web stranice \u0161to poma\u017ee u pru\u017eanju boljeg korisni\u010dkog iskustva posjetiteljima.</p>",
                    zh:
                        "<p>\u6548\u679cCookie\u7528\u4e8e\u4e86\u89e3\u548c\u5206\u6790\u7f51\u7ad9\u7684\u5173\u952e\u6027\u80fd\u6307\u6807\uff0c\u8fd9\u6709\u52a9\u4e8e\u4e3a\u8bbf\u95ee\u8005\u63d0\u4f9b\u66f4\u597d\u7684\u7528\u6237\u4f53\u9a8c\u3002</p>",
                    uk:
                        "<p>\u0424\u0430\u0439\u043b\u0438 cookie \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u044e\u0442\u044c\u0441\u044f \u0434\u043b\u044f \u0440\u043e\u0437\u0443\u043c\u0456\u043d\u043d\u044f \u0442\u0430 \u0430\u043d\u0430\u043b\u0456\u0437\u0443 \u043a\u043b\u044e\u0447\u043e\u0432\u0438\u0445 \u043f\u043e\u043a\u0430\u0437\u043d\u0438\u043a\u0456\u0432 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0456 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443, \u0449\u043e \u0434\u043e\u043f\u043e\u043c\u0430\u0433\u0430\u0454 \u0437\u0430\u0431\u0435\u0437\u043f\u0435\u0447\u0438\u0442\u0438 \u043a\u0440\u0430\u0449\u0438\u0439 \u0434\u043e\u0441\u0432\u0456\u0434 \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432 \u0434\u043b\u044f \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456\u0432.</p>",
                    sk:
                        "<p>V\u00fdkonnostn\u00e9 cookies sa pou\u017e\u00edvaj\u00fa na pochopenie a anal\u00fdzu k\u013e\u00fa\u010dov\u00fdch indexov v\u00fdkonnosti webov\u00fdch str\u00e1nok, \u010do pom\u00e1ha zlep\u0161ova\u0165 u\u017e\u00edvate\u013esk\u00fa sk\u00fasenos\u0165 pre n\u00e1v\u0161tevn\u00edkov.</p>",
                    ts:
                        "<p>Performans \u00e7erezleri, ziyaret\u00e7ilere daha iyi bir kullan\u0131c\u0131 deneyimi sunmaya yard\u0131mc\u0131 olan web sitesinin temel performans indekslerini anlamak ve analiz etmek i\u00e7in kullan\u0131l\u0131r.</p>",
                    lt: "<p>Na\u0161umo cookies naudojami norint suprasti ir i\u0161analizuoti pagrindinius svetain\u0117s na\u0161umo indeksus, kurie padeda lankytojams suteikti geresn\u0119 vartotojo patirt\u012f.</p>",
                    cs:
                        "<p>V\u00fdkonnostn\u00ed cookies se pou\u017e\u00edvaj\u00ed k pochopen\u00ed a anal\u00fdze kl\u00ed\u010dov\u00fdch index\u016f v\u00fdkonu webu, co\u017e pom\u00e1h\u00e1 zajistit lep\u0161\u00ed u\u017eivatelsk\u00fd komfort pro n\u00e1v\u0161t\u011bvn\u00edky.</p>",
                    fi:
                        "<p>Suorituskykyev\u00e4steit\u00e4 k\u00e4ytet\u00e4\u00e4n verkkosivuston t\u00e4rkeimpien suorituskykyindeksien ymm\u00e4rt\u00e4miseen ja analysointiin, mik\u00e4 auttaa tarjoamaan vierailijoille paremman k\u00e4ytt\u00f6kokemuksen.</p>",
                    no: "<p>Ytelsescookies cookies til \u00e5 forst\u00e5 og analysere de viktigste ytelsesindeksene til nettstedet som hjelper til med \u00e5 gi en bedre brukeropplevelse for de bes\u00f8kende.</p>",
                    br: "<p>Os cookies de desempenho s\u00e3o usados para entender e analisar os principais \u00edndices de desempenho do site, o que ajuda a oferecer uma melhor experi\u00eancia do usu\u00e1rio para os visitantes.</p>",
                    sl:
                        "<p>Pi\u0161kotki uspe\u0161nosti se uporabljajo za razumevanje in analizo klju\u010dnih kazal uspe\u0161nosti spletne strani, ki pomagajo pri zagotavljanju bolj\u0161e uporabni\u0161ke izku\u0161nje za obiskovalce.</p>",
                },
                cookies: [
                    {
                        id: 295687,
                        cookie_id: "YSC",
                        description: {
                            en: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            de: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            fr: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            it: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            es: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            nl: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            bg: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            da: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            ru: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            ar: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            pl: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            pt: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            ca: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            hu: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            se: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            cr: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            zh: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            uk: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            sk: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            ts: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            lt: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            cs: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            fi: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            no: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            br: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                            sl: "This cookies is set by Youtube and is used to track the views of embedded videos.",
                        },
                        duration: "session",
                        type: "https",
                        domain: ".youtube.com",
                    },
                    {
                        id: 295688,
                        cookie_id: "obuid",
                        description: {
                            en: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            de: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            fr: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            it: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            es: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            nl: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            bg: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            da: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            ru: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            ar: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            pl: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            pt: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            ca: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            hu: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            se: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            cr: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            zh: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            uk: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            sk: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            ts: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            lt: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            cs: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            fi: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            no: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            br: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                            sl: "The domain of this cookie is owned by Outbrain. This cookie is used to distribute content targeted to individuals interest.",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".outbrain.com",
                    },
                    {
                        id: 295689,
                        cookie_id: "AWSELBCORS",
                        description: {
                            en: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            de: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            fr: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            it: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            es: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            nl: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            bg: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            da: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            ru: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            ar: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            pl: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            pt: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            ca: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            hu: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            se: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            cr: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            zh: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            uk: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            sk: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            ts: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            lt: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            cs: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            fi: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            no: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            br: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                            sl: "This cookie is used for load balancing, inorder to optimize the service. It also stores the information regarding which server cluster is serving the visitor.",
                        },
                        duration: "2 hours",
                        type: "https",
                        domain: "recruitingbypaycor.com",
                    },
                    {
                        id: 295690,
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
                            se: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            cr: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            zh: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            uk: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            sk: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            ts: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            lt: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            cs: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            fi: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            no: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            br: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                            sl: "This cookies is installed by Google Universal Analytics to throttle the request rate to limit the colllection of data on high traffic sites.",
                        },
                        duration: "1 minute",
                        type: "https",
                        domain: ".tyndale.com",
                    },
                ],
            },
            {
                id: 160958,
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
                    da: "Reklame",
                    ru: "\u0440\u0435\u043a\u043b\u0430\u043c\u0430",
                    ar: "\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a",
                    pl: "Reklama",
                    pt: "An\u00fancio",
                    ca: "Anunci",
                    hu: "Hirdet\u00e9s",
                    se: "Annons",
                    cr: "Oglas",
                    zh: "\u5e7f\u544a",
                    uk: "\u0420\u0435\u043a\u043b\u0430\u043c\u0430",
                    sk: "Reklama",
                    ts: "Reklam",
                    lt: "Reklama",
                    cs: "Reklama",
                    fi: "Mainos",
                    no: "Annonse",
                    br: "An\u00fancio",
                    sl: "Oglas",
                },
                defaultConsent: 0,
                active: 1,
                settings: { ccpa: { doNotSell: "1" } },
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
                    da: "<p>Annonce-cookies bruges til at levere bes\u00f8gende med tilpassede reklamer baseret p\u00e5 de sider, de har bes\u00f8gt f\u00f8r, og analysere effektiviteten af \u200b\u200bannoncekampagnen.</p>",
                    ru:
                        "<p>\u0420\u0435\u043a\u043b\u0430\u043c\u043d\u044b\u0435 \u0444\u0430\u0439\u043b\u044b cookie \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442\u0441\u044f \u0434\u043b\u044f \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u043e\u0439 \u0440\u0435\u043a\u043b\u0430\u043c\u044b \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u0435 \u043f\u043e\u0441\u0435\u0449\u0430\u0435\u043c\u044b\u0445 \u0438\u043c\u0438 \u0441\u0442\u0440\u0430\u043d\u0438\u0446 \u0438 \u0430\u043d\u0430\u043b\u0438\u0437\u0430 \u044d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u043d\u043e\u0439 \u043a\u0430\u043c\u043f\u0430\u043d\u0438\u0438.</p>",
                    ar:
                        "<p>\u062a\u064f\u0633\u062a\u062e\u062f\u0645 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0644\u062a\u0632\u0648\u064a\u062f \u0627\u0644\u0632\u0627\u0626\u0631\u064a\u0646 \u0628\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0645\u062e\u0635\u0635\u0629 \u0627\u0633\u062a\u0646\u0627\u062f\u064b\u0627 \u0625\u0644\u0649 \u0627\u0644\u0635\u0641\u062d\u0627\u062a \u0627\u0644\u062a\u064a \u0632\u0627\u0631\u0648\u0647\u0627 \u0645\u0646 \u0642\u0628\u0644 \u0648\u062a\u062d\u0644\u064a\u0644 \u0641\u0639\u0627\u0644\u064a\u0629 \u0627\u0644\u062d\u0645\u0644\u0629 \u0627\u0644\u0625\u0639\u0644\u0627\u0646\u064a\u0629.</p>",
                    pl:
                        "<p> Reklamowe pliki cookie s\u0142u\u017c\u0105 do dostarczania u\u017cytkownikom spersonalizowanych reklam w oparciu o strony, kt\u00f3re odwiedzili wcze\u015bniej, oraz do analizowania skuteczno\u015bci kampanii reklamowej. </p>",
                    pt:
                        "<p>Os cookies de publicidade s\u00e3o usados para entregar aos visitantes an\u00fancios personalizados com base nas p\u00e1ginas que eles visitaram antes e analisar a efic\u00e1cia da campanha publicit\u00e1ria.</p>",
                    ca:
                        "<p>Les galetes publicit\u00e0ries s\u2019utilitzen per oferir als visitants anuncis personalitzats en funci\u00f3 de les p\u00e0gines que van visitar abans i analitzar l\u2019efic\u00e0cia de la campanya publicit\u00e0ria.</p>",
                    hu:
                        "<p>A hirdet\u00e9si s\u00fctiket arra haszn\u00e1lj\u00e1k, hogy a l\u00e1togat\u00f3kat szem\u00e9lyre szabott hirdet\u00e9sekkel juttass\u00e1k el a kor\u00e1bban megl\u00e1togatott oldalak alapj\u00e1n, \u00e9s elemezz\u00e9k a hirdet\u00e9si kamp\u00e1ny hat\u00e9konys\u00e1g\u00e1t.</p>",
                    se: "<p>Annonscookies anv\u00e4nds f\u00f6r att leverera bes\u00f6kare med anpassade annonser baserat p\u00e5 de sidor de bes\u00f6kte tidigare och analysera effektiviteten i annonskampanjen.</p>",
                    cr: "<p>Reklamni kola\u010di\u0107i koriste se za prikazivanje posjetitelja s prilago\u0111enim oglasima na temelju stranica koje su prije posjetili i za analizu u\u010dinkovitosti oglasne kampanje.</p>",
                    zh:
                        "<p>\u5e7f\u544aCookie\u7528\u4e8e\u6839\u636e\u8bbf\u95ee\u8005\u4e4b\u524d\u8bbf\u95ee\u7684\u9875\u9762\u5411\u8bbf\u95ee\u8005\u63d0\u4f9b\u81ea\u5b9a\u4e49\u5e7f\u544a\uff0c\u5e76\u5206\u6790\u5e7f\u544a\u6d3b\u52a8\u7684\u6709\u6548\u6027\u3002</p>",
                    uk:
                        "<p>\u0420\u0435\u043a\u043b\u0430\u043c\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u044e\u0442\u044c\u0441\u044f \u0434\u043b\u044f \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u0447\u0456\u0432 \u0437 \u0456\u043d\u0434\u0438\u0432\u0456\u0434\u0443\u0430\u043b\u044c\u043d\u043e\u044e \u0440\u0435\u043a\u043b\u0430\u043c\u043e\u044e \u043d\u0430 \u043e\u0441\u043d\u043e\u0432\u0456 \u0441\u0442\u043e\u0440\u0456\u043d\u043e\u043a, \u044f\u043a\u0456 \u0432\u043e\u043d\u0438 \u0432\u0456\u0434\u0432\u0456\u0434\u0443\u0432\u0430\u043b\u0438 \u0440\u0430\u043d\u0456\u0448\u0435, \u0442\u0430 \u0430\u043d\u0430\u043b\u0456\u0437\u0443 \u0435\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0456 \u0440\u0435\u043a\u043b\u0430\u043c\u043d\u043e\u0457 \u043a\u0430\u043c\u043f\u0430\u043d\u0456\u0457.</p>",
                    sk:
                        "<p>S\u00fabory cookie reklamy sa pou\u017e\u00edvaj\u00fa na doru\u010denie n\u00e1v\u0161tevn\u00edkom prisp\u00f4soben\u00fdch rekl\u00e1m na z\u00e1klade str\u00e1nok, ktor\u00e9 nav\u0161t\u00edvili predt\u00fdm, a na anal\u00fdzu efekt\u00edvnosti reklamnej kampane.</p>",
                    ts:
                        "<p>Reklam \u00e7erezleri, ziyaret\u00e7ilere daha \u00f6nce ziyaret ettikleri sayfalara g\u00f6re \u00f6zelle\u015ftirilmi\u015f reklamlar sunmak ve reklam kampanyas\u0131n\u0131n etkinli\u011fini analiz etmek i\u00e7in kullan\u0131l\u0131r.</p>",
                    lt: "<p>Reklaminiai cookies naudojami norint pateikti lankytojams pritaikyt\u0105 reklam\u0105 pagal puslapius, kuriuose jie anks\u010diau lank\u0117si, ir analizuoti reklamos kampanijos efektyvum\u0105.</p>",
                    cs:
                        "<p>Soubory cookie reklamy se pou\u017e\u00edvaj\u00ed k doru\u010dov\u00e1n\u00ed n\u00e1v\u0161t\u011bvn\u00edk\u016f p\u0159izp\u016fsoben\u00fdmi reklamami na z\u00e1klad\u011b str\u00e1nek, kter\u00e9 nav\u0161t\u00edvili d\u0159\u00edve, a k anal\u00fdze \u00fa\u010dinnosti reklamn\u00ed kampan\u011b.</p>",
                    fi:
                        "<p>Mainosev\u00e4steit\u00e4 k\u00e4ytet\u00e4\u00e4n tarjoamaan k\u00e4vij\u00f6ille r\u00e4\u00e4t\u00e4l\u00f6ityj\u00e4 mainoksia sivujen perusteella, joilla he ovat k\u00e4yneet aiemmin, ja analysoimaan mainoskampanjan tehokkuutta.</p>",
                    no: "<p>Annonsecookies brukes til \u00e5 levere bes\u00f8kende med tilpassede annonser basert p\u00e5 sidene de bes\u00f8kte f\u00f8r og analysere effektiviteten av annonsekampanjen.</p>",
                    br: "<p>Os cookies de an\u00fancios s\u00e3o usados para entregar aos visitantes an\u00fancios personalizados com base nas p\u00e1ginas que visitaram antes e analisar a efic\u00e1cia da campanha publicit\u00e1ria.</p>",
                    sl: "<p>Ogla\u0161evalski pi\u0161kotki se uporabljajo za zagotavljanje obiskovalcev s prilagojenimi oglasi na podlagi strani, ki so jih obiskali prej, in za analizo u\u010dinkovitosti ogla\u0161evalske akcije.</p>",
                },
                scripts: [
                    {
                        id: 56249,
                        name: {
                            en: "YouTube",
                            de: "YouTube",
                            fr: "YouTube",
                            it: "YouTube",
                            es: "YouTube",
                            nl: "YouTube",
                            bg: "YouTube",
                            da: "YouTube",
                            ru: "YouTube",
                            ar: "YouTube",
                            pl: "YouTube",
                            pt: "YouTube",
                            ca: "YouTube",
                            hu: "YouTube",
                            se: "YouTube",
                            cr: "YouTube",
                            zh: "YouTube",
                            uk: "YouTube",
                            sk: "YouTube",
                            ts: "YouTube",
                            lt: "YouTube",
                            cs: "YouTube",
                            fi: "YouTube",
                            no: "YouTube",
                            br: "YouTube",
                            sl: "YouTube",
                        },
                        description: {
                            en: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            de: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            fr: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            it: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            es: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            nl: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            bg: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            da: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            ru: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            ar: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            pl: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            pt: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            ca: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            hu: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            se: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            cr: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            zh: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            uk: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            sk: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            ts: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            lt: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            cs: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            fi: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            no: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            br: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                            sl: "YouTube installs cookies on pages that has embedded YouTube content in it.",
                        },
                        cookie_ids: "VISITOR_INFO1_LIVE",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56250,
                        name: {
                            en: "DoubleClick",
                            de: "DoubleClick",
                            fr: "DoubleClick",
                            it: "DoubleClick",
                            es: "DoubleClick",
                            nl: "DoubleClick",
                            bg: "DoubleClick",
                            da: "DoubleClick",
                            ru: "DoubleClick",
                            ar: "DoubleClick",
                            pl: "DoubleClick",
                            pt: "DoubleClick",
                            ca: "DoubleClick",
                            hu: "DoubleClick",
                            se: "DoubleClick",
                            cr: "DoubleClick",
                            zh: "DoubleClick",
                            uk: "DoubleClick",
                            sk: "DoubleClick",
                            ts: "DoubleClick",
                            lt: "DoubleClick",
                            cs: "DoubleClick",
                            fi: "DoubleClick",
                            no: "DoubleClick",
                            br: "DoubleClick",
                            sl: "DoubleClick",
                        },
                        description: {
                            en: "DoubleClick provides internet ad serving service for online publishers.",
                            de: "DoubleClick provides internet ad serving service for online publishers.",
                            fr: "DoubleClick provides internet ad serving service for online publishers.",
                            it: "DoubleClick provides internet ad serving service for online publishers.",
                            es: "DoubleClick provides internet ad serving service for online publishers.",
                            nl: "DoubleClick provides internet ad serving service for online publishers.",
                            bg: "DoubleClick provides internet ad serving service for online publishers.",
                            da: "DoubleClick provides internet ad serving service for online publishers.",
                            ru: "DoubleClick provides internet ad serving service for online publishers.",
                            ar: "DoubleClick provides internet ad serving service for online publishers.",
                            pl: "DoubleClick provides internet ad serving service for online publishers.",
                            pt: "DoubleClick provides internet ad serving service for online publishers.",
                            ca: "DoubleClick provides internet ad serving service for online publishers.",
                            hu: "DoubleClick provides internet ad serving service for online publishers.",
                            se: "DoubleClick provides internet ad serving service for online publishers.",
                            cr: "DoubleClick provides internet ad serving service for online publishers.",
                            zh: "DoubleClick provides internet ad serving service for online publishers.",
                            uk: "DoubleClick provides internet ad serving service for online publishers.",
                            sk: "DoubleClick provides internet ad serving service for online publishers.",
                            ts: "DoubleClick provides internet ad serving service for online publishers.",
                            lt: "DoubleClick provides internet ad serving service for online publishers.",
                            cs: "DoubleClick provides internet ad serving service for online publishers.",
                            fi: "DoubleClick provides internet ad serving service for online publishers.",
                            no: "DoubleClick provides internet ad serving service for online publishers.",
                            br: "DoubleClick provides internet ad serving service for online publishers.",
                            sl: "DoubleClick provides internet ad serving service for online publishers.",
                        },
                        cookie_ids: "IDE, test_cookie",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56251,
                        name: {
                            en: "Pubmatic",
                            de: "Pubmatic",
                            fr: "Pubmatic",
                            it: "Pubmatic",
                            es: "Pubmatic",
                            nl: "Pubmatic",
                            bg: "Pubmatic",
                            da: "Pubmatic",
                            ru: "Pubmatic",
                            ar: "Pubmatic",
                            pl: "Pubmatic",
                            pt: "Pubmatic",
                            ca: "Pubmatic",
                            hu: "Pubmatic",
                            se: "Pubmatic",
                            cr: "Pubmatic",
                            zh: "Pubmatic",
                            uk: "Pubmatic",
                            sk: "Pubmatic",
                            ts: "Pubmatic",
                            lt: "Pubmatic",
                            cs: "Pubmatic",
                            fi: "Pubmatic",
                            no: "Pubmatic",
                            br: "Pubmatic",
                            sl: "Pubmatic",
                        },
                        description: {
                            en: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            de: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            fr: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            it: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            es: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            nl: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            bg: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            da: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            ru: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            ar: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            pl: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            pt: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            ca: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            hu: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            se: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            cr: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            zh: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            uk: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            sk: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            ts: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            lt: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            cs: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            fi: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            no: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            br: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                            sl: "Pubmatic develops and implements online advertising software and strategies for the publishing industry.",
                        },
                        cookie_ids: "KADUSERCOOKIE, KTPCACOOKIE, PUBMDCID",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56252,
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
                            ts: "Facebook",
                            lt: "Facebook",
                            cs: "Facebook",
                            fi: "Facebook",
                            no: "Facebook",
                            br: "Facebook",
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
                            ts: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            lt: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            cs: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            fi: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            no: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            br: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                            sl: "Facebook uses tracking cookies to track user behavior and use this data to provide them with relevant advertisements.",
                        },
                        cookie_ids: "wd, _fbp, fr",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56253,
                        name: {
                            en: "Taboola",
                            de: "Taboola",
                            fr: "Taboola",
                            it: "Taboola",
                            es: "Taboola",
                            nl: "Taboola",
                            bg: "Taboola",
                            da: "Taboola",
                            ru: "Taboola",
                            ar: "Taboola",
                            pl: "Taboola",
                            pt: "Taboola",
                            ca: "Taboola",
                            hu: "Taboola",
                            se: "Taboola",
                            cr: "Taboola",
                            zh: "Taboola",
                            uk: "Taboola",
                            sk: "Taboola",
                            ts: "Taboola",
                            lt: "Taboola",
                            cs: "Taboola",
                            fi: "Taboola",
                            no: "Taboola",
                            br: "Taboola",
                            sl: "Taboola",
                        },
                        description: {
                            en: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            de: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            fr: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            it: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            es: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            nl: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            bg: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            da: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            ru: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            ar: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            pl: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            pt: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            ca: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            hu: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            se: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            cr: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            zh: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            uk: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            sk: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            ts: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            lt: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            cs: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            fi: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            no: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            br: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                            sl: 'Taboola provides advertisements such as the "Around the Web" and "Recommended For You" boxes at the bottom of many online news articles.',
                        },
                        cookie_ids: "t_gid, taboola_usg",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56254,
                        name: {
                            en: "BidSwitch",
                            de: "BidSwitch",
                            fr: "BidSwitch",
                            it: "BidSwitch",
                            es: "BidSwitch",
                            nl: "BidSwitch",
                            bg: "BidSwitch",
                            da: "BidSwitch",
                            ru: "BidSwitch",
                            ar: "BidSwitch",
                            pl: "BidSwitch",
                            pt: "BidSwitch",
                            ca: "BidSwitch",
                            hu: "BidSwitch",
                            se: "BidSwitch",
                            cr: "BidSwitch",
                            zh: "BidSwitch",
                            uk: "BidSwitch",
                            sk: "BidSwitch",
                            ts: "BidSwitch",
                            lt: "BidSwitch",
                            cs: "BidSwitch",
                            fi: "BidSwitch",
                            no: "BidSwitch",
                            br: "BidSwitch",
                            sl: "BidSwitch",
                        },
                        description: {
                            en: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            de: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            fr: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            it: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            es: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            nl: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            bg: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            da: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            ru: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            ar: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            pl: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            pt: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            ca: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            hu: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            se: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            cr: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            zh: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            uk: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            sk: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            ts: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            lt: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            cs: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            fi: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            no: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            br: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                            sl: "BidSwitch is a middleware that allows connected programmatic partners to seamlessly access new platforms and services to optimize their performance.",
                        },
                        cookie_ids: "tuuid, tuuid_lu",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56255,
                        name: {
                            en: "AppNexus",
                            de: "AppNexus",
                            fr: "AppNexus",
                            it: "AppNexus",
                            es: "AppNexus",
                            nl: "AppNexus",
                            bg: "AppNexus",
                            da: "AppNexus",
                            ru: "AppNexus",
                            ar: "AppNexus",
                            pl: "AppNexus",
                            pt: "AppNexus",
                            ca: "AppNexus",
                            hu: "AppNexus",
                            se: "AppNexus",
                            cr: "AppNexus",
                            zh: "AppNexus",
                            uk: "AppNexus",
                            sk: "AppNexus",
                            ts: "AppNexus",
                            lt: "AppNexus",
                            cs: "AppNexus",
                            fi: "AppNexus",
                            no: "AppNexus",
                            br: "AppNexus",
                            sl: "AppNexus",
                        },
                        description: {
                            en: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            de: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            fr: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            it: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            es: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            nl: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            bg: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            da: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            ru: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            ar: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            pl: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            pt: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            ca: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            hu: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            se: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            cr: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            zh: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            uk: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            sk: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            ts: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            lt: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            cs: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            fi: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            no: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            br: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                            sl: "AppNexus provides cloud-based software platform enables and optimizes programmatic online advertising.",
                        },
                        cookie_ids: "uuid2, anj",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56256,
                        name: {
                            en: "Thebrighttag",
                            de: "Thebrighttag",
                            fr: "Thebrighttag",
                            it: "Thebrighttag",
                            es: "Thebrighttag",
                            nl: "Thebrighttag",
                            bg: "Thebrighttag",
                            da: "Thebrighttag",
                            ru: "Thebrighttag",
                            ar: "Thebrighttag",
                            pl: "Thebrighttag",
                            pt: "Thebrighttag",
                            ca: "Thebrighttag",
                            hu: "Thebrighttag",
                            se: "Thebrighttag",
                            cr: "Thebrighttag",
                            zh: "Thebrighttag",
                            uk: "Thebrighttag",
                            sk: "Thebrighttag",
                            ts: "Thebrighttag",
                            lt: "Thebrighttag",
                            cs: "Thebrighttag",
                            fi: "Thebrighttag",
                            no: "Thebrighttag",
                            br: "Thebrighttag",
                            sl: "Thebrighttag",
                        },
                        description: {
                            en: "Description unavailable.",
                            de: "Description unavailable.",
                            fr: "Description unavailable.",
                            it: "Description unavailable.",
                            es: "Description unavailable.",
                            nl: "Description unavailable.",
                            bg: "Description unavailable.",
                            da: "Description unavailable.",
                            ru: "Description unavailable.",
                            ar: "Description unavailable.",
                            pl: "Description unavailable.",
                            pt: "Description unavailable.",
                            ca: "Description unavailable.",
                            hu: "Description unavailable.",
                            se: "Description unavailable.",
                            cr: "Description unavailable.",
                            zh: "Description unavailable.",
                            uk: "Description unavailable.",
                            sk: "Description unavailable.",
                            ts: "Description unavailable.",
                            lt: "Description unavailable.",
                            cs: "Description unavailable.",
                            fi: "Description unavailable.",
                            no: "Description unavailable.",
                            br: "Description unavailable.",
                            sl: "Description unavailable.",
                        },
                        cookie_ids: "btpdb.yri1Ute.dGZjLjY2MTMxOTQ",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56257,
                        name: {
                            en: "Source Unknown",
                            de: "Source Unknown",
                            fr: "Source Unknown",
                            it: "Source Unknown",
                            es: "Source Unknown",
                            nl: "Source Unknown",
                            bg: "Source Unknown",
                            da: "Source Unknown",
                            ru: "Source Unknown",
                            ar: "Source Unknown",
                            pl: "Source Unknown",
                            pt: "Source Unknown",
                            ca: "Source Unknown",
                            hu: "Source Unknown",
                            se: "Source Unknown",
                            cr: "Source Unknown",
                            zh: "Source Unknown",
                            uk: "Source Unknown",
                            sk: "Source Unknown",
                            ts: "Source Unknown",
                            lt: "Source Unknown",
                            cs: "Source Unknown",
                            fi: "Source Unknown",
                            no: "Source Unknown",
                            br: "Source Unknown",
                            sl: "Source Unknown",
                        },
                        description: {
                            en: "The source of these cookies is not known yet.",
                            de: "The source of these cookies is not known yet.",
                            fr: "The source of these cookies is not known yet.",
                            it: "The source of these cookies is not known yet.",
                            es: "The source of these cookies is not known yet.",
                            nl: "The source of these cookies is not known yet.",
                            bg: "The source of these cookies is not known yet.",
                            da: "The source of these cookies is not known yet.",
                            ru: "The source of these cookies is not known yet.",
                            ar: "The source of these cookies is not known yet.",
                            pl: "The source of these cookies is not known yet.",
                            pt: "The source of these cookies is not known yet.",
                            ca: "The source of these cookies is not known yet.",
                            hu: "The source of these cookies is not known yet.",
                            se: "The source of these cookies is not known yet.",
                            cr: "The source of these cookies is not known yet.",
                            zh: "The source of these cookies is not known yet.",
                            uk: "The source of these cookies is not known yet.",
                            sk: "The source of these cookies is not known yet.",
                            ts: "The source of these cookies is not known yet.",
                            lt: "The source of these cookies is not known yet.",
                            cs: "The source of these cookies is not known yet.",
                            fi: "The source of these cookies is not known yet.",
                            no: "The source of these cookies is not known yet.",
                            br: "The source of these cookies is not known yet.",
                            sl: "The source of these cookies is not known yet.",
                        },
                        cookie_ids: "1P_JAR, SSID, APISID, SIDCC, NID, mt_mop, ruds, uuid, uuidc, _parsely_session, uid, APID, IDSYNC, CONSENT, LSID, _rxuuid, adinj, cto_lwid, uid",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                    {
                        id: 56258,
                        name: {
                            en: "AddThis",
                            de: "AddThis",
                            fr: "AddThis",
                            it: "AddThis",
                            es: "AddThis",
                            nl: "AddThis",
                            bg: "AddThis",
                            da: "AddThis",
                            ru: "AddThis",
                            ar: "AddThis",
                            pl: "AddThis",
                            pt: "AddThis",
                            ca: "AddThis",
                            hu: "AddThis",
                            se: "AddThis",
                            cr: "AddThis",
                            zh: "AddThis",
                            uk: "AddThis",
                            sk: "AddThis",
                            ts: "AddThis",
                            lt: "AddThis",
                            cs: "AddThis",
                            fi: "AddThis",
                            no: "AddThis",
                            br: "AddThis",
                            sl: "AddThis",
                        },
                        description: {
                            en: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            de: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            fr: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            it: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            es: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            nl: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            bg: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            da: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ru: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ar: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            pl: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            pt: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ca: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            hu: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            se: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            cr: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            zh: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            uk: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            sk: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            ts: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            lt: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            cs: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            fi: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            no: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            br: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                            sl: "AddThis gives free online tools including social media share button, targetting tools, and content recommendations to help reach out to more people on social media.",
                        },
                        cookie_ids: "di2, loc",
                        active: 1,
                        head_script: null,
                        body_script: null,
                    },
                ],
                cookies: [
                    {
                        id: 295647,
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
                            ru: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            ar: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            pl: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            pt: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            ca: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            hu: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            se: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            cr: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            zh: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            uk: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            sk: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            ts: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            lt: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            cs: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            fi: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            no: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            br: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                            sl: "This cookie is set by Youtube. Used to track the information of the embedded YouTube videos on a website.",
                        },
                        duration: "5 months 27 days",
                        type: "https",
                        domain: ".youtube.com",
                    },
                    {
                        id: 295648,
                        cookie_id: "test_cookie",
                        description: {
                            en: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            de: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            fr: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            it: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            es: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            nl: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            bg: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            da: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            ru: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            ar: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            pl: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            pt: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            ca: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            hu: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            se: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            cr: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            zh: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            uk: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            sk: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            ts: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            lt: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            cs: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            fi: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            no: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            br: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                            sl: "This cookie is set by doubleclick.net. The purpose of the cookie is to determine if the user's browser supports cookies.",
                        },
                        duration: "15 minutes",
                        type: "https",
                        domain: ".doubleclick.net",
                    },
                    {
                        id: 295649,
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
                            da:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            ru:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            ar:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            pl:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            pt:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            ca:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            hu:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            se:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            cr:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            zh:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            uk:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            sk:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            ts:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            lt:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            cs:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            fi:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            no:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            br:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                            sl:
                                "Used by Google DoubleClick and stores information about how the user uses the website and any other advertisement before visiting the website. This is used to present users with ads that are relevant to them according to the user profile.",
                        },
                        duration: "1 year 24 days",
                        type: "https",
                        domain: ".doubleclick.net",
                    },
                    {
                        id: 295650,
                        cookie_id: "__adroll",
                        description: {
                            en: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            de: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            fr: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            it: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            es: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            nl: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            bg: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            da: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            ru: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            ar: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            pl: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            pt: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            ca: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            hu: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            se: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            cr: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            zh: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            uk: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            sk: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            ts: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            lt: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            cs: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            fi: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            no: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            br: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            sl: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                        },
                        duration: "1 year 1 month",
                        type: "https",
                        domain: "d.adroll.com",
                    },
                    {
                        id: 295651,
                        cookie_id: "__adroll_shared",
                        description: {
                            en: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            de: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            fr: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            it: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            es: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            nl: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            bg: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            da: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            ru: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            ar: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            pl: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            pt: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            ca: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            hu: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            se: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            cr: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            zh: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            uk: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            sk: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            ts: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            lt: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            cs: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            fi: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            no: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            br: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                            sl: "The domain of this cookie is owned by Adroll. This cookie is used for collecting user data across website. The collected data is used to serve more relevant advertisement.",
                        },
                        duration: "1 year 1 month",
                        type: "https",
                        domain: ".adroll.com",
                    },
                    {
                        id: 295652,
                        cookie_id: "__adroll_fpc",
                        description: {
                            en: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            de: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            fr: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            it: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            es: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            nl: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            bg: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            da: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            ru: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            ar: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            pl: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            pt: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            ca: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            hu: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            se: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            cr: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            zh: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            uk: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            sk: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            ts: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            lt: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            cs: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            fi: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            no: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            br: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                            sl: "This cookie is set by AdRoll Group, to identify the device when the users move between different Digital Properties, for the purpose of serving targeted advertisements.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".www.tyndale.com",
                    },
                    {
                        id: 295653,
                        cookie_id: "__ar_v4",
                        description: {
                            en: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            de: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            fr: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            it: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            es: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            nl: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            bg: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            da: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            ru: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            ar: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            pl: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            pt: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            ca: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            hu: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            se: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            cr: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            zh: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            uk: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            sk: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            ts: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            lt: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            cs: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            fi: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            no: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            br: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                            sl: "This cookie is associated with Google DoubleClick. This cookie is used for advertising purposes. It helps in tracking the ads conversion rates.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".www.tyndale.com",
                    },
                    {
                        id: 295654,
                        cookie_id: "CMID",
                        description: {
                            en: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            de: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            fr: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            it: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            es: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            nl: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            bg: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            da: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            ru: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            ar: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            pl: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            pt: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            ca: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            hu: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            se: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            cr: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            zh: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            uk: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            sk: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            ts: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            lt: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            cs: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            fi: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            no: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            br: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            sl: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".casalemedia.com",
                    },
                    {
                        id: 295655,
                        cookie_id: "CMPS",
                        description: {
                            en: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            de: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            fr: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            it: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            es: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            nl: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            bg: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            da: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ru: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ar: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            pl: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            pt: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ca: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            hu: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            se: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            cr: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            zh: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            uk: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            sk: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ts: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            lt: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            cs: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            fi: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            no: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            br: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            sl: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".casalemedia.com",
                    },
                    {
                        id: 295656,
                        cookie_id: "PUBMDCID",
                        description: {
                            en: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            de: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            fr: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            it: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            es: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            nl: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            bg: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            da: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            ru: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            ar: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            pl: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            pt: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            ca: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            hu: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            se: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            cr: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            zh: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            uk: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            sk: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            ts: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            lt: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            cs: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            fi: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            no: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            br: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                            sl: "This cookie is set by pubmatic.com. The cookie stores an ID that is used to display ads on the users' browser.",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".pubmatic.com",
                    },
                    {
                        id: 295657,
                        cookie_id: "CMPRO",
                        description: {
                            en: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            de: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            fr: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            it: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            es: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            nl: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            bg: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            da: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ru: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ar: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            pl: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            pt: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ca: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            hu: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            se: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            cr: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            zh: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            uk: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            sk: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ts: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            lt: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            cs: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            fi: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            no: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            br: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            sl: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".casalemedia.com",
                    },
                    {
                        id: 295658,
                        cookie_id: "CMRUM3",
                        description: {
                            en: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            de: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            fr: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            it: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            es: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            nl: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            bg: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            da: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ru: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ar: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            pl: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            pt: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ca: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            hu: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            se: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            cr: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            zh: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            uk: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            sk: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            ts: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            lt: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            cs: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            fi: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            no: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            br: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                            sl: "This cookie is set by Casalemedia and is used for targeted advertisement purposes. ",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".casalemedia.com",
                    },
                    {
                        id: 295659,
                        cookie_id: "CMST",
                        description: {
                            en: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            de: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            fr: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            it: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            es: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            nl: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            bg: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            da: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            ru: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            ar: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            pl: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            pt: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            ca: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            hu: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            se: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            cr: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            zh: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            uk: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            sk: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            ts: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            lt: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            cs: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            fi: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            no: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            br: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                            sl: "The cookie is set by CasaleMedia. The cookie is used to collect information about the usage behavior for targeted advertising.",
                        },
                        duration: "1 day",
                        type: "https",
                        domain: ".casalemedia.com",
                    },
                    {
                        id: 295660,
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
                            se: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            cr: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            zh: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            uk: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            sk: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            ts: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            lt: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            cs: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            fi: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            no: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            br: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                            sl: "This cookie is set by Facebook to deliver advertisement when they are on Facebook or a digital platform powered by Facebook advertising after visiting this website.",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295661,
                        cookie_id: "adrl",
                        description: {
                            en: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            de: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            fr: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            it: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            es: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            nl: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            bg: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            da: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            ru: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            ar: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            pl: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            pt: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            ca: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            hu: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            se: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            cr: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            zh: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            uk: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            sk: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            ts: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            lt: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            cs: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            fi: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            no: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            br: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                            sl: "This cookie is used to register data on the visitors. This information is used to optimmize the advertisement relevance.",
                        },
                        duration: "1 month",
                        type: "https",
                        domain: ".outbrain.com",
                    },
                    {
                        id: 295662,
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
                            se:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            cr:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            zh:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            uk:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            sk:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            ts:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            lt:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            cs:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            fi:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            no:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            br:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                            sl:
                                "The cookie is set by Facebook to show relevant advertisments to the users and measure and improve the advertisements. The cookie also tracks the behavior of the user across the web on sites that have Facebook pixel or Facebook social plugin.",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".facebook.com",
                    },
                    {
                        id: 295663,
                        cookie_id: "t_gid",
                        description: {
                            en: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            de: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            fr: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            it: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            es: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            nl: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            bg: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            da: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            ru: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            ar: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            pl: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            pt: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            ca: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            hu: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            se: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            cr: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            zh: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            uk: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            sk: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            ts: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            lt: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            cs: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            fi: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            no: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            br: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                            sl: "The cookie is set by taboola.com. The cookie assigns a unique user ID to users and use this ID for serving relevant advertisement and content.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".taboola.com",
                    },
                    {
                        id: 295664,
                        cookie_id: "tluid",
                        description: {
                            en: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            de: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            fr: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            it: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            es: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            nl: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            bg: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            da: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            ru: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            ar: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            pl: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            pt: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            ca: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            hu: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            se: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            cr: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            zh: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            uk: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            sk: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            ts: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            lt: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            cs: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            fi: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            no: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            br: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                            sl: "This cookie is set by the provider AdRoll.This cookie is used to identify the visitor and to serve them with relevant ads by collecting user behaviour from multiple websites.",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".3lift.com",
                    },
                    {
                        id: 295665,
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
                            da:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            ru:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            ar:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            pl:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            pt:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            ca:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            hu:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            se:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            cr:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            zh:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            uk:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            sk:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            ts:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            lt:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            cs:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            fi:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            no:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            br:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            sl:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".bidswitch.net",
                    },
                    {
                        id: 295666,
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
                            da:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            ru:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            ar:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            pl:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            pt:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            ca:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            hu:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            se:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            cr:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            zh:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            uk:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            sk:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            ts:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            lt:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            cs:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            fi:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            no:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            br:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                            sl:
                                "This cookie is set by .bidswitch.net. The cookies stores a unique ID for the purpose of the determining what adverts the users have seen if you have visited any of the advertisers website. The information is used for determining when and how often users will see a certain banner.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".bidswitch.net",
                    },
                    {
                        id: 295667,
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
                            da:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            ru:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            ar:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            pl:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            pt:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            ca:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            hu:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            se:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            cr:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            zh:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            uk:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            sk:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            ts:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            lt:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            cs:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            fi:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            no:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            br:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                            sl:
                                "This cookies is set by AppNexus. The cookies stores information that helps in distinguishing between devices and browsers. This information us used to select advertisements served by the platform and assess the performance of the advertisement and attribute payment for those advertisements.",
                        },
                        duration: "3 months",
                        type: "https",
                        domain: ".adnxs.com",
                    },
                    {
                        id: 295668,
                        cookie_id: "B",
                        description: {
                            en: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            de: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            fr: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            it: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            es: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            nl: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            bg: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            da: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            ru: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            ar: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            pl: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            pt: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            ca: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            hu: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            se: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            cr: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            zh: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            uk: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            sk: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            ts: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            lt: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            cs: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            fi: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            no: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            br: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                            sl: "This Cookie is used by Yahoo to provide ads, contents or analytics.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".yahoo.com",
                    },
                    {
                        id: 295669,
                        cookie_id: "cookieJartestCookie",
                        description: {
                            en: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            de: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            fr: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            it: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            es: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            nl: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            bg: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            da: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            ru: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            ar: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            pl: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            pt: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            ca: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            hu: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            se: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            cr: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            zh: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            uk: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            sk: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            ts: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            lt: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            cs: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            fi: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            no: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            br: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                            sl: "This cookie is set by the provider Outbrain. This cookie is used by the website operator inorder to know the efficiency of the marketing by determining how the user accessed the website.",
                        },
                        duration: "17 hours",
                        type: "https",
                        domain: "sync.outbrain.com",
                    },
                    {
                        id: 295670,
                        cookie_id: "NID",
                        description: {
                            en: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            de: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            fr: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            it: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            es: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            nl: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            bg: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            da: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            ru: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            ar: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            pl: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            pt: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            ca: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            hu: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            se: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            cr: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            zh: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            uk: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            sk: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            ts: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            lt: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            cs: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            fi: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            no: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            br: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                            sl: "This cookie is used to a profile based on user's interest and display personalized ads to the users.",
                        },
                        duration: "6 months",
                        type: "https",
                        domain: ".google.com",
                    },
                    {
                        id: 295671,
                        cookie_id: "loc",
                        description: {
                            en: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            de: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            fr: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            it: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            es: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            nl: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            bg: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            da: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            ru: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            ar: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            pl: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            pt: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            ca: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            hu: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            se: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            cr: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            zh: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            uk: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            sk: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            ts: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            lt: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            cs: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            fi: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            no: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            br: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                            sl: "This cookie is set by Addthis. This is a geolocation cookie to understand where the users sharing the information are located.",
                        },
                        duration: "1 year 1 month",
                        type: "https",
                        domain: ".addthis.com",
                    },
                ],
            },
            {
                id: 160999,
                slug: "other",
                order: 6,
                name: { en: "Other", de: "Other", fr: "Other", it: "Other", es: "Other", nl: "Other", bg: "Other", ar: "Other" },
                defaultConsent: 0,
                active: 1,
                settings: { ccpa: { doNotSell: "1" } },
                type: 2,
                description: {
                    en: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                    de: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                    fr: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                    it: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                    es: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                    nl: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                    bg: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                    ar: "Other uncategorized cookies are those that are being analyzed and have not been classified into a category as yet.",
                },
                cookies: [
                    {
                        id: 295601,
                        cookie_id: "cookielawinfo-checkbox-others",
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
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295602,
                        cookie_id: "_gat_gtag_UA_105226049_15",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295603,
                        cookie_id: "CONSENT",
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
                        duration: "16 years 8 months 22 days 17 hours 21 minutes",
                        type: "http",
                        domain: ".youtube.com",
                    },
                    {
                        id: 295604,
                        cookie_id: "ARRAffinitySameSite",
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
                        duration: "session",
                        type: "https",
                        domain: ".tynadmin.tyndale.com",
                    },
                    {
                        id: 295605,
                        cookie_id: "_gat_gtag_UA_105226049_14",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295606,
                        cookie_id: "tyndale",
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
                        duration: "14 days",
                        type: "http",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295607,
                        cookie_id: "BE_CLA3",
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
                        duration: "101 years 10 months 6 days",
                        type: "https",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295608,
                        cookie_id: "BE_CTA_TESTMODE_f00000000080685",
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
                        duration: "session",
                        type: "http",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295609,
                        cookie_id: "visit_id",
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
                        duration: "4 hours",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295610,
                        cookie_id: "KRTBCOOKIE_10",
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
                        duration: "1 year 1 month 4 days",
                        type: "https",
                        domain: ".pubmatic.com",
                    },
                    {
                        id: 295611,
                        cookie_id: "A3",
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
                        domain: ".yahoo.com",
                    },
                    {
                        id: 295612,
                        cookie_id: "i",
                        description: {
                            en: "The purpose of the cookie is not known yet.",
                            de: "The purpose of the cookie is not known yet.",
                            fr: "The purpose of the cookie is not known yet.",
                            it: "The purpose of the cookie is not known yet.",
                            es: "The purpose of the cookie is not known yet.",
                            nl: "The purpose of the cookie is not known yet.",
                            bg: "The purpose of the cookie is not known yet.",
                            da: "The purpose of the cookie is not known yet.",
                            ru: "The purpose of the cookie is not known yet.",
                            ar: "The purpose of the cookie is not known yet.",
                            pl: "The purpose of the cookie is not known yet.",
                            pt: "The purpose of the cookie is not known yet.",
                            ca: "The purpose of the cookie is not known yet.",
                            hu: "The purpose of the cookie is not known yet.",
                            se: "The purpose of the cookie is not known yet.",
                            cr: "The purpose of the cookie is not known yet.",
                            zh: "The purpose of the cookie is not known yet.",
                            uk: "The purpose of the cookie is not known yet.",
                            sk: "The purpose of the cookie is not known yet.",
                            ts: "The purpose of the cookie is not known yet.",
                            lt: "The purpose of the cookie is not known yet.",
                            cs: "The purpose of the cookie is not known yet.",
                            fi: "The purpose of the cookie is not known yet.",
                            no: "The purpose of the cookie is not known yet.",
                            br: "The purpose of the cookie is not known yet.",
                            sl: "The purpose of the cookie is not known yet.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".openx.net",
                    },
                    {
                        id: 295613,
                        cookie_id: "c",
                        description: {
                            en: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            de: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            fr: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            it: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            es: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            nl: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            bg: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            da: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            ru: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            ar: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            pl: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            pt: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            ca: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            hu: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            se: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            cr: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            zh: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            uk: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            sk: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            ts: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            lt: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            cs: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            fi: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            no: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            br: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                            sl: "This cookie is set by the Rubicon Project. The exact purpose of the cookie is not known.",
                        },
                        duration: "1 year",
                        type: "https",
                        domain: ".bidswitch.net",
                    },
                    {
                        id: 295614,
                        cookie_id: "anj",
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
                        duration: "3 months",
                        type: "https",
                        domain: ".adnxs.com",
                    },
                    {
                        id: 295615,
                        cookie_id: "tyndale_popup_6bae22b8",
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
                        duration: "1 day",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295616,
                        cookie_id: "_gat_gtag_UA_3289387_1",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295617,
                        cookie_id: "tyndale_category",
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
                        duration: "session",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295618,
                        cookie_id: "_te_",
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
                        duration: "session",
                        type: "http",
                        domain: ".www.tyndale.com",
                    },
                    {
                        id: 295619,
                        cookie_id: "RUL",
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
                        domain: ".doubleclick.net",
                    },
                    {
                        id: 295620,
                        cookie_id: "tyndale_trending",
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
                        duration: "session",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295621,
                        cookie_id: "tyndale_rfy_prod_page_hits",
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
                        duration: "1 month",
                        type: "https",
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295622,
                        cookie_id: "_gat_gtag_UA_24308071_24",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295623,
                        cookie_id: "_gat_newTracker",
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
                        duration: "1 minute",
                        type: "https",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295624,
                        cookie_id: "_gat_gtag_UA_3191772_3",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295625,
                        cookie_id: "_gat_gtag_UA_3191772_9",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295626,
                        cookie_id: "recent-searches",
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
                        domain: "www.tyndale.com",
                    },
                    {
                        id: 295627,
                        cookie_id: "BNI_new_persistence",
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
                        duration: "",
                        type: "https",
                        domain: "newton.newtonsoftware.com",
                    },
                    {
                        id: 295628,
                        cookie_id: "xtc",
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
                        duration: "1 year 1 month",
                        type: "http",
                        domain: ".addthis.com",
                    },
                    {
                        id: 295629,
                        cookie_id: "_gat_gtag_UA_105226049_10",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295630,
                        cookie_id: "PP-K0L8l",
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
                        duration: "1 hour",
                        type: "http",
                        domain: "gleam.io",
                    },
                    {
                        id: 295631,
                        cookie_id: "owner_token",
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
                        duration: "1 day",
                        type: "https",
                        domain: "gleam.io",
                    },
                    {
                        id: 295632,
                        cookie_id: "RL-K0L8l",
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
                        duration: "1 day",
                        type: "http",
                        domain: "gleam.io",
                    },
                    {
                        id: 295633,
                        cookie_id: "L-K0L8l",
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
                        duration: "1 day",
                        type: "http",
                        domain: "gleam.io",
                    },
                    {
                        id: 295634,
                        cookie_id: "_gfpc",
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
                        duration: "session",
                        type: "https",
                        domain: "gleam.io",
                    },
                    {
                        id: 295635,
                        cookie_id: "_app_session",
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
                        duration: "1 month",
                        type: "https",
                        domain: "gleam.io",
                    },
                    {
                        id: 295904,
                        cookie_id: "_gat_gtag_UA_3191772_11",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295905,
                        cookie_id: "_gat_gtag_UA_24532303_50",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295929,
                        cookie_id: "_gat_gtag_UA_25090088_25",
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
                        duration: "1 minute",
                        type: "http",
                        domain: ".tyndale.com",
                    },
                    {
                        id: 295930,
                        cookie_id: "churchconnect",
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
                        duration: "16 hours 15 minutes",
                        type: "http",
                        domain: "www.tyndale.com",
                    },
                ],
            },
        ],
        privacyPolicy: {
            title: {
                en: "Privacy Policy",
                de: "Datenschutz-Bestimmungen",
                fr: "Politique de confidentialit\u00e9",
                it: "politica sulla riservatezza",
                es: "Pol\u00edtica de privacidad",
                nl: "Privacybeleid",
                bg: "\u0414\u0435\u043a\u043b\u0430\u0440\u0430\u0446\u0438\u044f \u0437\u0430 \u043f\u043e\u0432\u0435\u0440\u0438\u0442\u0435\u043b\u043d\u043e\u0441\u0442",
                da: "Fortrolighedspolitik",
                ru: "\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438",
                ar: "\u0633\u064a\u0627\u0633\u0629 \u062e\u0627\u0635\u0629",
                pl: "Polityka prywatno\u015bci",
                pt: "Pol\u00edtica de Privacidade",
                ca: "Pol\u00edtica de privacitat",
                hu: "Pol\u00edtica de Privacidade",
                se: "Pol\u00edtica de privacitat",
                cr: "Pravila o privatnostiy",
                zh: "Privacy Policy",
                uk: "\u041f\u043e\u043b\u0456\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0456\u0434\u0435\u043d\u0446\u0456\u0439\u043d\u043e\u0441\u0442\u0456",
                sk: "Privacy Policy",
                ts: "Gizlilik Politikas\u0131",
                lt: "Privatumo politika",
                cs: "Z\u00e1sady ochrany osobn\u00edch \u00fadaj\u016f",
                fi: "Tietosuojak\u00e4yt\u00e4nt\u00f6",
                no: "Personvernregler",
                br: "Pol\u00edtica de Privacidade",
                sl: "Pravilnik o zasebnosti",
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
                da:
                    "<p>Dette websted bruger cookies til at forbedre din oplevelse, mens du navigerer gennem webstedet. Ud af disse cookies gemmes de cookies, der er kategoriseret efter behov, i din browser, da de er v\u00e6sentlige for, at websitetens grundl\u00e6ggende funktionaliteter fungerer. </p><p>Vi bruger ogs\u00e5 tredjepartscookies, der hj\u00e6lper os med at analysere og forst\u00e5, hvordan du bruger dette websted, til at gemme brugerpr\u00e6ferencer og give dem indhold og reklamer, der er relevante for dig. Disse cookies gemmes kun i din browser med dit samtykke hertil. Du har ogs\u00e5 muligheden for at frav\u00e6lge disse cookies. Men at frav\u00e6lge nogle af disse cookies kan have en indvirkning p\u00e5 din browseroplevelse.</p>",
                ru:
                    "<p>\u0412\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043f\u0435\u0440\u0435\u043c\u0435\u0449\u0430\u0442\u044c\u0441\u044f \u043f\u043e \u044d\u0442\u043e\u043c\u0443 \u0441\u0430\u0439\u0442\u0443, \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044f \u0432\u0430\u0448 \u0441\u0430\u0439\u0442. \u0418\u0437 \u044d\u0442\u0438\u0445 \u0444\u0430\u0439\u043b\u043e\u0432 cookie \u044d\u0442\u043e \u0444\u0430\u0439\u043b\u044b, \u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u043a\u043b\u0430\u0441\u0441\u0438\u0444\u0438\u0446\u0438\u0440\u0443\u044e\u0442\u0441\u044f \u043a\u0430\u043a \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u044b\u0435 \u0438 \u0445\u0440\u0430\u043d\u044f\u0442\u0441\u044f \u0432 \u0432\u0430\u0448\u0435\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. </p><p>\u041c\u044b \u0442\u0430\u043a\u0436\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u043c \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0438\u0435 \u0444\u0430\u0439\u043b\u044b cookie, \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u043c\u043e\u0447\u044c \u043d\u0430\u043c \u043f\u0440\u043e\u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0438 \u043f\u043e\u043d\u044f\u0442\u044c, \u043a\u0430\u043a \u0432\u044b \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0435 \u044d\u0442\u043e\u0442 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442, \u0445\u0440\u0430\u043d\u0438\u0442\u0435 \u043a\u043e\u043d\u0442\u0435\u043d\u0442 \u0438 \u0440\u0435\u043a\u043b\u0430\u043c\u0443 \u0432\u043c\u0435\u0441\u0442\u0435 \u0441 \u043d\u0438\u043c\u0438. \u042d\u0442\u0438 \u043a\u0443\u043a\u0438 \u0431\u0443\u0434\u0443\u0442 \u0445\u0440\u0430\u043d\u0438\u0442\u044c\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u0432 \u0432\u0430\u0448\u0435\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. \u0423 \u0432\u0430\u0441 \u0442\u0430\u043a\u0436\u0435 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u0432\u043e\u0437\u043c\u043e\u0436\u043d\u043e\u0441\u0442\u044c \u043e\u0442\u043a\u0430\u0437\u0430\u0442\u044c\u0441\u044f \u043e\u0442 \u044d\u0442\u0438\u0445 \u0444\u0430\u0439\u043b\u043e\u0432 cookie.</p>",
                ar:
                    "<p>\u064a\u0633\u062a\u062e\u062f\u0645 \u0645\u0648\u0642\u0639 \u0627\u0644\u0648\u064a\u0628 \u0647\u0630\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0644\u062a\u062d\u0633\u064a\u0646 \u062a\u062c\u0631\u0628\u062a\u0643 \u0623\u062b\u0646\u0627\u0621 \u0627\u0644\u062a\u0646\u0642\u0644 \u0639\u0628\u0631 \u0627\u0644\u0645\u0648\u0642\u0639. \u0645\u0646 \u0628\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u060c \u064a\u062a\u0645 \u062a\u062e\u0632\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0645\u0635\u0646\u0641\u0629 \u062d\u0633\u0628 \u0627\u0644\u0636\u0631\u0648\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u062a\u0635\u0641\u062d \u0627\u0644\u062e\u0627\u0635 \u0628\u0643 \u0644\u0623\u0646\u0647\u0627 \u0636\u0631\u0648\u0631\u064a\u0629 \u0644\u0639\u0645\u0644 \u0627\u0644\u0648\u0638\u0627\u0626\u0641 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0644\u0644\u0645\u0648\u0642\u0639. </p><p>\u0646\u0633\u062a\u062e\u062f\u0645 \u0623\u064a\u0636\u064b\u0627 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0631\u062a\u0628\u0627\u0637 \u0627\u0644\u0637\u0631\u0641 \u0627\u0644\u062b\u0627\u0644\u062b \u0627\u0644\u062a\u064a \u062a\u0633\u0627\u0639\u062f\u0646\u0627 \u0639\u0644\u0649 \u062a\u062d\u0644\u064a\u0644 \u0648\u0641\u0647\u0645 \u0643\u064a\u0641\u064a\u0629 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0643 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0642\u0639 \u060c \u0644\u062a\u062e\u0632\u064a\u0646 \u062a\u0641\u0636\u064a\u0644\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0648\u062a\u0632\u0648\u064a\u062f\u0647\u0645 \u0628\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0648\u0627\u0644\u0625\u0639\u0644\u0627\u0646\u0627\u062a \u0630\u0627\u062a \u0627\u0644\u0635\u0644\u0629 \u0628\u0643. \u0633\u064a\u062a\u0645 \u062a\u062e\u0632\u064a\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0641\u0642\u0637 \u0639\u0644\u0649 \u0645\u062a\u0635\u0641\u062d\u0643 \u0628\u0645\u0648\u0627\u0641\u0642\u062a\u0643 \u0639\u0644\u0649 \u0627\u0644\u0642\u064a\u0627\u0645 \u0628\u0630\u0644\u0643. \u0644\u062f\u064a\u0643 \u0623\u064a\u0636\u064b\u0627 \u062e\u064a\u0627\u0631 \u0625\u0644\u063a\u0627\u0621 \u0627\u0644\u0627\u0634\u062a\u0631\u0627\u0643 \u0645\u0646 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647. \u0644\u0643\u0646 \u0625\u0644\u063a\u0627\u0621 \u0627\u0634\u062a\u0631\u0627\u0643 \u0628\u0639\u0636 \u0645\u0644\u0641\u0627\u062a \u062a\u0639\u0631\u064a\u0641 \u0627\u0644\u0627\u0631\u062a\u0628\u0627\u0637 \u0647\u0630\u0647 \u0642\u062f \u064a\u0643\u0648\u0646 \u0644\u0647 \u062a\u0623\u062b\u064a\u0631 \u0639\u0644\u0649 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u062a\u0635\u0641\u062d \u0644\u062f\u064a\u0643.</p>",
                pl:
                    "<p>Ta strona korzysta z plik\u00f3w cookie, aby poprawi\u0107 Twoje wra\u017cenia podczas przegl\u0105dania witryny. Z tych plik\u00f3w cookie, kt\u00f3re s\u0105 sklasyfikowane jako niezb\u0119dne, s\u0105 przechowywane w przegl\u0105darce, poniewa\u017c s\u0105 niezb\u0119dne do dzia\u0142ania podstawowych funkcji strony internetowej.</p> <p>U\u017cywamy r\u00f3wnie\u017c plik\u00f3w cookie stron trzecich, kt\u00f3re pomagaj\u0105 nam analizowa\u0107 i zrozumie\u0107, w jaki spos\u00f3b korzystasz z tej witryny, przechowywa\u0107 preferencje u\u017cytkownika i dostarcza\u0107 im tre\u015bci i reklamy, kt\u00f3re s\u0105 dla Ciebie istotne. Te pliki cookie b\u0119d\u0105 przechowywane w Twojej przegl\u0105darce tylko za Twoj\u0105 zgod\u0105. Mo\u017cesz r\u00f3wnie\u017c zrezygnowa\u0107 z tych plik\u00f3w cookie, ale rezygnacja z niekt\u00f3rych z tych plik\u00f3w cookie mo\u017ce mie\u0107 wp\u0142yw na wygod\u0119 przegl\u0105dania.</p>",
                pt:
                    "<p>Este site usa cookies para melhorar sua experi\u00eancia enquanto voc\u00ea navega pelo site. Destes cookies, os cookies que s\u00e3o categorizados como necess\u00e1rios s\u00e3o armazenados no seu navegador, pois s\u00e3o essenciais para o funcionamento das funcionalidades b\u00e1sicas do site.</p><p>Tamb\u00e9m usamos cookies de terceiros que nos ajudam a analisar e entender como voc\u00ea usa este site, para armazenar as prefer\u00eancias do usu\u00e1rio e fornecer-lhes conte\u00fado e an\u00fancios relevantes para voc\u00ea. Esses cookies s\u00f3 ser\u00e3o armazenados em seu navegador com o seu consentimento para faz\u00ea-lo. Voc\u00ea tamb\u00e9m tem a op\u00e7\u00e3o de cancelar o recebimento desses cookies. Mas o cancelamento de alguns desses cookies pode afetar sua experi\u00eancia de navega\u00e7\u00e3o.</p>",
                ca:
                    "<p>Aquest lloc web utilitza cookies per millorar la vostra experi\u00e8ncia mentre navegueu pel lloc web. D\u2019aquestes cookies, les cookies que es classifiquen com a necess\u00e0ries s\u2019emmagatzemen al vostre navegador, ja que s\u00f3n essencials per al funcionament de les funcionalitats b\u00e0siques del lloc web.</p><p>Tamb\u00e9 fem servir cookies de tercers que ens ajuden a analitzar i entendre com utilitzeu aquest lloc web, per emmagatzemar les prefer\u00e8ncies dels usuaris i proporcionar-los contingut i anuncis que siguin rellevants per a vosaltres. Aquestes cookies nom\u00e9s s\u2019emmagatzemaran al vostre navegador amb el vostre consentiment. Tamb\u00e9 teniu l\u2019opci\u00f3 de desactivar aquestes cookies, per\u00f2 desactivar algunes d\u2019aquestes cookies pot afectar la vostra experi\u00e8ncia de navegaci\u00f3.</p>",
                hu:
                    "<p>Ez a weboldal s\u00fctiket haszn\u00e1l az \u00d6n \u00e9lm\u00e9ny\u00e9nek jav\u00edt\u00e1sa \u00e9rdek\u00e9ben, mik\u00f6zben \u00d6n a webhelyen navig\u00e1l. Ezen cookie-k k\u00f6z\u00fcl a sz\u00fcks\u00e9g szerint kategoriz\u00e1lt s\u00fctiket az \u00d6n b\u00f6ng\u00e9sz\u0151je t\u00e1rolja, mivel elengedhetetlenek a weboldal alapvet\u0151 funkci\u00f3inak m\u0171k\u00f6d\u00e9s\u00e9hez.</p><p>Harmadik f\u00e9lt\u0151l sz\u00e1rmaz\u00f3 s\u00fctiket is haszn\u00e1lunk, amelyek seg\u00edtenek elemezni \u00e9s meg\u00e9rteni, hogyan haszn\u00e1lja ezt a weboldalt, a felhaszn\u00e1l\u00f3i preferenci\u00e1k t\u00e1rol\u00e1s\u00e1hoz, valamint az \u00d6n sz\u00e1m\u00e1ra relev\u00e1ns tartalom \u00e9s hirdet\u00e9sek biztos\u00edt\u00e1s\u00e1hoz. Ezeket a s\u00fctiket csak az \u00d6n b\u00f6ng\u00e9sz\u0151j\u00e9ben t\u00e1roljuk az \u00d6n beleegyez\u00e9s\u00e9vel. \u00d6nnek lehet\u0151s\u00e9ge van ezekr\u0151l a s\u00fctikr\u0151l is lemondani. De ezeknek a s\u00fctiknek a kikapcsol\u00e1sa hat\u00e1ssal lehet a b\u00f6ng\u00e9sz\u00e9si \u00e9lm\u00e9ny\u00e9re.</p>",
                se:
                    "<p>Denna webbplats anv\u00e4nder cookies f\u00f6r att f\u00f6rb\u00e4ttra din upplevelse medan du navigerar genom webbplatsen. Av dessa cookies lagras de cookies som kategoriseras som n\u00f6dv\u00e4ndiga i din webbl\u00e4sare eftersom de \u00e4r v\u00e4sentliga f\u00f6r att de grundl\u00e4ggande funktionerna p\u00e5 webbplatsen ska fungera.</p><p>Vi anv\u00e4nder ocks\u00e5 cookies fr\u00e5n tredje part som hj\u00e4lper oss att analysera och f\u00f6rst\u00e5 hur du anv\u00e4nder denna webbplats, f\u00f6r att lagra anv\u00e4ndarinst\u00e4llningar och f\u00f6rse dem med inneh\u00e5ll och annonser som \u00e4r relevanta f\u00f6r dig. Dessa cookies lagras endast i din webbl\u00e4sare med ditt samtycke till att g\u00f6ra det. Du har ocks\u00e5 m\u00f6jlighet att v\u00e4lja bort dessa cookies. Men att v\u00e4lja bort vissa av dessa cookies kan ha en inverkan p\u00e5 din surfupplevelse.</p>",
                cr:
                    "<p>Ova web stranica koristi kola\u010di\u0107e za pobolj\u0161anje va\u0161eg iskustva tijekom navigacije web stranicom. Od ovih kola\u010di\u0107a, kola\u010di\u0107i koji su kategorizirani prema potrebi pohranjuju se u va\u0161em pregledniku jer su neophodni za rad osnovnih funkcija web mjesta.</p><p>Tako\u0111er koristimo kola\u010di\u0107e tre\u0107ih strana koji nam poma\u017eu analizirati i razumjeti kako upotrebljavate ovu web stranicu, za pohranu korisni\u010dkih postavki i pru\u017eanje sadr\u017eaja i reklama koji su za vas relevantni. Ovi \u0107e se kola\u010di\u0107i pohraniti u va\u0161 preglednik samo uz va\u0161 pristanak za to. Tako\u0111er imate mogu\u0107nost odjave od ovih kola\u010di\u0107a. Ali isklju\u010divanje nekih od tih kola\u010di\u0107a mo\u017ee utjecati na va\u0161e iskustvo pregledavanja.</p>",
                zh:
                    "<p>\u5f53\u60a8\u6d4f\u89c8\u7f51\u7ad9\u65f6\uff0c\u8be5\u7f51\u7ad9\u4f7f\u7528cookie\u6765\u6539\u5584\u60a8\u7684\u4f53\u9a8c\u3002 \u5728\u8fd9\u4e9bCookie\u4e2d\uff0c\u6839\u636e\u9700\u8981\u5206\u7c7b\u7684Cookie\u4f1a\u5b58\u50a8\u5728\u60a8\u7684\u6d4f\u89c8\u5668\u4e2d\uff0c\u56e0\u4e3a\u5b83\u4eec\u662f\u7f51\u7ad9\u57fa\u672c\u529f\u80fd\u6b63\u5e38\u8fd0\u884c\u6240\u5fc5\u9700\u7684\u3002 </ p> <p>\u6211\u4eec\u8fd8\u4f7f\u7528\u7b2c\u4e09\u65b9cookie\uff0c\u4ee5\u5e2e\u52a9\u6211\u4eec\u5206\u6790\u548c\u4e86\u89e3\u60a8\u5982\u4f55\u4f7f\u7528\u672c\u7f51\u7ad9\uff0c\u5b58\u50a8\u7528\u6237\u504f\u597d\u5e76\u4e3a\u4ed6\u4eec\u63d0\u4f9b\u4e0e\u60a8\u76f8\u5173\u7684\u5185\u5bb9\u548c\u5e7f\u544a\u3002 \u8fd9\u4e9bCookie\u4ec5\u5728\u60a8\u540c\u610f\u7684\u60c5\u51b5\u4e0b\u5b58\u50a8\u5728\u6d4f\u89c8\u5668\u4e2d\u3002 \u60a8\u8fd8\u53ef\u4ee5\u9009\u62e9\u4e0d\u4f7f\u7528\u8fd9\u4e9bcookie\u3002\u4f46\u662f\uff0c\u9009\u62e9\u4e0d\u4f7f\u7528\u5176\u4e2d\u7684\u4e00\u4e9bcookie\u53ef\u80fd\u4f1a\u5f71\u54cd\u60a8\u7684\u6d4f\u89c8\u4f53\u9a8c\u3002</ p>",
                uk:
                    "<p>\u0426\u0435\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0454 \u0444\u0430\u0439\u043b\u0438 cookie \u0434\u043b\u044f \u043f\u043e\u043a\u0440\u0430\u0449\u0435\u043d\u043d\u044f \u0432\u0430\u0448\u043e\u0433\u043e \u0434\u043e\u0441\u0432\u0456\u0434\u0443 \u043f\u0456\u0434 \u0447\u0430\u0441 \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0443 \u043f\u043e \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443. \u0417 \u0446\u0438\u0445 \u0444\u0430\u0439\u043b\u0456\u0432 cookie \u0444\u0430\u0439\u043b\u0438 cookie, \u043a\u043b\u0430\u0441\u0438\u0444\u0456\u043a\u043e\u0432\u0430\u043d\u0456 \u0437\u0430 \u043d\u0435\u043e\u0431\u0445\u0456\u0434\u043d\u0456\u0441\u0442\u044e, \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u044e\u0442\u044c\u0441\u044f \u0443 \u0432\u0430\u0448\u043e\u043c\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456, \u043e\u0441\u043a\u0456\u043b\u044c\u043a\u0438 \u0432\u043e\u043d\u0438 \u0454 \u0432\u0430\u0436\u043b\u0438\u0432\u0438\u043c\u0438 \u0434\u043b\u044f \u0440\u043e\u0431\u043e\u0442\u0438 \u043e\u0441\u043d\u043e\u0432\u043d\u0438\u0445 \u0444\u0443\u043d\u043a\u0446\u0456\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442\u0443. </p><p>\u041c\u0438 \u0442\u0430\u043a\u043e\u0436 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0454\u043c\u043e \u0441\u0442\u043e\u0440\u043e\u043d\u043d\u0456 \u0444\u0430\u0439\u043b\u0438 cookie, \u044f\u043a\u0456 \u0434\u043e\u043f\u043e\u043c\u0430\u0433\u0430\u044e\u0442\u044c \u043d\u0430\u043c \u0430\u043d\u0430\u043b\u0456\u0437\u0443\u0432\u0430\u0442\u0438 \u0442\u0430 \u0440\u043e\u0437\u0443\u043c\u0456\u0442\u0438, \u044f\u043a \u0432\u0438 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u043e\u0432\u0443\u0454\u0442\u0435 \u0446\u0435\u0439 \u0432\u0435\u0431-\u0441\u0430\u0439\u0442, \u0434\u043b\u044f \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u043d\u043d\u044f \u043d\u0430\u043b\u0430\u0448\u0442\u0443\u0432\u0430\u043d\u044c \u043a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0456\u0432 \u0442\u0430 \u043d\u0430\u0434\u0430\u043d\u043d\u044f \u0457\u043c \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u043d\u043e\u0433\u043e \u0434\u043b\u044f \u0432\u0430\u0441 \u0432\u043c\u0456\u0441\u0442\u0443 \u0442\u0430 \u0440\u0435\u043a\u043b\u0430\u043c\u0438. \u0426\u0456 \u0444\u0430\u0439\u043b\u0438 cookie \u0437\u0431\u0435\u0440\u0456\u0433\u0430\u0442\u0438\u043c\u0443\u0442\u044c\u0441\u044f \u0443 \u0432\u0430\u0448\u043e\u043c\u0443 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0456 \u043b\u0438\u0448\u0435 \u0437 \u0432\u0430\u0448\u043e\u0457 \u0437\u0433\u043e\u0434\u0438 \u043d\u0430 \u0446\u0435. \u0412\u0438 \u0442\u0430\u043a\u043e\u0436 \u043c\u043e\u0436\u0435\u0442\u0435 \u0432\u0456\u0434\u043c\u043e\u0432\u0438\u0442\u0438\u0441\u044c \u0432\u0456\u0434 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u0430\u043d\u043d\u044f \u0446\u0438\u0445 \u0444\u0430\u0439\u043b\u0456\u0432 cookie, \u0430\u043b\u0435 \u0432\u0456\u0434\u043c\u043e\u0432\u0430 \u0432\u0456\u0434 \u0432\u0438\u043a\u043e\u0440\u0438\u0441\u0442\u0430\u043d\u043d\u044f \u0446\u0438\u0445 \u0444\u0430\u0439\u043b\u0456\u0432 cookie \u043c\u043e\u0436\u0435 \u0432\u043f\u043b\u0438\u043d\u0443\u0442\u0438 \u043d\u0430 \u0432\u0430\u0448 \u043f\u0435\u0440\u0435\u0433\u043b\u044f\u0434 \u0432\u0435\u0431-\u0441\u0442\u043e\u0440\u0456\u043d\u043e\u043a.</p>",
                sk:
                    "<p>T\u00e1to webov\u00e1 str\u00e1nka pou\u017e\u00edva s\u00fabory cookie na zlep\u0161enie v\u00e1\u0161ho z\u00e1\u017eitku pri prech\u00e1dzan\u00ed webovou str\u00e1nkou. Z t\u00fdchto s\u00faborov cookie sa vo va\u0161om prehliada\u010di ukladaj\u00fa s\u00fabory cookie, ktor\u00e9 s\u00fa kategorizovan\u00e9 pod\u013ea potreby, preto\u017ee s\u00fa nevyhnutn\u00e9 pre fungovanie z\u00e1kladn\u00fdch funkci\u00ed webovej str\u00e1nky. </p><p>Pou\u017e\u00edvame tie\u017e s\u00fabory cookie tret\u00edch str\u00e1n, ktor\u00e9 n\u00e1m pom\u00e1haj\u00fa analyzova\u0165 a porozumie\u0165 tomu, ako pou\u017e\u00edvate t\u00fato webov\u00fa str\u00e1nku, na ukladanie preferenci\u00ed pou\u017e\u00edvate\u013eov a na poskytovanie obsahu a rekl\u00e1m, ktor\u00e9 s\u00fa pre v\u00e1s relevantn\u00e9. Tieto s\u00fabory cookie sa vo va\u0161om prehliada\u010di ulo\u017eia iba s va\u0161\u00edm s\u00fahlasom. M\u00e1te tie\u017e mo\u017enos\u0165 deaktivova\u0165 tieto s\u00fabory cookie. Deaktiv\u00e1cia niektor\u00fdch z t\u00fdchto s\u00faborov cookie v\u0161ak m\u00f4\u017ee ma\u0165 vplyv na va\u0161u sk\u00fasenos\u0165 s prehliadan\u00edm.</p>",
                ts:
                    "<p>Bu web sitesi, web sitesinde gezinirken deneyiminizi iyile\u015ftirmek i\u00e7in tan\u0131mlama bilgileri kullan\u0131r. Bu \u00e7erezlerin d\u0131\u015f\u0131nda, gerekli \u015fekilde kategorize edilen \u00e7erezler, web sitesinin temel i\u015flevlerinin \u00e7al\u0131\u015fmas\u0131 i\u00e7in gerekli olduklar\u0131 i\u00e7in taray\u0131c\u0131n\u0131zda saklan\u0131r.</p><p>Ayr\u0131ca, bu web sitesini nas\u0131l kulland\u0131\u011f\u0131n\u0131z\u0131 analiz etmemize ve anlamam\u0131za, kullan\u0131c\u0131 tercihlerini saklamam\u0131za ve onlara sizinle alakal\u0131 i\u00e7erik ve reklamlar sunmam\u0131za yard\u0131mc\u0131 olan \u00fc\u00e7\u00fcnc\u00fc taraf \u00e7erezleri de kullan\u0131yoruz. Bu \u00e7erezler, yaln\u0131zca sizin izninizle taray\u0131c\u0131n\u0131zda saklanacakt\u0131r. Ayr\u0131ca, bu \u00e7erezleri devre d\u0131\u015f\u0131 b\u0131rakma se\u00e7ene\u011finiz de vard\u0131r, ancak bu \u00e7erezlerden baz\u0131lar\u0131n\u0131 devre d\u0131\u015f\u0131 b\u0131rakman\u0131z, tarama deneyiminizi etkileyebilir.</p>",
                lt:
                    "<p>\u0160i svetain\u0117 naudoja slapukus, kad pagerint\u0173 j\u016bs\u0173 patirt\u012f nar\u0161ant svetain\u0117je. I\u0161 \u0161i\u0173 slapuk\u0173 slapukai, kurie yra priskirti reikiamoms kategorijoms, yra saugomi j\u016bs\u0173 nar\u0161ykl\u0117je, nes jie yra b\u016btini norint atlikti pagrindines svetain\u0117s funkcijas. </p><p>Mes taip pat naudojame tre\u010di\u0173j\u0173 \u0161ali\u0173 slapukus, kurie padeda mums i\u0161analizuoti ir suprasti, kaip naudojat\u0117s \u0161ia svetaine, kad i\u0161saugotume vartotoj\u0173 nuostatas ir pateikt\u0173 jums aktual\u0173 turin\u012f ir reklam\u0105. \u0160ie slapukai bus saugomi j\u016bs\u0173 nar\u0161ykl\u0117je tik gavus j\u016bs\u0173 sutikim\u0105. J\u016bs taip pat turite galimyb\u0119 atsisakyti \u0161i\u0173 slapuk\u0173. Ta\u010diau atsisakymas kai kuri\u0173 i\u0161 \u0161i\u0173 slapuk\u0173 gali tur\u0117ti \u012ftakos j\u016bs\u0173 nar\u0161ymo patir\u010diai.</p>",
                cs:
                    "<p>Tento web pou\u017e\u00edv\u00e1 soubory cookie k vylep\u0161en\u00ed va\u0161eho z\u00e1\u017eitku p\u0159i proch\u00e1zen\u00ed webem. Z t\u011bchto soubor\u016f cookie jsou soubory cookie, kter\u00e9 jsou podle pot\u0159eby kategorizov\u00e1ny, ulo\u017eeny ve va\u0161em prohl\u00ed\u017ee\u010di, proto\u017ee jsou nezbytn\u00e9 pro fungov\u00e1n\u00ed z\u00e1kladn\u00edch funkc\u00ed webu. </p> <p> Pou\u017e\u00edv\u00e1me tak\u00e9 soubory cookie t\u0159et\u00edch stran, kter\u00e9 n\u00e1m pom\u00e1haj\u00ed analyzovat a porozum\u011bt tomu, jak pou\u017e\u00edv\u00e1te tento web, abychom ukl\u00e1dali preference u\u017eivatel\u016f a poskytovali jim obsah a reklamy, kter\u00e9 jsou pro v\u00e1s relevantn\u00ed. Tyto cookies budou ulo\u017eeny ve va\u0161em prohl\u00ed\u017ee\u010di pouze s va\u0161\u00edm souhlasem. M\u00e1te tak\u00e9 mo\u017enost se z t\u011bchto soubor\u016f cookie odhl\u00e1sit. Odhl\u00e1\u0161en\u00ed z n\u011bkter\u00fdch z t\u011bchto soubor\u016f cookie v\u0161ak m\u016f\u017ee m\u00edt vliv na va\u0161e proch\u00e1zen\u00ed.</p>",
                fi:
                    "<p>T\u00e4m\u00e4 verkkosivusto k\u00e4ytt\u00e4\u00e4 ev\u00e4steit\u00e4 k\u00e4ytt\u00f6kokemuksen parantamiseen selatessasi verkkosivustoa. N\u00e4ist\u00e4 ev\u00e4steist\u00e4 tarpeelliseksi luokitellut ev\u00e4steet tallennetaan selaimeesi, koska ne ovat v\u00e4ltt\u00e4m\u00e4tt\u00f6mi\u00e4 verkkosivuston perustoimintojen toiminnalle. </p><p>K\u00e4yt\u00e4mme my\u00f6s kolmansien osapuolten ev\u00e4steit\u00e4, jotka auttavat meit\u00e4 analysoimaan ja ymm\u00e4rt\u00e4m\u00e4\u00e4n, miten k\u00e4yt\u00e4t t\u00e4t\u00e4 verkkosivustoa, tallentamaan k\u00e4ytt\u00e4jien mieltymykset ja tarjoamaan heille sinulle merkityksellist\u00e4 sis\u00e4lt\u00f6\u00e4 ja mainoksia. N\u00e4m\u00e4 ev\u00e4steet tallennetaan selaimeesi vain suostumuksellasi siihen. Sinulla on my\u00f6s mahdollisuus kielt\u00e4yty\u00e4 n\u00e4ist\u00e4 ev\u00e4steist\u00e4, mutta joistakin n\u00e4ist\u00e4 ev\u00e4steist\u00e4 poistaminen voi vaikuttaa selauskokemukseesi.</p>",
                no:
                    "<p>Dette nettstedet bruker informasjonskapsler for \u00e5 forbedre opplevelsen din mens du navigerer gjennom nettstedet. Ut av disse informasjonskapslene lagres informasjonskapslene som er kategorisert som n\u00f8dvendige i nettleseren din, da de er avgj\u00f8rende for \u00e5 fungere med grunnleggende funksjoner p\u00e5 nettstedet. </p> <p> Vi bruker ogs\u00e5 tredjeparts informasjonskapsler som hjelper oss med \u00e5 analysere og forst\u00e5 hvordan du bruker dette nettstedet, for \u00e5 lagre brukerinnstillinger og gi dem innhold og annonser som er relevante for deg. Disse informasjonskapslene lagres bare i nettleseren din med ditt samtykke til \u00e5 gj\u00f8re det. Du har ogs\u00e5 muligheten til \u00e5 velge bort disse informasjonskapslene, men \u00e5 velge bort noen av disse informasjonskapslene kan ha en innvirkning p\u00e5 nettleseropplevelsen din.</p>",
                br:
                    "<p>Este site usa cookies para melhorar sua experi\u00eancia enquanto voc\u00ea navega pelo site. Desses cookies, os cookies categorizados conforme necess\u00e1rio s\u00e3o armazenados no seu navegador, pois s\u00e3o essenciais para o funcionamento das funcionalidades b\u00e1sicas do site. </p><p>Tamb\u00e9m usamos cookies de terceiros que nos ajudam a analisar e entender como voc\u00ea usa este site, para armazenar as prefer\u00eancias do usu\u00e1rio e fornecer-lhes conte\u00fado e an\u00fancios que s\u00e3o relevantes para voc\u00ea. Esses cookies s\u00f3 ser\u00e3o armazenados no seu navegador com o seu consentimento para faz\u00ea-lo. Voc\u00ea tamb\u00e9m tem a op\u00e7\u00e3o de desativar esses cookies. Mas optar por alguns desses cookies pode ter um efeito na sua experi\u00eancia de navega\u00e7\u00e3o.</p>",
                sl:
                    "<p>Ta spletna stran uporablja pi\u0161kotke za izbolj\u0161anje va\u0161e izku\u0161nje med navigacijo po spletni strani. Od teh pi\u0161kotkov so pi\u0161kotki, ki so po potrebi kategorizirani, shranjeni v va\u0161em brskalniku, saj so bistveni za delovanje osnovnih funkcionalnosti spletnega mesta.</p><p>Uporabljamo tudi pi\u0161kotke tretjih oseb, ki nam pomagajo analizirati in razumeti, kako uporabljate to spletno mesto, shranjujemo uporabni\u0161ke nastavitve in jim posredujemo vsebine in oglase, ki so pomembni za vas. Ti pi\u0161kotki bodo shranjeni samo v va\u0161em brskalniku z va\u0161o privolijo, da to storite. Prav tako imate mo\u017enost, da umaknete te pi\u0161kotke. Toda umik iz nekaterih od teh pi\u0161kotkov lahko vpliva na va\u0161o izku\u0161njo brskanja.</p>",
            },
        },
    },
};
var cookieyesID = btoa(randomString(32)); //btoa(+new Date);
let loadAnalyticsByDefault = false;
cliConfig.info.categories.forEach((category) => {
    if (category.slug === "analytics" && category.settings !== null && "loadAnalyticsByDefault" in category.settings) {
        loadAnalyticsByDefault = category.settings.loadAnalyticsByDefault;
    }
});
window.addEventListener("load", function () {
    var createBannerOnLoad = function createBannerOnLoad(ckyActiveLaw) {
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
            console.log(ckyActiveLaw);
            if ((ckyconsent == "yes" && getCategoryCookie("cookieyes-" + item.name) == "yes") || ckyActiveLaw === 'ccpa') {
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
