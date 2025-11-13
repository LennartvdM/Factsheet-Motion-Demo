function initRootTabs() {
  if (document.body.dataset.rootTabsHydrated === 'true') {
    return;
  }

  const tabs = Array.from(document.querySelectorAll('[data-root-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-root-panel]'));

  if (!tabs.length || !panels.length) {
    return;
  }

  const hideAllPanels = () => {
    panels.forEach((panel) => {
      panel.classList.add('is-hidden');
    });
  };

  const deactivateAllTabs = () => {
    tabs.forEach((tab) => {
      tab.classList.remove('root-tab--active');
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.rootTab;
      if (!tabId) {
        return;
      }

      deactivateAllTabs();
      hideAllPanels();

      tab.classList.add('root-tab--active');

      const targetPanel = document.querySelector(`[data-root-panel="${tabId}"]`);
      if (targetPanel) {
        targetPanel.classList.remove('is-hidden');
      }
    });
  });

  document.body.dataset.rootTabsHydrated = 'true';
}

document.addEventListener('DOMContentLoaded', () => {
  initRootTabs();
});
