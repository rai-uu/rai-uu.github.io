/* Responsible AI group — rendering script.
   All content lives in js/data.js (window.RAI). This file only turns it into HTML.
   Pages mark the places to fill with data-render="..." attributes. */
(function () {
  "use strict";
  var D = window.RAI || {};
  var page = document.body.getAttribute("data-page") || "";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Allow a tiny bit of markup in data: *italic* and [text](url)
  function md(s) {
    return esc(s)
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+|[\w./#-]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }
  function ext(url) { return /^https?:/.test(url || "") ? ' target="_blank" rel="noopener"' : ""; }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(d) {
    var p = String(d).split("-");
    if (p.length === 1) return p[0];
    var m = MONTHS[parseInt(p[1], 10) - 1];
    return p.length === 3 ? parseInt(p[2], 10) + " " + m + " " + p[0] : m + " " + p[0];
  }
  function initials(name) {
    return name.replace(/[^A-Za-zÀ-ÿĞğİıŞşÇçÖöÜü' -]/g, "").split(/\s+/).filter(function (w) { return /^[A-ZÀ-ÞĞİŞÇÖÜ]/.test(w); })
      .slice(0, 2).map(function (w) { return w[0]; }).join("");
  }

  /* ---------- Shared header & footer ---------- */
  var NAV = [
    ["index.html", "Home", "home"],
    ["research.html", "Research", "research"],
    ["team.html", "People", "team"],
    ["news.html", "News", "news"],
    ["publications.html", "Publications", "publications"],
    ["education.html", "Education & Theses", "education"]
  ];
  var header = document.querySelector("[data-render=header]");
  if (header) {
    header.outerHTML =
      '<header class="site-header"><div class="wrap">' +
      '<a class="brand" href="index.html"><img src="images/logo.png" alt=""><span>Responsible AI<small>Utrecht University</small></span></a>' +
      '<button class="nav-toggle" aria-label="Menu" aria-expanded="false">&#9776;</button>' +
      '<nav class="nav">' + NAV.map(function (n) {
        return '<a href="' + n[0] + '"' + (n[2] === page ? ' class="active" aria-current="page"' : "") + ">" + n[1] + "</a>";
      }).join("") + "</nav></div></header>";
    var t = document.querySelector(".nav-toggle"), nav = document.querySelector(".nav");
    t.addEventListener("click", function () {
      var o = nav.classList.toggle("open"); t.setAttribute("aria-expanded", o);
    });
  }
  var footer = document.querySelector("[data-render=footer]");
  if (footer) {
    footer.outerHTML =
      '<footer class="site-footer"><div class="wrap"><div class="cols">' +
      '<div><a class="brand" href="index.html" style="margin-bottom:14px"><img src="images/logo.png" alt=""><span>Responsible AI group<small>Utrecht University</small></span></a>' +
      "<p>Department of Information and Computing Sciences<br>Utrecht University<br>Heidelberglaan 8, 3584 CS Utrecht<br>The Netherlands</p></div>" +
      "<div><h4>Explore</h4><ul>" + NAV.slice(1).map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + "</a></li>"; }).join("") + "</ul></div>" +
      '<div><h4>Elsewhere</h4><ul>' +
      '<li><a href="https://www.uu.nl/en/research/ai-data-science/responsible-ai" target="_blank" rel="noopener">Group page at uu.nl</a></li>' +
      '<li><a href="https://github.com/rai-uu" target="_blank" rel="noopener">GitHub: rai-uu</a></li>' +
      '<li><a href="https://www.uu.nl/en/organisation/department-of-information-and-computing-sciences" target="_blank" rel="noopener">Department of ICS</a></li>' +
      "</ul></div></div>" +
      '<div class="bottom"><span>&copy; ' + new Date().getFullYear() + " Responsible AI group, Utrecht University</span>" +
      '<span>Site source on <a href="https://github.com/rai-uu/rai-uu.github.io" target="_blank" rel="noopener">GitHub</a></span></div></div></footer>';
  }

  /* ---------- News ---------- */
  var TYPE_LABEL = { award: "Award", paper: "Paper", people: "People", event: "Event", talk: "Talk", grant: "Grant", role: "Role", defence: "PhD defence", media: "Media", software: "Software" };
  function sortedNews() {
    return (D.news || []).slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }
  function peopleLine(n) { return n.people && n.people.length ? '<div class="people">' + esc(n.people.join(", ")) + "</div>" : ""; }
  function newsTitle(n) { return n.link ? '<a href="' + esc(n.link) + '"' + ext(n.link) + ">" + md(n.title) + "</a>" : md(n.title); }

  document.querySelectorAll("[data-render=news-cards]").forEach(function (el) {
    var k = parseInt(el.getAttribute("data-limit") || "6", 10);
    el.innerHTML = sortedNews().slice(0, k).map(function (n) {
      return '<article class="card ' + esc(n.type) + ' reveal"><div class="tags"><span class="tag' + (n.type === "award" ? " y" : "") + '">' + esc(TYPE_LABEL[n.type] || n.type) + "</span></div>" +
        "<time>" + fmtDate(n.date) + "</time><h3>" + newsTitle(n) + "</h3>" + peopleLine(n) + "</article>";
    }).join("");
  });

  document.querySelectorAll("[data-render=news-list]").forEach(function (el) {
    var items = sortedNews();
    var years = []; items.forEach(function (n) { var y = String(n.date).slice(0, 4); if (years.indexOf(y) < 0) years.push(y); });
    var types = []; items.forEach(function (n) { if (types.indexOf(n.type) < 0) types.push(n.type); });
    var state = { type: "all" };
    var bar = document.createElement("div"); bar.className = "filters";
    bar.innerHTML = '<button class="on" data-t="all">All</button>' + types.map(function (t) { return '<button data-t="' + esc(t) + '">' + esc(TYPE_LABEL[t] || t) + "</button>"; }).join("");
    el.parentNode.insertBefore(bar, el);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      state.type = b.getAttribute("data-t");
      bar.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
      draw();
    });
    function draw() {
      var html = "";
      years.forEach(function (y) {
        var ys = items.filter(function (n) { return String(n.date).slice(0, 4) === y && (state.type === "all" || n.type === state.type); });
        if (!ys.length) return;
        html += '<div class="group-title"><h2>' + y + '</h2></div><div class="news-list">' + ys.map(function (n) {
          return '<article class="news-item"><time>' + fmtDate(n.date) + "</time><div>" +
            '<div class="tags" style="margin-bottom:6px"><span class="tag' + (n.type === "award" ? " y" : "") + '">' + esc(TYPE_LABEL[n.type] || n.type) + "</span></div>" +
            "<h3>" + newsTitle(n) + "</h3>" + (n.text ? "<p>" + md(n.text) + "</p>" : "") + peopleLine(n) + "</div></article>";
        }).join("") + "</div>";
      });
      el.innerHTML = html || '<p class="muted">No news in this category.</p>';
    }
    draw();
  });

  /* ---------- People ---------- */
  function personCard(p) {
    var ph = p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy">' : '<div class="initials">' + esc(initials(p.name)) + "</div>";
    var tag = p.url ? "a" : "div";
    return "<" + tag + ' class="person reveal"' + (p.url ? ' href="' + esc(p.url) + '"' + ext(p.url) : "") + '><div class="ph">' + ph + "</div>" +
      "<h3>" + esc(p.name) + '</h3><div class="role">' + esc(p.role) + (p.since ? " · since " + esc(p.since) : "") + "</div>" +
      (p.topic ? '<div class="topic">' + md(p.topic) + "</div>" : "") + "</" + tag + ">";
  }
  document.querySelectorAll("[data-render=people]").forEach(function (el) {
    var groups = D.peopleGroups || [];
    el.innerHTML = groups.map(function (g) {
      var ps = (D.people || []).filter(function (p) { return p.group === g.id; });
      // Faculty keep the order written in data.js; other sections go by start date, earliest first
      // (people without a start date go last, in their written order).
      if (g.id !== "faculty") {
        ps = ps.map(function (p, i) { return { p: p, i: i }; }).sort(function (a, b) {
          var x = a.p.start || "9999", y = b.p.start || "9999";
          return x < y ? -1 : x > y ? 1 : a.i - b.i;
        }).map(function (o) { return o.p; });
      }
      if (!ps.length) return "";
      return '<div class="group-title" id="' + esc(g.id) + '"><h2>' + esc(g.title) + "</h2></div>" + (g.intro ? '<p class="lead" style="margin:-8px 0 24px">' + md(g.intro) + "</p>" : "") + '<div class="people-grid">' + ps.map(personCard).join("") + "</div>";
    }).join("");
  });
  document.querySelectorAll("[data-render=alumni]").forEach(function (el) {
    var rows = (D.alumni || []).slice().sort(function (a, b) { return String(b.until || "").localeCompare(String(a.until || "")); });
    el.innerHTML = '<div class="table-wrap"><table class="alumni"><thead><tr><th>Name</th><th>Role in the group</th><th class="hide-sm">Years</th><th>Now</th></tr></thead><tbody>' +
      rows.map(function (a) {
        var name = a.url ? '<a href="' + esc(a.url) + '"' + ext(a.url) + ">" + esc(a.name) + "</a>" : esc(a.name);
        return "<tr><td>" + name + "</td><td>" + md(a.role) + '</td><td class="hide-sm">' + esc(a.years || "") + "</td><td>" + md(a.now || "") + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  });

  /* ---------- Theses ---------- */
  document.querySelectorAll("[data-render=theses]").forEach(function (el) {
    el.innerHTML = (D.theses || []).slice().sort(function (a, b) { return b.year - a.year; }).map(function (t) {
      return '<article class="card thesis reveal"><div class="meta">' + esc(t.programme || "MSc thesis") + " · " + esc(t.year) + "</div>" +
        "<h3>" + esc(t.title) + "</h3><p><b>" + esc(t.student) + "</b>" + (t.supervisors ? '<span class="muted"> · supervised by ' + esc(t.supervisors) + "</span>" : "") + "</p>" +
        "<p>" + md(t.summary) + "</p>" + (t.tags ? '<div class="tags">' + t.tags.map(function (x) { return '<span class="tag' + (x === "Netherlands Red Cross" ? " y" : "") + '">' + esc(x) + "</span>"; }).join("") + "</div>" : "") +
        '<div class="links">' + (t.links || []).map(function (l) { return '<a href="' + esc(l[1]) + '"' + ext(l[1]) + ">" + esc(l[0]) + " &rarr;</a>"; }).join("") + "</div></article>";
    }).join("");
  });

  /* ---------- Courses ---------- */
  document.querySelectorAll("[data-render=courses]").forEach(function (el) {
    var level = el.getAttribute("data-level");
    el.innerHTML = (D.courses || []).filter(function (c) { return !level || c.level === level; }).map(function (c) {
      var name = c.link ? '<a href="' + esc(c.link) + '"' + ext(c.link) + ">" + esc(c.name) + "</a>" : esc(c.name);
      return '<article class="card reveal"><div class="tags" style="margin-bottom:10px"><span class="tag y">' + esc(c.level) + "</span>" +
        (c.code ? '<span class="tag">' + esc(c.code) + "</span>" : "") + (c.period ? '<span class="tag">' + esc(c.period) + "</span>" : "") + "</div>" +
        "<h3>" + name + "</h3><p>" + md(c.summary || "") + "</p>" +
        (c.programme ? '<p class="muted" style="font-size:.88rem;margin-bottom:6px">' + esc(c.programme) + "</p>" : "") +
        (c.people ? '<p style="font-size:.9rem;font-weight:600;margin:0">' + esc(c.people.join(", ")) + "</p>" : "") + "</article>";
    }).join("");
  });

  /* ---------- Publications ---------- */
  // Full list lives in js/publications.js (window.RAI_PUBLICATIONS); falls back to D.publications.
  var MEMBER_NAMES = (D.people || []).concat(D.alumni || []).map(function (p) { return p.name; });
  function fold(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").toLowerCase(); }
  // A member matches an author if first and last name agree (so "Tamara C. P. Florijn" matches "Tamara Florijn").
  var MEMBER_KEYS = MEMBER_NAMES.map(function (n) { var w = fold(n).split(/\s+/); return [w[0], w[w.length - 1]]; });
  function isMember(a) {
    var w = fold(a).replace(/-/g, " ").split(/\s+/);
    return MEMBER_KEYS.some(function (k) { return w[0] === k[0] && w[w.length - 1] === k[1].replace(/-/g, " ").split(" ").pop(); });
  }
  function authorHtml(a) { return isMember(a) ? "<b>" + esc(a) + "</b>" : esc(a); }
  var PUB_TYPES = { journal: "Journal articles", conference: "Conference papers", workshop: "Workshop papers", book: "Books", chapter: "Book chapters", other: "Other" };
  document.querySelectorAll("[data-render=publications]").forEach(function (el) {
    var pubs = (window.RAI_PUBLICATIONS || D.publications || []).slice().sort(function (a, b) { return b.year - a.year || String(a.title).localeCompare(String(b.title)); });
    var state = { type: "all", q: "" };
    var bar = document.createElement("div"); bar.className = "filters";
    var types = []; pubs.forEach(function (p) { if (p.type && types.indexOf(p.type) < 0) types.push(p.type); });
    types.sort(function (a, b) { return Object.keys(PUB_TYPES).indexOf(a) - Object.keys(PUB_TYPES).indexOf(b); });
    bar.innerHTML = '<button class="on" data-t="all">All (' + pubs.length + ")</button>" + types.map(function (t) {
      return '<button data-t="' + esc(t) + '">' + esc(PUB_TYPES[t] || t) + " (" + pubs.filter(function (p) { return p.type === t; }).length + ")</button>";
    }).join("") + '<input type="search" placeholder="Search title, author, venue" aria-label="Search publications" style="flex:1;min-width:200px;font:inherit;padding:7px 14px;border-radius:999px;border:1px solid var(--line);background:var(--surface);color:var(--ink)">';
    el.parentNode.insertBefore(bar, el);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      state.type = b.getAttribute("data-t");
      bar.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
      draw();
    });
    bar.querySelector("input").addEventListener("input", function (e) { state.q = fold(e.target.value); draw(); });
    function draw() {
      var list = pubs.filter(function (p) {
        if (state.type !== "all" && p.type !== state.type) return false;
        if (!state.q) return true;
        var au = Array.isArray(p.authors) ? p.authors.join(" ") : p.authors;
        return fold(p.title + " " + au + " " + p.venue).indexOf(state.q) >= 0;
      });
      var years = []; list.forEach(function (p) { if (years.indexOf(p.year) < 0) years.push(p.year); });
      el.innerHTML = years.map(function (y) {
        return '<div class="group-title"><h2>' + y + "</h2></div>" + list.filter(function (p) { return p.year === y; }).map(function (p) {
          var t = p.link ? '<a href="' + esc(p.link) + '"' + ext(p.link) + ">" + esc(p.title) + "</a>" : esc(p.title);
          var au = Array.isArray(p.authors) ? p.authors.map(authorHtml).join(", ") : esc(p.authors);
          return '<div class="pub"><div class="t">' + t + (p.award ? ' <span class="tag y">' + esc(p.award) + "</span>" : "") + '</div><div class="a">' + au + '</div><div class="v">' + esc(p.venue) + "</div></div>";
        }).join("");
      }).join("") || '<p class="muted">No publications match.</p>';
    }
    draw();
  });
  document.querySelectorAll("[data-render=profiles]").forEach(function (el) {
    el.innerHTML = (D.people || []).filter(function (p) { return p.scholar || p.dblp; }).map(function (p) {
      return '<div class="pub"><div class="t">' + esc(p.name) + '</div><div class="a">' +
        [p.scholar ? '<a href="' + esc(p.scholar) + '" target="_blank" rel="noopener">Google Scholar</a>' : "", p.dblp ? '<a href="' + esc(p.dblp) + '" target="_blank" rel="noopener">dblp</a>' : ""].filter(Boolean).join(" · ") + "</div></div>";
    }).join("");
  });

  /* ---------- Counters ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var what = el.getAttribute("data-count"), v = "";
    if (what === "members") v = (D.people || []).length;
    if (what === "phd") v = (D.people || []).filter(function (p) { return p.group !== "associated" && /PhD candidate/.test(p.role || ""); }).length;
    if (what === "alumni") v = (D.alumni || []).length;
    if (what === "theses") v = (D.theses || []).length;
    if (what === "news") v = (D.news || []).length;
    if (what === "courses") v = (D.courses || []).length;
    if (what === "awards") v = (D.news || []).filter(function (n) { return n.type === "award"; }).length;
    el.textContent = v;
  });

  /* ---------- Jump to #anchor after content is rendered ---------- */
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) {
      var jump = function () { target.scrollIntoView({ behavior: "instant", block: "start" }); };
      setTimeout(jump, 50);
      window.addEventListener("load", function () { setTimeout(jump, 50); });
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  } else { els.forEach(function (e) { e.classList.add("in"); }); }
})();
