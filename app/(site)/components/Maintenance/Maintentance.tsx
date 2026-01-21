"use client"
import Link from 'next/link'
import styles from './Maintenance.module.scss'

export default function Maintenance() {
    return (
        <section className={styles.section}>
            <Link className={styles.logo} href="#">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36.2 26.4"><path d="M0 0v26.4h5V5.6h7c2.1 0 3.7 1.7 3.7 3.7v17.1h5V9.3c0-2.1 1.7-3.7 3.7-3.7h7v20.8h4.8V0H0Z" style={{fill:'#fff'}}/></svg>
            </Link>
            <p className={styles.text}>Coming soon</p>
            <ul className={styles.links}>
                <li>
                    <Link href="https://www.instagram.com/monograph_">Instagram</Link>
                </li>
                <li>
                    <Link href="mailto:hello@monograph.am">Email</Link>
                </li>
            </ul>
        </section>
    )
}