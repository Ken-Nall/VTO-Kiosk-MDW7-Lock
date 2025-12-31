// ==UserScript==
// @name         VTO Kiosk Site Auto-Select
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Automatically selects a site from the site selector dropdown and remembers the choice for future visits. Includes a reset button to change the selection.
// @author       Ken Nall @kennenal (MDW7)
// @match        https://aft-ls-associateweb.na.aft.amazonoperations.app/kiosk-interest/*
// @downloadURL  https://axzile.corp.amazon.com/-/carthamus/download_script/vto-kiosk-site-auto-select.user.js
// @updateURL    https://axzile.corp.amazon.com/-/carthamus/download_script/vto-kiosk-site-auto-select.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Configuration
    const STORAGE_KEY = 'vto_kiosk_selected_site';
    const INITIAL_MESSAGE = 'VTO Kiosk Auto-Select is installed. Please select a site to store it locally for future use. Disable this script and reload to choose a new site.';

    function showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #4CAF50; color: white; padding: 15px; border-radius: 5px; z-index: 10000; max-width: 300px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 10000);
    }

    function createResetButton() {
        const button = document.createElement('button');
        button.textContent = 'Reset Site';
        button.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #f44336; color: white; padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer; z-index: 10000; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);';
        button.addEventListener('click', function() {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        });
        document.body.appendChild(button);
    }

    function getSavedSite() {
        return localStorage.getItem(STORAGE_KEY);
    }

    function saveSite(site) {
        localStorage.setItem(STORAGE_KEY, site);
        console.log('Site saved:', site);
    }

    function selectSite(siteName) {
        const dropdown = document.getElementById('siteSelector');
        if (!dropdown) return false;

        for (let i = 0; i < dropdown.options.length; i++) {
            if (dropdown.options[i].text === siteName || dropdown.options[i].value === siteName) {
                dropdown.selectedIndex = i;
                const event = new Event('change', { bubbles: true });
                dropdown.dispatchEvent(event);
                console.log(siteName + ' selected successfully');
                return true;
            }
        }
        return false;
    }

    function setupSiteListener() {
        const dropdown = document.getElementById('siteSelector');
        if (!dropdown) return false;

        dropdown.addEventListener('change', function() {
            const selectedValue = this.options[this.selectedIndex].text || this.value;
            if (selectedValue) {
                saveSite(selectedValue);
                showMessage('Site "' + selectedValue + '" saved for future use!');
            }
        });
        return true;
    }

    function init() {
        const savedSite = getSavedSite();
        
        // Always create the reset button
        createResetButton();
        
        const interval = setInterval(() => {
            const dropdown = document.getElementById('siteSelector');
            if (!dropdown) return;

            if (savedSite) {
                // Try to select the saved site
                if (selectSite(savedSite)) {
                    clearInterval(interval);
                }
            } else {
                // No saved site, setup listener and show message
                if (setupSiteListener()) {
                    showMessage(INITIAL_MESSAGE);
                    clearInterval(interval);
                }
            }
        }, 500);

        // Stop trying after 10 seconds
        setTimeout(() => clearInterval(interval), 10000);
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

