"use client"

import { useState, useEffect, useRef } from 'react'
import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import styles from './Header.module.scss'

interface Post {
    title: string
    slug: { current: string }
    order: number
}

export default function Header() {
    const [posts, setPosts] = useState<Post[]>([])
    const [activeSlug, setActiveSlug] = useState<string>('')
    const [isScrolled, setIsScrolled] = useState<boolean>(false)
    // const scrollTimeoutRef = useRef<NodeJS.Timeout>()
    const scrollTimeoutRef = useRef<number | null>(null)

    useEffect(() => {
        const fetchPosts = async () => {
            const data = await client.fetch(`
                *[_type == "post"] | order(order asc, publishedAt desc) {
                    title,
                    slug,
                    order
                }    
            `)
            setPosts(data)
        }
        fetchPosts()
    }, [])

    useEffect(() => {
        const updateActiveSlug = () => {
            const hash = window.location.hash.slice(1)
            // If no hash (at root), set to first post's slug
            if (hash) {
                setActiveSlug(hash)
            } else if (posts.length > 0) {
                setActiveSlug(posts[0].slug.current)
            }
        }

        const handleScroll = () => {
            if (posts.length === 0) return
            
            const scrollTop = window.scrollY
            const windowHeight = window.innerHeight
            
            // Add scrolled class when past 50% of first section
            setIsScrolled(scrollTop > windowHeight * 0.5)
            
            // Clear existing timeout
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }
            
            // Debounce the active slug update
            scrollTimeoutRef.current = window.setTimeout(() => {
                const newIndex = Math.min(
                    Math.round(scrollTop / windowHeight),
                    posts.length - 1
                )
                
                const currentPost = posts[Math.max(0, newIndex)]
                if (currentPost) {
                    setActiveSlug(currentPost.slug.current)
                }
            }, 100)
        }

        // Set initial active
        updateActiveSlug()

        // Listen for hash changes
        window.addEventListener('hashchange', updateActiveSlug)
        // Listen for scroll
        window.addEventListener('scroll', handleScroll, { passive: true })
        // Check initial scroll position
        handleScroll()
        
        return () => {
            window.removeEventListener('hashchange', updateActiveSlug)
            window.removeEventListener('scroll', handleScroll)
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current)
            }
        }
    }, [posts])

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string, index: number) => {
        e.preventDefault()
        setActiveSlug(slug)
        
        // Update URL
        window.history.pushState(null, '', `#${slug}`)
        
        // Scroll to section
        const windowHeight = window.innerHeight
        window.scrollTo({
            top: index * windowHeight,
            behavior: 'smooth'
        })
    }
    const navPosts = posts.slice(1)

    return (
        <header className={styles.nav}>
            <div className={`${styles.logo} ${isScrolled ? styles.scrolled : ''}`}>
                <Link href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54.6 54.6">
                        <path d="M0 0v54.6h54.6V0H0Zm45.4 40.5h-4.8V19.7h-7c-2 0-3.7 1.6-3.7 3.7v17.1h-5V23.4c0-2-1.6-3.7-3.7-3.7h-7v20.8h-5V14.1h36.2v26.4Z"/>
                    </svg>
                </Link>
            </div>
            <ul className={styles.navItems}>
                {navPosts.map((post, index) => (
                    <li key={post.slug.current}>
                        <Link
                            href={`#${post.slug.current}`}
                            className={activeSlug === post.slug.current ? styles.active : ''}
                            onClick={(e) => handleNavClick(e, post.slug.current, index + 1)}
                        >
                            {/* {post.order} */}
                            {(index + 1).toString().padStart(2, '0')}
                        </Link>
                    </li>
                ))}
            </ul>
        </header>
    )
}