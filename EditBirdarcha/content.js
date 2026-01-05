// --- YORDAMCHI FUNKSIYA ---
function getX(path) {
    try {
        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } catch (e) { return null; }
}

// ==========================================
// 1. MA'LUMOT YIG'ISH (my.gov.uz - A SAYTI)
// ==========================================
function injectBridgeButton() {
    if (document.getElementById('bridgeBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'bridgeBtn';
    btn.innerHTML = '📂 Saqlash va Birdarchaga o‘tish';
    btn.style = "position:fixed; top:20px; right:20px; z-index:10000; padding:12px 20px; background:#007bff; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: 0.3s;";

    btn.onmouseover = () => btn.style.background = "#0056b3";
    btn.onmouseout = () => btn.style.background = "#007bff";

    btn.onclick = function() {
        let store = {};

        // JSHSHIRni olish (Aniq XPath manzilingiz)
        let jElement = getX('//*[@id="__nuxt"]/div/div[2]/div/div/div/div/div[1]/div[2]/section/div[2]/div[2]/div[1]/div[2]/table/tbody/tr[1]/td[2]');
        store.jshshir = jElement?.innerText.trim();

        // Pasportni olish
        let pElement = getX('//*[@id="__nuxt"]//tr[contains(., "pasport")]/td[2]') || getX('//*[@id="__nuxt"]//tr[4]/td[2]');
        store.passport = pElement?.innerText.trim();

        // Telefonni olish va bo'laklash
        let phElement = getX('//*[@id="__nuxt"]//tr[contains(., "Telefon")]/td[2]') || getX('//*[@id="__nuxt"]//tr[3]/td[2]/div');
        let rawPhone = phElement?.innerText.trim();

        if (rawPhone) {
            let digits = rawPhone.replace(/\D/g, '');
            let phone9 = digits.length >= 9 ? digits.slice(-9) : digits;
            store.phone_code = phone9.substring(0, 2);
            store.phone_main = phone9.substring(2);
        }

        chrome.storage.local.set({ "egovData": store }, () => {
            console.log("✅ Ma'lumotlar xotiraga saqlandi:", store);
            chrome.runtime.sendMessage({ action: "open_birdarcha" });
        });
    };
    document.body.appendChild(btn);
}

// ==========================================
// 2. TO'LDIRISH VA QIDIRISH (Birdarcha.uz - B SAYTI)
// ==========================================
async function fillBirdarcha() {
    chrome.storage.local.get("egovData", async (result) => {
        if (!result || !result.egovData) return;
        const data = result.egovData;
        console.log("🚀 Birdarcha to'ldirish boshlandi...");

        // --- QADAM 1: TELEFON KODI (SCROLL BILAN) ---
        const phoneSelector = document.querySelector('.Phone_select .ant-select-selector');
        if (phoneSelector && data.phone_code) {
            phoneSelector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await new Promise(r => setTimeout(r, 1500));

            const scrollContainer = document.querySelector('.ant-select-dropdown :not(.ant-select-dropdown-hidden) .rc-virtual-list-holder');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
                await new Promise(r => setTimeout(r, 1000));
            }

            const allOptions = document.querySelectorAll('.ant-select-item-option-content');
            for (let opt of allOptions) {
                if (opt.innerText.trim() === data.phone_code) {
                    opt.closest('.ant-select-item-option')?.click();
                    break;
                }
            }
            await new Promise(r => setTimeout(r, 1000));
            const maskField = document.getElementById('mask-field');
            if (maskField) {
                maskField.focus();
                maskField.value = data.phone_main;
                maskField.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        // --- QADAM 2: HUJJAT TURI ---
        await new Promise(r => setTimeout(r, 1200));
        const selectors = document.querySelectorAll('.ant-select-selector');
        if (selectors[0]) {
            selectors[0].dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            await new Promise(r => setTimeout(r, 1000));
            const docOption = getX("//div[contains(@class, 'ant-select-item-option')]//div[contains(text(), 'pasporti/ID-karta')]");
            if (docOption) docOption.click();
            await new Promise(r => setTimeout(r, 1500));
        }

        // --- QADAM 3: PASPORT VA JSHSHIR ---
        const docInput = document.getElementById('documentNumber');
        const pinInput = document.getElementById('pin');
        if (docInput) {
            docInput.value = data.passport.replace(/\s/g, '');
            docInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (pinInput) {
            pinInput.value = data.jshshir.toString().replace(/\D/g, '');
            pinInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // --- QADAM 4: QIDIRISH TUGMASI ---
        console.log("⌛ Qidirish tugmasi kutilmoqda...");
        await new Promise(r => setTimeout(r, 1500));

        let searchBtn = getX('/html/body/div[1]/div/div[2]/form/div/div[2]/div/div/div[5]/div[3]/button') ||
            getX("//button[.//div[text()='Qidirish']]");

        if (searchBtn) {
            console.log("🔘 Qidirish bosildi!");
            searchBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await new Promise(r => setTimeout(r, 500));
            searchBtn.click();

            // Server javobini tekshirishni boshlash
            handleServerResponse();
        }
    });
}

// ==========================================
// 3. SERVER JAVOBINI TAHLIL QILISH
// ==========================================
async function handleServerResponse() {
    let timer = 0;
    const checkResult = setInterval(() => {
        timer++;

        // 1. Xatolik xabarini tekshirish
        const errorMsg = document.querySelector('.ant-message-error') ||
            document.querySelector('.ant-alert-error');

        // 2. Muvaffaqiyat belgisi (masalan, qidiruvdan keyin paydo bo'ladigan ma'lumotlar bloki)
        // Agarda ma'lumot topilsa, sahifada odatda o'sha shaxsning ismi-familiyasi chiqadi
        // Biz "Davom etish" tugmasining o'zi borligini ham tekshirishimiz mumkin
        const continueBtnVisible = getX("//button[.//div[text()='Davom etish']]");

        if (errorMsg) {
            clearInterval(checkResult);
            console.error("❌ Xatolik aniqlandi:", errorMsg.innerText);
        }
        else if (continueBtnVisible && timer > 2) { // Kamida 1 soniya o'tib tugma ko'rinsa
            clearInterval(checkResult);
            console.log("📡 Serverdan javob keldi, ma'lumotlar to'g'ri.");
            clickContinue(); // Keyingi bosqichga o'tamiz
        }
        else if (timer > 30) { // 15 soniya kutish
            clearInterval(checkResult);
            console.warn("⚠️ Serverdan javob kutish vaqti tugadi.");
        }
    }, 500);
}

// ==========================================
// 4. Davom etish tugmasini bosish qismi
// ==========================================
async function clickContinue() {
    console.log("🚀 'Davom etish' tugmasi qidirilmoqda...");
    await new Promise(r => setTimeout(r, 1000)); // Ma'lumotlar vizual yuklanishi uchun qisqa kutish

    // Siz bergan Full XPath va matn bo'yicha qidiruv
    let continueBtn = getX('/html/body/div[1]/div/div[2]/form/div/div[1]/div/div/div[3]/button') ||
        getX("//button[.//div[text()='Davom etish']]");

    if (continueBtn) {
        console.log("✅ 'Davom etish' tugmasi topildi, bosilmoqda...");
        continueBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 500));
        continueBtn.click();

        // Jarayon to'liq tugadi, endi xotirani tozalash mumkin
        chrome.storage.local.remove("egovData");
        console.log("🏁 Barcha jarayonlar muvaffaqiyatli yakunlandi!");
    } else {
        console.error("❌ 'Davom etish' tugmasi topilmadi. Ma'lumotlar hali yuklanmagan bo'lishi mumkin.");
    }
}

// ==========================================
// 4. ISHGA TUSHIRISH (MAIN)
// ==========================================
if (location.host.includes("my.gov.uz")) {
    // A saytida tugma chiqishini tekshirib turadi
    setInterval(injectBridgeButton, 1000);
} else if (location.href.includes("registration")) {
    // B saytida 3 soniyadan keyin to'ldirishni boshlaydi
    setTimeout(fillBirdarcha, 3000);
}