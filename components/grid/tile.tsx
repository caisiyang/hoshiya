import clsx from 'clsx';
import Image from 'next/image';


export function GridTileImage({
  isInteractive = true,
  active,
  label,
  hoverSrc,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: 'bottom' | 'center';
  };
  hoverSrc?: string;
} & React.ComponentProps<typeof Image>) {
  return (
    <div
      className={clsx(
        'group flex h-full w-full flex-col gap-3 overflow-hidden bg-transparent',
        {
          relative: label
        }
      )}
    >
      {props.src ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
          <Image
            className={clsx('relative h-full w-full object-cover transition duration-500 ease-in-out', {
              'group-hover:scale-105': isInteractive
            })}
            {...props}
          />
          {hoverSrc ? (
            <Image
              fill
              src={hoverSrc}
              alt={props.alt || ""}
              className={clsx('absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100', {
                'group-hover:scale-105': isInteractive
              })}
              sizes={props.sizes}
            />
          ) : null}
        </div>
      ) : null}

      {label ? (
        <div className="flex flex-col items-center text-center gap-1">
          <h3 className="text-sm font-serif tracking-widest text-[#333] dark:text-white uppercase line-clamp-1">
            {label.title}
          </h3>
          <div className="text-xs text-neutral-500 font-sans tracking-wide">
            {label.amount} {label.currencyCode}
          </div>
        </div>
      ) : null}
    </div>
  );
}
