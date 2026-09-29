document.addEventListener('DOMContentLoaded', function () {
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var burger = document.getElementById('burgerBtn');
  var links = document.getElementById('navLinks');

  if (burger && links) {
    burger.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      var icon = burger.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !isOpen);
        icon.classList.toggle('fa-xmark', isOpen);
      }
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        var icon = burger.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  /* ---- Formulário "Submeter livro": alternar entre ficheiro e link ---- */
  var methodRadios = document.querySelectorAll('input[name="metodo_envio"]');
  if (methodRadios.length) {
    var panelFile = document.getElementById('panel-ficheiro');
    var panelLink = document.getElementById('panel-link');
    var inputFile = document.getElementById('livro_ficheiro');
    var inputLink = document.getElementById('livro_link');
    var options = document.querySelectorAll('.method-option');

    function updateMethod() {
      var selected = document.querySelector('input[name="metodo_envio"]:checked').value;
      var isFile = selected === 'ficheiro';

      panelFile.classList.toggle('visible', isFile);
      panelLink.classList.toggle('visible', !isFile);

      if (inputFile) inputFile.required = isFile;
      if (inputLink) inputLink.required = !isFile;

      options.forEach(function (opt) {
        var radio = opt.querySelector('input[type="radio"]');
        opt.classList.toggle('checked', radio.checked);
      });
    }

    methodRadios.forEach(function (radio) {
      radio.addEventListener('change', updateMethod);
    });
    updateMethod();
  }

  /* ---- Mostrar nome do ficheiro seleccionado ---- */
  var fileInput = document.getElementById('livro_ficheiro');
  var fileNameEl = document.getElementById('fileName');
  if (fileInput && fileNameEl) {
    fileInput.addEventListener('change', function () {
      if (fileInput.files && fileInput.files.length > 0) {
        fileNameEl.textContent = 'Ficheiro seleccionado: ' + fileInput.files[0].name;
      } else {
        fileNameEl.textContent = '';
      }
    });
  }

  /* ---- Clique na área de drop abre o selector de ficheiro ---- */
  var fileDrop = document.getElementById('fileDrop');
  if (fileDrop && fileInput) {
    fileDrop.addEventListener('click', function () {
      fileInput.click();
    });
  }
});
