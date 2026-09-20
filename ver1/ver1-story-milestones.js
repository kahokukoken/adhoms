(() => {
  if (!window.ADHOMS_LIGHT_STATE || typeof window.nextMonth !== 'function') return;

  const STATE_KEY = 'adhoms.ver1.lightstate';
  const FINAL_KEY = 'adhoms.ver1.finalsession';
  const DIRECTIVES = {
    1: '観測精度と行動成立は別問題。ADHOMSは状態だけでなく、情報が誰にどう受け取られ、行動へ変換されるかを扱う。',
    2: '一つの改善が別の場所へ負担を移すことがある。施策の直接効果だけでなく、反作用・負担転嫁・二次影響まで追跡する。',
    3: '現在状態だけではなく、過去の施策・Relation・Memoryの蓄積が、次に取り得る選択肢そのものを変える。履歴と経路依存をモデルへ明示的に組み込む。'
  };

  function save() {
    localStorage.setItem(STATE_KEY, JSON.stringify(window.ADHOMS_LIGHT_STATE));
  }

  function overlay() {
    return document.getElementById('ver1Choice');
  }

  function isOpen(node) {
    return !!node?.classList.contains('on');
  }

  function directiveSeen(number) {
    return !!window.ADHOMS_LIGHT_STATE.flags?.[`directive:${number}:seen`];
  }

  function directiveAcknowledged(number) {
    return !!window.ADHOMS_LIGHT_STATE.flags?.[`directive:${number}:ack`];
  }

  function pendingDirective() {
    for (const number of [1, 2, 3, 4]) {
      if (directiveSeen(number) && !directiveAcknowledged(number)) return number;
    }
    return null;
  }

  function showDirective(number) {
    if (!DIRECTIVES[number] || directiveAcknowledged(number)) return false;
    const host = overlay();
    if (!host || (isOpen(host) && !host.querySelector('[data-directive-number]'))) return false;

    window.ADHOMS_LIGHT_STATE.flags[`directive:${number}:seen`] = true;
    save();
    host.innerHTML = '<div class="ver1ChoiceCard" data-directive-number="' + number + '">' +
      '<div class="ver1Kicker">研究リビジョン / 木曽指令 第' + number + '号</div>' +
      '<h2>木曽指令 第' + number + '号</h2>' +
      '<p>' + DIRECTIVES[number] + '</p>' +
      '<p>これは発令文言そのものではなく、実証から確定した研究原則です。</p>' +
      '<div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1directive">研究原則として記録</button></div>' +
      '</div>';
    host.classList.add('on');
    host.querySelector('#v1directive').onclick = () => {
      window.ADHOMS_LIGHT_STATE.flags[`directive:${number}:ack`] = true;
      save();
      host.classList.remove('on');
      queueMicrotask(tryResumePending);
    };
    return true;
  }

  function renderEpilogue(host) {
    host.innerHTML = '<div class="ver1ChoiceCard">' +
      '<div class="ver1Kicker">EPILOGUE</div>' +
      '<h2>T-0WA：アップデート条件の達成を確認しました。</h2>' +
      '<p>ADHOMSによる継続観測が可能です。</p>' +
      '<p>行政上の成功と、個人の生活に残った損失。その違和感は次の研究課題として残る。</p>' +
      '<div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1epclose">FEEDへ戻る</button></div>' +
      '</div>';
    host.classList.add('on');
    host.querySelector('#v1epclose').onclick = () => {
      localStorage.removeItem(FINAL_KEY);
      host.classList.remove('on');
    };
  }

  function showDirective4() {
    if (directiveAcknowledged(4)) return false;
    const host = overlay();
    if (!host) return false;
    if (host.querySelector('#v1directive4')) return true;
    if (isOpen(host) && !host.textContent.includes('EPILOGUE')) return false;

    window.ADHOMS_LIGHT_STATE.flags['directive:4:seen'] = true;
    save();
    host.innerHTML = '<div class="ver1ChoiceCard" data-directive-number="4">' +
      '<div class="ver1Kicker">PRIVATE DEBRIEF / T-0WA</div>' +
      '<h2>木曽指令 第4号</h2>' +
      '<p>T-0WA：行政上の成功を確認しました。しかし、全体の成功は個人の損失を消しません。</p>' +
      '<p>生活に残った損失と、その残差を次の観測条件に含めます。評価が良好でも、失われたものを平均値の外へ捨てないでください。</p>' +
      '<div class="ver1ChoiceGrid"><button class="ver1ChoiceBtn" id="v1directive4">この残差を記録してエピローグへ</button></div>' +
      '</div>';
    host.classList.add('on');
    host.querySelector('#v1directive4').onclick = () => {
      window.ADHOMS_LIGHT_STATE.flags['directive:4:ack'] = true;
      save();
      renderEpilogue(host);
    };
    return true;
  }

  function queueDirective(number) {
    if (number === 4) {
      if (directiveAcknowledged(4)) return;
      window.ADHOMS_LIGHT_STATE.flags['directive:4:seen'] = true;
      save();
      tryResumePending();
      return;
    }
    if (!DIRECTIVES[number] || directiveAcknowledged(number)) return;
    window.ADHOMS_LIGHT_STATE.flags[`directive:${number}:seen`] = true;
    save();
    tryResumePending();
  }

  function tryResumePending() {
    const host = overlay();
    if (!host) return;
    const number = pendingDirective();
    if (!number) return;
    if (number === 4) {
      if (host.querySelector('#v1directive4')) return;
      if (isOpen(host) && !host.textContent.includes('EPILOGUE')) return;
      showDirective4();
      return;
    }
    if (isOpen(host)) return;
    showDirective(number);
  }

  function wireMilestoneControls() {
    const host = overlay();
    if (!host) return;

    if (host.textContent.includes('YEAR 3 / SIDE EFFECTS')) {
      const button = host.querySelector('#v1ok');
      if (button && !button.dataset.directiveHook) {
        button.dataset.directiveHook = '1';
        button.addEventListener('click', () => setTimeout(() => queueDirective(1), 0));
      }
    }

    if (host.textContent.includes('YEAR 4 / RELATION')) {
      host.querySelectorAll('[data-s]').forEach(button => {
        if (button.dataset.directiveHook) return;
        button.dataset.directiveHook = '2';
        button.addEventListener('click', () => setTimeout(() => queueDirective(2), 0));
      });
    }

    if (isOpen(host) && host.textContent.includes('EPILOGUE') && !directiveAcknowledged(4) && !host.querySelector('#v1directive4')) {
      showDirective4();
    }
  }

  const previousNextMonth = window.nextMonth;
  window.nextMonth = function nextMonthWithStoryMilestones() {
    const before = monthIndex();
    previousNextMonth();
    const after = monthIndex();
    if (before < 48 && after >= 48 && !directiveAcknowledged(3)) {
      setTimeout(() => queueDirective(3), 220);
    }
  };

  const observer = new MutationObserver(() => {
    wireMilestoneControls();
    tryResumePending();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  wireMilestoneControls();
  setTimeout(tryResumePending, 300);
})();
