// Chang Book Reader — BookForge Studio (Xưởng tạo sách số)
// Client-side parser and multi-format book generator (EPUB, DOCX, FB2, HTML, RTF, TXT)
const enc = new TextEncoder();

export const xml = s => String(s)
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffe\uffff]/g, '')
  .replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

export function parseDraft(text, markdown = true) {
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let para = [], code = null;
  const flush = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join('\n') });
      para = [];
    }
  };

  for (const line of lines) {
    if (markdown && /^\s*```/.test(line)) {
      flush();
      if (code !== null) {
        blocks.push({ type: 'pre', text: code.join('\n') });
        code = null;
      } else {
        code = [];
      }
      continue;
    }
    if (code !== null) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    const h = markdown && line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    const list = markdown && line.match(/^\s*(?:[-*+] |\d+[.)] )(.+)/);
    const quote = markdown && line.match(/^>\s?(.*)/);
    if (h) {
      flush();
      blocks.push({ type: 'h' + h[1].length, text: h[2] });
    } else if (list) {
      flush();
      blocks.push({ type: 'li', text: list[1] });
    } else if (quote) {
      flush();
      blocks.push({ type: 'quote', text: quote[1] });
    } else {
      para.push(line);
    }
  }
  flush();
  if (code !== null) blocks.push({ type: 'pre', text: code.join('\n') });
  return blocks;
}

function inline(text, md) {
  if (!md) return xml(text).replace(/\n/g, '<br/>');
  const saved = [];
  const token = s => { saved.push(s); return '\u0000' + (saved.length - 1) + '\u0000'; };
  let s = xml(text).replace(/`([^`]+)`/g, (_, v) => token('<code>' + v + '</code>'));
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, a) => a ? '[Ảnh: ' + a + ']' : '[Ảnh]');
  s = s.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_, a, u) => /^https?:\/\//i.test(u) ? token('<a href="' + u + '">' + a + '</a>') : a);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
       .replace(/__([^_]+)__/g, '<strong>$1</strong>')
       .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
       .replace(/\n/g, '<br/>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => saved[+i]);
}

export function renderBlocks(blocks, md = true) {
  let html = '', list = false;
  blocks.forEach((b, i) => {
    if (b.type !== 'li' && list) {
      html += '</ul>';
      list = false;
    }
    if (b.type === 'li') {
      if (!list) {
        html += '<ul>';
        list = true;
      }
      html += '<li>' + inline(b.text, md) + '</li>';
    } else {
      const tag = b.type === 'quote' ? 'blockquote' : b.type;
      html += '<' + tag + (/^h/.test(tag) ? ' id="s' + i + '"' : '') + '>' +
              (tag === 'pre' ? xml(b.text) : inline(b.text, md)) +
              '</' + tag + '>';
    }
  });
  return html + (list ? '</ul>' : '');
}

export const bookStyle = 'body{font-family:Georgia,serif;line-height:1.8;margin:5%;max-width:760px;margin:0 auto;padding:40px 24px;color:#181818;background:#fcfcfc}h1,h2,h3{line-height:1.3;break-after:avoid}pre{white-space:pre-wrap;background:#efefed;padding:12px;border-radius:4px}blockquote{border-left:3px solid #e9be43;padding-left:1em;margin-left:0;color:#555}a{color:#90701b}@media print{body{margin:0;max-width:100%}h1{break-before:page}h1:first-child{break-before:auto}}';

export function htmlBook(book) {
  return '<!DOCTYPE html><html lang="' + xml(book.language || 'vi') + '"><head><meta charset="utf-8"><title>' +
         xml(book.title) + '</title><style>' + bookStyle + '</style></head><body><h1>' +
         xml(book.title) + '</h1><p class="author"><strong>Tác giả:</strong> ' + xml(book.author) + '</p><hr/>' +
         renderBlocks(book.blocks, book.markdown) + '</body></html>';
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = (n & 1) ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});

function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function createZip(entries) {
  let offset = 0;
  const local = [], central = [];
  for (const [name, value] of entries) {
    const n = enc.encode(name);
    const data = typeof value === 'string' ? enc.encode(value) : value;
    const c = crc32(data);
    const h = new Uint8Array(30 + n.length);
    const v = new DataView(h.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 0x800, true);
    v.setUint16(12, 33, true);
    v.setUint32(14, c, true);
    v.setUint32(18, data.length, true);
    v.setUint32(22, data.length, true);
    v.setUint16(26, n.length, true);
    h.set(n, 30);
    local.push(h, data);

    const ch = new Uint8Array(46 + n.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x800, true);
    cv.setUint16(14, 33, true);
    cv.setUint32(16, c, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, n.length, true);
    cv.setUint32(42, offset, true);
    ch.set(n, 46);
    central.push(ch);
    offset += h.length + data.length;
  }
  const size = central.reduce((a, x) => a + x.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, size, true);
  ev.setUint32(16, offset, true);
  return new Blob([...local, ...central, end], { type: 'application/zip' });
}

export function generateEpub(book) {
  const id = 'urn:uuid:' + crypto.randomUUID();
  const headings = book.blocks.map((b, i) => ({ b, i })).filter(x => /^h[1-6]$/.test(x.b.type));
  const nav = headings.length
    ? headings.map(({ b, i }) => '<li><a href="book.xhtml#s' + i + '">' + xml(b.text) + '</a></li>').join('')
    : '<li><a href="book.xhtml">' + xml(book.title) + '</a></li>';
  const xhead = '<?xml version="1.0" encoding="UTF-8"?>\n';

  return createZip([
    ['mimetype', 'application/epub+zip'],
    ['META-INF/container.xml', xhead + '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'],
    ['EPUB/package.opf', xhead + '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="' + xml(book.language || 'vi') + '"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">' + id + '</dc:identifier><dc:title>' + xml(book.title) + '</dc:title><dc:creator>' + xml(book.author) + '</dc:creator><dc:language>' + xml(book.language || 'vi') + '</dc:language><meta property="dcterms:modified">' + new Date().toISOString().replace(/\.\d{3}Z$/, 'Z') + '</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="book" href="book.xhtml" media-type="application/xhtml+xml"/><item id="css" href="style.css" media-type="text/css"/></manifest><spine><itemref idref="book"/></spine></package>'],
    ['EPUB/nav.xhtml', xhead + '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="' + xml(book.language || 'vi') + '"><head><title>Mục lục</title></head><body><nav epub:type="toc"><h1>Mục lục</h1><ol>' + nav + '</ol></nav></body></html>'],
    ['EPUB/book.xhtml', xhead + '<html xmlns="http://www.w3.org/1999/xhtml" lang="' + xml(book.language || 'vi') + '"><head><title>' + xml(book.title) + '</title><link rel="stylesheet" href="style.css"/></head><body><h1>' + xml(book.title) + '</h1><p>' + xml(book.author) + '</p>' + renderBlocks(book.blocks, book.markdown) + '</body></html>'],
    ['EPUB/style.css', bookStyle]
  ]);
}

export function generateFb2(book) {
  let body = '', section = false;
  for (const b of book.blocks) {
    if (/^h/.test(b.type)) {
      if (section) body += '</section>';
      body += '<section><title><p>' + xml(b.text) + '</p></title>';
      section = true;
    } else {
      if (!section) {
        body += '<section>';
        section = true;
      }
      body += '<p>' + xml(b.text) + '</p>';
    }
  }
  if (section) body += '</section>';
  else body = '<section><empty-line/></section>';

  return new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0"><description><title-info><genre>other</genre><author><nickname>' + xml(book.author) + '</nickname></author><book-title>' + xml(book.title) + '</book-title><lang>' + xml(book.language || 'vi') + '</lang></title-info><document-info><author><nickname>Chang Book Reader</nickname></author><date>' + new Date().toISOString().slice(0, 10) + '</date><id>' + crypto.randomUUID() + '</id><version>1.0</version></document-info></description><body>' + body + '</body></FictionBook>'], { type: 'application/xml' });
}

export function generateRtf(book) {
  const escape = s => {
    let out = '';
    for (let i = 0; i < s.length; i++) {
      const n = s.charCodeAt(i), c = s[i];
      out += n > 127 ? '\\u' + (n > 32767 ? n - 65536 : n) + '?' : c === '\n' ? '\\line ' : /[{}\\]/.test(c) ? '\\' + c : c;
    }
    return out;
  };
  return new Blob(['{\\rtf1\\ansi\\deff0\\uc1{\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs24\n{\\b\\fs36 ' + escape(book.title) + '}\\par\n' + escape(book.author) + '\\par\n' + book.blocks.map(b => (/^h/.test(b.type) ? '{\\b ' + escape(b.text) + '}' : escape(b.text)) + '\\par\n').join('') + '}'], { type: 'application/rtf' });
}

export function generateDocx(book) {
  const p = (s, heading = false) => '<w:p>' + (heading ? '<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>' : '') + '<w:r><w:t xml:space="preserve">' + xml(s) + '</w:t></w:r></w:p>';
  return createZip([
    ['[Content_Types].xml', '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ['word/document.xml', '<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + p(book.title, true) + p(book.author) + book.blocks.map(b => b.text.split('\n').map(line => p(line, /^h/.test(b.type))).join('')).join('') + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>'],
    ['word/_rels/document.xml.rels', '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['word/styles.xml', '<?xml version="1.0"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style></w:styles>']
  ]);
}

export function convertBook(book, format) {
  if (!book.blocks || !book.blocks.length) throw new Error('Bản thảo chưa có nội dung.');
  switch (format) {
    case 'epub': return generateEpub(book);
    case 'fb2': return generateFb2(book);
    case 'html': return new Blob([htmlBook(book)], { type: 'text/html;charset=utf-8' });
    case 'docx': return generateDocx(book);
    case 'rtf': return generateRtf(book);
    case 'txt': return new Blob([book.title + '\n' + book.author + '\n\n' + book.blocks.map(b => b.text).join('\n\n')], { type: 'text/plain;charset=utf-8' });
    default: throw new Error('Định dạng không được hỗ trợ: ' + format);
  }
}
