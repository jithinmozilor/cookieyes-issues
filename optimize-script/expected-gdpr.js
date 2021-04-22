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

function ckySetSessionStorage(key, value="") {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function ckyGeoIP() {
  try {
    const geoIPResponse = await _ckyRequest('https://geoip.cookieyes.com/geoip/checker/result.php', "GET")
    if (geoIPResponse.status !== 200) throw new Error('something went wrong')
    const { ip: clientIP, in_eu: userInEu , country_name: countryName } = await geoIPResponse.json();
    ckySetSessionStorage("isEU", userInEu)
    const ipdata = { ip: clientIP.substring(0, clientIP.lastIndexOf(".")) + ".0", country_name: countryName };
    ckySetSessionStorage("ip", ipdata); 
  } catch (err) {
    console.log(err);
  }
}

function _ckyGetCookie(name) {
  const value = new RegExp(`${name}=([^;]+)`).exec(document.cookie);
  return value && Array.isArray(value) && value[1] ? unescape(value[1]) : null;
}

function ckyLogCookies() {
  let log = [
      { name: "CookieYes Consent", status: getCookie("cky-consent") },
      { name: "Necessary", status: "yes" },
      { name: "Functional", status: getCookie("cookieyes-functional") },
      { name: "Analytics", status: getCookie("cookieyes-analytics") },
      { name: "Performance", status: getCookie("cookieyes-performance") },
      { name: "Advertisement", status: getCookie("cookieyes-advertisement") },
      { name: "Other", status: getCookie("cookieyes-other") },
  ];
  let ip = sessionStorage.getItem("ip");
  let consent_id = getCookie("cookieyesID");
  var request = new XMLHttpRequest();
  var data = new FormData();
  data.append("log", JSON.stringify(log));
  data.append("key", "283620d36e7db014be743e51");
  data.append("ip", ip);
  data.append("consent_id", consent_id);
  request.open("POST", "https://app.cookieyes.com/api/v1/log", true);
  request.send(data);
};

function bannerActiveCheck() {
  var isActiveCheckCookiePresent = getCookie("cky-active-check");
  if (!isActiveCheckCookiePresent && window.fetch && window.Promise) {
      fetch("https://active.cookieyes.com/api/283620d36e7db014be743e51/log", { method: "POST" }).catch(function (err) {
          console.error(err);
      });
      setCookie("cky-active-check", "yes", 1);
  }
}




var ckyActiveLaw = "";

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
var tldomain = "www.abcde.com";
var cookieyesID = btoa(randomString(32)); //btoa(+new Date);
let loadAnalyticsByDefault = false;
cliConfig.info.categories.forEach(function (category) {
  if (category.slug === "analytics" && category.settings !== null && "loadAnalyticsByDefault" in category.settings) {
      loadAnalyticsByDefault = category.settings.loadAnalyticsByDefault;
  }
});


try {
  bannerActiveCheck();
} catch (err) {
  console.error(err);
}

// PART - 2 

window.addEventListener("load", function () {
  if(showonly)
  var createBannerOnLoad = function createBannerOnLoad(ckyActiveLaw) {

      // IE - 11 WORKING OF REMOVE FUNCTION, CAN WE DO SIMETHING BETTER HERE ?

      // Element.prototype.remove = function () {
      //     this.parentElement.removeChild(this);
      // };
      // NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
      //     for (var i = this.length - 1; i >= 0; i--) {
      //         if (this[i] && this[i].parentElement) {
      //             this[i].parentElement.removeChild(this[i]);
      //         }
      //     }
      // };


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
              // ****** ALREADY KNOW IF THE DETAIL TYPE IS STICKY OR POPUP, IN OUR CASE STICKY. ******* //

              //expected

              showHideStickyDetail();

              // current 

              // switch (template.detailType) {
              //     case "sticky":
              //         showHideStickyDetail();
              //         break;
              //     case "popup":
              //         showPopupDetail();
              // }
          },

          // ****** DO NOT SELL BUTTON CODE , THIS SHOULD NOT BE PRESENT FOR A GDPR ONLY USER. ******* //

          // doNotSell: function () {
          //     ccpaShowPopupDetail();
          // },
      };
      var positionValue = {
          bottom: { top: "auto", right: "0", bottom: "0", left: "auto" },
          top: { top: "0", right: "0", bottom: "auto", left: "auto" },
          "bottom-left": { top: "auto", right: "auto", bottom: "20px", left: "20px" },
          "bottom-right": { top: "auto", right: "20px", bottom: "20px", left: "auto" },
          "top-left": { top: "20px", right: "auto", bottom: "auto", left: "20px" },
          "top-right": { top: "20px", right: "20px", bottom: "auto", left: "auto" },
      };

      // CREATED SHORTHANDS FOR JS SELECTORS. CAN BE REMOVED IF NEEDED

      // function getById(element) {
      //     return document.getElementById(element);
      // }
      // function getByClass(element) {
      //     return document.getElementsByClassName(element);
      // }

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

          // ****** ADDING CLASS FOR STYLING BASED ON BANNER TYPE ( CONSIDERIG BOX TYPE IN THIS CASE ) ******* //

          // expected

          getById("cky-consent").classList.add("box-" + options.position);

          // current

          // if (options.consentBarType == "box") {
          //     getById("cky-consent").classList.add("box-" + options.position);
          // }

          // ****** CONSIDERED THE CASE USER CAN APPEND LOGO ( PRO USER ) ******* //

          // expected

          appendLogo();

          // current 

          // if (!!content[ckyActiveLaw].customLogoUrl) {
          //     appendLogo();
          // }

          // ************ //

          appendText();

          // ****** CONSIDERED THE CASE USER HAS TURNED - Render catedory bar on banner turned on ******* //

          // expected

          // current 

          renderCategoryBar();

          // if (options.showCategoryDirectly) {
          //     renderCategoryBar();
          // }

          // ************ //

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
          // ****** DECIDING THE OUTER WRAPER AFTER CHECKING IF CUSTOM LOGO IS PRESENT, CONSIDERING TRUE CASE ******* //

          // expected

          var consentBar = '<div class="cky-consent-bar" id="cky-consent">\
                              <div class="cky-content-logo-outer-wrapper" id="cky-content-logo">\
                                  <divs id="cky-content-logo-inner-wrapper">\
                                      <div class="cky-content-wrapper"></div>\
                                  </div>\
                              </div>\
                          </div>';

          // current 
          
          // var consentBar;
          // if (!!content[ckyActiveLaw].customLogoUrl) {
          //     consentBar =
          //         '<div class="cky-consent-bar" id="cky-consent">\
          //                         <div class="cky-content-logo-outer-wrapper" id="cky-content-logo">\
          //                             <divs id="cky-content-logo-inner-wrapper">\
          //                                 <div class="cky-content-wrapper"></div>\
          //                             </div>\
          //                         </div>\
          //                     </div>';
          // } else {
          //     consentBar = '<div class="cky-consent-bar" id="cky-consent">\
          //                         <div class="cky-content-wrapper"></div>\
          //                     </div>';
          // }

          // ************ //

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


              // ****** DECIDING WHERE TO APPEND AFTER CHECKING IF CUSTOM LOGO IS PRESENT, CONSIDERING TRUE CASE ******* //

              // expected

              document.querySelector("#cky-consent #cky-content-logo-inner-wrapper").insertAdjacentHTML("afterbegin", consentTitle);

              // current

              // if (!!content[ckyActiveLaw].customLogoUrl) {
              //     document.querySelector("#cky-consent #cky-content-logo-inner-wrapper").insertAdjacentHTML("afterbegin", consentTitle);
              // } else {
              //     getById("cky-consent").insertAdjacentHTML("afterbegin", consentTitle);
              // }

              // ************ //
          }
          var consentText = '<p class="cky-bar-text" style="color:' + colors[ckyActiveLaw].notice.textColor + '">' + content[ckyActiveLaw].text[selectedLanguage] + "</p>";
          getById("cky-consent").getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("beforeend", consentText);
      }
      function renderCategoryBar() {
          var categoryDirectList = '<div class="cky-category-direct" id="cky-category-direct" style="color:' + colors[ckyActiveLaw].notice.textColor + '"></div>';

          // ****** ADDING CLASS FOR STYLING BASED ON BANNER TYPE ( CONSIDERIG BOX TYPE IN THIS CASE ) ******* //

          // expected

          getById("cky-consent").getElementsByClassName("cky-bar-text")[0].insertAdjacentHTML("afterend", categoryDirectList);

          //current

          // if (options.consentBarType === "box") {
          //     getById("cky-consent").getElementsByClassName("cky-bar-text")[0].insertAdjacentHTML("afterend", categoryDirectList);
          // } else {
          //     getById("cky-consent").getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("afterend", categoryDirectList);
          // }

          // ************ //

          for (var i = 0; i < categories.length; i++) {
              var category = categories[i];
              var categoryBarItem = '<div class="cky-category-direct-item"><span class="cky-category-direct-name" id="cky-category-direct-' + category.name[selectedLanguage] + '">' + category.name[selectedLanguage] + "</span></div>";
              document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML("beforeend", categoryBarItem);
              createSwitches(category);
          }
      }
      function renderButtons() {
          ckyConsentBar.getElementsByClassName("cky-content-wrapper")[0].insertAdjacentHTML("beforeend", '<div class="cky-button-wrapper"></div>');
          // ****** IF CHECKING FOR BUTTON PRESENT IN CLI-CONFIG , SHOULD BE CHANGED ******* //

          //expected

          appendButton("settings");
          switchStickyOrPopup(); // WE ALREADY KNOW IF STICKY OR POPUP ( CLASSIC - STCKY OR BOX - POPUP )
          renderStickyDetail();  //  ADDING THIS FUNCTION INSTEAD OF ABOVE LINE WHICH WAS INSIDE switchStickyOrPopup()
          appendButton("reject");
          appendButton("accept");
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


          // current

          // if (display[ckyActiveLaw].buttons["settings"]) {
          //     appendButton("settings");
          //     switchStickyOrPopup();  
          // }
          // if (display[ckyActiveLaw].buttons["reject"]) {
          //     appendButton("reject");
          // }
          // if (display[ckyActiveLaw].buttons["accept"]) {
          //     appendButton("accept");
          // }
          // if (display[ckyActiveLaw].buttons["readMore"]) {
          //     let privacyLink = content[ckyActiveLaw].privacyPolicyLink[selectedLanguage].trim().replace(/\s/g, "");
          //     if (/^(:\/\/)/.test(privacyLink)) {
          //         privacyLink = "http" + privacyLink + "";
          //     }
          //     if (!/^(f|ht)tps?:\/\//i.test(privacyLink)) {
          //         privacyLink = "http://" + privacyLink + "";
          //     }
          //     var readMoreButton = '<a class="cky-btn-readMore" id="cky-btn-readMore" href="' + privacyLink + '" target="_blank">' + content[ckyActiveLaw].buttons["readMore"][selectedLanguage] + "</a>";
          //     document.querySelector("#cky-consent .cky-bar-text").insertAdjacentHTML("beforeend", readMoreButton);
          //     attachButtonStyles("readMore");
          // }



          // ****** DO NOT SELL BUTTON CODE , THIS SHOULD NOT BE PRESENT FOR A GDPR ONLY USER. ******* //

          // if (display[ckyActiveLaw].buttons["doNotSell"]) {
          //     var doNotSellButton = '<a class="cky-btn-doNotSell" id="cky-btn-doNotSell">' + content[ckyActiveLaw].buttons["doNotSell"][selectedLanguage] + "</a>";
          //     document.querySelector("#cky-consent .cky-button-wrapper").insertAdjacentHTML("beforeend", doNotSellButton);
          //     document.querySelector("#cky-consent #cky-btn-doNotSell").onclick = bannerFunctions["doNotSell"];
          //     renderCcpaPopupDetail();
          //     attachButtonStyles("doNotSell");
          // }
          

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
      // ****** NO NEED OF THIS FUNCTION ANYMORE ******* // 

      // function switchStickyOrPopup() {
      //     switch (template.detailType) {
      //         case "sticky":
      //             document.querySelector("#cky-consent #cky-btn-settings").style.borderColor = "transparent";
      //             renderStickyDetail();
      //             break;
      //         case "popup":
      //             renderPopupDetail();
      //     }
      // }
      
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

          // ****** APPENDING COOKIEYES LOGO , ASSUMING USER HAS NOT TURNED IN OFF IN THIS CASE ******* //

          //expected

          var ckyPoweredLink =
          '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
          getById("cky-detail-wrapper").insertAdjacentHTML("beforeend", ckyPoweredLink);

          //current

          // if (behaviour.showLogo) {
          //     var ckyPoweredLink =
          //         '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
          //     getById("cky-detail-wrapper").insertAdjacentHTML("beforeend", ckyPoweredLink);
          // }

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
                  // ****** showCategoryDirectly is OFF ******* //

                  //expected
                  createSwitches(category);

                  //current

                  // if (!options.showCategoryDirectly) {
                  //     createSwitches(category);
                  // }
                  // ****** showAuditTable IS ON ******* //

                  //expected

                  renderAuditTable(true, category);

                  //current

                  // if (behaviour.showAuditTable) {
                  //     renderAuditTable(true, category);
                  // }
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

          // ****** showCategoryDirectly is OFF ******* //

          //expected

          document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML("beforeend", customAcceptButton);

          // current 

          // if (options.showCategoryDirectly) {
          //     document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML("beforeend", customAcceptButton);
          // } else {
          //     document.querySelector("#cky-consent #cky-tab-menu").insertAdjacentHTML("beforeend", customAcceptButton);
          // }

          getById("cky-btn-custom-accept").onclick = function () {
              acceptCookies("customAccept");
          };
          getById("cky-detail-wrapper").style.display = "none";
      }

      // ****** THIS SHOULD NOT BE PRESENT FOR A GDPR ONLY USER. ******* //

      // function renderCcpaPopupDetail() {
      //     let ccpaDetailPopupOverlay = '<div class="cky-modal-backdrop cky-fade" id="cky-ccpa-modal-backdrop"></div>';
      //     let ccpaDetailPopup =
      //         '<div class="cky-modal cky-fade ccpa" id="cky-ccpa-settings-popup">\
      //                             <div class="cky-modal-dialog" style="background-color:' +
      //         colors[ckyActiveLaw].notice.bg +
      //         '">\
      //                                 <div class="cky-modal-content" id="cky-modal-content">\
      //                                 <div class="cky-opt-out-text" style="color:' +
      //         colors[ckyActiveLaw].notice.textColor +
      //         ';">' +
      //         content[ckyActiveLaw].confirmation.text[selectedLanguage] +
      //         '</div>\
      //                                     <div class="cky-button-wrapper">\
      //                                         <button type="button" class="cky-btn cky-btn-cancel" id="cky-btn-cancel"\
      //                                         style="color:' +
      //         colors[ckyActiveLaw].buttons["cancel"].textColor +
      //         ";\
      //                                         border-color:" +
      //         colors[ckyActiveLaw].buttons["cancel"].borderColor +
      //         ";\
      //                                         background-color:" +
      //         colors[ckyActiveLaw].buttons["cancel"].bg +
      //         ';\
      //                                         ">\
      //                                         ' +
      //         content[ckyActiveLaw].buttons.cancel[selectedLanguage] +
      //         '\
      //                                         </button>\
      //                                         <button type="button" class="cky-btn cky-btn-confirm" id="cky-btn-confirm"\
      //                                         style="color:' +
      //         colors[ckyActiveLaw].buttons["confirm"].textColor +
      //         ";\
      //                                         border-color:" +
      //         colors[ckyActiveLaw].buttons["confirm"].borderColor +
      //         ";\
      //                                         background-color:" +
      //         colors[ckyActiveLaw].buttons["confirm"].bg +
      //         ';\
      //                                         ">\
      //                                         ' +
      //         content[ckyActiveLaw].buttons.confirm[selectedLanguage] +
      //         "\
      //                                         </button>\
      //                                     </div>\
      //                                 </div>\
      //                             </div>\
      //                         </div>";
      //     body.insertAdjacentHTML("beforeend", ccpaDetailPopupOverlay);
      //     body.insertAdjacentHTML("beforeend", ccpaDetailPopup);
      //     if (behaviour.showLogo) {
      //         var ckyPoweredLink =
      //             '<div style="padding-top: 16px;font-size: 8px;color: ' +
      //             colors[ckyActiveLaw].notice.textColor +
      //             ';font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
      //         getById("cky-modal-content").insertAdjacentHTML("beforeend", ckyPoweredLink);
      //     }
      //     getById("cky-btn-cancel").onclick = closeCkyCcpaModal;
      //     getById("cky-btn-confirm").onclick = acceptCookies;
      // }
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

          // ****** showCategoryDirectly is OFF ******* //

          //expected

          getById("cky-category-direct-" + category.name[selectedLanguage] + "").insertAdjacentHTML("beforebegin", categoryCheckbox);

          // current

          // if (options.showCategoryDirectly) {
          //     getById("cky-category-direct-" + category.name[selectedLanguage] + "").insertAdjacentHTML("beforebegin", categoryCheckbox);
          // } else {
          //     getById("cky-tab-title-" + category.name[selectedLanguage] + "").insertAdjacentHTML("beforeend", categoryCheckbox);
          // }

          if (category.type === 1) {
              getById("cky-checkbox-category" + category.name[selectedLanguage] + "").setAttribute("disabled", true);
          }
      }
      // function renderPopupDetail() {
      //     var tabCss = "color:" + colors[ckyActiveLaw].popup.pills.textColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + "";
      //     var activeTabCss = "background-color:" + colors[ckyActiveLaw].popup.pills.activeBg + ";" + "color:" + colors[ckyActiveLaw].popup.pills.activeTextColor + ";" + "border-color:" + colors[ckyActiveLaw].notice.borderColor + ";";
      //     var detailPopupOverlay = '<div class="cky-modal-backdrop cky-fade" id="cky-modal-backdrop"></div>';
      //     var detailPopup =
      //         '<div class="cky-modal cky-fade" id="cky-settings-popup">\
      //                             <div class="cky-modal-dialog" style="background-color:' +
      //         colors[ckyActiveLaw].notice.bg +
      //         '">\
      //                             <div class="cky-modal-content" id="cky-modal-content" style="border:1px solid' +
      //         colors[ckyActiveLaw].notice.borderColor +
      //         '">\
      //                                     <div class="cky-tab">\
      //                                         <div class="cky-tab-menu" id="cky-tab-menu" style="background-color:' +
      //         colors[ckyActiveLaw].popup.pills.bg +
      //         '"></div>\
      //                                         <div class="cky-tab-content" id="cky-tab-content" style="background-color:' +
      //         colors[ckyActiveLaw].notice.bg +
      //         '">\
      //                                             <button type="button" class="cky-modal-close" id="ckyModalClose">\
      //                                                 <img src="https://cdn-cookieyes.com/assets/images/icons/close.svg" style="width: 9px" alt="modal-close-icon">\
      //                                             </button>\
      //                                         </div>\
      //                                     </div>\
      //                                 </div>\
      //                             </div>\
      //                         </div>';
      //     body.insertAdjacentHTML("beforeend", detailPopupOverlay);
      //     body.insertAdjacentHTML("beforeend", detailPopup);
      //     if (behaviour.showLogo) {
      //         var ckyPoweredLink =
      //             '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
      //         document.querySelector("#cky-settings-popup #cky-modal-content").insertAdjacentHTML("beforeend", ckyPoweredLink);
      //     }
      //     for (var i = 0; i < categories.length + 1; i++) {
      //         if (i === 0) {
      //             var ckyTabItem = '<div class="cky-tab-item cky-tab-item-active" id="cky-tab-item-privacy" tab-target="cky-tab-content-privacy" style="' + activeTabCss + '">' + privacyPolicy.title[selectedLanguage] + "</div>";
      //             var ckyTabContentItem =
      //                 '<div class="cky-tab-content-item cky-tab-content-active" id="cky-tab-content-privacy">\
      //                                             <div class="cky-tab-title" style="color:' +
      //                 colors[ckyActiveLaw].notice.textColor +
      //                 '">' +
      //                 privacyPolicy.title[selectedLanguage] +
      //                 '</div>\
      //                                             <div class="cky-tab-desc" style="color:' +
      //                 colors[ckyActiveLaw].notice.textColor +
      //                 '">' +
      //                 privacyPolicy.text[selectedLanguage] +
      //                 "</div>\
      //                                         </div>";
      //             document.querySelector("#cky-settings-popup #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
      //             document.querySelector("#cky-settings-popup #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
      //         } else {
      //             var category = categories[i - 1];
      //             var ckyTabItem =
      //                 '<div class="cky-tab-item" id="cky-tab-item-' +
      //                 category.name[selectedLanguage] +
      //                 '" tab-target="cky-tab-content-' +
      //                 category.name[selectedLanguage] +
      //                 '" style="' +
      //                 tabCss +
      //                 '">' +
      //                 category.name[selectedLanguage] +
      //                 "</div>";
      //             var ckyTabContentItem =
      //                 '<div class="cky-tab-content-item" id="cky-tab-content-' +
      //                 category.name[selectedLanguage] +
      //                 '">\
      //                                             <div class="cky-tab-title" id="cky-tab-title-' +
      //                 category.name[selectedLanguage] +
      //                 '" style="color:' +
      //                 colors[ckyActiveLaw].notice.textColor +
      //                 '">' +
      //                 category.name[selectedLanguage] +
      //                 '</div>\
      //                                             <div class="cky-tab-desc" style="color:' +
      //                 colors[ckyActiveLaw].notice.textColor +
      //                 '">' +
      //                 category.description[selectedLanguage] +
      //                 "</>\
      //                                         </div>";
      //             document.querySelector("#cky-settings-popup #cky-tab-menu").insertAdjacentHTML("beforeend", ckyTabItem);
      //             document.querySelector("#cky-settings-popup #cky-tab-content").insertAdjacentHTML("beforeend", ckyTabContentItem);
      //             if (!options.showCategoryDirectly) {
      //                 createSwitches(category);
      //             }
      //             if (behaviour.showAuditTable) {
      //                 renderAuditTable(true, category);
      //             }
      //         }
      //     }
      //     var ckyTabs = getByClass("cky-tab-item");
      //     for (var i = 0; i < ckyTabs.length; i++) {
      //         ckyTabs[i].onclick = function () {
      //             currentActiveTab = getByClass("cky-tab-item-active")[0];
      //             currentActiveTab.classList.remove("cky-tab-item-active");
      //             currentActiveTab.setAttribute("style", tabCss);
      //             this.classList.add("cky-tab-item-active");
      //             this.setAttribute("style", activeTabCss);
      //             document.querySelector("#cky-settings-popup .cky-tab-content-active").classList.remove("cky-tab-content-active");
      //             var tabId = this.getAttribute("tab-target");
      //             getById(tabId).className += " cky-tab-content-active";
      //         };
      //     }
      //     var customAcceptButton =
      //         '<button class="cky-btn cky-btn-custom-accept"\
      //     style = "\
      //                     color: ' +
      //         colors[ckyActiveLaw].popup.acceptCustomButton.textColor +
      //         ";\
      //                     background-color: " +
      //         colors[ckyActiveLaw].popup.acceptCustomButton.bg +
      //         ";\
      //                     border-color: " +
      //         colors[ckyActiveLaw].popup.acceptCustomButton.borderColor +
      //         ';\
      //                 "\
      //     id="cky-btn-custom-accept">' +
      //         content[ckyActiveLaw].customAcceptButton[selectedLanguage] +
      //         "</button>";
      //     if (options.showCategoryDirectly) {
      //         document.querySelector("#cky-consent #cky-category-direct").insertAdjacentHTML("beforeend", customAcceptButton);
      //     } else {
      //         document.querySelector("#cky-settings-popup #cky-tab-menu").insertAdjacentHTML("beforeend", customAcceptButton);
      //     }
      //     getById("cky-btn-custom-accept").onclick = function () {
      //         acceptCookies("customAccept");
      //         document.querySelector("#cky-modal-backdrop").classList.remove("cky-show");
      //     };
      //     document.querySelector("#cky-modal-backdrop").onclick = closeCkyModal;
      //     document.querySelector("#cky-settings-popup #ckyModalClose").onclick = closeCkyModal;
      // }
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

      // ****** DETAIL TYPE IS STYICKY , NOT POPUP ******* //
      // function showPopupDetail() {
      //     getById("cky-settings-popup").classList.add("cky-show");
      //     getByClass("cky-modal-backdrop")[0].classList.add("cky-show");
      //     calculateTabDescriptionHeight();
      // }

      // ****** THIS SHOULD NOT BE PRESENT FOR A GDPR ONLY USER. ******* //
      // function ccpaShowPopupDetail() {
      //     getById("cky-ccpa-settings-popup").classList.add("cky-show");
      //     getById("cky-ccpa-modal-backdrop").classList.add("cky-show");
      // }

      // ****** THIS SHOULD NOT BE PRESENT FOR A GDPR - STICKY TYPE USER. ******* //
      // function closeCkyModal() {
      //     getById("cky-settings-popup").classList.remove("cky-show");
      //     getByClass("cky-modal-backdrop")[0].classList.remove("cky-show");
      // }

      // ****** THIS SHOULD NOT BE PRESENT FOR A GDPR ONLY USER. ******* //
      // function closeCkyCcpaModal() {
      //     getById("cky-ccpa-settings-popup").classList.remove("cky-show");
      //     getById("cky-ccpa-modal-backdrop").classList.remove("cky-show");
      // }

      function acceptCookies(choice) {
          // ****** CONSIDERING USER TO BE GDPR . ******* //
          // expected
          updateCookies(choice);

          // current
          // if (ckyActiveLaw === "gdpr") {
          //     updateCookies(choice);
          // } else if (ckyActiveLaw === "ccpa") {
          //     ccpaRejectCookies();
          // }
          if (typeof ckyLogCookies !== "undefined") {
              window.addEventListener("beforeunload", ckyLogCookies());
          }
          cookie.set("cky-action", "yes", cookie.ACCEPT_COOKIE_EXPIRE);

          // ****** ASSUMING USER HAS TURED ON RELOAD ON BANNER ACTION . ******* //

          //expected

          location.reload();
          
          // current 

          // if (JSON.parse(behaviour.reload)) {
          //     location.reload();
          // } else {
          //     cookieYes.unblock();
          //     showToggler();
          // }
      }

      // ****** THIS SHOULD NOT BE PRESENT FOR A GDPR ONLY USER. ******* //
      // function ccpaRejectCookies() {
      //     cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
      //     for (var i = 0; i < info.categories.length; i++) {
      //         var category = info.categories[i];
      //         var ckyItemToSave = category;
      //         if (category.settings.ccpa.doNotSell === "1") {
      //             cookie.set("cookieyes-" + ckyItemToSave.slug, "no", cookie.ACCEPT_COOKIE_EXPIRE);
      //         } else {
      //             cookie.set("cookieyes-" + ckyItemToSave.slug, "yes", cookie.ACCEPT_COOKIE_EXPIRE);
      //         }
      //     }
      // }

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
          // ****** ASSUMING USER HAS TURED ON RELOAD ON BANNER ACTION . ******* //

          //expected

          location.reload();

          // current 

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
          // ****** ASSUMING USER HAS TURED ON DEFAULT CONSENT. ******* //

          // expected

          cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);

          // current
          
          // if (behaviour.defaultConsent) {
          //     cookie.set("cky-consent", "yes", cookie.ACCEPT_COOKIE_EXPIRE);
          // } else {
          //     cookie.set("cky-consent", "no", cookie.ACCEPT_COOKIE_EXPIRE);
          // }
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
      // ****** THIS SHOULD NOT BE PRESENT FOR A GDPR ONLY USER. ******* //
      // window.revisitCkySettings = function () {
      //     if (ckyActiveLaw === "ccpa") {
      //         if (!document.getElementById("cky-ccpa-settings-popup")) {
      //             renderCcpaPopupDetail();
      //         }
      //         if (!document.getElementById("cky-ccpa-settings-popup").classList.contains("cky-show")) {
      //             ccpaShowPopupDetail();
      //         }
      //     }
      // };
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
  ckyGeoIP();
});
function checkSelectedLanguage(selectedLanguage, ckyActiveLaw) {
  let siteLanguage = document.documentElement.lang;

  // ****** ALREADY KNOW IF THE USER IS FREE/PAID ******* //

  //expected
  if (!siteLanguage) {
    return selectedLanguage;
  }

  // current
  // if (cliConfig.options.plan === "free" || !siteLanguage) {
  //     return selectedLanguage;
  // }

  // ****** //

  if (cliConfig.options.content[ckyActiveLaw].title[siteLanguage]) {
      return siteLanguage;
  }
  const remove_after = siteLanguage.indexOf("-");
  if (remove_after >= 1) {
      siteLanguage = siteLanguage.substring(0, remove_after);
  }
  return cliConfig.options.content[ckyActiveLaw].title[siteLanguage] ? siteLanguage : selectedLanguage;
}


// PART- 3

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
          if ((ckyconsent == "yes" && getCategoryCookie("cookieyes-" + item.name) == "yes") || ckyActiveLaw === "ccpa") {
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
