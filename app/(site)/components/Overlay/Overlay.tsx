'use client';

import { useEffect, useRef } from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/react';
import { urlFor } from '@/sanity/lib/image';
import styles from './Overlay.module.scss';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  content: PortableTextBlock[];
  title?: string;
  gallery?: any[];
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
          className={styles.overlayImage}
          loading="lazy"
        />
      );
    },
  },
  block: {
    normal: ({children}: any) => <p className={styles.paragraph}>{children}</p>,
    h1: ({children}: any) => <h1 className={styles.h1}>{children}</h1>,
    h2: ({children}: any) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({children}: any) => <h3 className={styles.h3}>{children}</h3>,
  },
  marks: {
    strong: ({children}: any) => <strong>{children}</strong>,
    em: ({children}: any) => <em>{children}</em>,
    link: ({children, value}: any) => (
      <a 
        href={value?.href} 
        target="_blank" 
        rel="noopener noreferrer"
        className={styles.link}
      >
        {children}
      </a>
    ),
  },
};

export default function Overlay({ isOpen, onClose, content, title, gallery }: OverlayProps) {
  const scrollPositionRef = useRef(0);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen && !wasOpenRef.current) {
      // Opening the overlay
      wasOpenRef.current = true;
      
      // Save scroll position IMMEDIATELY
      scrollPositionRef.current = window.scrollY;
      // console.log('Overlay opening - saved scroll:', scrollPositionRef.current);
      
      // Prevent scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      
      document.addEventListener('keydown', handleEscape);
    } else if (!isOpen && wasOpenRef.current) {
      // Closing the overlay
      wasOpenRef.current = false;
      
      const scrollY = scrollPositionRef.current;
      // console.log('Overlay closing - restoring scroll:', scrollY);
      
      document.removeEventListener('keydown', handleEscape);
      
      // Clear styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      
      // Restore scroll
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
        // console.log('Scroll restored to:', scrollY);
      });
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.overlayContent} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close overlay"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
        </button>

        <div className={styles.scrollContent}>
          {/* Main Content */}
          {title && <h2 className={styles.overlayTitle}>{title}</h2>}
          <PortableText value={content} components={portableTextComponents} />
          {/* Gallery */}
          {gallery && gallery.length > 0 && (
            <div className={styles.galleryGrid}>
                {gallery.map((img, index) => (
                    <div key={index} className={styles.galleryItem}>
                        <img
                            src={urlFor(img).width(800).url()}
                            alt={`${title || 'Gallery'} image ${index + 1}`}
                            className={styles.galleryImage}
                            loading="lazy"
                            draggable="false"
                        />
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}