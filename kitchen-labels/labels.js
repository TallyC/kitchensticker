(() => {
  const $ = (id) => document.getElementById(id);
  const MM_A4 = { portrait: { w: 210, h: 297 }, landscape: { w: 297, h: 210 } };
  const fonts = { serif: '"Noto Serif TC", Georgia, serif', sans: '"Noto Sans TC", system-ui, sans-serif', round: '"Arial Rounded MT Bold", "Noto Sans TC", sans-serif' };
  const assets = [
    ['量匙.png','量測與計時'],['白柄菜刀.png','備料與切割'],['烘焙模具.png','烘焙工具'],['刮刀組.png','備料與切割'],['削皮器.png','備料與切割'],['吐司刀.png','備料與切割'],['廚房剪刀.png','備料與切割'],['料理盆組.png','清洗與濾水'],['網勺.png','清洗與濾水'],['量杯組.png','量測與計時'],['廚房計時器.png','量測與計時'],['食物溫度計.png','量測與計時'],['烘焙切模組.png','烘焙工具'],['蒸布.png','蒸煮與布具'],['竹簾.png','蒸煮與布具'],['料理夾.png','備料與切割'],['廚刀組.png','備料與切割'],['放大鏡.png','其他工具']
  ];
  // 可選市售規格以標籤尺寸與列欄為核心；版面預設置中。購買前仍需核對包裝型號及刀模邊界。
  const templates = {
    'ogi-l31236': { name:'OGI L31236', cols:3, rows:12, w:70, h:24.7, x:0, y:0, gx:0, gy:.05, warning:'此規格標籤橫向接近滿版（每格約 70 × 24.7 mm）。不同批次刀模可能略有差異，請先普通紙試印對光；印表機不能無邊界列印時，外側內容可能被裁切。' },
    'avery-l7160': { name:'Avery L7160', cols:3, rows:7, w:63.5, h:38.1, x:7.5, y:15.15, gx:2.5, gy:0, warning:'適用 63.5 × 38.1 mm、每張 21 格的 L7160 相容紙。其他品牌請核對包裝上的型號與邊界尺寸，並先試印。' },
    '2up-large': { name:'A4 大張 2 格', cols:1, rows:2, w:199.6, h:143.5, x:5.2, y:5, gx:0, gy:0, warning:'每張 2 格，標籤約 199.6 × 143.5 mm；不同相容紙的上下排列可能不同，請核對包裝刀模。' },
    '2x5-l7173': { name:'Avery L7173／相容｜2 欄 × 5 列', cols:2, rows:5, w:99.1, h:57, centered:true, warning:'常見 10 格版型，每格約 99.1 × 57 mm。相容品牌刀模邊界可能不同，首次請先試印。' },
    '2x8-10535': { name:'A4 105 × 35｜2 欄 × 8 列', cols:2, rows:8, w:105, h:35, centered:true, warning:'每格 105 × 35 mm、共 16 格；標籤寬度合計為 A4 全寬，外側可能受印表機不可列印邊界影響。' },
    '2x6-10549': { name:'A4 105 × 49｜2 欄 × 6 列', cols:2, rows:6, w:105, h:49, centered:true, warning:'每格 105 × 49 mm、共 12 格；標籤寬度合計為 A4 全寬，外側可能受印表機不可列印邊界影響。' },
    '3x8-6534': { name:'A4 65 × 34｜3 欄 × 8 列', cols:3, rows:8, w:65, h:34, centered:true },
    '2x4-10070': { name:'A4 100 × 70｜2 欄 × 4 列', cols:2, rows:4, w:100, h:70, centered:true },
    '2x4-10574': { name:'A4+10574｜2 欄 × 4 列', cols:2, rows:4, w:105, h:74, centered:true, warning:'每格約 105 × 74 mm、共 8 格，標籤寬度合計為 A4 全寬；外側可能受印表機不可列印邊界影響。' },
    '4x8-5134': { name:'A4 51 × 34｜4 欄 × 8 列', cols:4, rows:8, w:51, h:34, centered:true },
    '2x2-105148': { name:'A4 105 × 148｜2 欄 × 2 列', cols:2, rows:2, w:105, h:148, centered:true },
    '1x3-20096': { name:'A4+20096｜1 欄 × 3 列', cols:1, rows:3, w:200, h:96, centered:true, warning:'每格約 200 × 96 mm、共 3 格；外側留白較窄，請先普通紙試印。' },
    '1x2-210148': { name:'A4+210148｜1 欄 × 2 列', cols:1, rows:2, w:210, h:148, x:0, y:.5, gx:0, gy:.5, warning:'每格約 210 × 148 mm、共 2 格，幾乎滿版；印表機不可列印邊界可能裁切內容。' },
    '1x1-210297': { name:'A4+210297｜1 欄 × 1 列（整張）', cols:1, rows:1, w:210, h:297, x:0, y:0, gx:0, gy:0, warning:'整張 A4 貼紙規格；印表機不可列印邊界可能裁切內容。' },
    'custom': null
  };
  let cells = [], active = -1, layout = null;
  const toast = (message) => { const node=$('status'); node.textContent=message; node.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>node.classList.remove('show'),2200); };
  const baseName = (file) => file.replace(/\.png$/i,'');
  function readSettings() {
    let orientation=$('orientation').value, paper=MM_A4[orientation]; const template=$('template').value;
    let cols=Math.max(1,Math.min(6,Number($('cols').value)||3)), rows=Math.max(1,Math.min(15,Number($('rows').value)||6));
    $('cols').value=cols; $('rows').value=rows;
    if(template!=='custom'){
      const t=templates[template]; cols=t.cols; rows=t.rows;
      $('cols').value=cols; $('rows').value=rows;
      $('orientation').value='portrait'; orientation='portrait'; paper=MM_A4.portrait;
      $('orientation').disabled=true; $('cols').disabled=true; $('rows').disabled=true;
      $('marginX').value=t.x; $('marginY').value=t.y; $('gapX').value=t.gx; $('gapY').value=t.gy;
      let x=t.x??0,y=t.y??0,gx=t.gx??0,gy=t.gy??0;
      if(t.centered){gx=cols>1?Math.max(0,(paper.w-cols*t.w)/(cols+1)):0;gy=rows>1?Math.max(0,(paper.h-rows*t.h)/(rows+1)):0;x=gx;y=gy;}
      $('marginX').value=x.toFixed(2); $('marginY').value=y.toFixed(2); $('gapX').value=gx.toFixed(2); $('gapY').value=gy.toFixed(2);
      layout={...paper,cols,rows,x,y,gx,gy,cw:t.w,ch:t.h,name:t.name,template,warning:t.warning||''};
    }else{
      $('orientation').disabled=false; $('cols').disabled=false; $('rows').disabled=false;
      const x=Math.max(0,Number($('marginX').value)||0), y=Math.max(0,Number($('marginY').value)||0), gx=Math.max(0,Number($('gapX').value)||0), gy=Math.max(0,Number($('gapY').value)||0);
      layout={...paper,cols,rows,x,y,gx,gy,cw:(paper.w-2*x-(cols-1)*gx)/cols,ch:(paper.h-2*y-(rows-1)*gy)/rows,name:'自訂 A4',template,warning:''};
    }
    const fits=layout.cw>0&&layout.ch>0&&layout.x+layout.cols*layout.cw+(layout.cols-1)*layout.gx<=layout.w+.02&&layout.y+layout.rows*layout.ch+(layout.rows-1)*layout.gy<=layout.h+.02;
    layout.invalid=!fits;layout.gridFits=fits;layout.baseWarning=fits?layout.warning:'';
    if(!fits)layout.warning='目前欄列、邊界或標籤尺寸超出 A4 範圍，請調整版面設定。';
    $('count').value=layout.cols*layout.rows; $('countLabel').value=`${layout.cols*layout.rows} 張`;
    $('dimensionInfo').textContent=fits?`每格約 ${layout.cw.toFixed(1)} × ${layout.ch.toFixed(1)} mm｜${layout.name}`:'格位超出 A4，請修正設定。';
    $('templateWarning').textContent=layout.warning; $('templateWarning').hidden=!layout.warning;
    return layout;
  }
  function defaultCell() { return { image:'',imageName:'',name:'',sub:'',font:'serif',size:24,color:'#24332d',bg:'#f4f0e3',imageRatio:58,direction:'vertical',align:'center',borderOn:false,borderColor:'#b8bbae',borderWidth:.2,inset:3,offsetX:0,offsetY:0,widthAdjust:0,heightAdjust:0 }; }
  function mmPercent(value,total){return `${value/total*100}%`;}
  function renderCell(i){
    const item=cells[i]; if(!item)return; const c=item.el,d=item.data||defaultCell();
    c.className='cell'+(i===active?' selected':'');
    const col=i%layout.cols,row=Math.floor(i/layout.cols);
    const x=layout.x+col*(layout.cw+layout.gx)+(Number(d?.offsetX)||0),y=layout.y+row*(layout.ch+layout.gy)+(Number(d?.offsetY)||0),w=Math.max(1,layout.cw+(Number(d?.widthAdjust)||0)),h=Math.max(1,layout.ch+(Number(d?.heightAdjust)||0));
    c.style.left=mmPercent(x,layout.w); c.style.top=mmPercent(y,layout.h);
    c.style.width=mmPercent(w,layout.w); c.style.height=mmPercent(h,layout.h);
    c.style.border=d?.borderOn?`${Math.max(0,Number(d.borderWidth)||0)}mm ${$('template').value==='custom'?'dashed':'solid'} ${d.borderColor||'#b8bbae'}`:'none';
    c.style.background=d?.bg||'#fff'; c.innerHTML='';
    if(!d.image){const empty=document.createElement('div');empty.className='empty';empty.innerHTML=`${i+1}<br>選取後加入工具`;c.append(empty);return;}
    c.style.padding='0';
    const inset=Math.max(0,Number(d.inset)||0);
    c.style.setProperty('--inset-x',`${inset/w*100}%`);c.style.setProperty('--inset-y',`${inset/h*100}%`);
    c.classList.toggle('horizontal',d.direction==='horizontal');c.style.justifyContent=d.align==='top'?'flex-start':d.align==='bottom'?'flex-end':'center';
    const group=document.createElement('div');group.className='cell-content';
    const im=document.createElement('img');im.src=d.image;im.alt=d.name;im.style.setProperty('--image-ratio',`${Math.max(25,Math.min(85,Number(d.imageRatio)||58))}%`);group.append(im);
    const text=document.createElement('div');text.className='cell-text';
    const name=document.createElement('strong');name.textContent=d.name;name.style.fontFamily=fonts[d.font]||fonts.serif;name.style.fontSize=`${Math.max(8,Number(d.size)||24)}pt`;name.style.color=d.color;text.append(name);
    if(d.sub){const sub=document.createElement('small');sub.textContent=d.sub;sub.style.fontFamily=fonts[d.font]||fonts.serif;sub.style.fontSize=`${Math.max(7,(Number(d.size)||24)*.58)}pt`;sub.style.color=d.color;text.append(sub);}group.append(text);c.append(group);
  }
  function drawAll(){cells.forEach((_,i)=>renderCell(i));}
  function checkCellBounds(){
    if(!layout)return;
    const outside=cells.some((item,i)=>{const d=item.data;if(!d)return false;const col=i%layout.cols,row=Math.floor(i/layout.cols),x=layout.x+col*(layout.cw+layout.gx)+(Number(d.offsetX)||0),y=layout.y+row*(layout.ch+layout.gy)+(Number(d.offsetY)||0),w=Math.max(1,layout.cw+(Number(d.widthAdjust)||0)),h=Math.max(1,layout.ch+(Number(d.heightAdjust)||0));return x<-.02||y<-.02||x+w>layout.w+.02||y+h>layout.h+.02;});
    layout.invalid=!layout.gridFits||outside;
    $('templateWarning').textContent=!layout.gridFits?'目前欄列、邊界或標籤尺寸超出 A4 範圍，請調整版面設定。':outside?'有標籤位置或尺寸超出 A4，請修正該格的微調值。':layout.baseWarning||'';
    $('templateWarning').hidden=!$('templateWarning').textContent;
  }
  function renderPaper(preserve=true){
    const next=readSettings(), count=next.cols*next.rows;
    const saved=preserve?cells.map((c)=>c.data):[];
    $('paper').className=`paper ${$('orientation').value}`;
    $('paper').setAttribute('aria-label',`A4 ${$('orientation').value==='portrait'?'直式':'橫式'}，${count} 格`);
    $('paper').innerHTML='';$('paper').classList.toggle('guides-off',!$('showGuides').checked); cells=[];
    for(let i=0;i<count;i++){
      const el=document.createElement('div');el.className='cell';el.dataset.index=i;
      el.addEventListener('click',()=>selectCell(i));$('paper').append(el);
      cells.push({el,data:saved[i]||null});
    }
    window.kitchenCells=cells;
    if(active<0||active>=count)active=count?0:-1;
    drawAll(); selectCell(active);checkCellBounds();
  }
  function updateStatus(){
    $('selectionStatus').textContent=active<0?'請點選格位':cells[active]?.data?.name?`第 ${active+1} 格｜${cells[active].data.name}`:`第 ${active+1} 格｜尚未加入工具`;
  }
  function selectCell(i){
    if(i<0||!cells[i]){active=-1;$('emptyEdit').hidden=false;$('editor').hidden=true;updateStatus();return;}
    active=i;cells.forEach((item,index)=>item.el.classList.toggle('selected',index===i));
    const d=cells[i].data;
    $('selectedLabel').textContent=`第 ${i+1} 格`;
    $('emptyEdit').hidden=true;$('editor').hidden=false;
    const shown={...defaultCell(),...(d||{})};['name','sub','font','size','color','bg','imageRatio','direction','align','borderColor','borderWidth','inset','offsetX','offsetY','widthAdjust','heightAdjust'].forEach(k=>{if($(k))$(k).value=shown[k]??defaultCell()[k];});$('borderOn').checked=shown.borderOn!==false;$('ratioValue').textContent=`${shown.imageRatio||58}%`;
    updateStatus();
  }
  function useTool(tool){
    if(active<0){toast('請先點選中央要放入工具的格位');return;}
    const prev=cells[active].data||defaultCell();
    cells[active].data={...prev,image:tool.image||'',imageName:tool.name||'',name:tool.name||'未命名工具',sourceId:tool.id||'',sourceKind:tool.sourceKind||'',sub:prev.name?prev.sub:'',};
    renderCell(active);selectCell(active);toast(`已放入第 ${active+1} 格`);
  }
  function applyFilters(){
    const query=$('librarySearch').value.trim().toLocaleLowerCase(), category=$('libraryCategory').value;
    const cards=[...$('library').querySelectorAll('.tool')];let visible=0;
    cards.forEach(card=>{const d=card.__kitchenTool||{},match=(!query||`${d.name||''} ${d.category||''} ${d.features||''}`.toLocaleLowerCase().includes(query))&&(!category||d.category===category);card.hidden=!match;if(match)visible++;});
    $('emptyLibrary')?.remove();if(!visible){const empty=document.createElement('div');empty.id='emptyLibrary';empty.className='empty-library';empty.textContent='找不到符合的工具，試試其他名稱或分類。';$('library').append(empty);}
  }
  function buildLibrary(){
    const root=$('library');
    assets.forEach(([file,category])=>{
      const name=baseName(file),b=document.createElement('button');b.type='button';b.className='tool';
      const image=`../kitchen-illustration/assets/廚房工具插畫示例/${encodeURIComponent(file)}`;
      const im=document.createElement('img');im.loading='lazy';im.src=image;im.alt=`${name}插畫`;
      const title=document.createElement('b');title.textContent=name;
      const tag=document.createElement('small');tag.textContent=category;
      b.append(im,title,tag);b.__kitchenTool={name,category,image,id:`builtin-${file}`,sourceKind:'builtin'};root.append(b);
    });
    root.addEventListener('click',(event)=>{const card=event.target.closest('.tool');if(card?.__kitchenTool)useTool(card.__kitchenTool);});
  }
  function updateActive(key,value){if(active<0||!cells[active])return;if(!cells[active].data)cells[active].data=defaultCell();cells[active].data[key]=value;renderCell(active);updateStatus();checkCellBounds();}
  function downloadUrl(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();}
  function wrapText(ctx,text,maxWidth){const lines=[];for(const paragraph of String(text||'').split('\n')){let line='';for(const char of paragraph){const next=line+char;if(line&&ctx.measureText(next).width>maxWidth){lines.push(line);line=char;}else line=next;}lines.push(line);}return lines;}
  async function exportPng(){
    if(layout.invalid){toast('版面超出 A4，請先修正');return;}
    const W=$('orientation').value==='landscape'?3508:2480,H=$('orientation').value==='landscape'?2480:3508,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
    const scaleX=W/layout.w,scaleY=H/layout.h,images=await Promise.all(cells.map(async item=>{if(!item.data?.image)return null;const img=new Image();img.src=item.data.image;try{await img.decode();return img;}catch{return null;}}));
    cells.forEach((item,i)=>{
      const d=item.data;if(!d)return;const col=i%layout.cols,row=Math.floor(i/layout.cols),x=(layout.x+col*(layout.cw+layout.gx)+(Number(d.offsetX)||0))*scaleX,y=(layout.y+row*(layout.ch+layout.gy)+(Number(d.offsetY)||0))*scaleY,w=Math.max(1,layout.cw+(Number(d.widthAdjust)||0))*scaleX,h=Math.max(1,layout.ch+(Number(d.heightAdjust)||0))*scaleY,pad=(Number(d.inset)||0)*scaleX;
      ctx.fillStyle=d.bg||'#f4f0e3';ctx.fillRect(x,y,w,h);
      if(d.borderOn){ctx.strokeStyle=d.borderColor||'#b8bbae';ctx.lineWidth=Math.max(1,(Number(d.borderWidth)||.2)*scaleX);ctx.setLineDash($('template').value==='custom'?[8,8]:[]);ctx.strokeRect(x+ctx.lineWidth/2,y+ctx.lineWidth/2,w-ctx.lineWidth,h-ctx.lineWidth);ctx.setLineDash([]);}
      const image=images[i],pt=Math.max(8,Number(d.size)||24),fontPx=pt*300/72,innerX=x+pad,innerY=y+pad,innerW=Math.max(1,w-pad*2),innerH=Math.max(1,h-pad*2),horizontal=d.direction==='horizontal',ratio=Math.max(.25,Math.min(.85,(Number(d.imageRatio)||58)/100));
      ctx.fillStyle=d.color||'#24332d';ctx.textBaseline='middle';ctx.font=`600 ${fontPx}px ${fonts[d.font]||fonts.serif}`;
      const subPx=Math.max(7,pt*.58)*300/72;
      if(horizontal){
        const imageW=innerW*ratio,textW=innerW-imageW,gap=Math.min(12,innerW*.025),ix=innerX+(imageW-(image?imageW*.94:0))/2;
        if(image){const fit=Math.min(imageW*.94/image.naturalWidth,innerH*.94/image.naturalHeight),iw=image.naturalWidth*fit,ih=image.naturalHeight*fit;ctx.drawImage(image,innerX+(imageW-iw)/2,innerY+(innerH-ih)/2,iw,ih);}
        const tx=innerX+imageW+gap,availableW=Math.max(1,textW-gap),lines=wrapText(ctx,d.name,availableW),subLine=d.sub?subPx*1.2:0,total=lines.length*fontPx*1.15+subLine,startY=innerY+(innerH-total)/2;ctx.textAlign='left';
        lines.forEach((line,j)=>ctx.fillText(line,tx,startY+fontPx*.58+j*fontPx*1.15,availableW));if(d.sub){ctx.font=`${subPx}px ${fonts[d.font]||fonts.serif}`;ctx.fillText(d.sub,tx,startY+lines.length*fontPx*1.15+subPx*.55,availableW);}
      }else{
        const measure=ctx.measureText(d.name||'').width,subW=d.sub?(ctx.font=`${subPx}px ${fonts[d.font]||fonts.serif}`,ctx.measureText(d.sub).width):0;ctx.font=`600 ${fontPx}px ${fonts[d.font]||fonts.serif}`;
        const textW=Math.min(innerW,Math.max(measure,subW)),fit=Math.min(1,innerW/Math.max(1,textW)),effectiveFont=fontPx*fit;ctx.font=`600 ${effectiveFont}px ${fonts[d.font]||fonts.serif}`;
        const lines=wrapText(ctx,d.name,innerW),textH=lines.length*effectiveFont*1.12+(d.sub?subPx*1.2:0),imageH=innerH*ratio,gap=Math.min(innerH*.04,18),groupH=Math.min(innerH,imageH+gap+textH),start=innerY+(d.align==='top'?0:d.align==='bottom'?innerH-groupH:(innerH-groupH)/2);
        if(image){const fit=Math.min(innerW*.96/image.naturalWidth,Math.max(1,imageH-gap)*.96/image.naturalHeight),iw=image.naturalWidth*fit,ih=image.naturalHeight*fit;ctx.drawImage(image,innerX+(innerW-iw)/2,start+(imageH-ih)/2,iw,ih);}
        ctx.textAlign='center';const textStart=start+imageH+gap+(textH-(lines.length*effectiveFont*1.12+(d.sub?subPx*1.2:0)))/2;lines.forEach((line,j)=>ctx.fillText(line,innerX+innerW/2,textStart+effectiveFont*.58+j*effectiveFont*1.12,innerW));if(d.sub){ctx.font=`${subPx}px ${fonts[d.font]||fonts.serif}`;ctx.fillText(d.sub,innerX+innerW/2,textStart+lines.length*effectiveFont*1.12+subPx*.55,innerW);}
      }
    });
    downloadUrl(canvas.toDataURL('image/png'),'廚房工具_A4.png');toast('A4 PNG 已下載（300 dpi 尺寸）');
  }
  function snapshot(){return {orientation:$('orientation').value,template:$('template').value,cols:Number($('cols').value),rows:Number($('rows').value),marginX:Number($('marginX').value),marginY:Number($('marginY').value),gapX:Number($('gapX').value),gapY:Number($('gapY').value),cells:cells.map(c=>c.data?{...c.data}:null)};}
  function restore(data){
    if(!data)return;const template=templates[data.template]?data.template:'custom';$('template').value=template;$('orientation').value=data.orientation==='landscape'?'landscape':'portrait';$('cols').value=data.cols||3;$('rows').value=data.rows||6;
    ['marginX','marginY','gapX','gapY'].forEach(key=>{if(Number.isFinite(Number(data[key])))$(key).value=data[key];});active=0;renderPaper(false);(data.cells||[]).slice(0,cells.length).forEach((value,index)=>{cells[index].data=value?{...defaultCell(),...value}:null;});drawAll();selectCell(0);toast('已恢復這組標籤版面');
  }
  function bind(){
    buildLibrary();
    $('template').addEventListener('change',()=>{if($('template').value==='custom'){$('orientation').disabled=false;$('cols').value=3;$('rows').value=6;$('marginX').value=6;$('marginY').value=8;$('gapX').value=3;$('gapY').value=3;}renderPaper();document.body.classList.toggle('landscape-print',$('orientation').value==='landscape');});
    ['orientation','cols','rows','marginX','marginY','gapX','gapY'].forEach(id=>$(id).addEventListener('input',()=>{if($('template').value!=='custom')$('template').value='custom';renderPaper();}));
    $('librarySearch').addEventListener('input',applyFilters);$('libraryCategory').addEventListener('change',applyFilters);
    document.addEventListener('kitchen-catalog-updated',applyFilters);
    ['name','sub','font','size','color','bg','imageRatio','direction','align','borderColor','borderWidth','inset','offsetX','offsetY','widthAdjust','heightAdjust'].forEach(id=>$(id).addEventListener('input',()=>{const el=$(id);updateActive(id,el.type==='number'?Number(el.value):el.value);if(id==='imageRatio')$('ratioValue').textContent=`${el.value}%`;if(id==='bg'&&window.rememberKitchenColor)window.rememberKitchenColor(el.value);}));
    const TEXT_KEY='kitchenLabelTextLibrary';
    function renderTextLibrary(){const root=$('textLibrary');if(!root)return;const entries=JSON.parse(localStorage.getItem(TEXT_KEY)||'[]');root.innerHTML='';entries.forEach((entry,index)=>{const row=document.createElement('div');row.className='text-library-entry';const use=document.createElement('button');use.type='button';use.className='text-library-use';use.textContent=entry.name+(entry.sub?`｜${entry.sub}`:'');use.title='套用此文字';use.addEventListener('click',()=>{updateActive('name',entry.name);updateActive('sub',entry.sub||'');selectCell(active);toast('已套用文字庫內容');});const del=document.createElement('button');del.type='button';del.className='text-library-delete';del.textContent='移除';del.addEventListener('click',()=>{const list=JSON.parse(localStorage.getItem(TEXT_KEY)||'[]');list.splice(index,1);localStorage.setItem(TEXT_KEY,JSON.stringify(list));renderTextLibrary();});row.append(use,del);root.append(row);});if(!entries.length)root.textContent='尚無文字，輸入名稱後可收錄。';}
    $('saveText').addEventListener('click',()=>{const name=$('name').value.trim(),sub=$('sub').value.trim();if(!name){toast('請先輸入標籤名稱');return;}const list=JSON.parse(localStorage.getItem(TEXT_KEY)||'[]');if(list.some(x=>x.name===name&&x.sub===sub)){toast('這組文字已在文字庫');return;}list.unshift({name,sub});localStorage.setItem(TEXT_KEY,JSON.stringify(list.slice(0,80)));renderTextLibrary();toast('已收錄至本機文字庫');});renderTextLibrary();
    $('borderOn').addEventListener('change',()=>updateActive('borderOn',$('borderOn').checked));
    $('showGuides').addEventListener('change',()=> $('paper').classList.toggle('guides-off',!$('showGuides').checked));
    document.querySelectorAll('[data-inset]').forEach(button=>button.addEventListener('click',()=>{const value=Number(button.dataset.inset);$('inset').value=value;updateActive('inset',value);}));
    $('clear').addEventListener('click',()=>{if(active<0)return;cells[active].data=null;renderCell(active);selectCell(active);toast('已清除此格');});
    $('copyStyle').addEventListener('click',()=>{if(active<0||!cells[active].data)return;const source=cells[active].data,styleKeys=['font','size','color','bg','imageRatio','direction','align','borderOn','borderColor','borderWidth','inset'];const targets=$('copyTo').value==='all'?cells.map((_,i)=>i):[active+1];targets.forEach(i=>{if(!cells[i])return;const next=cells[i].data||defaultCell();styleKeys.forEach(key=>next[key]=source[key]);cells[i].data=next;renderCell(i);});toast('已複製外觀設定');});
    $('upload').addEventListener('change',event=>{const file=event.target.files?.[0];if(!file||active<0)return;const reader=new FileReader();reader.onload=()=>{const current=cells[active].data||defaultCell();current.image=String(reader.result);current.imageName=file.name;current.name=current.name||file.name.replace(/\.[^.]+$/,'');cells[active].data=current;renderCell(active);selectCell(active);toast('此格插畫已替換');};reader.readAsDataURL(file);event.target.value='';});
    $('editCatalog').addEventListener('click',()=>window.open('../kitchen-illustration/','_blank','noopener'));
    $('png').addEventListener('click',exportPng);$('print').addEventListener('click',()=>{if(layout.invalid){toast('版面超出 A4，請先修正');return;}document.body.classList.toggle('landscape-print',$('orientation').value==='landscape');window.print();});
    $('orientation').addEventListener('change',()=>{document.body.classList.toggle('landscape-print',$('orientation').value==='landscape');});
    renderPaper(false);window.useKitchenTool=useTool;window.kitchenCells=cells;window.getKitchenSnapshot=snapshot;window.restoreKitchenSnapshot=restore;window.kitchenLayout=()=>({...layout});
    window.addEventListener('storage',()=>applyFilters());
  }
  document.addEventListener('DOMContentLoaded',bind);
})();
