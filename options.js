const proxyDomainsInput = document.querySelector(".proxy_domains_input");
const settingsForm = document.querySelector(".settings_form");

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get("proxyDomains", (data) => {
    if (data.proxyDomains) {
      proxyDomainsInput.value = data.proxyDomains;
    }
  });
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  event.stopPropagation();
  const proxyDomains = proxyDomainsInput.value;
  chrome.storage.sync.set({ proxyDomains }, () => {
    alert("Settings saved!");
  });
});
