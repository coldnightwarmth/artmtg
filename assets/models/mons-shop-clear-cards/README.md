# mons.shop Clear Cards models

Original GLB assets downloaded on 2026-08-03 from the public
[`supermetalmons/shop`](https://github.com/supermetalmons/shop) repository and
verified byte-for-byte against the files served by
[`mons.shop/clear_cards`](https://mons.shop/clear_cards).

Source commit: `1fffb54d7edb67e7e26e1227f91ae276c850ef57`

## Files

- `clear_card_preview.glb` — the model used by the public `/clear_cards` page.
  Live source: `https://mons.shop/clear_card_preview.glb`
  SHA-256: `818d1e2eef901d4d62fc2077b1ed78d148378bc9d6f748f21c5321a05425edc3`
- `clear_card_sample_15.glb` — the alternate/default card model exposed by the
  repository's Clear Cards WIP viewer.
  Live source: `https://mons.shop/clear_card_sample_15.glb`
  SHA-256: `511949bf75f3c1a4de38a573f386baf41c0d4029b22b2dc3154f49c0539ca99a`

Both are self-contained glTF 2.0 binaries with one mesh and one physical
material. They have no external image or buffer dependencies and use Draco
mesh compression plus the clearcoat, transmission, and IOR material extensions.

The upstream repository is released under CC0 1.0 Universal; its license is
included alongside these assets.
