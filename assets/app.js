:root{
  --bg:#0b0b10;
  --card:#141420;
  --muted:#aab0c0;
  --text:#e8ebf5;
  --brand:#6f4af7;
  --brand2:#8a5cff;
  --chip:#23233a;
  --accent:#7dd3fc;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:linear-gradient(180deg,#0b0b10,#111425);color:var(--text);font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
a{color:var(--accent);text-decoration:none}
.topbar{position:sticky;top:0;background:rgba(17,20,37,.85);backdrop-filter:blur(10px);z-index:1000;border-bottom:1px solid #23263d}
.brand{display:flex;gap:12px;align-items:center;padding:14px 18px}
.brand .logo{font-size:28px}
.brand h1{margin:0;font-size:20px}
.brand p{margin:0;color:var(--muted);font-size:12px}
.tabs{display:flex;gap:8px;flex-wrap:wrap;padding:0 16px 14px}
.tabs button{background:#1a1a2b;border:1px solid #2a2d44;color:var(--text);padding:8px 12px;border-radius:10px;cursor:pointer}
.tabs button.active{background:linear-gradient(90deg,var(--brand),var(--brand2));border-color:transparent}

.banner{display:flex;gap:12px;align-items:center;justify-content:space-between;border:1px dashed #39405f;background:#121326;margin:14px auto;border-radius:12px;padding:10px 14px;max-width:1100px}
.banner button{background:linear-gradient(90deg,var(--brand),var(--brand2));border:none;color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer}
.hidden{display:none}

.container{max-width:1100px;margin:22px auto;padding:0 16px}
h2{font-size:32px;margin:.2em 0 .3em}
.lead{color:var(--muted);font-size:18px}
.wave{display:inline-block;transform-origin:70% 70%;animation:w 2.5s infinite}
@keyframes w{0%{transform:rotate(0)}15%{transform:rotate(18deg)}30%{transform:rotate(-8deg)}45%{transform:rotate(14deg)}60%{transform:rotate(-4deg)}75%{transform:rotate(10deg)}100%{transform:rotate(0)}}

.chips{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 18px}
.chip{background:var(--chip);border:1px solid #2a2d44;color:#cdd3f5;padding:6px 10px;border-radius:999px;font-size:12px}

.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.card{background:var(--card);border:1px solid #222641;border-radius:16px;padding:16px}
.card-head{font-weight:700;margin-bottom:6px}
.card p{color:var(--muted);min-height:48px}
button.primary{background:linear-gradient(90deg,var(--brand),var(--brand2));border:none;color:#fff;border-radius:10px;padding:10px 12px;cursor:pointer}

.tab-pane{display:none}
.tab-pane.active{display:block}

.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin:10px 0 6px}
.mini-card{background:#16172a;border:1px solid #2a2d44;border-radius:14px;padding:14px}
.mini-card .tag{font-size:12px;color:#9db0ff;margin-bottom:6px}
.mini-card .title{font-weight:600}

.hint{margin-top:10px}
.muted{color:#b2b8cf}

.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}
.stat{background:#16172a;border:1px solid #2a2d44;border-radius:14px;padding:16px;text-align:center}
.kpi{font-size:26px;font-weight:800}
.label{color:var(--muted)}

.group{background:#141527;border:1px solid #23263f;border-radius:16px;padding:14px;margin:14px 0}
.group h4{margin:0 0 10px}
.form input,.form textarea{width:100%;background:#111225;border:1px solid #2a2d44;border-radius:10px;color:var(--text);padding:10px;margin:6px 0}
.form button{background:#242849;border:1px solid #3b4170;color:#e7e9ff;border-radius:10px;padding:10px 12px;cursor:pointer}

.switch{display:block;margin:8px 0}
.switch input{margin-right:8px}
.select label{display:block;margin:6px 0}
.select select{background:#111225;border:1px solid #2a2d44;color:var(--text);padding:10px;border-radius:10px}

.wallet{display:flex;gap:6px;align-items:center}
.wallet input{flex:1;background:#111225;border:1px solid #2a2d44;border-radius:10px;color:var(--text);padding:10px}

.list{display:flex;gap:10px;flex-wrap:wrap}
.list > *{background:#111225;border:1px solid #2a2d44;color:#dbe1ff;padding:10px 12px;border-radius:10px}

.about{display:flex;gap:10px;align-items:center;flex-wrap:wrap;color:#c7cdf3}

.footer{border-top:1px solid #23263d;margin-top:40px;padding:18px 16px;color:#b7bdd6}
.footer .links{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.footer .contact{color:#c8ceea}
