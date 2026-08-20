import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">
            BIRYANI <span className="text-primary">INDEX</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            India&apos;s biryani rankings, powered by the people. Every number on this site comes
            from a real vote or a real review.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow text-muted-foreground">The Index</p>
          <Link to="/rankings" className="block text-muted-foreground hover:text-foreground">
            National rankings
          </Link>
          <Link to="/cities" className="block text-muted-foreground hover:text-foreground">
            Cities
          </Link>
          <Link to="/compare" className="block text-muted-foreground hover:text-foreground">
            Head to head
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="eyebrow text-muted-foreground">How ranking works</p>
          <p className="text-muted-foreground">
            Cities are ranked by a confidence-adjusted score built from community votes and ratings.
            A city stays unranked until real people vote for it.
          </p>
        </div>
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Biryani Index
      </div>
    </footer>
  );
}