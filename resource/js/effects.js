(() => {
  // === ページ全体フェード ===
  window.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    if (root.classList.contains('page-preload')) {
      requestAnimationFrame(() => {
        root.classList.add('page-ready');
        setTimeout(() => root.classList.remove('page-preload'), 300);
      });
    }
  });

  // === ユーティリティ ===
  const SELECTORS = '.fade-up, .fade-left, .fade-right, .fade-in';
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // data-* を style に反映（個別要素用）
  const applyElementOptions = (el) => {
    const dur = el.getAttribute('data-fade-duration'); // 例: ".8s" / "800ms"
    const ease = el.getAttribute('data-fade-ease');     // 例: "ease-out" / cubic-bezier(...)
    const delay = el.getAttribute('data-fade-delay');   // 例: "120ms" / ".12s"

    if (dur)  el.style.setProperty('--_fade-duration', dur);
    if (ease) el.style.setProperty('--_fade-ease', ease);
    if (delay) el.style.transitionDelay = delay;
  };

  // グループに自動でディレイを振る（スタッガー）
  // 使い方:
  // <ul data-stagger data-stagger-interval="120ms" data-stagger-base="0ms">
  //   <li class="fade-up">…</li>
  //   <li class="fade-up">…</li>
  //   <li class="fade-up">…</li>
  // </ul>
  // ※ interval のデフォルトは "100ms"、base は "0ms"
  // const applyStagger = (container) => {
  //   const interval = container.getAttribute('data-stagger-interval') || '100ms';
  //   const base     = container.getAttribute('data-stagger-base') || '0ms';
  //   // 対象はコンテナ内のフェード系すべて（順番はDOM順）
  //   const targets = container.querySelectorAll(SELECTORS);

  //   // 既に個別 delay 指定がある要素は「尊重」したい場合はスキップしても良いけど、
  //   // 今回は group > individual を優先（グループ指定で上書き）にする
  //   targets.forEach((el, i) => {
  //     el.style.transitionDelay = `calc(${base} + ${i} * ${interval})`;
  //   });
  // };
  const applyStagger = (container) => {
  const interval = container.getAttribute('data-stagger-interval') || '100ms';
  const base     = container.getAttribute('data-stagger-base') || '0ms';
  const targets  = container.querySelectorAll(SELECTORS);

  targets.forEach((el, i) => {
    // 1) スキップ指定なら触らない
    if (el.getAttribute('data-stagger-skip') === 'true') return;

    // 2) 子が絶対値指定してたらそれを優先
    const absDelay = el.getAttribute('data-fade-delay-abs');
    if (absDelay) {
      el.style.transitionDelay = absDelay;
      return;
    }

    // 3) まずはスタッガーの基本ディレイ
    const computed = `calc(${base} + ${i} * ${interval})`;

    // 4) オフセット上乗せ（任意）
    const offset = el.getAttribute('data-stagger-offset');
    el.style.transitionDelay = offset ? `calc(${computed} + ${offset})` : computed;
  });
};


  // ページ内の全スタッガーコンテナに適用
  const initStaggers = () => {
    const containers = document.querySelectorAll('[data-stagger]');
    containers.forEach(applyStagger);
  };

  // === スクロールフェード（IO） ===
  const initObserver = () => {
    if (prefersReduce) return;

    const els = document.querySelectorAll(SELECTORS);
    if (!els.length) return;

    // 個別オプションを先に適用（duration/ease/delay）
    els.forEach(applyElementOptions);
    // スタッガーはコンテナ基準で後から一括上書き
    initStaggers();

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('is-inview');
        } else if (el.dataset.fadeRepeat === "true") {
          el.classList.remove('is-inview');
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });

    els.forEach(el => io.observe(el));
  };

  // kick
  if (!prefersReduce) {
    // DOM が ready 後に初期化（SSRや遅延挿入でも安全）
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initObserver, { once: true });
    } else {
      initObserver();
    }
  }
})();
