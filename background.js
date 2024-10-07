// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// When you specify "type": "module" in the manifest background,
// you can include the service worker as an ES Module,
// import { tldLocales } from "./locales.js";

// Add a listener to create the initial context menu items,
// context menu items only need to be created at runtime.onInstalled
chrome.runtime.onInstalled.addListener(async () => {
  // for (const [tld, locale] of Object.entries(tldLocales)) {
  chrome.contextMenus.create({
    id: "webproxy",
    title: "Open via Web Proxy",
    // id: tld,
    // title: locale,
    type: "normal",
    contexts: ["link"],
  });
  // }
});

const getProxyLink = (link) => {
  const proxyLink = `https://ewp.deno.dev/${link}`;
  return proxyLink;
};

chrome.contextMenus.onClicked.addListener((eventInfo, tab) => {
  const proxyLink = getProxyLink(eventInfo.linkUrl);
  chrome.tabs.create({ url: proxyLink, index: tab.index + 1 });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    var currentUrl = currentTab.url || currentTab.pendingUrl;
    console.log("currentUrl:", currentUrl);

    const proxyLink = getProxyLink(currentUrl);
    chrome.tabs.create({ url: proxyLink, index: currentTab.index + 1 });
  });
});

const checkAutoWebProxy = (tabUrl, tabId) => {
  chrome.storage.sync.get("proxyDomains", (data) => {
    console.log("proxyDomains:", data.proxyDomains);
    if (data.proxyDomains) {
      const proxyDomainsList = data.proxyDomains.split(",");
      console.log("proxyDomainsList", proxyDomainsList);
      for (const proxyDomain of proxyDomainsList) {
        const proxyDomainRegex = proxyDomain.replace(".", "\\.");
        const urlDomainRegex = new RegExp(
          `^https?:\/\/([a-zA-Z0-9-]+\.)*${proxyDomainRegex}(\/|$)`
        );

        const tabUrlObject = new URL(tabUrl);
        // If tab origin (shorter) matches any of automatically proxy domains then redirect tab via web proxy
        if (tabUrlObject.origin.match(urlDomainRegex)) {
          const proxyLink = getProxyLink(tabUrl);
          chrome.tabs.update(tabId, { url: proxyLink }, () => {
            console.log(`Tab with ID: ${tabId} has been web proxied`);
          });

          break;
        }
      }
    }
  });
};

chrome.tabs.onCreated.addListener((tab) => {
  console.log("new tab has opened:", tab);
  const newTabUrl = tab.url || tab.pendingUrl;
  checkAutoWebProxy(newTabUrl, tab.id);
});


// Add or removes the locale from context menu
// when the user checks or unchecks the locale in the popup
// chrome.storage.onChanged.addListener(({ enabledTlds }) => {
//   if (typeof enabledTlds === "undefined") return;

//   const allTlds = Object.keys(tldLocales);
//   const currentTlds = new Set(enabledTlds.newValue);
//   const oldTlds = new Set(enabledTlds.oldValue ?? allTlds);
//   const changes = allTlds.map((tld) => ({
//     tld,
//     added: currentTlds.has(tld) && !oldTlds.has(tld),
//     removed: !currentTlds.has(tld) && oldTlds.has(tld),
//   }));

//   for (const { tld, added, removed } of changes) {
//     if (added) {
//       chrome.contextMenus.create({
//         id: tld,
//         title: tldLocales[tld],
//         type: "normal",
//         contexts: ["selection"],
//       });
//     } else if (removed) {
//       chrome.contextMenus.remove(tld);
//     }
//   }
// });
