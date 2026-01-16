import Link from 'next/link'
import styles from './Footer.module.scss'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <ul className={styles.footerItems}>
                <li>
                    <Link href="#">FAQ</Link>
                </li>
                <li>
                    <Link href="/about">About</Link>
                </li>
            </ul>
        </footer>
    )
}