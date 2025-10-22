import React, { useCallback, useLayoutEffect, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  Home, 
  Package, 
  FolderOpen, 
  Tag, 
  ShoppingCart, 
  FileText, 
  Users, 
  BarChart3, 
  TrendingUp, 
  Settings as SettingsIcon,
  FileSearch
} from 'lucide-react';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  displayItemNumbering?: boolean;
  className?: string;
  accentColor?: string;
  isFixed: boolean;
  isOpen?: boolean;
}

export const StaggeredMenu: React.FC<StaggeredMenuProps> = ({
  position = 'left',
  colors = ['#B19EEF', '#5227FF'],
  items = [],
  displayItemNumbering = false,
  className,
  accentColor = '#5227FF',
  isFixed = false,
  isOpen = false
}: StaggeredMenuProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const busyRef = useRef(false);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);

  // Get current path for active state
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  // Function to get icon based on link
  const getIcon = (link: string) => {
    // Icon selalu putih untuk kontras maksimal
    const iconProps = { 
      size: 24, 
      strokeWidth: 2.5, 
      color: '#ffffff'
    };
    
    if (link.includes('/home')) return <Home {...iconProps} />;
    if (link.includes('/products')) return <Package {...iconProps} />;
    if (link.includes('/categories')) return <FolderOpen {...iconProps} />;
    if (link.includes('/discounts')) return <Tag {...iconProps} />;
    if (link.includes('/orders')) return <ShoppingCart {...iconProps} />;
    if (link.includes('/invoices')) return <FileText {...iconProps} />;
    if (link.includes('/students')) return <Users {...iconProps} />;
    if (link.includes('/reports')) return <BarChart3 {...iconProps} />;
    if (link.includes('/price-history')) return <TrendingUp {...iconProps} />;
    if (link.includes('/audit-logs')) return <FileSearch {...iconProps} />;
    if (link.includes('/settings')) return <SettingsIcon {...iconProps} />;
    
    return <Home {...iconProps} />;
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      if (!panel) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
    });
    return () => ctx.revert();
  }, [position]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];

    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.5, ease: 'power4.out' }, i * 0.07);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: { each: 0.1, from: 'start' } },
        itemsStart
      );
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.32,
      ease: 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

        busyRef.current = false;
      }
    });
  }, [position]);

  useEffect(() => {
    if (isOpen) {
      playOpen();
    } else {
      playClose();
    }
  }, [isOpen, playOpen, playClose]);

  return (
    <div
      className={`sm-scope ${isFixed ? 'fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none' : 'w-full h-full'}`}
      style={{ zIndex: 9999 }}
    >
      <div
        className={(className ? className + ' ' : '') + 'staggered-menu-wrapper relative w-full h-full'}
        style={accentColor ? ({ '--sm-accent': accentColor } as React.CSSProperties) : undefined}
        data-position={position}
        data-open={isOpen || undefined}
      >
        <div
          ref={preLayersRef}
          className="sm-prelayers absolute top-0 left-0 bottom-0 pointer-events-none"
          style={{ zIndex: 5 }}
          aria-hidden="true"
        >
          {(() => {
            const raw = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
            const arr = [...raw];
            if (arr.length >= 3) {
              const mid = Math.floor(arr.length / 2);
              arr.splice(mid, 1);
            }
            return arr.map((c, i) => (
              <div
                key={i}
                className="sm-prelayer absolute top-0 left-0 h-full w-full translate-x-0"
                style={{ background: c }}
              />
            ));
          })()}
        </div>

        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel fixed top-0 left-0 h-full flex flex-col p-[8em_2em_2em_2em] overflow-y-auto backdrop-blur-[12px]"
          style={{ 
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: 'var(--color-surface)',
            zIndex: 10,
            pointerEvents: isOpen ? 'auto' : 'none'
          }}
          aria-hidden={!isOpen}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-5">
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-6"
              role="list"
              data-numbering={displayItemNumbering || undefined}
            >
              {items && items.length ? (
                items.map((it, idx) => {
                  const isActive = currentPath === it.link;
                  const icon = getIcon(it.link);
                  return (
                    <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={it.label + idx}>
                      <a
                        className={`sm-panel-item group relative font-semibold text-[3rem] cursor-pointer leading-none tracking-[-1px] uppercase transition-all duration-300 ease-out inline-flex items-center gap-4 no-underline pr-[0.4em] hover:scale-105 hover:translate-x-2 ${isActive ? 'active' : ''}`}
                        style={{ color: 'var(--color-text-primary)' }}
                        href={it.link}
                        aria-label={it.ariaLabel}
                        data-index={idx + 1}
                      >
                        <span className={`sm-panel-itemIcon inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 ${isActive ? 'bg-[var(--color-primary)] bg-opacity-100' : 'bg-[var(--color-primary)] bg-opacity-20 group-hover:bg-opacity-30'}`}>
                          {icon}
                        </span>
                        <span className={`sm-panel-itemLabel inline-block will-change-transform transition-colors duration-300 ${isActive ? 'text-[var(--color-primary)]' : 'group-hover:text-[var(--color-primary)]'}`}>
                          {it.label}
                        </span>
                      </a>
                    </li>
                  );
                })
              ) : (
                <li className="sm-panel-itemWrap relative overflow-hidden leading-none" aria-hidden="true">
                  <span className="sm-panel-item relative font-semibold text-[3rem] cursor-pointer leading-none tracking-[-1px] uppercase transition-all duration-300 ease-linear inline-block no-underline pr-[0.4em]"
                    style={{ color: 'var(--color-text-primary)' }}>
                    <span className="sm-panel-itemLabel inline-block will-change-transform">
                      No items
                    </span>
                  </span>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>

      <style>{`
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; }
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .staggered-menu-panel { position: fixed; top: 0; left: 0; width: clamp(260px, 38vw, 420px); height: 100%; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; flex-direction: column; padding: 8em 2em 2em 2em; overflow-y: auto; }
.sm-scope .sm-prelayers { position: absolute; top: 0; left: 0; bottom: 0; width: clamp(260px, 38vw, 420px); pointer-events: none; }
.sm-scope .sm-prelayer { position: absolute; top: 0; left: 0; height: 100%; width: 100%; transform: translateX(0); }
.sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }
.sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1.5rem; }
.sm-scope .sm-panel-item { position: relative; font-weight: 600; font-size: 3rem; cursor: pointer; line-height: 1; letter-spacing: -1px; text-transform: uppercase; transition: all 0.3s ease-out; display: inline-flex; align-items: center; gap: 1rem; text-decoration: none; padding-right: 0.4em; }
.sm-scope .sm-panel-item::before { content: ''; position: absolute; left: 0; bottom: -4px; width: 0; height: 3px; background: var(--color-primary); transition: width 0.3s ease-out; }
.sm-scope .sm-panel-item:hover::before { width: calc(100% - 0.4em); }
.sm-scope .sm-panel-item.active::before { width: calc(100% - 0.4em); }
.sm-scope .sm-panel-item.active .sm-panel-itemLabel { color: var(--color-primary); }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; transition: color 0.3s ease-out; }
.sm-scope .sm-panel-itemIcon { display: inline-flex; align-items: center; justify-center; width: 3rem; height: 3rem; border-radius: 0.75rem; transition: all 0.3s ease-out; }
@media (max-width: 1024px) { .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; padding: 6em 2em 2em 2em; } .sm-scope .sm-prelayers { width: 100%; } }
@media (max-width: 640px) { 
  .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; padding: 6em 1.5em 2em 1.5em; } 
  .sm-scope .sm-prelayers { width: 100%; } 
  .sm-scope .sm-panel-item { font-size: 2rem; gap: 0.75rem; } 
  .sm-scope .sm-panel-itemIcon { width: 2.5rem; height: 2.5rem; }
  .sm-scope .sm-panel-list { gap: 1.25rem; }
}
      `}</style>
    </div>
  );
};

export default StaggeredMenu;
