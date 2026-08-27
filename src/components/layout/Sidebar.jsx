import {
  LayoutDashboard,
  Sprout,
  Warehouse,
  PackageOpen,
  Store,
  Users,
  TrendingUp,
  Receipt,
  X,
} from "lucide-react";
import { NavLink } from "react-router";
import { paths } from "../../app/paths";

const menuItems = [
  { label: "Dashboard", path: paths.root, icon: LayoutDashboard, end: true },
  { label: "Sourcing", path: paths.sourcing, icon: Sprout },
  { label: "Stock / Drying", path: paths.stock, icon: Warehouse },
  { label: "Packaging", path: paths.packaging, icon: PackageOpen },
  { label: "Sell Point", path: paths.sales, icon: Store },
  { label: "Consumer Ledger", path: paths.consumerLedger, icon: Users },
  { label: "Income", path: paths.income, icon: TrendingUp },
  { label: "Expense", path: paths.expense, icon: Receipt },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col
          border-r border-seed-border bg-white
          transition-transform duration-200
          lg:static lg:z-auto lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-seed-border px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-seed-primary text-white">
              🌱
            </div>
            <div>
              <p className="text-sm font-semibold text-seed-text">Seed Stock</p>
              <p className="text-xs text-seed-muted">Management System</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-seed-muted transition hover:bg-seed-background lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 rounded-lg
                    px-3 py-2.5
                    text-sm font-medium
                    transition-colors
                    ${
                      isActive
                        ? "bg-seed-primary text-white"
                        : "text-seed-text hover:bg-seed-background"
                    }
                    `
                  }
                >
                  <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
