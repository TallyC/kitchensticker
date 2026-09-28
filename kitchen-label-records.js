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
      button.onclick = () => { $('bg').value = color; if (window.applyActiveBackground) window.applyActiveBackground(color); toast(`已套用 ${color}`); };
      root.append(button);
    });
  }
  window.rememberKitchenColor = (color) => { const colors = read(colorKey).filter((item) => item.toLowerCase() !== color.toLowerCase()); colors.unshift(color); localStorage.setItem(colorKey, JSON.stringify(colors.slice(0, 12))); renderColors(); };
  function record() {
    const filled = window.kitchenCells?.filter((cell) => cell.data) || [];
    if (!filled.length) return toast('請先加入至少一個工具');
    const record = { id: Date.now(), title: filled.map((cell) => cell.data.name).join('、'), meta: `${$('orientation').value === 'portrait' ? 'A4直式' : 'A4橫式'} · ${$('count').value}格`, time: new Date().toLocaleString('zh-TW') };
    const records = read(sheetKey); records.unshift(record); localStorage.setItem(sheetKey, JSON.stringify(records.slice(0, 8))); renderRecords(); toast('已記錄這次 A4 組合');
  }
  function renderRecords() {
    const root = $('recordGrid'); if (!root) return; const records = read(sheetKey);
    root.innerHTML = records.length ? records.map((item) => `<article class="record-card"><strong>${item.title}</strong><small>${item.meta} · ${item.time}</small><button class="btn light" data-copy-record="${item.id}">複製名稱</button></article>`).join('') : '<div class="note">尚未記錄組合。</div>';
  }
  document.addEventListener('DOMContentLoaded', () => { renderColors(); renderRecords(); $('copyColor')?.addEventListener('click', () => navigator.clipboard?.writeText($('bg').value).then(() => toast(`已複製 ${$('bg').value}`))); $('recordSheet')?.addEventListener('click', record); $('recordGrid')?.addEventListener('click', (event) => { const button = event.target.closest('[data-copy-record]'); if (!button) return; const item = read(sheetKey).find((entry) => String(entry.id) === button.dataset.copyRecord); if (item) navigator.clipboard?.writeText(item.title).then(() => toast('已複製組合名稱')); }); });
})();
