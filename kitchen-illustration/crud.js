(() => {
  const $ = (id) => document.getElementById(id);
  const editKey = 'kitchenIllustrationEdits';
  const deletedKey = 'kitchenIllustrationDeleted';
  let editingId = '';
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  const baseId = (item, index) => item.id || `base-${index}-${item.name}`;
  const data = () => {
    const base = read('kitchenIllustrationCatalog', []);
    const pending = read('kitchenIllustrationPending', []);
    const edits = read(editKey, {}), deleted = new Set(read(deletedKey, []));
    return [...base.map((item, i) => ({ ...item, id: baseId(item, i) })), ...pending.map((item, i) => ({ ...item, id: item.id || `new-${i}-${item.name}` }))]
      .map((item) => ({ ...item, ...(edits[item.id] || {}) })).filter((item) => !deleted.has(item.id));
  };
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render() {
    const query = $('search').value.trim().toLowerCase(), category = $('category').value, status = $('status').value;
    const rows = data().filter((item) => (category === '全部分類' || item.category === category) && (status === '全部狀態' || item.status === status) && (!query || `${item.name} ${item.category} ${item.features || ''} ${item.material || ''}`.toLowerCase().includes(query)));
    $('toolGrid').innerHTML = rows.length ? rows.map((item) => `<article class="tool"><div class="tool-img">${item.file ? `<img loading="lazy" src="assets/廚房工具插畫示例/${encodeURIComponent(item.file)}" alt="${esc(item.name)}插畫">` : '<div class="empty">插畫待補</div>'}</div><div class="tool-body"><h3>${esc(item.name)}</h3><span class="tag">${esc(item.category)}</span><p>${esc(item.features || item.material || '尚未補充特徵')}</p><div class="record-actions"><button type="button" class="button ghost" data-edit-tool="${esc(item.id)}">修改</button><button type="button" class="button ghost" data-delete-tool="${esc(item.id)}">刪除</button></div></div></article>`).join('') : '<div class="empty">沒有符合的工具項目</div>';
    $('artCount').textContent = rows.filter((item) => item.status === '已有插畫').length;
    $('pendingCount').textContent = rows.filter((item) => item.status !== '已有插畫').length;
  }
  function resetForm() { editingId = ''; $('addForm').reset(); $('addForm').querySelector('button[type=submit]').textContent = '加入待補畫'; $('cancelEdit').hidden = true; $('addForm').elements.category.querySelectorAll('[data-edit-category]').forEach((option) => option.remove()); $('addForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  $('addForm').addEventListener('submit', (event) => {
    event.preventDefault(); event.stopImmediatePropagation();
    const form = new FormData(event.currentTarget), name = String(form.get('name') || '').trim(); if (!name) return;
    const item = { name, category: form.get('category'), material: String(form.get('material') || '').trim(), features: String(form.get('features') || '').trim(), source: '', file: '', status: '待補畫' };
    if (editingId) {
      const edits = read(editKey, {}); edits[editingId] = { ...edits[editingId], ...item }; localStorage.setItem(editKey, JSON.stringify(edits));
    } else {
      const pending = read('kitchenIllustrationPending', []); pending.push({ ...item, id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }); localStorage.setItem('kitchenIllustrationPending', JSON.stringify(pending));
    }
    resetForm(); render();
  }, true);
  $('toolGrid').addEventListener('click', (event) => {
    const edit = event.target.closest('[data-edit-tool]');
    if (edit) {
      const item = data().find((entry) => entry.id === edit.dataset.editTool); if (!item) return;
      editingId = item.id; const form = $('addForm'); form.elements.name.value = item.name; const category = item.category || '其他工具'; if (![...form.elements.category.options].some((option) => option.value === category)) { const option = new Option(category, category); option.dataset.editCategory = 'true'; form.elements.category.add(option); } form.elements.category.value = category; form.elements.material.value = item.material || ''; form.elements.features.value = item.features || '';
      form.querySelector('button[type=submit]').textContent = '儲存修改'; form.scrollIntoView({ behavior: 'smooth', block: 'center' }); form.elements.name.focus(); return;
    }
    const remove = event.target.closest('[data-delete-tool]'); if (!remove) return;
    const item = data().find((entry) => entry.id === remove.dataset.deleteTool); if (!item || !window.confirm(`要刪除「${item.name}」嗎？`)) return;
    const deleted = read(deletedKey, []); if (!deleted.includes(item.id)) deleted.push(item.id); localStorage.setItem(deletedKey, JSON.stringify(deleted));
    const pending = read('kitchenIllustrationPending', []).filter((entry, i) => (entry.id || `new-${i}-${entry.name}`) !== item.id); localStorage.setItem('kitchenIllustrationPending', JSON.stringify(pending));
    if (editingId === item.id) resetForm(); render();
  });
  $('addForm').insertAdjacentHTML('beforeend', '<button class="button ghost" type="button" id="cancelEdit" hidden>取消修改</button>');
  $('addForm').querySelector('[name=name]').addEventListener('input', () => { $('cancelEdit').hidden = !editingId; });
  $('cancelEdit').addEventListener('click', resetForm);
  $('toolGrid').addEventListener('click', (event) => { if (event.target.closest('[data-edit-tool]')) $('cancelEdit').hidden = false; });
  ['search','category','status'].forEach((id) => $(id).addEventListener(id === 'search' ? 'input' : 'change', render));
  $('exportLabelData').addEventListener('click', (event) => {
    event.preventDefault(); event.stopImmediatePropagation();
    const payload = { version: 1, tools: data() }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = '廚房工具標籤資料.json'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1500);
    $('exportFeedback').textContent = `已匯出 ${payload.tools.length} 項（包含編修結果）`;
  }, true);
  const style = document.createElement('style'); style.textContent = '.record-actions{display:flex;gap:7px;margin-top:10px}.record-actions .button{padding:6px 10px;font-size:.78rem}.record-actions [data-delete-tool]{color:#8a4035;border-color:#d7b6ae}.form #cancelEdit{grid-column:1/-1}'; document.head.append(style);
  render();
})();
