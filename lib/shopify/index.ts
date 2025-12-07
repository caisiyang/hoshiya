import {
  HIDDEN_PRODUCT_TAG,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS
} from 'lib/constants';
import { isShopifyError } from 'lib/type-guards';
import { ensureStartsWith } from 'lib/utils';
import {
  revalidateTag,
  unstable_cacheTag as cacheTag,
  unstable_cacheLife as cacheLife
} from 'next/cache';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation
} from './mutations/cart';
import { getCartQuery } from './queries/cart';
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery
} from './queries/collection';
import { getMenuQuery } from './queries/menu';
import { getPageQuery, getPagesQuery } from './queries/page';
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery
} from './queries/product';
import {
  Cart,
  Collection,
  Connection,
  Image,
  Menu,
  Page,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyMenuOperation,
  ShopifyPageOperation,
  ShopifyPagesOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyUpdateCartOperation
} from './types';

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, 'https://')
  : '';
const endpoint = domain ? `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}` : '';
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T['variables']
  : never;

export async function shopifyFetch<T>({
  headers,
  query,
  variables
}: {
  headers?: HeadersInit;
  query: string;
  variables?: ExtractVariables<T>;
}): Promise<{ status: number; body: T } | never> {
  try {
    if (!endpoint) {
      throw new Error('SHOPIFY_STORE_DOMAIN environment variable is not set');
    }

    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': key,
        ...headers
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables })
      })
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || 'unknown',
        status: e.status || 500,
        message: e.message,
        query
      };
    }

    throw {
      error: e,
      query
    };
  }
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: '0.0',
      currencyCode: cart.cost.totalAmount.currencyCode
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines)
  };
};

const reshapeCollection = (
  collection: ShopifyCollection
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/search/${collection.handle}`
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`
    };
  });
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants)
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartId = (await cookies()).get('cartId')?.value!;
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines
    }
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = (await cookies()).get('cartId')?.value!;
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds
    }
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const cartId = (await cookies()).get('cartId')?.value!;
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines
    }
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(): Promise<Cart | undefined> {
  const cartId = (await cookies()).get('cartId')?.value;

  if (!cartId) {
    return undefined;
  }

  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId }
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string
): Promise<Collection | undefined> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  try {
    const res = await shopifyFetch<ShopifyCollectionOperation>({
      query: getCollectionQuery,
      variables: {
        handle
      }
    });
    return reshapeCollection(res.body.data.collection);
  } catch (e) {
    console.warn(`Error fetching collection '${handle}':`, e);
    return undefined;
  }
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  'use cache';
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife('days');

  if (!endpoint) {
    console.log(`Skipping getCollectionProducts for '${collection}' - Shopify not configured`);
    return [];
  }

  try {
    const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
      query: getCollectionProductsQuery,
      variables: {
        handle: collection,
        reverse,
        sortKey: sortKey === 'CREATED_AT' ? 'CREATED' : sortKey
      }
    });

    if (!res.body.data.collection) {
      console.log(`No collection found for \`${collection}\``);
      return [];
    }

    return reshapeProducts(
      removeEdgesAndNodes(res.body.data.collection.products)
    );
  } catch (e) {
    console.warn(`Error fetching collection products for '${collection}', using mock:`, e);
    return MOCK_PRODUCTS;
  }
}

export async function getCollections(): Promise<Collection[]> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  if (!endpoint) {
    console.log('Skipping getCollections - Shopify not configured');
    return [
      {
        handle: '',
        title: 'All',
        description: 'All products',
        seo: {
          title: 'All',
          description: 'All products'
        },
        path: '/search',
        updatedAt: new Date().toISOString()
      }
    ];
  }

  try {
    const res = await shopifyFetch<ShopifyCollectionsOperation>({
      query: getCollectionsQuery
    });
    const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
    const collections = [
      {
        handle: '',
        title: 'All',
        description: 'All products',
        seo: {
          title: 'All',
          description: 'All products'
        },
        path: '/search',
        updatedAt: new Date().toISOString()
      },
      // Filter out the `hidden` collections.
      // Collections that start with `hidden-*` need to be hidden on the search page.
      ...reshapeCollections(shopifyCollections).filter(
        (collection) => !collection.handle.startsWith('hidden')
      )
    ];

    return collections;
  } catch (e) {
    console.warn('Error fetching collections:', e);
    return [];
  }
}

export async function getMenu(handle: string): Promise<Menu[]> {
  'use cache';
  cacheTag(TAGS.collections);
  cacheLife('days');

  if (!endpoint) {
    console.log(`Skipping getMenu for '${handle}' - Shopify not configured`);
    return [];
  }

  try {
    const res = await shopifyFetch<ShopifyMenuOperation>({
      query: getMenuQuery,
      variables: {
        handle
      }
    });

    return (
      res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
        title: item.title,
        path: item.url
          .replace(domain, '')
          .replace('/collections', '/search')
          .replace('/pages', '')
      })) || [
        { title: 'All', path: '/search' },
        { title: 'Home', path: '/' }
      ]
    );
  } catch (e) {
    console.warn(`Error fetching menu '${handle}':`, e);
    return [
      { title: 'Home', path: '/' },
      { title: 'All', path: '/search' }
    ];
  }
}

export async function getPage(handle: string): Promise<Page> {
  try {
    const res = await shopifyFetch<ShopifyPageOperation>({
      query: getPageQuery,
      variables: { handle }
    });
    return res.body.data.pageByHandle;
  } catch (e) {
    console.warn(`Error fetching page '${handle}':`, e);
    // @ts-ignore
    return undefined;
  }
}

export async function getPages(): Promise<Page[]> {
  try {
    const res = await shopifyFetch<ShopifyPagesOperation>({
      query: getPagesQuery
    });
    return removeEdgesAndNodes(res.body.data.pages);
  } catch (e) {
    console.warn('Error fetching pages:', e);
    return [];
  }
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('days');

  if (!endpoint) {
    console.log(`Skipping getProduct for '${handle}' - Shopify not configured`);
    return undefined;
  }

  try {
    const res = await shopifyFetch<ShopifyProductOperation>({
      query: getProductQuery,
      variables: {
        handle
      }
    });
    return reshapeProduct(res.body.data.product, false);
  } catch (e) {
    console.warn(`Error fetching product '${handle}':`, e);
    return undefined;
  }
}

export async function getProductRecommendations(
  productId: string
): Promise<Product[]> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('days');

  try {
    const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
      query: getProductRecommendationsQuery,
      variables: {
        productId
      }
    });
    return reshapeProducts(res.body.data.productRecommendations);
  } catch (e) {
    console.warn(`Error fetching recommendations for '${productId}':`, e);
    return [];
  }
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    handle: 'moissanite-eternity-ring',
    availableForSale: true,
    title: 'Moissanite Eternity Ring',
    description: 'A stunning eternity ring featuring brilliant moissanite stones.',
    descriptionHtml: '<p>A stunning eternity ring...</p>',
    options: [],
    priceRange: {
      maxVariantPrice: { amount: '50000', currencyCode: 'JPY' },
      minVariantPrice: { amount: '50000', currencyCode: 'JPY' }
    },
    variants: [],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      altText: 'Moissanite Eternity Ring',
      width: 800,
      height: 800
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
        altText: 'Moissanite Eternity Ring',
        width: 800,
        height: 800
      }
    ],
    seo: { title: 'Moissanite Eternity Ring', description: '' },
    tags: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-2',
    handle: 'solitaire-necklace',
    availableForSale: true,
    title: 'Solitaire Moissanite Necklace',
    description: 'Elegant solitaire pendant necklace.',
    descriptionHtml: '<p>Elegant solitaire pendant necklace.</p>',
    options: [],
    priceRange: {
      maxVariantPrice: { amount: '35000', currencyCode: 'JPY' },
      minVariantPrice: { amount: '35000', currencyCode: 'JPY' }
    },
    variants: [],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=800&q=80',
      altText: 'Solitaire Moissanite Necklace',
      width: 800,
      height: 800
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=800&q=80',
        altText: 'Solitaire Moissanite Necklace',
        width: 800,
        height: 800
      }
    ],
    seo: { title: 'Solitaire Necklace', description: '' },
    tags: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mock-3',
    handle: 'gold-hoop-earrings',
    availableForSale: true,
    title: 'Gold Hoop Earrings',
    description: 'Classic gold hoops for everyday wear.',
    descriptionHtml: '<p>Classic gold hoops...</p>',
    options: [],
    priceRange: {
      maxVariantPrice: { amount: '18000', currencyCode: 'JPY' },
      minVariantPrice: { amount: '18000', currencyCode: 'JPY' }
    },
    variants: [],
    featuredImage: {
      url: 'https://images.unsplash.com/photo-1630019852942-f89202989a51?auto=format&fit=crop&w=800&q=80',
      altText: 'Gold Hoop Earrings',
      width: 800,
      height: 800
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1630019852942-f89202989a51?auto=format&fit=crop&w=800&q=80',
      altText: 'Gold Hoop Earrings',
      width: 800,
      height: 800
    }],
    seo: { title: 'Gold Hoop Earrings', description: '' },
    tags: [],
    updatedAt: new Date().toISOString()
  }
];

export async function getProducts({
  query,
  reverse,
  sortKey
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  'use cache';
  cacheTag(TAGS.products);
  cacheLife('days');

  try {
    const res = await shopifyFetch<ShopifyProductsOperation>({
      query: getProductsQuery,
      variables: {
        query,
        reverse,
        sortKey
      }
    });
    const products = reshapeProducts(removeEdgesAndNodes(res.body.data.products));
    // Return mock if empty (dev mode fallback)
    return products.length > 0 ? products : MOCK_PRODUCTS;
  } catch (e) {
    console.warn('Error fetching products, using mock:', e);
    return MOCK_PRODUCTS;
  }
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    'collections/create',
    'collections/delete',
    'collections/update'
  ];
  const productWebhooks = [
    'products/create',
    'products/delete',
    'products/update'
  ];
  const topic = (await headers()).get('x-shopify-topic') || 'unknown';
  const secret = req.nextUrl.searchParams.get('secret');
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.');
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections, 'seconds');
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products, 'seconds');
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
