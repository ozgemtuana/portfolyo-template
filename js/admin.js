/* ==========================================================================
   Yönetim paneli (admin.html)
   - İçerik js/content.js'den (window.SITE_CONTENT) okunur; daha önce panelde
     kaydedilmiş bir sürüm varsa localStorage'dan ("site-content-override") gelir.
   - "Kaydet" içeriği localStorage'a yazar → aynı tarayıcıda site anında güncellenir.
   - Kalıcı yayın için "content.js indir" ile dosyayı üretip js/content.js yerine koy.

   GÜVENLİK NOTU: Buradaki şifre ekranı yalnızca tarayıcı tarafında çalışır ve
   gerçek bir güvenlik DEĞİLDİR. Site statik (sunucu yok); şifre özeti
   localStorage'da durur ve tarayıcı araçlarıyla kolayca aşılabilir. Amaç sadece
   panelin yanlışlıkla açılmasını önlemek.
   ========================================================================== */

(function () {
    const CONTENT_KEY = "site-content-override";
    const PASS_KEY = "site-admin-pass";
    const SESSION_KEY = "site-admin-session";
    const TAB_KEY = "site-admin-tab";
    const DEFAULT_PASS = "admin";
    const IMG_MAX = 1600;      // yüklenen görselin en uzun kenarı (px)
    const IMG_QUALITY = 0.85;  // JPEG kalitesi

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    /* ---------- localStorage / sessionStorage: her erişim try/catch içinde ---------- */
    const store = {
        get(k, ss) { try { return (ss ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
        set(k, v, ss) { try { (ss ? sessionStorage : localStorage).setItem(k, v); return true; } catch (e) { return e; } },
        del(k, ss) { try { (ss ? sessionStorage : localStorage).removeItem(k); } catch (e) { /* yoksay */ } }
    };

    /* ---------- İçerik: dosyadaki varsayılan + varsa kayıt (i18n.js ile aynı mantık) ---------- */
    const FILE_DEFAULT = clone(window.SITE_CONTENT || {});
    const LISTS = ["projects", "experience", "education", "skills", "skillBars", "languages", "stats"];

    function mergeContent(def, ov) {
        const out = Object.assign({}, clone(def));
        if (ov && typeof ov === "object") {
            Object.keys(ov).forEach((k) => {
                if (Array.isArray(def[k]) && !Array.isArray(ov[k])) return;
                out[k] = clone(ov[k]);
            });
            out.profile = Object.assign({}, def.profile, ov.profile);
            const dt = def.text || {}, ot = ov.text || {};
            out.text = { tr: Object.assign({}, dt.tr, ot.tr), en: Object.assign({}, dt.en, ot.en) };
        }
        out.profile = out.profile || {};
        out.text = out.text || { tr: {}, en: {} };
        LISTS.forEach((k) => { if (!Array.isArray(out[k])) out[k] = []; });
        return out;
    }

    function readOverride() {
        const raw = store.get(CONTENT_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw); } catch (e) { return null; }
    }

    let state = mergeContent(FILE_DEFAULT, readOverride());
    let dirty = false;

    /* ---------- SHA-256: crypto.subtle (güvenli bağlam) yoksa saf JS yedeği ---------- */
    // crypto.subtle yalnızca https / localhost gibi güvenli bağlamlarda vardır.
    // file:// gibi durumlarda aynı sonucu veren saf JS sürümü kullanılır.
    function sha256Fallback(str) {
        const bytes = Array.from(new TextEncoder().encode(str));
        const maxWord = Math.pow(2, 32);
        const H = [], K = [];
        // Sabitler: ilk 64 asal sayının karekök / küpkök kesirli kısımları
        for (let c = 2, n = 0; n < 64; c++) {
            let prime = true;
            for (let d = 2; d * d <= c; d++) if (c % d === 0) { prime = false; break; }
            if (!prime) continue;
            if (n < 8) H[n] = (Math.pow(c, 1 / 2) * maxWord) | 0;
            K[n++] = (Math.pow(c, 1 / 3) * maxWord) | 0;
        }
        const bitLen = bytes.length * 8;
        bytes.push(0x80);
        while (bytes.length % 64 !== 56) bytes.push(0);
        for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 0xff);
        const rotr = (x, n) => (x >>> n) | (x << (32 - n));
        const W = new Array(64);
        for (let off = 0; off < bytes.length; off += 64) {
            for (let i = 0; i < 16; i++) {
                const j = off + i * 4;
                W[i] = (bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3];
            }
            for (let i = 16; i < 64; i++) {
                const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
                const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
                W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
            }
            let [a, b, c, d, e, f, g, h] = H;
            for (let i = 0; i < 64; i++) {
                const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
                const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
                h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
            }
            H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
        }
        return H.map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
    }

    async function sha256(str) {
        try {
            if (window.crypto && crypto.subtle && window.isSecureContext) {
                const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
                return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
            }
        } catch (e) { /* yedeğe düş */ }
        return sha256Fallback(str);
    }
    window.__adminSha256Fallback = sha256Fallback; // test için

    async function checkPass(pass) {
        const saved = store.get(PASS_KEY);
        const target = saved || (await sha256(DEFAULT_PASS));
        return (await sha256(pass)) === target;
    }

    /* ---------- Bildirim (toast) ---------- */
    let toastTimer = null;
    function toast(msg, type) {
        const el = $("#toast");
        el.textContent = msg;
        el.dataset.type = type || "ok";
        el.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
    }

    /* ---------- Kayıt durumu ---------- */
    function setDirty(v) {
        dirty = v;
        const s = $("#status");
        s.dataset.state = v ? "dirty" : "saved";
        s.querySelector("span").textContent = v ? "Kaydedilmemiş değişiklik" : (readOverride() ? "Kaydedildi" : "Dosyadaki içerik");
    }

    function save() {
        const r = store.set(CONTENT_KEY, JSON.stringify(state));
        if (r !== true) {
            const full = r && /quota/i.test(r.name + r.message);
            toast(full ? "Kaydedilemedi: tarayıcı depolama alanı dolu. Görselleri küçült ya da yol olarak gir." : "Kaydedilemedi: tarayıcı depolamasına erişilemiyor.", "error");
            return false;
        }
        setDirty(false);
        toast("Kaydedildi — site bu tarayıcıda güncellendi.");
        if (currentTab === "aktar") renderTab();
        return true;
    }

    window.addEventListener("beforeunload", (e) => {
        if (!dirty) return;
        e.preventDefault();
        e.returnValue = "";
    });

    /* ---------- Yol (path) ile okuma / yazma: "projects|0|title|tr" ---------- */
    function getPath(path) {
        return path.split("|").reduce((o, k) => (o == null ? undefined : o[k]), state);
    }
    function setPath(path, val) {
        const ks = path.split("|");
        let o = state;
        for (let i = 0; i < ks.length - 1; i++) {
            if (o[ks[i]] == null || typeof o[ks[i]] !== "object") o[ks[i]] = {};
            o = o[ks[i]];
        }
        o[ks[ks.length - 1]] = val;
    }

    /* ---------- Form parçaları ---------- */
    function input(path, opts = {}) {
        const v = getPath(path);
        const attrs = `data-path="${esc(path)}"` + (opts.type === "number" ? ' data-type="number"' : "") + (opts.ph ? ` placeholder="${esc(opts.ph)}"` : "");
        if (opts.area) return `<textarea rows="${opts.rows || 2}" ${attrs}>${esc(v)}</textarea>`;
        return `<input type="${opts.type === "number" ? "number" : opts.type || "text"}" ${opts.min !== undefined ? `min="${opts.min}" max="${opts.max}"` : ""} value="${esc(v)}" ${attrs} />`;
    }

    function field(label, path, opts = {}) {
        return `<label class="field${opts.wide ? " wide" : ""}"><span class="field-label">${label}</span>${input(path, opts)}${opts.help ? `<span class="help">${opts.help}</span>` : ""}</label>`;
    }

    // İki dilli alan: TR ve EN yan yana
    function biField(label, base, opts = {}) {
        return `<div class="bi${opts.wide === false ? "" : " wide"}"><span class="field-label">${label}</span><div class="bi-row">` +
            `<label class="bi-col"><span class="lang">TR</span>${input(base + "|tr", opts)}</label>` +
            `<label class="bi-col"><span class="lang">EN</span>${input(base + "|en", opts)}</label>` +
            `</div>${opts.help ? `<span class="help">${opts.help}</span>` : ""}</div>`;
    }

    function itemTools(list, i, len) {
        return `<div class="item-tools">` +
            `<button type="button" class="btn btn-ghost btn-icon" data-act="up" data-list="${list}" data-i="${i}" ${i === 0 ? "disabled" : ""} title="Yukarı taşı" aria-label="Yukarı taşı"><i class="bi bi-arrow-up"></i></button>` +
            `<button type="button" class="btn btn-ghost btn-icon" data-act="down" data-list="${list}" data-i="${i}" ${i === len - 1 ? "disabled" : ""} title="Aşağı taşı" aria-label="Aşağı taşı"><i class="bi bi-arrow-down"></i></button>` +
            `<button type="button" class="btn btn-ghost btn-icon danger" data-act="del" data-list="${list}" data-i="${i}" title="Sil" aria-label="Sil"><i class="bi bi-trash3"></i></button>` +
            `</div>`;
    }

    function pageHead(title, sub) {
        return `<div class="page-head"><h1>${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ""}</div>`;
    }

    const bi = () => ({ tr: "", en: "" });
    const BLANK = {
        projects: () => ({ title: bi(), tag: bi(), desc: bi(), image: "", art: "art-1", link: "", featured: true }),
        experience: () => ({ date: bi(), role: bi(), company: bi(), desc: bi() }),
        education: () => ({ date: bi(), school: bi(), degree: bi(), field: bi(), desc: bi() }),
        skills: () => bi(),
        skillBars: () => ({ name: bi(), percent: 50 }),
        languages: () => bi(),
        stats: () => ({ number: 0, suffix: "", label: bi() })
    };

    /* ---------- Metin anahtarlarının grupları ---------- */
    const TEXT_GROUPS = [
        ["meta", "Sekme başlıkları"],
        ["nav", "Menü"],
        ["hero", "Ana sayfa · Giriş"],
        ["marquee", "Ana sayfa · Kayan yazı bantları"],
        ["about", "Ana sayfa · Hakkımda"],
        ["work", "Ana sayfa · Seçili işler"],
        ["services", "Ana sayfa · Hizmetler"],
        ["cta", "Ana sayfa · Kapanış çağrısı"],
        ["resume", "Özgeçmiş sayfası"],
        ["projects", "Projeler sayfası"],
        ["contact", "İletişim sayfası"],
        ["footer", "Alt bilgi (tüm sayfalar)"],
        ["cursor", "İmleç etiketleri"]
    ];
    // Bu anahtarlar HTML olarak basılır (<em> ile italik vurgu)
    const HTML_KEYS = ["hero.line2", "work.title", "cta.big", "resume.title", "projects.title", "contact.title"];

    /* ---------- Sekmeler ---------- */
    const TABS = {
        profil() {
            const p = (k) => "profile|" + k;
            return pageHead("Profil", "İki dilde ortak bilgiler. Ad, sekme başlıklarında ve alt bilgide de kullanılır.") +
                `<div class="card"><div class="grid">` +
                field("Ad soyad", p("name")) +
                field("Ad (selamlama)", p("firstName"), { help: "Ana sayfadaki “ben <em>Adın</em>” kısmı." }) +
                field("E-posta", p("email"), { type: "email" }) +
                field("Telefon", p("phone"), { help: "Örn. 0500 000 00 00" }) +
                field("Konum", p("location")) +
                field("GitHub", p("github"), { type: "url", ph: "https://github.com/…" }) +
                field("Instagram", p("instagram"), { type: "url", ph: "https://www.instagram.com/…" }) +
                field("LinkedIn (isteğe bağlı)", p("linkedin"), { type: "url", ph: "https://www.linkedin.com/in/…", help: "Boş bırakılırsa sitede gösterilmez." }) +
                `</div></div>`;
        },

        metinler() {
            const tr = state.text.tr || {}, en = state.text.en || {};
            const keys = [...new Set([...Object.keys(tr), ...Object.keys(en)])];
            const groups = TEXT_GROUPS.map(([pre, label]) => ({ label, keys: keys.filter((k) => k.split(".")[0] === pre) }));
            const known = new Set(TEXT_GROUPS.map((g) => g[0]));
            const other = keys.filter((k) => !known.has(k.split(".")[0]));
            if (other.length) groups.push({ label: "Diğer", keys: other });
            return pageHead("Metinler", "Sitedeki sabit yazılar. Sol sütun Türkçe, sağ sütun İngilizce. <code>{name}</code> ve <code>{firstName}</code> profildeki adla değiştirilir.") +
                `<div class="search"><i class="bi bi-search"></i><input type="search" id="textSearch" placeholder="Metinlerde ara…" /></div>` +
                groups.filter((g) => g.keys.length).map((g) =>
                    `<section class="card text-group"><h2>${g.label}</h2>` +
                    g.keys.map((k) => {
                        const long = Math.max(String(tr[k] || "").length, String(en[k] || "").length) > 70;
                        const isHtml = HTML_KEYS.includes(k);
                        return `<div class="text-row" data-key="${esc(k)}">` +
                            `<div class="text-key"><code>${esc(k)}</code>${isHtml ? '<span class="pill">HTML · &lt;em&gt; italik</span>' : ""}</div>` +
                            `<div class="bi-row">` +
                            `<label class="bi-col"><span class="lang">TR</span>${input("text|tr|" + k, { area: long, rows: 3 })}</label>` +
                            `<label class="bi-col"><span class="lang">EN</span>${input("text|en|" + k, { area: long, rows: 3 })}</label>` +
                            `</div></div>`;
                    }).join("") + `</section>`).join("");
        },

        projeler() {
            const list = state.projects;
            const arts = [1, 2, 3, 4, 5, 6].map((n) => "art-" + n);
            return pageHead("Projeler", "Sıralama sitede de aynıdır. “Ana sayfada göster” işaretli olanlar ana sayfadaki yatay kaydırmada çıkar.") +
                list.map((p, i) => {
                    const base = "projects|" + i;
                    const size = p.image && /^data:/.test(p.image) ? Math.round((p.image.length * 3) / 4 / 1024) + " KB" : "";
                    return `<article class="card item project">` +
                        `<div class="item-head"><span class="idx">(${String(i + 1).padStart(2, "0")})</span><h2>${esc((p.title && p.title.tr) || "Yeni proje")}</h2>${itemTools("projects", i, list.length)}</div>` +
                        `<div class="project-grid">` +
                            `<div class="media">` +
                                `<div class="thumb ${p.image ? "" : esc(/^art-[1-6]$/.test(p.art) ? p.art : "art-1")}" data-thumb="${i}"></div>` +
                                `<div class="media-actions">` +
                                    `<label class="btn btn-ghost btn-sm"><i class="bi bi-upload"></i> Görsel yükle<input type="file" accept="image/*" data-upload="${i}" hidden /></label>` +
                                    (p.image ? `<button type="button" class="btn btn-ghost btn-sm danger" data-act="noimg" data-i="${i}"><i class="bi bi-x-lg"></i> Görseli kaldır</button>` : "") +
                                `</div>` +
                                (size ? `<span class="help">Yüklenen görsel · ${size}</span>` : "") +
                                `<label class="field"><span class="field-label">Görsel yolu</span><input type="text" data-path="${base}|image" data-rerender value="${esc(/^data:/.test(p.image) ? "" : p.image)}" placeholder="${/^data:/.test(p.image) ? "(yüklenen görsel kullanılıyor)" : "assets/projects/ornek.jpg"}" /></label>` +
                                (!p.image ? `<label class="field"><span class="field-label">Görsel yoksa desen</span><select data-path="${base}|art" data-rerender>${arts.map((a) => `<option value="${a}" ${p.art === a ? "selected" : ""}>Desen ${a.slice(4)}</option>`).join("")}</select></label>` : "") +
                                `<label class="switch"><input type="checkbox" data-path="${base}|featured" ${p.featured ? "checked" : ""} /><span class="track"><i></i></span>Ana sayfada göster</label>` +
                            `</div>` +
                            `<div class="grid">` +
                                biField("Başlık", base + "|title") +
                                biField("Etiket", base + "|tag") +
                                biField("Açıklama", base + "|desc", { area: true }) +
                                field("Bağlantı", base + "|link", { wide: true, ph: "https://… ya da sayfa.html", help: "Boş bırakılırsa kart görseli yeni sekmede açar (yüklenen görsellerde bağlantı olmaz)." }) +
                            `</div>` +
                        `</div>` +
                    `</article>`;
                }).join("") +
                `<button type="button" class="btn btn-add" data-act="add" data-list="projects"><i class="bi bi-plus-lg"></i> Yeni proje ekle</button>`;
        },

        deneyim() {
            const list = state.experience;
            return pageHead("Deneyim", "Özgeçmiş sayfasındaki zaman çizelgesi.") +
                list.map((x, i) => {
                    const b = "experience|" + i;
                    return `<article class="card item"><div class="item-head"><span class="idx">(${String(i + 1).padStart(2, "0")})</span><h2>${esc((x.role && x.role.tr) || "Yeni deneyim")}</h2>${itemTools("experience", i, list.length)}</div>` +
                        `<div class="grid">` + biField("Tarih", b + "|date") + biField("Pozisyon", b + "|role") + biField("Kurum", b + "|company") + biField("Açıklama", b + "|desc", { area: true, rows: 3 }) + `</div></article>`;
                }).join("") +
                `<button type="button" class="btn btn-add" data-act="add" data-list="experience"><i class="bi bi-plus-lg"></i> Deneyim ekle</button>`;
        },

        egitim() {
            const list = state.education;
            return pageHead("Eğitim", "Özgeçmiş sayfasındaki eğitim kartları.") +
                list.map((x, i) => {
                    const b = "education|" + i;
                    return `<article class="card item"><div class="item-head"><span class="idx">(${String(i + 1).padStart(2, "0")})</span><h2>${esc((x.school && x.school.tr) || "Yeni eğitim")}</h2>${itemTools("education", i, list.length)}</div>` +
                        `<div class="grid">` + biField("Tarih", b + "|date") + biField("Okul", b + "|school") + biField("Derece / sınıf", b + "|degree") + biField("Bölüm", b + "|field") + biField("Açıklama", b + "|desc", { area: true, rows: 3 }) + `</div></article>`;
                }).join("") +
                `<button type="button" class="btn btn-add" data-act="add" data-list="education"><i class="bi bi-plus-lg"></i> Eğitim ekle</button>`;
        },

        yetenekler() {
            const row = (list, i, len, inner) => `<div class="mini-row">${inner}${itemTools(list, i, len)}</div>`;
            const biInline = (base) => `<div class="bi-row">` +
                `<label class="bi-col"><span class="lang">TR</span>${input(base + "|tr")}</label>` +
                `<label class="bi-col"><span class="lang">EN</span>${input(base + "|en")}</label></div>`;
            return pageHead("Yetenekler", "Özgeçmiş sayfasındaki etiketler, uzmanlık çubukları ve diller.") +
                `<section class="card"><h2>Etiketler</h2>` +
                state.skills.map((s, i) => row("skills", i, state.skills.length, biInline("skills|" + i))).join("") +
                `<button type="button" class="btn btn-add" data-act="add" data-list="skills"><i class="bi bi-plus-lg"></i> Etiket ekle</button></section>` +

                `<section class="card"><h2>Uzmanlık çubukları</h2>` +
                state.skillBars.map((s, i) => row("skillBars", i, state.skillBars.length,
                    `<div class="bar-edit">${biInline("skillBars|" + i + "|name")}` +
                    `<label class="pct"><span class="lang">%</span><input type="range" min="0" max="100" step="1" value="${esc(s.percent)}" data-path="skillBars|${i}|percent" data-type="number" data-sync="pct-${i}" />` +
                    `<input type="number" min="0" max="100" value="${esc(s.percent)}" data-path="skillBars|${i}|percent" data-type="number" data-sync="pct-${i}" /></label></div>`)).join("") +
                `<button type="button" class="btn btn-add" data-act="add" data-list="skillBars"><i class="bi bi-plus-lg"></i> Çubuk ekle</button></section>` +

                `<section class="card"><h2>Diller</h2>` +
                state.languages.map((s, i) => row("languages", i, state.languages.length, biInline("languages|" + i))).join("") +
                `<button type="button" class="btn btn-add" data-act="add" data-list="languages"><i class="bi bi-plus-lg"></i> Dil ekle</button></section>`;
        },

        istatistikler() {
            const list = state.stats;
            return pageHead("İstatistikler", "Ana sayfadaki “Hakkımda” bölümünde sayarak artan rakamlar.") +
                list.map((s, i) => {
                    const b = "stats|" + i;
                    return `<article class="card item"><div class="item-head"><span class="idx">(${String(i + 1).padStart(2, "0")})</span><h2>${esc(s.number)}${esc(s.suffix)}</h2>${itemTools("stats", i, list.length)}</div>` +
                        `<div class="grid">` + field("Sayı", b + "|number", { type: "number" }) + field("Ek (örn. +)", b + "|suffix") + biField("Etiket", b + "|label") + `</div></article>`;
                }).join("") +
                `<button type="button" class="btn btn-add" data-act="add" data-list="stats"><i class="bi bi-plus-lg"></i> İstatistik ekle</button>`;
        },

        aktar() {
            const raw = store.get(CONTENT_KEY);
            const kb = raw ? Math.round((raw.length * 2) / 1024) : 0;
            return pageHead("Dışa / İçe aktar", "Değişiklikleri kalıcı hâle getir, yedek al ya da geri yükle.") +
                `<section class="card"><h2>Kalıcı olarak yayınla</h2>` +
                `<ol class="steps"><li>Değişiklikleri yap ve <b>Kaydet</b>'e bas (sadece bu tarayıcıda görünür).</li>` +
                `<li><b>content.js indir</b> ile güncel içerik dosyasını indir.</li>` +
                `<li>İndirdiğin dosyayı projede <code>js/content.js</code> dosyasının yerine koy ve siteyi yayınla.</li>` +
                `<li>İstersen sonra “Dosyadaki içeriğe dön” ile tarayıcı kaydını temizle.</li></ol>` +
                `<div class="actions"><button type="button" class="btn btn-primary" data-act="export-js"><i class="bi bi-filetype-js"></i> content.js indir</button></div>` +
                `<p class="help">Yüklenen görseller dosyanın içine gömülür (data URL). Büyük görseller için dosyayı <code>assets/projects/</code> klasörüne koyup “Görsel yolu” alanını kullanmak daha hafiftir.</p></section>` +

                `<section class="card"><h2>Yedek (JSON)</h2>` +
                `<div class="actions"><button type="button" class="btn btn-ghost" data-act="export-json"><i class="bi bi-download"></i> JSON yedeği indir</button>` +
                `<button type="button" class="btn btn-ghost" data-act="import"><i class="bi bi-upload"></i> İçe aktar (.json / content.js)</button></div>` +
                `<p class="help">İçe aktarılan içerik panele yüklenir; sitede görmek için ardından Kaydet'e bas.</p></section>` +

                `<section class="card danger-zone"><h2>Dosyadaki içeriğe dön</h2>` +
                `<p class="muted">Tarayıcıdaki kaydı siler; site yeniden <code>js/content.js</code> içeriğini kullanır. ${raw ? `Şu anki kayıt: yaklaşık <b>${kb} KB</b> (tarayıcı sınırı genelde ~5 MB).` : "Şu anda tarayıcıda kayıtlı bir değişiklik yok."}</p>` +
                `<div class="actions"><button type="button" class="btn btn-danger" data-act="reset"><i class="bi bi-arrow-counterclockwise"></i> Varsayılanlara sıfırla</button></div></section>`;
        },

        ayarlar() {
            return pageHead("Ayarlar", "Panel şifresi.") +
                `<section class="card"><h2>Şifreyi değiştir</h2>` +
                `<form id="passForm" class="grid" autocomplete="off">` +
                `<label class="field"><span class="field-label">Mevcut şifre</span><input type="password" id="passOld" autocomplete="current-password" required /></label>` +
                `<label class="field"><span class="field-label">Yeni şifre</span><input type="password" id="passNew" autocomplete="new-password" minlength="4" required /></label>` +
                `<label class="field"><span class="field-label">Yeni şifre (tekrar)</span><input type="password" id="passNew2" autocomplete="new-password" minlength="4" required /></label>` +
                `<div class="actions wide"><button class="btn btn-primary" type="submit"><i class="bi bi-key"></i> Şifreyi kaydet</button></div></form></section>` +
                `<section class="card note-card"><h2><i class="bi bi-shield-exclamation"></i> Güvenlik hakkında</h2>` +
                `<p class="muted">Bu panel tamamen tarayıcıda çalışır; sunucu yoktur. Şifre, SHA-256 özeti olarak bu tarayıcının localStorage'ında saklanır. ` +
                `Bu <b>gerçek bir güvenlik değildir</b>: sayfanın kodu ve içerik dosyaları herkese açıktır, değişiklikler de yalnızca bu tarayıcıda görünür. ` +
                `Siteyi kalıcı olarak değiştirmenin tek yolu indirilen <code>content.js</code> dosyasını yayınlamaktır.</p></section>`;
        }
    };

    /* ---------- Sekme çizimi ---------- */
    let currentTab = store.get(TAB_KEY, true) || "profil";
    if (!TABS[currentTab]) currentTab = "profil";

    function renderTab() {
        const content = $("#content");
        const y = window.scrollY;
        content.innerHTML = TABS[currentTab]();
        content.dataset.tab = currentTab;
        $$("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === currentTab));
        // Önizleme kutucukları
        $$("[data-thumb]", content).forEach((el) => {
            const p = state.projects[+el.dataset.thumb];
            if (p && p.image) el.style.backgroundImage = 'url("' + String(p.image).replace(/"/g, "%22") + '")';
        });
        $$("textarea", content).forEach(autoSize);
        $("#brandName").textContent = state.profile.name || "Panel";
        return y;
    }

    function showTab(tab, keepScroll) {
        currentTab = tab;
        store.set(TAB_KEY, tab, true);
        const y = renderTab();
        window.scrollTo(0, keepScroll ? y : 0);
        const active = $("#tabs button.active");
        if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    function autoSize(t) {
        t.style.height = "auto";
        t.style.height = t.scrollHeight + 2 + "px";
    }

    /* ---------- Olaylar ---------- */
    document.addEventListener("input", (e) => {
        const el = e.target;
        if (el.id === "textSearch") return filterTexts(el.value);
        const path = el.dataset.path;
        if (!path) return;
        let v = el.type === "checkbox" ? el.checked : el.value;
        if (el.dataset.type === "number") v = el.value === "" ? 0 : Number(el.value);
        setPath(path, v);
        if (el.tagName === "TEXTAREA") autoSize(el);
        if (el.dataset.sync) $$(`[data-sync="${el.dataset.sync}"]`).forEach((o) => o !== el && (o.value = el.value));
        setDirty(true);
    });

    // Görünümü etkileyen alanlar (görsel yolu, desen) değişince sekmeyi yeniden çiz
    document.addEventListener("change", (e) => {
        const el = e.target;
        if (el.dataset.upload !== undefined) return handleUpload(el);
        if (el.id === "importFile") return handleImport(el);
        if (el.hasAttribute("data-rerender")) showTab(currentTab, true);
    });

    function filterTexts(q) {
        q = q.trim().toLocaleLowerCase("tr");
        $$(".text-row").forEach((row) => {
            const hay = (row.dataset.key + " " + $$("input, textarea", row).map((i) => i.value).join(" ")).toLocaleLowerCase("tr");
            row.hidden = q && !hay.includes(q);
        });
        $$(".text-group").forEach((g) => (g.hidden = !$$(".text-row", g).some((r) => !r.hidden)));
    }

    document.addEventListener("click", (e) => {
        const tabBtn = e.target.closest("#tabs button");
        if (tabBtn) return showTab(tabBtn.dataset.tab);

        const b = e.target.closest("[data-act]");
        if (!b) return;
        const list = b.dataset.list, i = +b.dataset.i;
        const arr = list ? state[list] : null;
        switch (b.dataset.act) {
            case "add":
                arr.push(BLANK[list]());
                setDirty(true);
                showTab(currentTab, true);
                // Yeni öğenin ilk alanına odaklan
                setTimeout(() => {
                    const items = $$(".item, .mini-row", $("#content")).filter((x) => x.querySelector(`[data-list="${list}"]`));
                    const last = items[items.length - 1];
                    const f = last && last.querySelector("input, textarea");
                    if (f) { f.focus(); last.scrollIntoView({ block: "center" }); }
                }, 0);
                break;
            case "del": {
                const label = list === "projects" ? "Bu proje" : "Bu öğe";
                if (!confirm(label + " silinsin mi?")) return;
                arr.splice(i, 1);
                setDirty(true);
                showTab(currentTab, true);
                break;
            }
            case "up":
            case "down": {
                const j = b.dataset.act === "up" ? i - 1 : i + 1;
                if (j < 0 || j >= arr.length) return;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                setDirty(true);
                showTab(currentTab, true);
                break;
            }
            case "noimg":
                state.projects[i].image = "";
                if (!/^art-[1-6]$/.test(state.projects[i].art)) state.projects[i].art = "art-1";
                setDirty(true);
                showTab(currentTab, true);
                break;
            case "export-js":
                download("content.js", buildContentJs(), "text/javascript");
                toast("content.js indirildi — js/content.js yerine koy.");
                break;
            case "export-json":
                download("site-icerik-yedek-" + new Date().toISOString().slice(0, 10) + ".json", JSON.stringify(state, null, 2), "application/json");
                toast("JSON yedeği indirildi.");
                break;
            case "import":
                $("#importFile").click();
                break;
            case "reset":
                if (!confirm("Tarayıcıdaki kayıt silinecek ve js/content.js içeriğine dönülecek. Emin misin?")) return;
                store.del(CONTENT_KEY);
                state = mergeContent(FILE_DEFAULT, null);
                setDirty(false);
                showTab(currentTab, true);
                toast("Dosyadaki içeriğe dönüldü.");
                break;
        }
    });

    $("#saveBtn").addEventListener("click", save);
    document.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s" && !$("#app").hidden) {
            e.preventDefault();
            save();
        }
    });

    // Önizleme: sekmeye uygun sayfayı açar (önce kaydeder)
    $("#previewBtn").addEventListener("click", () => {
        if (dirty && !save()) return;
        const page = { projeler: "projects.html", deneyim: "resume.html", egitim: "resume.html", yetenekler: "resume.html" }[currentTab] || "index.html";
        window.open(page, "_blank", "noopener");
    });

    $("#logoutBtn").addEventListener("click", () => {
        if (dirty && !confirm("Kaydedilmemiş değişiklikler var. Yine de çıkılsın mı?")) return;
        store.del(SESSION_KEY, true);
        dirty = false;
        location.reload();
    });

    /* ---------- Görsel yükleme: canvas ile küçültüp JPEG data URL'e çevir ---------- */
    function handleUpload(inputEl) {
        const file = inputEl.files && inputEl.files[0];
        const i = +inputEl.dataset.upload;
        if (!file) return;
        if (!/^image\//.test(file.type)) return toast("Lütfen bir görsel dosyası seç.", "error");
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, IMG_MAX / Math.max(img.naturalWidth, img.naturalHeight));
                const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
                const c = document.createElement("canvas");
                c.width = w; c.height = h;
                const ctx = c.getContext("2d");
                ctx.fillStyle = "#121210"; // saydam PNG'ler için koyu zemin
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);
                state.projects[i].image = c.toDataURL("image/jpeg", IMG_QUALITY);
                setDirty(true);
                showTab(currentTab, true);
                toast(`Görsel eklendi (${w}×${h}). Kaydetmeyi unutma.`);
            };
            img.onerror = () => toast("Görsel okunamadı.", "error");
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    /* ---------- Dışa aktarma ---------- */
    const JS_HEADER =
        "/* ==========================================================================\n" +
        "   Site içeriği (tek veri dosyası)\n" +
        "   - Tüm metinler, profil bilgileri, projeler, deneyim, eğitim, yetenekler,\n" +
        "     diller ve istatistikler burada tutulur.\n" +
        "   - Bu dosyayı elle düzenleyebilir ya da admin.html panelinden\n" +
        "     \"content.js indir\" ile yeniden üretip bunun yerine koyabilirsin.\n" +
        "   - Metinlerde {name} ve {firstName} profil bilgileriyle değiştirilir.\n" +
        "   - JSON değil JS dosyasıdır: file:// ile açıldığında da çalışsın diye.\n" +
        "   ========================================================================== */\n\n";

    function buildContentJs() {
        return JS_HEADER + "window.SITE_CONTENT = " + JSON.stringify(state, null, 4) + ";\n";
    }

    function download(name, text, type) {
        const url = URL.createObjectURL(new Blob([text], { type: type + ";charset=utf-8" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /* ---------- İçe aktarma: JSON yedeği ya da content.js ---------- */
    function handleImport(inputEl) {
        const file = inputEl.files && inputEl.files[0];
        inputEl.value = "";
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            let text = String(reader.result).trim();
            // content.js ise atamanın sağ tarafını al
            const m = text.match(/SITE_CONTENT\s*=\s*([\s\S]*?);?\s*$/);
            if (m) text = m[1];
            let data;
            try { data = JSON.parse(text); } catch (e) { return toast("Dosya okunamadı: geçerli bir JSON / content.js değil.", "error"); }
            if (!data || typeof data !== "object" || !data.profile || !data.text) {
                return toast("Bu dosya site içeriğine benzemiyor (profile / text alanları yok).", "error");
            }
            state = mergeContent(FILE_DEFAULT, data);
            setDirty(true);
            showTab(currentTab, true);
            toast("İçe aktarıldı — sitede görmek için Kaydet'e bas.");
        };
        reader.readAsText(file);
    }

    /* ---------- Şifre değiştirme ---------- */
    document.addEventListener("submit", async (e) => {
        if (e.target.id !== "passForm") return;
        e.preventDefault();
        const oldP = $("#passOld").value, n1 = $("#passNew").value, n2 = $("#passNew2").value;
        if (!(await checkPass(oldP))) return toast("Mevcut şifre yanlış.", "error");
        if (n1.length < 4) return toast("Yeni şifre en az 4 karakter olmalı.", "error");
        if (n1 !== n2) return toast("Yeni şifreler eşleşmiyor.", "error");
        const r = store.set(PASS_KEY, await sha256(n1));
        if (r !== true) return toast("Şifre kaydedilemedi (tarayıcı depolaması kapalı).", "error");
        e.target.reset();
        toast("Şifre değiştirildi.");
    });

    /* ---------- Giriş ---------- */
    function openApp() {
        $("#login").hidden = true;
        $("#app").hidden = false;
        setDirty(false);
        showTab(currentTab);
    }

    $("#loginHint").hidden = !!store.get(PASS_KEY);
    $("#loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const ok = await checkPass($("#loginPass").value);
        if (!ok) {
            $("#loginError").hidden = false;
            $("#loginForm").classList.remove("shake");
            void $("#loginForm").offsetWidth;
            $("#loginForm").classList.add("shake");
            return;
        }
        store.set(SESSION_KEY, "1", true);
        openApp();
    });

    if (!window.SITE_CONTENT) {
        toast("js/content.js yüklenemedi — boş içerikle açılıyor.", "error");
    }
    if (store.get(SESSION_KEY, true) === "1") openApp();
})();
