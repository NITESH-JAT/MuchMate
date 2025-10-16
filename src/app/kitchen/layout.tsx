import { UtensilsCrossed } from "lucide-react";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 z-10">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="font-headline">MunchMate Kitchen</span>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </div>
  );
}
