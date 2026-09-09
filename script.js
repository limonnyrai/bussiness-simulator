const initial={money:100000,day:1,rep:10,business:null,employees:0,upgrades:{office:0,ads:0,tech:0},log:["Компания создана. У тебя есть 100 000 ₽."]};
let state=JSON.parse(localStorage.getItem("businessEmpire")||"null")||structuredClone(initial);

const businesses=[
 {id:"cafe",name:"Кофейня",icon:"☕",cost:50000,base:900,desc:"Небольшая уютная кофейня."},
 {id:"shop",name:"Магазин",icon:"🛒",cost:80000,base:1450,desc:"Розничная торговля товарами."},
 {id:"studio",name:"IT-студия",icon:"💻",cost:120000,base:2300,desc:"Разработка сайтов и приложений."},
 {id:"delivery",name:"Доставка",icon:"🚚",cost:160000,base:3300,desc:"Служба быстрой доставки."}
];
const upgrades=[
 {id:"office",name:"Расширение офиса",desc:"Каждый уровень: +15% к доходу.",base:25000,max:10},
 {id:"ads",name:"Реклама",desc:"Каждый уровень: +10% к доходу и +2 репутации.",base:18000,max:10},
 {id:"tech",name:"Новые технологии",desc:"Каждый уровень: +500 ₽ к доходу.",base:35000,max:8}
];

const money=n=>Math.round(n).toLocaleString("ru-RU")+" ₽";
function income(){
 if(!state.business)return 0;
 const b=businesses.find(x=>x.id===state.business);
 const mult=1+state.upgrades.office*.15+state.upgrades.ads*.10;
 return Math.round((b.base+state.upgrades.tech*500)*(1+state.employees*.08)*mult);
}
function save(){localStorage.setItem("businessEmpire",JSON.stringify(state))}
function addLog(t){state.log.unshift(t);state.log=state.log.slice(0,30)}
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
function render(){
 document.getElementById("money").textContent=money(state.money);
 document.getElementById("heroMoney").textContent=money(state.money);
 document.getElementById("income").textContent=money(income());
 document.getElementById("rep").textContent=state.rep;
 document.getElementById("employees").textContent=state.employees;
 document.getElementById("dayLabel").textContent="День "+state.day;
 document.getElementById("businesses").innerHTML=businesses.map(b=>`
  <div class="business ${state.business===b.id?"active":""}" data-business="${b.id}">
   <div class="business-title"><span>${b.icon} ${b.name}</span>${state.business===b.id?'<span class="badge">ТВОЙ</span>':''}</div>
   <div class="business-desc">${b.desc}</div>
   <div class="business-price">${state.business===b.id?money(b.base)+" база / день":"Купить за "+money(b.cost)}</div>
  </div>`).join("");
 document.querySelectorAll("[data-business]").forEach(el=>el.onclick=()=>buyBusiness(el.dataset.business));
 document.getElementById("upgrades").innerHTML=upgrades.map(u=>{
  const lvl=state.upgrades[u.id],price=Math.round(u.base*Math.pow(1.55,lvl));
  return `<div class="upgrade"><h3>${u.name} · ур. ${lvl}/${u.max}</h3><p>${u.desc}</p>
  <button data-up="${u.id}" ${lvl>=u.max||state.money<price?"disabled":""}>${lvl>=u.max?"Максимум":"Купить · "+money(price)}</button></div>`
 }).join("");
 document.querySelectorAll("[data-up]").forEach(el=>el.onclick=()=>upgrade(el.dataset.up));
 document.getElementById("employeeInfo").innerHTML=state.employees
 ? `<div><strong>${state.employees}</strong><div>сотрудников в штате</div></div><div>+${state.employees*8}% к доходу</div>`
 : `<div><strong>Пока никого нет</strong><div>Найми первого сотрудника.</div></div><div>+0% к доходу</div>`;
 document.getElementById("log").innerHTML=state.log.map(x=>`<div class="event">${x}</div>`).join("");
 save();
}
function buyBusiness(id){
 const b=businesses.find(x=>x.id===id);
 if(state.business===id){toast("Этот бизнес уже у тебя");return}
 if(state.business){toast("Сначала развивай текущий бизнес");return}
 if(state.money<b.cost){toast("Недостаточно денег");return}
 state.money-=b.cost;state.business=id;state.rep+=5;
 addLog(`🏢 Куплен бизнес: <b>${b.name}</b> за ${money(b.cost)}.`);
 toast("Бизнес куплен!");
 render();
}
function upgrade(id){
 const u=upgrades.find(x=>x.id===id),lvl=state.upgrades[id],price=Math.round(u.base*Math.pow(1.55,lvl));
 if(lvl>=u.max||state.money<price)return;
 state.money-=price;state.upgrades[id]++;
 if(id==="ads")state.rep+=2;
 addLog(`📈 Улучшение <b>${u.name}</b> повышено до уровня ${lvl+1}.`);
 toast("Улучшение куплено!");
 render();
}
document.getElementById("workBtn").onclick=()=>{
 if(!state.business){toast("Сначала купи бизнес");return}
 const earn=income();
 state.money+=earn;state.day++;state.rep+=Math.random()<.25?1:0;
 addLog(`💼 День ${state.day-1} завершён: прибыль <b>+${money(earn)}</b>.`);
 toast(`Прибыль +${money(earn)}`);
 render();
};
document.getElementById("hireBtn").onclick=()=>{
 if(!state.business){toast("Сначала купи бизнес");return}
 const price=Math.round(12000*Math.pow(1.35,state.employees));
 if(state.money<price){toast(`Нужно ${money(price)}`);return}
 state.money-=price;state.employees++;
 addLog(`👤 Нанят новый сотрудник за <b>${money(price)}</b>.`);
 toast("Сотрудник нанят!");
 render();
};
document.getElementById("resetBtn").onclick=()=>{
 if(confirm("Удалить весь прогресс?")){state=structuredClone(initial);render();toast("Прогресс сброшен")}
};
render();
