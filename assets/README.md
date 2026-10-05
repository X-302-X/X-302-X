# assets

Everything the profile README draws, kept in the repo so the page does not depend on
third-party image hosts.

```
assets/
├── typewriter.svg        animated terminal in the header
├── build.mjs             composes icons/ into rows/
├── icons/                one file per tech, 256x256 each
└── rows/                 generated: the wide strips the README actually embeds
```

## Why rows exist

The README embeds **one image per group of icons**, not one per icon. Five inline `<img>`
tags sit on GitHub's text baseline and drift out of line with each other; a single wide
image is always rendered as one block, so alignment is not a matter of luck.

`build.mjs` composes the row the same way skillicons.dev does it server-side:

```bash
node assets/build.mjs
```

It reads `icons/*.svg` and writes `rows/*.svg`. Regenerate after adding or moving an icon.
The generated files are committed, so nothing has to run in CI.

## Themes

`README.md` and `README.ru.md` wrap each row in `<picture>` with both variants, so GitHub
picks the one matching the reader's theme.

Only icons with a neutral tile carry a `-light` variant — the dark tile is swapped for
`#F4F2ED` and the glyph stays put. Icons with a brand-coloured tile (`rust`, `cpp`, `html`,
`git`) or a transparent background (`css`) look the same in both themes and ship as a
single file. `build.mjs` falls back to the base file when no `-light` variant exists.

## Sources

| Icons | Origin |
| --- | --- |
| `python`, `vscode`, `visualstudio`, `rust`, `cpp`, `html`, `css`, `git` | Vendored from [tandpfun/skill-icons](https://github.com/tandpfun/skill-icons) (MIT) |
| `linux` | Canonical Tux artwork (Larry Ewing, 1996), taken from the CC0 [`logos` icon set](https://github.com/iconify/icon-sets) and fitted onto the skill-icons tile |
| `terminal` | Drawn for this profile |

`terminal` was drawn on purpose: skill-icons has no generic terminal icon, only `bash` and
`powershell`, so the Tools row had nothing to show for Terminal.

Upstream's own Tux was replaced because it spreads its flippers sideways and turns its head,
which reads as a smudge at the size the row is displayed at. The canonical artwork is used
instead of a redraw, and it is not distorted: the 256×295 original is scaled by a single
factor to 177×204 and centred, so the proportions are the author's.

Two notes on fitting it onto the tile:

- its gradients carry ids (`SVGPY0tCbOa` and friends); `build.mjs` prefixes every id with the
  icon name so an inlined row cannot have one icon's gradient bleed into another;
- it comes from a set where tiles are transparent, so it is placed on the usual dark/light
  tile by hand, which is why `linux-dark`/`linux-light` are the only pair that carries a
  full copy of the artwork rather than a tile swap.

## Spec

Everything follows the skill-icons grid so vendored and hand-drawn icons sit seamlessly in
one row:

- canvas `256 × 256`, corner radius `60`;
- tile fill `#242938` (dark) — `#F4F2ED` (light);
- glyph kept inside the `28…228` safe area;
- `40 px` gap between tiles inside a row.

Brand logos remain trademarks of their respective owners.
