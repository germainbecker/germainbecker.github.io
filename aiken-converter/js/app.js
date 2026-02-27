/**
 * app.js — Contrôleur principal de l'application
 * Dépend de : parser.js, quiz-template.js, exports.js
 */

/* ── État global ── */
let questions = [];

/* ── Helpers UI ── */
function getTitle() {
  return document.getElementById('customTitle').value.trim() || 'Questionnaire QCM';
}

function setStatus(type, html) {
  const el = document.getElementById('status');
  el.className = 'status ' + type;
  el.innerHTML = html;
}

function showTab(btn, id) {
  document.querySelectorAll('.preview-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.preview-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + id).classList.add('active');
  // Afficher le bouton copier uniquement sur l'onglet Markdown
  document.getElementById('btnCopyMd').style.display = (id === 'markdown') ? '' : 'none';
}

/* ── Parse & Convert ── */
function parseAndConvert() {
  const raw = document.getElementById('aikenInput').value.trim();

  if (!raw) {
    setStatus('error', '⚠ Aucun texte à analyser.');
    return;
  }

  questions = parseAiken(raw);

  if (!questions.length) {
    setStatus('error', '⚠ Aucune question valide trouvée. Vérifiez que chaque question se termine par <code>ANSWER: X</code>.');
    return;
  }

  const badOpts = questions.filter(q => q.options.length < 2).length;
  const warn    = badOpts ? ` · ⚠ ${badOpts} question(s) avec moins de 2 options` : '';
  const n       = questions.length;

  setStatus('ok', `✓ ${n} question${n > 1 ? 's' : ''} parsée${n > 1 ? 's' : ''} avec succès.${warn}`);

  document.getElementById('qCount').innerHTML      = `${n} <span>question${n > 1 ? 's' : ''}</span>`;
  document.getElementById('qSubtitle').textContent = getTitle();
  document.getElementById('results').style.display = 'block';

  renderParsedPreview();
  renderMarkdownPreview();

  setTimeout(() => {
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);
}

/* ── Previews ── */
function renderParsedPreview() {
  document.getElementById('parsedPreview').innerHTML = questions.map((q, i) => `
    <div class="q-card">
      <div class="q-card-top">
        <div class="q-text-preview">${escHtml(q.text)}</div>
        <span class="q-num-badge">Q${i + 1}</span>
      </div>
      <div class="q-opts-preview">
        ${q.options.map(o => `
          <div class="q-opt-preview ${o.letter === q.answer ? 'correct' : ''}">
            <span class="q-opt-letter">${o.letter}.</span>
            <span>${escHtml(o.text)}${o.letter === q.answer ? ' ✓' : ''}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

/* L'aperçu Markdown reflète exactement le fichier qui sera téléchargé,
   y compris l'option "Afficher la bonne réponse". */
function renderMarkdownPreview() {
  if (!questions.length) return;
  const showAnswer = document.getElementById('optShowAnswer').checked;
  document.getElementById('markdownPreview').textContent =
    generateMarkdown(questions, getTitle(), showAnswer);
}

/* ── Copie du Markdown dans le presse-papiers ── */
function copyMarkdown() {
  const text = document.getElementById('markdownPreview').textContent;
  const btn  = document.getElementById('btnCopyMd');
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Copié !';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 Copier';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback pour les contextes sans HTTPS
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ Copié !';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = '📋 Copier';
      btn.classList.remove('copied');
    }, 2000);
  });
}

/* ── Rafraîchissement de l'aperçu Markdown quand l'option change ── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('optShowAnswer').addEventListener('change', renderMarkdownPreview);
});

/* ── Démo ── */
function loadDemo() {
  document.getElementById('customTitle').value = 'Culture générale — Révisions';
  document.getElementById('aikenInput').value = `Quelle est la capitale de la France ?
A. Lyon
B. Paris
C. Marseille
D. Bordeaux
ANSWER: B

Quel est le résultat de 7 × 8 ?
A. 54
B. 48
C. 56
D. 64
ANSWER: C

Qui a peint la Joconde ?
A. Michel-Ange
B. Raphaël
C. Botticelli
D. Léonard de Vinci
ANSWER: D

En quelle année a eu lieu la Révolution française ?
A. 1776
B. 1789
C. 1804
D. 1815
ANSWER: B

Quel est le symbole chimique de l'or ?
A. Or
B. Go
C. Au
D. Ag
ANSWER: C`;

  parseAndConvert();
}
