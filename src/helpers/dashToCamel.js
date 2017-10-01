function dashToCamel(txt) {
  if (!txt || !txt.split) return txt;

  return txt.split('-').map((word, i) => {
    if (!i) return word;
    return word.length > 1 ? (word[0].toUpperCase() + word.slice(1)) : word
  }).join('');
}

export default dashToCamel;
