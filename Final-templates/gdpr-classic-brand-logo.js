const cliConfig = {
  "options":{
     "colors":{
        "gdpr":{
           "popup":{
              "pills":{
                 "bg":"#414551",
                 "activeBg":"#161b23",
                 "textColor":"#ffffff",
                 "activeTextColor":"#ffffff"
              },
              "acceptCustomButton":{
                 "bg":"transparent",
                 "textColor":"#3a80ff",
                 "borderColor":"#3a80ff"
              }
           },
           "notice":{
              "bg":"#171b23",
              "textColor":"#bdc2d0",
              "titleColor":"#bdc2d0",
              "borderColor":"#4f5461"
           },
           "buttons":{
              "accept":{
                 "bg":"#0443b5",
                 "textColor":"#fff",
                 "borderColor":"#0443b5"
              },
              "reject":{
                 "bg":"#dedfe0",
                 "textColor":"#717375",
                 "borderColor":"transparent"
              },
              "readMore":{
                 "bg":"transparent",
                 "textColor":"#bdc2d0",
                 "borderColor":"transparent"
              },
              "settings":{
                 "bg":"transparent",
                 "textColor":"#dbdee7",
                 "borderColor":"#3f444e"
              }
           }
        }
     },
     "content":{
        "gdpr":{
           "text":{
              "de":"Diese Website verwendet Cookies, mit denen die Website funktioniert und wie Sie mit ihr interagieren, damit wir Ihnen eine verbesserte und angepasste Benutzererfahrung bieten k\u00f6nnen. Wir werden die Cookies nur verwenden, wenn Sie dem zustimmen, indem Sie auf Akzeptieren klicken. Sie k\u00f6nnen auch einzelne Cookie-Einstellungen in den Einstellungen verwalten.",
              "en":"This website uses cookies that help the website to function and also to track how you interact with our website. But for us to provide the best user experience, enable the specific cookies from Settings, and click on Accept."
           },
           "title":{
              "de":"Cookie Zustimmung",
              "en":"Cookie consent"
           },
           "buttons":{
              "accept":{
                 "de":"Alle akzeptieren",
                 "en":"Accept All"
              },
              "reject":{
                 "de":"Alles ablehnen",
                 "en":"Reject All"
              },
              "readMore":{
                 "de":"Weiterlesen",
                 "en":"Read More"
              },
              "settings":{
                 "de":"Einstellungen",
                 "en":"Preferences"
              }
           },
           "auditTable":{
              "type":{
                 "de":"Art",
                 "en":"Type"
              },
              "cookie":{
                 "de":"Cookie",
                 "en":"Cookie"
              },
              "duration":{
                 "de":"Dauer",
                 "en":"Duration"
              },
              "description":{
                 "de":"Beschreibung",
                 "en":"Description"
              }
           },
           "saveButton":{
              "de":"sparen",
              "en":"Save"
           },
           "customLogoUrl": "https://www.cookieyes.com/wp-content/themes/cookieyes/assets/images/logo-cookieyes.svg",
           "noticeToggler":{
              "de":"Cookie-Einstellungen",
              "en":"Cookie Settings"
           },
           "placeHolderText":{
              "de":"Bitte akzeptieren Sie die Cookie-Zustimmung",
              "en":"Please accept the cookie consent"
           },
           "privacyPolicyLink":{
              "de":"#",
              "en":"#"
           },
           "customAcceptButton":{
              "de":"Speichern Sie meine Einstellungen",
              "en":"Save my preferences"
           }
        }
     },
     "position":"bottom",
     "template":{
        "css":".cky-consent-bar-trigger, .cky-consent-bar, .cky-modal, .cky-consent-bar-trigger *, .cky-consent-bar *, .cky-modal * { box-sizing: border-box; } .cky-consent-bar-trigger *:focus, .cky-consent-bar *:focus, .cky-modal *:focus { outline: 0; } .cky-consent-bar-trigger { position: fixed; right: 30px; padding: 2px 5px; font-size: 13px; cursor: pointer; font-family: inherit; animation: slide-up 0.4s ease; z-index: 9997; } .cky-consent-bar { font-family: inherit; position: fixed; z-index: 9997; } .cky-consent-bar .cky-consent-title { font-size: 15px; font-weight: bold; margin-bottom: 3px; } .cky-consent-bar p { line-height: 20px; font-size: 13px; font-weight: normal; margin-bottom: 0; margin-top: 0; } .cky-btn { font-size: 12px; padding: .5rem 1rem; background: none; cursor: pointer; display: inline-block; text-align: center; white-space: nowrap; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; border: 1px solid transparent; line-height: 1; transition: all .15s ease-in-out; margin: 0; min-height: auto; font-weight: normal; border-radius: 0; } .cky-btn:hover { opacity: .8; } .cky-btn:focus { outline: 0; } .cky-button-wrapper .cky-btn { margin-right: 15px; } .cky-button-wrapper .cky-btn:last-child { margin-right: 0; } .cky-btn.cky-btn-custom-accept { margin: 1.5rem 1rem; font-weight: 600; white-space: initial; word-break: break-word; } .cky-btn-readMore { cursor: pointer; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-btn-doNotSell { cursor: pointer; white-space: nowrap; font-weight: bold; font-size: 13px; text-decoration: underline; margin-left: 3px; } .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: flex; align-items: center; } .cky-consent-bar.cky-logo-active .cky-logo { margin-right: 30px; } @media (max-width: 540px) { .cky-consent-bar.cky-logo-active .cky-content-logo-outer-wrapper { display: block; } } .cky-tab { display: -ms-flexbox; display: flex; } .cky-tab-menu { flex: 0 0 25%; max-width: 25%; } @media (max-width: 991px) { .cky-tab-menu { flex: 0 0 40%; max-width: 40%; } } .cky-tab-content { flex: 0 0 75%; max-width: 75%; background: transparent; padding: 15px 20px; } @media (max-width: 991px) { .cky-tab-content { flex: 0 0 60%; max-width: 60%; } } @media (max-width: 767px) { .cky-tab-content { padding: 15px; } } .cky-tab-item { font-size: 11px; cursor: pointer; font-weight: normal; border-bottom: 1px solid; border-right: 1px solid; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.5; } @media (max-width: 767px) { .cky-tab-item { font-size: 11px; padding: .75rem .75rem; } } .cky-tab-item-active { cursor: initial; border-right: 0; } .cky-tab-content .cky-tab-desc, .cky-tab-content .cky-tab-desc p { font-size: 12px; } .cky-tab-title { font-size: 13px; margin-bottom: 11px; margin-top: 0; font-family: inherit; font-weight: bold; line-height: 1; display: flex; align-items: center; } .cky-tab-content .cky-tab-content-item:not(.cky-tab-content-active) { display: none; } .cky-category-direct { display: -ms-flexbox; display: flex; -ms-flex-wrap: wrap; flex-wrap: wrap; padding-top: 15px; margin-top: 15px; border-top: 1px solid #d4d8df; } .cky-category-direct .cky-btn-custom-accept { margin: 0 0 0 auto; } .cky-category-direct-item { display: -ms-flexbox; display: flex; -webkit-box-align: center; -ms-flex-align: center; align-items: center; margin-right: 32px; margin-bottom: 15px; } .cky-category-direct-item:last-child { margin-right: 0; } .cky-category-direct-item .cky-switch { margin-left: 0; } .cky-category-direct-item .cky-category-direct-name { margin-left: 10px; font-size: 12px; font-weight: 600; } .cky-category-direct +.cky-detail-wrapper { margin-top: 10px; } .cky-table-wrapper { width: 100%; max-width: 100%; overflow: auto; } .cky-cookie-audit-table { font-family: inherit; border-collapse: collapse; width: 100%; margin-top: 10px; } .cky-cookie-audit-table th { background-color: #d9dfe7; border: 1px solid #cbced6; } .cky-cookie-audit-table td { border: 1px solid #d5d8df; } .cky-cookie-audit-table th, .cky-cookie-audit-table td { text-align: left; padding: 10px; font-size: 12px; color: #000000; word-break:normal; } .cky-cookie-audit-table tr:nth-child(2n+1) td { background: #f1f5fa; } .cky-cookie-audit-table tr:nth-child(2n) td { background: #ffffff; } .cky-audit-table-element h5 { margin: 25px 0 2px 0; } .cky-audit-table-element .cky-table-wrapper { margin-bottom: 1rem; } .cky-consent-bar.cky-rtl { direction: rtl; text-align: right; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn { margin-right: 0; margin-left: 15px; } .cky-consent-bar.cky-rtl .cky-button-wrapper .cky-btn:last-child { margin-left: 0; } .cky-consent-bar.cky-rtl .cky-btn-readMore { margin-left: 0; margin-right: 6px; } .cky-consent-bar.cky-rtl.cky-logo-active .cky-logo { margin-right: 0px; margin-left: 30px; } .cky-switch { position: relative; min-height: 13px; padding-left: 25px; font-size: 14px; margin-left: 20px; margin-bottom: 0; display: inline-block; } .cky-switch input[type='checkbox'] { display: none !important; } .cky-switch .cky-slider { background-color: #e3e1e8; border-radius: 34px; height: 13px; width: 25px; bottom: 0; cursor: pointer; left: 0; position: absolute; right: 0; transition: .4s; } .cky-switch .cky-slider:before { background-color: #fff; border-radius: 50%; bottom: 2px; content: ''; height: 9px; left: 2px; position: absolute; transition: .4s; width: 9px; } .cky-switch input:checked+.cky-slider { background-color: #008631; } .cky-switch input:disabled+.cky-slider { cursor: initial; } .cky-switch input:checked+.cky-slider:before { transform: translateX(12px); } .cky-modal.cky-fade .cky-modal-dialog { transition: -webkit-transform .3s ease-out; transition: transform .3s ease-out; transition: transform .3s ease-out, -webkit-transform .3s ease-out; -webkit-transform: translate(0, -25%); transform: translate(0, -25%); } .cky-modal.cky-show .cky-modal-dialog { -webkit-transform: translate(0, 0); transform: translate(0, 0); } .cky-modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 9998; background-color: rgba(10, 10, 10, 0.22); display: none; } .cky-modal-backdrop.cky-fade { opacity: 0; } .cky-modal-backdrop.cky-show { opacity: 1; display: block; } .cky-modal { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 99999; display: none; overflow: hidden; outline: 0; min-height: calc(100% - (.5rem * 2)); } .cky-modal.cky-show { display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; } .cky-modal a { text-decoration: none; } .cky-modal .cky-modal-dialog { position: relative; max-width: calc(100% - 16px); width: calc(100% - 16px); margin: .5rem; pointer-events: none; font-family: inherit; font-size: 1rem; font-weight: 400; line-height: 1.5; color: #212529; text-align: left; display: -ms-flexbox; display: flex; -ms-flex-align: center; align-items: center; box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); -webkit-box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.17); } @media (min-width: 576px) { .cky-modal .cky-modal-dialog { max-width: 500px; width: 500px; margin: 1.75rem auto; } .cky-modal { min-height: calc(100% - (1.75rem * 2)); } } @media (min-width: 991px) { .cky-modal .cky-modal-dialog { max-width: 900px; width: 900px; } } .cky-modal-content { display: -ms-flexbox; display: flex; -ms-flex-direction: column; flex-direction: column; width: 100%; pointer-events: auto; background-clip: padding-box; border: 0; border-radius: 4px; overflow: hidden; outline: 0; margin: 40px; } .cky-modal.cky-rtl { direction: rtl; text-align: right; } .ccpa.cky-modal .cky-modal-dialog { max-width: 300px; width: 300px; border-radius: 5px; } .ccpa.cky-modal .cky-modal-content { margin: 25px; text-align: center; font-weight: 600; } .ccpa.cky-modal .cky-opt-out-text { margin-bottom: 20px; } .cky-consent-bar.cky-classic { width: 100%; display: block; box-shadow: 0 -1px 10px 0 rgba(172, 171, 171, 0.3); } .cky-classic .cky-content-wrapper { display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; justify-content: space-between; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; } .cky-classic .cky-button-wrapper { margin-left: 20px; display: -webkit-box; display: -moz-box; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-box-align: center; -moz-box-align: center; -ms-flex-align: center; -webkit-align-items: center; align-items: center; flex-wrap: nowrap; } .cky-consent-bar.cky-classic p { text-align: left; } .cky-classic .cky-btn-settings { margin-left: auto; position: relative; padding-right: 1rem; } .cky-classic .cky-btn-settings:before { border-style: solid; border-width: 1px 1px 0 0; content: ''; display: inline-block; height: 4px; right: 8px; position: absolute; border-color: #beb8b8; top: 11px; transform: rotate(135deg); vertical-align: middle; width: 4px; } .cky-classic .cky-btn-settings[expanded]:before { transform: rotate(-45deg); } .cky-classic .cky-consent-bar.cky-rtl .cky-button-wrapper { margin-left: 0; margin-right: 20px; } .cky-classic .cky-consent-bar.cky-rtl p { text-align: right; } @media(min-width: 991px) { .cky-consent-bar.cky-classic { padding: 15px 50px; } } @media(min-width: 1150px) { .cky-consent-bar.cky-classic { padding: 15px 130px; } } @media(min-width: 1415px) { .cky-consent-bar.cky-classic { padding: 15px 160px; } } @media (max-width: 991px) { .cky-classic .cky-button-wrapper { margin-left: 0; margin-top: 20px; } .cky-consent-bar.cky-classic, .cky-consent-bar.cky-classic p, .cky-classic .cky-button-wrapper, .cky-classic .cky-content-wrapper { display: block; text-align: center; } } .cky-detail-wrapper { margin-top: 30px; border: 1px solid #d4d8df; border-radius: 2px; overflow: hidden; } .cky-tab-content { width: 100%; } .cky-tab-item { padding: .5rem 1rem; align-items: center; } .cky-tab-content .cky-tab-desc { min-height: 155px; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; } @media (max-width: 767px) { .cky-tab-content .cky-tab-desc { max-height: 155px; } } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-switch { margin-left: 0; margin-right: 20px; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item { border-right: none; border-left: 1px solid; } .cky-consent-bar.cky-rtl .cky-detail-wrapper .cky-tab-item.cky-tab-item-active { border-left: 0; }"
     },
     "tldomain":"www.abcde.com",
     "customCss":"",
     "geoTarget":{
        "gdpr":{
           "eu":false
        }
     },
     "selectedLaws":[
        "gdpr"
     ]
  },
  "info":{
     "categories":[
        {
           "id":23748,
           "slug":"necessary",
           "order":1,
           "name":{
              "en":"Necessary",
              "de":"Notwendige"
           },
           "defaultConsent":1,
           "active":1,
           "settings":{
              "ccpa":{
                 "doNotSell":false
              }
           },
           "type":1,
           "description":{
              "en":"<p>Necessary cookies are crucial for the basic functions of the website and the website will not work in its intended way without them.</p> <p>These cookies do not store any personally identifiable data.</p>",
              "de":"<p>Notwendige Cookies sind f\u00fcr die Grundfunktionen der Website von entscheidender Bedeutung. Ohne sie kann die Website nicht in der vorgesehenen Weise funktionieren.</p><p>Diese Cookies speichern keine personenbezogenen Daten.</p>"
           },
           "scripts":[
              {
                 "id":20443,
                 "name":{
                    "en":"Necessary",
                    "de":"Necessary",
                    "fr":"Necessary",
                    "it":"Necessary",
                    "es":"Necessary",
                    "nl":"Necessary",
                    "bg":"Necessary",
                    "ar":"Necessary"
                 },
                 "description":{
                    "en":"Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                    "de":"Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                    "fr":"Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                    "it":"Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                    "es":"Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                    "nl":"Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                    "bg":"Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.",
                    "ar":"Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously."
                 },
                 "cookie_ids":"__cfduid, PHPSESSID, JCS_INENTIM, JCS_INENREF, NCS_INENTIM, PHPSESSID, SJECT15, sID, DSID, session-id, csrftoken, sessionid, JSESSIONID, SLG_ROUNDEL_REF, cf_ob_info, cf_use_ob, twostep_auth, wordpress_test_cookie, woocommerce_cart_hash, woocommerce_items_in_cart, wp_woocommerce_session_, viewed_cookie_policy, AWSELB, hs, smSession, XSRF-TOKEN, pmpro_visit, o2switch-PowerBoost-Protect, pi_opt_in, _pxvid, f5_cspm, laravel_session",
                 "active":1,
                 "head_script":null,
                 "body_script":null
              }
           ],
           "cookies":[
              {
                 "id":51941,
                 "cookie_id":"cookieyesID",
                 "description":{
                    "en":"Unique identifier for  visitors used by CookieYes with respect to the consent",
                    "de":"Unique identifier for  visitors used by CookieYes with respect to the consent",
                    "fr":"Unique identifier for  visitors used by CookieYes with respect to the consent",
                    "it":"Unique identifier for  visitors used by CookieYes with respect to the consent",
                    "es":"Unique identifier for  visitors used by CookieYes with respect to the consent",
                    "nl":"Unique identifier for  visitors used by CookieYes with respect to the consent",
                    "bg":"Unique identifier for  visitors used by CookieYes with respect to the consent",
                    "ar":"Unique identifier for  visitors used by CookieYes with respect to the consent"
                 },
                 "duration":"1 year",
                 "type":"http",
                 "domain":".cloudwaysapps.com"
              },
              {
                 "id":51942,
                 "cookie_id":"cky-consent",
                 "description":{
                    "en":"The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                    "de":"The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                    "fr":"The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                    "it":"The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                    "es":"The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                    "nl":"The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                    "bg":"The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website.",
                    "ar":"The cookie is set by CookieYes to remember the user's consent to the use of cookies on the website."
                 },
                 "duration":"1 year",
                 "type":"http",
                 "domain":".cloudwaysapps.com"
              },
              {
                 "id":51943,
                 "cookie_id":"cookieyes-necessary",
                 "description":{
                    "en":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Necessary\" category.",
                    "de":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Necessary\" category.",
                    "fr":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Necessary\" category.",
                    "it":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Necessary\" category.",
                    "es":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Necessary\" category.",
                    "nl":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Necessary\" category.",
                    "bg":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Necessary\" category.",
                    "ar":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Necessary\" category."
                 },
                 "duration":"1 year",
                 "type":"http",
                 "domain":".cloudwaysapps.com"
              },
              {
                 "id":51944,
                 "cookie_id":"cookieyes-functional",
                 "description":{
                    "en":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Functional\" category.",
                    "de":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Functional\" category.",
                    "fr":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Functional\" category.",
                    "it":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Functional\" category.",
                    "es":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Functional\" category.",
                    "nl":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Functional\" category.",
                    "bg":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Functional\" category.",
                    "ar":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Functional\" category."
                 },
                 "duration":"1 year",
                 "type":"http",
                 "domain":".cloudwaysapps.com"
              },
              {
                 "id":51945,
                 "cookie_id":"cookieyes-analytics",
                 "description":{
                    "en":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Analytics\" category.",
                    "de":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Analytics\" category.",
                    "fr":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Analytics\" category.",
                    "it":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Analytics\" category.",
                    "es":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Analytics\" category.",
                    "nl":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Analytics\" category.",
                    "bg":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Analytics\" category.",
                    "ar":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Analytics\" category."
                 },
                 "duration":"1 year",
                 "type":"http",
                 "domain":".cloudwaysapps.com"
              },
              {
                 "id":51946,
                 "cookie_id":"cookieyes-performance",
                 "description":{
                    "en":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Performance\" category.",
                    "de":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Performance\" category.",
                    "fr":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Performance\" category.",
                    "it":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Performance\" category.",
                    "es":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Performance\" category.",
                    "nl":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Performance\" category.",
                    "bg":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Performance\" category.",
                    "ar":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Performance\" category."
                 },
                 "duration":"1 year",
                 "type":"http",
                 "domain":".cloudwaysapps.com"
              },
              {
                 "id":51947,
                 "cookie_id":"cookieyes-advertisement",
                 "description":{
                    "en":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Advertisement\" category.",
                    "de":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Advertisement\" category.",
                    "fr":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Advertisement\" category.",
                    "it":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Advertisement\" category.",
                    "es":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Advertisement\" category.",
                    "nl":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Advertisement\" category.",
                    "bg":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Advertisement\" category.",
                    "ar":"This cookie is set by CookieYes and is used to remember the consent of the users for the use of cookies in the \"Advertisement\" category."
                 },
                 "duration":"1 year",
                 "type":"http",
                 "domain":".cloudwaysapps.com"
              },
              {
                 "id":60802,
                 "cookie_id":"__cfduid",
                 "description":{
                    "en":"The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                    "de":"The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                    "fr":"The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                    "it":"The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                    "es":"The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                    "nl":"The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                    "bg":"The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information.",
                    "ar":"The cookie is used by cdn services like CloudFare to identify individual clients behind a shared IP address and apply security settings on a per-client basis. It does not correspond to any user ID in the web application and does not store any personally identifiable information."
                 },
                 "duration":"1 years  30 days",
                 "type":"https",
                 "domain":".cdn-cookieyes.com"
              },
              {
                 "id":82027,
                 "cookie_id":"cookielawinfo-checkbox-necessary",
                 "description":{
                    "en":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                    "de":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                    "fr":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                    "it":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                    "es":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                    "nl":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                    "bg":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''.",
                    "ar":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Necessary''."
                 },
                 "duration":"1 years  20 days  1 hours  16 minutes",
                 "type":"https",
                 "domain":"wordpress-178723-1219816.cloudwaysapps.com"
              },
              {
                 "id":82028,
                 "cookie_id":"cookielawinfo-checkbox-non-necessary",
                 "description":{
                    "en":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                    "de":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                    "fr":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                    "it":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                    "es":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                    "nl":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                    "bg":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''.",
                    "ar":"This cookie is set by GDPR Cookie Consent plugin. The cookies is used to store the user consent for the cookies in the category ''Non-necessary''."
                 },
                 "duration":"1 years  20 days  1 hours  16 minutes",
                 "type":"https",
                 "domain":"wordpress-178723-1219816.cloudwaysapps.com"
              },
              {
                 "id":88152,
                 "cookie_id":"wordpress_test_cookie",
                 "description":{
                    "en":"This cookie is used to check if the cookies are enabled on the users' browser.",
                    "de":"This cookie is used to check if the cookies are enabled on the users' browser.",
                    "fr":"This cookie is used to check if the cookies are enabled on the users' browser.",
                    "it":"This cookie is used to check if the cookies are enabled on the users' browser.",
                    "es":"This cookie is used to check if the cookies are enabled on the users' browser.",
                    "nl":"This cookie is used to check if the cookies are enabled on the users' browser.",
                    "bg":"This cookie is used to check if the cookies are enabled on the users' browser.",
                    "ar":"This cookie is used to check if the cookies are enabled on the users' browser."
                 },
                 "duration":"session",
                 "type":"https",
                 "domain":"wordpress-178723-1219816.cloudwaysapps.com"
              }
           ]
        },
        {
           "id":23749,
           "slug":"functional",
           "order":2,
           "name":{
              "en":"Functional",
              "de":"Funktionale"
           },
           "defaultConsent":0,
           "active":1,
           "settings":{
              "ccpa":{
                 "doNotSell":false
              }
           },
           "type":2,
           "description":{
              "en":"<p>Functional cookies help to perform certain functionalities like sharing the content of the website on social media platforms, collect feedbacks, and other third-party features.</p>",
              "de":"<p>Funktionale Cookies unterst\u00fctzen bei der Ausf\u00fchrung bestimmter Funktionen, z. B. beim Teilen des Inhalts der Website auf Social Media-Plattformen, beim Sammeln von Feedbacks und anderen Funktionen von Drittanbietern.</p>"
           },
           "cookies":[
              {
                 "id":80739,
                 "cookie_id":"1",
                 "description":{
                    "en":"this is analytics cookie",
                    "es":"this is analytics cookie"
                 },
                 "duration":"1",
                 "type":"http",
                 "domain":"https://wordpress-178723-1219816.cloudwaysapps.com/"
              }
           ]
        },
        {
           "id":23750,
           "slug":"analytics",
           "order":3,
           "name":{
              "en":"Analytics",
              "de":"Analyse"
           },
           "defaultConsent":0,
           "active":1,
           "settings":{
              "ccpa":{
                 "doNotSell":false
              },
              "loadAnalyticsByDefault":true
           },
           "type":2,
           "description":{
              "en":"<p>Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics the number of visitors, bounce rate, traffic source, etc.</p>",
              "de":"<p>Analyse-Cookies werden verwendet um zu verstehen, wie Besucher mit der Website interagieren. Diese Cookies dienen zu Aussagen \u00fcber die Anzahl der Besucher, Absprungrate, Herkunft der Besucher usw.</p>"
           }
        },
        {
           "id":23751,
           "slug":"performance",
           "order":4,
           "name":{
              "en":"Performance",
              "de":"Leistungs"
           },
           "defaultConsent":0,
           "active":1,
           "settings":{
              "ccpa":{
                 "doNotSell":false
              }
           },
           "type":2,
           "description":{
              "en":"<p>Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.</p>",
              "de":"<p>Leistungs-Cookies werden verwendet, um die wichtigsten Leistungsindizes der Website zu verstehen und zu analysieren. Dies tr\u00e4gt dazu bei, den Besuchern ein besseres Nutzererlebnis zu bieten.</p>"
           }
        },
        {
           "id":23752,
           "slug":"advertisement",
           "order":5,
           "name":{
              "en":"Advertisement",
              "de":"Werbe"
           },
           "defaultConsent":0,
           "active":1,
           "settings":{
              "ccpa":{
                 "doNotSell":false
              }
           },
           "type":2,
           "description":{
              "en":"<p>Advertisement cookies are used to deliver visitors with customized advertisements based on the pages they visited before and analyze the effectiveness of the ad campaign.</p>",
              "de":"<p>Werbe-Cookies werden verwendet, um Besuchern auf der Grundlage der von ihnen zuvor besuchten Seiten ma\u00dfgeschneiderte Werbung zu liefern und die Wirksamkeit von Werbekampagne nzu analysieren.</p>"
           }
        },
        {
           "id":51395,
           "slug":"other",
           "order":6,
           "name":{
              "en":"Other",
              "de":"Other"
           },
           "defaultConsent":0,
           "active":1,
           "settings":{
              "ccpa":{
                 "doNotSell":false
              }
           },
           "type":2,
           "description":{
              "en":"No description",
              "de":"No description"
           },
           "cookies":[
              {
                 "id":60803,
                 "cookie_id":"prism_800008741",
                 "description":{
                    "en":"No description",
                    "de":"No description",
                    "fr":"No description",
                    "it":"No description",
                    "es":"No description",
                    "nl":"No description",
                    "bg":"No description",
                    "ar":"No description"
                 },
                 "duration":"1 years  30 days",
                 "type":"http",
                 "domain":""
              },
              {
                 "id":88148,
                 "cookie_id":"cky-active-check",
                 "description":{
                    "en":"No description",
                    "de":"No description",
                    "fr":"No description",
                    "it":"No description",
                    "es":"No description",
                    "nl":"No description",
                    "bg":"No description",
                    "ar":"No description"
                 },
                 "duration":"23 hours 59 minutes",
                 "type":"http",
                 "domain":"wordpress-178723-1219816.cloudwaysapps.com"
              },
              {
                 "id":88149,
                 "cookie_id":"_hjTLDTest",
                 "description":{
                    "en":"No description",
                    "de":"No description",
                    "fr":"No description",
                    "it":"No description",
                    "es":"No description",
                    "nl":"No description",
                    "bg":"No description",
                    "ar":"No description"
                 },
                 "duration":"session",
                 "type":"http",
                 "domain":".cloudwaysapps.com"
              },
              {
                 "id":88150,
                 "cookie_id":"_hjid",
                 "description":{
                    "en":"This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                    "de":"This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                    "fr":"This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                    "it":"This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                    "es":"This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                    "nl":"This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                    "bg":"This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID.",
                    "ar":"This cookie is set by Hotjar. This cookie is set when the customer first lands on a page with the Hotjar script. It is used to persist the random user ID, unique to that site on the browser. This ensures that behavior in subsequent visits to the same site will be attributed to the same user ID."
                 },
                 "duration":"11 months 29 days 23 hours 59 minutes",
                 "type":"https",
                 "domain":".cloudwaysapps.com"
              },
              {
                 "id":88151,
                 "cookie_id":"_hjFirstSeen",
                 "description":{
                    "en":"No description",
                    "de":"No description",
                    "fr":"No description",
                    "it":"No description",
                    "es":"No description",
                    "nl":"No description",
                    "bg":"No description",
                    "ar":"No description"
                 },
                 "duration":"29 minutes",
                 "type":"http",
                 "domain":".cloudwaysapps.com"
              }
           ]
        }
     ],
     "privacyPolicy":{
        "title":{
           "en":"Privacy Policy",
           "de":"Datenschutz-Bestimmungen"
        },
        "text":{
           "en":"<p>This website uses cookies to improve your experience while you navigate through the website. Out of these cookies, the cookies that are categorized as necessary are stored on your browser as they as essential for the working of basic functionalities of the website. </p><p>We also use third-party cookies that help us analyze and understand how you use this website, to store user preferences and provide them with content and advertisements that are relevant to you. These cookies will only be stored on your browser with your consent to do so. You also have the option to opt-out of these cookies.But opting out of some of these cookies may have an effect on your browsing experience.</p>",
           "de":"<p>Diese Website verwendet Cookies, um Ihre Erfahrung zu verbessern, w\u00e4hrend Sie durch die Website navigieren. Von diesen Cookies werden die nach Bedarf kategorisierten Cookies in Ihrem Browser gespeichert, da sie f\u00fcr das Funktionieren der Grundfunktionen der Website von wesentlicher Bedeutung sind.</p><p>Wir verwenden auch Cookies von Drittanbietern, mit denen wir analysieren und nachvollziehen k\u00f6nnen, wie Sie diese Website nutzen, um Benutzereinstellungen zu speichern und ihnen f\u00fcr Sie relevante Inhalte und Anzeigen bereitzustellen.</p><p>Diese Cookies werden nur mit Ihrer Zustimmung in Ihrem Browser gespeichert. Sie haben auch die M\u00f6glichkeit, diese Cookies zu deaktivieren. Das Deaktivieren einiger dieser Cookies kann sich jedoch auf Ihr Surferlebnis auswirken.</p>"
        }
     }
  }
}

const positionValue = {
  "bottom":{
     "top":"auto",
     "right":"0",
     "bottom":"0",
     "left":"auto"
  },
  "top":{
     "top":"0",
     "right":"0",
     "bottom":"auto",
     "left":"auto"
  },
  "bottom-left":{
     "top":"auto",
     "right":"auto",
     "bottom":"20px",
     "left":"20px"
  },
  "bottom-right":{
     "top":"auto",
     "right":"20px",
     "bottom":"20px",
     "left":"auto"
  },
  "top-left":{
     "top":"20px",
     "right":"auto",
     "bottom":"auto",
     "left":"20px"
  },
  "top-right":{
     "top":"20px",
     "right":"20px",
     "bottom":"auto",
     "left":"auto"
  }
}

const ckyActiveLaw = cliConfig.options.selectedLaws[0];

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

const cookieExpiry = cliConfig.options.cookieExpiry === undefined ? 365 : cliConfig.options.cookieExpiry;

_ckyBannerActiveCheck();

// PART - 2

// **** DONE FUNCTONS ***** //
function _ckyRenderBanner() {
  _ckyCreateBanner();
  if (selectedLanguage == "ar")
document.getElementById("cky-consent").classList.add("cky-rtl");
    _ckyRenderStickyDetail();
}

function _ckyCreateBanner() {
  const consentBar = `<div class="cky-consent-bar cky-classic cky-logo-active" id="cky-consent"><div class="cky-content-logo-outer-wrapper" id="cky-content-logo">${_ckyAppendLogo()}<divs id="cky-content-logo-inner-wrapper">${_ckyAppendTitle()}<div class="cky-content-wrapper">${_ckyAppendText()}<div class="cky-button-wrapper">${_ckyRenderButtons(['settings', 'reject', 'accept'])}</div></div></div></div></div>`;
  document.body.insertAdjacentHTML("beforeend", consentBar);
  // MOVE TO CSS
  const ckyConsentBar = document.getElementById("cky-consent");
  ckyConsentBar.style.display = "block";
  ckyConsentBar.style.background = cliConfig.options.colors[ckyActiveLaw].notice.bg;
  ckyConsentBar.style.color = cliConfig.options.colors[ckyActiveLaw].notice.textColor;
  ckyConsentBar.style.borderWidth = "1px";
  ckyConsentBar.style.borderStyle = "solid";
  ckyConsentBar.style.borderColor = cliConfig.options.colors[ckyActiveLaw].notice.borderColor;
  ckyConsentBar.style.top = positionValue["bottom"].top;
  ckyConsentBar.style.right = positionValue["bottom"].right;
  ckyConsentBar.style.bottom = positionValue["bottom"].bottom;
  ckyConsentBar.style.left = positionValue["bottom"].left;
  if (
    cliConfig.options.geoTarget["gdpr"].eu &&
    _ckyGetCookie("cky-action") !== "yes"
  )
    document.getElementById("cky-consent").style.display = "none";
}

function _ckyAppendLogo() {
  const consentLogo = `<img src="${cliConfig.options.content[ckyActiveLaw].customLogoUrl}" class="img-fluid cky-logo" style="width: 100px" alt="Brand logo">`;
  return consentLogo
}

function _ckyAppendTitle() {
  const consentTitle = `<div class="cky-consent-title" style="color:${cliConfig.options.colors[ckyActiveLaw].notice.titleColor}">${cliConfig.options.content[ckyActiveLaw].title[selectedLanguage]}</div>`;
  return consentTitle
}

function _ckyAppendText() {
  const consentText = `<p class="cky-bar-text" style="color:${cliConfig.options.colors[ckyActiveLaw].notice.textColor}">${cliConfig.options.content[ckyActiveLaw].text[selectedLanguage]}</p>`;
  return consentText
}

function _ckyCreateSwitches(category) {
  const cookieStatus = _ckyGetCookie(`cookieyes-${category.slug}`);
  let ckySwitchStatus =
    cookieStatus === "yes" || (!cookieStatus && category.defaultConsent)
      ? "checked"
      : "";
  return `<label class="cky-switch" ${category.type === 1 ? 'disabled': ''} for="cky-checkbox-category${category.name[selectedLanguage]}" onclick="event.stopPropagation();"><input type="checkbox" id="cky-checkbox-category${category.name[selectedLanguage]}" ${ckySwitchStatus}/><div class="cky-slider"></div></label>`;
}

function ckyBannerActions(btnName) {
  switch (btnName) {
    case "accept":
      return _ckyAcceptCookies();
    case "reject":
      return _ckyRejectCookies();
    case "settings":
      return  _ckyShowHideStickyDetail();
    default:
      return () => {}
  }
};

function _ckyRenderButtons(btnList) {
  let btnHtml = ''
  for (const btnName of btnList) {
    const button = `<button onclick = "ckyBannerActions('${btnName}')" style = color:${cliConfig.options.colors[ckyActiveLaw].buttons[btnName].textColor};background-color:${cliConfig.options.colors[ckyActiveLaw].buttons[btnName].bg};border-color:${cliConfig.options.colors[ckyActiveLaw].buttons[btnName].borderColor}; class="cky-btn cky-btn-${btnName}" id="cky-btn-${btnName}">${cliConfig.options.content[ckyActiveLaw].buttons[btnName][selectedLanguage]}</button>`;
    btnHtml += button
  }
  return btnHtml
}

const tabCss = `color:${cliConfig.options.colors[ckyActiveLaw].popup.pills.textColor};border-color:${cliConfig.options.colors[ckyActiveLaw].notice.borderColor}`;
const activeTabCss = `background-color:${cliConfig.options.colors[ckyActiveLaw].popup.pills.activeBg};color:${cliConfig.options.colors[ckyActiveLaw].popup.pills.activeTextColor};border-color:${cliConfig.options.colors[ckyActiveLaw].notice.borderColor};`;

function _ckyRenderStickyDetail() {
  const { ckyTabItem, ckyTabContentHtml  } = _ckyCreateTabDetails();
  const ckyDetailWrapper = `<div class="cky-detail-wrapper" id="cky-detail-wrapper" style="display: none;border-color:${cliConfig.options.colors[ckyActiveLaw].notice.borderColor}"><div class="cky-tab"><div class="cky-tab-menu" id="cky-tab-menu" style="background-color:${cliConfig.options.colors[ckyActiveLaw].popup.pills.bg}">${ckyTabItem}${_ckyCreateCustomAcceptButton()}</div><div class="cky-tab-content" id="cky-tab-content" style="background-color:${cliConfig.options.colors[ckyActiveLaw].notice.bg}">${ckyTabContentHtml}</div></div>${_ckyAppendPoweredByLogo()}</div>`;
  document
    .getElementById("cky-consent")
    .insertAdjacentHTML("beforeend", ckyDetailWrapper);
}

function _ckyCreateTabDetails() {
  let ckyTab =  {
    ckyTabItem: '',
    ckyTabContentHtml: ''
  };
  _ckyRenderStickyTabAndAddClick(ckyTab);
  for (const category of  cliConfig.info.categories) _ckyRenderStickyTabAndAddClick(ckyTab, category);
  return ckyTab;
}

function _ckyCreateCustomAcceptButton() {
  return `<button onclick =  "_ckyAcceptCookies('customAccept')" class="cky-btn cky-btn-custom-accept"style = "color: ${cliConfig.options.colors[ckyActiveLaw].popup.acceptCustomButton.textColor};background-color: ${cliConfig.options.colors[ckyActiveLaw].popup.acceptCustomButton.bg};border-color: ${cliConfig.options.colors[ckyActiveLaw].popup.acceptCustomButton.borderColor};"id="cky-btn-custom-accept">${cliConfig.options.content[ckyActiveLaw].customAcceptButton[selectedLanguage]}</button>`;
}

function _ckyAppendPoweredByLogo() {
  return '<div style="background: #d9dfe7;padding: 6px 32px;font-size: 8px;color: #111111;font-weight: normal;text-align: right;">Powered by <a target="_blank" href="https://www.cookieyes.com/#utm_source=website&utm_medium=banner&utm_campaign=poweredby&utm_term=main&utm_content=CTA" style="font-weight: bold;color: #040404;font-size: 9px;">CookieYes</a></div>';
}

function _ckyRenderStickyTabAndAddClick(ckyTab, category) {
  const isPrivacy = !category;
  const tabId = `cky-tab-item-${
    isPrivacy ? "privacy" : category.name[selectedLanguage]
  }`
  const ckyTabItem = `<div onclick = "_ckyTabOnClick('${tabId}')" class="cky-tab-item${
    isPrivacy ? " cky-tab-item-active" : ""
  }" id="cky-tab-item-${
    isPrivacy ? "privacy" : category.name[selectedLanguage]
  }" tab-target="cky-tab-content-${
    isPrivacy ? "privacy" : category.name[selectedLanguage]
  }" style="${isPrivacy ? activeTabCss : tabCss}">${
    isPrivacy ? cliConfig.info.privacyPolicy.title[selectedLanguage] : category.name[selectedLanguage]
  }</div>`;
  const ckyTabContentItem = `<div class="cky-tab-content-item${
    isPrivacy ? " cky-tab-content-active" : ""
  }" id="cky-tab-content-${
    isPrivacy ? "privacy" : category.name[selectedLanguage]
  }"><div class="cky-tab-title" id="cky-tab-title-${
    isPrivacy ? "privacy" : category.name[selectedLanguage]
  }" style="color:${cliConfig.options.colors[ckyActiveLaw].notice.textColor}">${
    isPrivacy
      ? cliConfig.info.privacyPolicy.title[selectedLanguage]
      : category.name[selectedLanguage]
  }${!isPrivacy ? _ckyCreateSwitches(category) : ''}</div><div class="cky-tab-desc" style="color:${
    cliConfig.options.colors[ckyActiveLaw].notice.textColor
  }">${
    isPrivacy
      ? cliConfig.info.privacyPolicy.text[selectedLanguage]
      : category.description[selectedLanguage]
  }${!isPrivacy && _ckyRenderAuditTable(true, category)}</div></div>`;
  ckyTab.ckyTabItem += ckyTabItem;
  ckyTab.ckyTabContentHtml += ckyTabContentItem;
}

function _ckyTabOnClick(_tabId) {
    const ckyTab = document.getElementById(_tabId);
    const currentActiveTab = document.getElementsByClassName(
      "cky-tab-item-active"
    )[0];
    currentActiveTab.classList.remove("cky-tab-item-active");
    currentActiveTab.setAttribute("style", tabCss);
    ckyTab.classList.add("cky-tab-item-active");
    ckyTab.setAttribute("style", activeTabCss);
    document
      .querySelector("#cky-consent .cky-tab-content-active")
      .classList.remove("cky-tab-content-active");
    const tabId = ckyTab.getAttribute("tab-target");
    document.getElementById(tabId).className = `${
      document.getElementById(tabId).className
    } cky-tab-content-active`;
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
    cliConfig.options.content[ckyActiveLaw].auditTable.cookie[selectedLanguage]
  }</th><th>${
    cliConfig.options.content[ckyActiveLaw].auditTable.type[selectedLanguage]
  }</th><th>${
    cliConfig.options.content[ckyActiveLaw].auditTable.duration[selectedLanguage]
  }</th><th>${
    cliConfig.options.content[ckyActiveLaw].auditTable.description[selectedLanguage]
  }</th></tr></thead><tbody></tbody></table></div>`;
  if (inBanner)
   return auditTable
  else {
    // ASK LINSA
    const auditTableCategoryName = `<h5>${category.name[selectedLanguage]}</h5>`;
    const auditTableElements = document.getElementsByClassName(
      "cky-audit-table-element"
    );
    for (const auditTableElement of auditTableElements) {
      auditTableElement.insertAdjacentHTML("beforeend", auditTableCategoryName);
      auditTableElement.insertAdjacentHTML("beforeend", auditTable);
    }
  }
  if(category.cookies) {
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
}

function _ckyAcceptCookies(choice = "all") {
  _ckyUpdateCookies(choice);
  window.addEventListener("beforeunload", _ckyLogCookies);
  _ckySetCookie("cky-action", "yes", cookieExpiry);
  location.reload();
}

function _ckyUpdateCookies(choice) {
  _ckySetCookie("cky-consent", "yes", cookieExpiry);
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
      cookieExpiry
    );
  }
}

function _ckyRejectCookies() {
  _ckySetCookie("cky-action", "yes", cookieExpiry);
  _ckySetCookie("cky-consent", "no", cookieExpiry);
  _ckyRejectAllCookies();
  window.addEventListener("beforeunload", _ckyLogCookies);
  location.reload();
}

function _ckyRejectAllCookies() {
  for (const category of info.categories)
    _ckySetCookie(
      `cookieyes-${category.slug}`,
      category.type !== 1 ? "no" : "yes",
      cookieExpiry
    );
}

function _ckySetInitialCookies() {
  _ckySetCookie("cky-consent", "yes", cookieExpiry);
  // CHECk CODE
  for (const category of cliConfig.info.categories)
    _ckySetCookie(
      `cookieyes-${category.slug}`,
      category.type !== 1 && !category.defaultConsent ? "no" : "yes",
      cookieExpiry
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
  "en",
  ckyActiveLaw
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
  style.appendChild(document.createTextNode(`${cliConfig.options.template.css}${cliConfig.options.customCss}`));
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

function _ckyMutationObserver(mutations) {
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (
        !node.src ||
        ((node.nodeType !== 1 || node.tagName !== "SCRIPT") &&
          node.tagName !== "IFRAME")
      )
        continue;
      if (_ckyIsOnBlacklist(node.src)) {
        if (node.tagName === "IFRAME") _ckyAddPlaceholder(node);
        node.type = "javascript/blocked";
        node.remove();
        backupRemovedScripts.blacklisted.push(node.cloneNode());
        node.addEventListener(
          "beforescriptexecute",
          _ckyScriptExecutionListener(node)
        );
      }
      const scriptCategory = node.getAttribute("data-cookieyes");
      if (
        !scriptCategory ||
        (scriptCategory && _ckyGetCookie(scriptCategory) === "yes")
      )
        continue;
      const webdetail = new URL(node.src);
      patterns.blacklist.push(new RegExp(webdetail.hostname));
      const categoryScript = categoryScripts.find(
        (category) => `cookieyes-${category.name}` === scriptCategory
      );
      categoryScript.list.push(new RegExp(webdetail.hostname));
    }
  }
}
function _ckyScriptExecutionListener(node) {
  return (e) => {
    e.preventDefault();
    node.removeEventListener("beforescriptexecute", beforeScriptExecute);
  };
}
function _ckyAddPlaceholder(htmlElm) {
  if (htmlElm.tagName === "IMG") return;
  const htmlElemWidth = htmlElm.getAttribute("width") || htmlElm.offsetWidth;
  const htmlElemHeight = htmlElm.getAttribute("height") || htmlElm.offsetHeight;
  if (htmlElemHeight === 0 || htmlElemWidth === 0) return;
  let placeholder = `<div data-src="${htmlElm.src}" style="background-image: url('https://cdn-cookieyes.com/assets/images/cky-placeholder.svg');background-size: 80px;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: flex-end;justify-content: center; width:${htmlElemWidth}px; height:${htmlElemHeight} px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;">${cliConfig.options.content[ckyActiveLaw].placeHolderText[selectedLanguage]}</div></div>`;
  const youtubeID = _ckyGetYoutubeID(htmlElm.src);
  if (htmlElm.src && youtubeID)
    placeholder = `<div data-src="${htmlElm.src}" style="background-image: linear-gradient(rgba(255,255,255,.2), rgba(255,255,255,.2)), url('https://img.youtube.com/vi/${youtubeID}/maxresdefault.jpg');background-size: 100% 100%;background-position: center;background-repeat: no-repeat;background-color: #b2b0b059;position: relative;display: flex;align-items: center;justify-content: center; width:${htmlElemWidth}px; height:${htmlElemHeight}px;max-width:100%;" class="wt-cli-iframe-placeholder"><div class="wt-cli-inner-text" style="text-align:center;display: flex; align-items: center; padding:10px 16px; background-color: rgba(0, 0, 0, 0.8); color: #FFFFFF;">${cliConfig.options.content[ckyActiveLaw].placeHolderText[selectedLanguage]}</div></div>`;
  placeholder.width = htmlElemWidth;
  placeholder.height = htmlElemHeight;
  htmlElm.insertAdjacentHTML("beforebegin", placeholder);
}
function _ckyGetYoutubeID(src) {
  const match = src.match(
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
  );
  if (match && Array.isArray(match) && match[2] && match[2].length === 11)
    return match[2];
  return false;
}
function _ckyIsOnBlacklist(src) {
  return src && patterns.blacklist.some((pattern) => pattern.test(src));
}
function _ckyIsOnWhitelist(src) {
  return src && patterns.whitelist.some((pattern) => pattern.test(src));
}
function _ckyUnblock() {
  if (navigator.doNotTrack === 1) return;
  const ckyconsent = _ckyGetCookie("cky-consent") || "no";
  if (ckyconsent === "yes") {
    for (const { name, list } of categoryScripts)
      if (_ckyGetCookie(`cookieyes-${name}`) === "yes")
        patterns.whitelist.push(...list);
  }
  observer.disconnect();
  backupRemovedScripts.blacklisted = backupRemovedScripts.blacklisted.filter(
    (script, index) => {
      if (!script.src || !_ckyIsOnWhitelist(script.src)) return true;
      if (script.type === "javascript/blocked") {
        script.type = "text/javascript";
        const scriptNode = document.createElement("script");
        scriptNode.src = script.src;
        scriptNode.type = "text/javascript";
        document.head.appendChild(scriptNode);
      } else {
        const frames = document.getElementsByClassName(
          "wt-cli-iframe-placeholder"
        );
        for (const frame of frames) {
          if (script.src !== frame.getAttribute("data-src")) continue;
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
      return false;
    }
  );
  document.createElement = createElementBackup;
}
function _ckyAddToBlackList() {
  if (navigator.doNotTrack === 1)
    return patterns.blacklist.push(...categoryScripts.map(({ list }) => list));
  for (const { name, list } of categoryScripts) {
    if (name === "analytics" && loadAnalyticsByDefault) continue;
    if (ckyconsent !== "yes" || _ckyGetCookie(`cookieyes-${name}`) !== "yes")
      patterns.blacklist.push(...list);
  }
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
const patterns = {
  blacklist: [],
  whitelist: [],
};
const ckyconsent = _ckyGetCookie("cky-consent") || "no";
const createElementBackup = document.createElement;
document.createElement = function (...args) {
  const newCreatedElement = createElementBackup.call(document, ...args);
  if (args[0].toLowerCase() !== "script") return newCreatedElement;
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
          originalSetAttribute("type", "javascript/blocked");
        originalSetAttribute("src", value);
        return true;
      },
    },
    type: {
      set: function (value) {
        const typeValue = _ckyIsOnBlacklist(newCreatedElement.src)
          ? "javascript/blocked"
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
_ckyAddToBlackList();
const observer = new MutationObserver(_ckyMutationObserver);
observer.observe(document.documentElement, { childList: true, subtree: true });