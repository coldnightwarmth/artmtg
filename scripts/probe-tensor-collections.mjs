import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "/Users/kyl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);

const TENSOR_GRAPHQL_URL = "https://graphql.tensor.trade/graphql";
const slugs = process.argv.slice(2);
if (!slugs.length) {
  throw new Error("Pass one or more Tensor display slugs to inspect.");
}

const instrumentQuery = `
  query Instrument($slug: String!) {
    instrumentTV2(slug: $slug) {
      id
      slug
      slugDisplay
      name
      symbol
      imageUri
      description
      tokenStandard
      tokenProgram
      compressed
      statsV2 {
        numMints
      }
    }
  }
`;

const collectionMintsQuery = `
  query CollectionMintsV2(
    $slug: String!
    $sortBy: CollectionMintsSortBy!
    $cursor: String
    $limit: Int
  ) {
    collectionMintsV2(
      slug: $slug
      sortBy: $sortBy
      cursor: $cursor
      limit: $limit
    ) {
      mints {
        mint {
          onchainId
          owner
          name
          imageUri
          animationUri
          metadataUri
          files {
            type
            uri
          }
          attributes {
            trait_type
            value
          }
          tokenProgram
          tokenStandard
        }
      }
      page {
        endCursor
        hasMore
      }
    }
  }
`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  for (const slug of slugs) {
    await page.goto(
      `https://www.tensor.trade/trade/${encodeURIComponent(slug)}`,
      { waitUntil: "domcontentloaded", timeout: 60000 },
    );
    await page.waitForTimeout(1000);

    const instrumentPayload = await tensorGraphql(
      page,
      "Instrument",
      instrumentQuery,
      { slug },
    );
    const instrument = instrumentPayload?.data?.instrumentTV2;
    if (!instrument?.slug) {
      throw new Error(`Tensor did not resolve ${slug}`);
    }

    const mintPayload = await tensorGraphql(
      page,
      "CollectionMintsV2",
      collectionMintsQuery,
      {
        slug: instrument.slug,
        sortBy: "OrdinalAsc",
        cursor: null,
        limit: 12,
      },
    );
    const result = mintPayload?.data?.collectionMintsV2;
    console.log(JSON.stringify({
      requestedSlug: slug,
      instrument,
      firstMints: result?.mints?.map((entry) => entry?.mint) || [],
      page: result?.page || null,
    }));
  }
} finally {
  await browser.close();
}

async function tensorGraphql(page, operationName, query, variables) {
  const response = await page.evaluate(async ({
    url,
    operationName: evaluatedOperationName,
    query: evaluatedQuery,
    variables: evaluatedVariables,
  }) => {
    const result = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        operationName: evaluatedOperationName,
        query: evaluatedQuery,
        variables: evaluatedVariables,
      }),
    });
    return {
      ok: result.ok,
      status: result.status,
      text: await result.text(),
    };
  }, {
    url: TENSOR_GRAPHQL_URL,
    operationName,
    query,
    variables,
  });

  let payload = null;
  try {
    payload = JSON.parse(response.text);
  } catch {
    // Report the non-JSON response below.
  }
  if (!response.ok || payload?.errors || !payload) {
    throw new Error(
      `Tensor GraphQL failed (${response.status}): `
      + `${JSON.stringify(payload?.errors || response.text.slice(0, 500))}`,
    );
  }
  return payload;
}
