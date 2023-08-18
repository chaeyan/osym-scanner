const https = require("node:https");
const crypto = require("node:crypto");
const axios = require("axios");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const start = 9680;
const end = 9999;

// ösym'nin cert bi garip olduğu için böyle bir yönteme başvurmak zorunda kalındı
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const allowLegacyRenegotiationforNodeJsOptions = {
    httpsAgent: new https.Agent({
      secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    }),
};

async function fetchURL(url) {
    try {
        const res = await axios({
            ...allowLegacyRenegotiationforNodeJsOptions,
            method: "get",
            url
        });
        return { statusCode: res.status, html: res.data };
    }
    catch(err) {
        return;
    }
}

async function checkSonucIDs(start, end) {
    const baseURL = 'https://sonuc.osym.gov.tr/Sorgu.aspx?SonucID=';

    for (let sonucID = start; sonucID <= end; sonucID++) {
        const url = baseURL + sonucID;
        const response = await fetchURL(url);

        if (response && response.statusCode === 200) {
            const html = response.html;
            const dom = new JSDOM(html);

            // öyle bi sayfa yoksa site 404 bile vermiyor, title'dan anlayabiliyoruz.
            const title = dom.window.document.querySelector("title").textContent;
            if (title.includes("Hata")) continue;

            // "ad" class = sonuç ismi
            const ad = dom.window.document.getElementsByClassName("ad")[0].textContent;
            console.log(`ALIVE: ${sonucID}: ${ad}`);
        };
    };
};

checkSonucIDs(start, end);
