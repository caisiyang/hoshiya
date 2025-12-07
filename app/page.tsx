import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import Footer from 'components/layout/footer';
import { getProducts } from 'lib/shopify';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  description: 'HOSHIYA - Fine Jewelry for the Japanese Market.',
  openGraph: {
    type: 'website'
  }
};

export default async function HomePage() {
  const products = await getProducts({});

  return (
    <>
      {/* Hero Section - Luxury Full Width with Overlay */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-neutral-100">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=2669&auto=format&fit=crop"
            alt="Hoshiya Jewelry"
            fill
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center text-white px-4 animate-fadeIn">
          <h1 className="font-serif text-5xl md:text-7xl tracking-[0.1em] uppercase mb-4 drop-shadow-sm">
            Hoshiya
          </h1>
          <p className="text-sm md:text-base font-light tracking-[0.3em] uppercase mb-10 drop-shadow-sm">
            Timeless Elegance &bull; Tokyo
          </p>
          <Link
            href="/search"
            className="px-8 py-3 bg-white/90 text-black text-xs font-bold tracking-[0.25em] uppercase hover:bg-white transition-all hover:scale-105"
          >
            Discover Collection
          </Link>
        </div>
      </section>

      {/* Product Grid - Curated Collection */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-32">
        <div className="flex flex-col items-center mb-16 space-y-4">
          <h2 className="text-2xl font-serif tracking-[0.1em] text-[#1A1A1A]">New Arrivals</h2>
          <div className="w-8 h-[1px] bg-neutral-800/20"></div>
        </div>

        {products?.length > 0 ? (
          <Grid className="grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-6 md:gap-x-12">
            {products.map((product) => (
              <li key={product.handle} className="aspect-[4/5] animate-fadeIn">
                <Link className="relative inline-block h-full w-full group" href={`/product/${product.handle}`}>
                  <GridTileImage
                    alt={product.title}
                    label={{
                      title: product.title,
                      amount: product.priceRange.maxVariantPrice.amount,
                      currencyCode: product.priceRange.maxVariantPrice.currencyCode
                    }}
                    src={product.featuredImage?.url}
                    hoverSrc={product.images[1]?.url}
                    fill
                    sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </Link>
              </li>
            ))}
          </Grid>
        ) : null}
      </section>

      <Footer />
    </>
  );
}
