import { useMemo, useState } from "react";
import { useResource } from "../../hooks/useResource";
import { useCreatePurchase } from "../../hooks/usePurchases";
import { useSeedTypes } from "../../hooks/useSeedTypes";

const today = () => {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const newItem = () => ({
  rowId: `${Date.now()}-${Math.random()}`,
  seedTypeId: "",
  qualityId: "",
  wetWeightKg: "",
  ratePerKg: "",
});

const money = (value) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const number = (value) => Number(value) || 0;

export default function PurchasePage() {
  const [form, setForm] = useState({
    seasonId: "",
    supplierId: "",
    purchaseDate: today(),
    notes: "",
  });

  const [items, setItems] = useState([newItem()]);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const seasonsQuery = useResource("seasons");
  const suppliersQuery = useResource("suppliers");
  const qualitiesQuery = useResource("qualities");
  const seedTypesQuery = useSeedTypes(form.seasonId);

  const createPurchase = useCreatePurchase();

  const seasons = seasonsQuery.data ?? [];
  const suppliers = suppliersQuery.data ?? [];
  const qualities = qualitiesQuery.data ?? [];
  const seedTypes = seedTypesQuery.data ?? [];

  const activeSeasons = seasons.filter((item) => item.isActive !== false);
  const activeSuppliers = suppliers.filter((item) => item.isActive !== false);

  const totals = useMemo(() => {
    const totalWeight = items.reduce(
      (sum, item) => sum + number(item.wetWeightKg),
      0,
    );

    const grandTotal = items.reduce(
      (sum, item) => sum + number(item.wetWeightKg) * number(item.ratePerKg),
      0,
    );

    return {
      totalWeight,
      grandTotal: Math.round((grandTotal + Number.EPSILON) * 100) / 100,
      itemCount: items.length,
    };
  }, [items]);

  const loadingOptions =
    seasonsQuery.isLoading ||
    suppliersQuery.isLoading ||
    qualitiesQuery.isLoading;

  const optionsError =
    seasonsQuery.isError || suppliersQuery.isError || qualitiesQuery.isError;

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateItem = (rowId, field, value) => {
    setItems((current) =>
      current.map((item) =>
        item.rowId === rowId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addItem = () => {
    setItems((current) => [...current, newItem()]);
  };

  const removeItem = (rowId) => {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((item) => item.rowId !== rowId),
    );
  };

  const resetForm = () => {
    setForm({
      seasonId: "",
      supplierId: "",
      purchaseDate: today(),
      notes: "",
      setSuccessMessage: "",
    });
    setItems([newItem()]);
    setFormError("");
    createPurchase.reset();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("SUBMIT TRIGGERED");
    console.log("Default prevented:", event.defaultPrevented);

    setFormError("");

    if (!form.seasonId || !form.supplierId || !form.purchaseDate) {
      setFormError("Business, Season, Supplier ও Purchase Date নির্বাচন করুন।");
      return;
    }

    if (items.length === 0) {
      setFormError("কমপক্ষে একটি Seed Item যোগ করুন।");
      return;
    }

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (!item.seedTypeId || !item.qualityId) {
        setFormError(`Item ${index + 1}: Seed Type ও Quality নির্বাচন করুন।`);
        return;
      }

      if (
        !Number.isFinite(Number(item.wetWeightKg)) ||
        number(item.wetWeightKg) <= 0
      ) {
        setFormError(
          `Item ${index + 1}: Wet Weight অবশ্যই শূন্যের বেশি হতে হবে।`,
        );
        return;
      }

      if (
        item.ratePerKg === "" ||
        !Number.isFinite(Number(item.ratePerKg)) ||
        number(item.ratePerKg) < 0
      ) {
        setFormError(`Item ${index + 1}: সঠিক Rate per kg দিন।`);
        return;
      }
    }

    const payload = {
      ...form,
      businessId: "seed-stock",
      items: items.map((item) => ({
        seedTypeId: item.seedTypeId,
        qualityId: item.qualityId,
        wetWeightKg: Number(item.wetWeightKg),
        ratePerKg: Number(item.ratePerKg),
      })),
      notes: form.notes.trim(),
    };

    try {
      await createPurchase.mutateAsync(payload);

      setSuccessMessage("Purchase সফলভাবে সংরক্ষণ হয়েছে।");
      setItems([newItem()]);
      setFormError("");
      createPurchase.reset();
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          "Purchase সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
      );
    }
  };

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Inventory Management / Purchases
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              নতুন Purchase
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              সরবরাহকারীর কাছ থেকে কেনা বীজের তথ্য ও মূল্য এন্ট্রি করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            disabled={createPurchase.isPending}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            ফর্ম রিসেট
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            label="মোট আইটেম"
            value={totals.itemCount}
            hint="এই Purchase-এর Seed Items"
            symbol="▤"
          />
          <SummaryCard
            label="মোট ভেজা বীজ"
            value={`${totals.totalWeight.toLocaleString("en-BD", {
              maximumFractionDigits: 2,
            })} kg`}
            hint="Drying-এর আগের ওজন"
            symbol="⚖"
          />
          <SummaryCard
            label="Purchase Total"
            value={money(totals.grandTotal)}
            hint="সব আইটেমের মোট মূল্য"
            symbol="৳"
            highlight
          />
        </div>

        {loadingOptions && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            প্রয়োজনীয় Business, Season, Supplier ও Quality data লোড হচ্ছে...
          </div>
        )}

        {optionsError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Dropdown-এর ডেটা লোড করা যায়নি। JSON Server চালু আছে কি না এবং API
            endpoint পরীক্ষা করুন।
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purchase information */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">
                  ▣
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">
                    Purchase Information
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    ব্যবসা, মৌসুম, সরবরাহকারী ও তারিখ নির্ধারণ করুন।
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
              <div>
                <label className={labelClass}>
                  Season <Required />
                </label>

                <select
                  className={fieldClass}
                  value={form.seasonId}
                  onChange={(event) => {
                    const selectedSeasonId = event.target.value;

                    setForm((previousForm) => ({
                      ...previousForm,
                      seasonId: selectedSeasonId,
                    }));

                    setItems((previousItems) =>
                      previousItems.map((item) => ({
                        ...item,
                        seedTypeId: "",
                        qualityId: "",
                      })),
                    );
                  }}
                  required
                  disabled={loadingOptions || createPurchase.isPending}
                >
                  <option value="">Season নির্বাচন করুন</option>

                  {activeSeasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {season.name} ({season.code})
                    </option>
                  ))}
                </select>

                <p className="text-xs text-red-500">
                  Selected Season ID: {form.seasonId || "EMPTY"}
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Supplier <Required />
                </label>
                <select
                  className={fieldClass}
                  value={form.supplierId}
                  onChange={(event) =>
                    updateForm("supplierId", event.target.value)
                  }
                  required
                  disabled={loadingOptions || createPurchase.isPending}
                >
                  <option value="">Supplier নির্বাচন করুন</option>
                  {activeSuppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                      {supplier.phone ? ` — ${supplier.phone}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Purchase Date <Required />
                </label>
                <input
                  type="date"
                  className={fieldClass}
                  value={form.purchaseDate}
                  onChange={(event) =>
                    updateForm("purchaseDate", event.target.value)
                  }
                  required
                  disabled={createPurchase.isPending}
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className={labelClass}>
                  Notes{" "}
                  <span className="font-normal text-slate-400">(ঐচ্ছিক)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  className={fieldClass}
                  placeholder="যেমন: কৃষকের বাড়ি থেকে সংগ্রহ, পরিবহন বা মান সংক্রান্ত নোট..."
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  disabled={createPurchase.isPending}
                />
              </div>
            </div>
          </section>

          {/* Seed items */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg text-amber-700">
                  ▤
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Seed Items</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    এক Purchase-এ একাধিক জাত ও Quality যোগ করতে পারবেন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={createPurchase.isPending}
                className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
              >
                + আইটেম যোগ করুন
              </button>
            </div>

            {!form.seasonId && (
              <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Seed Type নির্বাচন করার আগে উপরে Season নির্বাচন করুন।
              </div>
            )}

            <div className="space-y-5 p-5 sm:p-6">
              {items.map((item, index) => {
                const selectedSeed = seedTypes.find(
                  (seed) => seed.id === item.seedTypeId,
                );

                const allowedQualities = qualities.filter((quality) =>
                  selectedSeed?.qualityIds?.includes(quality.id),
                );

                const itemTotal =
                  number(item.wetWeightKg) * number(item.ratePerKg);

                return (
                  <div
                    key={item.rowId}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-emerald-700 shadow-sm ring-1 ring-slate-200">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            Seed Item {index + 1}
                          </h3>
                          <p className="text-xs text-slate-500">
                            বীজের জাত, মান ও মূল্য
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.rowId)}
                        disabled={
                          items.length === 1 || createPurchase.isPending
                        }
                        title="আইটেম মুছুন"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ✕ সরান
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className={labelClass}>
                          Seed Type <Required />
                        </label>
                        <select
                          className={fieldClass}
                          value={item.seedTypeId}
                          onChange={(event) => {
                            updateItem(
                              item.rowId,
                              "seedTypeId",
                              event.target.value,
                            );
                            updateItem(item.rowId, "qualityId", "");
                          }}
                          required
                          disabled={
                            !form.seasonId ||
                            seedTypesQuery.isLoading ||
                            createPurchase.isPending
                          }
                        >
                          <option value="">
                            {form.seasonId
                              ? "বীজের জাত নির্বাচন করুন"
                              : "আগে Season নির্বাচন করুন"}
                          </option>
                          {seedTypes
                            .filter((seed) => seed.isActive !== false)
                            .map((seed) => (
                              <option key={seed.id} value={seed.id}>
                                {seed.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Quality <Required />
                        </label>
                        <select
                          className={fieldClass}
                          value={item.qualityId}
                          onChange={(event) =>
                            updateItem(
                              item.rowId,
                              "qualityId",
                              event.target.value,
                            )
                          }
                          required
                          disabled={
                            !item.seedTypeId || createPurchase.isPending
                          }
                        >
                          <option value="">Quality নির্বাচন করুন</option>
                          {allowedQualities.map((quality) => (
                            <option key={quality.id} value={quality.id}>
                              {quality.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>
                          Wet Weight (kg) <Required />
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          inputMode="decimal"
                          placeholder="যেমন 1500"
                          className={fieldClass}
                          value={item.wetWeightKg}
                          onChange={(event) =>
                            updateItem(
                              item.rowId,
                              "wetWeightKg",
                              event.target.value,
                            )
                          }
                          required
                          disabled={createPurchase.isPending}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Rate per kg (৳) <Required />
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          placeholder="যেমন 35"
                          className={fieldClass}
                          value={item.ratePerKg}
                          onChange={(event) =>
                            updateItem(
                              item.rowId,
                              "ratePerKg",
                              event.target.value,
                            )
                          }
                          required
                          disabled={createPurchase.isPending}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3">
                      <div>
                        <p className="text-xs text-slate-500">Item Total</p>
                        <p className="mt-1 text-lg font-bold text-emerald-800">
                          {money(itemTotal)}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {number(item.wetWeightKg).toLocaleString("en-BD")} kg
                        {" × "}
                        {money(item.ratePerKg)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 bg-white px-5 py-5 sm:px-6">
              <div className="ml-auto max-w-md space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>মোট আইটেম</span>
                  <span className="font-semibold text-slate-800">
                    {totals.itemCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>মোট Wet Weight</span>
                  <span className="font-semibold text-slate-800">
                    {totals.totalWeight.toLocaleString("en-BD", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    kg
                  </span>
                </div>
                <div className="border-t border-dashed border-slate-200 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-slate-800">
                      Grand Total
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-800">
                      {money(totals.grandTotal)}
                    </span>
                  </div>
                  <p className="mt-2 text-right text-xs text-slate-500">
                    মোট Wet Weight × Rate per kg; সব আইটেমের যোগফল
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Errors and save */}
          {(formError || createPurchase.isError) && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {formError || "Purchase সংরক্ষণ করা যায়নি।"}
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
            >
              {successMessage}
            </div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={resetForm}
              disabled={createPurchase.isPending}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              বাতিল / রিসেট
            </button>

            <button
              type="submit"
              disabled={
                createPurchase.isPending || loadingOptions || optionsError
              }
            >
              {createPurchase.isPending
                ? "সংরক্ষণ হচ্ছে..."
                : "✓ Purchase সংরক্ষণ করুন"}
            </button>
          </div>

          <p className="text-center text-xs leading-5 text-slate-500">
            Purchase Total কেনার মোট মূল্য। Supplier-কে দেওয়া টাকা আলাদা Payment
            হিসেবে এন্ট্রি হবে।
          </p>
        </form>
      </div>
    </div>
  );
}

function Required() {
  return <span className="text-red-500">*</span>;
}

function SummaryCard({ label, value, hint, symbol, highlight }) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p
            className={`mt-2 break-words text-2xl font-extrabold ${
              highlight ? "text-emerald-800" : "text-slate-900"
            }`}
          >
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{hint}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
            highlight
              ? "bg-white text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {symbol}
        </div>
      </div>
    </div>
  );
}
