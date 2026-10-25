/* ==========================================================================
   Site içeriği (tek veri dosyası)
   - Tüm metinler, profil bilgileri, projeler, deneyim, eğitim, yetenekler,
     diller ve istatistikler burada tutulur.
   - Bu dosyayı elle düzenleyebilir ya da admin.html panelinden
     "content.js indir" ile yeniden üretip bunun yerine koyabilirsin.
   - Metinlerde {name} ve {firstName} profil bilgileriyle değiştirilir.
   - JSON değil JS dosyasıdır: file:// ile açıldığında da çalışsın diye.
   ========================================================================== */

window.SITE_CONTENT = {
    "profile": {
        "name": "Adın Soyadın",
        "firstName": "Adın",
        "email": "ornek@mail.com",
        "phone": "0500 000 00 00",
        "location": "Şehir, TR",
        "github": "https://github.com/kullaniciadi",
        "instagram": "https://www.instagram.com/kullaniciadi/",
        "linkedin": "https://www.linkedin.com/in/kullaniciadi/"
    },
    "text": {
        "tr": {
            "meta.title.home": "Ana Sayfa — {name}",
            "meta.title.resume": "Özgeçmiş — {name}",
            "meta.title.projects": "Projeler — {name}",
            "meta.title.contact": "İletişim — {name}",
            "nav.home": "Ana Sayfa",
            "nav.resume": "Özgeçmiş",
            "nav.projects": "Projeler",
            "nav.contact": "İletişim",
            "nav.toggle": "Menüyü aç/kapat",
            "hero.status": "Yeni projelere açığım",
            "hero.line1": "Merhaba,",
            "hero.line2": "ben <em>{firstName}</em>",
            "hero.based": "Konum",
            "hero.local": "Yerel saat",
            "cursor.view": "Gör",
            "cursor.mail": "Yaz",
            "hero.sub": "Üniversite Adı'nda Bölüm Adı öğrencisiyim. Web tasarım, front-end geliştirme ve görsel tasarım üzerine çalışıyor; fikirleri sade ve kullanışlı dijital deneyimlere dönüştürüyorum.",
            "hero.cta1": "Projelerimi Gör",
            "hero.cta2": "Özgeçmiş",
            "hero.scroll": "Kaydır",
            "marquee.1": "Web Tasarım",
            "marquee.2": "Front-End",
            "marquee.3": "UI / UX",
            "marquee.4": "Animasyon",
            "marquee.5": "JavaScript",
            "marquee.6": "Figma",
            "marquee.7": "Python",
            "marquee.8": "HTML & CSS",
            "about.eyebrow": "Hakkımda",
            "about.statement": "Kod ve tasarımın kesiştiği yerde çalışıyorum. Her projede hem iyi görünen hem de gerçekten işe yarayan sonuçlar üretmeye odaklanıyorum.",
            "work.eyebrow": "Seçili İşler",
            "work.title": "Öne çıkan <em>projeler</em>",
            "work.all": "Tüm projeler",
            "services.eyebrow": "Neler yapıyorum",
            "services.1.t": "Web Tasarım",
            "services.1.d": "HTML5, CSS3 ve JavaScript ile modern, responsive siteler.",
            "services.2.t": "Front-End Geliştirme",
            "services.2.d": "Erişilebilir, hızlı ve bakımı kolay arayüzler.",
            "services.3.t": "Görsel Tasarım",
            "services.3.d": "Afiş, sosyal medya görseli ve basit marka kimliği çalışmaları.",
            "services.4.t": "Etkileşim & Animasyon",
            "services.4.d": "Kaydırma animasyonları ve küçük etkileşimlerle canlı sayfalar.",
            "cta.eyebrow": "Bir fikrin mi var?",
            "cta.big": "Hadi <em>konuşalım</em>",
            "footer.copy": "© 2026 {name}. Tüm hakları saklıdır.",
            "footer.template": "Şablon: Start Bootstrap",
            "footer.up": "Yukarı ↑",
            "resume.title": "Özgeç<em>miş</em>",
            "resume.sub": "Eğitimim, deneyimlerim ve kullandığım araçlar.",
            "resume.download": "CV İndir",
            "resume.exp": "Deneyim",
            "resume.edu": "Eğitim",
            "resume.skills": "Yetenekler",
            "resume.langs": "Diller",
            "resume.prof": "Uzmanlık",
            "projects.title": "Seçili <em>işler</em>",
            "projects.sub": "Okul, kişisel ve serbest çalışmalarımdan bir seçki.",
            "projects.view": "İncele",
            "projects.cta": "Bir projede birlikte çalışmak ister misin?",
            "projects.cta.btn": "İletişime geç",
            "contact.title": "Birlikte bir şeyler <em>yapalım</em>",
            "contact.sub": "Proje, staj veya sadece merhaba demek için formu doldurabilirsin.",
            "contact.name": "Adın",
            "contact.email": "E-posta adresin",
            "contact.phone": "Telefon numaran",
            "contact.message": "Mesajın",
            "contact.send": "Gönder",
            "contact.success": "Teşekkürler! Mesajın e-posta uygulamanda açıldı.",
            "contact.error": "Lütfen tüm alanları doğru doldur.",
            "contact.mail": "E-posta",
            "contact.tel": "Telefon",
            "contact.loc": "Konum",
            "contact.social": "Sosyal"
        },
        "en": {
            "meta.title.home": "Home — {name}",
            "meta.title.resume": "Resume — {name}",
            "meta.title.projects": "Projects — {name}",
            "meta.title.contact": "Contact — {name}",
            "nav.home": "Home",
            "nav.resume": "Resume",
            "nav.projects": "Projects",
            "nav.contact": "Contact",
            "nav.toggle": "Toggle navigation",
            "hero.status": "Available for new projects",
            "hero.line1": "Hello,",
            "hero.line2": "I'm <em>{firstName}</em>",
            "hero.based": "Based in",
            "hero.local": "Local time",
            "cursor.view": "View",
            "cursor.mail": "Write",
            "hero.sub": "I'm a Department Name student at University Name. I work on web design, front-end development and visual design, turning ideas into simple, useful digital experiences.",
            "hero.cta1": "See my work",
            "hero.cta2": "Resume",
            "hero.scroll": "Scroll",
            "marquee.1": "Web Design",
            "marquee.2": "Front-End",
            "marquee.3": "UI / UX",
            "marquee.4": "Animation",
            "marquee.5": "JavaScript",
            "marquee.6": "Figma",
            "marquee.7": "Python",
            "marquee.8": "HTML & CSS",
            "about.eyebrow": "About me",
            "about.statement": "I work where code and design meet. In every project I focus on results that look good and genuinely work.",
            "work.eyebrow": "Selected work",
            "work.title": "Featured <em>projects</em>",
            "work.all": "All projects",
            "services.eyebrow": "What I do",
            "services.1.t": "Web Design",
            "services.1.d": "Modern, responsive websites with HTML5, CSS3 and JavaScript.",
            "services.2.t": "Front-End Development",
            "services.2.d": "Accessible, fast and maintainable interfaces.",
            "services.3.t": "Visual Design",
            "services.3.d": "Posters, social media visuals and simple brand identity work.",
            "services.4.t": "Interaction & Animation",
            "services.4.d": "Lively pages with scroll animations and small interactions.",
            "cta.eyebrow": "Got an idea?",
            "cta.big": "Let's <em>talk</em>",
            "footer.copy": "© 2026 {name}. All rights reserved.",
            "footer.template": "Template: Start Bootstrap",
            "footer.up": "Back to top ↑",
            "resume.title": "Résu<em>mé</em>",
            "resume.sub": "My education, experience and the tools I use.",
            "resume.download": "Download CV",
            "resume.exp": "Experience",
            "resume.edu": "Education",
            "resume.skills": "Skills",
            "resume.langs": "Languages",
            "resume.prof": "Proficiency",
            "projects.title": "Selected <em>work</em>",
            "projects.sub": "A selection of my school, personal and freelance work.",
            "projects.view": "View",
            "projects.cta": "Want to work on a project together?",
            "projects.cta.btn": "Get in touch",
            "contact.title": "Let's make something <em>together</em>",
            "contact.sub": "Fill in the form for a project, an internship or just to say hi.",
            "contact.name": "Your name",
            "contact.email": "Email address",
            "contact.phone": "Phone number",
            "contact.message": "Your message",
            "contact.send": "Send",
            "contact.success": "Thanks! Your message was opened in your email app.",
            "contact.error": "Please fill in all fields correctly.",
            "contact.mail": "Email",
            "contact.tel": "Phone",
            "contact.loc": "Location",
            "contact.social": "Social"
        }
    },
    "projects": [
        {
            "title": {
                "tr": "Örnek Proje 1",
                "en": "Sample Project 1"
            },
            "tag": {
                "tr": "Web Tasarım",
                "en": "Web Design"
            },
            "desc": {
                "tr": "Responsive bir tanıtım sitesi: sade arayüz, hızlı yükleme ve mobil uyum.",
                "en": "A responsive landing site: clean interface, fast loading and mobile-friendly."
            },
            "image": "",
            "art": "art-1",
            "link": "",
            "featured": true
        },
        {
            "title": {
                "tr": "Örnek Proje 2",
                "en": "Sample Project 2"
            },
            "tag": {
                "tr": "Görsel Tasarım",
                "en": "Visual Design"
            },
            "desc": {
                "tr": "Bir etkinlik için hazırlanan afiş ve sosyal medya görselleri serisi.",
                "en": "A series of posters and social media visuals prepared for an event."
            },
            "image": "",
            "art": "art-2",
            "link": "",
            "featured": true
        },
        {
            "title": {
                "tr": "Örnek Proje 3",
                "en": "Sample Project 3"
            },
            "tag": {
                "tr": "Front-End",
                "en": "Front-End"
            },
            "desc": {
                "tr": "JavaScript ile geliştirilmiş, veriyi filtreleyip listeleyen küçük bir web uygulaması.",
                "en": "A small JavaScript web app that filters and lists data."
            },
            "image": "",
            "art": "art-3",
            "link": "",
            "featured": true
        },
        {
            "title": {
                "tr": "Örnek Proje 4",
                "en": "Sample Project 4"
            },
            "tag": {
                "tr": "Okul Projesi",
                "en": "School Project"
            },
            "desc": {
                "tr": "Ders kapsamında ekip olarak hazırlanan Python tabanlı bir proje.",
                "en": "A Python-based team project built as part of a course."
            },
            "image": "",
            "art": "art-4",
            "link": "",
            "featured": true
        }
    ],
    "experience": [
        {
            "date": {
                "tr": "2025 - Günümüz",
                "en": "2025 - Present"
            },
            "role": {
                "tr": "Front-End Geliştirici Stajyeri",
                "en": "Front-End Developer Intern"
            },
            "company": {
                "tr": "Şirket Adı",
                "en": "Company Name"
            },
            "desc": {
                "tr": "Ekiple birlikte web arayüzleri geliştiriyor, tasarımları responsive sayfalara dönüştürüyorum.",
                "en": "I build web interfaces with the team and turn designs into responsive pages."
            }
        },
        {
            "date": {
                "tr": "2024 - 2025",
                "en": "2024 - 2025"
            },
            "role": {
                "tr": "Serbest Web Tasarımcı",
                "en": "Freelance Web Designer"
            },
            "company": {
                "tr": "Serbest",
                "en": "Freelance"
            },
            "desc": {
                "tr": "Küçük işletmeler için tanıtım sayfaları ve sosyal medya görselleri hazırladım.",
                "en": "I created landing pages and social media visuals for small businesses."
            }
        },
        {
            "date": {
                "tr": "2024",
                "en": "2024"
            },
            "role": {
                "tr": "Kulüp Gönüllüsü",
                "en": "Club Volunteer"
            },
            "company": {
                "tr": "Öğrenci Kulübü Adı",
                "en": "Student Club Name"
            },
            "desc": {
                "tr": "Kulüp etkinliklerinin duyuru tasarımlarında ve web sayfasının güncellenmesinde görev aldım.",
                "en": "I helped design event announcements and keep the club website up to date."
            }
        }
    ],
    "education": [
        {
            "date": {
                "tr": "2024 - Günümüz",
                "en": "2024 - Present"
            },
            "school": {
                "tr": "Üniversite Adı",
                "en": "University Name"
            },
            "degree": {
                "tr": "Fakülte / Meslek Yüksekokulu Adı",
                "en": "Faculty / Vocational School Name"
            },
            "field": {
                "tr": "Bölüm Adı",
                "en": "Department Name"
            },
            "desc": {
                "tr": "Web programlama, veri yapıları ve tasarım derslerine odaklanıyor; öğrendiklerimi kendi projelerimde uyguluyorum.",
                "en": "Focusing on web programming, data structures and design, and applying what I learn in my own projects."
            }
        },
        {
            "date": {
                "tr": "2020 - 2024",
                "en": "2020 - 2024"
            },
            "school": {
                "tr": "Lise Adı",
                "en": "High School Name"
            },
            "degree": {
                "tr": "Lise",
                "en": "High School"
            },
            "field": {
                "tr": "Sayısal",
                "en": "Science track"
            },
            "desc": {
                "tr": "Bu alanı kendi eğitim bilgilerinle değiştir.",
                "en": "Replace this with your own education details."
            }
        }
    ],
    "skills": [
        {
            "tr": "HTML5",
            "en": "HTML5"
        },
        {
            "tr": "CSS3",
            "en": "CSS3"
        },
        {
            "tr": "JavaScript",
            "en": "JavaScript"
        },
        {
            "tr": "Python",
            "en": "Python"
        },
        {
            "tr": "Bootstrap",
            "en": "Bootstrap"
        },
        {
            "tr": "Git & GitHub",
            "en": "Git & GitHub"
        },
        {
            "tr": "Figma",
            "en": "Figma"
        },
        {
            "tr": "Responsive Tasarım",
            "en": "Responsive Design"
        },
        {
            "tr": "Takım Çalışması",
            "en": "Teamwork"
        }
    ],
    "skillBars": [
        {
            "name": {
                "tr": "HTML / CSS",
                "en": "HTML / CSS"
            },
            "percent": 80
        },
        {
            "name": {
                "tr": "JavaScript",
                "en": "JavaScript"
            },
            "percent": 65
        },
        {
            "name": {
                "tr": "Python",
                "en": "Python"
            },
            "percent": 60
        },
        {
            "name": {
                "tr": "UI Tasarım",
                "en": "UI Design"
            },
            "percent": 70
        }
    ],
    "languages": [
        {
            "tr": "Türkçe — Ana dil",
            "en": "Turkish — Native"
        },
        {
            "tr": "İngilizce — B2",
            "en": "English — B2"
        }
    ],
    "stats": [
        {
            "number": 4,
            "suffix": "+",
            "label": {
                "tr": "Tamamlanan proje",
                "en": "Projects completed"
            }
        },
        {
            "number": 6,
            "suffix": "",
            "label": {
                "tr": "Kullandığım araç",
                "en": "Tools I use"
            }
        },
        {
            "number": 999,
            "suffix": "+",
            "label": {
                "tr": "Fincan kahve",
                "en": "Cups of coffee"
            }
        }
    ]
};
