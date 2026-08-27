import { Menu, UserCircle } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-seed-border bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-seed-text hover:bg-seed-background lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={21} />
        </button>

        <div>
          <p className="text-sm font-semibold text-seed-text sm:text-base">
            Seed Stock Management
          </p>

          <p className="hidden text-xs text-seed-muted sm:block">
            Seed inventory and business management
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language switcher will be added in A4 */}

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-2 text-seed-text hover:bg-seed-background"
        >
          <UserCircle size={22} strokeWidth={1.7} />

          <span className="hidden text-sm font-medium sm:inline">Admin</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
