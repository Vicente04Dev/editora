/* =========================================================
   KILUNJI EDITORA — scripts do site
   ========================================================= */
(function () {
  'use strict';

  var WHATSAPP = '244923579737';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function normalize(s) {
    return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Ano no rodapé ---------- */
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* ---------- Sombra do cabeçalho ao fazer scroll ---------- */
    var header = $('.site-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ---------- Menu móvel ---------- */
    var burger = $('#burgerBtn');
    var links = $('#navLinks');

    function setMenu(open) {
      if (!burger || !links) return;
      links.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      var icon = burger.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-xmark', open);
      }
    }

    if (burger && links) {
      burger.addEventListener('click', function () {
        setMenu(!links.classList.contains('open'));
      });
      $$('a', links).forEach(function (a) {
        a.addEventListener('click', function () { setMenu(false); });
      });
    }

    /* ---------- Submenus (desktop) ---------- */
    var subs = $$('.has-sub');
    function closeSubs(except) {
      subs.forEach(function (li) {
        if (li === except) return;
        li.classList.remove('open');
        var b = li.querySelector('.sub-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
    subs.forEach(function (li) {
      var btn = li.querySelector('.sub-toggle');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !li.classList.contains('open');
        closeSubs(li);
        li.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      li.addEventListener('focusout', function (e) {
        if (!li.contains(e.relatedTarget)) {
          li.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    });
    document.addEventListener('click', function () { closeSubs(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var openSub = $('.has-sub.open');
        closeSubs();
        if (openSub) { var t = openSub.querySelector('.sub-toggle'); if (t) t.focus(); }
        if (links && links.classList.contains('open')) { setMenu(false); burger.focus(); }
      }
    });

    /* ---------- Formulários: ficheiro ou link ---------- */
    $$('[data-method-group]').forEach(function (group) {
      var radios = $$('input[type="radio"]', group.querySelector('.method-toggle'));
      var panels = $$('[data-method-panel]', group);

      function update() {
        var checked = radios.filter(function (r) { return r.checked; })[0];
        var value = checked ? checked.value : null;
        panels.forEach(function (p) {
          var active = p.getAttribute('data-method-panel') === value;
          p.classList.toggle('visible', active);
          $$('input', p).forEach(function (inp) {
            if (inp.hasAttribute('data-required-when-active')) inp.required = active;
            if (!active && inp.type === 'file') {
              inp.value = '';
              var nameEl = p.querySelector('.file-name');
              if (nameEl) nameEl.textContent = '';
            }
            if (!active && inp.type === 'url') inp.value = '';
          });
        });
        radios.forEach(function (r) {
          var opt = r.closest('.method-option');
          if (opt) opt.classList.toggle('checked', r.checked);
        });
      }
      radios.forEach(function (r) { r.addEventListener('change', update); });
      update();
    });

    /* ---------- Área de ficheiro (clique, arrastar e validação de tamanho) ---------- */
    $$('.file-drop').forEach(function (drop) {
      var input = drop.querySelector('input[type="file"]');
      var nameEl = drop.parentNode.querySelector('.file-name');
      var maxMb = parseFloat(drop.getAttribute('data-max-mb') || '0');
      if (!input) return;

      function showName() {
        if (!nameEl) return;
        nameEl.classList.remove('error');
        if (input.files && input.files.length) {
          var f = input.files[0];
          var mb = f.size / (1024 * 1024);
          if (maxMb && mb > maxMb) {
            nameEl.textContent = 'O ficheiro tem ' + mb.toFixed(1) + ' MB e excede o limite de ' + maxMb + ' MB. Use a opção "Enviar link".';
            nameEl.classList.add('error');
            input.value = '';
            return;
          }
          nameEl.textContent = 'Ficheiro seleccionado: ' + f.name + ' (' + mb.toFixed(1) + ' MB)';
        } else {
          nameEl.textContent = '';
        }
      }

      drop.setAttribute('tabindex', '0');
      drop.setAttribute('role', 'button');
      drop.addEventListener('click', function (e) { if (e.target !== input) input.click(); });
      drop.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
      });
      drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('dragover'); });
      drop.addEventListener('dragleave', function () { drop.classList.remove('dragover'); });
      drop.addEventListener('drop', function (e) {
        e.preventDefault();
        drop.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files.length) {
          input.files = e.dataTransfer.files;
          showName();
        }
      });
      input.addEventListener('change', showName);
    });

    /* ---------- Formulários: página de agradecimento + estado de envio ---------- */
    $$('form[data-next]').forEach(function (form) {
      var next = form.querySelector('input[name="_next"]');
      if (next && /^https?:/.test(window.location.protocol)) {
        next.value = new URL(form.getAttribute('data-next'), window.location.href).href;
      }
      form.addEventListener('submit', function () {
        var btn = form.querySelector('[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.setAttribute('data-label', btn.innerHTML);
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A enviar…';
        }
      });
    });
    // Se o utilizador voltar atrás no browser, reactivar os botões
    window.addEventListener('pageshow', function () {
      $$('[type="submit"][data-label]').forEach(function (btn) {
        btn.disabled = false;
        btn.innerHTML = btn.getAttribute('data-label');
      });
    });

    /* ---------- Pré-seleccionar assunto (contacto.html?assunto=...) ---------- */
    var params = new URLSearchParams(window.location.search);
    var assuntoSel = $('#assunto');
    if (assuntoSel && params.get('assunto')) {
      var wanted = params.get('assunto');
      $$('option', assuntoSel).forEach(function (o) {
        if (o.getAttribute('data-key') === wanted) assuntoSel.value = o.value;
      });
    }

    /* ---------- Página de agradecimento: mensagem conforme o formulário ---------- */
    var thanks = $('[data-thanks]');
    if (thanks) {
      var tipo = params.get('tipo');
      var block = tipo ? $('[data-thanks-type="' + tipo + '"]') : null;
      if (block) {
        $$('[data-thanks-type]').forEach(function (b) { b.hidden = b !== block; });
      }
    }

    /* ---------- Reservar / comprar por WhatsApp ---------- */
    $$('[data-reserve]').forEach(function (a) {
      var title = a.getAttribute('data-reserve');
      a.href = waLink('Olá, Kilunji! Gostaria de comprar/reservar o livro "' + title + '". Podem indicar-me a disponibilidade e o ponto de venda mais próximo?');
      a.target = '_blank';
      a.rel = 'noopener';
    });
    $$('[data-wa-text]').forEach(function (a) {
      a.href = waLink(a.getAttribute('data-wa-text'));
      a.target = '_blank';
      a.rel = 'noopener';
    });

    /* ---------- Catálogo: pesquisa e filtros ---------- */
    var catalog = $('[data-catalog]');
    if (catalog) {
      var items = $$('[data-cat]', catalog);
      var search = $('#catalogSearch');
      var chips = $$('.chip[data-filter]');
      var countEl = $('#resultCount');
      var empty = $('#catalogEmpty');
      var current = 'todos';

      function apply() {
        var q = normalize(search ? search.value.trim() : '');
        var visible = 0;
        items.forEach(function (it) {
          var okCat = current === 'todos' || (it.getAttribute('data-cat') || '').split(' ').indexOf(current) !== -1;
          var okQ = !q || normalize(it.textContent).indexOf(q) !== -1;
          var show = okCat && okQ;
          it.hidden = !show;
          if (show) visible++;
        });
        if (countEl) countEl.textContent = visible === 1 ? '1 título encontrado' : visible + ' títulos encontrados';
        if (empty) empty.hidden = visible !== 0;
      }

      chips.forEach(function (c) {
        c.addEventListener('click', function () {
          current = c.getAttribute('data-filter');
          chips.forEach(function (o) { o.setAttribute('aria-pressed', o === c ? 'true' : 'false'); });
          apply();
        });
      });
      if (search) {
        if (params.get('q')) search.value = params.get('q');
        search.addEventListener('input', apply);
      }
      var resetBtn = $('#catalogReset');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          if (search) search.value = '';
          current = 'todos';
          chips.forEach(function (o) { o.setAttribute('aria-pressed', o.getAttribute('data-filter') === 'todos' ? 'true' : 'false'); });
          apply();
        });
      }
      apply();
    }

    /* ---------- Programa O Livro: estado da emissão (quartas, 15h–16h, hora de Luanda) ---------- */
    var LUANDA_OFFSET = 1; // WAT, UTC+1, sem horário de verão
    var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    function nextBroadcast(now) {
      // devolve {live:boolean, startUtc:Date}
      var l = new Date(now.getTime() + LUANDA_OFFSET * 3600e3); // relógio de Luanda em campos UTC
      var day = l.getUTCDay();
      var minutes = l.getUTCHours() * 60 + l.getUTCMinutes();
      var live = day === 3 && minutes >= 15 * 60 && minutes < 16 * 60;
      var add = (3 - day + 7) % 7;
      if (add === 0 && minutes >= 15 * 60) add = live ? 0 : 7;
      var start = new Date(Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), l.getUTCDate() + add, 15 - LUANDA_OFFSET, 0, 0));
      return { live: live, startUtc: start };
    }

    function renderRadio() {
      var now = new Date();
      var nb = nextBroadcast(now);
      $$('[data-radio-status]').forEach(function (el) {
        if (nb.live) {
          el.innerHTML = '<span class="live-badge">No ar agora</span> &nbsp;Sintonize já a <b>Rádio Essencial 96.1 FM</b>.';
          return;
        }
        var l = new Date(nb.startUtc.getTime() + LUANDA_OFFSET * 3600e3);
        var diff = nb.startUtc.getTime() - now.getTime();
        var d = Math.floor(diff / 86400e3);
        var h = Math.floor((diff % 86400e3) / 3600e3);
        var m = Math.floor((diff % 3600e3) / 60e3);
        var falta;
        if (d > 0) falta = d + (d === 1 ? ' dia' : ' dias') + (h ? ' e ' + h + ' h' : '');
        else if (h > 0) falta = h + ' h e ' + m + ' min';
        else falta = m + ' min';
        var quando = (d === 0 && l.getUTCDay() === new Date(now.getTime() + LUANDA_OFFSET * 3600e3).getUTCDay()) ? 'hoje' : DIAS[l.getUTCDay()] + ', ' + l.getUTCDate() + ' de ' + MESES[l.getUTCMonth()];
        el.innerHTML = 'Próxima emissão: <b>' + quando + ', às 15h00</b> (faltam ' + falta + ').';
      });
    }
    if ($('[data-radio-status]')) {
      renderRadio();
      setInterval(renderRadio, 60e3);
    }

    /* ---------- Adicionar o programa ao calendário (.ics) ---------- */
    function icsDate(d) {
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }
    $$('[data-ics]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var nb = nextBroadcast(new Date());
        var start = nb.startUtc;
        var end = new Date(start.getTime() + 3600e3);
        var ics = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Kilunji Editora//Programa O Livro//PT',
          'CALSCALE:GREGORIAN',
          'BEGIN:VEVENT',
          'UID:programa-o-livro-' + icsDate(start) + '@kilunji',
          'DTSTAMP:' + icsDate(new Date()),
          'DTSTART:' + icsDate(start),
          'DTEND:' + icsDate(end),
          'RRULE:FREQ=WEEKLY;BYDAY=WE',
          'SUMMARY:Programa O Livro — Rádio Essencial 96.1 FM',
          'DESCRIPTION:O programa de rádio da Kilunji Editora dedicado ao universo da leitura. Todas as quartas-feiras\\, das 15h00 às 16h00.',
          'LOCATION:Rádio Essencial 96.1 FM',
          'BEGIN:VALARM',
          'TRIGGER:-PT15M',
          'ACTION:DISPLAY',
          'DESCRIPTION:O Livro começa daqui a 15 minutos na Rádio Essencial 96.1 FM',
          'END:VALARM',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');
        var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'programa-o-livro.ics';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
      });
    });
  });
})();
