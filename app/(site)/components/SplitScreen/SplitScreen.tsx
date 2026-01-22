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
  const mobileWrapperRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const lastScrollY = useRef(0);

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

    const observerOptions = {
      // Watch for when a section takes up 50% of the screen
      threshold: 0.5,
      root: isMobile ? mobileWrapperRef.current : null,
    };

    const observer = new IntersectionObserver((entries) => {
      // IMPORTANT: If overlay is open, do nothing
      if (overlayOpen) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const slug = entry.target.getAttribute('data-anchor');
          const index = posts.findIndex((p) => p.slug.current === slug);

          if (index !== -1 && index !== activeIndex) {
            setActiveIndex(index);
            
            // Logic to handle URL Hash
            const hash = index === 0 ? '' : `#${slug}`;
            if (window.location.hash !== hash) {
              window.history.replaceState(null, '', hash || window.location.pathname);
            }
          }
        }
      });
    }, observerOptions);

    // Target the elements with the data-anchor attribute
    const sections = document.querySelectorAll(`[data-anchor]`);
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [posts, isMobile, activeIndex, overlayOpen]); // Re-added overlayOpen here

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