# Portfolyo Şablonu

Çok sayfalı, Türkçe/İngilizce, koyu temalı kişisel portfolyo şablonu. GSAP, Lenis ve Three.js ile kaydırma animasyonları ve 3D arka plan, sayfalar arası geçiş efekti ve tarayıcıda çalışan bir **admin paneli** içerir. Tamamen statiktir: sunucu, veritabanı ya da derleme adımı gerekmez.

> İngilizce açıklama için aşağıdaki [English](#english) bölümüne bakın.

## Özellikler

- **4 sayfa:** Ana Sayfa, Özgeçmiş, Projeler, İletişim
- **TR / EN dil desteği:** sağ üstteki düğmeyle anında dil değişimi (seçim tarayıcıda hatırlanır)
- **Koyu tema**, özenli tipografi ve mobil uyumlu (responsive) düzen
- **Animasyonlar:** GSAP + ScrollTrigger ile kaydırma animasyonları, Lenis ile yumuşak kaydırma, Three.js ile 3D arka plan, özel imleç ve "magnetic" butonlar
- **Sayfa geçişleri:** sayfalar arasında animasyonlu geçiş perdesi
- **Admin paneli (`admin.html`):** profil, metinler, projeler, deneyim, eğitim, yetenekler, diller ve istatistikleri kod yazmadan düzenleme; görsel yükleme; `content.js` ve JSON dışa/içe aktarma; şifre değiştirme
- **Tek veri dosyası:** sitenin tüm içeriği `js/content.js` içinde
- İletişim formu `mailto:` ile ziyaretçinin e-posta uygulamasını açar (sunucu gerekmez)

## Klasör yapısı

```
├── index.html          Ana sayfa
├── resume.html         Özgeçmiş
├── projects.html       Projeler
├── contact.html        İletişim
├── admin.html          Admin paneli (menüde bağlantısı yok, noindex)
├── css/
│   ├── styles.css      Start Bootstrap şablonunun CSS'i (Bootstrap 5 dahil)
│   ├── dark.css        Koyu tema, tipografi, responsive düzenlemeler
│   ├── transition.css  Sayfa geçişi stilleri
│   └── admin.css       Admin paneli stilleri
├── js/
│   ├── content.js      Sitenin tüm içeriği (window.SITE_CONTENT)
│   ├── i18n.js         İçeriği okur, TR/EN metinleri ve listeleri sayfaya basar
│   ├── main.js         Animasyonlar, 3D arka plan, iletişim formu
│   ├── transition.js   Sayfa geçişleri
│   └── admin.js        Admin paneli mantığı
├── assets/
│   ├── favicon.ico
│   └── projects/       Proje görsellerini buraya koyabilirsin
├── kaynak.txt          Şablon kaynağı ve kullanılan kütüphaneler
└── LICENSE-template.txt  Start Bootstrap MIT lisans bildirimi
```

## Yerelde çalıştırma

En kolayı: `index.html` dosyasını tarayıcıda çift tıklayarak açmak.

Ya da küçük bir yerel sunucuyla:

```bash
python3 -m http.server 8000
# ardından http://localhost:8000 adresini aç
```

Bu depo bir **GitHub şablonudur**: sağ üstteki **"Use this template"** düğmesiyle kendi hesabında yeni bir kopya oluşturabilirsin.

## Admin paneli ile özelleştirme

1. `admin.html` sayfasını aç (ör. `http://localhost:8000/admin.html`).
2. Varsayılan şifre: **`admin`**
3. Soldaki sekmelerden (Profil, Metinler, Projeler, Deneyim, Eğitim, Yetenekler, İstatistikler) içeriği düzenle.
4. **Kaydet** → değişiklikler tarayıcının `localStorage` alanına kaydedilir ve site **yalnızca aynı tarayıcıda** güncel hâliyle görünür.
5. Değişiklikleri kalıcı yapmak ve herkesin görmesini sağlamak için **"Dışa / İçe aktar" → "content.js indir"** ile dosyayı indir ve projedeki `js/content.js` dosyasının yerine koy (sonra commit/push et).
6. **Ayarlar** sekmesinden şifreyi değiştir.

> ⚠️ **Önemli:** Admin paneli tamamen tarayıcı tarafında çalışır. Şifre yalnızca tarayıcıda kontrol edilir ve **gerçek bir güvenlik sağlamaz**; site statik olduğu için panel sunucudaki dosyaları değiştiremez. Panel, içeriği kolayca düzenleyip `content.js` üretmek için bir araçtır.

## `js/content.js` dosyasını elle düzenleme

Tüm içerik tek bir nesnede durur:

```js
window.SITE_CONTENT = {
    profile:    { name, firstName, email, phone, location, github, instagram, linkedin },
    text:       { tr: { ... }, en: { ... } },   // arayüz metinleri (anahtar → metin)
    projects:   [ { title, tag, desc, image, art, link, featured } ],
    experience: [ { date, role, company, desc } ],
    education:  [ { date, school, degree, field, desc } ],
    skills, skillBars, languages, stats
};
```

- Çok dilli alanlar `{ "tr": "...", "en": "..." }` biçimindedir.
- Metinlerde `{name}` ve `{firstName}` profil bilgileriyle otomatik değiştirilir.
- Proje görseli için `image` alanına ör. `assets/projects/proje.jpg` yaz; görsel yoksa `art` alanına `art-1` … `art-6` soyut desenlerinden birini ver.
- Boş bırakılan sosyal medya bağlantıları sayfada gizlenir.
- Özgeçmiş sayfasındaki "CV İndir" düğmesi `assets/cv.pdf` dosyasını indirir; kendi CV'ni bu adla ekle.

## Krediler

- [Start Bootstrap — Personal](https://startbootstrap.com/theme/personal) (MIT) — temel şablon
- [Bootstrap 5](https://getbootstrap.com) ve [Bootstrap Icons](https://icons.getbootstrap.com)
- [GSAP](https://gsap.com) + ScrollTrigger
- [Lenis](https://github.com/darkroomengineering/lenis)
- [Three.js](https://threejs.org)
- [Google Fonts](https://fonts.google.com): Bricolage Grotesque, Instrument Serif, JetBrains Mono

## Lisans

Temel şablon Start Bootstrap tarafından MIT lisansıyla yayımlanmıştır; lisans bildirimi `LICENSE-template.txt` dosyasındadır ve korunmalıdır. Kullanılan kütüphaneler kendi lisanslarına tabidir. Şablon kaynağı `kaynak.txt` dosyasında belirtilmiştir.

---

## English

A multi-page, Turkish/English, dark-themed personal portfolio template with scroll animations and a 3D background (GSAP, Lenis, Three.js), animated page transitions and a client-side **admin panel**. Fully static: no server, database or build step needed.

### Features

- **4 pages:** Home, Resume, Projects, Contact
- **TR / EN** language switch (remembered in the browser)
- **Dark theme**, refined typography, responsive layout
- **Animations:** GSAP + ScrollTrigger, Lenis smooth scrolling, Three.js 3D background, custom cursor, magnetic buttons
- **Page transitions** between pages
- **Admin panel (`admin.html`):** edit profile, texts, projects, experience, education, skills, languages and stats without code; image upload; `content.js` and JSON export/import; password change
- **Single data file:** all content lives in `js/content.js`
- Contact form opens the visitor's email app via `mailto:`

### Running locally

Open `index.html` in a browser, or run `python3 -m http.server 8000` and visit `http://localhost:8000`. Use **"Use this template"** on GitHub to create your own copy.

### Customizing with the admin panel

1. Open `admin.html`. Default password: **`admin`**.
2. Edit content in the tabs and click **Kaydet** (Save). Changes are stored in `localStorage` and are visible **only in that browser**.
3. To make them permanent, use **"content.js indir"** (Download content.js) and replace `js/content.js` in the project.
4. Change the password under **Ayarlar** (Settings).

> ⚠️ The admin panel is client-side only. The password check happens in the browser and is **not real security**; the panel cannot modify files on a server.

### Editing `js/content.js` directly

All content is in `window.SITE_CONTENT` (profile, `text.tr` / `text.en`, projects, experience, education, skills, skillBars, languages, stats). Multilingual fields use `{ "tr": "...", "en": "..." }`; `{name}` and `{firstName}` are replaced with profile values. For project images set `image` (e.g. `assets/projects/my-project.jpg`) or use an abstract pattern via `art` (`art-1` … `art-6`). Add your CV as `assets/cv.pdf`.

### Credits & license

Based on [Start Bootstrap — Personal](https://startbootstrap.com/theme/personal) (MIT; notice kept in `LICENSE-template.txt`). Uses Bootstrap 5, Bootstrap Icons, GSAP, Lenis, Three.js and Google Fonts, each under its own license. See `kaynak.txt` for source attribution.
