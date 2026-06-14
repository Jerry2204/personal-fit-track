import Link from "next/link"
import { Activity, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-background/80 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">FitTrack Pro</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all active:scale-95"
          >
            Get Started
          </Link>
        </nav>
      </header>
      
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Abstract background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="animate-in fade-in-up duration-700 flex flex-col items-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            <Zap className="mr-2 h-4 w-4" />
            <span className="leading-none">The ultimate fitness OS</span>
          </div>
          
          <h2 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 text-foreground">
            Own your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">fitness journey</span>
          </h2>
          
          <p className="max-w-xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Track workouts, log runs, monitor body progress, and build habits that last — all in one beautifully designed platform.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/25 transition-all hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
            >
              Start tracking for free
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background/50 backdrop-blur-sm px-8 text-base font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-all hover:-translate-y-1 active:scale-95 w-full sm:w-auto"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
