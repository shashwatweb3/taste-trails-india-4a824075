import { Link } from "@tanstack/react-router";
import { Building2, Map, Trophy, Vote } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Map", icon: Map },
  { to: "/rankings", label: "Rankings", icon: Trophy },
  { to: "/vote", label: "Vote", icon: Vote },
  { to: "/cities", label: "Cities", icon: Building2 },
] as const;

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              className="flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium text-muted-foreground"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}