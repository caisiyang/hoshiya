import Link from 'next/link';
import FooterMenu from 'components/layout/footer-menu';
import { getMenu } from 'lib/shopify';
import { Suspense } from 'react';
import { ShieldCheckIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Trust Badges

const { COMPANY_NAME, SITE_NAME } = process.env;

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '');
  const menu = await getMenu('next-js-frontend-footer-menu');
  const copyrightName = COMPANY_NAME || SITE_NAME || '';

  return (
    <footer className="bg-[#FAFAF9] border-t border-neutral-200 text-[#1A1A1A] pt-16 pb-8">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Column 1: Brand & Ethos */}
          <div className="flex flex-col gap-6">
            <Link className="flex items-center gap-2 text-black" href="/">
              <span className="uppercase text-2xl font-serif tracking-[0.15em]">{SITE_NAME}</span>
            </Link>
            <p className="text-xs font-light tracking-wide text-neutral-500 leading-relaxed max-w-xs">
              Handcrafted with precision in Tokyo using only ethically sourced materials.
              Elevating the everyday with timeless light luxury.
            </p>
          </div>

          {/* Column 2: Shop Menu */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-2">Shop</h3>
            <Suspense fallback={null}>
              <FooterMenu menu={menu} />
            </Suspense>
          </div>

          {/* Column 3: Legal & Help */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-2">Legal From Japan</h3>
            <ul className="flex flex-col gap-3 text-xs tracking-wide text-neutral-500">
              <li>
                <Link href="/policies/legal-notice" className="hover:text-black transition-colors">
                  特定商取引法に基づく表記
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy-policy" className="hover:text-black transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-black transition-colors">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-2">Newsletter</h3>
            <p className="text-xs text-neutral-500 tracking-wide">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="flex items-end gap-2 mt-2 w-full max-w-xs">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-transparent border-b border-neutral-300 py-2 text-sm focus:outline-hidden focus:border-black transition-colors placeholder:text-neutral-400 placeholder:font-light"
              />
              <button
                type="submit"
                className="text-xs font-bold uppercase tracking-widest border-b border-black pb-2 hover:text-neutral-600 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-neutral-200 pt-8 pb-8 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-neutral-500">
          <div className="flex items-center gap-3">
            <TruckIcon className="h-5 w-5 stroke-1" />
            <span className="text-xs tracking-widest uppercase">Free Shipping over ¥20,000</span>
          </div>
          <div className="flex items-center gap-3">
            <ArrowPathIcon className="h-5 w-5 stroke-1" />
            <span className="text-xs tracking-widest uppercase">30-Day Returns</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-5 w-5 stroke-1" />
            <span className="text-xs tracking-widest uppercase">Secure Checkout</span>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="border-t border-neutral-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-400 font-light tracking-wide uppercase">
          <p>
            &copy; {copyrightDate} {copyrightName}. All rights reserved.
          </p>
          <div className="flex gap-4 opacity-50">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>JCB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
