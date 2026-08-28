import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Pencil, Trash2 } from "lucide-react";

import Button from "../../../components/common/Button";
import Table from "../../../components/common/Table";
import Modal from "../../../components/common/Modal";

const initialPackagingBatches = [
  {
    id: 1,
    date: "2026-05-25",
    season: "BORO",
    seedType: "Paddy",
    package2kgQty: 50,
    package5kgQty: 20,
    package10kgQty: 30,
    availableStock: 845,
  },
  {
    id: 2,
    date: "2026-05-27",
    season: "BORO",
    seedType: "Wheat",
    package2kgQty: 30,
    package5kgQty: 10,
    package10kgQty: 15,
    availableStock: 430,
  },
];

const seasons = ["BORO", "AMON"];

let nextPackagingBatchId = initialPackagingBatches.length + 1;

const emptyValues = {
  date: "",
  season: "BORO",
  seedType: "",
  package2kgQty: "",
  package5kgQty: "",
  package10kgQty: "",
};

const PACKAGING_FORM_ID = "packaging-form";

function calculatePackaging(data) {
  const package2kgQty = Number(data.package2kgQty) || 0;
  const package5kgQty = Number(data.package5kgQty) || 0;
  const package10kgQty = Number(data.package10kgQty) || 0;

  const weight2kg = package2kgQty * 2;
  const weight5kg = package5kgQty * 5;
  const weight10kg = package10kgQty * 10;

  const totalPackedWeight = weight2kg + weight5kg + weight10kg;

  const availableStock = Number(data.availableStock) || 0;

  const remainingStock = availableStock - totalPackedWeight;

  return {
    weight2kg,
    weight5kg,
    weight10kg,
    totalPackedWeight,
    availableStock,
    remainingStock,
  };
}

export default function PackagingPage() {
  const [packagingBatches, setPackagingBatches] = useState(
    initialPackagingBatches,
  );

  const [modalOpen, setModalOpen] = useState(false);

  const [editingBatch, setEditingBatch] = useState(null);

  const packagingForm = useForm({
    defaultValues: emptyValues,
  });

  const watchedValues = useWatch({
    control: packagingForm.control,
  });

  const preview = useMemo(
    () => calculatePackaging(watchedValues),
    [watchedValues],
  );

  const columns = [
    {
      key: "date",
      header: "Date",
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
      render: (row) => `${row.package2kgQty} packs`,
    },

    {
      key: "package5kgQty",
      header: "5 KG",
      render: (row) => `${row.package5kgQty} packs`,
    },

    {
      key: "package10kgQty",
      header: "10 KG",
      render: (row) => `${row.package10kgQty} packs`,
    },

    {
      key: "totalPackedWeight",
      header: "Total",
      render: (row) => {
        const result = calculatePackaging(row);

        return `${result.totalPackedWeight.toLocaleString()} KG`;
      },
    },

    {
      key: "remainingStock",
      header: "Remaining",
      render: (row) => {
        const result = calculatePackaging(row);

        return `${result.remainingStock.toLocaleString()} KG`;
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
            aria-label={`Edit ${row.seedType} packaging entry`}
            title="Edit"
          >
            <Pencil size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            aria-label={`Delete ${row.seedType} packaging entry`}
            title="Delete"
          >
            <Trash2 size={16} strokeWidth={1.8} />
          </button>
        </div>
      ),
    },
  ];

  function handleNewEntry() {
    setEditingBatch(null);
    packagingForm.reset(emptyValues);
    setModalOpen(true);
  }

  function handleEdit(batch) {
    setEditingBatch(batch);

    packagingForm.reset({
      date: batch.date,
      season: batch.season,
      seedType: batch.seedType,
      package2kgQty: batch.package2kgQty,
      package5kgQty: batch.package5kgQty,
      package10kgQty: batch.package10kgQty,
      availableStock: batch.availableStock,
    });

    setModalOpen(true);
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this packaging entry?",
    );

    if (!confirmed) return;

    setPackagingBatches((prev) => prev.filter((batch) => batch.id !== id));
  }

  function onSubmit(data) {
    const package2kgQty = Number(data.package2kgQty) || 0;

    const package5kgQty = Number(data.package5kgQty) || 0;

    const package10kgQty = Number(data.package10kgQty) || 0;

    const availableStock = Number(data.availableStock) || 0;

    const totalPackedWeight =
      package2kgQty * 2 + package5kgQty * 5 + package10kgQty * 10;

    if (totalPackedWeight > availableStock) {
      packagingForm.setError("root", {
        type: "manual",
        message: `Insufficient stock. Available: ${availableStock} KG, Required: ${totalPackedWeight} KG.`,
      });

      return;
    }

    const packagingData = {
      date: data.date,
      season: data.season,
      seedType: data.seedType.trim(),
      package2kgQty,
      package5kgQty,
      package10kgQty,
      availableStock,
    };

    if (editingBatch) {
      setPackagingBatches((prev) =>
        prev.map((batch) =>
          batch.id === editingBatch.id
            ? {
                ...batch,
                ...packagingData,
              }
            : batch,
        ),
      );
    } else {
      const newBatch = {
        id: nextPackagingBatchId++,
        ...packagingData,
      };

      setPackagingBatches((prev) => [...prev, newBatch]);
    }

    packagingForm.reset(emptyValues);
    packagingForm.clearErrors("root");
    setEditingBatch(null);
    setModalOpen(false);
  }

  function handleCancel() {
    packagingForm.reset(emptyValues);
    packagingForm.clearErrors();
    setEditingBatch(null);
    setModalOpen(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-seed-text">Packaging</h1>

          <p className="mt-1 text-sm text-seed-muted">
            Pack dried seeds into 2 KG, 5 KG and 10 KG packages.
          </p>
        </div>

        <Button onClick={handleNewEntry}>+ New Packaging Entry</Button>
      </div>

      {/* Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Packaging Batches</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            {packagingBatches.length}
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">2 KG Packs</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            {packagingBatches
              .reduce((sum, batch) => sum + batch.package2kgQty, 0)
              .toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">5 KG Packs</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            {packagingBatches
              .reduce((sum, batch) => sum + batch.package5kgQty, 0)
              .toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">10 KG Packs</p>

          <p className="mt-2 text-2xl font-semibold text-seed-primary">
            {packagingBatches
              .reduce((sum, batch) => sum + batch.package10kgQty, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-seed-border bg-white">
        <Table
          columns={columns}
          data={packagingBatches}
          emptyMessage="No packaging entries available"
        />
      </div>

      {/* Packaging Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCancel}
        title={editingBatch ? "Edit Packaging Entry" : "New Packaging Entry"}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>

            <Button
              type="submit"
              form={PACKAGING_FORM_ID}
              disabled={preview.totalPackedWeight > preview.availableStock}
            >
              {editingBatch ? "Update" : "Save"}
            </Button>
          </>
        }
      >
        <form
          id={PACKAGING_FORM_ID}
          onSubmit={packagingForm.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Date */}
          <div>
            <label htmlFor="packaging-date" className="label">
              Date
            </label>

            <input
              id="packaging-date"
              type="date"
              {...packagingForm.register("date", {
                required: "Date is required",
              })}
              className="input input-bordered w-full"
            />

            {packagingForm.formState.errors.date && (
              <p className="mt-1 text-sm text-error">
                {packagingForm.formState.errors.date.message}
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
                    {...packagingForm.register("season", {
                      required: true,
                    })}
                    className="radio radio-sm"
                  />

                  {season}
                </label>
              ))}
            </div>
          </div>

          {/* Seed Type */}
          <div>
            <label htmlFor="packaging-seed-type" className="label">
              Seed Type
            </label>

            <input
              id="packaging-seed-type"
              {...packagingForm.register("seedType", {
                required: "Seed type is required",
              })}
              className="input input-bordered w-full"
              placeholder="Example: Paddy, Wheat"
            />

            {packagingForm.formState.errors.seedType && (
              <p className="mt-1 text-sm text-error">
                {packagingForm.formState.errors.seedType.message}
              </p>
            )}
          </div>

          {/* Available Stock */}
          <div>
            <label htmlFor="available-stock" className="label">
              Available Dry Stock (KG)
            </label>

            <input
              id="available-stock"
              type="number"
              min="0"
              step="0.01"
              {...packagingForm.register("availableStock", {
                required: "Available stock is required",
                min: {
                  value: 0,
                  message: "Stock cannot be negative",
                },
              })}
              className="input input-bordered w-full"
              placeholder="0"
            />

            {packagingForm.formState.errors.availableStock && (
              <p className="mt-1 text-sm text-error">
                {packagingForm.formState.errors.availableStock.message}
              </p>
            )}
          </div>

          {/* Package Quantities */}
          <div>
            <p className="label">Package Quantity</p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* 2 KG */}
              <div>
                <label
                  htmlFor="package-2kg"
                  className="mb-1 block text-xs text-seed-muted"
                >
                  2 KG Packs
                </label>

                <input
                  id="package-2kg"
                  type="number"
                  min="0"
                  step="1"
                  {...packagingForm.register("package2kgQty", {
                    min: {
                      value: 0,
                      message: "Quantity cannot be negative",
                    },
                  })}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>

              {/* 5 KG */}
              <div>
                <label
                  htmlFor="package-5kg"
                  className="mb-1 block text-xs text-seed-muted"
                >
                  5 KG Packs
                </label>

                <input
                  id="package-5kg"
                  type="number"
                  min="0"
                  step="1"
                  {...packagingForm.register("package5kgQty", {
                    min: {
                      value: 0,
                      message: "Quantity cannot be negative",
                    },
                  })}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>

              {/* 10 KG */}
              <div>
                <label
                  htmlFor="package-10kg"
                  className="mb-1 block text-xs text-seed-muted"
                >
                  10 KG Packs
                </label>

                <input
                  id="package-10kg"
                  type="number"
                  min="0"
                  step="1"
                  {...packagingForm.register("package10kgQty", {
                    min: {
                      value: 0,
                      message: "Quantity cannot be negative",
                    },
                  })}
                  className="input input-bordered w-full"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Validation Error */}
          {packagingForm.formState.errors.root && (
            <div className="rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">
              {packagingForm.formState.errors.root.message}
            </div>
          )}

          {/* Live Preview */}
          <div className="rounded-xl border border-seed-border bg-seed-background p-4">
            <p className="mb-3 text-sm font-semibold text-seed-text">
              Packaging Preview
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-seed-muted">2 KG</p>

                <p className="mt-1 font-semibold text-seed-text">
                  {preview.weight2kg.toLocaleString()} KG
                </p>
              </div>

              <div>
                <p className="text-seed-muted">5 KG</p>

                <p className="mt-1 font-semibold text-seed-text">
                  {preview.weight5kg.toLocaleString()} KG
                </p>
              </div>

              <div>
                <p className="text-seed-muted">10 KG</p>

                <p className="mt-1 font-semibold text-seed-text">
                  {preview.weight10kg.toLocaleString()} KG
                </p>
              </div>

              <div>
                <p className="text-seed-muted">Total Packed</p>

                <p className="mt-1 font-semibold text-seed-primary">
                  {preview.totalPackedWeight.toLocaleString()} KG
                </p>
              </div>
            </div>

            <div className="mt-3 border-t border-seed-border pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-seed-muted">Available Stock</span>

                <strong>{preview.availableStock.toLocaleString()} KG</strong>
              </div>

              <div className="mt-1 flex items-center justify-between">
                <span className="text-seed-muted">Remaining Stock</span>

                <strong
                  className={
                    preview.remainingStock < 0 ? "text-error" : "text-seed-text"
                  }
                >
                  {preview.remainingStock.toLocaleString()} KG
                </strong>
              </div>
            </div>

            {preview.remainingStock < 0 && (
              <div className="mt-3 rounded-lg bg-error/10 p-3 text-sm font-medium text-error">
                Insufficient dry stock. Please reduce the package quantity.
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
