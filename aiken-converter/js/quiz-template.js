/**
 * quiz-template.js — Génère le fichier HTML du quiz interactif standalone
 *
 * v1.2 :
 * - Bouton "Terminer" toujours visible → score calculé avec les réponses
 *   fournies (questions non répondues comptent comme fausses)
 * - Page de score épurée : plus de compteur d'erreurs
 */

function generateQuizHTML(questions, title, feedback, showAnswer) {
  const questionsJSON = JSON.stringify(questions);
  const titleEsc      = escHtml(title);

  /* ── CSS embarqué ── */
  const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

:root {
  --indigo:   #4f46e5;
  --indigo-l: #eef2ff;
  --indigo-d: #3730a3;
  --teal:     #0d9488;
  --green:    #16a34a;
  --green-l:  #f0fdf4;
  --green-b:  #bbf7d0;
  --rose:     #e11d48;
  --rose-l:   #fff1f2;
  --rose-b:   #fecdd3;
  --bg:       #f4f3ef;
  --surface:  #fff;
  --surface2: #f9f8f5;
  --border:   #e2e0d8;
  --text:     #1c1b18;
  --text2:    #6b6860;
  --text3:    #a09d96;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--bg); color: var(--text);
  min-height: 100vh; display: flex; flex-direction: column;
}

/* Header */
.qz-header {
  background: linear-gradient(135deg, var(--indigo) 0%, var(--teal) 100%);
  padding: 1.25rem 1.5rem; color: #fff;
}
.qz-title { font-size: 1rem; font-weight: 700; opacity: .95; }
.qz-sub   { font-size: .78rem; opacity: .65; margin-top: .15rem; }
.progress-wrap {
  background: rgba(255,255,255,.2); height: 5px;
  border-radius: 3px; margin-top: 1rem; overflow: hidden;
}
.progress-bar {
  height: 100%; background: #fff; border-radius: 3px;
  transition: width .4s cubic-bezier(.4,0,.2,1);
}

/* Layout */
main {
  flex: 1; display: flex;
  align-items: flex-start; justify-content: center;
  padding: 2rem 1rem 3rem;
}
.quiz-wrap { width: 100%; max-width: 620px; }

/* Card */
.q-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,.07);
  animation: fadeUp .3s ease;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.q-meta {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 1.1rem;
}
.q-badge {
  background: var(--indigo); color: #fff;
  font-family: 'Fira Code', monospace; font-size: .65rem;
  padding: .2rem .55rem; border-radius: 5px; letter-spacing: .04em;
}
.q-fraction { font-family: 'Fira Code', monospace; font-size: .72rem; color: var(--text3); }
.q-text { font-size: 1.15rem; font-weight: 600; line-height: 1.45; margin-bottom: 1.5rem; }

/* Options */
.opts { display: flex; flex-direction: column; gap: .55rem; }
.opt {
  display: flex; align-items: flex-start; gap: .75rem;
  background: var(--surface2); border: 2px solid var(--border);
  border-radius: 10px; padding: .85rem 1rem;
  cursor: pointer; width: 100%; text-align: left;
  font-family: inherit; font-size: .95rem;
  transition: border-color .15s, background .15s;
}
.opt:hover:not([disabled]) { border-color: var(--indigo); background: var(--indigo-l); }
.opt[disabled] { cursor: default; }
.opt-key {
  font-family: 'Fira Code', monospace; font-size: .7rem; font-weight: 600;
  color: var(--indigo); min-width: 1.4rem; margin-top: .18rem; flex-shrink: 0;
}
.opt-txt { line-height: 1.4; color: var(--text); }
.opt.correct { border-color: var(--green); background: var(--green-l); }
.opt.correct .opt-key, .opt.correct .opt-txt { color: var(--green); font-weight: 600; }
.opt.wrong   { border-color: var(--rose);  background: var(--rose-l); }
.opt.wrong .opt-key, .opt.wrong .opt-txt { color: var(--rose); }

/* Feedback */
.feedback {
  display: none; margin-top: 1rem; padding: .65rem 1rem;
  border-radius: 8px; font-size: .85rem; font-weight: 500;
  align-items: center; gap: .5rem;
}
.feedback.show { display: flex; }
.feedback.ok { background: var(--green-l); border: 1px solid var(--green-b); color: var(--green); }
.feedback.ko { background: var(--rose-l);  border: 1px solid var(--rose-b);  color: var(--rose); }

/* Navigation */
.nav {
  display: flex; justify-content: space-between;
  align-items: center; margin-top: 1.5rem; gap: .5rem;
  flex-wrap: wrap;
}
.btn-nav {
  background: var(--surface2); border: 2px solid var(--border);
  border-radius: 8px; color: var(--text2);
  font-family: inherit; font-size: .82rem; font-weight: 600;
  padding: .6rem 1.1rem; cursor: pointer;
  transition: border-color .15s, color .15s;
}
.btn-nav:hover:not([disabled]) { border-color: var(--indigo); color: var(--indigo); }
.btn-nav[disabled] { opacity: .3; cursor: default; }

/* Bouton principal (Suivant) */
.btn-main {
  background: var(--indigo); border: none; border-radius: 8px;
  color: #fff; font-family: inherit; font-size: .82rem; font-weight: 700;
  padding: .65rem 1.4rem; cursor: pointer;
  box-shadow: 0 2px 8px rgba(79,70,229,.3);
  transition: background .15s;
}
.btn-main:hover { background: var(--indigo-d); }

/* Bouton "Terminer" — toujours visible, style secondaire */
.btn-score {
  background: var(--surface2); border: 2px solid var(--border);
  border-radius: 8px; color: var(--text2);
  font-family: inherit; font-size: .82rem; font-weight: 600;
  padding: .6rem 1.1rem; cursor: pointer;
  transition: border-color .15s, color .15s;
}
.btn-score:hover { border-color: var(--teal); color: var(--teal); }

/* Score */
.score-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 16px; padding: 2.5rem 2rem; text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,.07); animation: fadeUp .4s ease;
}
.score-emoji { font-size: 3rem; line-height: 1; margin-bottom: 1rem; }
.score-num   { font-size: 3.5rem; font-weight: 800; letter-spacing: -.04em; line-height: 1; color: var(--indigo); }
.score-den   { font-size: 1.5rem; font-weight: 400; color: var(--text3); margin-left: .2rem; }
.score-pct   { font-size: 1rem; font-weight: 600; color: var(--text2); margin: .5rem 0 1.75rem; }
.score-bar-wrap {
  background: var(--bg); border-radius: 8px; height: 10px;
  overflow: hidden; max-width: 280px; margin: 0 auto 2rem;
}
.score-bar { height: 100%; border-radius: 8px; transition: width .9s cubic-bezier(.4,0,.2,1); }
.score-restart {
  background: var(--indigo); border: none; border-radius: 8px;
  color: #fff; font-family: inherit; font-size: .88rem; font-weight: 700;
  padding: .75rem 2rem; cursor: pointer;
  box-shadow: 0 2px 8px rgba(79,70,229,.3); transition: background .15s;
}
.score-restart:hover { background: var(--indigo-d); }

@media (max-width: 480px) {
  main { padding: 1.25rem .75rem 2rem; }
  .q-card { padding: 1.5rem 1.1rem; }
  .q-text { font-size: 1rem; }
  .nav { gap: .35rem; }
}
`;

  /* ── JS embarqué ── */
  const js = `
var QS       = ${questionsJSON};
var FEEDBACK = ${feedback};
var SHOW_ANS = ${showAnswer};

var idx      = 0;
var answered = new Array(QS.length).fill(null);

/* Score : questions non répondues = fausses */
function computeScore() {
  return answered.reduce(function(acc, a, i) {
    return acc + (a !== null && a === QS[i].answer ? 1 : 0);
  }, 0);
}

/* Constructeur DOM minimaliste */
function el(tag, attrs) {
  var children = Array.prototype.slice.call(arguments, 2);
  var node = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(function(k) {
      if      (k === 'className') node.className = attrs[k];
      else if (k === 'onClick')   node.addEventListener('click', attrs[k]);
      else if (k === 'style')     node.setAttribute('style', attrs[k]);
      else                        node.setAttribute(k, attrs[k]);
    });
  }
  children.forEach(function(c) {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

function render() {
  var q   = QS[idx];
  var sel = answered[idx];

  /* Progression */
  var pct = ((idx + 1) / QS.length * 100).toFixed(1);
  document.getElementById('pbar').style.width = pct + '%';
  document.getElementById('qSub').textContent =
    'Question ' + (idx + 1) + ' sur ' + QS.length;

  /* Options */
  var optsEl = el('div', { className: 'opts' });
  q.options.forEach(function(o) {
    var cls = 'opt';
    if (sel !== null) {
      if (o.letter === q.answer) cls += ' correct';
      else if (o.letter === sel) cls += ' wrong';
    }
    var btn = el('button', { className: cls },
      el('span', { className: 'opt-key' }, o.letter + '.'),
      el('span', { className: 'opt-txt' }, o.text)
    );
    if (sel !== null) btn.setAttribute('disabled', '');
    else btn.addEventListener('click', function() { choose(o.letter); });
    optsEl.appendChild(btn);
  });

  /* Feedback immédiat */
  var feedEl = null;
  if (FEEDBACK && sel !== null) {
    var ok  = (sel === q.answer);
    var msg = ok
      ? '\u2713 Bonne r\u00e9ponse\u00a0!'
      : '\u2717 Mauvaise r\u00e9ponse.'
        + (SHOW_ANS ? ' La bonne r\u00e9ponse \u00e9tait\u00a0' + q.answer + '.' : '');
    feedEl = el('div', { className: 'feedback show ' + (ok ? 'ok' : 'ko') }, msg);
  }

  /* Navigation */
  var isLast = (idx === QS.length - 1);

  var prevBtn = el('button', { className: 'btn-nav', onClick: function() { navigate(-1); } },
    '\u2190\u00a0Pr\u00e9c.');
  if (idx === 0) prevBtn.setAttribute('disabled', '');

  /* "Terminer" : toujours cliquable, score calculé sur réponses disponibles */
  var scoreBtn = el('button', { className: 'btn-score', onClick: showScore },
    'Terminer \u2192');

  var navEl = el('div', { className: 'nav' }, prevBtn, scoreBtn);

  /* "Suivant" uniquement si pas dernière question */
  if (!isLast) {
    var nextBtn = el('button', { className: 'btn-main', onClick: function() { navigate(1); } },
      'Suivant \u2192');
    navEl.appendChild(nextBtn);
  }

  /* Assemblage */
  var card = el('div', { className: 'q-card' },
    el('div', { className: 'q-meta' },
      el('span', { className: 'q-badge' }, 'Q' + (idx + 1)),
      el('span', { className: 'q-fraction' }, (idx + 1) + ' / ' + QS.length)
    ),
    el('div', { className: 'q-text' }, q.text),
    optsEl,
    feedEl,
    navEl
  );

  var wrap = document.getElementById('quizWrap');
  wrap.innerHTML = '';
  wrap.appendChild(card);
}

function choose(letter) {
  if (answered[idx] !== null) return;
  answered[idx] = letter;
  render();
}

function navigate(dir) {
  idx = Math.max(0, Math.min(QS.length - 1, idx + dir));
  render();
}

function showScore() {
  var total = QS.length;
  var score = computeScore();
  var pct   = Math.round(score / total * 100);
  var color = pct >= 80 ? '#16a34a'
            : pct >= 60 ? '#0d9488'
            : pct >= 40 ? '#d97706'
            : '#e11d48';
  var emoji = pct >= 80 ? '\uD83C\uDF89'   /* 🎉 */
            : pct >= 60 ? '\uD83D\uDC4D'   /* 👍 */
            : pct >= 40 ? '\uD83E\uDD14'   /* 🤔 */
            : '\uD83D\uDCAA';              /* 💪 */

  document.getElementById('pbar').style.width = '100%';
  document.getElementById('qSub').textContent = 'R\u00e9sultat final';

  var barEl = el('div', {
    className: 'score-bar',
    style: 'width:0%;background:' + color
  });

  var card = el('div', { className: 'score-card' },
    el('div', { className: 'score-emoji' }, emoji),
    el('div', {},
      el('span', { className: 'score-num' }, String(score)),
      el('span', { className: 'score-den' }, ' / ' + total)
    ),
    el('div', { className: 'score-pct' }, pct + '% de r\u00e9ussite'),
    el('div', { className: 'score-bar-wrap' }, barEl),
    el('button', { className: 'score-restart', onClick: restart },
      '\u21BA Recommencer')
  );

  var wrap = document.getElementById('quizWrap');
  wrap.innerHTML = '';
  wrap.appendChild(card);

  setTimeout(function() { barEl.style.width = pct + '%'; }, 80);
}

function restart() {
  idx      = 0;
  answered = new Array(QS.length).fill(null);
  render();
}

render();
`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleEsc}</title>
  <style>${css}</style>
</head>
<body>

<div class="qz-header">
  <div class="qz-title">${titleEsc}</div>
  <div class="qz-sub" id="qSub">Question 1 sur ${questions.length}</div>
  <div class="progress-wrap">
    <div class="progress-bar" id="pbar"
         style="width:${(1 / questions.length * 100).toFixed(1)}%"></div>
  </div>
</div>

<main>
  <div class="quiz-wrap" id="quizWrap"></div>
</main>

<script>
${js}
<\/script>
</body>
</html>`;
}
