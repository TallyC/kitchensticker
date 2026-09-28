(() => {
  const root = document.getElementById('library');
  const status = document.getElementById('catalogSyncStatus');
  const builtIns = new Set(['量匙','白柄菜刀','烘焙模具','刮刀組','削皮器','吐司刀','廚房剪刀','料理盆組','網勺','量杯組','廚房計時器','食物溫度計','烘焙切模組','蒸布','竹簾','料理夾','廚刀組','放大鏡']);
  const read = (key) => { try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data : []; } catch { return []; } };
  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function sync() {
    if (!root || typeof window.useKitchenTool !== 'function') return;
    root.querySelectorAll('[data-dynamic-catalog]').forEach((node) => node.remove());
    const catalog = read('kitchenIllustrationCatalog');
    const pending = read('kitchenIllustrationPending');
    const imported = read('kitchenIllustrationImported');
    const edits = (() => { try { return JSON.parse(localStorage.getItem('kitchenIllustrationEdits') || '{}'); } catch { return {}; } })();
    const deleted = new Set(read('kitchenIllustrationDeleted'));
    const firstBuiltIn = new Set();
    const all = [
      ...catalog.map((item, index) => ({ ...item, id: item.id || `base-${index}-${item.name}`, _base: true })),
      ...pending.map((item, index) => ({ ...item, id: item.id || `new-${index}-${item.name}` })),
      ...imported.map((item, index) => ({ ...item, id: item.id || `import-${index}-${item.name}` }))
    ];
    const byId = new Map();
    all.forEach((raw) => {
      const item = { ...raw, ...(edits[raw.id] || {}) };
      if (!item.name || deleted.has(item.id)) return;
      if (raw._base && builtIns.has(item.name)) {
        if (!firstBuiltIn.has(item.name)) { firstBuiltIn.add(item.name); return; }
      }
      byId.set(item.id, item);
    });
    for (const item of byId.values()) {
      const button = document.createElement('button');
      button.className = 'tool'; button.dataset.dynamicCatalog = 'true';
      const image = item.imageData || (item.file ? '../kitchen-illustration/assets/廚房工具插畫示例/' + encodeURIComponent(item.file) : 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="#f4f0e3"/><text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#748078" font-size="24">待補插畫</text></svg>'));
      button.innerHTML = image
        ? `<img src="${image}" alt=""><b>${esc(item.name)}</b>`
        : `<img src="${image}" alt=""><b>${esc(item.name)}</b>`;
      button.onclick = () => window.useKitchenTool(image, item.name);
      root.append(button);
    }
    if (status) status.textContent = `已載入 ${root.querySelectorAll('.tool').length} 項工具`;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('syncCatalog')?.addEventListener('click', sync);
    document.getElementById('importCatalog')?.addEventListener('change', async (event) => {
      const file = event.target.files?.[0]; if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        const tools = Array.isArray(payload) ? payload : payload.tools;
        if (!Array.isArray(tools)) throw new Error('missing tools array');
        localStorage.setItem('kitchenIllustrationImported', JSON.stringify(tools));
        sync();
        if (status) status.textContent = `匯入完成：${tools.length} 項工具`;
      } catch { if (status) status.textContent = '匯入失敗：請選擇插畫工作台下載的 JSON 檔'; }
      event.target.value = '';
    });
    window.addEventListener('storage', (event) => { if (!event.key || event.key.startsWith('kitchenIllustration')) sync(); });
    sync();
  });
})();
