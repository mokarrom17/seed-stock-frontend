const DashboardHomePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mt-1 text-2xl font-semibold text-seed-text">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-seed-muted">
          Manage your seed inventory and business operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Supplier Due</p>
          <p className="mt-2 text-2xl font-semibold text-seed-text">৳ 0</p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Customer Due</p>
          <p className="mt-2 text-2xl font-semibold text-seed-text">৳ 0</p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Dry Stock</p>
          <p className="mt-2 text-2xl font-semibold text-seed-text">0 KG</p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">This Month Income</p>
          <p className="mt-2 text-2xl font-semibold text-seed-primary">৳ 0</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;
