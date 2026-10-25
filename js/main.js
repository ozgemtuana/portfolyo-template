/* ==========================================================================
   Animasyonlar: Lenis (yumuşak kaydırma) + GSAP ScrollTrigger + Three.js
   Kütüphaneler CDN'den gelir; yüklenemezse site animasyonsuz çalışır.
   ========================================================================== */

(function () {
    const root = document.documentElement;
    const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(hover: none)").matches;
    const page = document.body.dataset.page;

    let lenis = null;

    /* ---------- Navbar: aktif sayfa, aşağı kayınca gizlen, yukarı kayınca göster ---------- */
    document.querySelectorAll(".navbar .nav-link").forEach((a) => {
        if (a.dataset.nav === page) {
            a.classList.add("active");
            a.setAttribute("aria-current", "page");
        }
    });
    const nav = document.querySelector(".navbar");
    let lastY = window.scrollY;
    const onScrollNav = () => {
        const y = window.scrollY;
        const menuOpen = document.querySelector(".navbar-collapse.show");
        nav.classList.toggle("scrolled", y > 20);
        nav.classList.toggle("nav-hidden", !menuOpen && y > lastY && y > 300);
        lastY = y;
    };
    window.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();

    // Mobil menüde bağlantıya tıklanınca menüyü kapat
    document.querySelectorAll(".navbar-collapse .nav-link").forEach((a) => {
        a.addEventListener("click", () => {
            const c = document.querySelector(".navbar-collapse.show");
            if (c && window.bootstrap) window.bootstrap.Collapse.getOrCreateInstance(c).hide();
        });
    });

    /* ---------- Yerel saat (hero) ---------- */
    const clockEls = document.querySelectorAll(".local-time");
    if (clockEls.length) {
        const fmt = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Istanbul" });
        const tickClock = () => clockEls.forEach((el) => (el.textContent = fmt.format(new Date())));
        tickClock();
        setInterval(tickClock, 1000);
    }

    /* ---------- Butonlar: dolgu imlecin girdiği noktadan başlar ---------- */
    document.querySelectorAll(".btn").forEach((btn) => {
        const setOrigin = (e) => {
            const r = btn.getBoundingClientRect();
            btn.style.setProperty("--x", ((e.clientX - r.left) / r.width) * 100 + "%");
            btn.style.setProperty("--y", ((e.clientY - r.top) / r.height) * 100 + "%");
        };
        btn.addEventListener("mouseenter", setOrigin);
        btn.addEventListener("mouseleave", setOrigin);
    });

    /* ---------- Metin karıştırma (hover) ---------- */
    const GLYPHS = "!<>-_\\/[]{}—=+*^?#ABCDEFXYZ0123456789";
    document.querySelectorAll("[data-scramble]").forEach((el) => {
        let running = false;
        el.addEventListener("mouseenter", () => {
            if (running || el.children.length) return;
            running = true;
            const original = el.textContent;
            let frame = 0;
            const total = 18;
            const step = () => {
                const reveal = Math.floor((frame / total) * original.length);
                el.textContent = original
                    .split("")
                    .map((c, i) => (i < reveal || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
                    .join("");
                if (frame++ < total) requestAnimationFrame(step);
                else { el.textContent = original; running = false; }
            };
            step();
        });
    });

    /* ---------- İletişim formu (mailto ile) ---------- */
    const form = document.getElementById("contactForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const ok = document.getElementById("submitSuccessMessage");
            const err = document.getElementById("submitErrorMessage");
            ok.classList.add("d-none");
            err.classList.add("d-none");
            form.classList.add("was-validated");
            if (!form.checkValidity()) {
                err.classList.remove("d-none");
                if (hasGSAP) gsap.fromTo(form, { x: -10 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
                return;
            }
            const v = (id) => document.getElementById(id).value.trim();
            const body = `${v("message")}\n\n— ${v("name")}\n${v("email")}\n${v("phone")}`;
            window.location.href = "mailto:" + PROFILE.email +
                "?subject=" + encodeURIComponent("Portfolyo — " + v("name")) +
                "&body=" + encodeURIComponent(body);
            ok.classList.remove("d-none");
        });
    }

    // "visited" bayrağı ve perde/yükleme ekranı js/transition.js'de yönetilir
    initThree();

    if (!hasGSAP || reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("js-anim");

    /* ---------- Lenis yumuşak kaydırma ---------- */
    if (typeof window.Lenis !== "undefined") {
        lenis = new Lenis({ duration: 1.2, smoothWheel: true });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    document.querySelectorAll('a[href="#top"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            if (lenis) lenis.scrollTo(0, { duration: 2 });
            else window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    /* ---------- Harflere bölme (iç içe <em> korunur) ---------- */
    function splitChars(el) {
        const walk = (node) => {
            [...node.childNodes].forEach((child) => {
                if (child.nodeType === 3) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach((part) => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                        // Kelimeyi bir arada tut ki satır sonunda bölünmesin
                        const word = document.createElement("span");
                        word.style.display = "inline-block";
                        word.style.whiteSpace = "nowrap";
                        [...part].forEach((c) => {
                            const s = document.createElement("span");
                            s.className = "char";
                            s.textContent = c;
                            word.appendChild(s);
                        });
                        frag.appendChild(word);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === 1 && !child.classList.contains("char")) {
                    walk(child);
                }
            });
        };
        walk(el);
        return el.querySelectorAll(".char");
    }

    const heroLines = document.querySelectorAll(".hero-title .line > span");
    let heroChars = [];
    heroLines.forEach((l) => heroChars.push(...splitChars(l)));

    /* ---------- Hero girişi (perde açıldıktan sonra çalışır) ---------- */
    const heroIntro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    if (heroChars.length) {
        heroIntro.to(heroChars, { y: 0, rotate: 0, duration: 1.4, stagger: 0.03 }, 0);
    }
    const heroReveals = document.querySelectorAll(".hero [data-reveal]");
    if (heroReveals.length) {
        heroIntro.to(heroReveals, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.35);
    }

    /* ---------- Sayfa geçişi (js/transition.js) ---------- */
    // Perde açılırken (bitmeden ~0.5 sn önce) hero girişi başlar
    const pt = window.PageTransition;
    if (pt && pt.ready) pt.ready.then(() => heroIntro.play());
    else heroIntro.play();
    // Geçiş başlayınca kaydırmayı durdur; geri tuşuyla dönülünce yeniden aç
    document.addEventListener("transition:start", () => lenis && lenis.stop());
    window.addEventListener("pageshow", (e) => {
        if (e.persisted && lenis) lenis.start();
    });

    /* ---------- Kaydırma ilerleme çubuğu ---------- */
    gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
    });

    // Hero başlığı kaydırınca dağılır
    if (document.querySelector(".hero")) {
        gsap.to(".hero-title .line:nth-child(1)", {
            xPercent: -15, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
        gsap.to(".hero-title .line:nth-child(2)", {
            xPercent: 15, ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
        gsap.to(".hero .container", {
            opacity: 0, y: -100, filter: "blur(8px)", ease: "none",
            scrollTrigger: { trigger: ".hero", start: "35% top", end: "bottom top", scrub: true }
        });
    }

    /* ---------- Genel görünme animasyonları ---------- */
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
        if (el.closest(".hero")) return;
        gsap.to(el, {
            opacity: 1, y: 0, duration: 1.2, ease: "expo.out",
            delay: parseFloat(el.dataset.delay || 0),
            scrollTrigger: { trigger: el, start: "top 88%" }
        });
    });

    // Sayfa başlıkları (alt sayfalar) harf harf gelir
    document.querySelectorAll(".page-offset h1").forEach((h) => {
        h.removeAttribute("data-reveal");
        gsap.set(h, { opacity: 1, y: 0 });
        h.style.overflow = "hidden";
        const chars = splitChars(h);
        gsap.from(chars, { yPercent: 110, rotate: 6, duration: 1.3, stagger: 0.025, ease: "expo.out", delay: 0.7 });
    });

    /* ---------- Çizgiler soldan çizilir ---------- */
    gsap.utils.toArray(".rule").forEach((r) => {
        gsap.fromTo(r, { scaleX: 0 }, {
            scaleX: 1, duration: 1.6, ease: "expo.out",
            scrollTrigger: { trigger: r, start: "top 92%" }
        });
    });

    /* ---------- Görseller perdeyle açılır ---------- */
    gsap.utils.toArray(".clip-reveal").forEach((el) => {
        gsap.to(el, {
            clipPath: "inset(0% 0 0 0)", duration: 1.5, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 90%" }
        });
    });

    /* ---------- Kayan yazı bantları: kaydırma yönüne ve hızına tepki verir ---------- */
    document.querySelectorAll(".marquee-track").forEach((track) => {
        track.innerHTML += track.innerHTML; // kesintisiz döngü için kopya
        const rev = track.hasAttribute("data-reverse");
        const loop = gsap.fromTo(track, { xPercent: rev ? -50 : 0 }, { xPercent: rev ? 0 : -50, ease: "none", duration: 26, repeat: -1 });
        ScrollTrigger.create({
            trigger: track,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
                const v = Math.abs(self.getVelocity() / 250);
                gsap.to(loop, { timeScale: self.direction * Math.max(1, v), duration: 0.3, overwrite: true });
                gsap.to(loop, { timeScale: self.direction, duration: 1, delay: 0.3 });
            }
        });
    });
    gsap.to(".marquee .star", { rotation: 360, duration: 6, ease: "none", repeat: -1 });

    /* ---------- Açıklama metni: kelime kelime aydınlanır ---------- */
    let statementTriggers = [];
    function buildStatement() {
        statementTriggers.forEach((st) => st.kill());
        statementTriggers = [];
        document.querySelectorAll(".statement").forEach((el) => {
            const words = el.textContent.trim().split(/\s+/);
            el.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(" ");
            const tween = gsap.to(el.querySelectorAll(".w"), {
                color: "#eae4d6", stagger: 0.1, ease: "none",
                scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true }
            });
            statementTriggers.push(tween.scrollTrigger);
        });
    }
    buildStatement();

    /* ---------- Sayaçlar ---------- */
    document.querySelectorAll("[data-count]").forEach((el) => {
        const obj = { v: 0 };
        const end = parseInt(el.dataset.count, 10);
        el.textContent = "0";
        gsap.to(obj, {
            v: end, duration: 2.2, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            onUpdate: () => (el.textContent = Math.round(obj.v))
        });
    });

    /* ---------- Yatay kayan proje bölümü (sabitlenir) ---------- */
    const hTrack = document.querySelector(".h-track");
    if (hTrack) {
        const dist = () => hTrack.scrollWidth - window.innerWidth;
        const hTween = gsap.to(hTrack, {
            x: () => -dist(),
            ease: "none",
            scrollTrigger: {
                trigger: ".h-scroll",
                start: "top top",
                end: () => "+=" + dist(),
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
        hTrack.querySelectorAll(".h-card").forEach((card) => {
            // Görsel ters yönde kayar (paralaks)
            gsap.fromTo(card.querySelector(".thumb > div"), { xPercent: -8 }, {
                xPercent: 8, ease: "none",
                scrollTrigger: { trigger: card, containerAnimation: hTween, start: "left right", end: "right left", scrub: true }
            });
            // Kart ekrana girerken hafif döner ve büyür
            gsap.fromTo(card, { rotate: 4, scale: 0.9 }, {
                rotate: 0, scale: 1, ease: "none",
                scrollTrigger: { trigger: card, containerAnimation: hTween, start: "left right", end: "center center", scrub: true }
            });
        });
    }

    /* ---------- Hizmet satırları sırayla gelir ---------- */
    gsap.utils.toArray(".service-row").forEach((row) => {
        gsap.from(row.children, {
            yPercent: 100, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08,
            scrollTrigger: { trigger: row, start: "top 90%" }
        });
    });

    /* ---------- Kaydırma hızına göre bükülme ---------- */
    const skewTargets = gsap.utils.toArray(".project-tile, .service-row h3, .timeline .card");
    if (skewTargets.length) {
        const skewTo = gsap.quickTo(skewTargets, "skewY", { duration: 0.6, ease: "power3" });
        ScrollTrigger.create({
            onUpdate: (self) => skewTo(gsap.utils.clamp(-5, 5, self.getVelocity() / -350))
        });
    }

    /* ---------- Özgeçmiş: zaman çizelgesi dolar, beceri çubukları uzar ---------- */
    document.querySelectorAll(".timeline").forEach((tl) => {
        gsap.fromTo(tl.querySelector(".tl-fill"), { scaleY: 0 }, {
            scaleY: 1, ease: "none",
            scrollTrigger: { trigger: tl, start: "top 70%", end: "bottom 60%", scrub: true }
        });
    });
    document.querySelectorAll(".skill-bar > i").forEach((bar) => {
        gsap.to(bar, {
            width: getComputedStyle(bar).getPropertyValue("--w"),
            duration: 1.8, ease: "expo.out",
            scrollTrigger: { trigger: bar, start: "top 92%" }
        });
    });
    gsap.utils.toArray(".skill-tag").forEach((tag, i) => {
        gsap.from(tag, {
            scale: 0, rotate: gsap.utils.random(-20, 20), duration: 0.8, ease: "back.out(2)", delay: i * 0.04,
            scrollTrigger: { trigger: tag.parentElement, start: "top 88%" }
        });
    });

    /* ---------- Projeler sayfası: görsel paralaksı ---------- */
    document.querySelectorAll(".project-tile .thumb > div").forEach((img) => {
        gsap.fromTo(img, { yPercent: -8 }, {
            yPercent: 8, ease: "none",
            scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
        });
    });

    /* ---------- Büyük CTA: kaydırınca büyür ---------- */
    document.querySelectorAll(".cta-big").forEach((el) => {
        gsap.fromTo(el, { scale: 0.75, opacity: 0.2 }, {
            scale: 1, opacity: 1, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "center 60%", scrub: true }
        });
    });

    /* ---------- Footer: dev isim ekrana sığar ve harf harf yükselir ---------- */
    const footerName = document.querySelector(".footer-name");
    let footerTween = null;
    function buildFooterName() {
        if (!footerName) return;
        footerName.style.overflow = "hidden";
        // Metnin gerçek genişliğini ölç, ekranın %96'sını dolduracak boyutu hesapla
        footerName.style.fontSize = "100px";
        footerName.style.width = "max-content";
        const ratio = (footerName.parentElement.clientWidth * 0.96) / footerName.offsetWidth;
        footerName.style.width = "";
        footerName.style.fontSize = Math.floor(100 * ratio) + "px";
        if (footerTween) footerTween.scrollTrigger.kill();
        const chars = splitChars(footerName);
        footerTween = gsap.from(chars, {
            yPercent: 100, duration: 1.2, ease: "expo.out", stagger: 0.035,
            scrollTrigger: { trigger: footerName, start: "top 95%" }
        });
    }
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
        buildFooterName();
        ScrollTrigger.refresh();
    });
    let lastW = window.innerWidth;
    window.addEventListener("resize", () => {
        // Mobilde adres çubuğu da resize tetikler; yalnızca genişlik değişince yeniden kur
        if (!footerName || window.innerWidth === lastW) return;
        lastW = window.innerWidth;
        footerName.textContent = PROFILE.name;
        buildFooterName();
    });

    /* ---------- Dil değişince bölünmüş metinleri yeniden kur ---------- */
    document.addEventListener("langchange", () => {
        heroChars = [];
        heroLines.forEach((l) => heroChars.push(...splitChars(l)));
        gsap.set(heroChars, { y: 0, rotate: 0 });
        document.querySelectorAll(".page-offset h1 .char").length === 0 &&
            document.querySelectorAll(".page-offset h1").forEach((h) => splitChars(h));
        buildStatement();
        buildFooterName();
        ScrollTrigger.refresh();
    });

    /* ---------- Masaüstü: imleç, mıknatıs, 3D eğilen kartlar ---------- */
    if (!isTouch) {
        const cursor = document.querySelector(".cursor");
        if (cursor) {
            const label = cursor.querySelector("span");
            const cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
            const cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
            window.addEventListener("mousemove", (e) => {
                document.body.classList.add("cursor-on");
                cx(e.clientX); cy(e.clientY);
            });
            document.addEventListener("mouseleave", () => document.body.classList.remove("cursor-on"));
            document.querySelectorAll("a, button, .service-row, input, textarea").forEach((el) => {
                el.addEventListener("mouseenter", () => {
                    if (el.dataset.cursor) {
                        label.textContent = t("cursor." + el.dataset.cursor);
                        cursor.classList.add("label");
                    } else {
                        cursor.classList.add("hover");
                    }
                });
                el.addEventListener("mouseleave", () => cursor.classList.remove("hover", "label"));
            });
        }

        document.querySelectorAll(".magnetic").forEach((el) => {
            const xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
            const yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.35)" });
            el.addEventListener("mousemove", (e) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - r.left - r.width / 2) * 0.35);
                yTo((e.clientY - r.top - r.height / 2) * 0.35);
            });
            el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
        });

        document.querySelectorAll(".tilt").forEach((el) => {
            el.addEventListener("mousemove", (e) => {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                el.style.setProperty("--gx", px * 100 + "%");
                el.style.setProperty("--gy", py * 100 + "%");
                gsap.to(el, { rotateY: (px - 0.5) * 14, rotateX: (0.5 - py) * 12, transformPerspective: 900, duration: 0.6, ease: "power3" });
            });
            el.addEventListener("mouseleave", () => {
                gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: "elastic.out(1, 0.4)" });
            });
        });
    }

    window.addEventListener("load", () => ScrollTrigger.refresh());

    /* ======================================================================
       Three.js: kaydırmaya ve fareye tepki veren 3D nesne + parçacıklar
       ====================================================================== */
    function initThree() {
        const canvas = document.getElementById("bg3d");
        if (!canvas || typeof window.THREE === "undefined") return;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        } catch (e) {
            return; // WebGL desteklenmiyor
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 6;

        const uniforms = {
            uTime: { value: 0 },
            uScroll: { value: 0 },
            uHover: { value: 0 },
            uColorA: { value: new THREE.Color("#a3b18a") },
            uColorB: { value: new THREE.Color("#d2622a") }
        };

        // Dalgalanan küre (vertex shader ile)
        const geo = new THREE.IcosahedronGeometry(1.6, isTouch ? 24 : 48);
        const mat = new THREE.ShaderMaterial({
            uniforms,
            wireframe: true,
            transparent: true,
            vertexShader: `
                uniform float uTime;
                uniform float uScroll;
                uniform float uHover;
                varying float vDisp;
                varying vec3 vNormal;
                void main() {
                    vec3 p = position;
                    float f = 2.2 + uScroll * 2.5;
                    float d = sin(p.x * f + uTime * 0.9) * sin(p.y * f * 0.9 + uTime * 0.7) * sin(p.z * f * 1.1 + uTime * 0.8);
                    d *= 0.2 + uScroll * 0.3 + uHover * 0.25;
                    vDisp = d;
                    vNormal = normalize(normalMatrix * normal);
                    p += normal * d;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColorA;
                uniform vec3 uColorB;
                varying float vDisp;
                varying vec3 vNormal;
                void main() {
                    float f = pow(1.0 - abs(vNormal.z), 1.6);
                    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.35, vDisp));
                    gl_FragColor = vec4(col, 0.12 + f * 0.55);
                }
            `
        });
        const blob = new THREE.Mesh(geo, mat);
        scene.add(blob);

        // Etrafında dönen ince halka
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(2.5, 0.004, 8, 200),
            new THREE.MeshBasicMaterial({ color: 0xeae4d6, transparent: true, opacity: 0.35 })
        );
        ring.rotation.x = Math.PI / 2.3;
        blob.add(ring);

        // Parçacık alanı
        const count = isTouch ? 600 : 1500;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 8 + Math.random() * 10; // kameradan uzak tut
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
            positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
            positions[i * 3 + 2] = r * Math.cos(ph);
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const stars = new THREE.Points(pGeo, new THREE.PointsMaterial({
            color: 0xeae4d6, size: 0.022, transparent: true, opacity: 0.55
        }));
        scene.add(stars);

        // Sayfaya göre konum
        let baseX = 0, baseY = 0;
        const layout = () => {
            const wide = window.innerWidth > 992;
            baseX = page === "home" ? (wide ? 2.3 : 0.6) : (wide ? 3 : 1.2);
            baseY = page === "home" ? (wide ? 0 : 1.7) : 0.5;
            const s = page === "home" ? 1 : 0.7;
            blob.scale.setScalar(wide ? s : s * 0.6);
        };
        layout();

        const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
        window.addEventListener("mousemove", (e) => {
            mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        // Buton/kart üzerindeyken nesne daha çok dalgalanır
        let hoverTarget = 0;
        document.addEventListener("mouseover", (e) => (hoverTarget = e.target.closest("a, button") ? 1 : 0));

        let scrollP = 0;
        const readScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            scrollP = max > 0 ? window.scrollY / max : 0;
        };
        window.addEventListener("scroll", readScroll, { passive: true });
        readScroll();

        window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            layout();
        });

        const clock = new THREE.Clock();
        let visible = true;
        document.addEventListener("visibilitychange", () => (visible = !document.hidden));

        const tick = () => {
            requestAnimationFrame(tick);
            if (!visible) return;
            const t = clock.getElapsedTime();
            mouse.x += (mouse.tx - mouse.x) * 0.05;
            mouse.y += (mouse.ty - mouse.y) * 0.05;
            uniforms.uScroll.value += (scrollP - uniforms.uScroll.value) * 0.08;
            uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.06;
            const sp = uniforms.uScroll.value;

            uniforms.uTime.value = reduceMotion ? 0 : t;
            // Kaydırdıkça nesne sağdan sola süzülür
            blob.position.x = baseX * Math.cos(sp * Math.PI * 2);
            blob.position.y = baseY + Math.sin(sp * Math.PI * 2) * 0.4;
            blob.rotation.x = t * 0.08 + sp * Math.PI * 2 + mouse.y * 0.3;
            blob.rotation.y = t * 0.12 + sp * Math.PI * 3 + mouse.x * 0.3;
            ring.rotation.z = t * 0.2;
            stars.rotation.y = t * 0.01 + sp * 0.8;
            stars.rotation.x = sp * 0.4;
            camera.position.z = 6 - sp * 1.5;
            camera.position.x = mouse.x * 0.3;
            camera.position.y = -mouse.y * 0.3;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
        };
        tick();
    }
})();
