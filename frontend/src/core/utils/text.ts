export function cleanText(input: string | undefined | null): string {
  if (!input) return '';

  let text = input;

  text = text.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/&nbsp;/gi, ' ');
  text = text.replace(/&lt;/gi, '<');
  text = text.replace(/&gt;/gi, '>');
  text = text.replace(/&amp;/gi, '&');
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&#x[0-9a-fA-F]+;|&#\d+;/gi, ' ');

  const boilerplatePatterns = [
    /cookie\s*(policy|notice|consent).*?$/gim,
    /privacy\s*policy.*?$/gim,
    /terms\s*(of\s*use|service).*?$/gim,
    /all\s*rights\s*reserved.*?$/gim,
    /powered\s*by.*?$/gim,
    /subscribe\s*to.*?$/gim,
    /follow\s*us\s*(on|at).*?$/gim,
    /share\s*this\s*job.*?$/gim,
    /back\s*to\s*(top|search).*?$/gim,
    /home\s*page\s*of.*?$/gim,
    /site\s*map.*?$/gim,
    /click\s*here\s*(to|for).*?$/gim,
    /read\s*more.*?$/gim,
    /view\s*all\s*jobs.*?$/gim,
    /browse\s*jobs.*?$/gim,
    /sign\s*in\s*or\s*register.*?$/gim,
    /login\s*(here|to|required).*?$/gim,
    /create\s*alert.*?$/gim,
    /save\s*(this\s*)?job.*?$/gim,
    /email\s*me\s*jobs.*?$/gim,
    /similar\s*jobs.*?$/gim,
    /related\s*jobs.*?$/gim,
    /you\s*may\s*also\s*be\s*interested.*?$/gim,
    /recommended\s*for\s*you.*?$/gim,
    /sponsored\s*listing.*?$/gim,
    /advertisement.*?$/gim,
    /google\s*(ads|analytics|tag\s*manager).*?$/gim,
    /facebook\s*pixel.*?$/gim,
    /linkedin\s*tracking.*?$/gim,
    /utm_\w+=[^&\s]+/gi,
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    /\[?https?:\/\/[^\s\]\)]+/gi,
    /\[?email\s*(protected|redacted)[^\s]*\]?/gi,
    /\[?phone\s*(number|protected|redacted)[^\s]*\]?/gi,
  ];

  for (const pattern of boilerplatePatterns) {
    text = text.replace(pattern, '');
  }

  const lines = text.split(/\n+/).map((line) => line.trim()).filter((line) => line.length > 0);
  const uniqueLines = lines.filter((line, index, self) => {
    const normalized = line.toLowerCase().replace(/\s+/g, ' ').trim();
    return index === self.findIndex((l) => l.toLowerCase().replace(/\s+/g, ' ').trim() === normalized);
  });

  text = uniqueLines.join('\n\n');

  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}
