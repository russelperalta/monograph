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
      if (!value?.asset?._ref) {
        return null;
      }
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
      return <p className={styles.paragraph}>{children}</p>;},
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
      )
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
  const isScrollingRef = useRef(false);
  const isAnimatingRef = useRef(false);

  // Mobile detect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (posts.length === 0) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      if (overlayOpen || isAnimatingRef.current) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // 1. Only calculate the index if we've moved significantly
      const rawIndex = scrollTop / windowHeight;
      const newIndex = Math.min(Math.round(rawIndex), posts.length - 1);
      const safeIndex = Math.max(0, newIndex);

      // 2. IMPORTANT: Only update state if the index actually changed
      // This prevents React from trying to re-render the list 60 times a second
      if (safeIndex !== activeIndex) {
        setActiveIndex(safeIndex);

        // 3. Only touch the history API if the URL needs to change
        const post = posts[safeIndex];
        if (post) {
          const hash = safeIndex === 0 ? '' : `#${post.slug.current}`;
          const targetPath = hash || window.location.pathname;
          
          // Check if we are already at this hash to avoid excessive calls
          if (window.location.hash !== hash) {
            window.history.replaceState(null, '', targetPath);
          }
        }
      }

      // 4. Snapping logic (Keep this inside the timeout as you had it)
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const distanceFromIndex = Math.abs(rawIndex - safeIndex);
        if (distanceFromIndex > 0.01 && distanceFromIndex < 0.2) {
          // Only snap if we aren't already there
          window.scrollTo({
            top: safeIndex * windowHeight,
            behavior: 'smooth'
          });
        }
      }, 150);
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Ignore clicks on overlay triggers (elements with role="button")
      if (target.closest('[role="button"]')) {
        return;
      }
      
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;
      
      if (anchor && !isAnimatingRef.current) {
        e.preventDefault();
        
        const hash = anchor.hash.slice(1);
        const index = posts.findIndex(post => post.slug.current === hash);
        
        if (index !== -1) {
          const newHash = index === 0 ? '' : `#${hash}`;
          window.history.pushState(null, '', newHash || '/');
          
          isAnimatingRef.current = true;
          setActiveIndex(index);
          
          window.scrollTo({
            top: index * window.innerHeight,
            behavior: 'auto'
          });
          
          setTimeout(() => {
            isAnimatingRef.current = false;
          }, 1000);
        }
      }
    };

    const handleHashChange = () => {
      console.log('Hash changed to:', window.location.hash);
      
      if (isAnimatingRef.current) return;
      if (overlayOpen) return; // Don't handle hash changes when overlay is open
      
      const hash = window.location.hash.slice(1);
      const index = hash 
        ? posts.findIndex(post => post.slug.current === hash)
        : 0;
        
      if (index !== -1) {
        isAnimatingRef.current = true;
        setActiveIndex(index);
        
        window.scrollTo({
          top: index * window.innerHeight,
          behavior: 'auto'
        });
        
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 1000);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('click', handleAnchorClick);
    
    // Initial setup
    const hash = window.location.hash.slice(1);
    const initialIndex = hash 
      ? posts.findIndex(post => post.slug.current === hash)
      : 0;
      
    if (initialIndex !== -1) {
      setTimeout(() => {
        setActiveIndex(initialIndex);
        window.scrollTo({
          top: initialIndex * window.innerHeight,
          behavior: 'auto'
        });
      }, 100);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('click', handleAnchorClick);
      clearTimeout(scrollTimeout);
    };
  }, [posts, overlayOpen]); // Added overlayOpen dependency

  if (!posts || posts.length === 0) {
    return <div style={{ padding: '2rem', color: 'white' }}>No posts to display</div>;
  }

  const totalImagesHeight = (posts.length - 1) * 100;

  // Overlay handlers
  const handleOpenOverlay = (post: PostWithUrl) => {
    // Save the current scroll position before opening overlay
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
  return (
    <>
      {/* Mobile Layout */}
      {isMobile ? (
        <div className={styles.mobileWrapper}>
          {posts.map((post, index) =>   {
            const isContact = post.slug.current ==='contact'
            return (
              <section 
                key={post._id} 
                id={post.slug.current}
                className={styles.mobileSection}
              >
                <div className={styles.mobileContent} style={(post.leftImageUrl || post.leftPreviewImageUrl) ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.4)), url("${post.leftImageUrl || post.leftPreviewImageUrl}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }: undefined}>
                  {index === 0 && (
                    <img src="/images/monograph-logo--white.svg" alt="Monograph Logo" draggable="false" />
                  )}
                  {post.year && <div className={styles.year}>{post.year}</div>}
                  <h2 
                    className={styles.title}
                    onClick={() => handleOpenOverlay(post)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenOverlay(post);
                      }
                    }}
                  >
                    {post.title}
                  </h2>
                  {isContact && (
                    <div className={styles.rightContent}>
                      <PortableText value={post.rightContent} components={portableTextComponents} />
                    </div>
                  )}
                </div>
              </section>
            )
          }
          )}
          {/* Overlay for mobile */}
          <Overlay 
            isOpen={overlayOpen}
            onClose={handleCloseOverlay}
            content={overlayContent || []}
            title={overlayTitle}
            gallery={overlayGallery}
          />
        </div>
      ) : (
        // Desktop Layout
        <div className={styles.wrapper}>
          <div className={styles.container}>
            {/* Left side - Text slides UP (negative) */}
            <div className={styles.leftSide}>
              <div 
                className={styles.leftContainer}
                style={{
                  transform: `translateY(-${activeIndex * 100}vh)`,
                  transition: 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >
                {posts.map((post, index) => (
                  <div key={post._id} id={post.slug.current} className={styles.leftSlide}>
                    {post.leftImageUrl && (
                      <img
                        src={post.leftImageUrl}
                        alt={post.title}
                        className={styles.leftImage}
                      />
                    )}
                    <div className={styles.leftContent} style={post.leftPreviewImageUrl ? {
                      backgroundImage: `linear-gradient(rgba(0,0,0,0) 50%, rgba(0,0,0,0.4)), url("${post.leftPreviewImageUrl}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }: undefined}>
                      {index === 0 && (
                        <img src="/images/monograph-logo--white.svg" alt="Monograph Logo" draggable="false" />
                      )}
                      {post.year && <div className={styles.year}>{post.year}</div>}
                      <h2 
                        className={styles.title}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenOverlay(post);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenOverlay(post);
                          }
                      }}>
                        {post.title}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Images slide DOWN (positive) */}
            <div className={styles.rightSide}>
              <div 
                className={styles.rightContainer}
                style={{
                  transform: `translateY(calc(-${totalImagesHeight}vh + ${activeIndex * 100}vh))`,
                  transition: 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)'
                }}
              >
                {[...posts].reverse().map((post, index) => (
                  <div key={post._id} id={post.slug.current} className={styles.rightSlide}>
                    {post.rightImageUrl && (
                      <img
                        src={post.rightImageUrl}
                        alt={post.title}
                        className={styles.rightImage}
                      />
                    )}
                    {post.rightContent && post.rightContent.length > 0 && (
                      <div className={styles.rightContent}>
                        <PortableText value={post.rightContent} components={portableTextComponents} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Scroll sections */}
          <div className={styles.scrollSections}>
            {posts.map((post, index) => (
              <div 
                key={post._id} 
                className={styles.scrollSection}
                data-anchor={post.slug.current}
              />
            ))}
          </div>
          {/* Overlay */}
          <Overlay 
            isOpen={overlayOpen}
            onClose={handleCloseOverlay}
            content={overlayContent || []}
            title={overlayTitle}
            gallery={overlayGallery}
          />
        </div>
      )}
    </>
  );
}