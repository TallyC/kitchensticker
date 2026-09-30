(() => {
  const $ = (id) => document.getElementById(id);
  const colorKey = 'kitchen-label-colors';
  const sheetKey = 'kitchen-label-sheets';
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
  const toast = (message) => { const node = $('status'); node.textContent = message; node.classList.add('show'); setTimeout(() => node.classList.remove('show'), 1800); };
  function renderColors() {
    const root = $('colorHistory'); if (!root) return;
    root.innerHTML = '';
    read(colorKey).forEach((color) => {
      const button = document.createElement('button'); button.className = 'color-chip'; button.title = color; button.style.background = color;
      button.onclick = () => { $('bg').value = color; $('bg').dispatchEvent(new Event('input', { bubbles: true })); toast(`已套用 ${color}`); };
      root.append(button);
    });
  }
  window.rememberKitchenColor = (color) => { const colors = read(colorKey).filter((item) => item.toLowerCase() !== color.toLowerCase()); colors.unshift(color); localStorage.setItem(colorKey, JSON.stringify(colors.slice(0, 12))); renderColors(); };
  function record() {
    const filled = window.kitchenCells?.filter((cell) => cell.data?.image || cell.data?.name) || [];
    if (!filled.length) return toast('請先加入至少一個工具');
    const layout = window.kitchenLayout?.();
    const record = { id: Date.now(), title: filled.map((cell) => cell.data.name).join('、'), meta: `${$('orientation').value === 'portrait' ? 'A4直式' : 'A4橫式'} · ${layout ? `${layout.cols}欄×${layout.rows}列` : `${$('count').value}格`}`, time: new Date().toLocaleString('zh-TW'), data: window.getKitchenSnapshot?.() || null };
    const records = read(sheetKey); records.unshift(record); localStorage.setItem(sheetKey, JSON.stringify(records.slice(0, 8))); renderRecords(); toast('已記錄這次 A4 組合');
  }
  function renderRecords() {
    const root = $('recordGrid'); if (!root) return; const records = read(sheetKey);
    root.innerHTML = '';
    if (!records.length) { root.innerHTML = '<div class="note">尚未記錄組合。</div>'; return; }
    records.forEach((item) => {
      const card = document.createElement('article'); card.className = 'record-card';
      const title = document.createElement('strong'); title.textContent = item.title;
      const info = document.createElement('small'); info.textContent = `${item.meta} · ${item.time}`;
      const button = document.createElement('button'); button.className = 'btn light'; button.dataset.copyRecord = item.id; button.textContent = item.data ? '恢復這組版面' : '複製名稱';
      card.append(title, info, button); root.append(card);
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    renderColors(); renderRecords();
    $('copyColor')?.addEventListener('click', async () => { const value=$('bg')?.value; try { await navigator.clipboard.writeText(value); toast(`已複製 ${value}`); } catch { toast(`HEX 顏色：${value}`); } });
    $('recordSheet')?.addEventListener('click', record);
    $('recordGrid')?.addEventListener('click', async (event) => {
      const button=event.target.closest('[data-copy-record]');if(!button)return;
      const item=read(sheetKey).find((entry)=>String(entry.id)===button.dataset.copyRecord);if(!item)return;
      if(item.data&&window.restoreKitchenSnapshot){window.restoreKitchenSnapshot(item.data);return;}
      try{await navigator.clipboard.writeText(item.title);toast('已複製組合名稱');}catch{toast(item.title);}
    });
  });
})();
