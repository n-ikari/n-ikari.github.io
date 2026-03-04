(() => {
  const header = document.querySelector('.header'); // ← .nav → .header
  if (!header) return;

  const btn = header.querySelector('.nav__toggle');
  const menu = header.querySelector('#navMenu');
  const overlay = header.querySelector('.nav__overlay');
  const submenuButtons = header.querySelectorAll('.nav__submenu-toggle');

  function openMenu() {
    header.classList.add('is-open');        // ← 状態は .header に付与
    btn?.setAttribute('aria-expanded', 'true');
    if (overlay) overlay.hidden = false;
    document.documentElement.style.overflow = 'hidden';
  }
  function closeMenu() {
    header.classList.remove('is-open');
    btn?.setAttribute('aria-expanded', 'false');
    if (overlay) overlay.hidden = true;
    document.documentElement.style.overflow = '';
  }

  // ハンバーガー基本操作
  btn?.addEventListener('click', () => {
    header.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  overlay?.addEventListener('click', closeMenu);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) closeMenu();
  });

  // サブメニュー
  submenuButtons.forEach((b) => {
    b.addEventListener('click', () => {
      const expanded = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!expanded));
      const list = b.nextElementSibling;
      if (!list) return;
      list.style.display = expanded ? 'none' : 'block';
    });
  });

  // PC幅に戻ったらリセット
  const mqlDesktop = window.matchMedia('(min-width: 769px)');
  mqlDesktop.addEventListener('change', (e) => {
    if (e.matches) {
      closeMenu();
      header.querySelectorAll('.nav__submenu').forEach((el) => (el.style.display = ''));
      header.querySelectorAll('.nav__submenu-toggle').forEach((el) => el.setAttribute('aria-expanded', 'false'));
    }
  });

  // モバイルに切り替わる瞬間 → no-anim を一瞬だけ付ける
  const mqlMobile = window.matchMedia('(max-width: 768px)');
  mqlMobile.addEventListener('change', (e) => {
    if (e.matches) {
      header.classList.add('no-anim');      // ← 状態は .header に付与
      requestAnimationFrame(() => {
        requestAnimationFrame(() => header.classList.remove('no-anim'));
      });
    }
  });

  // ===== アンカーリンク：スムーススクロール & メニュー自動クローズ =====
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute('href');
    // "#" 単体は無視
    if (!href || href === '#' || href === '#0') return;

    // 同一ページ内のみ
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;

    const id = decodeURIComponent(url.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    // 固定ヘッダーの高さぶんオフセット（可変でも実測OK）
    const headerHeight = header.offsetHeight || 0;
    const y = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - headerHeight);

    // ユーザーの低速設定を尊重してスムース or 即時
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });

    // メニュー開いてたら閉じる
    if (header.classList.contains('is-open')) {
      closeMenu();
    }

    // 履歴に残したいなら pushState、残したくないなら replaceState
    history.pushState(null, '', `#${id}`);

    // A11y: フォーカス移動（スクロールは起こさない）
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    setTimeout(() => target.removeAttribute('tabindex'), 1000);
  });
})();
