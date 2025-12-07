import CartModal from 'components/cart/modal';
import LogoSquare from 'components/logo-square';
import { getMenu } from 'lib/shopify';
import { Menu } from 'lib/shopify/types';
import Link from 'next/link';
import { Suspense } from 'react';
import MobileMenu from './mobile-menu';
import Search, { SearchSkeleton } from './search';
import Image from 'next/image';
import StickyNavbar from './sticky-navbar';

const { SITE_NAME } = process.env;


export async function Navbar() {
  const menu = await getMenu('next-js-frontend-header-menu');

  return (
    <StickyNavbar>
      {/* Left: Mobile Menu & Desktop Links */}
      <div className="flex w-1/3 items-center gap-6">
        <div className="block flex-none lg:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>

        {/* Desktop Links - Luxury Minimalist */}
        <div className="hidden lg:block">
          {menu.length ? (
            <ul className="flex gap-8 text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-600">
              {menu.map((item: Menu) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="hover:text-black transition-colors duration-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Center: Brand Logo */}
      <div className="flex w-1/3 justify-center">
        <Link
          href="/"
          prefetch={true}
          className="flex flex-col items-center justify-center gap-1 group"
        >
          {/* Logo - Scale on hover */}
          <div className="relative h-8 w-auto">
            <Image
              src="/logo.png"
              alt={SITE_NAME || 'HOSHIYA'}
              width={32}
              height={32}
              className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="text-xl font-serif tracking-widest uppercase text-black">
            {SITE_NAME}
          </div>
        </Link>
      </div>

      {/* Right: Search & Cart */}
      <div className="flex w-1/3 justify-end items-center gap-4">
        <div className="hidden md:block w-32 opacity-0 hover:opacity-100 transition-opacity duration-300">
          {/* Search hidden by default for minimalism, show on hover? Or just keep it. 
             User said 'icons: thin, elegant outline'. 
             For now keep search but maybe make it icon only if possible. 
             Let's keep structure but hide text input visually if possible or just minimalist. */}
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
        <CartModal />
      </div>
    </StickyNavbar>
  );
}
