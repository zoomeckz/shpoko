import shpokoMascot from "@/assets/shpoko-mascot.png";

// Shown in place of the old lesson path while the new course is being built.
export const ComingSoonPath = () => (
  <div className="flex flex-col items-center py-10 gap-8">
    <div className="w-full rounded-2xl bg-primary px-6 py-4 text-primary-foreground shadow-[0_4px_0_0_hsl(var(--primary-dark))]">
      <p className="text-xs font-extrabold uppercase tracking-widest opacity-80">Section 1</p>
      <p className="text-xl font-extrabold">The Cyrillic alphabet</p>
    </div>

    <div className="duo-card w-full p-8 text-center">
      <img src={shpokoMascot} alt="" className="w-28 h-28 mx-auto object-contain" />
      <h2 className="mt-4 text-2xl font-extrabold text-foreground">New lessons are on the way</h2>
      <p className="mt-2 text-muted-foreground font-semibold">
        We're rebuilding the course from the very first letter. Check back soon!
      </p>
    </div>
  </div>
);
