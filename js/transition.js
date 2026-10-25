/* ==========================================================================
   Sayfa geçişi: "sıvı perde" sahnesi + ilk ziyaret yükleme ekranı
   - İç bir .html bağlantısına tıklanınca üç katman (turuncu → zeytin → koyu)
     kavisli bir dalga hâlinde yükselir, hedef sayfanın adı harf harf belirir,
     sonra sayfa değişir. Hedef bilgisi sessionStorage ile yeni sayfaya geçer.
   - Yeni sayfada başlık yukarı kayıp çıkar, katmanlar yukarı çekilir.
   - İlk ziyarette 0→100 sayacı ile zeytin rengi "sıvı" ekranı doldurur.
   main.js, hero girişini başlatmak için window.PageTransition.ready sözünü bekler.
   GSAP yoksa veya hareket azaltılmışsa perde hemen kaldırılır.
   ========================================================================== */

(function () {
    const root = document.documentElement;
    const el = document.querySelector(".pt");
    const hasGSAP = typeof window.gsap !== "undefined";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const page = document.body.dataset.page;
    const STORE = "pt-dest";

    // Sayfa sırası ve nav anahtarları (i18n.js'deki t() ile çevrilir)
    const PAGES = {
        home: { file: "index.html", key: "nav.home", no: "01", fb: "Ana Sayfa" },
        resume: { file: "resume.html", key: "nav.resume", no: "02", fb: "Özgeçmiş" },
        projects: { file: "projects.html", key: "nav.projects", no: "03", fb: "Projeler" },
        contact: { file: "contact.html", key: "nav.contact", no: "04", fb: "İletişim" }
    };
    const TOTAL = "0" + Object.keys(PAGES).length;
    const WORDS = {
        tr: { next: "sıradaki", now: "şimdi", hello: "hoş geldin", meta: "Portfolyo ©" },
        en: { next: "up next", now: "now", hello: "welcome", meta: "Portfolio ©" }
    };

    // Hazır sözü: perde yeterince açıldığında (bitmeden ~0.5 sn önce) çözülür
    let resolveReady;
    const ready = new Promise((r) => (resolveReady = r));
    let readyDone = false;
    const markReady = () => {
        if (readyDone) return;
        readyDone = true;
        resolveReady();
        document.dispatchEvent(new CustomEvent("transition:revealed"));
    };
    window.PageTransition = { ready };

    try { sessionStorage.setItem("visited", "1"); } catch (e) { /* yoksay */ }

    const lang = () => (root.lang === "en" ? "en" : "tr");
    const words = () => WORDS[lang()];
    const tr = (key, fb) => {
        try {
            if (typeof window.t === "function") {
                const v = window.t(key, lang());
                if (v && v !== key) return v;
            }
        } catch (e) { /* i18n hazır değil */ }
        return fb;
    };

    const readStore = () => {
        try {
            const d = JSON.parse(sessionStorage.getItem(STORE) || "null");
            sessionStorage.removeItem(STORE);
            return d && d.page === page && Date.now() - d.ts < 8000 ? d : null;
        } catch (e) { return null; }
    };

    const hide = () => {
        if (!el) return;
        el.style.animation = "none";
        el.style.visibility = "hidden";
        el.classList.remove("is-busy", "is-live");
    };

    if (!el) { markReady(); return; }

    // GSAP yok / hareket azaltılmış: perdeyi kaldır, bağlantılar normal çalışsın
    if (!hasGSAP || reduceMotion) {
        readStore();
        hide();
        markReady();
        return;
    }

    /* ---------- Öğeler ---------- */
    const $ = (s) => el.querySelector(s);
    const nameEl = $(".pt-name");
    const wordIn = $(".pt-word-in");
    const labelEl = $(".pt-label");
    const metaEl = $(".pt-meta");
    const ofEl = $(".pt-of");
    const countWrap = $(".pt-count");
    const countEl = $(".pt-count b");
    const rule = $(".pt-rule i");
    const fill = $(".pt-path--fill");
    const layers = [$(".pt-path--accent"), $(".pt-path--mid"), $(".pt-path--base")];
    const texts = [labelEl, metaEl, ...el.querySelectorAll(".pt-foot span")].filter(Boolean);
    el.style.animation = "none"; // JS devrede: CSS yedek zamanlayıcısına gerek yok

    // Yol şekilleri (viewBox 0 0 100 100). Aynı komut yapısı → GSAP sayıları ara değerler.
    const P = {
        coverStart: "M0 100 L0 100 Q50 100 100 100 L100 100 Z",
        coverMid: "M0 100 L0 74 Q50 6 100 74 L100 100 Z",
        coverEnd: "M0 100 L0 0 Q50 0 100 0 L100 100 Z",
        revealStart: "M0 0 L0 100 Q50 100 100 100 L100 0 Z",
        revealMid: "M0 0 L0 34 Q50 96 100 34 L100 0 Z",
        revealEnd: "M0 0 L0 0 Q50 0 100 0 L100 0 Z"
    };

    const info = (key, fallbackName) => {
        const p = PAGES[key];
        const name = p ? tr(p.key, p.fb) : fallbackName || "—";
        return {
            page: key,
            name,
            label: (p ? "(" + p.no + ")" : "(—)") + " — " + name,
            of: p ? p.no + " / " + TOTAL : "",
            meta: words().meta + new Date().getFullYear()
        };
    };

    // Başlığı harflere böl (boşluklar korunur)
    let chars = [];
    const setText = (d, word) => {
        nameEl.textContent = "";
        [...d.name].forEach((c) => {
            const s = document.createElement("span");
            s.className = "pt-char";
            s.textContent = c === " " ? " " : c;
            nameEl.appendChild(s);
        });
        chars = nameEl.querySelectorAll(".pt-char");
        wordIn.textContent = word;
        labelEl.textContent = d.label;
        metaEl.textContent = d.meta;
        ofEl.textContent = d.of;
    };

    const outgoing = () => document.querySelectorAll("main > :not(nav), .site-footer, .navbar");

    /* ---------- Açılış (yeni sayfada) ---------- */
    function buildReveal(withFill) {
        const tl = gsap.timeline({ onComplete: hide });
        tl.to(chars, { yPercent: -130, duration: 0.4, ease: "power3.in", stagger: 0.012 }, 0)
            .to(wordIn, { yPercent: -110, duration: 0.38, ease: "power3.in" }, 0)
            .to(texts, { opacity: 0, y: -10, duration: 0.35, ease: "power2.in", stagger: 0.03 }, 0)
            .to(rule, { scaleX: 0, transformOrigin: "right", duration: 0.55, ease: "expo.in" }, 0);
        // Üstteki katman önce çekilir; alttakiler renk şeridi gibi arkadan gelir
        const list = (withFill ? [fill] : []).concat(layers.slice().reverse());
        list.forEach((p, i) => {
            const at = 0.26 + i * 0.08;
            tl.set(p, { attr: { d: P.revealStart } }, 0)
                .to(p, { attr: { d: P.revealMid }, duration: 0.34, ease: "power3.in" }, at)
                .to(p, { attr: { d: P.revealEnd }, duration: 0.4, ease: "power3.out" }, at + 0.34);
        });
        // Hero girişi, perde kapanmadan ~0.5 sn önce başlar
        tl.call(markReady, null, Math.max(0, tl.duration() - 0.5));
        return tl;
    }

    // Başlık harfleri + yan metinler içeri
    function textIn(tl, at) {
        tl.fromTo(wordIn, { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: "expo.out" }, at)
            .fromTo(chars, { yPercent: 130 }, { yPercent: 0, duration: 0.55, ease: "expo.out", stagger: 0.022 }, "<0.03");
        return tl;
    }

    let current = null;
    const arrived = readStore();
    const firstVisit = root.classList.contains("first-visit");

    // Betikler çok geç geldiyse (CDN yavaş) sahneyi atla, sayfayı hemen göster
    if (performance.now() > 3500) {
        hide();
        markReady();
    } else if (arrived) {
        // Geçişle gelindi: başlık zaten yerinde (satır içi betik doldurdu)
        setText(arrived, arrived.word || words().next);
        el.classList.add("is-arrived", "is-live");
        gsap.set([wordIn, chars], { yPercent: 0 });
        gsap.set(rule, { scaleX: 1 });
        current = buildReveal(false).delay(0.05);
    } else if (firstVisit) {
        /* ---------- İlk ziyaret: sayaç + yükselen sıvı ---------- */
        setText(info(page), words().hello);
        el.classList.add("is-live");
        gsap.set(rule, { scaleX: 0 });
        gsap.set(wordIn, { yPercent: 110 });
        gsap.set(chars, { yPercent: 130 });
        const obj = { v: 0 };
        const wave = () => {
            const v = obj.v;
            const L = 100 - v;
            const a = 7 * Math.sin((Math.PI * v) / 100) * Math.cos(performance.now() / 260);
            fill.setAttribute("d", "M0 100 L0 " + L + " Q25 " + (L - a) + " 50 " + L + " T100 " + L + " L100 100 Z");
            countEl.textContent = Math.round(v);
        };
        const tl = gsap.timeline();
        tl.fromTo(texts, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 }, 0.05)
            .to(obj, { v: 100, duration: 1.9, ease: "power2.inOut", onUpdate: wave }, 0.1)
            .to(rule, { scaleX: 1, duration: 1.9, ease: "power2.inOut" }, 0.1)
            .to(countWrap, { yPercent: -110, duration: 0.45, ease: "power3.in" }, "-=0.12")
            .add(() => el.classList.add("is-named"));
        textIn(tl, ">-0.05");
        tl.add(buildReveal(true), "+=0.12");
        current = tl;
    } else {
        // Doğrudan açılış / yenileme: kısa başlık + açılış
        setText(info(page), words().now);
        el.classList.add("is-live");
        gsap.set(rule, { scaleX: 1 });
        const tl = gsap.timeline();
        tl.fromTo(texts, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0);
        textIn(tl, 0);
        tl.add(buildReveal(false), 0.5);
        current = tl;
    }

    /* ---------- Kapanış: iç bağlantıya tıklanınca ---------- */
    let busy = false;
    function go(href, key, fallbackName) {
        if (busy) return;
        busy = true;
        if (current) current.progress(1); // önceki sahne bitsin
        const d = info(key, fallbackName);
        const word = words().next;
        try { sessionStorage.setItem(STORE, JSON.stringify(Object.assign({ word, ts: Date.now() }, d))); } catch (e) { /* yoksay */ }
        document.dispatchEvent(new CustomEvent("transition:start", { detail: { href } }));

        setText(d, word);
        el.classList.remove("is-arrived");
        el.classList.add("is-live", "is-busy", "is-named");
        countWrap.style.display = "none";
        el.style.visibility = "visible";
        gsap.set(layers, { attr: { d: P.coverStart } });
        fill.setAttribute("d", "");
        gsap.set(texts, { opacity: 0, y: 12 });
        gsap.set(rule, { scaleX: 0, transformOrigin: "left" });

        const tl = gsap.timeline();
        // Çıkan sayfa hafifçe yukarı itilir ve söner
        tl.to(outgoing(), { y: -60, opacity: 0.2, duration: 0.95, ease: "power3.in" }, 0);
        layers.forEach((p, i) => {
            const at = i * 0.1;
            tl.to(p, { attr: { d: P.coverMid }, duration: 0.42, ease: "power3.in" }, at)
                .to(p, { attr: { d: P.coverEnd }, duration: 0.38, ease: "power2.out" }, at + 0.42);
        });
        tl.to(rule, { scaleX: 1, duration: 0.7, ease: "expo.inOut" }, 0.4)
            .to(texts, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.05 }, 0.5);
        textIn(tl, 0.45);
        tl.call(() => (window.location.href = href), null, 1.08);
        current = tl;
    }

    document.addEventListener("click", (e) => {
        const a = e.target.closest("a[href]");
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const href = a.getAttribute("href");
        if (a.target === "_blank" || a.hasAttribute("download") || !/\.html(\?|#|$)/.test(href) || /^[a-z]+:/i.test(href)) return;
        let url;
        try { url = new URL(a.href, window.location.href); } catch (err) { return; }
        if (url.origin !== window.location.origin) return;
        e.preventDefault();
        const file = url.pathname.split("/").pop() || "index.html";
        const key = Object.keys(PAGES).find((k) => PAGES[k].file === file) || file.replace(/\.html$/, "");
        go(href, key, (a.textContent || "").trim() || key);
    });

    // Geri tuşuyla önbellekten (bfcache) dönülürse perdeyi kaldır, sayfayı geri getir
    window.addEventListener("pageshow", (e) => {
        if (!e.persisted) return;
        if (current) current.kill();
        busy = false;
        try { sessionStorage.removeItem(STORE); } catch (err) { /* yoksay */ }
        gsap.set(outgoing(), { clearProps: "transform,opacity" });
        hide();
        markReady();
    });
})();
