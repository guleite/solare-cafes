/* =========================================================
   SOLARE CAFÉS ESPECIAIS — scripts
   - abertura, topo, menu, animações de rolagem e do cursor
   - grafismos gerados (raios de sol, sombras de folhas, grãos)
   - cards de produto, jornada, calculadora de preparo, dúvidas
   - formulário qualificador: todo contato passa por ele e
     termina no WhatsApp com o pedido já resumido
   ========================================================= */

// WhatsApp da Solare: formato internacional, só dígitos (trocar antes de publicar)
const SOLARE_WHATSAPP = "5561000000000";
// Endereço opcional para receber o lead (CRM, planilha, e-mail). Vazio = não envia.
const SOLARE_LEAD_ENDPOINT = "";
// Perfil do Instagram (vazio = link fica inativo)
const SOLARE_INSTAGRAM = "";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const NS = "http://www.w3.org/2000/svg";

/* ---------- Grafismos gerados ---------- */
// raios do sol, como no símbolo: alternando longos e curtos
$$("svg[data-rays]").forEach((svg) => {
  const n = +svg.dataset.rays, r1 = +svg.dataset.r1, r2 = +svg.dataset.r2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const end = i % 2 ? r1 + (r2 - r1) * 0.62 : r2;
    const l = document.createElementNS(NS, "line");
    l.setAttribute("x1", (Math.cos(a) * r1).toFixed(1));
    l.setAttribute("y1", (Math.sin(a) * r1).toFixed(1));
    l.setAttribute("x2", (Math.cos(a) * end).toFixed(1));
    l.setAttribute("y2", (Math.sin(a) * end).toFixed(1));
    l.style.setProperty("--k", i);
    svg.appendChild(l);
  }
});

// sombras de folhagem: folhas finas ao longo de um caule curvo, depois desfocadas no CSS
$$("svg[data-leaf]").forEach((svg, idx) => {
  const P0 = [20, 20], C = [360 + idx * 30, 60 + idx * 40], P1 = [560, 540 - idx * 30];
  const at = (t) => [
    (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * C[0] + t * t * P1[0],
    (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * C[1] + t * t * P1[1],
  ];
  const tan = (t) => [2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P1[0] - C[0]), 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P1[1] - C[1])];
  let d = "";
  for (let t = 0.07; t < 0.97; t += 0.05) {
    const [x, y] = at(t), [tx, ty] = tan(t);
    const ang = Math.atan2(ty, tx) * 180 / Math.PI;
    const len = 150 * (1 - 0.55 * t) + 26, w = 14 * (1 - 0.35 * t);
    [-1, 1].forEach((side) => {
      const a = ang + side * (62 - t * 18);
      d += `<ellipse cx="${(x + Math.cos(a * Math.PI / 180) * len / 2).toFixed(1)}" cy="${(y + Math.sin(a * Math.PI / 180) * len / 2).toFixed(1)}" rx="${(len / 2).toFixed(1)}" ry="${w.toFixed(1)}" transform="rotate(${a.toFixed(1)} ${(x + Math.cos(a * Math.PI / 180) * len / 2).toFixed(1)} ${(y + Math.sin(a * Math.PI / 180) * len / 2).toFixed(1)})"/>`;
    });
  }
  d += `<path d="M${P0} Q${C} ${P1}" fill="none" stroke="currentColor" stroke-width="7" style="color:rgba(43,32,26,.9)"/>`;
  svg.innerHTML = d;
});

// medidor de torra com grãos
$$(".roast").forEach((r) => {
  const lvl = +r.dataset.level || 0;
  r.setAttribute("role", "img");
  r.setAttribute("aria-label", `Torra ${lvl} de 5`);
  r.innerHTML = Array.from({ length: 5 }, (_, i) => `<svg viewBox="0 0 40 56" class="${i < lvl ? "on" : ""}" style="--k:${i}"><use href="#i-bean-flat"/></svg>`).join("");
  if (!reduced) r.classList.add("is-pending");
});

// letreiro contínuo: duplica o conteúdo para o loop não ter emenda
$$(".ticker__track").forEach((t) => { t.innerHTML += t.innerHTML; });

/* ---------- Abertura ---------- */
(function intro() {
  const body = document.body;
  $$(".hero [data-in]").forEach((el, i) => el.style.setProperty("--i", i));
  let seen = false;
  try { seen = sessionStorage.getItem("solare_intro") === "1"; } catch (e) {}
  if (seen || reduced) {
    body.classList.add("skip-intro");
    requestAnimationFrame(() => setTimeout(() => body.classList.add("is-ready"), 30));
    return;
  }
  try { sessionStorage.setItem("solare_intro", "1"); } catch (e) {}
  body.classList.add("lock");
  const go = () => { body.classList.add("is-ready"); body.classList.remove("lock"); };
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fonts, new Promise((r) => setTimeout(r, 1400))]).then(() => setTimeout(go, 1500));
})();

/* ---------- Topo + menu ---------- */
(function header() {
  const h = $(".hdr"), burger = $(".burger"), nav = $(".nav");
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    h.classList.toggle("is-solid", y > 40);
    const open = nav.classList.contains("is-open");
    if (!open && y > 520 && y > lastY + 3) h.classList.add("is-hidden");
    if (y < lastY - 3 || y < 520) h.classList.remove("is-hidden");
    lastY = y;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    h.classList.toggle("menu-open", open);
    document.body.classList.toggle("lock", open);
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a, button", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  const links = $$('.nav a[href^="#"]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((a) => { const s = $(a.getAttribute("href")); if (s) io.observe(s); });

  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
  $$("[data-instagram]").forEach((a) => {
    if (SOLARE_INSTAGRAM) a.href = SOLARE_INSTAGRAM;
    else a.addEventListener("click", (e) => e.preventDefault());
  });
})();

/* ---------- Revelação, contadores e torra ---------- */
(function reveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -50px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target, to = +el.dataset.count;
      if (reduced) { el.textContent = to; return; }
      const t0 = performance.now(), dur = 1700;
      const tick = (now) => {
        const p = clamp((now - t0) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  const roastIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      roastIO.unobserve(e.target);
      setTimeout(() => e.target.classList.remove("is-pending"), e.target.closest(".hero") ? 1900 : 350);
    });
  }, { threshold: 0.8 });
  $$(".roast").forEach((r) => roastIO.observe(r));
})();

/* ---------- Manifesto: palavras acendem conforme a leitura ---------- */
const manifesto = (function () {
  const q = $("[data-words]");
  if (!q) return null;
  const accent = (q.dataset.accent || "").split(",");
  q.innerHTML = q.textContent.trim().split(/\s+/).map((w) => {
    const clean = w.replace(/[^\wÀ-ú]/g, "").toLowerCase();
    return `<span class="w${accent.includes(clean) ? " hl" : ""}">${w}</span>`;
  }).join(" ");
  const spans = $$(".w", q);
  if (reduced) { spans.forEach((s) => s.classList.add("on")); return null; }
  return (vh) => {
    const r = q.getBoundingClientRect();
    const p = clamp((vh * 0.88 - r.top) / (vh * 0.55 + r.height * 0.4));
    const n = Math.round(p * spans.length);
    spans.forEach((s, i) => s.classList.toggle("on", i < n));
  };
})();

/* ---------- Efeitos ligados à rolagem (um único loop) ---------- */
(function scrollFx() {
  const parallax = $$("[data-parallax]");
  const journey = $("[data-journey]");
  const steps = journey ? $$(".step", journey) : [];
  const fab = $(".fab"), hero = $(".hero"), final = $("#contato");
  let ticking = false, tipShown = false;

  function frame() {
    ticking = false;
    const vh = window.innerHeight;
    if (!reduced) {
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.translate = `0 ${((r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
      });
      if (manifesto) manifesto(vh);
    }
    if (journey) {
      const r = journey.getBoundingClientRect();
      const vertical = window.innerWidth <= 960;
      const p = reduced ? 1 : vertical ? clamp((vh * 0.65 - r.top) / r.height) : clamp((vh * 0.85 - r.top) / (vh * 0.55));
      journey.style.setProperty("--p", p.toFixed(3));
      steps.forEach((li, i) => {
        const at = vertical ? (li.offsetTop + 20) / r.height : i / steps.length + 0.03;
        li.classList.toggle("is-lit", reduced || p >= at);
      });
    }
    if (fab) {
      const past = hero.getBoundingClientRect().bottom < vh * 0.35;
      const fr = final.getBoundingClientRect();
      const inFinal = fr.top < vh * 0.85 && fr.bottom > 0;
      const show = past && !inFinal && !document.body.classList.contains("q-open");
      fab.classList.toggle("is-visible", show);
      if (show && !tipShown) {
        tipShown = true;
        setTimeout(() => fab.classList.add("tip-on"), 600);
        setTimeout(() => fab.classList.remove("tip-on"), 4200);
      }
    }
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req);
  frame();
})();

/* ---------- Cursor: profundidade no hero, cards inclinados, botões magnéticos ---------- */
(function pointerFx() {
  if (!finePointer || reduced) return;

  const hero = $(".hero");
  const layers = $$("[data-tilt-stage] [data-depth]");
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  const loop = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    layers.forEach((l) => {
      const d = parseFloat(l.dataset.depth);
      l.style.translate = `${(cx * d * 14).toFixed(2)}px ${(cy * d * 14).toFixed(2)}px`;
    });
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : null;
  };
  hero.addEventListener("pointermove", (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(loop);
  });
  hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });

  $$("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add("is-tilting");
      card.style.setProperty("--ry", `${(x * 5).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-y * 4).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });

  $$(".magnetic").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${((e.clientX - r.left - r.width / 2) * 0.16).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = ""; });
  });
})();

/* ---------- Lumiar: grãos ou moído ---------- */
(function formatToggle() {
  $$(".toggle").forEach((t) => {
    const btns = $$("button", t), ink = $("i", t);
    const place = () => {
      const on = btns.find((b) => b.getAttribute("aria-checked") === "true");
      ink.style.width = on.offsetWidth + "px";
      ink.style.transform = `translateX(${on.offsetLeft - 4}px)`;
    };
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.setAttribute("aria-checked", x === b));
      place();
    }));
    place();
    window.addEventListener("resize", place);
    document.fonts && document.fonts.ready.then(place);
  });
})();

/* ---------- Métodos de preparo + calculadora ---------- */
(function brewer() {
  const root = $(".brewer");
  if (!root) return;
  const M = {
    coado: {
      proporcao: "1 : 15", moagem: "Média-fina", agua: "92–96 °C", tempo: "2:30 a 3:00",
      sugestao: "Sugestão: Lumiar moído", unidade: "Xícaras de 150 ml", ml: 150, ratio: 15, max: 8,
      steps: [
        "Escalde o filtro com água quente e descarte essa água.",
        "Coloque o café e molhe o pó com um pouco de água. Espere 30 segundos para ele “abrir”.",
        "Despeje o restante em espiral, devagar, em duas ou três etapas.",
        "Sirva assim que terminar de passar.",
      ],
    },
    prensa: {
      proporcao: "1 : 15", moagem: "Grossa", agua: "92–96 °C", tempo: "4 minutos",
      sugestao: "Sugestão: Lumiar moído grosso", unidade: "Xícaras de 150 ml", ml: 150, ratio: 15, max: 8,
      steps: [
        "Coloque o café na prensa e adicione toda a água de uma vez.",
        "Mexa suavemente, tampe e aguarde 4 minutos sem pressionar.",
        "Desça o êmbolo devagar, com pressão constante.",
        "Sirva tudo em seguida para o café não amargar.",
      ],
    },
    moka: {
      proporcao: "1 : 8", moagem: "Fina-média", agua: "Quente, até a válvula", tempo: "4 a 5 minutos",
      sugestao: "Sugestão: Lumiar moído fino", unidade: "Xícaras de 60 ml", ml: 60, ratio: 8.5, max: 6,
      steps: [
        "Encha a base com água já quente, até a altura da válvula.",
        "Preencha o funil com café, nivelando sem compactar.",
        "Leve ao fogo baixo com a tampa aberta.",
        "Retire quando o café clarear e começar a borbulhar.",
      ],
    },
    drip: {
      proporcao: "1 sachê : 150 ml", moagem: "Já vem moído", agua: "90–94 °C", tempo: "Cerca de 2 min",
      sugestao: "Drip Coffee Catuaí Amarelo", unidade: "Xícaras de 150 ml", ml: 150, sachet: 12, max: 10,
      steps: [
        "Abra o sachê na linha picotada e encaixe as abas na borda da xícara.",
        "Molhe o pó com um pouco de água e espere 20 segundos.",
        "Complete com o restante da água aos poucos.",
        "Retire o sachê e aproveite.",
      ],
    },
  };
  const tabs = $$("[data-method]", root), ink = $(".brewer__ink", root);
  const imgs = $$("[data-method-img]", root);
  const out = { cafe: $('[data-out="cafe"]', root), agua: $('[data-out="agua"]', root) };
  const unitCafe = $('[data-out-unit="cafe"]', root);
  const cupsEl = $("[data-cups]", root), cup = $(".calc__cup", root), howto = $("[data-howto]", root);
  let method = "coado", cups = 2;

  const animateNum = (el, to) => {
    const from = parseFloat(el.textContent) || 0;
    if (reduced || from === to) { el.textContent = to; return; }
    const t0 = performance.now(), id = (el._anim = (el._anim || 0) + 1);
    const tick = (now) => {
      if (el._anim !== id) return;
      const p = clamp((now - t0) / 500);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    setTimeout(() => { if (el._anim === id) el.textContent = to; }, 620); // garante o valor final
  };

  const calc = () => {
    const m = M[method];
    cups = clamp(cups, 1, m.max);
    cupsEl.textContent = cups;
    const water = m.ml * cups;
    if (m.sachet) { animateNum(out.cafe, cups); unitCafe.textContent = cups > 1 ? "sachês de drip" : "sachê de drip"; }
    else { animateNum(out.cafe, Math.round(water / m.ratio)); unitCafe.textContent = "g de café"; }
    animateNum(out.agua, water);
    cup.style.setProperty("--fill", (0.25 + 0.75 * (cups / m.max)).toFixed(3));
  };

  const placeInk = () => {
    const on = tabs.find((t) => t.dataset.method === method);
    ink.style.width = on.offsetWidth + "px";
    ink.style.transform = `translateX(${on.offsetLeft}px)`;
  };

  const setMethod = (id, first) => {
    method = id;
    const m = M[id];
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.method === id));
    imgs.forEach((i) => i.classList.toggle("is-on", i.dataset.methodImg === id));
    $$("[data-field]", root).forEach((f) => {
      f.textContent = m[f.dataset.field];
      if (!first) { f.classList.remove("flip"); void f.offsetWidth; f.classList.add("flip"); }
    });
    howto.innerHTML = m.steps.map((s, k) => `<li style="--k:${k}">${s}</li>`).join("");
    placeInk();
    calc();
  };

  tabs.forEach((t) => t.addEventListener("click", () => setMethod(t.dataset.method)));
  $$("[data-step]", root).forEach((b) => b.addEventListener("click", () => { cups += +b.dataset.step; calc(); }));
  window.addEventListener("resize", placeInk);
  document.fonts && document.fonts.ready.then(placeInk);
  setMethod("coado", true);
})();

/* ---------- Dúvidas (abertura suave) ---------- */
(function faq() {
  $$(".qa").forEach((d) => {
    const sum = $("summary", d), body = $(".qa__body", d);
    sum.addEventListener("click", (e) => {
      if (reduced) return;
      e.preventDefault();
      if (d.open) {
        const h = body.offsetHeight;
        body.animate([{ height: h + "px", opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 420, easing: "cubic-bezier(.2,.7,.1,1)" })
          .onfinish = () => { d.open = false; };
      } else {
        $$(".qa[open]").forEach((o) => { if (o !== d) $("summary", o).click(); });
        d.open = true;
        const h = body.offsetHeight;
        body.animate([{ height: "0px", opacity: 0 }, { height: h + "px", opacity: 1 }], { duration: 520, easing: "cubic-bezier(.2,.7,.1,1)" });
      }
    });
  });
})();

/* =========================================================
   Formulário qualificador
   ========================================================= */
const Qualify = (function () {
  const PESSOAL = ["Mim e minha casa", "Presentear alguém"];
  const EMPRESA = "Minha empresa ou escritório";
  const LOJA = "Minha cafeteria, restaurante ou loja";
  const isPessoal = (d) => PESSOAL.includes(d.perfil);

  const steps = [
    {
      id: "nome", type: "text", kicker: "Olá!", title: "Para começar, como podemos te chamar?",
      hint: "Leva menos de um minuto. No fim, você segue para o WhatsApp com o pedido já anotado.", placeholder: "Seu nome",
    },
    {
      id: "perfil", type: "single", kicker: "Para quem", title: "{nome}, o café é para…",
      hint: "Assim a gente já sabe como te atender.",
      options: () => [
        { v: "Mim e minha casa", sub: "Pacotes e drip coffee para o dia a dia" },
        { v: "Presentear alguém", sub: "Kits e pacotes para presente" },
        { v: EMPRESA, sub: "Café para a equipe, brindes e eventos" },
        { v: LOJA, sub: "Grãos para o cardápio ou para revenda" },
      ],
    },
    {
      id: "interesse", type: "multi", kicker: "Pedido",
      title: (d) => isPessoal(d) ? "O que você gostaria de pedir?" : d.perfil === LOJA ? "O que o seu negócio procura?" : "O que a sua empresa procura?",
      hint: "Pode marcar mais de um.",
      options: (d) => d.perfil === EMPRESA ? [
        { v: "Café para o escritório", sub: "Em grãos, moído ou drip coffee" },
        { v: "Kits e presentes corporativos", sub: "Para clientes, parceiros e equipe" },
        { v: "Evento, aulão ou degustação", sub: "Experiência Solare no seu evento" },
        { v: "Drip coffee para a equipe", sub: "Prático para a rotina do escritório" },
      ] : d.perfil === LOJA ? [
        { v: "Grãos para o cardápio", sub: "Café especial para servir" },
        { v: "Drip coffee para revenda", sub: "Caixas com 10 sachês" },
        { v: "Evento, aulão ou degustação", sub: "Para o seu público" },
        { v: "Quero conhecer as opções", sub: "A gente apresenta os cafés" },
      ] : [
        { v: "Lumiar · 250 g", sub: "Torra média · notas de chocolate" },
        { v: "Drip Coffee Catuaí Amarelo", sub: "10 sachês · caramelo e melaço" },
        { v: "Kit presente com caneca", sub: "Lumiar, drip coffee e caneca" },
        { v: "Quero ajuda para escolher", sub: "A gente indica pelo seu gosto" },
      ],
    },
    {
      id: "preparo", type: "single", layout: "two", kicker: "Moagem",
      when: (d) => isPessoal(d) && d.formato !== "Em grãos" && (d.interesse || []).some((i) => /Lumiar|Kit|ajuda/.test(i)),
      title: (d) => d.perfil === "Presentear alguém" ? "Quem vai ganhar prepara o café como?" : "Como você prepara o seu café?",
      hint: "Assim o café chega na moagem certa para o método.",
      options: (d) => {
        const o = ["Coador de papel ou V60", "Prensa francesa", "Cafeteira elétrica", "Moka (italiana)", "Máquina de espresso", "Tenho moedor: quero em grãos"];
        if (d.perfil === "Presentear alguém") o.push("Não sei: podem sugerir");
        return o.map((v) => ({ v }));
      },
      notes: {
        "Tenho moedor: quero em grãos": "Ótima escolha: em grãos o aroma dura bem mais.",
        "Máquina de espresso": "Para espresso a moagem é bem fina — a gente ajusta para a sua máquina.",
        "Cafeteira elétrica": "Boa notícia: café especial também fica ótimo na cafeteira elétrica, com moagem média.",
      },
    },
    {
      id: "quantidade", type: "single", kicker: "Quantidade",
      title: (d) => ({
        "Mim e minha casa": "Quanto café vai na sua casa por mês?",
        "Presentear alguém": "Quantos presentes você quer montar?",
        [EMPRESA]: "Quantas pessoas vão aproveitar?",
        [LOJA]: "Qual o consumo aproximado por mês?",
      })[d.perfil] || "Qual a quantidade aproximada?",
      hint: "Uma estimativa já ajuda a preparar o seu orçamento.",
      options: (d) => (({
        "Mim e minha casa": ["1 pacote (250 g)", "2 pacotes (500 g)", "1 kg ou mais", "Ainda não sei"],
        "Presentear alguém": ["1 presente", "2 a 5 presentes", "6 a 20 presentes", "Mais de 20 presentes"],
        [EMPRESA]: ["Até 10 pessoas", "10 a 50 pessoas", "50 a 200 pessoas", "Mais de 200 pessoas"],
        [LOJA]: ["Até 5 kg por mês", "5 a 20 kg por mês", "20 a 50 kg por mês", "Mais de 50 kg por mês"],
      })[d.perfil] || ["Pouca", "Média", "Grande", "Não sei"]).map((v) => ({ v })),
      notes: {
        "6 a 20 presentes": "Para quantidades maiores, montamos uma proposta especial.",
        "Mais de 20 presentes": "Para quantidades maiores, montamos uma proposta especial.",
        "Mais de 200 pessoas": "Volume grande? A gente prepara uma proposta sob medida.",
        "Mais de 50 kg por mês": "Volume grande? A gente prepara uma proposta sob medida.",
      },
    },
    {
      id: "local", type: "single", layout: "two", kicker: "Entrega", title: "Onde o café vai ser entregue?",
      hint: "Usamos isso para calcular prazo e frete.",
      options: () => ["Brasília · Plano Piloto", "Outras regiões do DF", "Entorno do DF / Goiás", "Outra cidade ou estado"].map((v) => ({ v })),
    },
    {
      id: "contato", type: "contact", kicker: "Quase lá", title: "{nome}, qual o seu WhatsApp?",
      hint: "É por lá que confirmamos o pedido, os valores e a entrega.",
    },
  ];

  let modal, body, cur = 0, data = {}, locked = new Set(), lastFocus = null, origem = "site";
  const pad = (n) => String(n).padStart(2, "0");
  const firstName = () => (data.nome || "").trim().split(/\s+/)[0] || "";
  const visible = () => steps.filter((s) => usable(s));
  const resolve = (v) => (typeof v === "function" ? v(data) : v);
  const title = (s) => {
    const t = resolve(s.title), n = firstName();
    return n ? t.replace("{nome}", n) : t.replace("{nome}, o", "O").replace("{nome}, q", "Q");
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  function build() {
    document.body.insertAdjacentHTML("beforeend", `
    <div class="qm" role="dialog" aria-modal="true" aria-labelledby="qm-title" aria-hidden="true">
      <div class="qm__backdrop" data-qclose></div>
      <div class="qm__card">
        <div class="qm__top">
          <div class="qm__brand">
            <img src="assets/img/solare-emblema.webp" alt="">
            <div><b id="qm-title">Seu pedido Solare</b><small>Responda rapidinho e siga para o WhatsApp</small></div>
          </div>
          <button type="button" class="qm__close" data-qclose aria-label="Fechar"></button>
          <div class="qm__progress"><div class="qm__bar"><i></i></div><span class="qm__count"></span></div>
          <div class="qm__stars" aria-hidden="true"></div>
        </div>
        <form class="qm__body" novalidate autocomplete="on"></form>
        <div class="qm__nav">
          <button type="button" class="qback"><svg><use href="#i-arrow"/></svg> Voltar</button>
          <span class="qkeys"></span>
          <button type="button" class="btn btn--dark qnext">Continuar <svg><use href="#i-arrow"/></svg></button>
        </div>
      </div>
    </div>`);
    modal = $(".qm");
    body = $(".qm__body", modal);
    $$("[data-qclose]", modal).forEach((b) => b.addEventListener("click", close));
    body.addEventListener("submit", (e) => { e.preventDefault(); next(); });
    $(".qnext", modal).addEventListener("click", next);
    $(".qback", modal).addEventListener("click", back);

    document.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") return close();
      if (e.key === "Tab") return trapFocus(e);
      if (cur === "done" || /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      const k = e.key.toUpperCase();
      if (k.length === 1 && k >= "A" && k <= "G") {
        const opt = $$(".opt", body)[k.charCodeAt(0) - 65];
        if (opt) { e.preventDefault(); opt.click(); }
      } else if (e.key === "Enter") { e.preventDefault(); next(); }
    });
  }

  function renderStep(s) {
    let html = "";
    if (s.type === "text") {
      html = `<div class="qfield big"><input id="q-nome" name="nome" placeholder=" " autocomplete="given-name" maxlength="60" value="${esc(data.nome || "")}"><label for="q-nome">${s.placeholder}</label></div><p class="qerr"></p>`;
    } else if (s.type === "contact") {
      html = `
        <div class="qrow">
          <div class="qfield"><input id="q-whats" name="whats" type="tel" inputmode="tel" placeholder=" " autocomplete="tel" value="${esc(data.whats || "")}"><label for="q-whats">WhatsApp com DDD</label></div>
          <div class="qfield"><input id="q-email" name="email" type="email" placeholder=" " autocomplete="email" value="${esc(data.email || "")}"><label for="q-email">E-mail (opcional)</label></div>
        </div>
        <label class="qconsent"><input type="checkbox" name="consent" ${data.consent ? "checked" : ""}><span>Autorizo o uso destes dados para a Solare responder ao meu pedido, conforme a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</span></label>
        <p class="qerr"></p>`;
    } else {
      const multi = s.type === "multi";
      const sel = multi ? data[s.id] || [] : [data[s.id]];
      html = `<div class="qopts${s.layout === "two" ? " two" : ""}${multi ? " qmulti" : ""}">${resolve(s.options).map((o, j) => `
        <button type="button" class="opt${sel.includes(o.v) ? " is-selected" : ""}" data-v="${esc(o.v)}" style="--k:${j}" aria-pressed="${sel.includes(o.v)}">
          <span class="opt__k">${multi && sel.includes(o.v) ? "✓" : String.fromCharCode(65 + j)}</span>
          <span>${esc(o.v)}${o.sub ? `<span class="opt__sub">${esc(o.sub)}</span>` : ""}</span>
        </button>`).join("")}</div>
        <div class="qnote"><span class="qnote__txt"></span></div>`;
    }
    return `<span class="eyebrow"><svg><use href="#i-star"/></svg> ${s.kicker}</span><h3>${esc(title(s))}</h3><p class="hint">${s.hint}</p>${html}`;
  }

  function show(i, dir = 1) {
    const done = i === "done";
    const el = document.createElement("div");
    el.className = "qstep" + (dir < 0 ? " back" : "") + (done ? " qdone" : "");
    el.innerHTML = done ? renderDone() : renderStep(steps[i]);
    body.replaceChildren(el);
    body.scrollTop = 0;

    const vis = visible();
    const pos = done ? vis.length : vis.indexOf(steps[i]);
    $(".qm__bar i", modal).style.width = (done ? 100 : ((pos + 0.4) / vis.length) * 100) + "%";
    $(".qm__count", modal).innerHTML = done ? "<b>Pronto!</b>" : `<b>${pad(pos + 1)}</b> / ${pad(vis.length)}`;
    $(".qm__nav", modal).style.display = done ? "none" : "";
    $(".qback", modal).hidden = done || prevIndex(i) < 0;

    if (done) {
      $(".qwa", el).addEventListener("click", () => console.info("[Solare] lead seguiu para o WhatsApp"));
      $$("[data-qclose]", el).forEach((b) => b.addEventListener("click", close));
      setTimeout(() => $(".qwa", el).focus({ preventScroll: true }), 60);
      return;
    }
    const s = steps[i];
    const keys = $(".qkeys", modal);
    const choice = s.type === "single" || s.type === "multi";
    keys.style.visibility = choice ? "" : "hidden";
    if (choice) keys.innerHTML = `Use <kbd>A</kbd>–<kbd>${String.fromCharCode(64 + resolve(s.options).length)}</kbd> e <kbd>Enter</kbd>`;

    $$(".opt", el).forEach((b) => b.addEventListener("click", () => pick(s, b)));
    $$("input", el).forEach((inp) => inp.addEventListener("input", () => {
      inp.closest(".qfield, .qconsent")?.classList.remove("has-error");
      const err = $(".qerr", el);
      if (err) err.textContent = "";
      if (inp.name === "whats") inp.value = maskPhone(inp.value);
      syncNext();
    }));
    $$('input[type="checkbox"]', el).forEach((c) => c.addEventListener("change", syncNext));
    syncNext();
    const inp = $("input:not([type=checkbox])", el);
    if (inp && (finePointer || s.type !== "text")) setTimeout(() => inp.focus({ preventScroll: true }), 350);
    else if (!inp) setTimeout(() => $(".qnext", modal).focus({ preventScroll: true }), 60);
  }

  function pick(s, btn) {
    const v = btn.dataset.v;
    if (s.type === "multi") {
      const arr = new Set(data[s.id] || []);
      arr.has(v) ? arr.delete(v) : arr.add(v);
      data[s.id] = [...arr];
      const on = arr.has(v);
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", on);
      const k = $(".opt__k", btn);
      k.textContent = on ? "✓" : String.fromCharCode(65 + $$(".opt", body).indexOf(btn));
      syncNext();
      return;
    }
    $$(".opt", body).forEach((b) => { b.classList.toggle("is-selected", b === btn); b.setAttribute("aria-pressed", b === btn); });
    data[s.id] = v;
    syncNext();
    const note = s.notes && s.notes[v];
    const box = $(".qnote", body);
    if (note) {
      $(".qnote__txt", box).textContent = note;
      box.classList.remove("show"); void box.offsetWidth; box.classList.add("show");
      return; // deixa a pessoa ler a observação antes de seguir
    }
    box.classList.remove("show");
    setTimeout(() => { if (cur === steps.indexOf(s)) next(); }, 380);
  }

  function syncNext() {
    if (cur === "done") return;
    const s = steps[cur];
    let ok = true;
    if (s.type === "text") ok = ($("input", body)?.value.trim().length || 0) >= 2;
    else if (s.type === "single") ok = !!data[s.id];
    else if (s.type === "multi") ok = (data[s.id] || []).length > 0;
    const btn = $(".qnext", modal);
    btn.disabled = !ok;
    const last = nextIndex(cur) < 0;
    btn.innerHTML = (last ? "Finalizar" : "Continuar") + ' <svg><use href="#i-arrow"/></svg>';
  }

  function validate() {
    const s = steps[cur];
    const err = $(".qerr", body);
    if (s.type === "text") {
      const v = $("input", body).value.trim();
      if (v.length < 2) { err.textContent = "Conta pra gente como podemos te chamar."; return false; }
      data.nome = v;
    }
    if (s.type === "single" && !data[s.id]) return false;
    if (s.type === "multi" && !(data[s.id] || []).length) return false;
    if (s.type === "contact") {
      const wa = $('[name="whats"]', body), em = $('[name="email"]', body), cons = $('[name="consent"]', body);
      let msg = "";
      if (wa.value.replace(/\D/g, "").length < 10) { wa.closest(".qfield").classList.add("has-error"); msg = "Confira o WhatsApp: informe o DDD e o número."; }
      else if (em.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())) { em.closest(".qfield").classList.add("has-error"); msg = "Confira o e-mail — ou deixe em branco."; }
      else if (!cons.checked) { cons.closest(".qconsent").classList.add("has-error"); msg = "Marque a autorização para a Solare poder responder."; }
      err.textContent = msg;
      if (msg) return false;
      data.whats = wa.value.trim();
      data.email = em.value.trim();
      data.consent = true;
    }
    return true;
  }

  const usable = (s) => (!s.when || s.when(data)) && !(locked.has(s.id) && data[s.id] && (!Array.isArray(data[s.id]) || data[s.id].length));
  function nextIndex(i) { for (let n = i + 1; n < steps.length; n++) if (usable(steps[n])) return n; return -1; }
  function prevIndex(i) { if (i === "done") i = steps.length; for (let n = i - 1; n >= 0; n--) if (usable(steps[n])) return n; return -1; }

  function next() {
    if (cur === "done" || !validate()) return;
    const n = nextIndex(cur);
    if (n < 0) return finish();
    cur = n; show(cur);
  }
  function back() {
    const p = prevIndex(cur);
    if (p < 0) return;
    cur = p; show(cur, -1);
  }

  function priority() {
    let s = { [LOJA]: 40, [EMPRESA]: 32, "Presentear alguém": 16, "Mim e minha casa": 10 }[data.perfil] || 10;
    const q = steps[4].options && resolve(steps[4].options).map((o) => o.v).indexOf(data.quantidade);
    s += [0, 12, 22, 32][q] ?? 4;
    s += { "Brasília · Plano Piloto": 10, "Outras regiões do DF": 8, "Entorno do DF / Goiás": 5 }[data.local] || 3;
    if ((data.interesse || []).length > 1) s += 4;
    return s >= 70 ? "alta" : s >= 42 ? "média" : "normal";
  }

  function summaryRows() {
    const prep = data.formato === "Em grãos" ? "Em grãos" : data.preparo;
    return [
      ["Para", data.perfil],
      ["Pedido", (data.interesse || []).join(", ")],
      ["Moagem / formato", prep],
      ["Quantidade", data.quantidade],
      ["Entrega", data.local],
    ].filter(([, v]) => v);
  }

  function waText() {
    const lines = [`Olá, Solare! Sou ${data.nome} e vim pelo site.`, ""];
    summaryRows().forEach(([k, v]) => lines.push(`• ${k}: ${v}`));
    if (data.email) lines.push(`• E-mail: ${data.email}`);
    lines.push("", isPessoal(data) ? "Pode me ajudar a fechar o pedido?" : "Pode me enviar uma proposta?");
    return lines.join("\n");
  }

  function renderDone() {
    const n = firstName();
    return `
      <div class="qdone__sun" aria-hidden="true">
        <svg class="rays" viewBox="-100 -100 200 200">${Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2, e = i % 2 ? 78 : 92; return `<line x1="${(Math.cos(a) * 58).toFixed(1)}" y1="${(Math.sin(a) * 58).toFixed(1)}" x2="${(Math.cos(a) * e).toFixed(1)}" y2="${(Math.sin(a) * e).toFixed(1)}"/>`; }).join("")}</svg>
        <span><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </div>
      <span class="eyebrow"><svg><use href="#i-star"/></svg> Pedido anotado</span>
      <h3>Tudo certo, ${esc(n)}!</h3>
      <p class="hint">Agora é só continuar no WhatsApp: a conversa já abre com o resumo abaixo, e a Solare confirma valores e entrega por lá.</p>
      <dl class="qsummary">${summaryRows().map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
      <div class="qdone__actions">
        <a class="btn btn--wa btn--lg qwa" href="https://wa.me/${SOLARE_WHATSAPP}?text=${encodeURIComponent(waText())}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg> Continuar no WhatsApp</a>
        <button type="button" class="link-line" data-qclose>Voltar ao site</button>
      </div>
      <p class="qfine">Você não precisa repetir nada: está tudo na mensagem.</p>`;
  }

  function lead() {
    return {
      ...data,
      prioridade: priority(),
      origem,
      pagina: location.href,
      enviado_em: new Date().toISOString(),
    };
  }
  function sendLead() {
    const payload = lead();
    console.info("[Solare] lead qualificado", payload);
    if (!SOLARE_LEAD_ENDPOINT) return;
    try {
      fetch(SOLARE_LEAD_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
    } catch (e) {}
  }

  function finish() {
    cur = "done";
    show("done");
    sendLead();
  }

  function maskPhone(v) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function trapFocus(e) {
    const f = $$('button:not([disabled]):not([hidden]), a[href], input, textarea', modal).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open(opts = {}) {
    if (!modal) build();
    lastFocus = document.activeElement;
    origem = opts.origem || "site";
    const keep = { nome: data.nome, whats: data.whats, email: data.email, consent: data.consent };
    data = { ...keep };
    locked = new Set();
    Object.entries(opts.preset || {}).forEach(([k, v]) => { data[k] = v; locked.add(k); });
    if (data.formato === "Em grãos") data.preparo = "Em grãos";
    cur = 0;
    show(0);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock", "q-open");
    window.dispatchEvent(new Event("scroll"));
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("q-open");
    if (!$(".nav.is-open")) document.body.classList.remove("lock");
    window.dispatchEvent(new Event("scroll"));
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  return { open, close };
})();

// qualquer elemento com data-contact abre o formulário
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-contact]");
  if (!t) return;
  e.preventDefault();
  let preset = {};
  try { preset = t.dataset.preset ? JSON.parse(t.dataset.preset) : {}; } catch (err) {}
  if (t.dataset.product) {
    preset.interesse = [t.dataset.product];
    const card = t.closest(".product");
    const on = card && $('.toggle [aria-checked="true"]', card);
    if (on) preset.formato = on.dataset.format;
  }
  Qualify.open({ origem: t.dataset.origem, preset });
});
