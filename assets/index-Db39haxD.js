var P=Object.defineProperty;var J=(t,e,s)=>e in t?P(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var b=(t,e,s)=>J(t,typeof e!="symbol"?e+"":e,s);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function s(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=s(r);fetch(r.href,o)}})();class M{constructor(){b(this,"jobs",new Map)}generateJobId(){return`job-${Date.now()}-${Math.random().toString(36).substr(2,9)}`}createJob(e,s=30*60*1e3){const n={id:this.generateJobId(),prompt:e,status:"pending",progress:0,startTime:Date.now(),estimatedDuration:s};return this.jobs.set(n.id,n),this.startProcessing(n.id),n}startProcessing(e){const s=this.jobs.get(e);if(!s)return;s.status="processing";const n=s.estimatedDuration>=30*60*1e3?1e4:Math.min(s.estimatedDuration,2e3),r=setInterval(()=>{const o=Date.now()-s.startTime,i=Math.min(o/n*100,99);s.progress=Math.round(i),i>=99&&(clearInterval(r),this.completeJob(e))},400)}completeJob(e){const s=this.jobs.get(e);if(!s)return;const n=this.generateMockResponse(s.prompt);s.status="completed",s.progress=100,s.result=n}generateMockResponse(e){const s=e.toLowerCase();return s.includes("error")?{type:"error",title:"A draft issue appeared",body:"This is a mocked failure state to show how the UI handles a retry."}:s.includes("patient")||s.includes("chart")||s.includes("consult")||s.includes("note")||s.includes("clinical")?{type:"work",title:"Structured work card",body:"Here is a reviewable work card with a clear structure and next steps."}:s.includes("document")||s.includes("brief")||s.includes("proposal")?{type:"work",title:"Document draft",body:"Here is a practical work card for drafting or sharing with collaborators."}:{type:"text",title:"Text response",body:"A clear, friendly answer is ready. This mocked response focuses on clarity and usefulness rather than excess detail."}}getJob(e){return this.jobs.get(e)}getJobProgress(e){var s;return((s=this.getJob(e))==null?void 0:s.progress)??0}isJobComplete(e){var s;return((s=this.getJob(e))==null?void 0:s.status)==="completed"}clearJob(e){this.jobs.delete(e)}clearAllJobs(){this.jobs.clear()}}const k=new M,h="datax-auth";function T(){const t=window.localStorage.getItem(h);if(!t)return null;try{const e=JSON.parse(t);if(e!=null&&e.username&&(e!=null&&e.token))return e}catch{return null}return null}function $(){return T()!==null}function j(){var t;return((t=T())==null?void 0:t.username)??null}function F(t,e){return new Promise(s=>{window.setTimeout(()=>{if(!(t.trim().length>0&&e.trim().length>0)){s(!1);return}const r={username:t.trim(),token:btoa(`${t.trim()}:${Date.now()}`)};window.localStorage.setItem(h,JSON.stringify(r)),s(!0)},400)})}function H(){window.localStorage.removeItem(h)}const E=document.getElementById("authScreen"),L=document.getElementById("appShell"),S=document.getElementById("loginForm"),I=document.getElementById("loginUsername"),q=document.getElementById("loginPassword"),m=document.getElementById("loginError"),N=document.getElementById("userBadge"),O=document.getElementById("logoutButton"),f=document.getElementById("promptForm"),d=document.getElementById("promptInput"),l=document.getElementById("thread"),w=document.getElementById("conversationStream"),c=document.getElementById("detailCard"),R=document.getElementById("newChatButton"),g=document.getElementById("themeToggle"),U=Array.from(document.querySelectorAll(".pill-btn"));let a=null;function C(){a!==null&&(clearInterval(a),a=null),l.innerHTML="",c.classList.add("hidden"),c.classList.remove("is-visible"),c.innerHTML="",X(),d.value="",d.focus()}function X(){if(l.children.length>0)return;const t=document.createElement("div");t.className="empty-state",t.innerHTML=`
    <div class="empty-icon">✦</div>
    <h3>What would you like help with?</h3>
    <p>Ask for a reply, a draft, or a structured work card.</p>
  `,l.appendChild(t)}function K(){const t="Create a patient chart summary with today's key updates.",e=l.querySelector(".empty-state");e==null||e.remove(),u("user","You",t),u("assistant","DataX","Here is a concise summary with the latest updates and a review-ready work card."),p(x(t))}function B(t){document.documentElement.setAttribute("data-theme",t),g.textContent=t==="dark"?"🌙":"☀️",g.setAttribute("aria-label",t==="dark"?"Switch to light theme":"Switch to dark theme")}function W(){const e=window.localStorage.getItem("northstar-theme")??(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");B(e)}function v(){w.scrollTop=w.scrollHeight}function u(t,e,s){const n=document.createElement("article");n.className=`bubble ${t}`;const r=t==="user"?"User":"DataX";n.innerHTML=`
    <div class="bubble-meta" title="${t==="user"?"This is your prompt":"This is the DataX response"}">${r}</div>
    <h4>${e}</h4>
    <p>${s}</p>
  `,l.appendChild(n),v()}function p(t){c.classList.add("hidden"),c.classList.remove("is-visible"),c.innerHTML=t,window.requestAnimationFrame(()=>{c.classList.remove("hidden"),c.classList.add("is-visible"),v()})}function z(){const t=document.createElement("article");t.className="bubble assistant thinking",t.innerHTML=`
    <div class="bubble-meta" title="This is the DataX response">DataX reply</div>
    <h4>Assistant</h4>
    <div class="thinking-row" aria-live="polite">
      <span>Thinking carefully</span>
      <span class="thinking-dots" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
    </div>
  `,l.appendChild(t),v()}function y(t,e){const s=l.querySelectorAll(".bubble"),n=s[s.length-1];n!=null&&n.classList.contains("thinking")?(n.innerHTML=`
      <div class="bubble-meta" title="This is the DataX response">DataX reply</div>
      <h4>${t}</h4>
      <p>${e}</p>
    `,n.classList.remove("thinking")):u("assistant",t,e)}function Y(t){p(`
    <div class="card-top">
      <strong>Working on your request</strong>
      <span class="badge">Processing</span>
    </div>
    <div class="status-row"><span class="dot"></span> Preparing context</div>
    <div class="status-row"><span class="dot"></span> Running ML model</div>
    <div class="status-row"><span class="dot"></span> Polishing the response</div>
    <p class="background-note">${t?"This may take longer than usual. We’ll show the result as soon as it is ready.":"This should finish shortly."}</p>
    <div id="progressContainer" class="progress-container">
      <div class="progress-info">
        <span>${t?"Usually a few minutes":"Usually a few seconds"}</span>
        <span id="statusLabel">Starting up</span>
      </div>
      <div class="progress-bar">
        <div id="progressFill" class="progress-fill" style="width: 0%"></div>
      </div>
      <div class="progress-percent" id="progressPercent">0%</div>
    </div>
  `)}function Q(t){const e=document.getElementById("progressFill"),s=document.getElementById("progressPercent"),n=document.getElementById("statusLabel");if(e&&s&&n){const r=t.progress,o=r<30?"Starting up":r<70?"Running model":r<95?"Polishing output":"Finishing up";e.style.width=`${r}%`,s.textContent=`${r}%`,n.textContent=o}}function V(t){const e=t.toLowerCase().includes("error")?"The draft hit a snag. A short retry with clearer context will usually recover it.":"The request needs a bit more context to produce a reliable draft.";p(`
    <div class="card-top">
      <strong>We need a clearer prompt</strong>
      <span class="badge error">Needs refinement</span>
    </div>
    <p>${e}</p>
    <div class="work-grid">
      <div class="work-block">
        <strong>Try this instead</strong>
        <span>“Draft a clear summary with the main facts, next steps, and a short recommendation.”</span>
      </div>
    </div>
  `)}function _(t){a!==null&&clearInterval(a),a=window.setInterval(()=>{var s,n,r;const e=k.getJob(t);if(!e){a!==null&&(clearInterval(a),a=null);return}if(Q(e),e.status==="completed"){if(a!==null&&(clearInterval(a),a=null),((s=e.result)==null?void 0:s.type)==="error"){y(e.result.title,e.result.body),V(e.prompt);return}y(((n=e.result)==null?void 0:n.title)??"Response",((r=e.result)==null?void 0:r.body)??""),p(x(e.prompt))}},500)}function x(t){const e=t.toLowerCase(),s=e.includes("patient")||e.includes("chart")||e.includes("consult")||e.includes("note")||e.includes("clinical"),n=e.includes("document")||e.includes("brief")||e.includes("proposal");return s?`
      <div class="card-top">
        <strong>Clinical summary card</strong>
        <span class="badge success">Ready to review</span>
      </div>
      <p>A structured card is now available for quick review and handoff.</p>
      <div class="work-grid">
        <div class="work-block">
          <strong>Patient snapshot</strong>
          <span>Follow-up visit completed. Symptoms improved with continued monitoring.</span>
        </div>
        <div class="work-block">
          <strong>Key findings</strong>
          <span>Blood pressure stable, medication adherence improved, and no new concerns reported.</span>
        </div>
        <div class="work-block">
          <strong>Next steps</strong>
          <span>Recheck in one week and confirm medication plan.</span>
        </div>
      </div>
      <div class="meta-list">
        <span class="meta-chip">Chart-ready</span>
        <span class="meta-chip">Concise</span>
        <span class="meta-chip">Actionable</span>
      </div>
    `:n?`
      <div class="card-top">
        <strong>Document draft</strong>
        <span class="badge success">Draft prepared</span>
      </div>
      <p>The workspace has turned your prompt into a polished document outline.</p>
      <div class="work-grid">
        <div class="work-block">
          <strong>Overview</strong>
          <span>Clear objective, target audience, and a concise recommendation section.</span>
        </div>
        <div class="work-block">
          <strong>Suggested structure</strong>
          <span>Context, priorities, next actions, and owners.</span>
        </div>
      </div>
      <div class="meta-list">
        <span class="meta-chip">Structured</span>
        <span class="meta-chip">Review-friendly</span>
      </div>
    `:`
    <div class="card-top">
      <strong>Text response</strong>
      <span class="badge success">Delivered</span>
    </div>
    <p>The assistant drafted a clear answer that fits naturally into the conversation stream.</p>
    <div class="work-grid">
      <div class="work-block">
        <strong>Key takeaway</strong>
        <span>Your prompt was interpreted as a general request for a thoughtful, concise response.</span>
      </div>
    </div>
  `}function G(t){t.preventDefault();const e=d.value.trim();if(!e){d.focus();return}const s=l.querySelector(".empty-state");s==null||s.remove(),u("user","You",e),z();const n=e.toLowerCase(),r=n.includes("analyze")||n.includes("deep")||n.includes("comprehensive")||n.includes("detailed")||n.includes("model")||n.includes("train")||n.includes("optimize")||n.includes("process large")||n.includes("30 minutes")||n.includes("long running"),o=r?30*60*1e3:2e3,i=k.createJob(e,o);Y(r),_(i.id),f.reset()}g.addEventListener("click",()=>{const t=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";window.localStorage.setItem("northstar-theme",t),B(t)});S.addEventListener("submit",async t=>{t.preventDefault(),m.textContent="";const e=I.value.trim(),s=q.value.trim();if(!await F(e,s)){m.textContent="Enter a valid username and password.";return}D()});O.addEventListener("click",()=>{H(),A()});function D(){E.classList.add("hidden"),L.classList.remove("hidden");const t=j();N.textContent=t?`Signed in as ${t}`:"Signed in",C(),K()}function A(){E.classList.remove("hidden"),L.classList.add("hidden"),m.textContent="",S.reset(),I.focus()}function Z(){W(),$()?D():A()}Z();U.forEach(t=>{t.addEventListener("click",()=>{d.value=t.dataset.prompt??"",d.focus()})});d.addEventListener("keydown",t=>{t.key==="Enter"&&!t.shiftKey&&(t.preventDefault(),f.requestSubmit())});R.addEventListener("click",()=>{C()});f.addEventListener("submit",G);
