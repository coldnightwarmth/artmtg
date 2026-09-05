import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCardNft2StatusCards,
  buildClearStatusCards,
  buildPonchoStatusCards,
  fetchLiveWalletHoldings,
  testing,
} from "../src/live-data.js";

test("Card NFT 2 live assets replace in-pack status and current mint", () => {
  const cards = buildCardNft2StatusCards([
    {
      id: "pulled-mint",
      content: { metadata: { name: "card 1", attributes: [
        { trait_type: "type", value: "card" },
        { trait_type: "redeemed", value: false },
      ] } },
    },
    {
      id: "receipt-mint",
      content: { metadata: { name: "receipt · card 2", attributes: [
        { trait_type: "type", value: "card receipt" },
        { trait_type: "redeemed", value: true },
      ] } },
    },
  ]);
  assert.equal(cards.length, 11_132);
  assert.deepEqual(cards[0], [1, "pulled", "pulled-mint"]);
  assert.deepEqual(cards[1], [2, "redeemed", "receipt-mint"]);
  assert.deepEqual(cards[2], [3, "in pack", ""]);
  assert.equal(cards.some(([number]) => number === 10_022), false);
});

test("Poncho live assets produce a complete authoritative status snapshot", () => {
  const cards = buildPonchoStatusCards([
    {
      onchainId: "poncho-card-mint",
      name: "Poncho Drifella #201",
      attributes: [{ trait_type: "type", value: "card" }],
    },
    {
      onchainId: "poncho-receipt-mint",
      name: "Poncho Drifella #168 Receipt",
      attributes: [{ trait_type: "type", value: "card receipt" }],
    },
  ]);
  assert.equal(cards.length, 207);
  assert.deepEqual(cards[167], [168, "redeemed", "poncho-receipt-mint"]);
  assert.deepEqual(cards[200], [201, "pulled", "poncho-card-mint"]);
  assert.deepEqual(cards[0], [1, "in pack", ""]);
  assert.equal(testing.LIVE_STATUS_REFRESH_MS, 12 * 60 * 60 * 1000);
});

test("Clear Cards live assets map cards and redemption receipts to catalog numbers", () => {
  const cards = buildClearStatusCards([
    {
      id: "clear-card-mint",
      content: {
        json_uri: "https://cdn.lil.org/nft/clear_cards/json/f1.json",
        metadata: { name: "card 1", attributes: [
          { trait_type: "type", value: "card" },
          { trait_type: "redeemed", value: false },
        ] },
      },
    },
    {
      id: "clear-receipt-mint",
      content: {
        json_uri: "https://cdn.lil.org/nft/clear_cards/json/rf2.json",
        metadata: { name: "receipt · card 2", attributes: [
          { trait_type: "type", value: "card receipt" },
          { trait_type: "redeemed", value: true },
        ] },
      },
    },
    {
      id: "redeemed-clear-card-mint",
      content: {
        json_uri: "https://cdn.lil.org/nft/clear_cards/json/f2.json",
        metadata: { name: "card 2", attributes: [
          { trait_type: "type", value: "card" },
          { trait_type: "redeemed", value: true },
        ] },
      },
    },
  ]);
  assert.equal(cards.length, 192);
  assert.deepEqual(cards[0], [1, "pulled", "clear-card-mint"]);
  assert.deepEqual(cards[1], [2, "redeemed", "clear-receipt-mint"]);
  assert.deepEqual(cards[2], [3, "in pack", ""]);
});

test("wallet holdings include Clear references and owned Swag Pack sticker assets", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options = {}) => {
    const request = options.body ? JSON.parse(options.body) : null;
    if (request?.method === "getAssetsByOwner") {
      return new Response(JSON.stringify({
        result: {
          total: 2,
          items: [{
            id: "new-clear-card-mint",
            grouping: [{
              group_key: "collection",
              group_value: "3fYe95cviaHzka38Q82q64JLhhddKQm37Jt4dQSxPKxz",
            }],
            content: {
              json_uri: "https://cdn.lil.org/nft/clear_cards/json/f192.json",
              metadata: { name: "card 192", attributes: [
                { trait_type: "type", value: "card" },
              ] },
            },
          }, {
            id: "12FHUPi4u9sGyXwVvbJ1QcMNteSVKL4sUE8BJFjdcmta",
            grouping: [{
              group_key: "collection",
              group_value: "C22esis7kQMbX9JGWsMaKvsh1X5GeBmHPju28jiKDyAP",
            }],
            content: {
              metadata: { json_name: "Golem", name: "swag pack" },
              links: { image: "https://gateway.irys.xyz/sticker.png" },
              files: [{ uri: "https://gateway.irys.xyz/sticker.png", mime: "image/png" }],
            },
          }],
        },
      }), { headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: { message: "unavailable" } }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const holdings = await fetchLiveWalletHoldings("wallet-address", {
      HELIUS_RPC_URL: "https://helius.test",
    });
    assert.deepEqual(holdings.mints, [
      "12FHUPi4u9sGyXwVvbJ1QcMNteSVKL4sUE8BJFjdcmta",
      "new-clear-card-mint",
    ]);
    assert.deepEqual(holdings.cardRefs, [["clear", 192, "new-clear-card-mint"]]);
    assert.deepEqual(holdings.swagPackAssets, [{
      mint: "12FHUPi4u9sGyXwVvbJ1QcMNteSVKL4sUE8BJFjdcmta",
      name: "Golem",
      imageUrl: "https://gateway.irys.xyz/sticker.png",
    }]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
