import Header from './components/Header/Header'
// import Footer from './components/Footer/Footer'
// import "./globals.scss";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
      {/* <Footer /> */}
    </>
  )
}