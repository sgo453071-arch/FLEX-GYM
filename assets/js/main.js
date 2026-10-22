/* Flex Gym · one small script for every page. No libraries. */
(function () {
  "use strict";

  /* ---------- Site details: change once, every button updates ---------- */
  var SITE = {
    wa: "919803300112",
    tel: "+919803300112",
    email: "s.chaudhary4058@gmail.com",
    lat: 30.73424, lng: 76.73677,
    open: 5 * 60, close: 22 * 60, // minutes after midnight, India time
    closedDay: 0                   // Sunday
  };
  // TODO: replace with Sagar's real prices (₹). Used by the plan builder on plans.html.
  var PRICES = { 1: 1500, 3: 3999, 6: 7199, 12: 11999, ptPerMonth: 3500, diet: 999 };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wa = function (msg) { return "https://wa.me/" + SITE.wa + "?text=" + encodeURIComponent(msg); };
  var press = function (group, btn) { group.forEach(function (b) { b.setAttribute("aria-pressed", b === btn); }); };

  /* ---------- contact links ---------- */
  $$("[data-wa]").forEach(function (a) { a.href = wa(a.dataset.wa || "Hi Flex Gym! I'd like to book a free session."); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-tel]").forEach(function (a) { a.href = "tel:" + SITE.tel; });
  $$("[data-mail]").forEach(function (a) { a.href = "mailto:" + SITE.email; });
  $$("[data-dir]").forEach(function (a) { a.href = "https://www.google.com/maps/dir/?api=1&destination=" + SITE.lat + "," + SITE.lng; a.target = "_blank"; a.rel = "noopener"; });

  /* ---------- toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl.t); toastEl.t = setTimeout(function () { toastEl.classList.remove("show"); }, 2000);
  }

  /* ---------- active page in nav ---------- */
  var here = location.pathname.split("/").pop() || "index.html";
  $$(".top__nav a, .tabs a, .sheet__grid a").forEach(function (a) {
    if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
  });
  if (["coaches.html", "results.html", "check.html", "visit.html", "credits.html"].indexOf(here) > -1) {
    var more = $(".tabs [data-sheet]"); if (more) more.setAttribute("aria-current", "page");
  }

  /* ---------- top bar edge on scroll ---------- */
  var top = $(".top"), ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { top.classList.toggle("is-scrolled", window.scrollY > 8); ticking = false; });
  }, { passive: true });

  /* ---------- bottom sheet ---------- */
  function sheet(open) { document.body.classList.toggle("sheet-open", open); document.body.classList.toggle("is-locked", open); }
  $$("[data-sheet]").forEach(function (b) { b.addEventListener("click", function () { sheet(true); }); });
  $$(".scrim, .sheet a").forEach(function (el) { el.addEventListener("click", function () { sheet(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") sheet(false); });

  /* ---------- split headings into words ---------- */
  $$(".split").forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w";
            var s = document.createElement("span"); s.textContent = part;
            w.appendChild(s); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    $$(".w > span", el).forEach(function (s, i) { s.style.transitionDelay = (i * 0.06) + "s"; });
  });

  /* ---------- reveal + counters ---------- */
  function countUp(el) {
    var end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0;
    if (reduce) return;
    requestAnimationFrame(function step(t) {
      t0 = t0 || t; var p = Math.min((t - t0) / 1300, 1);
      el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    });
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        if (e.target.dataset.count) countUp(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    $$(".rv, .split, [data-count]").forEach(function (el) { io.observe(el); });
  } else { $$(".rv, .split").forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- open / closed + doors countdown (India time) ---------- */
  function ist() {
    var p = {}, d = new Date();
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "numeric", minute: "numeric", second: "numeric", hour12: false })
      .formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
    return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), sec: (+p.hour % 24) * 3600 + +p.minute * 60 + +p.second };
  }
  function state() {
    var n = ist(), o = SITE.open * 60, c = SITE.close * 60, isOpen = n.day !== SITE.closedDay && n.sec >= o && n.sec < c, left, days = 0;
    if (isOpen) left = c - n.sec;
    else {
      if (n.day !== SITE.closedDay && n.sec < o) left = o - n.sec;
      else { days = 1; var d = (n.day + 1) % 7; while (d === SITE.closedDay) { days++; d = (d + 1) % 7; } left = days * 86400 - n.sec + o; }
    }
    return { open: isOpen, left: left, day: n.day };
  }
  var pad = function (x) { return (x < 10 ? "0" : "") + x; };
  function tick() {
    var s = state();
    $$("[data-status]").forEach(function (el) {
      el.classList.toggle("is-open", s.open);
      el.innerHTML = "<i></i>" + (s.open ? "Open now" : "Closed now");
    });
    var h = Math.floor(s.left / 3600), m = Math.floor(s.left % 3600 / 60), sec = s.left % 60;
    $$("[data-clock]").forEach(function (el) { el.innerHTML = pad(h) + "<span>:</span>" + pad(m) + "<span>:</span>" + pad(sec); });
    $$("[data-clock-label]").forEach(function (el) { el.textContent = s.open ? "Doors close in" : "Doors open in"; });
    return s;
  }
  var st = tick();
  if ($("[data-clock]")) setInterval(function () { if (!document.hidden) tick(); }, 1000);
  $$("[data-day]").forEach(function (el) { if (+el.dataset.day === st.day) el.classList.add("today"); });

  /* ---------- hero sentence builder ---------- */
  var picks = $$(".pick");
  if (picks.length) {
    var cta = $("#heroCta");
    var compose = function () {
      var v = {}; picks.forEach(function (p) { v[p.dataset.key] = $("span", p).textContent; });
      cta.href = wa("Hi Flex Gym! I want to " + v.goal + ". I'm " + v.level + " and I'd like to train " + v.time + ". Can I book a free session?");
    };
    picks.forEach(function (p) {
      var opts = p.dataset.opts.split("|"), i = 0, span = $("span", p);
      p.addEventListener("click", function () {
        i = (i + 1) % opts.length;
        if (reduce) { span.textContent = opts[i]; compose(); return; }
        p.classList.add("flip");
        setTimeout(function () { span.textContent = opts[i]; p.classList.remove("flip"); compose(); }, 180);
      });
    });
    compose();
  }

  /* ---------- first month: week switcher ---------- */
  var month = $(".month");
  if (month) {
    var wbtn = $$(".month__weeks button", month), card = $(".month__card", month);
    wbtn.forEach(function (b, i) {
      b.addEventListener("click", function () {
        press(wbtn, b);
        month.style.setProperty("--p", (i + 1) / wbtn.length);
        $("h3", card).textContent = b.dataset.t; $("p", card).textContent = b.dataset.d;
        card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
      });
    });
  }

  /* ---------- review rotator ---------- */
  var q = $(".quote");
  if (q) {
    var qs = $$("blockquote", q), qd = $$(".dots button"), qi = 0, timer;
    var go = function (i) { qi = (i + qs.length) % qs.length; qs.forEach(function (b, k) { b.classList.toggle("on", k === qi); }); press(qd, qd[qi]); };
    var auto = function () { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(qi + 1); }, 5500); };
    qd.forEach(function (d, i) { d.addEventListener("click", function () { go(i); auto(); }); });
    var sx = 0;
    q.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    q.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) { go(qi + (dx < 0 ? 1 : -1)); auto(); } });
    go(0); auto();
  }

  /* ---------- floor map ---------- */
  var zones = $$(".zone");
  if (zones.length) {
    var panel = $(".panel"), infos = $$(".zinfo");
    var pick = function (z, scroll) {
      zones.forEach(function (g) { var on = g.dataset.z === z; g.classList.toggle("on", on); g.setAttribute("aria-pressed", on); });
      infos.forEach(function (a) { a.hidden = a.dataset.z !== z; });
      panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
      if (scroll && window.innerWidth < 960) panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };
    zones.forEach(function (g) {
      g.addEventListener("click", function () { pick(g.dataset.z, true); });
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(g.dataset.z, true); } });
    });
    pick(location.hash.slice(1) && $('.zone[data-z="' + location.hash.slice(1) + '"]') ? location.hash.slice(1) : zones[0].dataset.z, false);

    var fuel = $$(".fuel button"), fuelCta = $("#fuelCta");
    var fuelLink = function () {
      var sel = fuel.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; }).map(function (b) { return b.dataset.n; });
      fuelCta.href = wa(sel.length ? "Hi Flex Gym! Please share price and stock for: " + sel.join(", ") + "." : "Hi Flex Gym! What supplements do you have at the counter?");
      $("span", fuelCta).textContent = sel.length ? "Ask price for " + sel.length + " item" + (sel.length > 1 ? "s" : "") : "Ask what's in stock";
    };
    fuel.forEach(function (b) { b.addEventListener("click", function () { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true"); fuelLink(); }); });
    if (fuelCta) fuelLink();
  }

  /* ---------- plan builder (barbell) ---------- */
  var bld = $("#builder");
  if (bld) {
    var S = { m: 3, pt: false, diet: false };
    var segs = $$(".seg button", bld), tg = $$(".tgl", bld);
    var plates = function () {
      var p = { 1: ["p1"], 3: ["p3"], 6: ["p6", "p3"], 12: ["p12", "p6"] }[S.m].slice();
      if (S.pt) p.push("pt"); if (S.diet) p.push("diet");
      return p.map(function (c) { return '<i class="pl ' + c + '"></i>'; }).join("");
    };
    var fmt = function (n) { return n.toLocaleString("en-IN"); };
    var render = function () {
      $(".bar-side.l", bld).innerHTML = plates(); $(".bar-side.r", bld).innerHTML = plates();
      var base = PRICES[S.m], total = base + (S.pt ? PRICES.ptPerMonth * S.m : 0) + (S.diet ? PRICES.diet : 0);
      var save = PRICES[1] * S.m - base;
      $(".total__big", bld).textContent = fmt(total);
      $("#perMonth").textContent = "₹" + fmt(Math.round(total / S.m)) + " / month";
      $("#save").textContent = save > 0 ? "You save ₹" + fmt(save) : "";
      var extras = [S.pt ? "personal training" : "", S.diet ? "a diet plan" : ""].filter(Boolean).join(" and ");
      $("#planCta").href = wa("Hi Flex Gym! I built my plan on your website: " + S.m + " month" + (S.m > 1 ? "s" : "") + (extras ? " with " + extras : "") + " (₹" + fmt(total) + "). Can I start with a free session?");
    };
    segs.forEach(function (b) { b.addEventListener("click", function () { press(segs, b); S.m = +b.dataset.m; render(); }); });
    tg.forEach(function (b) { b.addEventListener("click", function () { var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); S[b.dataset.k] = on; render(); }); });
    render();
  }

  /* ---------- coach flip cards ---------- */
  $$(".flip").forEach(function (f) {
    var flip = function () { f.classList.toggle("on"); f.setAttribute("aria-pressed", f.classList.contains("on")); };
    f.addEventListener("click", flip);
    f.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  });

  /* ---------- before / after ---------- */
  $$(".ba input").forEach(function (r) {
    var box = r.closest(".ba"), set = function () { box.style.setProperty("--x", r.value + "%"); };
    r.addEventListener("input", set); set();
  });
  if (!reduce && "IntersectionObserver" in window) {
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; bio.unobserve(e.target);
        var box = e.target, r = $("input", box), t0;
        setTimeout(function () {
          requestAnimationFrame(function a(t) {
            t0 = t0 || t; var p = Math.min((t - t0) / 1500, 1), v = 50 + Math.sin(p * Math.PI * 2) * 24 * (1 - p);
            r.value = v; box.style.setProperty("--x", v + "%"); if (p < 1) requestAnimationFrame(a);
          });
        }, 250);
      });
    }, { threshold: 0.6 });
    $$(".ba").forEach(function (b) { bio.observe(b); });
  }

  /* ---------- review stack (swipe or tap next) ---------- */
  var stack = $(".stack");
  if (stack) {
    var busy = false;
    var next = function () {
      if (busy) return; busy = true;
      var c = stack.lastElementChild; c.classList.add("gone"); c.style.transform = "";
      setTimeout(function () { c.classList.remove("gone"); stack.insertBefore(c, stack.firstElementChild); busy = false; }, reduce ? 0 : 420);
    };
    $("#nextReview").addEventListener("click", next);
    var x0 = null, cur;
    stack.addEventListener("pointerdown", function (e) { cur = stack.lastElementChild; if (!cur.contains(e.target)) return; x0 = e.clientX; cur.style.transition = "none"; });
    stack.addEventListener("pointermove", function (e) { if (x0 === null) return; var dx = e.clientX - x0; cur.style.transform = "translateX(" + dx + "px) rotate(" + dx / 18 + "deg)"; });
    var end = function (e) {
      if (x0 === null) return; var dx = e.clientX - x0; x0 = null; cur.style.transition = "";
      if (Math.abs(dx) > 70) next(); else cur.style.transform = "";
    };
    stack.addEventListener("pointerup", end); stack.addEventListener("pointercancel", end);
  }

  /* ---------- body check wizard ---------- */
  var wiz = $("#wiz");
  if (wiz) {
    var steps = $$(".wstep", wiz), dots = $$(".wiz__dots i", wiz), back = $(".wiz__back", wiz), cur = 0;
    var V = { h: 170, w: 70, goal: "" , day: "", time: "" };
    var show = function (i) {
      cur = i; steps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      dots.forEach(function (d, k) { d.className = k < i ? "done" : k === i ? "on" : ""; });
      back.classList.toggle("show", i > 0 && i < steps.length);
      wiz.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };
    $$("[data-dial]", wiz).forEach(function (box) {
      var k = box.dataset.dial, r = $("input", box), out = $("output", box);
      var set = function (v) { v = Math.max(+r.min, Math.min(+r.max, v)); V[k] = v; r.value = v; out.firstChild.nodeValue = v; };
      r.addEventListener("input", function () { set(+r.value); });
      $$(".step-btn", box).forEach(function (b) { b.addEventListener("click", function () { set(V[k] + +b.dataset.s); }); });
      set(V[k]);
    });
    var goals = $$(".goals button", wiz);
    goals.forEach(function (b) { b.addEventListener("click", function () { press(goals, b); V.goal = b.dataset.g; setTimeout(function () { result(); show(3); }, 220); }); });
    $$("[data-next]", wiz).forEach(function (b) { b.addEventListener("click", function () { show(cur + 1); }); });
    back.addEventListener("click", function () { if (cur > 0) show(cur - 1); });

    var result = function () {
      var m = V.h / 100, bmi = V.w / (m * m), band;
      if (bmi < 18.5) band = ["Underweight", "#3d9bd6"]; else if (bmi < 25) band = ["Healthy range", "#2e9e58"]; else if (bmi < 30) band = ["Above healthy", "#c8901a"]; else band = ["Well above healthy", "#E8352B"];
      $("#bmi").textContent = bmi.toFixed(1); $("#band").textContent = band[0]; $("#band").style.color = band[1];
      wiz.style.setProperty("--m", Math.max(2, Math.min(98, (bmi - 15) / 25 * 100)) + "%");
      $("#range").textContent = Math.round(18.5 * m * m) + "–" + Math.round(24.9 * m * m) + " kg";
      var maint = Math.round((10 * V.w + 6.25 * V.h - 5 * 27 + 5) * 1.45 / 50) * 50;
      var adj = V.goal === "lose fat" ? -400 : V.goal === "build muscle" ? 300 : 0;
      $("#kcal").textContent = (maint + adj).toLocaleString("en-IN") + " kcal";
      $("#protein").textContent = Math.round(V.w * (V.goal === "build muscle" ? 1.8 : 1.6)) + " g";
      $("#water").textContent = (Math.round(V.w * 0.035 * 10) / 10) + " L";
      var tip = {
        "lose fat": "Lift 3–4 days a week and add two cardio sessions. Strength training keeps your muscle while the fat comes off.",
        "build muscle": "Train each muscle twice a week with heavy compound lifts, and eat a small surplus with protein at every meal.",
        "get stronger": "Squat, deadlift, bench and press 3 days a week with slow, steady increases in weight.",
        "feel fitter": "Mix strength and conditioning circuits 3–4 days a week. You'll feel the difference in two weeks."
      }[V.goal];
      $("#tip").innerHTML = "<b>Coach's note:</b> " + tip;
      bookLink();
    };
    // next six open days
    var slots = $(".slots", wiz), names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], now = new Date(), added = 0;
    var nowIst = ist(), d0 = nowIst.day !== SITE.closedDay && nowIst.sec < (SITE.close - 60) * 60 ? 0 : 1; // skip today once it is within an hour of closing
    for (var d = d0; added < 6 && d < 10; d++) {
      var dt = new Date(now.getTime() + d * 86400000);
      if (dt.getDay() === SITE.closedDay) continue;
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(added === 0));
      var label = d === 0 ? "Today" : d === 1 ? "Tmrw" : names[dt.getDay()];
      b.innerHTML = "<small>" + label + "</small>" + dt.getDate();
      b.dataset.v = (d === 0 ? "today" : d === 1 ? "tomorrow" : names[dt.getDay()] + " " + dt.getDate());
      slots.appendChild(b); added++;
    }
    var dayBtns = $$("button", slots), timeBtns = $$(".times button", wiz);
    V.day = dayBtns[0].dataset.v; V.time = timeBtns[0].dataset.v;
    dayBtns.forEach(function (b) { b.addEventListener("click", function () { press(dayBtns, b); V.day = b.dataset.v; bookLink(); }); });
    timeBtns.forEach(function (b) { b.addEventListener("click", function () { press(timeBtns, b); V.time = b.dataset.v; bookLink(); }); });
    var bookLink = function () {
      $("#bookCta").href = wa("Hi Flex Gym! I did the body check on your website: " + V.h + " cm, " + V.w + " kg, BMI " + $("#bmi").textContent + ". My goal is to " + V.goal + ". Can I come for a free session " + V.day + " (" + V.time + ")?");
    };
    show(0);
  }

  /* ---------- map loads only on tap ---------- */
  var mapBtn = $(".map__load");
  if (mapBtn) mapBtn.addEventListener("click", function () {
    var f = document.createElement("iframe");
    f.src = "https://maps.google.com/maps?q=" + SITE.lat + "," + SITE.lng + "&z=17&output=embed";
    f.title = "Flex Gym on Google Maps"; f.allowFullscreen = true;
    mapBtn.replaceWith(f);
  });

  /* ---------- copy address ---------- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy).then(function () { toast("Address copied"); });
    });
  });

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
