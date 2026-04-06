function isPathMatch(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

export function getBestActiveHref(pathname: string, hrefs: string[]) {
  const matches = hrefs.filter((href) => isPathMatch(pathname, href));
  if (matches.length === 0) {
    return null;
  }

  matches.sort((a, b) => b.length - a.length);
  return matches[0];
}
