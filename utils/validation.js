exports.normalizeUrl = (url) => {
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) return 'https://' + url;
  return url;
};

exports.isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
