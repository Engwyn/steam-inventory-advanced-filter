// ==UserScript==
// @name         Steam Inventory Advanced Filter
// @namespace    https://github.com/Engwyn/steam-inventory-advanced-filter
// @version      1.0.0
// @description  Advanced URL-configurable Steam inventory filter for Tampermonkey/Violentmonkey. Batch filter trading cards, emoticons, backgrounds by game, rarity, and marketability with simple URL parameters.
// @author       Engwyn & Contributors
// @match        https://steamcommunity.com/id/*/inventory*
// @match        https://steamcommunity.com/profiles/*/inventory*
// @grant        none
// @run-at       document-idle
// @license      MIT
// @homepageURL  https://github.com/Engwyn/steam-inventory-advanced-filter
// @supportURL   https://github.com/Engwyn/steam-inventory-advanced-filter/issues
// ==/UserScript==

(function () {
  'use strict';

  // Filter configuration mapping
  const FILTER_CONFIG = {
    // Game-specific filters (AppID-based)
    appIdPrefix: 'tag_filter_753_6_Game_app_',

    // Item Type filters
    itemTypes: {
      'animated-avatar': 'tag_filter_753_6_item_class_item_class_15',
      'avatar-frame': 'tag_filter_753_6_item_class_item_class_14',
      'chat-effect': 'tag_filter_753_6_item_class_item_class_12',
      emoticon: 'tag_filter_753_6_item_class_item_class_4',
      gems: 'tag_filter_753_6_item_class_item_class_7',
      'mini-profile-bg': 'tag_filter_753_6_item_class_item_class_13',
      'profile-bg': 'tag_filter_753_6_item_class_item_class_3',
      'profile-modifier': 'tag_filter_753_6_item_class_item_class_8',
      'sale-item': 'tag_filter_753_6_item_class_item_class_10',
      sticker: 'tag_filter_753_6_item_class_item_class_11',
      'trading-card': 'tag_filter_753_6_item_class_item_class_2'
    },

    // Rarity filters
    rarity: {
      common: 'tag_filter_753_6_droprate_droprate_0',
      uncommon: 'tag_filter_753_6_droprate_droprate_1',
      rare: 'tag_filter_753_6_droprate_droprate_2'
    },

    // Card Border filters
    cardBorder: {
      normal: 'tag_filter_753_6_cardborder_cardborder_0',
      foil: 'tag_filter_753_6_cardborder_cardborder_1'
    },

    // Marketability filters
    misc: {
      marketable: 'tag_filter_753_6_misc_marketable',
      unmarketable: 'tag_filter_753_6_misc_unmarketable',
      tradable: 'tag_filter_753_6_misc_tradable',
      untradable: 'tag_filter_753_6_misc_untradable'
    }
  };

  // Check if current URL is an inventory page
  function isInventoryPage() {
    return /\/inventory/.test(location.pathname);
  }

  // Parse URL parameters
  function parseUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    const filters = {};

    // App IDs (comma-separated)
    const appIds = params.get('appids');
    if (appIds) {
      filters.appIds = appIds
        .split(',')
        .map(id => id.trim())
        .filter(id => /^\d+$/.test(id));
    }

    // Item types (comma-separated)
    const itemTypes = params.get('types');
    if (itemTypes) {
      filters.itemTypes = itemTypes
        .split(',')
        .map(type => type.trim().toLowerCase())
        .filter(type => FILTER_CONFIG.itemTypes[type]);
    }

    // Rarity (comma-separated)
    const rarity = params.get('rarity');
    if (rarity) {
      filters.rarity = rarity
        .split(',')
        .map(r => r.trim().toLowerCase())
        .filter(r => FILTER_CONFIG.rarity[r]);
    }

    // Card border (comma-separated)
    const cardBorder = params.get('border');
    if (cardBorder) {
      filters.cardBorder = cardBorder
        .split(',')
        .map(b => b.trim().toLowerCase())
        .filter(b => FILTER_CONFIG.cardBorder[b]);
    }

    // Misc filters (comma-separated)
    const misc = params.get('misc');
    if (misc) {
      filters.misc = misc
        .split(',')
        .map(m => m.trim().toLowerCase())
        .filter(m => FILTER_CONFIG.misc[m]);
    }

    return Object.keys(filters).length > 0 ? filters : null;
  }

  // Navigate to Steam inventory category (AppID 753)
  async function ensureSteamCategory() {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        // Check if we're already on Steam category
        const steamTab = document.querySelector('#inventory_link_753');
        if (steamTab && steamTab.classList.contains('active')) {
          clearInterval(checkInterval);
          resolve();
          return;
        }

        // Look for Steam inventory tab and click it
        if (steamTab) {
          console.log('Steam Inventory Filter: Switching to Steam category');
          steamTab.click();
          clearInterval(checkInterval);
          // Wait a bit for the category to switch
          setTimeout(resolve, 800);
          return;
        }

        // If Steam tab not found, continue anyway (might be single-game inventory)
        if (document.querySelector('.inventory_page')) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 300);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  // Switch to Community items context if needed
  async function ensureCommunityContext() {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        // Check if we're already on Community items context (753_6)
        if (location.hash.includes('753_6')) {
          clearInterval(checkInterval);
          resolve();
          return;
        }

        // Look for Community items context option
        const communityOption = document.querySelector('#context_option_753_6');
        if (communityOption) {
          console.log('Steam Inventory Filter: Switching to Community items context');
          communityOption.click();
          clearInterval(checkInterval);
          // Wait a bit for the context to switch
          setTimeout(resolve, 500);
          return;
        }

        // If no specific context found but we're on inventory page, continue anyway
        if (document.querySelector('.inventory_page')) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 300);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  // Wait for filter toggle button
  function waitForFilterToggle() {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        const btn = document.querySelector('#filter_tag_show');
        if (btn && window.getComputedStyle(btn).display !== 'none') {
          clearInterval(checkInterval);
          resolve(btn);
        }
      }, 300);
    });
  }

  // Wait for filters to render
  function waitForFiltersRendered() {
    return new Promise(resolve => {
      const checkInterval = setInterval(() => {
        const filterContainer = document.querySelector('.econ_tag_filter_container');
        if (filterContainer) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 300);
    });
  }

  // Safely check a filter checkbox
  function checkFilter(filterId) {
    try {
      const checkbox = document.getElementById(filterId);
      if (checkbox && !checkbox.checked) {
        checkbox.click();
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
    } catch (error) {
      console.debug(`Filter ${filterId} not found or could not be checked:`, error);
    }
    return false;
  }

  // Apply all configured filters
  async function applyFilters() {
    const filters = parseUrlFilters();
    if (!filters) return;

    try {
      // Navigate to Steam category first (AppID 753)
      await ensureSteamCategory();

      // Ensure we're on Community items context for community-specific filters
      await ensureCommunityContext();

      // Expand filter panel
      const toggleBtn = await waitForFilterToggle();
      toggleBtn.click();

      // Wait for filters to load
      await waitForFiltersRendered();

      let appliedCount = 0;

      // Apply App ID filters
      if (filters.appIds) {
        filters.appIds.forEach(appId => {
          const filterId = FILTER_CONFIG.appIdPrefix + appId;
          if (checkFilter(filterId)) {
            appliedCount++;
          }
        });
      }

      // Apply item type filters
      if (filters.itemTypes) {
        filters.itemTypes.forEach(type => {
          const filterId = FILTER_CONFIG.itemTypes[type];
          if (checkFilter(filterId)) {
            appliedCount++;
          }
        });
      }

      // Apply rarity filters
      if (filters.rarity) {
        filters.rarity.forEach(rarity => {
          const filterId = FILTER_CONFIG.rarity[rarity];
          if (checkFilter(filterId)) {
            appliedCount++;
          }
        });
      }

      // Apply card border filters
      if (filters.cardBorder) {
        filters.cardBorder.forEach(border => {
          const filterId = FILTER_CONFIG.cardBorder[border];
          if (checkFilter(filterId)) {
            appliedCount++;
          }
        });
      }

      // Apply misc filters
      if (filters.misc) {
        filters.misc.forEach(misc => {
          const filterId = FILTER_CONFIG.misc[misc];
          if (checkFilter(filterId)) {
            appliedCount++;
          }
        });
      }

      console.log(`Steam Inventory Filter: Applied ${appliedCount} filters successfully.`);
    } catch (error) {
      console.error('Steam Inventory Filter: Error applying filters:', error);
    }
  }

  // Handle SPA navigation and hash changes
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      if (isInventoryPage()) {
        setTimeout(applyFilters, 1000);
      }
    }
  });
  observer.observe(document.body, { subtree: true, childList: true });

  // Listen for hash changes (when Steam switches inventory contexts)
  window.addEventListener('hashchange', () => {
    if (isInventoryPage()) {
      setTimeout(applyFilters, 1000);
    }
  });

  // Initial execution
  if (isInventoryPage()) {
    applyFilters();
  }
})();
