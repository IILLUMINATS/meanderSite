(function () {
	'use strict';

	function log() {
		try { console.log('[MeanderSite]', ...arguments); } catch (_) {}
	}

	document.addEventListener('DOMContentLoaded', function () {
		log('init');
		var burgerBtn = document.getElementById('burgerBtn');
		var navMenu = document.getElementById('navMenu');
		var copyBtn = document.getElementById('copyLinkBtn');
		var toggleGalleryBtn = document.getElementById('toggleGalleryBtn');
		var galleryContainer = document.getElementById('galleryContainer');

		if (burgerBtn && navMenu) {
			burgerBtn.addEventListener('click', function () {
				var expanded = burgerBtn.getAttribute('aria-expanded') === 'true';
				burgerBtn.setAttribute('aria-expanded', String(!expanded));
				navMenu.classList.toggle('is-open');
				log('burger:toggle', !expanded);
			});
		}

		// Плавный скролл по внутренним якорям
		document.querySelectorAll('a[href^="#"]').forEach(function (link) {
			link.addEventListener('click', function (e) {
				var targetId = link.getAttribute('href');
				if (targetId && targetId.length > 1) {
					var el = document.querySelector(targetId);
					if (el) {
						e.preventDefault();
						el.scrollIntoView({ behavior: 'smooth', block: 'start' });
						log('scroll', targetId);
					}
				}
			});
		});

		// Копирование ссылки
		if (copyBtn) {
			copyBtn.addEventListener('click', function () {
				var value = copyBtn.getAttribute('data-clipboard') || '';
				if (!value) return;
				navigator.clipboard && navigator.clipboard.writeText(value)
					.then(function () { toast('Ссылка скопирована'); log('copy:success', value); })
					.catch(function () {
						fallbackCopyTextToClipboard(value);
						toast('Ссылка скопирована');
						log('copy:fallback', value);
					});
			});
		}

		// Тоггл галереи
		if (toggleGalleryBtn && galleryContainer) {
			toggleGalleryBtn.addEventListener('click', function () {
				var expanded = toggleGalleryBtn.getAttribute('aria-expanded') === 'true';
				toggleGalleryBtn.setAttribute('aria-expanded', String(!expanded));
				galleryContainer.classList.toggle('media-grid--expanded');
				if (!expanded) {
					toggleGalleryBtn.textContent = 'Свернуть';
					log('gallery:expanded');
				} else {
					toggleGalleryBtn.textContent = 'Показать все';
					log('gallery:collapsed');
				}
			});
		}

		// Лайтбокс
		initLightbox();

		// Лёгкий трекинг нажатий по ссылкам
		document.querySelectorAll('[data-analytics]').forEach(function (el) {
			el.addEventListener('click', function () {
				log('analytics', el.getAttribute('data-analytics'));
			});
		});

		function fallbackCopyTextToClipboard(text) {
			var textArea = document.createElement('textarea');
			textArea.value = text;
			textArea.style.position = 'fixed';
			textArea.style.top = '-1000px';
			textArea.style.left = '-1000px';
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try { document.execCommand('copy'); } catch (_) {}
			document.body.removeChild(textArea);
		}

		function toast(message) {
			var el = document.createElement('div');
			el.textContent = message;
			el.style.position = 'fixed';
			el.style.bottom = '20px';
			el.style.left = '50%';
			el.style.transform = 'translateX(-50%)';
			el.style.padding = '10px 14px';
			el.style.borderRadius = '10px';
			el.style.background = '#151a1f';
			el.style.border = '1px solid #1f262c';
			el.style.color = '#e7ecef';
			el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
			document.body.appendChild(el);
			setTimeout(function () { el.remove(); }, 1600);
		}

		function initLightbox() {
			var lightbox = document.getElementById('lightbox');
			var backdrop = document.getElementById('lightboxBackdrop');
			var closeBtn = document.getElementById('lightboxClose');
			var prevBtn = document.getElementById('lightboxPrev');
			var nextBtn = document.getElementById('lightboxNext');
			var img = document.getElementById('lightboxImg');
			var caption = document.getElementById('lightboxCaption');
			var items = Array.prototype.slice.call(document.querySelectorAll('#galleryContainer .media-img'));
			var idx = 0;
			var touchStartX = 0;
			var touchEndX = 0;

			if (!items.length || !lightbox) return;
			items.forEach(function (el, i) {
				el.style.cursor = 'zoom-in';
				el.addEventListener('click', function () { open(i); });
			});

			function open(startIndex) {
				idx = startIndex;
				update();
				lightbox.classList.add('is-open');
				lightbox.setAttribute('aria-hidden', 'false');
				document.body.style.overflow = 'hidden';
				log('lightbox:open', idx);
			}
			function close() {
				lightbox.classList.remove('is-open');
				lightbox.setAttribute('aria-hidden', 'true');
				document.body.style.overflow = '';
				log('lightbox:close');
			}
			function prev() { idx = (idx - 1 + items.length) % items.length; update(); log('lightbox:prev', idx); }
			function next() { idx = (idx + 1) % items.length; update(); log('lightbox:next', idx); }
			function update() {
				var el = items[idx];
				img.src = el.getAttribute('src');
				img.alt = el.getAttribute('alt') || 'Скриншот';
				caption.textContent = el.getAttribute('alt') || '';
			}

			// Buttons / backdrop
			backdrop && backdrop.addEventListener('click', close);
			closeBtn && closeBtn.addEventListener('click', close);
			prevBtn && prevBtn.addEventListener('click', prev);
			nextBtn && nextBtn.addEventListener('click', next);

			// Keys
			document.addEventListener('keydown', function (e) {
				if (!lightbox.classList.contains('is-open')) return;
				if (e.key === 'Escape') close();
				else if (e.key === 'ArrowLeft') prev();
				else if (e.key === 'ArrowRight') next();
			});

			// Touch
			lightbox.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; });
			lightbox.addEventListener('touchend', function (e) {
				touchEndX = e.changedTouches[0].screenX;
				if (Math.abs(touchEndX - touchStartX) < 40) return;
				if (touchEndX < touchStartX) next(); else prev();
			});
		}
	});
})();
