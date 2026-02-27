/**
 * parser.js — Parsing du format Aiken
 *
 * Format attendu :
 *   Texte de la question
 *   A. Option A
 *   B. Option B
 *   ANSWER: B
 */

/**
 * Parse un texte au format Aiken et retourne un tableau de questions.
 * @param {string} text
 * @returns {{ text: string, options: {letter: string, text: string}[], answer: string }[]}
 */
function parseAiken(text) {
  const lines = text.split('\n').map(l => l.trim());
  const questions = [];
  let current = null;

  for (const line of lines) {
    if (!line) continue;

    const answerMatch = line.match(/^ANSWER\s*:\s*([A-Za-z])/i);
    const optionMatch = line.match(/^([A-Za-z])[.)]\s+(.+)/);

    if (answerMatch) {
      // Fin d'une question
      if (current) {
        current.answer = answerMatch[1].toUpperCase();
        questions.push(current);
        current = null;
      }
    } else if (optionMatch) {
      // Une option de réponse
      if (!current) current = { text: '', options: [] };
      current.options.push({
        letter: optionMatch[1].toUpperCase(),
        text: optionMatch[2].trim()
      });
    } else {
      // Texte de la question (peut être sur plusieurs lignes avant les options)
      if (!current) {
        current = { text: line, options: [] };
      } else if (current.options.length === 0) {
        current.text += ' ' + line;
      }
    }
  }

  return questions;
}
