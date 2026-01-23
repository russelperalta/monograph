'use client';

import { useState, useEffect, useRef } from 'react';
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/sanity/lib/image';
import type { PostWithUrl } from '../../page';
import Overlay from '../Overlay/Overlay';
import styles from './SplitScreen.module.scss';

interface SplitScreenScrollProps {
  posts: PostWithUrl[];
}

const portableTextComponents = {
  types: {
    image: ({value}: any) => {
      if (!value?.asset?._ref) return null;
      return (
        <img
          src={urlFor(value).width(800).url()}
          alt={value.alt || ''}
          className={styles.portableImage}
          loading="lazy"
        />
      );
    },
  },
  block: {
    normal: ({children}: any) => {
      if (children.length === 1 && children[0] === '') return null;
      return <p className={styles.paragraph}>{children}</p>;
    },
    h2: ({children}: any) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({children}: any) => <h3 className={styles.h3}>{children}</h3>,
  },
  marks: {
    strong: ({children}: any) => <strong>{children}</strong>,
    em: ({children}: any) => <em>{children}</em>,
    link: ({children, value}: any) => {
      const href = value?.href || '';
      const isContactLink = href.startsWith('mailto:') || href.startsWith('tel:');
      return (
        <a 
          href={href} 
          target={isContactLink ? undefined : "_blank"}
          rel={isContactLink ? undefined : "noopener noreferrer"}
          className={styles.link}
        >
          {children}
        </a>
      );
    },
  },
};

export default function SplitScreenScroll({ posts }: SplitScreenScrollProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [overlayOpen, setOverlayOpen] = useState<boolean>(false);
  const [overlayContent, setOverlayContent] = useState<any>(null);
  const [overlayTitle, setOverlayTitle] = useState<string>('');
  const [overlayGallery, setOverlayGallery] = useState<any[]>([]);
  
  const isAnimatingRef = useRef(false);
  const mobileWrapperRef = useRef<HTMLDivElement>(null);

  // 1. Mobile Detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 2. Observer Logic (Handles Index & URL State)
  useEffect(() => {
    if (posts.length === 0) return;

    const options = {
      root: isMobile ? mobileWrapperRef.current : null,
      threshold: 0.5, 
    };

    const observer = new IntersectionObserver((entries) => {
      if (overlayOpen || isAnimatingRef.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const slug = entry.target.getAttribute('data-anchor');
          const index = posts.findIndex((p) => p.slug.current === slug);

          if (index !== -1 && index !== activeIndex) {
            setActiveIndex(index);
            const hash = index === 0 ? '' : `#${slug}`;
            if (window.location.hash !== hash) {
              window.history.replaceState(null, '', hash || window.location.pathname);
            }
          }
        }
      });
    }, options);

    // Target the specific scroll triggers for Desktop, and Sections for Mobile
    const selector = isMobile ? `.${styles.mobileSection}` : `.${styles.scrollSection}`;
    const sections = document.querySelectorAll(selector);
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [posts, isMobile, activeIndex, overlayOpen]);

  // 3. Desktop Snap Cleanup (Ensures rigid landing)
  useEffect(() => {
    if (isMobile || overlayOpen || isAnimatingRef.current) return;

    const handleSnap = () => {
      const targetScroll = activeIndex * window.innerHeight;
      // If we are within 10px of the top, stay at 0
      if (activeIndex === 0 && window.scrollY < 10) return;

      if (Math.abs(window.scrollY - targetScroll) > 5) {
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    };

    const timeout = setTimeout(handleSnap, 250);
    return () => clearTimeout(timeout);
  }, [activeIndex, isMobile, overlayOpen]);

  // Handlers
  const handleOpenOverlay = (post: PostWithUrl) => {
    setOverlayContent(post.leftContent);
    setOverlayTitle(post.title);
    setOverlayGallery(post.gallery || []);
    setOverlayOpen(true);
  };

  const handleCloseOverlay = () => {
    setOverlayOpen(false);
    setTimeout(() => {
      setOverlayTitle('');
      setOverlayContent([]);
      setOverlayGallery([]); 
    }, 300);
  };

  if (!posts || posts.length === 0) return null;
  const totalImagesHeight = (posts.length - 1) * 100;

  return (
    <>
      {isMobile ? (
        <div className={styles.mobileWrapper} ref={mobileWrapperRef}>
          {posts.map((post, index) => (
            <section 
              key={post._id} 
              id={post.slug.current} // Keeps your ID
              className={styles.mobileSection}
              data-anchor={post.slug.current}
            >
              <div className={styles.mobileContent} style={(post.leftImageUrl || post.leftPreviewImageUrl) ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.4)), url("${post.leftImageUrl || post.leftPreviewImageUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : undefined}>
                {index === 0 && (
                  <img src="/images/monograph-logo--white.svg" alt="Monograph Logo" className={styles.mobileLogo} />
                )}
                {post.year && <div className={styles.year}>{post.year}</div>}
                <h2 className={styles.title} onClick={() => handleOpenOverlay(post)} role="button">
                  {post.title}
                </h2>
                {post.slug.current === 'contact' && (
                  <div className={styles.rightContent}>
                    <PortableText value={post.rightContent} components={portableTextComponents} />
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.leftSide}>
              <div className={styles.leftContainer} style={{ transform: `translateY(-${activeIndex * 100}vh)`, transition: 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)' }}>
                {posts.map((post, index) => (
                  <div key={post._id} id={post.slug.current} className={styles.leftSlide}>
                    {post.leftImageUrl && <img src={post.leftImageUrl} alt={post.title} className={styles.leftImage} />}
                    <div className={styles.leftContent} style={post.leftPreviewImageUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.4)), url("${post.leftPreviewImageUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                      {index === 0 && <img src="/images/monograph-logo--white.svg" alt="Monograph Logo" />}
                      {post.year && <div className={styles.year}>{post.year}</div>}
                      <h2 className={styles.title} onClick={() => handleOpenOverlay(post)} role="button">{post.title}</h2>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.rightSide}>
              <div className={styles.rightContainer} style={{ transform: `translateY(calc(-${totalImagesHeight}vh + ${activeIndex * 100}vh))`, transition: 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)' }}>
                {[...posts].reverse().map((post) => (
                  <div key={post._id} id={post.slug.current} className={styles.rightSlide}>
                    {post.rightImageUrl && <img src={post.rightImageUrl} alt={post.title} className={styles.rightImage} />}
                    {post.rightContent && <div className={styles.rightContent}><PortableText value={post.rightContent} components={portableTextComponents} /></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Invisible Scroll Triggers for Desktop */}
          <div className={styles.scrollSections}>
            {posts.map((post) => (
              <div key={post._id} className={styles.scrollSection} data-anchor={post.slug.current} />
            ))}
          </div>
        </div>
      )}
      <Overlay isOpen={overlayOpen} onClose={handleCloseOverlay} content={overlayContent || []} title={overlayTitle} gallery={overlayGallery} />
    </>
  );
}