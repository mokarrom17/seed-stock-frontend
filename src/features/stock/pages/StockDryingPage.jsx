import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Button from "../../../components/common/Button";
import Table from "../../../components/common/Table";
import Modal from "../../../components/common/Modal";
import { Pencil, Trash2 } from "lucide-react";

const initialDryingBatches = [
  {
    id: 1,
    date: "2026-05-20",
    season: "BORO",
    seedType: "Paddy",
    wetWeightIn: 1000,
    dryWeightOut: 845,
  },
  {
    id: 2,
    date: "2026-05-22",
    season: "BORO",
    seedType: "Wheat",
    wetWeightIn: 500,
    dryWeightOut: 430,
  },
];

const seasons = ["BORO", "AMON"];

let nextDryingBatchId = initialDryingBatches.length + 1;

const emptyValues = {
  date: "",
  season: "BORO",
  seedType: "",
  wetWeightIn: "",
  dryWeightOut: "",
};

const DRYING_FORM_ID = "drying-form";

function calculateDrying(wetWeight, dryWeight) {
  const wet = Number(wetWeight) || 0;
  const dry = Number(dryWeight) || 0;

  const loss = Math.max(wet - dry, 0);
  const lossPercentage = wet > 0 ? (loss / wet) * 100 : 0;
  const fullBags = Math.floor(dry / 70);
  const leftoverKg = dry % 70;

  return {
    loss,
    lossPercentage,
    fullBags,
    leftoverKg,
  };
}

export default function StockDryingPage() {
  const [dryingBatches, setDryingBatches] = useState(initialDryingBatches);

  const [modalOpen, setModalOpen] = useState(false);

  const [editingBatch, setEditingBatch] = useState(null);

  const dryingForm = useForm({
    defaultValues: emptyValues,
  });

  const [watchedWetWeight, watchedDryWeight] = useWatch({
    control: dryingForm.control,
    name: ["wetWeightIn", "dryWeightOut"],
  });

  const preview = useMemo(
    () => calculateDrying(watchedWetWeight, watchedDryWeight),
    [watchedWetWeight, watchedDryWeight],
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
      key: "wetWeightIn",
      header: "Wet In",
      render: (row) => `${row.wetWeightIn.toLocaleString()} KG`,
    },

    {
      key: "dryWeightOut",
      header: "Dry Out",
      render: (row) => `${row.dryWeightOut.toLocaleString()} KG`,
    },

    {
      key: "loss",
      header: "Loss",
      render: (row) => {
        const { loss } = calculateDrying(row.wetWeightIn, row.dryWeightOut);

        return `${loss.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} KG`;
      },
    },

    {
      key: "bags",
      header: "70 KG Bags",
      render: (row) => {
        const { fullBags, leftoverKg } = calculateDrying(
          row.wetWeightIn,
          row.dryWeightOut,
        );

        return (
          <div>
            <p className="font-medium">{fullBags} bags</p>

            {leftoverKg > 0 && (
              <p className="text-xs text-seed-muted">
                +{" "}
                {leftoverKg.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                KG loose
              </p>
            )}
          </div>
        );
      },
    },

    // 👇 Actions MUST be here
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleEdit(row)}
            className="rounded-lg p-2 text-seed-text transition hover:bg-seed-background"
            aria-label={`Edit ${row.seedType} drying entry`}
            title="Edit"
          >
            <Pencil size={16} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
            aria-label={`Delete ${row.seedType} drying entry`}
            title="Delete"
          >
            <Trash2 size={16} strokeWidth={1.8} />
          </button>
        </div>
      ),
    },
  ];

  function onSubmit(data) {
    const wetWeightIn = Number(data.wetWeightIn);
    const dryWeightOut = Number(data.dryWeightOut);

    if (editingBatch) {
      setDryingBatches((prev) =>
        prev.map((batch) =>
          batch.id === editingBatch.id
            ? {
                ...batch,
                date: data.date,
                season: data.season,
                seedType: data.seedType.trim(),
                wetWeightIn,
                dryWeightOut,
              }
            : batch,
        ),
      );
    } else {
      const newBatch = {
        id: nextDryingBatchId++,
        date: data.date,
        season: data.season,
        seedType: data.seedType.trim(),
        wetWeightIn,
        dryWeightOut,
      };

      setDryingBatches((prev) => [...prev, newBatch]);
    }

    dryingForm.reset(emptyValues);
    setEditingBatch(null);
    setModalOpen(false);
  }

  function handleCancel() {
    dryingForm.reset(emptyValues);
    setEditingBatch(null);
    setModalOpen(false);
  }

  function handleEdit(batch) {
    setEditingBatch(batch);

    dryingForm.reset({
      date: batch.date,
      season: batch.season,
      seedType: batch.seedType,
      wetWeightIn: batch.wetWeightIn,
      dryWeightOut: batch.dryWeightOut,
    });

    setModalOpen(true);
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this drying entry?",
    );

    if (!confirmed) return;

    setDryingBatches((prev) => prev.filter((batch) => batch.id !== id));
  }

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-seed-text">
            Stock / Drying
          </h1>

          <p className="mt-1 text-sm text-seed-muted">
            Record wet seed drying and track the resulting dry stock.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)}>+ New Drying Entry</Button>
      </div>

      {/* Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Total Wet In</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            {dryingBatches
              .reduce((sum, batch) => sum + batch.wetWeightIn, 0)
              .toLocaleString()}{" "}
            KG
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Total Dry Out</p>

          <p className="mt-2 text-2xl font-semibold text-seed-primary">
            {dryingBatches
              .reduce((sum, batch) => sum + batch.dryWeightOut, 0)
              .toLocaleString()}{" "}
            KG
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Total Loss</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            {dryingBatches
              .reduce(
                (sum, batch) =>
                  sum +
                  calculateDrying(batch.wetWeightIn, batch.dryWeightOut).loss,
                0,
              )
              .toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
            KG
          </p>
        </div>

        <div className="rounded-xl border border-seed-border bg-white p-5">
          <p className="text-sm text-seed-muted">Drying Batches</p>

          <p className="mt-2 text-2xl font-semibold text-seed-text">
            {dryingBatches.length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-seed-border bg-white">
        <Table
          columns={columns}
          data={dryingBatches}
          emptyMessage="No drying entries available"
        />
      </div>

      {/* Add Drying Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCancel}
        title="New Drying Entry"
        actions={
          <>
            <Button type="button" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>

            <Button type="submit" form={DRYING_FORM_ID}>
              Save
            </Button>
          </>
        }
      >
        <form
          id={DRYING_FORM_ID}
          onSubmit={dryingForm.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Date */}
          <div>
            <label htmlFor="drying-date" className="label">
              Date
            </label>

            <input
              id="drying-date"
              type="date"
              {...dryingForm.register("date", {
                required: "Date is required",
              })}
              className="input input-bordered w-full"
            />

            {dryingForm.formState.errors.date && (
              <p className="mt-1 text-sm text-error">
                {dryingForm.formState.errors.date.message}
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
                    {...dryingForm.register("season", {
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
            <label htmlFor="drying-seed-type" className="label">
              Seed Type
            </label>

            <input
              id="drying-seed-type"
              {...dryingForm.register("seedType", {
                required: "Seed type is required",
              })}
              className="input input-bordered w-full"
              placeholder="Example: Paddy, Wheat"
            />

            {dryingForm.formState.errors.seedType && (
              <p className="mt-1 text-sm text-error">
                {dryingForm.formState.errors.seedType.message}
              </p>
            )}
          </div>

          {/* Weights */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="wet-weight-in" className="label">
                Wet Weight In (KG)
              </label>

              <input
                id="wet-weight-in"
                type="number"
                min="0"
                step="0.01"
                {...dryingForm.register("wetWeightIn", {
                  required: "Wet weight is required",
                  min: {
                    value: 0.01,
                    message: "Weight must be greater than 0",
                  },
                })}
                className="input input-bordered w-full"
                placeholder="0"
              />

              {dryingForm.formState.errors.wetWeightIn && (
                <p className="mt-1 text-sm text-error">
                  {dryingForm.formState.errors.wetWeightIn.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="dry-weight-out" className="label">
                Dry Weight Out (KG)
              </label>

              <input
                id="dry-weight-out"
                type="number"
                min="0"
                step="0.01"
                {...dryingForm.register("dryWeightOut", {
                  required: "Dry weight is required",
                  min: {
                    value: 0,
                    message: "Weight cannot be negative",
                  },
                  validate: (value) =>
                    Number(value) <=
                      Number(dryingForm.getValues("wetWeightIn")) ||
                    "Dry weight cannot exceed wet weight",
                })}
                className="input input-bordered w-full"
                placeholder="0"
              />

              {dryingForm.formState.errors.dryWeightOut && (
                <p className="mt-1 text-sm text-error">
                  {dryingForm.formState.errors.dryWeightOut.message}
                </p>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="rounded-xl border border-seed-border bg-seed-background p-4">
            <p className="mb-3 text-sm font-semibold text-seed-text">
              Drying Preview
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-seed-muted">Loss</p>

                <p className="mt-1 font-semibold text-seed-text">
                  {preview.loss.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  KG
                </p>
              </div>

              <div>
                <p className="text-seed-muted">Loss %</p>

                <p className="mt-1 font-semibold text-seed-text">
                  {preview.lossPercentage.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-seed-muted">Full Bags</p>

                <p className="mt-1 font-semibold text-seed-text">
                  {preview.fullBags}
                </p>
              </div>

              <div>
                <p className="text-seed-muted">Leftover</p>

                <p className="mt-1 font-semibold text-seed-text">
                  {preview.leftoverKg.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  KG
                </p>
              </div>
            </div>

            <div className="mt-3 border-t border-seed-border pt-3 text-sm">
              <span className="text-seed-muted">Result:</span>{" "}
              <strong>{preview.fullBags} × 70 KG bags</strong>
              {preview.leftoverKg > 0 && (
                <>
                  {" "}
                  +{" "}
                  <strong>
                    {preview.leftoverKg.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    KG loose
                  </strong>
                </>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
