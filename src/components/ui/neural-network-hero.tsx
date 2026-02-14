'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface HeroProps {
    title: string;
    description: string;
    badgeText?: string;
    badgeLabel?: string;
    ctaButtons?: Array<{ text: string; href: string; primary?: boolean }>;
    microDetails?: Array<string>;
}

export default function NeuralNetworkHero({
    title,
    description,
    badgeText = "Generative Surfaces",
    badgeLabel = "New",
    ctaButtons = [
        { text: "Get started", href: "#get-started", primary: true },
        { text: "View showcase", href: "#showcase" }
    ],
    microDetails = ["Low‑weight font", "Tight tracking", "Subtle motion"]
}: HeroProps) {
    const sectionRef = useRef<HTMLElement | null>(null);
    const headerRef = useRef<HTMLHeadingElement | null>(null);
    const paraRef = useRef<HTMLParagraphElement | null>(null);
    const ctaRef = useRef<HTMLDivElement | null>(null);
    const badgeRef = useRef<HTMLDivElement | null>(null);
    const microItem1Ref = useRef<HTMLLIElement | null>(null);
    const microItem2Ref = useRef<HTMLLIElement | null>(null);
    const microItem3Ref = useRef<HTMLLIElement | null>(null);

    useGSAP(
        () => {
            if (!headerRef.current) return;

            // Fallback for SplitText
            const splitLines = headerRef.current.querySelectorAll('.line-animate');

            gsap.set(splitLines.length ? splitLines : headerRef.current, {
                filter: 'blur(16px)',
                yPercent: 30,
                autoAlpha: 0,
                scale: 1.06,
                transformOrigin: '50% 100%',
            });

            if (badgeRef.current) {
                gsap.set(badgeRef.current, { autoAlpha: 0, y: -8 });
            }
            if (paraRef.current) {
                gsap.set(paraRef.current, { autoAlpha: 0, y: 8 });
            }
            if (ctaRef.current) {
                gsap.set(ctaRef.current, { autoAlpha: 0, y: 8 });
            }
            const microItems = [microItem1Ref.current, microItem2Ref.current, microItem3Ref.current].filter(Boolean);
            if (microItems.length > 0) {
                gsap.set(microItems, { autoAlpha: 0, y: 6 });
            }

            const tl = gsap.timeline({
                defaults: { ease: 'power3.out' },
            });

            if (badgeRef.current) {
                tl.to(badgeRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.0);
            }

            tl.to(
                splitLines.length ? splitLines : headerRef.current,
                {
                    filter: 'blur(0px)',
                    yPercent: 0,
                    autoAlpha: 1,
                    scale: 1,
                    duration: 0.9,
                    stagger: 0.15,
                },
                0.1,
            );

            if (paraRef.current) {
                tl.to(paraRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.55');
            }
            if (ctaRef.current) {
                tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.35');
            }
            if (microItems.length > 0) {
                tl.to(microItems, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.25');
            }
        },
        { scope: sectionRef },
    );

    return (
        <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-[hsl(224,71%,2%)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-40" />

            <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 pb-24 pt-36 sm:gap-10 sm:pt-44 md:px-10 lg:px-16">
                <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-white/70">{badgeLabel}</span>
                    <span className="h-1 w-1 rounded-full bg-white/40" />
                    <span className="text-xs font-light tracking-wide text-white/90">{badgeText}</span>
                </div>

                <h1 ref={headerRef} className="max-w-4xl text-left text-5xl font-light leading-[1.2] tracking-wide text-white sm:text-6xl md:text-7xl">
                    {title.split('\n').map((line, i) => (
                        <span key={i} className="block line-animate whitespace-nowrap">{line}</span>
                    ))}
                </h1>

                <p ref={paraRef} className="max-w-2xl text-left text-lg font-light leading-relaxed tracking-wide text-white/80 sm:text-xl">
                    {description}
                </p>

                <div ref={ctaRef} className="flex flex-wrap items-center gap-6 pt-4">
                    {ctaButtons.map((button, index) => (
                        <a
                            key={index}
                            href={button.href}
                            className={`rounded-full border border-white/10 px-8 py-4 text-sm font-medium tracking-wide transition-all duration-300 ${button.primary
                                ? "bg-white text-black hover:bg-gray-200 hover:scale-105"
                                : "text-white hover:bg-white/10 hover:border-white/30"
                                }`}
                        >
                            {button.text}
                        </a>
                    ))}
                </div>

                <ul className="mt-12 flex flex-wrap gap-8 text-xs font-light tracking-widest text-white/50 uppercase">
                    {microDetails.map((detail, index) => {
                        const refMap = [microItem1Ref, microItem2Ref, microItem3Ref];
                        return (
                            <li key={index} ref={refMap[index] as any} className="flex items-center gap-3">
                                <span className="h-1 w-1 rounded-full bg-blue-500/50" /> {detail}
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[hsl(224,71%,2%)] to-transparent" />
        </section>
    );
}
