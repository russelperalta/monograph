import MobileDebugger from "./components/MobileDebugger/MobileDebugger";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MobileDebugger>
        {children}
      </MobileDebugger>
    </>
  )
}