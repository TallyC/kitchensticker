(() => {
  const root = document.getElementById('library');
  const status = document.getElementById('catalogSyncStatus');
  const builtIns = new Set(['量匙','白柄菜刀','烘焙模具／奶油造型模具','烘焙模具','刮刀組','削皮器','吐司刀','廚房剪刀','料理盆組','網勺','量杯組','廚房計時器','食物溫度計','烘焙切模組','蒸布','竹簾','料理夾','廚刀組','放大鏡','擀麵棍組','小刮刀','小型廚房水果刀','不鏽鋼堅果夾／核桃夾','中藥布袋','冰淇淋杓','咖啡法蘭絨濾布架','帶柄滾輪(木)','金屬刮板','長柄不鏽鋼攪拌匙／刮棒','烘焙工具隔板／瀝水底座','不鏽鋼抹刀（桃紅把手）','細網篩','蛋糕切割器','量杯','量匙組','飯匙','塑膠刮板','廚房刷具','橡皮刮刀（黃色長柄）','雙頭不鏽鋼挖球器','麵包切割器','麵糰打孔滾輪','奶油花嘴','披薩刀']);
  const builtInFiles = new Set(['量匙.png','白柄菜刀.png','烘焙模具.png','刮刀組.png','削皮器.png','吐司刀.png','廚房剪刀.png','料理盆組.png','網勺.png','量杯組.png','廚房計時器.png','食物溫度計.png','烘焙切模組.png','蒸布.png','竹簾.png','料理夾.png','廚刀組.png','放大鏡.png','擀麵棍組.png','小刮刀.png','小型水果刀.png','不鏽鋼堅果夾.png','中藥布袋.png','冰淇淋杓.png','咖啡法蘭絨濾布架.png','帶柄木滾輪.png','金屬刮板.png','長柄攪拌匙刮棒.png','烘焙工具瀝水底座.png','桃紅柄不鏽鋼抹刀.png','細網篩.png','蛋糕切割器.png','量杯.png','量匙組.png','飯匙.png','塑膠刮板.png','廚房刷具.png','橡皮刮刀.png','雙頭挖球器.png','麵包切割器.png','麵糰打孔滾輪.png','奶油花嘴.png','披薩刀.png']);
  const read = (key) => { try { const data = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(data) ? data : []; } catch { return []; } };
  function sync() {
    if (!root || typeof window.useKitchenTool !== 'function') return;
    root.querySelectorAll('[data-dynamic-catalog]').forEach((node) => node.remove());
    const catalog = read('kitchenIllustrationCatalog');
    const pending = read('kitchenIllustrationPending');
    const imported = read('kitchenIllustrationImported');
    const edits = (() => { try { return JSON.parse(localStorage.getItem('kitchenIllustrationEdits') || '{}'); } catch { return {}; } })();
    const deleted = new Set(read('kitchenIllustrationDeleted'));
    const byName = new Map();
    const all = [
      ...catalog.map((item, index) => ({ ...item, id: item.id || `base-${index}-${item.name}`, _base: true })),
      ...pending.map((item, index) => ({ ...item, id: item.id || `new-${index}-${item.name}` })),
      ...imported.map((item, index) => ({ ...item, id: item.id || `import-${index}-${item.name}` }))
    ];
    const byId = new Map();
    all.forEach((raw) => {
      const item = { ...raw, ...(edits[raw.id] || {}) };
      if (!item.name || deleted.has(item.id)) return;
      if (builtIns.has(item.name)) return;
      if (item.file && builtInFiles.has(item.file)) return;
      const key = item.name.trim().toLocaleLowerCase();
      const previous = byName.get(key);
      byName.set(key, previous ? { ...previous, ...item, id: previous.id } : item);
    });
    for (const item of byName.values()) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'tool'; button.dataset.dynamicCatalog = 'true';
      const image = item.imageData || (item.file ? '../kitchen-illustration/assets/廚房工具插畫示例/' + encodeURIComponent(item.file) : 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260"><rect width="100%" height="100%" fill="#f4f0e3"/><text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#748078" font-size="24">待補插畫</text></svg>'));
      const img = document.createElement('img'); img.loading = 'lazy'; img.src = image; img.alt = `${item.name}插畫`;
      const title = document.createElement('b'); title.textContent = item.name;
      const category = document.createElement('small'); category.textContent = item.category || '其他工具';
      button.append(img, title, category);
      button.__kitchenTool = { image, name: item.name, category: item.category || '其他工具', features: item.features || '', id: item.id, sourceKind: item._base ? 'catalog' : 'local' };
      root.append(button);
    }
    if (status) status.textContent = `已載入 ${root.querySelectorAll('.tool').length} 項工具`;
    document.dispatchEvent(new CustomEvent('kitchen-catalog-updated'));
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('syncCatalog')?.addEventListener('click', sync);
    document.getElementById('importCatalog')?.addEventListener('change', async (event) => {
      const file = event.target.files?.[0]; if (!file) return;
      try {
        const payload = JSON.parse(await file.text());
        const tools = Array.isArray(payload) ? payload : payload.tools;
        if (!Array.isArray(tools)) throw new Error('missing tools array');
        const previous = read('kitchenIllustrationImported');
        const merged = new Map(previous.map((item) => [String(item.name || '').trim().toLocaleLowerCase(), item]));
        tools.forEach((item) => { const key = String(item.name || '').trim().toLocaleLowerCase(); if (key) merged.set(key, { ...(merged.get(key) || {}), ...item }); });
        localStorage.setItem('kitchenIllustrationImported', JSON.stringify([...merged.values()]));
        sync();
        if (status) status.textContent = `匯入完成：${tools.length} 項工具`;
      } catch { if (status) status.textContent = '匯入失敗：請選擇插畫工作台下載的 JSON 檔'; }
      event.target.value = '';
    });
    window.addEventListener('storage', (event) => { if (!event.key || event.key.startsWith('kitchenIllustration')) sync(); });
    sync();
  });
})();
