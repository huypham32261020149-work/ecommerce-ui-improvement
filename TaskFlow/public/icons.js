// Small, local SVG icon set. No network/CDN dependency.
const paths = {
  plus:'M12 5v14M5 12h14', check:'m5 12 4 4L19 6', close:'m6 6 12 12M18 6 6 18',
  search:'M21 21l-4.5-4.5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',
  calendar:'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2',
  clock:'M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
  play:'m8 5 11 7-11 7Z', pause:'M8 5v14M16 5v14', stop:'M6 6h12v12H6z',
  edit:'m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5', trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  repeat:'m17 1 4 4-4 4M3 11V7a2 2 0 0 1 2-2h16M7 23l-4-4 4-4M21 13v4a2 2 0 0 1-2 2H3',
  grip:'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
  chevronLeft:'m15 18-6-6 6-6',chevronRight:'m9 18 6-6-6-6',chevronDown:'m6 9 6 6 6-6',
  flag:'M4 22V3m0 1c5-4 10 4 16 0v10c-6 4-11-4-16 0',
  light:'M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-1 .7-1 2-1 2H9s0-1.3-1-2',
  download:'M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5',upload:'M12 16V4m-5 5 5-5 5 5M5 16v5h14v-5',
  restore:'M3 3v6h6M3 9a9 9 0 1 1-1 7', info:'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  arrow:'M4 12h16m-6-6 6 6-6 6', spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z',
  list:'M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01',
  moon:'M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10',volume:'m11 5-6 4H2v6h3l6 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14',
};
export function icon(name, extra='') {
  return `<svg class="icon ${extra}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.list}"/></svg>`;
}
