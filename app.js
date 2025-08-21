
const state = {
  data: null,
  active: 'all',
  view: 'k', // or 'cop'
  search: ''
};

function priceToText(p){
  if(state.view==='cop'){
    const val = (p*1000).toLocaleString('es-CO', {style:'currency', currency:'COP', maximumFractionDigits:0});
    return val;
  }
  return `$${p}k`;
}

async function loadMenu(){
  const res = await fetch('data/menu.json');
  const data = await res.json();
  state.data = data;
  if(data.displayStyle){ state.view = data.displayStyle; }
  renderCategories();
  renderGallery();
  document.querySelector('#updated').textContent = data.lastUpdated || '';
}

function renderCategories(){
  const root = document.querySelector('#categories');
  root.innerHTML = '';
  if(!state.data) return;

  const tags = document.querySelector('#tagbar');
  tags.innerHTML = '';
  const allTag = document.createElement('div');
  allTag.className = 'tag' + (state.active==='all' ? ' active' : '');
  allTag.textContent = 'Todo';
  allTag.onclick = ()=>{state.active='all'; renderCategories();};
  tags.appendChild(allTag);

  for(const cat of state.data.categories){
    const tag = document.createElement('div');
    tag.className = 'tag' + (state.active===cat.id ? ' active' : '');
    tag.textContent = cat.title;
    tag.onclick = ()=>{state.active=cat.id; renderCategories();};
    tags.appendChild(tag);
  }

  const filteredCats = state.active==='all' ? state.data.categories : state.data.categories.filter(c=>c.id===state.active);
  for(const cat of filteredCats){
    const section = document.createElement('section');
    section.className = 'category card';
    const h2 = document.createElement('h2');
    h2.textContent = cat.title;
    section.appendChild(h2);

    const list = document.createElement('div');
    list.className = 'items';

    const query = state.search.trim().toLowerCase();
    for(const it of cat.items){
      if(query && !(`${it.name} ${it.note||''}`.toLowerCase().includes(query))) continue;
      const row = document.createElement('div');
      row.className = 'item';
      const left = document.createElement('div');
      const nm = document.createElement('div');
      nm.className = 'name';
      nm.textContent = it.name;
      left.appendChild(nm);
      if(it.note){
        const note = document.createElement('div');
        note.className = 'note';
        note.textContent = it.note;
        left.appendChild(note);
      }
      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = priceToText(it.price_k);
      row.appendChild(left);
      row.appendChild(price);
      list.appendChild(row);
    }
    section.appendChild(list);
    root.appendChild(section);
  }
}

function renderGallery(){
  const g = document.querySelector('#gallery');
  g.innerHTML = '';
  const imgs = ['assets/menu-1.png', 'assets/menu-2.png'];
  for(const src of imgs){
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Carta del restaurante';
    g.appendChild(img);
  }
}

function installHandlers(){
  document.querySelector('#search').addEventListener('input', (e)=>{state.search=e.target.value; renderCategories();});
  document.querySelector('#view').addEventListener('change', (e)=>{state.view=e.target.value; renderCategories();});
}

window.addEventListener('DOMContentLoaded', ()=>{
  installHandlers();
  loadMenu();
});
