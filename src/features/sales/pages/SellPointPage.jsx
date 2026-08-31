import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Pencil, Trash2 } from "lucide-react";

import Button from "../../../components/common/Button";
import Table from "../../../components/common/Table";
import Modal from "../../../components/common/Modal";

const seasons = ["BORO", "AMON"];

const initialSales = [
  {
    id: 1,
    date: "2026-08-25",
    consumer: "Rahim Traders",
    season: "BORO",
    seedType: "Paddy",
    package2kgQty: 20,
    package2kgRate: 400,
    package5kgQty: 10,
    package5kgRate: 900,
    package10kgQty: 5,
    package10kgRate: 1700,
    paidAmount: 10000,
  },
  {
    id: 2,
    date: "2026-08-27",
    consumer: "Karim Store",
    season: "AMON",
    seedType: "Wheat",
    package2kgQty: 10,
    package2kgRate: 420,
    package5kgQty: 8,
    package5kgRate: 950,
    package10kgQty: 2,
    package10kgRate: 1750,
    paidAmount: 10000,
  },
];

let nextSaleId = initialSales.length + 1;

const emptyValues = {
  date: "",
  consumer: "",
  season: "BORO",
  seedType: "",

  package2kgQty: "",
  package2kgRate: "",

  package5kgQty: "",
  package5kgRate: "",

  package10kgQty: "",
  package10kgRate: "",

  paidAmount: "",
};

const SELL_FORM_ID = "sell-point-form";

function calculateSale(data) {
  const package2kgQty = Number(data.package2kgQty) || 0;
  const package2kgRate = Number(data.package2kgRate) || 0;

  const package5kgQty = Number(data.package5kgQty) || 0;
  const package5kgRate = Number(data.package5kgRate) || 0;

  const package10kgQty = Number(data.package10kgQty) || 0;
  const package10kgRate = Number(data.package10kgRate) || 0;

  const paidAmount = Number(data.paidAmount) || 0;

  const total2kg = package2kgQty * package2kgRate;
  const total5kg = package5kgQty * package5kgRate;
  const total10kg = package10kgQty * package10kgRate;

  const grandTotal = total2kg + total5kg + total10kg;

  const dueAmount = grandTotal - paidAmount;

  const totalPackageQuantity = package2kgQty + package5kgQty + package10kgQty;

  const totalWeight =
    package2kgQty * 2 + package5kgQty * 5 + package10kgQty * 10;

  return {
    total2kg,
    total5kg,
    total10kg,
    grandTotal,
    paidAmount,
    dueAmount,
    totalPackageQuantity,
    totalWeight,
  };
}

export default function SellPointPage() {
  const [sales, setSales] = useState(initialSales);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingSale, setEditingSale] = useState(null);

  const sellForm = useForm({
    defaultValues: emptyValues,
  });

  const watchedValues = useWatch({
    control: sellForm.control,
  });

  const preview = useMemo(() => calculateSale(watchedValues), [watchedValues]);

  const columns = [
    {
      key: "date",
      header: "Date",
    },

    {
      key: "consumer",
      header: "Consumer",
    },

    {
      key: "season",
      header: "Season",
    },

    {
      key: "seedType",
      header: "Seed Type",
    },

    {
      key: "package2kgQty",
      header: "2 KG",
      render: (row) => `${row.package2kgQty} × ৳${row.package2kgRate}`,
    },

    {
      key: "package5kgQty",
      header: "5 KG",
      render: (row) => `${row.package5kgQty} × ৳${row.package5kgRate}`,
    },

    {
      key: "package10kgQty",
      header: "10 KG",
      render: (row) => `${row.package10kgQty} × ৳${row.package10kgRate}`,
    },

    {
      key: "grandTotal",
      header: "Total",
      render: (row) => {
        const result = calculateSale(row);

        return `৳${result.grandTotal.toLocaleString()}`;
      },
    },

    {
      key: "paidAmount",
      header: "Paid",
      render: (row) => `৳${Number(row.paidAmount).toLocaleString()}`,
    },

    {
      key: "dueAmount",
      header: "Due",
      render: (row) => {
        const result = calculateSale(row);

        return (
          <span
            className={
              result.dueAmount > 0
                ? "font-semibold text-red-600"
                : "font-medium text-seed-text"
            }
          >
            ৳{result.dueAmount.toLocaleString()}
          </span>
        );
      },
    },

    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEdit(row)}
            className="rounded-lg p-2 text-seed-text transition hover:bg-seed-background"
            title="Edit"
            aria-label={`Edit sale for ${row.consumer}`}
          >
            <Pencil size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            title="Delete"
            aria-label={`Delete sale for ${row.consumer}`}
          >
            <Trash2 size={16} strokeWidth={1.8} />
          </button>
        </div>
      ),
    },
  ];

  function handleNewSale() {
    setEditingSale(null);

    sellForm.reset({
      ...emptyValues,
      date: new Date().toISOString().split("T")[0],
    });

    setModalOpen(true);
  }

  function handleEdit(sale) {
    setEditingSale(sale);

    sellForm.reset({
      date: sale.date,
      consumer: sale.consumer,
      season: sale.season,
      seedType: sale.seedType,

      package2kgQty: sale.package2kgQty,
      package2kgRate: sale.package2kgRate,

      package5kgQty: sale.package5kgQty,
      package5kgRate: sale.package5kgRate,

      package10kgQty: sale.package10kgQty,
      package10kgRate: sale.package10kgRate,

      paidAmount: sale.paidAmount,
    });

    setModalOpen(true);
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sale?",
    );

    if (!confirmed) return;

    setSales((prev) => prev.filter((sale) => sale.id !== id));
  }

  function onSubmit(data) {
    const result = calculateSale(data);

    if (result.totalPackageQuantity <= 0) {
      sellForm.setError("root", {
        type: "manual",
        message: "Please enter quantity for at least one package size.",
      });

      return;
    }

    if (result.paidAmount > result.grandTotal) {
      sellForm.setError("paidAmount", {
        type: "manual",
        message: "Paid amount cannot be greater than the total amount.",
      });

      return;
    }

    const saleData = {
      date: data.date,
      consumer: data.consumer.trim(),
      season: data.season,
      seedType: data.seedType.trim(),

      package2kgQty: Number(data.package2kgQty) || 0,
      package2kgRate: Number(data.package2kgRate) || 0,

      package5kgQty: Number(data.package5kgQty) || 0,
      package5kgRate: Number(data.package5kgRate) || 0,

      package10kgQty: Number(data.package10kgQty) || 0,
      package10kgRate: Number(data.package10kgRate) || 0,

      paidAmount: Number(data.paidAmount) || 0,
    };

    if (editingSale) {
      setSales((prev) =>
        prev.map((sale) =>
          sale.id === editingSale.id
            ? {
                ...sale,
                ...saleData,
              }
            : sale,
        ),
      );
    } else {
      const newSale = {
        id: nextSaleId++,
        ...saleData,
      };

      setSales((prev) => [...prev, newSale]);
    }

    sellForm.reset(emptyValues);
    sellForm.clearErrors();
    setEditingSale(null);
    setModalOpen(false);
  }

  function handleCancel() {
    sellForm.reset(emptyValues);
    sellForm.clearErrors();
    setEditingSale(null);
    setModalOpen(false);
  }

  const totalSales = sales.reduce(
    (sum, sale) => sum + calculateSale(sale).grandTotal,
    0,
  );

  const totalPaid = sales.reduce(
    (sum, sale) => sum + Number(sale.paidAmount || 0),
    0,
  );

  const totalDue = totalSales - totalPaid;

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-seed-text">Sell Point</h1>

          <p className="mt-1 text-sm text-seed-muted">
            Record seed sales and track consumer payments.
          </p>
        </div>

        <Button onClick={handleNewSale}>+ New Sale</Button>
      </div>

      {/* Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Total Sales</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            {sales.length}
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Sales Amount</p>

          <p className="mt-2 text-2xl font-semibold text-seed-primary">
            ৳{totalSales.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Collected</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            ৳{totalPaid.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Customer Due</p>

          <p className="mt-2 text-2xl font-semibold text-red-600">
            ৳{totalDue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-seed-border bg-white">
        <Table
          columns={columns}
          data={sales}
          emptyMessage="No sales available"
        />
      </div>

      {/* New / Edit Sale Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCancel}
        title={editingSale ? "Edit Sale" : "New Sale"}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>

            <Button type="submit" form={SELL_FORM_ID}>
              {editingSale ? "Update" : "Save Sale"}
            </Button>
          </>
        }
      >
        <form
          id={SELL_FORM_ID}
          onSubmit={sellForm.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Date */}
          <div>
            <label htmlFor="sale-date" className="label">
              Date
            </label>

            <input
              id="sale-date"
              type="date"
              {...sellForm.register("date", {
                required: "Date is required",
              })}
              className="input input-bordered w-full"
            />

            {sellForm.formState.errors.date && (
              <p className="mt-1 text-sm text-error">
                {sellForm.formState.errors.date.message}
              </p>
            )}
          </div>

          {/* Consumer */}
          <div>
            <label htmlFor="consumer" className="label">
              Consumer
            </label>

            <input
              id="consumer"
              {...sellForm.register("consumer", {
                required: "Consumer is required",
              })}
              className="input input-bordered w-full"
              placeholder="Example: Rahim Traders"
            />

            {sellForm.formState.errors.consumer && (
              <p className="mt-1 text-sm text-error">
                {sellForm.formState.errors.consumer.message}
              </p>
            )}
          </div>

          {/* Season */}
          <div>
            <label className="label">Season</label>

            <div className="flex gap-5">
              {seasons.map((season) => (
                <label key={season} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={season}
                    {...sellForm.register("season")}
                    className="radio radio-sm"
                  />

                  {season}
                </label>
              ))}
            </div>
          </div>

          {/* Seed Type */}
          <div>
            <label htmlFor="sale-seed-type" className="label">
              Seed Type
            </label>

            <input
              id="sale-seed-type"
              {...sellForm.register("seedType", {
                required: "Seed type is required",
              })}
              className="input input-bordered w-full"
              placeholder="Example: Paddy"
            />

            {sellForm.formState.errors.seedType && (
              <p className="mt-1 text-sm text-error">
                {sellForm.formState.errors.seedType.message}
              </p>
            )}
          </div>

          {/* Package Header */}
          <div>
            <p className="mb-2 text-sm font-semibold text-seed-text">
              Package Details
            </p>

            <div className="grid grid-cols-[70px_1fr_1fr] gap-3 px-1 text-xs font-medium text-seed-muted">
              <span>Package</span>
              <span>Quantity</span>
              <span>Rate / Pack</span>
            </div>
          </div>

          {/* 2 KG */}
          <div className="grid grid-cols-[70px_1fr_1fr] items-center gap-3">
            <span className="text-sm font-medium text-seed-text">2 KG</span>

            <input
              type="number"
              min="0"
              step="1"
              placeholder="Qty"
              {...sellForm.register("package2kgQty", {
                min: {
                  value: 0,
                  message: "Quantity cannot be negative",
                },
              })}
              className="input input-bordered w-full"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Rate"
              {...sellForm.register("package2kgRate", {
                min: {
                  value: 0,
                  message: "Rate cannot be negative",
                },
              })}
              className="input input-bordered w-full"
            />
          </div>

          {/* 5 KG */}
          <div className="grid grid-cols-[70px_1fr_1fr] items-center gap-3">
            <span className="text-sm font-medium text-seed-text">5 KG</span>

            <input
              type="number"
              min="0"
              step="1"
              placeholder="Qty"
              {...sellForm.register("package5kgQty", {
                min: {
                  value: 0,
                  message: "Quantity cannot be negative",
                },
              })}
              className="input input-bordered w-full"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Rate"
              {...sellForm.register("package5kgRate", {
                min: {
                  value: 0,
                  message: "Rate cannot be negative",
                },
              })}
              className="input input-bordered w-full"
            />
          </div>

          {/* 10 KG */}
          <div className="grid grid-cols-[70px_1fr_1fr] items-center gap-3">
            <span className="text-sm font-medium text-seed-text">10 KG</span>

            <input
              type="number"
              min="0"
              step="1"
              placeholder="Qty"
              {...sellForm.register("package10kgQty", {
                min: {
                  value: 0,
                  message: "Quantity cannot be negative",
                },
              })}
              className="input input-bordered w-full"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Rate"
              {...sellForm.register("package10kgRate", {
                min: {
                  value: 0,
                  message: "Rate cannot be negative",
                },
              })}
              className="input input-bordered w-full"
            />
          </div>

          {/* Paid Amount */}
          <div>
            <label htmlFor="paid-amount" className="label">
              Paid Amount
            </label>

            <input
              id="paid-amount"
              type="number"
              min="0"
              step="0.01"
              {...sellForm.register("paidAmount", {
                min: {
                  value: 0,
                  message: "Paid amount cannot be negative",
                },
              })}
              className="input input-bordered w-full"
              placeholder="0"
            />

            {sellForm.formState.errors.paidAmount && (
              <p className="mt-1 text-sm text-error">
                {sellForm.formState.errors.paidAmount.message}
              </p>
            )}
          </div>

          {/* Root Error */}
          {sellForm.formState.errors.root && (
            <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
              {sellForm.formState.errors.root.message}
            </div>
          )}

          {/* Live Preview */}
          <div className="rounded-xl border border-seed-border bg-seed-background p-4">
            <p className="mb-3 text-sm font-semibold text-seed-text">
              Sale Summary
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-seed-muted">2 KG Total</span>

                <strong>৳{preview.total2kg.toLocaleString()}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-seed-muted">5 KG Total</span>

                <strong>৳{preview.total5kg.toLocaleString()}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-seed-muted">10 KG Total</span>

                <strong>৳{preview.total10kg.toLocaleString()}</strong>
              </div>

              <div className="border-t border-seed-border pt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Total Weight</span>

                  <strong>{preview.totalWeight.toLocaleString()} KG</strong>
                </div>

                <div className="mt-1 flex justify-between">
                  <span className="font-medium">Grand Total</span>

                  <strong className="text-seed-primary">
                    ৳{preview.grandTotal.toLocaleString()}
                  </strong>
                </div>

                <div className="mt-1 flex justify-between">
                  <span className="text-seed-muted">Paid</span>

                  <strong>৳{preview.paidAmount.toLocaleString()}</strong>
                </div>

                <div className="mt-1 flex justify-between">
                  <span className="text-seed-muted">Due</span>

                  <strong
                    className={
                      preview.dueAmount > 0 ? "text-red-600" : "text-seed-text"
                    }
                  >
                    ৳{preview.dueAmount.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
