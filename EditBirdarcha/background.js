chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "open_birdarcha") {
        chrome.tabs.create({ url: "https://office.birdarcha.uz/drives-new/paid-services/registration" });
    }
});