import{v as a}from"./variables.DoEvt7x1.js";const i=document.getElementById("var-input"),d=document.getElementById("add-var-btn"),r=document.querySelector("#var-list ul"),u=document.getElementById("var-empty");function m(e,t){const l=document.createElement("template");l.innerHTML=`
      <li class="item-content">
        <div class="item-inner">
          <div class="item-title"></div>
          <div class="item-after">
            <a class="link" data-action="delete">Delete</a>
          </div>
        </div>
      </li>`;const n=l.content.firstElementChild;return n.dataset.id=t,n.querySelector(".item-title").textContent=e,n.querySelector('[data-action="delete"]').setAttribute("aria-label",`Delete ${e}`),n}function v(){const e=a.get();u.style.display=e.length?"none":"",r.replaceChildren(...e.map(t=>m(t.name,t.id)))}a.subscribe(v);function s(){d.disabled=i.value.trim().length===0}i.addEventListener("input",s);function c(){const e=i.value.trim();e&&(a.set([...a.get(),{id:crypto.randomUUID(),name:e}]),i.value="",s(),i.focus())}d.addEventListener("click",c);i.addEventListener("keydown",e=>{e.key==="Enter"&&c()});r.addEventListener("click",e=>{const t=e.target;if(t.dataset.action!=="delete")return;const n=t.closest("li")?.dataset.id;n&&a.set(a.get().filter(o=>o.id!==n))});
