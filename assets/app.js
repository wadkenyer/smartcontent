:root{
  --bg:#0f0f12; --card:#15161a; --text:#e9e9ec; --muted:#a6a6ad;
  --primary:#6c4cff; --primary-2:#7a5bff; --chip:#2a2b31; --ok:#22c55e; --warn:#f59e0b;
}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,system-ui,Arial;background:#111;color:var(--text)}
.appbar{position:sticky;top:0;z-index:10;background:#18181d;border-bottom:1px solid #24242a;padding:12px 16px;display:flex;align-items:center;gap:16px}
.brand{display:flex;gap:12px;align-items:center}
.logo{font-size:26px}
.title{font-weight:700}
.subtitle{font-size:12px;color:var(--muted)}
.tabs{display:flex;gap:8px;align-items:center;flex:1}
.tab,.pill{background:#1f2026;color:#cfd0d6;border:1px solid #2a2b31;padding:8px 12px;border-radius:12px;cursor:pointer}
.tab.active{background:var(--primary);color:white;border-color:transparent}
.pill{border-radius:999px}
.spacer{flex:1}
.banner{background:#23242b;color:#ddd;padding:10px 16px;text-align:center;border-bottom:1px solid #2a2b31}
.banner.hidden{display:none}
.link{background:none;border:none;color:#9fb4ff;cursor:pointer;margin-left:8px}

main{max-width:980px;margin:20px auto;padding:0 16px}
.screen{display:none}
.screen.active{display:block}

h1{font-size:32px;margin:16px 0}
h2{margin-top:28px}
.mt{margin-top:28px}
.grid{display:grid;gap:16px}
.cards{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.card{background:var(--card);border:1px solid #24242a;border-radius:16px;padding:16px}
.card-title{font-weight:700;margin-bottom:8px}
.btn{background:#2a2b31;border:1px solid #34353d;color:#e9e9ec;padding:10px 14px;border-radius:10px;cursor:pointer}
.btn.primary{background:var(--primary);border-color:transparent}
.row{display:flex;gap:8px;align-items:center}
.row.right{justify-content:flex-end}
.input,.textarea,select{width:100%;background:#1b1c22;border:1px solid #2a2b31;color:#e9e9ec;border-radius:10px;padding:10px}
.textarea{min-height:120px}
.pre{background:#111216;border:1px solid #2a2b31;padding:12px;border-radius:10px;white-space:pre-wrap}
.switch{display:flex;gap:10px;align-items:center;margin:10px 0}
.select{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.list{display:flex;flex-direction:column}
.list-item{background:#1b1c22;border:1px solid #2a2b31;border-radius:10px;padding:12px;margin:6px 0;text-align:left;color:#e9e9ec}
.list-item.danger{border-color:#3a1f1f;color:#ffb4b4}
.footer{margin-top:28px;color:var(--muted);display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}
.links a{color:#9fb4ff;text-decoration:none}
.chips{display:flex;gap:8px;margin:12px 0}
.chip{background:var(--chip);color:#cfd0d6;border:1px solid #2a2b31;padding:6px 10px;border-radius:999px}
.quick{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}
.qa{background:#1c1d23;border:1px solid #2a2b31;color:#e9e9ec;border-radius:12px;padding:12px}
.stats{grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
.stat{background:#1b1c22;border:1px solid #2a2b31;border-radius:12px;padding:14px;text-align:center}
.kpi{font-size:28px;font-weight:800}

dialog{border:none;border-radius:16px;background:#1b1c22;color:#e9e9ec;padding:16px;max-width:520px}
dialog::backdrop{background:rgba(0,0,0,.6)}
.about{text-align:center;color:var(--muted);margin:24px 0}
