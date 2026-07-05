/* ==========================================================================
   PlanRelevo JPV — Application Logic
   Prototipo v2.1 · Grupo 11 · Gestión de Personas y Comportamiento Organizacional
   Datos simulados con fines de demostración académica.
   ========================================================================== */

(function () {
  "use strict";

  /* ========================================================================
     Datos simulados
     ======================================================================== */

  var areas = [
    { n: "Forestal Ñuble (Chillán)",    dot: 3,  disp: 2,  casos: 120, peq: true  },
    { n: "Casa Matriz Santiago",        dot: 28, disp: 24, casos: 340, peq: false },
    { n: "Concepción / Biobío",         dot: 8,  disp: 7,  casos: 96,  peq: false },
    { n: "Viña del Mar",                dot: 6,  disp: 5,  casos: 61,  peq: false },
    { n: "Temuco",                      dot: 5,  disp: 4,  casos: 44,  peq: false },
    { n: "Puerto Montt / Austral",      dot: 6,  disp: 5,  casos: 38,  peq: false }
  ];

  var emps = [
    { n: "C. Soto — Ajustador Forestal Senior",    a: 0, bk: "P. Ríos" },
    { n: "P. Ríos — Ajustador Forestal",            a: 0, bk: "C. Soto" },
    { n: "C. Carvajal — Jefe Regional Ñuble",       a: 0, bk: "Jefe Reg. Biobío (interregional)" },
    { n: "R. Salas — Ajustador Marítimo Senior",    a: 1, bk: "D. Pino" },
    { n: "F. Rojas — Analista de Siniestros",       a: 1, bk: "V. Lagos" },
    { n: "L. Aravena — Perito Ingeniero",           a: 3, bk: "G. Castro" }
  ];

  var sols = [
    { e: "V. Lagos",  a: "Casa Matriz Santiago", p: "06–24 abr 2026",  d: 15, r: "F. Rojas",    s: "Aprobada" },
    { e: "G. Castro", a: "Viña del Mar",          p: "11–29 may 2026",  d: 15, r: "L. Aravena",  s: "Aprobada" }
  ];

  var MES  = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  var ALTA = [0, 1, 2, 11];

  var plan = {
    "C. Soto":                [8],
    "P. Ríos":                [4],
    "C. Carvajal":            [5],
    "M. Vega (backup Conc.)": [9]
  };

  /* ========================================================================
     Navegación por tabs
     ======================================================================== */

  var secs = document.querySelectorAll("main section");
  var btns = document.querySelectorAll("nav button");

  window.tab = function (i, b) {
    secs.forEach(function (s) { s.classList.remove("act"); });
    btns.forEach(function (x) { x.classList.remove("act"); });
    secs[i].classList.add("act");
    b.classList.add("act");
  };

  /* ========================================================================
     Panel de control
     ======================================================================== */

  function pintarPanel() {
    var tb = document.querySelector("#tAreas tbody");
    if (!tb) return;
    tb.innerHTML = "";

    var totalDot       = 0;
    var totalDisp      = 0;
    var maxCarga       = 0;
    var maxCpp         = 0;
    var dataCpp        = [];

    areas.forEach(function (a) {
      var cob  = Math.round(a.disp / a.dot * 100);
      var cpp  = Math.round(a.casos / a.disp);

      totalDot  += a.dot;
      totalDisp += a.disp;
      maxCarga   = Math.max(maxCarga, cpp);
      if (cpp > maxCpp) maxCpp = cpp;

      dataCpp.push({
        label: a.n.split("(")[0].trim().split(" ").pop(),
        val:   cpp,
        dot:   a.dot,
        disp:  a.disp
      });

      var estado, clase;

      if (a.peq) {
        estado = a.disp >= 1 ? "Regla nominal OK" : "Sin titular";
        clase  = a.disp >= 1 ? "p-warn"           : "p-bad";
      } else if (cob >= 70) {
        estado = "Cobertura OK";
        clase  = "p-ok";
      } else if (cob >= 60) {
        estado = "En el límite";
        clase  = "p-warn";
      } else {
        estado = "Bajo mínimo";
        clase  = "p-bad";
      }

      if (cpp > 45) {
        estado += " · sobrecarga";
        if (clase === "p-ok") clase = "p-warn";
      }

      var badgeEquipo = a.peq ? ' <span class="pill p-info">equipo 2–3</span>' : "";

      tb.innerHTML +=
        "<tr>" +
          "<td>" + a.n + badgeEquipo + "</td>" +
          "<td>" + a.dot + "</td>" +
          "<td>" + a.disp + "</td>" +
          "<td>" + cob + "%</td>" +
          "<td>" + a.casos + "</td>" +
          "<td><b>" + cpp + "</b></td>" +
          "<td><span class=\"pill " + clase + "\">" + estado + "</span></td>" +
        "</tr>";
    });

    var cobGlobal = Math.round(totalDisp / totalDot * 100) + "%";
    var elCob     = document.getElementById("kCob");
    if (elCob) elCob.textContent = cobGlobal;

    var elCarga = document.getElementById("kCarga");
    if (elCarga) {
      elCarga.textContent = maxCarga;
      elCarga.className   = "k " + (maxCarga > 45 ? "bad" : "ok");
    }

    var elAcum = document.getElementById("kAcum");
    if (elAcum) elAcum.textContent = "3";

    var elCMF = document.getElementById("kCMF");
    if (elCMF) elCMF.textContent = "87%";

    pintarBarras(dataCpp, maxCpp);
  }

  function pintarBarras(data, maxVal) {
    var container = document.getElementById("barChart");
    if (!container) return;

    container.innerHTML = data.map(function (d) {
      var pct  = Math.round(d.val / maxVal * 100);
      var cls  = d.val > 45 ? "high" : "";
      var h    = Math.max(pct, 8);
      var title = d.label + ": " + d.val + " casos/ajustador (" + d.disp + "/" + d.dot + " disponibles)";
      return "<div class=\"bar " + cls + "\" style=\"height:" + h + "%\" title=\"" + title + "\"><span>" + d.label + "</span></div>";
    }).join("");
  }

  /* ========================================================================
     Calendario anual
     ======================================================================== */

  function pintarCalendario() {
    var c = document.getElementById("cal");
    if (!c) return;

    var html = "<div class=\"hd nm\">Colaborador</div>";
    html += MES.map(function (m, i) {
      return "<div class=\"hd " + (ALTA.indexOf(i) !== -1 ? "alta" : "") + "\">" + m + "</div>";
    }).join("");

    Object.keys(plan).forEach(function (p) {
      html += "<div class=\"nm\">" + p + "</div>";
      html += MES.map(function (m, i) {
        var vac = plan[p].indexOf(i) !== -1;
        var clsAlta = (ALTA.indexOf(i) !== -1) ? "alta" : "";
        var clsVac  = vac ? "vac" : "";
        return "<div class=\"" + clsVac + " " + clsAlta + "\">" + (vac ? "✈" : "") + "</div>";
      }).join("");
    });

    c.innerHTML = html;
  }

  /* ========================================================================
     Solicitud de vacaciones
     ======================================================================== */

  var selEmp = document.getElementById("sEmp");
  if (selEmp) {
    emps.forEach(function (e, i) {
      var opt = document.createElement("option");
      opt.value = i;
      opt.textContent = e.n;
      selEmp.appendChild(opt);
    });
  }

  var pendiente = null;

  function diasHabiles(inicio, fin) {
    var d   = 0;
    var cur = new Date(inicio);
    var end = new Date(fin);
    while (cur <= end) {
      var w = cur.getDay();
      if (w !== 0 && w !== 6) d++;
      cur.setDate(cur.getDate() + 1);
    }
    return d;
  }

  window.evaluar = function () {
    var idx   = parseInt(selEmp.value, 10);
    var e     = emps[idx];
    var a     = areas[e.a];
    var ini   = document.getElementById("sIni").value;
    var fin   = document.getElementById("sFin").value;
    var alert = document.getElementById("sAlert");
    var btnOk = document.getElementById("sConf");

    alert.style.display  = "block";
    btnOk.style.display   = "none";
    pendiente             = null;

    if (!ini || !fin || fin < ini) {
      alert.className = "alert a-bad";
      alert.innerHTML = "\u26A0\uFE0F Revise las fechas: el t\u00e9rmino debe ser posterior al inicio.";
      return;
    }

    var mesIni  = new Date(ini).getMonth();
    var mesFin  = new Date(fin).getMonth();
    var alta    = ALTA.indexOf(mesIni) !== -1 || ALTA.indexOf(mesFin) !== -1;
    var dias    = diasHabiles(ini, fin);
    var dispSim = a.disp - 1;
    var cobSim  = Math.round(dispSim / a.dot * 100);
    var minCob  = alta ? 70 : 60;

    var msg = "<b>" + e.n.split(" — ")[0] + "</b> · " + a.n + " · " + dias + " d\u00edas h\u00e1biles solicitados.<br>";

    if (dias > 15) {
      msg += "\u2139\uFE0F Solicitud supera el feriado legal anual de 15 d\u00edas h\u00e1biles (art. 67 CT): requiere validaci\u00f3n de RR.HH. por d\u00edas acumulados o progresivos.<br>";
    }

    if (a.peq) {
      var okNominal = dispSim >= 1;
      if (alta) {
        alert.className = "alert a-warn";
        msg += "\uD83D\uDD36 <b>Periodo dentro de temporada alta de incendios.</b> Regla nominal: debe permanecer al menos un titular. ";
        msg += okNominal ? "Se cumple, pero se recomienda reprogramar fuera de dic\u2013mar." : "NO se cumple: el \u00e1rea quedar\u00eda sin titular.";
        msg += "<br>";
      } else if (okNominal) {
        alert.className = "alert a-ok";
        msg += "\u2705 Regla nominal cumplida: permanece al menos un titular en el \u00e1rea.<br>";
      } else {
        alert.className = "alert a-bad";
        msg += "\u26D4 El \u00e1rea quedar\u00eda sin titular. Debe activarse el backup interregional antes de aprobar.<br>";
      }
    } else {
      if (cobSim >= minCob) {
        alert.className = "alert a-ok";
        msg += "\u2705 Cobertura del \u00e1rea tras la ausencia: <b>" + cobSim + "%</b> (m\u00ednimo " + minCob + "% en " + (alta ? "temporada alta" : "temporada normal") + ").<br>";
      } else {
        alert.className = "alert a-bad";
        msg += "\u26D4 Cobertura caer\u00eda a <b>" + cobSim + "%</b>, bajo el m\u00ednimo de " + minCob + "%. Sugerencia: reprogramar o activar backup suplente.<br>";
      }
    }

    msg += "\uD83D\uDD01 Reemplazo propuesto seg\u00fan matriz: <b>" + e.bk + "</b>. Checklist de traspaso obligatorio antes del inicio. Bono de reemplazo normado seg\u00fan protocolo.";
    alert.innerHTML = msg;

    if (alert.className.indexOf("a-bad") === -1) {
      btnOk.style.display = "inline-flex";
      pendiente = { e: e, a: a, ini: ini, fin: fin, dias: dias };
    }
  };

  window.confirmar = function () {
    if (!pendiente) return;

    var fmt = function (d) {
      return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
    };

    sols.unshift({
      e: pendiente.e.n.split(" — ")[0],
      a: pendiente.a.n,
      p: fmt(pendiente.ini) + " \u2013 " + fmt(pendiente.fin),
      d: pendiente.dias,
      r: pendiente.e.bk,
      s: "Enviada a jefatura"
    });

    pintarSolicitudes();

    var alert = document.getElementById("sAlert");
    alert.className = "alert a-ok";
    alert.innerHTML = "\uD83D\uDCE8 Solicitud enviada. La jefatura ver\u00e1 el impacto en cobertura antes de aprobar y el reemplazo propuesto recibir\u00e1 notificaci\u00f3n.";

    var btnOk = document.getElementById("sConf");
    btnOk.style.display = "none";
  };

  function pintarSolicitudes() {
    var tb = document.querySelector("#tSol tbody");
    if (!tb) return;

    tb.innerHTML = sols.map(function (s) {
      var clase = s.s === "Aprobada" ? "p-ok" : "p-info";
      return "<tr><td>" + s.e + "</td><td>" + s.a + "</td><td>" + s.p + "</td><td>" + s.d + "</td><td>" + s.r + "</td><td><span class=\"pill " + clase + "\">" + s.s + "</span></td></tr>";
    }).join("");
  }

  /* ========================================================================
     Checklist de traspaso (progress bars)
     ======================================================================== */

  window.prog = function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll(".box")).filter(function (b) {
      return b.querySelector(".chk");
    });

    boxes.forEach(function (b, i) {
      var inputs = Array.prototype.slice.call(b.querySelectorAll("input[type=\"checkbox\"]"));
      var done   = inputs.filter(function (x) { return x.checked; }).length;
      var pct    = Math.round(done / inputs.length * 100);
      var bar    = document.getElementById("prog" + (i + 1));
      if (bar) bar.style.width = pct + "%";
    });
  };

  /* ========================================================================
     Inicialización
     ======================================================================== */

  pintarPanel();
  pintarCalendario();
  pintarSolicitudes();

})();
