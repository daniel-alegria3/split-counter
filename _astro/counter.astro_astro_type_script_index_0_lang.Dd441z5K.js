import{p,v as a}from"./variables.DoEvt7x1.js";const i=p("counts",{}),l=document.querySelector("#counter-list ul"),m=document.getElementById("counter-empty"),d=document.getElementById("download-csv-btn");function v(t,c,e){const s=document.createElement("template");s.innerHTML=`
      <li class="item-content">
        <div class="item-inner">
          <div class="item-title"></div>
          <div class="item-after">
            <div class="stepper stepper-small stepper-round stepper-fill">
              <div class="stepper-button-minus" data-action="dec"></div>
              <div class="stepper-input-wrap"><span></span></div>
              <div class="stepper-button-plus" data-action="inc"></div>
            </div>
          </div>
        </div>
      </li>`;const n=s.content.firstElementChild;n.dataset.id=e,n.querySelector(".item-title").textContent=t,n.querySelector(".stepper-input-wrap span").textContent=String(c);const o=n.querySelector('[data-action="dec"]'),r=n.querySelector('[data-action="inc"]');return o.setAttribute("aria-label",`Decrement ${t}`),r.setAttribute("aria-label",`Increment ${t}`),n}function u(){const t=a.get(),c=i.get();m.style.display=t.length?"none":"",d.disabled=t.length===0,l.replaceChildren(...t.map(e=>v(e.name,c[e.id]?.length??0,e.id)))}a.subscribe(u);i.subscribe(u);l.addEventListener("click",t=>{const c=t.target.closest("[data-action]"),e=c?.dataset.action;if(e!=="inc"&&e!=="dec")return;const n=c.closest("li")?.dataset.id;if(!n)return;const o=i.get(),r=o[n]??[];if(e==="inc")i.set({...o,[n]:[...r,new Date().toISOString()]});else{if(r.length===0)return;i.set({...o,[n]:r.slice(0,-1)})}});function b(t){return/[",\n\r]/.test(t)?`"${t.replace(/"/g,'""')}"`:t}function f(){const t=a.get(),c=i.get(),e=[["variable","timestamp"]];for(const s of t)for(const n of c[s.id]??[])e.push([s.name,n]);return e.map(s=>s.map(b).join(",")).join(`
`)}d.addEventListener("click",()=>{const t=f(),c=new Blob([t],{type:"text/csv;charset=utf-8"}),e=URL.createObjectURL(c),s=document.createElement("a"),n=new Date().toISOString().replace(/[:.]/g,"-");s.href=e,s.download=`split-counter-${n}.csv`,s.className="external",s.click(),URL.revokeObjectURL(e)});
