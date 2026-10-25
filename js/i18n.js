/* ==========================================================================
   İçerik yükleme + Türkçe / İngilizce dil desteği
   - İçerik js/content.js içindeki window.SITE_CONTENT'ten gelir.
   - Admin panelinde kaydedilen sürüm localStorage'da ("site-content-override")
     durur; varsa önce o kullanılır (aynı tarayıcıda anında önizleme için).
   - Projeler, deneyim, eğitim, yetenekler, diller ve istatistikler
     data-render="..." kutularına buradan basılır (main.js'den ÖNCE).
   - data-i18n="anahtar"       → elemanın metni
   - data-i18n-html="anahtar"  → elemanın HTML içeriği
   - data-i18n-ph="anahtar"    → placeholder
   - data-i18n-aria="anahtar"  → aria-label
   Seçilen dil localStorage'da saklanır. Varsayılan: Türkçe.
   ========================================================================== */

const CONTENT_KEY = "site-content-override";
const LANG_KEY = "site-lang";

/* ---------- İçeriği oku: önce admin kaydı, yoksa dosyadaki varsayılan ---------- */
function loadSiteContent() {
    const def = window.SITE_CONTENT || {};
    let ov = null;
    try {
        const raw = localStorage.getItem(CONTENT_KEY);
        if (raw) ov = JSON.parse(raw);
    } catch (e) { ov = null; /* bozuk kayıt ya da localStorage kapalı */ }
    return mergeContent(def, ov);
}

// Kayıttaki alanlar dosyadakilerin üzerine yazılır; eksik metin anahtarları dosyadan tamamlanır
function mergeContent(def, ov) {
    const out = Object.assign({}, def);
    if (ov && typeof ov === "object") {
        Object.keys(ov).forEach((k) => {
            if (Array.isArray(def[k]) && !Array.isArray(ov[k])) return; // şekli bozuk alanı alma
            out[k] = ov[k];
        });
        out.profile = Object.assign({}, def.profile, ov.profile);
        const dt = def.text || {}, ot = ov.text || {};
        out.text = {
            tr: Object.assign({}, dt.tr, ot.tr),
            en: Object.assign({}, dt.en, ot.en)
        };
    }
    out.profile = out.profile || {};
    out.text = out.text || { tr: {}, en: {} };
    ["projects", "experience", "education", "skills", "skillBars", "languages", "stats"].forEach((k) => {
        if (!Array.isArray(out[k])) out[k] = [];
    });
    return out;
}

const SITE = loadSiteContent();

// Kişisel bilgiler (iki dilde ortak) — main.js de kullanır
const PROFILE = SITE.profile;

/* ---------- Sözlükler: statik metinler + listelerden üretilen anahtarlar ---------- */
function fillProfile(s) {
    return typeof s === "string"
        ? s.replace(/\{name\}/g, PROFILE.name || "").replace(/\{firstName\}/g, PROFILE.firstName || "")
        : s;
}

function buildDictionaries(site) {
    const dicts = { tr: {}, en: {} };
    ["tr", "en"].forEach((lang) => {
        const d = dicts[lang];
        const txt = (site.text && site.text[lang]) || {};
        Object.keys(txt).forEach((k) => (d[k] = fillProfile(txt[k])));
        // Çok dilli alan: {tr, en} ya da düz metin olabilir
        const pick = (v) => (v && typeof v === "object" ? (v[lang] !== undefined && v[lang] !== "" ? v[lang] : v.tr || v.en || "") : v || "");
        site.projects.forEach((p, i) => {
            d[`p.${i + 1}.t`] = pick(p.title);
            d[`p.${i + 1}.tag`] = pick(p.tag);
            d[`p.${i + 1}.d`] = pick(p.desc);
        });
        site.experience.forEach((x, i) => {
            ["date", "role", "company", "desc"].forEach((f) => (d[`exp.${i + 1}.${f}`] = pick(x[f])));
        });
        site.education.forEach((x, i) => {
            ["date", "school", "degree", "field", "desc"].forEach((f) => (d[`edu.${i + 1}.${f}`] = pick(x[f])));
        });
        site.skills.forEach((s, i) => (d[`skill.${i + 1}`] = pick(s)));
        site.skillBars.forEach((s, i) => (d[`bar.${i + 1}`] = pick(s.name)));
        site.languages.forEach((s, i) => (d[`langs.${i + 1}`] = pick(s)));
        site.stats.forEach((s, i) => (d[`stats.${i + 1}`] = pick(s.label)));
    });
    return dicts;
}

const I18N = buildDictionaries(SITE);

/* ---------- Listeleri sayfaya bas (şablonun orijinal işaretlemesiyle) ---------- */
function escAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Bağlantı yoksa görselin kendisi açılır (yüklenen data: görselleri yeni sekmede açılamaz)
function projectHref(p) {
    if (p.link) return p.link;
    if (p.image && !/^data:/i.test(p.image)) return p.image;
    return "";
}

function linkAttrs(href) {
    if (!href) return "";
    const external = /^(https?:|mailto:|tel:)/i.test(href) || /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(href);
    return ` href="${escAttr(href)}"` + (external ? ' target="_blank" rel="noopener"' : "");
}

// Görsel varsa art-img, yoksa soyut desen (art-1 … art-6)
function projectArt(p) {
    if (p.image) return '<div class="art-img"></div>';
    const art = /^art-[1-6]$/.test(p.art) ? p.art : "art-1";
    return `<div class="${art}"></div>`;
}

function setArtImages(container, list) {
    container.querySelectorAll("[data-pi]").forEach((el) => {
        const p = list[+el.dataset.pi];
        const img = el.querySelector(".art-img");
        if (img && p && p.image) img.style.backgroundImage = 'url("' + String(p.image).replace(/"/g, "%22") + '")';
        el.removeAttribute("data-pi");
    });
}

function renderContent(site) {
    const box = (name) => document.querySelector(`[data-render="${name}"]`);
    const pad = (n) => String(n).padStart(2, "0");
    let el;

    // Ana sayfa: öne çıkan projeler (yatay kaydırma)
    if ((el = box("projects-featured"))) {
        const list = site.projects.map((p, i) => ({ p, i })).filter((x) => x.p.featured);
        el.innerHTML = list.map(({ p, i }, n) =>
            `<a class="h-card"${linkAttrs(projectHref(p))} data-cursor="view" data-pi="${i}">` +
                `<div class="thumb tilt">${projectArt(p)}<span class="glare"></span></div>` +
                `<div class="meta"><div><h3 data-i18n="p.${i + 1}.t"></h3><small data-i18n="p.${i + 1}.tag"></small></div><span class="idx">(${pad(n + 1)})</span></div>` +
            `</a>`).join("");
        setArtImages(el, site.projects);
    }

    // Projeler sayfası: tüm projeler
    if ((el = box("projects"))) {
        const delays = ["0.0", "0.1", "0.2"];
        el.innerHTML = site.projects.map((p, i) =>
            `<div class="col-md-6" data-reveal data-delay="${delays[i % 3]}">` +
                `<a class="project-tile d-block text-decoration-none"${linkAttrs(projectHref(p))} data-cursor="view" data-pi="${i}">` +
                    `<div class="thumb tilt clip-reveal">${projectArt(p)}<span class="glare"></span></div>` +
                    `<div class="body">` +
                        `<div class="tag mb-2" data-i18n="p.${i + 1}.tag"></div>` +
                        `<h3 class="fw-bolder" data-i18n="p.${i + 1}.t"></h3>` +
                        `<p class="text-muted mb-3" data-i18n="p.${i + 1}.d"></p>` +
                    `</div>` +
                `</a>` +
            `</div>`).join("");
        setArtImages(el, site.projects);
    }

    // Özgeçmiş: deneyim kartları
    if ((el = box("experience"))) {
        el.innerHTML = '<span class="tl-fill"></span>' + site.experience.map((x, i) =>
            `<div class="card rounded-4 mb-4" data-reveal><div class="card-body p-5"><div class="row align-items-center gx-5">` +
                `<div class="col text-center text-lg-start mb-4 mb-lg-0"><div class="inner-box p-4 rounded-4">` +
                    `<div class="text-primary fw-bolder mb-2" data-i18n="exp.${i + 1}.date"></div>` +
                    `<div class="small fw-bolder" data-i18n="exp.${i + 1}.role"></div>` +
                    `<div class="small text-muted" data-i18n="exp.${i + 1}.company"></div>` +
                `</div></div>` +
                `<div class="col-lg-8"><div data-i18n="exp.${i + 1}.desc"></div></div>` +
            `</div></div></div>`).join("");
    }

    // Özgeçmiş: eğitim kartları
    if ((el = box("education"))) {
        el.innerHTML = '<span class="tl-fill"></span>' + site.education.map((x, i) =>
            `<div class="card rounded-4 mb-4" data-reveal><div class="card-body p-5"><div class="row align-items-center gx-5">` +
                `<div class="col text-center text-lg-start mb-4 mb-lg-0"><div class="inner-box p-4 rounded-4">` +
                    `<div class="text-secondary fw-bolder mb-2" data-i18n="edu.${i + 1}.date"></div>` +
                    `<div class="mb-2"><div class="small fw-bolder" data-i18n="edu.${i + 1}.school"></div></div>` +
                    `<div class="fst-italic">` +
                        `<div class="small text-muted" data-i18n="edu.${i + 1}.degree"></div>` +
                        `<div class="small text-muted" data-i18n="edu.${i + 1}.field"></div>` +
                    `</div>` +
                `</div></div>` +
                `<div class="col-lg-8"><div data-i18n="edu.${i + 1}.desc"></div></div>` +
            `</div></div></div>`).join("");
    }

    // Yetenek etiketleri, uzmanlık çubukları, diller
    if ((el = box("skills"))) {
        el.innerHTML = site.skills.map((s, i) => `<span class="skill-tag" data-i18n="skill.${i + 1}"></span>`).join("");
    }
    if ((el = box("skillbars"))) {
        el.innerHTML = site.skillBars.map((s, i) => {
            const w = Math.max(0, Math.min(100, parseInt(s.percent, 10) || 0));
            return `<div class="col-md-6"><div class="d-flex justify-content-between small mb-2"><span data-i18n="bar.${i + 1}"></span><span class="text-muted">${w}%</span></div><div class="skill-bar"><i style="--w: ${w}%"></i></div></div>`;
        }).join("");
    }
    if ((el = box("languages"))) {
        el.innerHTML = site.languages.map((s, i) =>
            `<div class="col"><div class="inner-box p-3 rounded-4 small fw-bolder h-100" data-i18n="langs.${i + 1}"></div></div>`).join("");
    }

    // Ana sayfa: sayaçlar
    if ((el = box("stats"))) {
        const col = { 1: 12, 2: 6, 3: 4, 4: 3 }[site.stats.length] || 4;
        el.innerHTML = site.stats.map((s, i) => {
            const n = parseInt(s.number, 10) || 0;
            const sup = s.suffix ? `<sup>${escAttr(s.suffix)}</sup>` : "";
            return `<div class="col-sm-${col}"><span class="rule"></span><div class="stat">` +
                `<div class="num"><span data-count="${n}">${n}</span>${sup}</div>` +
                `<div class="label" data-i18n="stats.${i + 1}"></div>` +
            `</div></div>`;
        }).join("");
    }
}

/* ---------- Dil ---------- */
function getLang() {
    try {
        const saved = localStorage.getItem(LANG_KEY);
        if (saved && I18N[saved]) return saved;
    } catch (e) { /* localStorage kapalı olabilir */ }
    return "tr";
}

function t(key, lang) {
    const dict = I18N[lang || getLang()];
    return dict[key] !== undefined ? dict[key] : key;
}

function applyLang(lang) {
    const dict = I18N[lang];
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const v = dict[el.dataset.i18n];
        if (v !== undefined) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
        const v = dict[el.dataset.i18nHtml];
        if (v !== undefined) el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
        const v = dict[el.dataset.i18nPh];
        if (v !== undefined) el.placeholder = v;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
        const v = dict[el.dataset.i18nAria];
        if (v !== undefined) el.setAttribute("aria-label", v);
    });

    const titleKey = document.body.dataset.title;
    if (titleKey && dict[titleKey]) document.title = dict[titleKey];

    document.querySelectorAll(".lang-switch button").forEach((b) => {
        const on = b.dataset.lang === lang;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on);
    });

    // Ortak profil alanları (boş bırakılan sosyal bağlantılar gizlenir)
    document.querySelectorAll("[data-profile]").forEach((el) => {
        const v = PROFILE[el.dataset.profile];
        if (v === undefined) return;
        if (el.tagName === "A" && el.dataset.profileHref !== undefined) {
            const p = el.dataset.profile;
            el.hidden = !v;
            el.href = p === "email" ? "mailto:" + v : p === "phone" ? "tel:+9" + v.replace(/\s/g, "") : v;
        } else {
            el.textContent = v;
        }
    });

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
}

function setLang(lang) {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* yoksay */ }
    applyLang(lang);
}

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".lang-switch button");
    if (btn) setLang(btn.dataset.lang);
});

renderContent(SITE);
applyLang(getLang());
