(() => {
  'use strict';

  const FORMULAS = [
    {
      id: 'A',
      name: '세 수 합의 제곱',
      basket: '(a+b+c)^2',
      full: 'a^2+b^2+c^2+2ab+2bc+2ca=(a+b+c)^2',
    },
    {
      id: 'B',
      name: '합의 세제곱',
      basket: '(a+b)^3',
      full: 'a^3+3a^2b+3ab^2+b^3=(a+b)^3',
    },
    {
      id: 'C',
      name: '차의 세제곱',
      basket: '(a-b)^3',
      full: 'a^3-3a^2b+3ab^2-b^3=(a-b)^3',
    },
    {
      id: 'D',
      name: '세제곱의 합',
      basket: '(a+b)(a^{2}-ab+b^{2})',
      full: 'a^3+b^3=(a+b)(a^{2}-ab+b^{2})',
    },
    {
      id: 'E',
      name: '세제곱의 차',
      basket: '(a-b)(a^{2}+ab+b^{2})',
      full: 'a^3-b^3=(a-b)(a^{2}+ab+b^{2})',
    },
  ];

  const BANK = [
    // A: a^2+b^2+c^2+2ab+2bc+2ca = (a+b+c)^2
    { basketId: 'A', latex: 'x^2+y^2+z^2+2xy+2yz+2zx' },
    { basketId: 'A', latex: 'p^2+q^2+r^2+2pq+2qr+2rp' },
    { basketId: 'A', latex: 'a^2+b^2+c^2+2ab+2bc+2ca' },
    { basketId: 'A', latex: 'm^2+n^2+k^2+2mn+2nk+2km' },
    { basketId: 'A', latex: 'x^2+y^2+1+2xy+2y+2x' },
    { basketId: 'A', latex: 'a^2+b^2+4+2ab+4b+4a' },

    // B: a^3+3a^2b+3ab^2+b^3 = (a+b)^3
    { basketId: 'B', latex: 'x^3+3x^2y+3xy^2+y^3' },
    { basketId: 'B', latex: 'p^3+3p^2q+3pq^2+q^3' },
    { basketId: 'B', latex: 'm^3+3m^2n+3mn^2+n^3' },
    { basketId: 'B', latex: 'x^3+3x^2+3x+1' },
    { basketId: 'B', latex: '8x^3+12x^2y+6xy^2+y^3' },
    { basketId: 'B', latex: 'x^3+6x^2y+12xy^2+8y^3' },
    { basketId: 'B', latex: 'a^3+9a^2+27a+27' },

    // C: a^3-3a^2b+3ab^2-b^3 = (a-b)^3
    { basketId: 'C', latex: 'x^3-3x^2y+3xy^2-y^3' },
    { basketId: 'C', latex: 'p^3-3p^2q+3pq^2-q^3' },
    { basketId: 'C', latex: 'm^3-3m^2n+3mn^2-n^3' },
    { basketId: 'C', latex: 'x^3-3x^2+3x-1' },
    { basketId: 'C', latex: '27x^3-27x^2y+9xy^2-y^3' },
    { basketId: 'C', latex: '8x^3-36x^2y+54xy^2-27y^3' },
    { basketId: 'C', latex: 'a^3-6a^2+12a-8' },

    // D: a^3+b^3 = (a+b)(a^2-ab+b^2)
    { basketId: 'D', latex: 'x^3+y^3' },
    { basketId: 'D', latex: 'x^3+8' },
    { basketId: 'D', latex: '27x^3+y^3' },
    { basketId: 'D', latex: 'x^3+27' },
    { basketId: 'D', latex: '8x^3+y^3' },
    { basketId: 'D', latex: 'a^3+b^3' },
    { basketId: 'D', latex: 'x^3+1' },
    { basketId: 'D', latex: 'y^3+8' },

    // E: a^3-b^3 = (a-b)(a^2+ab+b^2)
    { basketId: 'E', latex: 'x^3-y^3' },
    { basketId: 'E', latex: 'x^3-8' },
    { basketId: 'E', latex: '27x^3-y^3' },
    { basketId: 'E', latex: 'x^3-27' },
    { basketId: 'E', latex: '8x^3-y^3' },
    { basketId: 'E', latex: 'a^3-b^3' },
    { basketId: 'E', latex: 'x^3-1' },
    { basketId: 'E', latex: 'y^3-8' },
  ];

  const MAX_LIVES = 3;
  const START_DURATION = 6850;
  const MIN_DURATION = 3150;
  const DURATION_STEP = 200;
  const ROUND_GAP = 480;
  const BEST_KEY = 'factoringCatcher.bestScore';

  const $ = (id) => document.getElementById(id);

  const screenStart = $('screenStart');
  const screenGame = $('screenGame');
  const screenOver = $('screenOver');

  const fallZoneEl = $('fallZone');
  const basketsEl = $('baskets');

  const hudLives = $('hudLives');
  const hudScore = $('hudScore');
  const hudCombo = $('hudCombo');

  const btnShowFormulas = $('btnShowFormulas');
  const formulaRef = $('formulaRef');
  const btnStart = $('btnStart');
  const bestScoreLine = $('bestScoreLine');

  const resultScore = $('resultScore');
  const resultCorrect = $('resultCorrect');
  const resultCombo = $('resultCombo');
  const newBestLine = $('newBestLine');
  const reviewFormulas = $('reviewFormulas');
  const btnRetry = $('btnRetry');

  const basketButtons = {};

  let state = null;

  function renderKatexTo(el, latex, displayMode) {
    try {
      katex.render(latex, el, { throwOnError: false, displayMode: !!displayMode, strict: false });
    } catch (e) {
      el.textContent = latex;
    }
  }

  function renderFormulaList(container) {
    container.innerHTML = '';
    FORMULAS.forEach((f) => {
      const row = document.createElement('div');
      row.className = 'formula-ref-item';

      const formulaSpan = document.createElement('span');
      renderKatexTo(formulaSpan, f.full, false);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'fr-name';
      nameSpan.textContent = f.name;

      row.appendChild(formulaSpan);
      row.appendChild(nameSpan);
      container.appendChild(row);
    });
  }

  function buildBaskets() {
    basketsEl.innerHTML = '';
    FORMULAS.forEach((f) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'basket-btn';

      const fEl = document.createElement('div');
      fEl.className = 'b-formula';
      renderKatexTo(fEl, f.basket, false);

      const nEl = document.createElement('div');
      nEl.className = 'b-name';
      nEl.textContent = f.name;

      btn.appendChild(fEl);
      btn.appendChild(nEl);
      btn.addEventListener('click', () => onBasketClick(f.id));

      basketsEl.appendChild(btn);
      basketButtons[f.id] = btn;
    });
  }

  function updateHud() {
    const lives = Math.max(state.lives, 0);
    hudLives.textContent = '❤'.repeat(lives) + '♡'.repeat(MAX_LIVES - lives);
    hudScore.textContent = `${state.score}점`;
    if (state.combo >= 2) {
      hudCombo.hidden = false;
      hudCombo.textContent = `콤보 ${state.combo}`;
    } else {
      hudCombo.hidden = true;
    }
  }

  function showPop(text, kind) {
    const pop = document.createElement('span');
    pop.className = `score-pop ${kind === 'good' ? 'pop-good' : 'pop-bad'}`;
    pop.style.top = '10px';
    pop.textContent = text;
    fallZoneEl.appendChild(pop);
    setTimeout(() => pop.remove(), 720);
  }

  function pickNextIndex() {
    if (BANK.length <= 1) return 0;
    let index = Math.floor(Math.random() * BANK.length);
    let guard = 0;
    while (BANK[index].basketId === state.lastBasketId && guard < 10) {
      index = Math.floor(Math.random() * BANK.length);
      guard += 1;
    }
    return index;
  }

  function spawnNext() {
    if (!state.running) return;

    const data = BANK[pickNextIndex()];
    state.lastBasketId = data.basketId;

    const el = document.createElement('div');
    el.className = 'falling-item';
    el.style.top = '0px';
    fallZoneEl.appendChild(el);
    renderKatexTo(el, data.latex, false);

    const zoneH = fallZoneEl.clientHeight;
    const itemH = el.offsetHeight;
    const travel = Math.max(zoneH - itemH, 0);
    const duration = state.fallDuration;

    const item = { basketId: data.basketId, el, answered: false };
    state.currentItem = item;

    requestAnimationFrame(() => {
      el.style.transition = `top ${duration}ms linear`;
      requestAnimationFrame(() => {
        el.style.top = `${travel}px`;
      });
    });

    const onEnd = (e) => {
      if (e.propertyName !== 'top') return;
      el.removeEventListener('transitionend', onEnd);
      if (!item.answered && state.currentItem === item) {
        handleMiss(item);
      }
    };
    el.addEventListener('transitionend', onEnd);
  }

  function registerCorrect() {
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.correctCount += 1;
    const points = 10 + (state.combo - 1) * 5;
    state.score += points;
    state.fallDuration = Math.max(MIN_DURATION, state.fallDuration - DURATION_STEP);
    showPop(`+${points}`, 'good');
    updateHud();
  }

  function registerWrong(reason) {
    state.combo = 0;
    state.lives -= 1;
    const label = state.lives <= 0 ? '게임 오버' : reason === 'miss' ? '놓침!' : '오답!';
    showPop(label, 'bad');
    updateHud();
  }

  function finishRound(item, btn) {
    state.currentItem = null;
    setTimeout(() => {
      item.el.remove();
      if (btn) btn.classList.remove('basket-correct', 'basket-wrong');
      if (state.lives <= 0) {
        endGame();
      } else if (state.running) {
        spawnNext();
      }
    }, ROUND_GAP);
  }

  function onBasketClick(basketId) {
    const item = state && state.currentItem;
    if (!state || !state.running || !item || item.answered) return;
    item.answered = true;

    const btn = basketButtons[basketId];
    const correct = item.basketId === basketId;

    if (correct) {
      item.el.classList.add('fx-correct');
      btn.classList.add('basket-correct');
      registerCorrect();
    } else {
      item.el.classList.add('fx-wrong');
      btn.classList.add('basket-wrong');
      registerWrong('wrong');
    }
    finishRound(item, btn);
  }

  function handleMiss(item) {
    if (item.answered) return;
    item.answered = true;
    item.el.classList.add('fx-wrong');
    registerWrong('miss');
    finishRound(item, null);
  }

  function startGame() {
    state = {
      running: true,
      lives: MAX_LIVES,
      score: 0,
      combo: 0,
      bestCombo: 0,
      correctCount: 0,
      currentItem: null,
      fallDuration: START_DURATION,
      lastBasketId: null,
    };

    fallZoneEl.innerHTML = '';
    updateHud();

    screenStart.hidden = true;
    screenOver.hidden = true;
    screenGame.hidden = false;

    setTimeout(spawnNext, 500);
  }

  function endGame() {
    state.running = false;

    screenGame.hidden = true;
    screenOver.hidden = false;

    resultScore.textContent = String(state.score);
    resultCorrect.textContent = String(state.correctCount);
    resultCombo.textContent = String(state.bestCombo);

    const best = Number(localStorage.getItem(BEST_KEY) || 0);
    if (state.score > best) {
      localStorage.setItem(BEST_KEY, String(state.score));
      newBestLine.hidden = false;
    } else {
      newBestLine.hidden = true;
    }

    renderFormulaList(reviewFormulas);
  }

  function initStartScreen() {
    const best = Number(localStorage.getItem(BEST_KEY) || 0);
    if (best > 0) {
      bestScoreLine.hidden = false;
      bestScoreLine.textContent = `최고 점수: ${best}점`;
    }

    btnShowFormulas.addEventListener('click', () => {
      const show = formulaRef.hidden;
      if (show && !formulaRef.dataset.built) {
        renderFormulaList(formulaRef);
        formulaRef.dataset.built = '1';
      }
      formulaRef.hidden = !show;
      btnShowFormulas.setAttribute('aria-expanded', String(show));
      btnShowFormulas.textContent = show ? '공식 숨기기' : '공식 미리보기';
    });
  }

  buildBaskets();
  initStartScreen();

  btnStart.addEventListener('click', startGame);
  btnRetry.addEventListener('click', startGame);
})();
