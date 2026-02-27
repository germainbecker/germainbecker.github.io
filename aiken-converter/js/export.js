/**
 * exports.js — Toutes les fonctions d'export
 * v1.2 :
 * - Option showAnswer respectée dans tous les formats
 * - Markdown  : réponse inline sur la bonne option (inchangé, toujours visible si showAnswer)
 * - PDF A4    : réponses regroupées en annexe finale si showAnswer
 * - ODT       : réponses regroupées en annexe finale si showAnswer
 * - PDF slides: slide de réponse intercalée après chaque question si showAnswer
 *               + refonte visuelle fond blanc, police plus grande
 * - ODP       : slide de réponse intercalée après chaque question si showAnswer
 *               + refonte sobre fond blanc texte sombre
 */

/* ════════════════════════════════════════
   UTILITAIRES
════════════════════════════════════════ */

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(s) {
  return s.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
}

function downloadBlob(filename, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function downloadText(filename, content, mime) {
  downloadBlob(filename, new Blob([content], { type: mime }));
}

function getShowAnswer() {
  return document.getElementById('optShowAnswer').checked;
}

/* ════════════════════════════════════════
   MARKDOWN
   Réponse correcte toujours en gras/marquée si showAnswer,
   sinon options sans distinction.
════════════════════════════════════════ */

function generateMarkdown(questions, title, showAnswer) {
  let md = `# ${title}\n\n`;
  questions.forEach((q, i) => {
    md += `## Question ${i + 1}\n\n${q.text}\n\n`;
    q.options.forEach(o => {
      if (showAnswer && o.letter === q.answer) {
        md += `- **${o.letter}. ${o.text} ✓**\n`;
      } else {
        md += `- ${o.letter}. ${o.text}\n`;
      }
    });
    if (showAnswer) {
      md += `\n> Réponse : **${q.answer}**\n`;
    }
    md += `\n---\n\n`;
  });
  return md;
}

function downloadMarkdown() {
  const title     = getTitle();
  const showAnswer = getShowAnswer();
  downloadText(
    slugify(title) + '.md',
    generateMarkdown(questions, title, showAnswer),
    'text/markdown;charset=utf-8'
  );
}

/* ════════════════════════════════════════
   QUIZ HTML
════════════════════════════════════════ */

function downloadQuizHTML() {
  const title      = getTitle();
  const feedback   = document.getElementById('optFeedback').checked;
  const showAnswer = getShowAnswer();
  const shuffle    = document.getElementById('optShuffle').checked;
  const shuffOpts  = document.getElementById('optShuffleOpts').checked;

  let qs = [...questions];
  if (shuffle)   qs = qs.sort(() => Math.random() - .5);
  if (shuffOpts) qs = qs.map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - .5) }));

  const html = generateQuizHTML(qs, title, feedback, showAnswer);
  downloadText(slugify(title) + '_quiz.html', html, 'text/html;charset=utf-8');
}

/* ════════════════════════════════════════
   PDF — QUESTIONS A4
   Réponses regroupées en page d'annexe finale si showAnswer.
════════════════════════════════════════ */

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc        = new jsPDF({ unit: 'mm', format: 'a4' });
  const title      = getTitle();
  const showAnswer = getShowAnswer();
  const M = 20, PW = 210, CW = PW - M * 2;
  let y = M;

  const newPage = () => { doc.addPage(); y = M; };
  const checkY  = (needed) => { if (y + needed > 285) newPage(); };

  /* ── Bandeau titre */
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, PW, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(title, M, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${questions.length} question${questions.length > 1 ? 's' : ''}`,
    PW - M, 14, { align: 'right' }
  );
  y = 32;

  /* ── Questions (sans indication de bonne réponse) */
  questions.forEach((q, i) => {
    checkY(20);

    /* Badge numéro */
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(M, y - 4, 32, 6, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(79, 70, 229);
    doc.text(`QUESTION ${i + 1} / ${questions.length}`, M + 2, y);
    y += 6;

    /* Texte question */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(28, 27, 24);
    const qLines = doc.splitTextToSize(q.text, CW);
    checkY(qLines.length * 6);
    doc.text(qLines, M, y);
    y += qLines.length * 6 + 3;

    /* Options — aucune mise en valeur ici, même si showAnswer */
    q.options.forEach(o => {
      checkY(8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 78, 74);
      const oLines = doc.splitTextToSize(`${o.letter}. ${o.text}`, CW - 6);
      doc.text(oLines, M + 4, y);
      y += oLines.length * 5.5 + 2;
    });

    /* Séparateur */
    y += 3;
    checkY(2);
    doc.setDrawColor(220, 218, 210);
    doc.setLineWidth(0.2);
    doc.line(M, y, PW - M, y);
    y += 7;
  });

  /* ── Annexe réponses (seulement si showAnswer) */
  if (showAnswer) {
    newPage();

    /* Bandeau annexe */
    doc.setFillColor(238, 242, 255);
    doc.rect(0, 0, PW, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text('Corrigé — Réponses', M, 12);
    y = 28;

    const colW = CW / 2;
    const cols = [M, M + colW + 4];
    let col = 0;
    let colY = [y, y];

    questions.forEach((q, i) => {
      const cx = cols[col];
      let cy    = colY[col];

      /* Numéro + réponse */
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(cx, cy - 3.5, colW - 2, 13, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(130, 125, 120);
      doc.text(`Q${i + 1}`, cx + 3, cy + 0.5);

      /* Lettre de la bonne réponse */
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229);
      doc.text(q.answer, cx + 12, cy + 1);

      /* Texte de la bonne option */
      const ansOpt = q.options.find(o => o.letter === q.answer);
      if (ansOpt) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        const aLines = doc.splitTextToSize(ansOpt.text, colW - 22);
        doc.text(aLines, cx + 20, cy + 1);
      }

      colY[col] += 16;

      /* Passer à l'autre colonne si besoin */
      col = (col + 1) % 2;
      if (colY[col] > 280) {
        newPage();
        y = M;
        colY = [M, M];
      }
    });
  }

  /* ── Pied de page */
  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(170, 167, 160);
    doc.text(`${title} — ${p} / ${pageCount}`, PW / 2, 292, { align: 'center' });
  }

  doc.save(slugify(title) + '.pdf');
}

/* ════════════════════════════════════════
   PDF — DIAPORAMA PAYSAGE
   Fond blanc, lisible en projection.
   Si showAnswer : slide de réponse après chaque question.
════════════════════════════════════════ */

function downloadPDFSlides() {
  const { jsPDF } = window.jspdf;
  const doc        = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const title      = getTitle();
  const showAnswer = getShowAnswer();
  const W = 297, H = 210, M = 18;

  /* Palette sobre sur fond blanc */
  const C_BG      = [255, 255, 255];
  const C_STRIP   = [ 79,  70, 229]; // indigo
  const C_TEXT    = [ 22,  22,  30]; // quasi-noir
  const C_DIM     = [110, 108, 120]; // gris moyen
  const C_Q       = [ 22,  22,  30]; // texte question
  const C_OPT     = [ 70,  68,  80]; // texte option
  const C_ANS_BG  = [240, 253, 244]; // vert pâle fond réponse
  const C_ANS_TXT = [ 22, 163,  74]; // vert foncé

  /* ── Slide titre */
  doc.setFillColor(...C_BG); doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(...C_STRIP); doc.rect(0, 0, W, 6, 'F');
  doc.setFillColor(13, 148, 136); doc.rect(0, H - 6, W, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.setTextColor(...C_TEXT);
  const tLines = doc.splitTextToSize(title, W - M * 2);
  doc.text(tLines, W / 2, H / 2 - 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...C_DIM);
  doc.text(
    `${questions.length} question${questions.length > 1 ? 's' : ''}`,
    W / 2, H / 2 + 14, { align: 'center' }
  );

  questions.forEach((q, i) => {
    /* ── Slide question */
    doc.addPage();
    doc.setFillColor(...C_BG); doc.rect(0, 0, W, H, 'F');
    doc.setFillColor(...C_STRIP); doc.rect(0, 0, W, 12, 'F');

    /* En-tête */
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(title, M, 8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${i + 1} / ${questions.length}`, W - M, 8, { align: 'right' });

    /* Texte question */
    let y = 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...C_Q);
    const qLines = doc.splitTextToSize(q.text, W - M * 2);
    doc.text(qLines, M, y);
    y += qLines.length * 12 + 10;

    /* Options */
    q.options.forEach(o => {
      const oLines = doc.splitTextToSize(`${o.letter}.   ${o.text}`, W - M * 2 - 6);
      const lineH  = 8;
      const bH     = oLines.length * lineH + 7;

      /* fond léger */
      doc.setFillColor(248, 248, 252);
      doc.setDrawColor(210, 208, 228);
      doc.setLineWidth(0.4);
      doc.roundedRect(M, y - 5, W - M * 2, bH, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(15);
      doc.setTextColor(...C_OPT);
      doc.text(oLines, M + 5, y + 1);
      y += bH + 5;
    });

    /* ── Slide réponse (intercalée, si showAnswer) */
    if (showAnswer) {
      doc.addPage();
      doc.setFillColor(...C_BG); doc.rect(0, 0, W, H, 'F');

      /* Bandeau vert pâle en haut */
      doc.setFillColor(220, 252, 231); doc.rect(0, 0, W, 12, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.setTextColor(22, 163, 74);
      doc.text(`Réponse — Q${i + 1} / ${questions.length}`, M, 8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 180, 120);
      doc.text(title, W - M, 8, { align: 'right' });

      /* Rappel question */
      let ry = 30;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(...C_DIM);
      const rqLines = doc.splitTextToSize(q.text, W - M * 2);
      doc.text(rqLines, M, ry);
      ry += rqLines.length * 8 + 12;

      /* Grande lettre réponse */
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(60);
      doc.setTextColor(22, 163, 74);
      doc.text(q.answer, M + 10, ry + 18);

      /* Texte de la bonne option */
      const ansOpt = q.options.find(o => o.letter === q.answer);
      if (ansOpt) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...C_TEXT);
        const ansLines = doc.splitTextToSize(ansOpt.text, W - M * 2 - 30);
        doc.text(ansLines, M + 32, ry + 6);
      }
    }
  });

  doc.save(slugify(title) + '_slides.pdf');
}

/* ════════════════════════════════════════
   ODT — LibreOffice Writer
   Questions sans réponse. Annexe corrigé en fin si showAnswer.
════════════════════════════════════════ */

async function downloadODT() {
  const title      = getTitle();
  const showAnswer = getShowAnswer();
  const zip        = new JSZip();

  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });

  zip.file('META-INF/manifest.xml', `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
  <manifest:file-entry manifest:full-path="styles.xml"  manifest:media-type="text/xml"/>
</manifest:manifest>`);

  zip.file('styles.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0">
<office:styles>
  <style:style style:name="DocTitle" style:family="paragraph">
    <style:paragraph-properties fo:margin-bottom="8pt"/>
    <style:text-properties fo:font-size="18pt" fo:font-weight="bold" fo:color="#4f46e5"/>
  </style:style>
  <style:style style:name="QNum" style:family="paragraph">
    <style:paragraph-properties fo:margin-top="14pt" fo:margin-bottom="2pt"/>
    <style:text-properties fo:font-size="7pt" fo:font-weight="bold" fo:color="#4f46e5"/>
  </style:style>
  <style:style style:name="QText" style:family="paragraph">
    <style:paragraph-properties fo:margin-bottom="4pt"/>
    <style:text-properties fo:font-size="12pt" fo:font-weight="bold" fo:color="#1c1b18"/>
  </style:style>
  <style:style style:name="OptNormal" style:family="paragraph">
    <style:paragraph-properties fo:margin-left="8pt" fo:margin-bottom="2pt"/>
    <style:text-properties fo:font-size="11pt" fo:color="#6b6860"/>
  </style:style>
  <style:style style:name="AnnexTitle" style:family="paragraph">
    <style:paragraph-properties fo:margin-top="16pt" fo:margin-bottom="8pt" fo:break-before="page"/>
    <style:text-properties fo:font-size="16pt" fo:font-weight="bold" fo:color="#4f46e5"/>
  </style:style>
  <style:style style:name="AnnexQ" style:family="paragraph">
    <style:paragraph-properties fo:margin-top="6pt" fo:margin-bottom="2pt"/>
    <style:text-properties fo:font-size="9pt" fo:font-weight="bold" fo:color="#888888"/>
  </style:style>
  <style:style style:name="AnnexAns" style:family="paragraph">
    <style:paragraph-properties fo:margin-left="6pt" fo:margin-bottom="4pt"/>
    <style:text-properties fo:font-size="11pt" fo:font-weight="bold" fo:color="#16a34a"/>
  </style:style>
</office:styles>
</office:document-styles>`);

  const ns = 'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"';
  let body = `<text:p text:style-name="DocTitle" ${ns}>${escXml(title)}</text:p>\n`;

  /* Questions sans mise en valeur de la bonne réponse */
  questions.forEach((q, i) => {
    body += `<text:p text:style-name="QNum" ${ns}>QUESTION ${i + 1} / ${questions.length}</text:p>\n`;
    body += `<text:p text:style-name="QText" ${ns}>${escXml(q.text)}</text:p>\n`;
    q.options.forEach(o => {
      body += `<text:p text:style-name="OptNormal" ${ns}>${escXml(o.letter + '. ' + o.text)}</text:p>\n`;
    });
  });

  /* Annexe corrigé */
  if (showAnswer) {
    body += `<text:p text:style-name="AnnexTitle" ${ns}>Corrigé — Réponses</text:p>\n`;
    questions.forEach((q, i) => {
      const ansOpt = q.options.find(o => o.letter === q.answer);
      body += `<text:p text:style-name="AnnexQ" ${ns}>Q${i + 1} — ${escXml(q.text)}</text:p>\n`;
      body += `<text:p text:style-name="AnnexAns" ${ns}>${escXml(q.answer + '.  ' + (ansOpt ? ansOpt.text : ''))}</text:p>\n`;
    });
  }

  zip.file('content.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0">
  <office:body>
    <office:text>${body}</office:text>
  </office:body>
</office:document-content>`);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.oasis.opendocument.text'
  });
  downloadBlob(slugify(title) + '.odt', blob);
}

/* ════════════════════════════════════════
   ODP — LibreOffice Impress
   Sobre, fond blanc, texte sombre, police grande.
   Si showAnswer : slide de réponse après chaque question.
════════════════════════════════════════ */

async function downloadODP() {
  const title      = getTitle();
  const showAnswer = getShowAnswer();
  const zip        = new JSZip();

  zip.file('mimetype', 'application/vnd.oasis.opendocument.presentation', { compression: 'STORE' });

  zip.file('META-INF/manifest.xml', `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.presentation"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`);

  /* ── Styles ── */
  const stylesXml = `
    <!-- Page : fond blanc -->
    <style:style style:name="dpWhite" style:family="drawing-page">
      <style:drawing-page-properties draw:fill="solid" draw:fill-color="#ffffff"/>
    </style:style>
    <!-- Page réponse : fond vert très pâle -->
    <style:style style:name="dpAns" style:family="drawing-page">
      <style:drawing-page-properties draw:fill="solid" draw:fill-color="#f0fdf4"/>
    </style:style>
    <!-- Titre principal (slide titre) -->
    <style:style style:name="sMainTitle" style:family="text">
      <style:text-properties fo:font-size="32pt" fo:font-weight="bold" fo:color="#1c1b18"/>
    </style:style>
    <!-- Sous-titre slide titre -->
    <style:style style:name="sMainSub" style:family="text">
      <style:text-properties fo:font-size="16pt" fo:color="#6b6860"/>
    </style:style>
    <!-- Compteur en haut de slide -->
    <style:style style:name="sCounter" style:family="text">
      <style:text-properties fo:font-size="9pt" fo:color="#9090a8"/>
    </style:style>
    <!-- Texte de la question -->
    <style:style style:name="sQ" style:family="text">
      <style:text-properties fo:font-size="22pt" fo:font-weight="bold" fo:color="#1c1b18"/>
    </style:style>
    <!-- Option normale -->
    <style:style style:name="sOpt" style:family="text">
      <style:text-properties fo:font-size="16pt" fo:color="#4b4a58"/>
    </style:style>
    <!-- Label "Réponse" sur slide corrigé -->
    <style:style style:name="sAnsLabel" style:family="text">
      <style:text-properties fo:font-size="10pt" fo:font-weight="bold" fo:color="#16a34a"/>
    </style:style>
    <!-- Grande lettre réponse -->
    <style:style style:name="sAnsLetter" style:family="text">
      <style:text-properties fo:font-size="52pt" fo:font-weight="bold" fo:color="#16a34a"/>
    </style:style>
    <!-- Texte de l'option réponse -->
    <style:style style:name="sAnsText" style:family="text">
      <style:text-properties fo:font-size="20pt" fo:font-weight="bold" fo:color="#1c1b18"/>
    </style:style>
    <!-- Rappel question sur slide réponse -->
    <style:style style:name="sAnsQ" style:family="text">
      <style:text-properties fo:font-size="13pt" fo:color="#6b6860"/>
    </style:style>`;

  /* ── Slide titre */
  let slides = `
  <draw:page draw:name="Titre" draw:style-name="dpWhite" draw:master-page-name="Default">
    <draw:frame svg:width="25cm" svg:height="6cm" svg:x="1cm" svg:y="5.5cm">
      <draw:text-box>
        <text:p><text:span text:style-name="sMainTitle">${escXml(title)}</text:span></text:p>
      </draw:text-box>
    </draw:frame>
    <draw:frame svg:width="25cm" svg:height="1.5cm" svg:x="1cm" svg:y="12cm">
      <draw:text-box>
        <text:p><text:span text:style-name="sMainSub">${questions.length} question${questions.length > 1 ? 's' : ''}</text:span></text:p>
      </draw:text-box>
    </draw:frame>
  </draw:page>`;

  questions.forEach((q, i) => {
    const ansOpt = q.options.find(o => o.letter === q.answer);

    /* Options XML (sans mise en valeur) */
    const optsXml = q.options.map(o =>
      `<text:p><text:span text:style-name="sOpt">${escXml(o.letter + '.   ' + o.text)}</text:span></text:p>`
    ).join('\n');

    /* ── Slide question */
    slides += `
  <draw:page draw:name="Q${i + 1}" draw:style-name="dpWhite" draw:master-page-name="Default">
    <draw:frame svg:width="26cm" svg:height="0.8cm" svg:x="0.5cm" svg:y="0.3cm">
      <draw:text-box>
        <text:p><text:span text:style-name="sCounter">${escXml(title + '   —   ' + (i + 1) + ' / ' + questions.length)}</text:span></text:p>
      </draw:text-box>
    </draw:frame>
    <draw:frame svg:width="25cm" svg:height="4.5cm" svg:x="1cm" svg:y="1.5cm">
      <draw:text-box>
        <text:p><text:span text:style-name="sQ">${escXml(q.text)}</text:span></text:p>
      </draw:text-box>
    </draw:frame>
    <draw:frame svg:width="25cm" svg:height="11cm" svg:x="1cm" svg:y="6cm">
      <draw:text-box>${optsXml}</draw:text-box>
    </draw:frame>
  </draw:page>`;

    /* ── Slide réponse (si showAnswer) */
    if (showAnswer) {
      slides += `
  <draw:page draw:name="R${i + 1}" draw:style-name="dpAns" draw:master-page-name="Default">
    <draw:frame svg:width="26cm" svg:height="0.8cm" svg:x="0.5cm" svg:y="0.3cm">
      <draw:text-box>
        <text:p><text:span text:style-name="sAnsLabel">RÉPONSE — Q${i + 1} / ${questions.length}</text:span></text:p>
      </draw:text-box>
    </draw:frame>
    <draw:frame svg:width="25cm" svg:height="2cm" svg:x="1cm" svg:y="1.5cm">
      <draw:text-box>
        <text:p><text:span text:style-name="sAnsQ">${escXml(q.text)}</text:span></text:p>
      </draw:text-box>
    </draw:frame>
    <draw:frame svg:width="3cm" svg:height="4cm" svg:x="1cm" svg:y="4.5cm">
      <draw:text-box>
        <text:p><text:span text:style-name="sAnsLetter">${escXml(q.answer)}</text:span></text:p>
      </draw:text-box>
    </draw:frame>
    <draw:frame svg:width="22cm" svg:height="4cm" svg:x="4.5cm" svg:y="5.2cm">
      <draw:text-box>
        <text:p><text:span text:style-name="sAnsText">${escXml(ansOpt ? ansOpt.text : '')}</text:span></text:p>
      </draw:text-box>
    </draw:frame>
  </draw:page>`;
    }
  });

  zip.file('content.xml', `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content
  xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
  xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
  xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
  xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
  xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
  xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
  xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0">
  <office:automatic-styles>
    ${stylesXml}
  </office:automatic-styles>
  <office:body>
    <office:presentation>
      <presentation:settings/>
      ${slides}
    </office:presentation>
  </office:body>
</office:document-content>`);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.oasis.opendocument.presentation'
  });
  downloadBlob(slugify(title) + '.odp', blob);
}
