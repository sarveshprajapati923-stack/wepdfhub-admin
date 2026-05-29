// ============================================================
// WePDFHub — AI SEO Module
// Existing admin panel mein inject hota hai
// Firebase Firestore + OpenRouter API
// ============================================================

(function() {
'use strict';

// ============================================================
// CONFIG — APNI API KEY YAHAN PASTE KARO
// ============================================================
const SEO_CONFIG = {
  openrouterKey: "YOUR_OPENROUTER_API_KEY",
  geminiKey:     "YOUR_GEMINI_API_KEY", // ← Google AI Studio se lo
  apiProvider:   "gemini",              // "gemini" ya "openrouter"
  defaultModel:  "gemini-2.0-flash",
  siteUrl:       "https://wepdfhub.click",
  siteName:      "WePDFHub"
};

// OpenRouter models
const OR_MODELS = [
  { id: "deepseek/deepseek-chat",            label: "DeepSeek Chat (Fast)" },
  { id: "qwen/qwen-2.5-72b-instruct",        label: "Qwen 2.5 72B" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
  { id: "mistralai/mistral-7b-instruct",     label: "Mistral 7B" },
  { id: "google/gemma-3-27b-it:free",        label: "Gemma 3 27B (Free)" }
];

// Gemini models
const GEMINI_MODELS = [
  { id: "gemini-2.0-flash",         label: "Gemini 2.0 Flash (Fast ⚡)" },
  { id: "gemini-2.0-flash-lite",    label: "Gemini 2.0 Flash Lite (Free 🆓)" },
  { id: "gemini-1.5-flash",         label: "Gemini 1.5 Flash" },
  { id: "gemini-1.5-pro",           label: "Gemini 1.5 Pro (Best 🏆)" },
];

const MODELS = [...GEMINI_MODELS, ...OR_MODELS];

// ============================================================
// STYLES INJECT
// ============================================================
const CSS = `
.seo-page { display:none; }
.seo-page.active { display:block; }

/* SEO CARDS */
.seo-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:13px; margin-bottom:20px; }
.seo-stat { background:var(--card); border:1px solid var(--bdr); border-radius:12px; padding:17px; transition:all .2s; }
.seo-stat:hover { transform:translateY(-2px); border-color:var(--bdr2); }
.seo-stat-icon { font-size:20px; margin-bottom:10px; }
.seo-stat-val { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; line-height:1; margin-bottom:3px; }
.seo-stat-lbl { font-size:11px; color:var(--txt2); }
.seo-stat-chg { margin-top:8px; font-size:11px; font-weight:500; color:var(--grn); }

/* BLOG LIST */
.blog-table { width:100%; border-collapse:collapse; }
.blog-table th { text-align:left; font-size:10px; color:var(--txt2); font-weight:700; letter-spacing:.7px; text-transform:uppercase; padding:10px 17px; border-bottom:1px solid var(--bdr); background:rgba(255,255,255,.01); }
.blog-table td { padding:12px 17px; font-size:13px; border-bottom:1px solid rgba(31,36,53,.5); vertical-align:middle; }
.blog-table tr:last-child td { border-bottom:none; }
.blog-table tr:hover td { background:rgba(255,255,255,.015); }

/* GENERATOR */
.gen-form { display:grid; grid-template-columns:1fr 1fr; gap:13px; }
.gen-form .full { grid-column:1/-1; }
.gen-label { font-size:11px; color:var(--txt2); font-weight:600; letter-spacing:.3px; margin-bottom:4px; }
.gen-input, .gen-select, .gen-textarea {
  width:100%; background:var(--sur); border:1px solid var(--bdr2);
  border-radius:8px; color:var(--txt); font-size:13px;
  padding:9px 11px; outline:none; transition:border .2s;
  font-family:'DM Sans',sans-serif;
}
.gen-input:focus, .gen-select:focus, .gen-textarea:focus { border-color:var(--red); }
.gen-textarea { resize:vertical; min-height:70px; }
.gen-select option { background:var(--card); }

/* AI OUTPUT */
.ai-output-box {
  background:var(--bg); border:1px solid var(--bdr2);
  border-radius:10px; padding:18px; margin-top:15px;
  font-size:13px; line-height:1.8; color:var(--txt);
  max-height:500px; overflow-y:auto; display:none;
  white-space:pre-wrap;
}
.ai-output-box.show { display:block; }

/* KEYWORD TABLE */
.kw-chip {
  display:inline-block; padding:3px 10px;
  background:rgba(59,130,246,.12); color:var(--blu);
  border:1px solid rgba(59,130,246,.25);
  border-radius:20px; font-size:11.5px; font-weight:500;
  margin:3px; cursor:pointer; transition:all .15s;
}
.kw-chip:hover { background:rgba(59,130,246,.25); }
.kw-chip.high { background:rgba(232,64,64,.1); color:var(--red); border-color:rgba(232,64,64,.25); }
.kw-chip.med  { background:rgba(245,166,35,.1); color:var(--gold); border-color:rgba(245,166,35,.25); }
.kw-chip.low  { background:rgba(34,197,94,.1); color:var(--grn); border-color:rgba(34,197,94,.25); }

/* PROGRESS BAR */
.ai-progress { display:none; margin-top:12px; }
.ai-progress.show { display:block; }
.progress-bar { height:4px; background:var(--bdr); border-radius:10px; overflow:hidden; margin-top:6px; }
.progress-fill { height:100%; background:linear-gradient(90deg,var(--red),var(--org)); border-radius:10px; animation:prog 2s ease infinite alternate; }
@keyframes prog { from{width:20%} to{width:90%} }
.progress-text { font-size:12px; color:var(--txt2); margin-top:5px; }

/* SEO SCORE CIRCLE */
.seo-score-wrap { display:flex; align-items:center; gap:16px; }
.score-ring { position:relative; width:80px; height:80px; }
.score-ring svg { transform:rotate(-90deg); }
.score-num { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-family:'Syne',sans-serif; font-size:18px; font-weight:800; }

/* TABS */
.seo-tabs { display:flex; gap:4px; margin-bottom:18px; background:var(--sur); border-radius:10px; padding:4px; border:1px solid var(--bdr); }
.seo-tab { padding:8px 16px; border-radius:7px; font-size:12.5px; font-weight:500; cursor:pointer; color:var(--txt2); transition:all .15s; border:none; background:transparent; }
.seo-tab.active { background:var(--card); color:var(--txt); border:1px solid var(--bdr2); }
.seo-tab-pane { display:none; }
.seo-tab-pane.active { display:block; }

/* SCHEDULE TOGGLE */
.toggle-wrap { display:flex; align-items:center; gap:10px; }
.toggle { position:relative; width:40px; height:22px; }
.toggle input { opacity:0; width:0; height:0; }
.toggle-slider { position:absolute; inset:0; background:var(--bdr2); border-radius:22px; cursor:pointer; transition:.3s; }
.toggle-slider:before { content:''; position:absolute; width:16px; height:16px; left:3px; bottom:3px; background:white; border-radius:50%; transition:.3s; }
.toggle input:checked + .toggle-slider { background:var(--red); }
.toggle input:checked + .toggle-slider:before { transform:translateX(18px); }

/* BULK GEN */
.bulk-item { background:var(--card2); border:1px solid var(--bdr); border-radius:8px; padding:12px 15px; margin-bottom:8px; display:flex; align-items:center; gap:10px; }
.bulk-item .bi-title { flex:1; font-size:13px; font-weight:500; }
.bulk-item .bi-status { font-size:11px; }

/* RESPONSIVE */
@media(max-width:900px) { .seo-stat-grid { grid-template-columns:repeat(2,1fr); } .gen-form { grid-template-columns:1fr; } }
`;

function injectStyles() {
  const s = document.createElement('style');
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ============================================================
// SIDEBAR — Existing sidebar mein add karo
// ============================================================
function injectSidebar() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const seoNav = document.createElement('div');
  seoNav.innerHTML = `
    <div class="nl">🤖 AI SEO</div>
    <div class="ni" onclick="SEO.show('seo-dashboard',this)"><span class="ic">📊</span> SEO Dashboard</div>
    <div class="ni" onclick="SEO.show('ai-blogs',this)"><span class="ic">✍️</span> AI Blogs <span class="nb" id="blogCount">0</span></div>
    <div class="ni" onclick="SEO.show('keywords',this)"><span class="ic">🔑</span> Keywords</div>
    <div class="ni" onclick="SEO.show('auto-publish',this)"><span class="ic">⚡</span> Auto Publish</div>
    <div class="ni" onclick="SEO.show('seo-analytics',this)"><span class="ic">📈</span> SEO Analytics</div>
    <div class="ni" onclick="SEO.show('seo-settings',this)"><span class="ic">⚙️</span> SEO Settings</div>
  `;
  nav.appendChild(seoNav);
}

// ============================================================
// PAGES HTML INJECT — Existing content div mein add karo
// ============================================================
function injectPages() {
  const content = document.querySelector('.content');
  if (!content) return;

  const pages = document.createElement('div');
  pages.id = 'seoPages';
  pages.innerHTML = `

  <!-- SEO DASHBOARD -->
  <div class="seo-page" id="page-seo-dashboard">
    <div class="seo-stat-grid">
      <div class="seo-stat"><div class="seo-stat-icon">✍️</div><div class="seo-stat-val" id="ss-blogs">0</div><div class="seo-stat-lbl">Blogs Generated</div><div class="seo-stat-chg">Firebase se live</div></div>
      <div class="seo-stat"><div class="seo-stat-icon">🔑</div><div class="seo-stat-val" id="ss-kw">0</div><div class="seo-stat-lbl">Keywords Tracked</div><div class="seo-stat-chg">Research se</div></div>
      <div class="seo-stat"><div class="seo-stat-icon">🌐</div><div class="seo-stat-val" id="ss-pages">0</div><div class="seo-stat-lbl">SEO Pages</div><div class="seo-stat-chg">Auto generated</div></div>
      <div class="seo-stat"><div class="seo-stat-icon">🤖</div><div class="seo-stat-val" id="ss-api">0</div><div class="seo-stat-lbl">API Calls</div><div class="seo-stat-chg">This month</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 300px;gap:16px">
      <div class="card">
        <div class="ch"><div class="ct">Recent Blogs</div><span class="ca" onclick="SEO.show('ai-blogs',null)">All →</span></div>
        <div id="recentBlogsTable"><div class="empty"><div class="ei">⏳</div><div class="et">Loading...</div></div></div>
      </div>
      <div class="card">
        <div class="ch"><div class="ct">SEO Score</div></div>
        <div class="cb" style="text-align:center">
          <div style="font-size:48px;margin-bottom:8px">🎯</div>
          <div style="font-family:'Syne',sans-serif;font-size:42px;font-weight:800;color:var(--grn)" id="seoScore">—</div>
          <div style="font-size:12px;color:var(--txt2);margin-top:4px">Overall SEO Score</div>
          <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px" id="seoChecklist"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- AI BLOGS -->
  <div class="seo-page" id="page-ai-blogs">
    <div class="seo-tabs">
      <button class="seo-tab active" onclick="SEO.switchTab('blog','generate',this)">✨ Generate</button>
      <button class="seo-tab" onclick="SEO.switchTab('blog','bulk',this)">📦 Bulk Generate</button>
      <button class="seo-tab" onclick="SEO.switchTab('blog','list',this)">📋 All Blogs</button>
    </div>

    <!-- GENERATE TAB -->
    <div class="seo-tab-pane active" id="blog-tab-generate">
      <div class="card">
        <div class="ch"><div class="ct">✨ AI Blog Generator</div><span style="font-size:11px;color:var(--txt2)">Gemini / OpenRouter API</span></div>
        <div class="cb">
          <div class="gen-form">
            <div style="display:flex;flex-direction:column;gap:4px">
              <div class="gen-label">Topic *</div>
              <input class="gen-input" id="blogTopic" placeholder="e.g. How to compress PDF without quality loss" />
            </div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <div class="gen-label">Focus Keyword *</div>
              <input class="gen-input" id="blogKeyword" placeholder="e.g. compress PDF online free" />
            </div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <div class="gen-label">Secondary Keywords</div>
              <input class="gen-input" id="blogSecKw" placeholder="e.g. reduce PDF size, PDF compressor" />
            </div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <div class="gen-label">AI Model</div>
              <select class="gen-select" id="blogModel">
                ${MODELS.map(m=>`<option value="${m.id}" ${m.id===SEO_CONFIG.defaultModel?'selected':''}>${m.label}</option>`).join('')}
              </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <div class="gen-label">Word Count</div>
              <select class="gen-select" id="blogWords">
                <option value="1500">1500+ words</option>
                <option value="2000" selected>2000+ words</option>
                <option value="2500">2500+ words</option>
                <option value="3000">3000+ words</option>
              </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <div class="gen-label">Content Tone</div>
              <select class="gen-select" id="blogTone">
                <option>Informative</option>
                <option>Conversational</option>
                <option>Professional</option>
                <option>Beginner-friendly</option>
              </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;grid-column:1/-1">
              <div class="gen-label">Internal Links (comma separated URLs)</div>
              <input class="gen-input" id="blogLinks" placeholder="https://wepdfhub.click/merge-pdf, https://wepdfhub.click/compress-pdf" />
            </div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <div class="gen-label">Status</div>
              <select class="gen-select" id="blogStatus">
                <option value="draft">💾 Save as Draft</option>
                <option value="published">🚀 Publish Immediately</option>
                <option value="scheduled">📅 Schedule</option>
              </select>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px" id="scheduleWrap">
              <div class="gen-label">Schedule Date</div>
              <input type="datetime-local" class="gen-input" id="blogSchedule" />
            </div>
            <div style="grid-column:1/-1;display:flex;gap:10px;margin-top:4px">
              <button class="btn btn-red" onclick="SEO.generateBlog()" id="genBtn">🤖 Generate Blog</button>
              <button class="btn btn-ghost" onclick="SEO.clearBlogForm()">✕ Clear</button>
            </div>
          </div>
          <div class="ai-progress" id="genProgress">
            <div class="progress-text" id="genProgressText">🤖 AI likh raha hai...</div>
            <div class="progress-bar"><div class="progress-fill"></div></div>
          </div>
          <div class="ai-output-box" id="blogOutput"></div>
          <div id="blogActions" style="display:none;margin-top:12px;display:none;gap:10px">
            <button class="btn btn-grn" onclick="SEO.saveBlog()">💾 Save to Firebase</button>
            <button class="btn btn-ghost" onclick="SEO.copyBlog()">📋 Copy</button>
            <button class="btn btn-blu" onclick="SEO.exportBlogHTML()">📄 Export HTML</button>
          </div>
        </div>
      </div>
    </div>

    <!-- BULK TAB -->
    <div class="seo-tab-pane" id="blog-tab-bulk">
      <div class="card">
        <div class="ch"><div class="ct">📦 Bulk Blog Generator</div></div>
        <div class="cb">
          <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:14px">
            <div class="gen-label">Topics (ek line mein ek topic)</div>
            <textarea class="gen-textarea" id="bulkTopics" placeholder="How to merge PDF files&#10;Best PDF compressor online&#10;Convert PDF to Word free&#10;PDF to Excel converter guide&#10;How to protect PDF with password" style="min-height:120px"></textarea>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
            <div>
              <div class="gen-label">Model</div>
              <select class="gen-select" id="bulkModel">
                ${MODELS.map(m=>`<option value="${m.id}">${m.label}</option>`).join('')}
              </select>
            </div>
            <div>
              <div class="gen-label">Delay between articles (seconds)</div>
              <input class="gen-input" type="number" id="bulkDelay" value="5" min="2" max="60" />
            </div>
          </div>
          <button class="btn btn-red" onclick="SEO.bulkGenerate()">🚀 Start Bulk Generation</button>
          <div id="bulkList" style="margin-top:15px"></div>
        </div>
      </div>
    </div>

    <!-- LIST TAB -->
    <div class="seo-tab-pane" id="blog-tab-list">
      <div class="card">
        <div class="ch"><div class="ct">All Blogs (<span id="blogListCount">0</span>)</div>
          <div style="display:flex;gap:8px">
            <select class="gen-select" id="blogFilterStatus" style="padding:6px 10px;font-size:12px" onchange="SEO.loadBlogList()">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>
        <div id="blogListWrap"><div class="empty"><div class="ei">⏳</div><div class="et">Loading...</div></div></div>
      </div>
    </div>
  </div>

  <!-- KEYWORDS -->
  <div class="seo-page" id="page-keywords">
    <div class="card" style="margin-bottom:15px">
      <div class="ch"><div class="ct">🔑 AI Keyword Research</div></div>
      <div class="cb">
        <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:12px;align-items:flex-end">
          <div>
            <div class="gen-label">Seed Keyword</div>
            <input class="gen-input" id="kwSeed" placeholder="e.g. PDF tools, compress PDF" />
          </div>
          <div>
            <div class="gen-label">Research Type</div>
            <select class="gen-select" id="kwType">
              <option value="longtail">Long-tail Keywords</option>
              <option value="lowcomp">Low Competition</option>
              <option value="trending">Trending Topics</option>
              <option value="questions">Question Keywords</option>
              <option value="buyer">Buyer Intent</option>
            </select>
          </div>
          <button class="btn btn-red" onclick="SEO.researchKeywords()">🔍 Research</button>
        </div>
        <div class="ai-progress" id="kwProgress">
          <div class="progress-text">🔍 Keywords dhundh raha hai...</div>
          <div class="progress-bar"><div class="progress-fill"></div></div>
        </div>
        <div id="kwResults" style="margin-top:15px"></div>
      </div>
    </div>
    <div class="card">
      <div class="ch"><div class="ct">Saved Keywords (<span id="savedKwCount">0</span>)</div></div>
      <div id="savedKwWrap" class="cb"><div style="color:var(--txt2);font-size:13px">Keywords research karo aur save karo</div></div>
    </div>
  </div>

  <!-- AUTO PUBLISH -->
  <div class="seo-page" id="page-auto-publish">
    <div class="card" style="margin-bottom:15px">
      <div class="ch"><div class="ct">⚡ Auto Publishing System</div></div>
      <div class="cb">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div style="background:var(--card2);border:1px solid var(--bdr);border-radius:10px;padding:16px">
            <div style="font-size:13px;font-weight:600;margin-bottom:12px">🗓️ Daily Auto Blog</div>
            <div class="toggle-wrap" style="margin-bottom:12px">
              <label class="toggle"><input type="checkbox" id="autoBlogToggle" onchange="SEO.saveAutoSettings()"><span class="toggle-slider"></span></label>
              <span style="font-size:13px" id="autoBlogStatus">Off</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div><div class="gen-label">Topics Source</div>
                <select class="gen-select" id="autoTopicSrc">
                  <option value="keywords">Saved Keywords se</option>
                  <option value="trending">Trending Topics</option>
                  <option value="custom">Custom List</option>
                </select>
              </div>
              <div><div class="gen-label">Publish Time (daily)</div>
                <input type="time" class="gen-input" id="autoTime" value="09:00" /></div>
              <div><div class="gen-label">Articles per day</div>
                <select class="gen-select" id="autoCount">
                  <option value="1">1 article/day</option>
                  <option value="2">2 articles/day</option>
                  <option value="3">3 articles/day</option>
                  <option value="5">5 articles/day</option>
                </select>
              </div>
              <div><div class="gen-label">Auto Status</div>
                <select class="gen-select" id="autoStatus">
                  <option value="draft">Save as Draft</option>
                  <option value="published">Auto Publish</option>
                </select>
              </div>
              <button class="btn btn-red" style="margin-top:4px" onclick="SEO.saveAutoSettings()">💾 Save Settings</button>
            </div>
          </div>
          <div style="background:var(--card2);border:1px solid var(--bdr);border-radius:10px;padding:16px">
            <div style="font-size:13px;font-weight:600;margin-bottom:12px">🌐 Hidden SEO Pages</div>
            <div class="toggle-wrap" style="margin-bottom:12px">
              <label class="toggle"><input type="checkbox" id="autoSeoToggle" onchange="SEO.saveAutoSettings()"><span class="toggle-slider"></span></label>
              <span style="font-size:13px" id="autoSeoStatus">Off</span>
            </div>
            <p style="font-size:12px;color:var(--txt2);margin-bottom:12px;line-height:1.6">Google index hogi but navbar mein nahi dikhegi. Long-tail keywords ke liye landing pages.</p>
            <div><div class="gen-label">Keywords (comma separated)</div>
              <textarea class="gen-textarea" id="seoPageKw" placeholder="free pdf merger online, compress pdf without quality loss, pdf to excel converter free" style="min-height:80px"></textarea>
            </div>
            <button class="btn btn-red" style="margin-top:10px" onclick="SEO.generateSeoPages()">🚀 Generate SEO Pages</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="ch"><div class="ct">📅 Scheduled Queue</div></div>
      <div id="scheduleQueue"><div class="empty"><div class="ei">📅</div><div class="et">Koi scheduled article nahi</div></div></div>
    </div>
  </div>

  <!-- SEO ANALYTICS -->
  <div class="seo-page" id="page-seo-analytics">
    <div class="seo-stat-grid">
      <div class="seo-stat"><div class="seo-stat-icon">📝</div><div class="seo-stat-val" id="an-total">0</div><div class="seo-stat-lbl">Total Articles</div></div>
      <div class="seo-stat"><div class="seo-stat-icon">🚀</div><div class="seo-stat-val" id="an-pub">0</div><div class="seo-stat-lbl">Published</div></div>
      <div class="seo-stat"><div class="seo-stat-icon">💾</div><div class="seo-stat-val" id="an-draft">0</div><div class="seo-stat-lbl">Drafts</div></div>
      <div class="seo-stat"><div class="seo-stat-icon">🤖</div><div class="seo-stat-val" id="an-api">0</div><div class="seo-stat-lbl">API Calls Used</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="ch"><div class="ct">📊 Publish History</div></div>
        <div id="publishHistory" class="cb"><div style="color:var(--txt2);font-size:13px">Loading...</div></div>
      </div>
      <div class="card">
        <div class="ch"><div class="ct">🔑 Top Keywords Used</div></div>
        <div id="topKeywords" class="cb"><div style="color:var(--txt2);font-size:13px">Loading...</div></div>
      </div>
    </div>
  </div>

  <!-- SEO SETTINGS -->
  <div class="seo-page" id="page-seo-settings">
    <div class="card">
      <div class="ch"><div class="ct">⚙️ AI API Settings (Gemini / OpenRouter)</div></div>
      <div class="cb">
        <div class="gen-form">
          <div style="grid-column:1/-1;display:flex;flex-direction:column;gap:4px">
            <div class="gen-label">API Key 🔒 (Gemini ya OpenRouter)</div>
            <input type="password" class="gen-input" id="settApiKey" placeholder="Gemini: AIza... ya OpenRouter: sk-or-..." />
            <div style="font-size:11px;color:var(--txt2);margin-top:3px">Gemini: aistudio.google.com → Get API Key (FREE!) | OpenRouter: openrouter.ai → API Keys</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <div class="gen-label">Default Model</div>
            <select class="gen-select" id="settModel">
              ${MODELS.map(m=>`<option value="${m.id}" ${m.id===SEO_CONFIG.defaultModel?'selected':''}>${m.label}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <div class="gen-label">Site URL</div>
            <input class="gen-input" id="settSiteUrl" value="${SEO_CONFIG.siteUrl}" />
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <div class="gen-label">Site Name</div>
            <input class="gen-input" id="settSiteName" value="${SEO_CONFIG.siteName}" />
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <div class="gen-label">Max tokens per request</div>
            <select class="gen-select" id="settTokens">
              <option value="2000">2000 (Fast)</option>
              <option value="4000" selected>4000 (Balanced)</option>
              <option value="8000">8000 (Detailed)</option>
            </select>
          </div>
          <div style="grid-column:1/-1;display:flex;gap:10px;margin-top:4px">
            <button class="btn btn-red" onclick="SEO.saveApiSettings()">💾 Save Settings</button>
            <button class="btn btn-grn" onclick="SEO.testApi()">🧪 Test API</button>
          </div>
        </div>
        <div id="apiTestResult" style="margin-top:12px;font-size:13px"></div>
      </div>
    </div>
    <div class="card" style="margin-top:15px">
      <div class="ch"><div class="ct">🗺️ SEO Tools</div></div>
      <div class="cb" style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="SEO.generateSitemap()">🗺️ Generate Sitemap</button>
          <button class="btn btn-ghost" onclick="SEO.generateRobots()">🤖 Generate robots.txt</button>
          <button class="btn btn-ghost" onclick="SEO.generateSchema()">📋 Generate Schema</button>
          <button class="btn btn-ghost" onclick="SEO.exportAllBlogs()">📦 Export All Blogs</button>
        </div>
        <div id="seoToolOutput" style="display:none" class="ai-output-box show"></div>
      </div>
    </div>
  </div>
  `;

  content.appendChild(pages);
}

// ============================================================
// MAIN SEO OBJECT
// ============================================================
window.SEO = {

  currentBlogData: null,
  apiCallCount: 0,

  // ---- PAGE NAVIGATION ----
  show(id, navEl) {
    // Existing pages hide karo
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // SEO pages bhi hide karo
    document.querySelectorAll('.seo-page').forEach(p => p.classList.remove('active'));

    const pg = document.getElementById('page-' + id);
    if (pg) pg.classList.add('active');

    document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
    if (navEl) navEl.classList.add('active');

    const el = document.getElementById('pageTitle');
    if (el) el.textContent = {
      'seo-dashboard':'SEO Dashboard','ai-blogs':'AI Blogs',
      'keywords':'Keyword Research','auto-publish':'Auto Publish',
      'seo-analytics':'SEO Analytics','seo-settings':'SEO Settings'
    }[id] || id;

    if (id === 'seo-dashboard') this.loadDashboard();
    if (id === 'ai-blogs')      this.loadBlogList();
    if (id === 'seo-analytics') this.loadAnalytics();
    if (id === 'keywords')      this.loadSavedKeywords();
    if (id === 'seo-settings')  this.loadApiSettings();
    if (id === 'auto-publish')  this.loadAutoSettings();
  },

  switchTab(group, tab, el) {
    document.querySelectorAll(`#blog-tab-${['generate','bulk','list'].join(', #blog-tab-')}`).forEach(p => p.classList.remove('active'));
    const pane = document.getElementById(`${group}-tab-${tab}`);
    if (pane) pane.classList.add('active');
    el.closest('.seo-tabs').querySelectorAll('.seo-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    if (tab === 'list') this.loadBlogList();
  },

  // ---- API CALL ----
  // Auto-detect: Gemini models → Gemini API, baaki → OpenRouter
  async callAI(prompt, model) {
    const mdl = model || this.getConfig('model') || SEO_CONFIG.defaultModel;
    const isGemini = mdl.startsWith('gemini');

    if (isGemini) {
      return await this.callGemini(prompt, mdl);
    } else {
      return await this.callOpenRouter(prompt, mdl);
    }
  },

  // ---- GEMINI API ----
  async callGemini(prompt, model) {
    const key = this.getConfig('apiKey') || SEO_CONFIG.geminiKey;
    if (!key || key === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Gemini API key set karo! SEO Settings → API Key. Google AI Studio: aistudio.google.com');
    }
    const tokens = parseInt(this.getConfig('tokens') || 4000);
    const mdl = model || SEO_CONFIG.defaultModel;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: tokens }
        })
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(()=>({error:{message:'Gemini API error'}}));
      const msg = err.error?.message || `Gemini Error ${res.status}`;
      // Helpful error messages
      if (res.status === 400) throw new Error('Gemini: Invalid request. Model name check karo.');
      if (res.status === 403) throw new Error('Gemini: API key invalid hai. aistudio.google.com se naya key lo.');
      if (res.status === 429) throw new Error('Gemini: Rate limit! Thodi der baad try karo (free tier: 15 req/min).');
      throw new Error(msg);
    }

    const data = await res.json();
    this.apiCallCount++;
    this.incrementApiCount();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },

  // ---- OPENROUTER API ----
  async callOpenRouter(prompt, model) {
    const key = this.getConfig('apiKey') || SEO_CONFIG.openrouterKey;
    if (!key || key === 'YOUR_OPENROUTER_API_KEY') {
      throw new Error('OpenRouter API key set karo! SEO Settings → API Key');
    }
    const tokens = parseInt(this.getConfig('tokens') || 4000);

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': SEO_CONFIG.siteUrl,
        'X-Title': SEO_CONFIG.siteName
      },
      body: JSON.stringify({
        model: model,
        max_tokens: tokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(()=>({error:{message:'API error'}}));
      throw new Error(err.error?.message || `OpenRouter Error ${res.status}`);
    }

    const data = await res.json();
    this.apiCallCount++;
    this.incrementApiCount();
    return data.choices?.[0]?.message?.content || '';
  },

  // ---- BLOG GENERATOR ----
  async generateBlog() {
    const topic   = document.getElementById('blogTopic').value.trim();
    const keyword = document.getElementById('blogKeyword').value.trim();
    if (!topic || !keyword) { this.toast('Topic aur keyword zaroori hai!', 'err'); return; }

    const secKw  = document.getElementById('blogSecKw').value;
    const model  = document.getElementById('blogModel').value;
    const words  = document.getElementById('blogWords').value;
    const tone   = document.getElementById('blogTone').value;
    const links  = document.getElementById('blogLinks').value;
    const siteUrl= this.getConfig('siteUrl') || SEO_CONFIG.siteUrl;

    const btn = document.getElementById('genBtn');
    btn.textContent = '⏳ Generating...';
    btn.disabled = true;

    const prog = document.getElementById('genProgress');
    prog.classList.add('show');

    const progressMessages = [
      '🤖 AI topic samajh raha hai...',
      '✍️ SEO structure bana raha hai...',
      '📝 Content likh raha hai...',
      '🔍 Keywords optimize kar raha hai...',
      '✅ Final polish kar raha hai...'
    ];

    let pi = 0;
    const pt = document.getElementById('genProgressText');
    const interval = setInterval(() => {
      pt.textContent = progressMessages[pi % progressMessages.length];
      pi++;
    }, 2000);

    const prompt = `You are an expert SEO content writer for "${siteUrl}" (a free online PDF tools website).

Write a complete, human-like SEO blog post with the following specs:

TOPIC: ${topic}
PRIMARY KEYWORD: ${keyword}
SECONDARY KEYWORDS: ${secKw || 'related PDF tool keywords'}
TONE: ${tone}
MINIMUM WORDS: ${words}
INTERNAL LINKS TO USE: ${links || siteUrl}

OUTPUT FORMAT (follow exactly):

---SEO_META---
TITLE: [SEO optimized title, 55-60 chars, include primary keyword]
META_TITLE: [same as title or slightly different]
META_DESC: [150-160 chars, include primary keyword, compelling CTA]
SLUG: [url-friendly-slug]
CANONICAL: ${siteUrl}/blog/[slug]
TAGS: [tag1, tag2, tag3, tag4, tag5]
FOCUS_KEYWORD: ${keyword}
---END_META---

---ARTICLE---
[Write the complete article here with:]
- H1 heading (include primary keyword)
- Introduction paragraph (hook the reader)
- H2 sections (at least 5-6)
- H3 subsections where needed
- Natural keyword usage (1-2% density)
- Internal links to: ${links || siteUrl}
- FAQ section (5 questions minimum)
- Conclusion with CTA
- No AI-sounding phrases like "In conclusion", "It is worth noting"
- Write like a helpful human expert
- Include real practical tips
- Minimum ${words} words
---END_ARTICLE---

---SCHEMA---
[JSON-LD schema markup for the article]
---END_SCHEMA---`;

    try {
      const result = await this.callAI(prompt, model);
      clearInterval(interval);
      prog.classList.remove('show');

      this.currentBlogData = this.parseBlogOutput(result, topic, keyword);

      const output = document.getElementById('blogOutput');
      output.textContent = result;
      output.classList.add('show');

      const actions = document.getElementById('blogActions');
      actions.style.display = 'flex';

      this.toast('Blog generate ho gaya! 🎉');
    } catch(e) {
      clearInterval(interval);
      prog.classList.remove('show');
      this.toast('Error: ' + e.message, 'err');
    }

    btn.textContent = '🤖 Generate Blog';
    btn.disabled = false;
  },

  parseBlogOutput(raw, topic, keyword) {
    const metaMatch = raw.match(/---SEO_META---([\s\S]*?)---END_META---/);
    const articleMatch = raw.match(/---ARTICLE---([\s\S]*?)---END_ARTICLE---/);
    const schemaMatch = raw.match(/---SCHEMA---([\s\S]*?)---END_SCHEMA---/);

    const meta = {};
    if (metaMatch) {
      const lines = metaMatch[1].trim().split('\n');
      lines.forEach(l => {
        const [k, ...v] = l.split(':');
        if (k && v.length) meta[k.trim()] = v.join(':').trim();
      });
    }

    return {
      title: meta.TITLE || topic,
      metaTitle: meta.META_TITLE || meta.TITLE || topic,
      metaDesc: meta.META_DESC || '',
      slug: meta.SLUG || keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      canonical: meta.CANONICAL || `${SEO_CONFIG.siteUrl}/blog/${meta.SLUG || ''}`,
      tags: (meta.TAGS || keyword).split(',').map(t => t.trim()),
      focusKeyword: meta.FOCUS_KEYWORD || keyword,
      content: articleMatch ? articleMatch[1].trim() : raw,
      schema: schemaMatch ? schemaMatch[1].trim() : '',
      rawOutput: raw,
      status: document.getElementById('blogStatus').value,
      scheduledFor: document.getElementById('blogSchedule').value,
      model: document.getElementById('blogModel').value,
      wordCount: (articleMatch ? articleMatch[1] : raw).split(' ').length,
      createdAt: new Date().toISOString()
    };
  },

  async saveBlog() {
    if (!this.currentBlogData) { this.toast('Pehle generate karo!', 'err'); return; }
    if (!window.$db) { this.toast('Firebase connected nahi!', 'err'); return; }
    const { collection, addDoc, serverTimestamp } = window.$fs;
    try {
      await addDoc(collection(window.$db, 'blogs'), {
        ...this.currentBlogData,
        savedAt: serverTimestamp()
      });
      this.toast('Blog Firebase mein save ho gaya! 💾');
      this.updateBlogCount();
    } catch(e) { this.toast('Save error: ' + e.message, 'err'); }
  },

  copyBlog() {
    if (!this.currentBlogData) return;
    navigator.clipboard.writeText(this.currentBlogData.rawOutput)
      .then(() => this.toast('Copied! ✅'));
  },

  exportBlogHTML() {
    if (!this.currentBlogData) return;
    const d = this.currentBlogData;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${d.metaTitle}</title>
<meta name="description" content="${d.metaDesc}">
<link rel="canonical" href="${d.canonical}">
<meta property="og:title" content="${d.title}">
<meta property="og:description" content="${d.metaDesc}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${d.schema}<\/script>
</head>
<body>
<article>
${d.content.replace(/\n/g, '<br>')}
</article>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = d.slug + '.html';
    a.click();
    this.toast('HTML exported! 📄');
  },

  clearBlogForm() {
    ['blogTopic','blogKeyword','blogSecKw','blogLinks'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const out = document.getElementById('blogOutput');
    if (out) { out.textContent = ''; out.classList.remove('show'); }
    const act = document.getElementById('blogActions');
    if (act) act.style.display = 'none';
    this.currentBlogData = null;
  },

  // ---- BULK GENERATE ----
  async bulkGenerate() {
    const topicsRaw = document.getElementById('bulkTopics').value.trim();
    if (!topicsRaw) { this.toast('Topics daalo!', 'err'); return; }
    const topics = topicsRaw.split('\n').filter(t => t.trim());
    const delay  = parseInt(document.getElementById('bulkDelay').value) * 1000;
    const model  = document.getElementById('bulkModel').value;
    const listEl = document.getElementById('bulkList');

    listEl.innerHTML = topics.map((t,i) => `
      <div class="bulk-item" id="bulk-${i}">
        <span style="font-size:16px">⏳</span>
        <div class="bi-title">${t.trim()}</div>
        <span class="bi-status badge b-gld">Waiting</span>
      </div>`).join('');

    for (let i = 0; i < topics.length; i++) {
      const item = document.getElementById(`bulk-${i}`);
      item.querySelector('.bi-status').className = 'bi-status badge b-blu';
      item.querySelector('.bi-status').textContent = 'Generating...';
      item.querySelector('span').textContent = '🤖';

      try {
        const kw = topics[i].trim().toLowerCase().replace(/[^a-z0-9\s]/g,'');
        const prompt = `Write a 1500+ word SEO blog post about: "${topics[i].trim()}"
Focus keyword: ${kw}
Site: ${SEO_CONFIG.siteUrl}
Include: SEO title, meta description, H2/H3 headings, FAQ section, conclusion with CTA.
Natural human-like writing. No AI clichés.`;

        const result = await this.callAI(prompt, model);
        const blogData = {
          title: topics[i].trim(),
          slug: kw.replace(/\s+/g,'-').slice(0,50),
          content: result,
          focusKeyword: kw,
          status: 'draft',
          wordCount: result.split(' ').length,
          createdAt: new Date().toISOString()
        };

        if (window.$db) {
          const { collection, addDoc, serverTimestamp } = window.$fs;
          await addDoc(collection(window.$db,'blogs'), { ...blogData, savedAt: serverTimestamp() });
        }

        item.querySelector('.bi-status').className = 'bi-status badge b-grn';
        item.querySelector('.bi-status').textContent = 'Done ✅';
        item.querySelector('span').textContent = '✅';

      } catch(e) {
        item.querySelector('.bi-status').className = 'bi-status badge b-red';
        item.querySelector('.bi-status').textContent = 'Error ❌';
        item.querySelector('span').textContent = '❌';
      }

      if (i < topics.length - 1) await new Promise(r => setTimeout(r, delay));
    }

    this.toast('Bulk generation complete! 🎉');
    this.updateBlogCount();
  },

  // ---- KEYWORD RESEARCH ----
  async researchKeywords() {
    const seed = document.getElementById('kwSeed').value.trim();
    const type = document.getElementById('kwType').value;
    if (!seed) { this.toast('Seed keyword daalo!', 'err'); return; }

    const prog = document.getElementById('kwProgress');
    prog.classList.add('show');

    const prompts = {
      longtail:  `Generate 20 long-tail keyword variations for "${seed}" related to PDF tools website. Format: keyword | search intent | estimated difficulty (Low/Med/High). Focus on keywords that could rank for a free PDF tools website like wepdfhub.click`,
      lowcomp:   `Find 20 low competition keywords related to "${seed}" for PDF tools niche. Must be specific, less than 1000 monthly searches but easy to rank. Format: keyword | monthly volume estimate | competition (Low/Med/High)`,
      trending:  `What are 20 trending search queries related to "${seed}" in PDF tools/document management space in 2024-2025? Format: keyword | trend direction (↑/→/↓) | content type needed`,
      questions: `Generate 20 question-based keywords that people search about "${seed}". Include how-to, what-is, why, best-way questions. Format: question keyword | search intent`,
      buyer:     `List 20 buyer-intent keywords related to "${seed}" for PDF tools. These should indicate someone ready to use a tool. Format: keyword | intent type | priority (High/Med/Low)`
    };

    try {
      const result = await this.callAI(prompts[type] || prompts.longtail);
      prog.classList.remove('show');

      const lines = result.split('\n').filter(l => l.trim() && l.includes('|'));
      const kwEl = document.getElementById('kwResults');

      kwEl.innerHTML = `<div style="margin-bottom:12px;font-size:13px;color:var(--txt2)">${lines.length} keywords mila!</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
          ${lines.map(l => {
            const [kw,,diff] = l.split('|').map(s=>s.trim());
            const cls = diff?.includes('Low') ? 'low' : diff?.includes('High') ? 'high' : 'med';
            return `<span class="kw-chip ${cls}" onclick="SEO.saveKeyword('${(kw||'').replace(/'/g,"\\'")}','${cls}')">${kw||l} <span style="opacity:.6;font-size:10px">+ Save</span></span>`;
          }).join('')}
        </div>
        <button class="btn btn-ghost" onclick="SEO.saveAllKeywords(${JSON.stringify(lines).replace(/"/g,'&quot;')})">💾 Save All Keywords</button>`;

      this.toast('Keywords ready! 🔑');
    } catch(e) {
      prog.classList.remove('show');
      this.toast('Error: ' + e.message, 'err');
    }
  },

  async saveKeyword(kw, difficulty) {
    if (!window.$db) return;
    const { collection, addDoc, serverTimestamp } = window.$fs;
    await addDoc(collection(window.$db,'keywords'), {
      keyword: kw, difficulty,
      savedAt: serverTimestamp()
    });
    this.toast(`"${kw}" save ho gaya!`);
    this.loadSavedKeywords();
  },

  async saveAllKeywords(lines) {
    if (!window.$db) return;
    const { collection, addDoc, serverTimestamp } = window.$fs;
    for (const l of lines) {
      const [kw,,diff] = l.split('|').map(s=>s.trim());
      if (kw) {
        const cls = diff?.includes('Low')?'low':diff?.includes('High')?'high':'med';
        await addDoc(collection(window.$db,'keywords'),{ keyword:kw, difficulty:cls, savedAt:serverTimestamp() });
      }
    }
    this.toast('Sab keywords save ho gaye! 💾');
    this.loadSavedKeywords();
  },

  async loadSavedKeywords() {
    if (!window.$db) return;
    const { collection, getDocs } = window.$fs;
    try {
      const snap = await getDocs(collection(window.$db,'keywords'));
      const kws = [];
      snap.forEach(d => kws.push({ id:d.id, ...d.data() }));
      document.getElementById('savedKwCount').textContent = kws.length;
      const el = document.getElementById('savedKwWrap');
      if (!kws.length) {
        el.innerHTML = '<div style="color:var(--txt2);font-size:13px">Research karo aur save karo</div>';
        return;
      }
      el.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px">
        ${kws.map(k=>`<span class="kw-chip ${k.difficulty||'med'}">${k.keyword}</span>`).join('')}
      </div>`;
    } catch(e) {}
  },

  // ---- AUTO PUBLISH ----
  async saveAutoSettings() {
    const settings = {
      autoBlog: document.getElementById('autoBlogToggle').checked,
      autoSeo:  document.getElementById('autoSeoToggle').checked,
      topicSrc: document.getElementById('autoTopicSrc').value,
      time:     document.getElementById('autoTime').value,
      count:    document.getElementById('autoCount').value,
      status:   document.getElementById('autoStatus').value
    };
    localStorage.setItem('wph_auto_settings', JSON.stringify(settings));
    document.getElementById('autoBlogStatus').textContent = settings.autoBlog ? 'On ✅' : 'Off';
    document.getElementById('autoSeoStatus').textContent  = settings.autoSeo  ? 'On ✅' : 'Off';
    this.toast('Auto settings save ho gayi!');

    // Schedule check start karo
    if (settings.autoBlog) this.startAutoScheduler();
  },

  loadAutoSettings() {
    const s = JSON.parse(localStorage.getItem('wph_auto_settings') || '{}');
    if (s.autoBlog !== undefined) document.getElementById('autoBlogToggle').checked = s.autoBlog;
    if (s.autoSeo  !== undefined) document.getElementById('autoSeoToggle').checked  = s.autoSeo;
    if (s.topicSrc) document.getElementById('autoTopicSrc').value = s.topicSrc;
    if (s.time)     document.getElementById('autoTime').value     = s.time;
    if (s.count)    document.getElementById('autoCount').value    = s.count;
    if (s.status)   document.getElementById('autoStatus').value   = s.status;
    document.getElementById('autoBlogStatus').textContent = s.autoBlog ? 'On ✅' : 'Off';
    document.getElementById('autoSeoStatus').textContent  = s.autoSeo  ? 'On ✅' : 'Off';
    this.loadScheduleQueue();
  },

  async loadScheduleQueue() {
    if (!window.$db) return;
    const { collection, getDocs, query, orderBy } = window.$fs;
    try {
      const q = query(collection(window.$db,'blogs'), orderBy('savedAt','desc'));
      const snap = await getDocs(q);
      const scheduled = [];
      snap.forEach(d => { if(d.data().status==='scheduled') scheduled.push({id:d.id,...d.data()}); });
      const el = document.getElementById('scheduleQueue');
      if (!scheduled.length) {
        el.innerHTML = '<div class="empty"><div class="ei">📅</div><div class="et">Koi scheduled article nahi</div></div>';
        return;
      }
      el.innerHTML = `<table class="blog-table"><thead><tr><th>Title</th><th>Scheduled For</th><th>Status</th></tr></thead><tbody>
        ${scheduled.map(b=>`<tr>
          <td style="font-weight:500">${b.title||'Untitled'}</td>
          <td style="color:var(--txt2)">${b.scheduledFor||'—'}</td>
          <td><span class="badge b-gld">Scheduled</span></td>
        </tr>`).join('')}
      </tbody></table>`;
    } catch(e) {}
  },

  startAutoScheduler() {
    // Browser tab khula hoga tab check karega
    setInterval(async () => {
      const s = JSON.parse(localStorage.getItem('wph_auto_settings') || '{}');
      if (!s.autoBlog) return;
      const now = new Date();
      const [h, m] = (s.time || '09:00').split(':').map(Number);
      if (now.getHours() === h && now.getMinutes() === m) {
        const lastRun = localStorage.getItem('wph_last_auto_run');
        const today = now.toDateString();
        if (lastRun !== today) {
          localStorage.setItem('wph_last_auto_run', today);
          this.toast('⚡ Auto blog generation start ho gayi!');
          await this.runAutoGeneration(s);
        }
      }
    }, 60000); // Har minute check karo
  },

  async runAutoGeneration(settings) {
    if (!window.$db) return;
    const { collection, getDocs } = window.$fs;
    const count = parseInt(settings.count) || 1;
    let topics = [];

    if (settings.topicSrc === 'keywords') {
      const snap = await getDocs(collection(window.$db,'keywords'));
      snap.forEach(d => topics.push(d.data().keyword));
      topics = topics.slice(0, count);
    } else {
      // Trending topics generate karo
      const result = await this.callAI(`Give ${count} trending PDF tool blog topics for 2025. Just the topics, one per line.`);
      topics = result.split('\n').filter(t=>t.trim()).slice(0,count);
    }

    for (const topic of topics) {
      document.getElementById('blogTopic').value = topic;
      document.getElementById('blogKeyword').value = topic.toLowerCase().replace(/[^a-z0-9\s]/g,'').trim();
      document.getElementById('blogStatus').value = settings.status || 'draft';
      await this.generateBlog();
      if (this.currentBlogData) await this.saveBlog();
      await new Promise(r => setTimeout(r, 5000));
    }
  },

  async generateSeoPages() {
    const kwRaw = document.getElementById('seoPageKw').value.trim();
    if (!kwRaw) { this.toast('Keywords daalo!', 'err'); return; }
    const keywords = kwRaw.split(',').map(k=>k.trim()).filter(Boolean);
    this.toast(`${keywords.length} SEO pages generate ho rahi hain...`);

    for (const kw of keywords) {
      const prompt = `Create an SEO landing page for keyword: "${kw}"
Site: ${SEO_CONFIG.siteUrl}
Generate: Title, meta description, H1, 3 paragraphs of content, FAQ (3 questions)
This page should help users find the tool at ${SEO_CONFIG.siteUrl}
Keep it natural and helpful. 300-500 words.`;

      try {
        const result = await this.callAI(prompt);
        if (window.$db) {
          const { collection, addDoc, serverTimestamp } = window.$fs;
          await addDoc(collection(window.$db,'seo_pages'), {
            keyword: kw,
            slug: kw.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
            content: result,
            indexable: true,
            showInNav: false,
            createdAt: serverTimestamp()
          });
        }
        await new Promise(r => setTimeout(r, 2000));
      } catch(e) {}
    }
    this.toast('SEO pages save ho gayi Firebase mein! 🌐');
  },

  // ---- DASHBOARD ----
  async loadDashboard() {
    if (!window.$db) return;
    const { collection, getDocs } = window.$fs;
    try {
      const [blogsSnap, kwSnap, pagesSnap] = await Promise.all([
        getDocs(collection(window.$db,'blogs')),
        getDocs(collection(window.$db,'keywords')),
        getDocs(collection(window.$db,'seo_pages'))
      ]);

      document.getElementById('ss-blogs').textContent = blogsSnap.size;
      document.getElementById('ss-kw').textContent    = kwSnap.size;
      document.getElementById('ss-pages').textContent = pagesSnap.size;
      document.getElementById('ss-api').textContent   = parseInt(localStorage.getItem('wph_api_calls')||'0');

      // Recent blogs
      const blogs = [];
      blogsSnap.forEach(d => blogs.push({id:d.id,...d.data()}));
      const recent = blogs.slice(0,5);
      const rEl = document.getElementById('recentBlogsTable');
      rEl.innerHTML = recent.length ? `<table class="blog-table"><thead><tr><th>Title</th><th>Status</th><th>Words</th></tr></thead><tbody>
        ${recent.map(b=>`<tr>
          <td style="font-weight:500;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.title||'Untitled'}</td>
          <td><span class="badge ${b.status==='published'?'b-grn':b.status==='scheduled'?'b-gld':'b-red'}">${b.status||'draft'}</span></td>
          <td style="color:var(--txt2)">${b.wordCount||'—'}</td>
        </tr>`).join('')}
      </tbody></table>` : '<div class="empty"><div class="ei">✍️</div><div class="et">Koi blog nahi. AI Blogs se generate karo!</div></div>';

      // SEO Score calculate karo
      let score = 40;
      if (blogsSnap.size > 0) score += 20;
      if (blogsSnap.size > 5) score += 10;
      if (kwSnap.size > 10)   score += 15;
      if (pagesSnap.size > 0) score += 15;
      score = Math.min(score, 100);
      document.getElementById('seoScore').textContent = score;
      document.getElementById('seoScore').style.color = score > 70 ? 'var(--grn)' : score > 50 ? 'var(--gold)' : 'var(--red)';

      document.getElementById('seoChecklist').innerHTML = [
        [blogsSnap.size > 0,   'Blog content published'],
        [kwSnap.size > 5,      'Keywords tracked (5+)'],
        [pagesSnap.size > 0,   'SEO pages created'],
        [blogsSnap.size > 10,  '10+ articles published'],
      ].map(([ok,label])=>`<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:${ok?'var(--grn)':'var(--txt2)'}">
        ${ok?'✅':'⭕'} ${label}
      </div>`).join('');

    } catch(e) {}
  },

  async loadAnalytics() {
    if (!window.$db) return;
    const { collection, getDocs } = window.$fs;
    try {
      const snap = await getDocs(collection(window.$db,'blogs'));
      let total=0, pub=0, draft=0;
      const kwMap = {};
      snap.forEach(d => {
        const b = d.data();
        total++;
        if (b.status==='published') pub++;
        else draft++;
        if (b.focusKeyword) kwMap[b.focusKeyword] = (kwMap[b.focusKeyword]||0)+1;
      });
      document.getElementById('an-total').textContent = total;
      document.getElementById('an-pub').textContent   = pub;
      document.getElementById('an-draft').textContent = draft;
      document.getElementById('an-api').textContent   = parseInt(localStorage.getItem('wph_api_calls')||'0');

      // Top keywords
      const sorted = Object.entries(kwMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
      document.getElementById('topKeywords').innerHTML = sorted.length
        ? sorted.map(([k,c])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bdr);font-size:13px"><span>${k}</span><span class="badge b-blu">${c} articles</span></div>`).join('')
        : '<div style="color:var(--txt2);font-size:13px">No data yet</div>';

    } catch(e) {}
  },

  async loadBlogList() {
    if (!window.$db) return;
    const { collection, getDocs, query, orderBy } = window.$fs;
    try {
      const q = query(collection(window.$db,'blogs'), orderBy('savedAt','desc'));
      const snap = await getDocs(q);
      const filterStatus = document.getElementById('blogFilterStatus')?.value;
      let blogs = [];
      snap.forEach(d => {
        const b = {id:d.id,...d.data()};
        if (!filterStatus || b.status === filterStatus) blogs.push(b);
      });

      document.getElementById('blogListCount').textContent = blogs.length;
      document.getElementById('blogCount').textContent = snap.size;

      const el = document.getElementById('blogListWrap');
      el.innerHTML = blogs.length ? `<table class="blog-table">
        <thead><tr><th>Title</th><th>Keyword</th><th>Words</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${blogs.map(b=>`<tr>
          <td style="font-weight:500;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.title||'Untitled'}</td>
          <td style="color:var(--txt2);font-size:12px">${b.focusKeyword||'—'}</td>
          <td style="color:var(--txt2)">${b.wordCount||'—'}</td>
          <td><span class="badge ${b.status==='published'?'b-grn':b.status==='scheduled'?'b-gld':'b-red'}">${b.status||'draft'}</span></td>
          <td><div style="display:flex;gap:5px">
            <button class="ib ib-e" onclick="SEO.publishBlog('${b.id}')" title="Publish">🚀</button>
            <button class="ib ib-d" onclick="SEO.deleteBlog('${b.id}')" title="Delete">🗑️</button>
          </div></td>
        </tr>`).join('')}</tbody>
      </table>` : '<div class="empty"><div class="ei">✍️</div><div class="et">Koi blog nahi. Generate karo!</div></div>';

    } catch(e) { this.toast('Blogs load error', 'err'); }
  },

  async publishBlog(id) {
    if (!window.$db) return;
    const { doc, updateDoc } = window.$fs;
    await updateDoc(doc(window.$db,'blogs',id), { status:'published' });
    this.toast('Blog published! 🚀');
    this.loadBlogList();
  },

  async deleteBlog(id) {
    if (!confirm('Delete karna hai?')) return;
    if (!window.$db) return;
    const { doc, deleteDoc } = window.$fs;
    await deleteDoc(doc(window.$db,'blogs',id));
    this.toast('Blog deleted!');
    this.loadBlogList();
  },

  // ---- SETTINGS ----
  loadApiSettings() {
    const key = localStorage.getItem('wph_api_key');
    const model = localStorage.getItem('wph_model');
    if (key) document.getElementById('settApiKey').value = key;
    if (model) document.getElementById('settModel').value = model;
  },

  saveApiSettings() {
    const key   = document.getElementById('settApiKey').value.trim();
    const model = document.getElementById('settModel').value;
    const url   = document.getElementById('settSiteUrl').value.trim();
    const name  = document.getElementById('settSiteName').value.trim();
    const tokens= document.getElementById('settTokens').value;
    if (key)   localStorage.setItem('wph_api_key', key);
    if (model) localStorage.setItem('wph_model', model);
    if (url)   SEO_CONFIG.siteUrl = url;
    if (name)  SEO_CONFIG.siteName = name;
    if (tokens) localStorage.setItem('wph_tokens', tokens);
    this.toast('Settings save ho gayi! ⚙️');
  },

  async testApi() {
    const res = document.getElementById('apiTestResult');
    res.textContent = '⏳ Testing...';
    res.style.color = 'var(--txt2)';
    try {
      const result = await this.callAI('Say "API connected successfully!" in one sentence.');
      res.textContent = '✅ ' + result.slice(0,100);
      res.style.color = 'var(--grn)';
    } catch(e) {
      res.textContent = '❌ ' + e.message;
      res.style.color = 'var(--red)';
    }
  },

  // ---- SEO TOOLS ----
  async generateSitemap() {
    const el = document.getElementById('seoToolOutput');
    el.style.display = 'block';
    el.textContent = 'Generating...';
    if (!window.$db) { el.textContent = 'Firebase connect karo'; return; }
    const { collection, getDocs } = window.$fs;
    const snap = await getDocs(collection(window.$db,'blogs'));
    const blogs = [];
    snap.forEach(d => { if(d.data().status==='published') blogs.push(d.data()); });
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SEO_CONFIG.siteUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${SEO_CONFIG.siteUrl}/tools</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
${blogs.map(b=>`  <url><loc>${SEO_CONFIG.siteUrl}/blog/${b.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n')}
</urlset>`;
    el.textContent = sitemap;
    this.toast('Sitemap ready! Copy karo aur sitemap.xml mein paste karo.');
  },

  generateRobots() {
    const el = document.getElementById('seoToolOutput');
    el.style.display = 'block';
    el.textContent = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: ${SEO_CONFIG.siteUrl}/sitemap.xml`;
    this.toast('robots.txt ready!');
  },

  generateSchema() {
    const el = document.getElementById('seoToolOutput');
    el.style.display = 'block';
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": SEO_CONFIG.siteName,
      "url": SEO_CONFIG.siteUrl,
      "description": "Free online PDF tools - merge, split, compress, convert PDF files",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    }, null, 2);
    this.toast('Schema ready! <head> mein paste karo.');
  },

  async exportAllBlogs() {
    if (!window.$db) return;
    const { collection, getDocs } = window.$fs;
    const snap = await getDocs(collection(window.$db,'blogs'));
    const blogs = [];
    snap.forEach(d => blogs.push({id:d.id,...d.data()}));
    const blob = new Blob([JSON.stringify(blogs, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wepdfhub-blogs-export.json';
    a.click();
    this.toast('Exported!');
  },

  // ---- HELPERS ----
  getConfig(key) {
    const map = { apiKey:'wph_api_key', model:'wph_model', tokens:'wph_tokens', siteUrl:'wph_site_url' };
    return localStorage.getItem(map[key] || key);
  },

  incrementApiCount() {
    const c = parseInt(localStorage.getItem('wph_api_calls')||'0') + 1;
    localStorage.setItem('wph_api_calls', c);
  },

  async updateBlogCount() {
    if (!window.$db) return;
    const { collection, getDocs } = window.$fs;
    const snap = await getDocs(collection(window.$db,'blogs'));
    document.getElementById('blogCount').textContent = snap.size;
  },

  toast(msg, type='ok') {
    const w = document.getElementById('tw');
    if (!w) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `${type==='ok'?'✅':'❌'} ${msg}`;
    w.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }
};

// ============================================================
// INIT
// ============================================================
function init() {
  injectStyles();
  injectSidebar();
  injectPages();

  // Blog status change pe schedule toggle
  setTimeout(() => {
    const statusEl = document.getElementById('blogStatus');
    if (statusEl) {
      statusEl.addEventListener('change', () => {
        const sw = document.getElementById('scheduleWrap');
        if (sw) sw.style.display = statusEl.value === 'scheduled' ? 'flex' : 'none';
      });
    }
    // Auto scheduler start
    const s = JSON.parse(localStorage.getItem('wph_auto_settings')||'{}');
    if (s.autoBlog) SEO.startAutoScheduler();
  }, 1000);

  console.log('✅ WePDFHub AI SEO Module loaded!');
}

// DOM ready ke baad init karo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
