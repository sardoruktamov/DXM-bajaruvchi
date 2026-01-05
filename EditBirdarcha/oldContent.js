function getX(path) {
    try {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } catch (e) { return null; }
}

async function fillBirdarcha() {
    chrome.storage.local.get("egovData", async (result) => {
        if (!result || !result.egovData) return;
        const data = result.egovData;
        console.log("To'ldirish boshlandi. Ma'lumotlar:", data);

        // 1. TELEFON KODLARI LUG'ATI (Siz bergan XPathlar)
        const codeXPathMap = {
            "20": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[2]/div",
            "33": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[3]/div",
            "50": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[4]/div",
            "55": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[5]/div",
            "70": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[6]/div",
            "77": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[7]/div",
            "87": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[8]/div",
            "88": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[3]/div",
            "90": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[7]/div",
            "91": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[8]/div",
            "93": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[9]/div",
            "94": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[4]/div",
            "95": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[5]/div",
            "97": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[6]/div",
            "98": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[7]/div",
            "99": "/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[8]/div"
        };

        // --- 1-QADAM: TELEFON KODINI TANLASH (SCROLL BILAN) ---
        const phoneSelector = document.querySelector('.Phone_select .ant-select-selector');
        if (phoneSelector && data.phone_code) {
            console.log("Telefon menyusi ochilmoqda...");
            phoneSelector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

            // Ro'yxat paydo bo'lishini kutamiz
            await new Promise(r => setTimeout(r, 1000));

            // Ant Design'ning scroll bo'ladigan ichki konteynerini topamiz
            const scrollContainer = document.querySelector('.ant-select-dropdown :not(.ant-select-dropdown-hidden) .rc-virtual-list-holder');

            if (scrollContainer) {
                console.log("Scroll pastga tushirilmoqda...");
                // Konteynerni eng pastga tushiramiz (barcha kodlar yuklanishi uchun)
                scrollContainer.scrollTop = scrollContainer.scrollHeight;

                // Scroll amalga oshishi va elementlar chizilishi uchun biroz kutamiz
                await new Promise(r => setTimeout(r, 1000));
            }

            // Endi barcha variantlarni qidiramiz
            const allOptions = document.querySelectorAll('.ant-select-item-option-content');
            let found = false;

            for (let opt of allOptions) {
                if (opt.innerText.trim() === data.phone_code) {
                    console.log("Kod topildi: " + data.phone_code);
                    // Elementni ko'rinadigan sohaga keltiramiz (xavfsizlik uchun)
                    opt.scrollIntoView({ block: 'nearest' });

                    // Ant Design uchun eng ishonchli bosish usuli
                    const parent = opt.closest('.ant-select-item-option');
                    if (parent) {
                        parent.click();
                    } else {
                        opt.click();
                    }

                    found = true;
                    break;
                }
            }

            if (found) {
                // --- 2-QADAM: 7 TALIK RAQAMNI YOZISH ---
                await new Promise(r => setTimeout(r, 800));
                const maskField = document.getElementById('mask-field');
                if (maskField && data.phone_main) {
                    maskField.focus();
                    maskField.value = data.phone_main;
                    maskField.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log("Raqam yozildi.");
                }
            } else {
                console.error("XATO: " + data.phone_code + " kodi ro'yxatda topilmadi.");
            }
        }

        // --- 3-QADAM: HUJJAT TURINI TANLASH ---
        await new Promise(r => setTimeout(r, 1200));
        const selectors = document.querySelectorAll('.ant-select-selector');
        if (selectors[0]) {
            selectors[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await new Promise(r => setTimeout(r, 1000));

            const docOption = getX("//div[contains(@class, 'ant-select-item-option')]//div[contains(text(), 'pasporti/ID-karta')]");
            if (docOption) docOption.click();

            await new Promise(r => setTimeout(r, 1500));
        }

        // --- 4-QADAM: PASPORT VA JSHSHIR ---
        const docInput = document.getElementById('documentNumber');
        const pinInput = document.getElementById('pin');

        if (docInput && data.passport) {
            docInput.value = data.passport.replace(/\s/g, '');
            docInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log("Pasport yozildi.");
        }

        if (pinInput && data.jshshir) {
            let cleanPin = data.jshshir.toString().replace(/\D/g, '');
            pinInput.value = cleanPin;
            pinInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log("JSHSHIR yozildi.");
        }

        chrome.storage.local.remove("egovData");
        console.log("Jarayon muvaffaqiyatli yakunlandi.");
    });
}

// A va B saytlari uchun injeksiya
if (location.host.includes("my.gov.uz")) {
    setInterval(injectBridgeButton, 1000);
} else if (location.href.includes("registration")) {
    setTimeout(fillBirdarcha, 3000);
}

function injectBridgeButton() {
    if (document.getElementById('bridgeBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'bridgeBtn';
    btn.innerHTML = '📂 Saqlash va Birdarchaga o‘tish';
    btn.style = "position:fixed; top:20px; right:20px; z-index:10000; padding:12px 20px; background:#007bff; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3);";

    btn.onclick = function() {
        let store = {};
        let jElement = getX('//*[@id="__nuxt"]/div/div[2]/div/div/div/div/div[1]/div[2]/section/div[2]/div[2]/div[1]/div[2]/table/tbody/tr[1]/td[2]');
        store.jshshir = jElement?.innerText.trim();

        let pElement = getX('//*[@id="__nuxt"]//tr[contains(., "pasport")]/td[2]') || getX('//*[@id="__nuxt"]//tr[4]/td[2]');
        store.passport = pElement?.innerText.trim();

        let phElement = getX('//*[@id="__nuxt"]//tr[contains(., "Telefon")]/td[2]') || getX('//*[@id="__nuxt"]//tr[3]/td[2]/div');
        let rawPhone = phElement?.innerText.trim();

        if (rawPhone) {
            let digits = rawPhone.replace(/\D/g, '');
            let phone9 = digits.length >= 9 ? digits.slice(-9) : digits;
            store.phone_code = phone9.substring(0, 2);
            store.phone_main = phone9.substring(2);
        }

        chrome.storage.local.set({ "egovData": store }, () => {
            chrome.runtime.sendMessage({ action: "open_birdarcha" });
        });
    };
    document.body.appendChild(btn);
}