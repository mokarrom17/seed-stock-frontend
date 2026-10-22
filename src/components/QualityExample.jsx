import { useResource, useUpdateResource } from "../hooks/useResource";

const QualityExample = () => {
  const {
    data: qualities = [],
    isLoading,
    isError,
    error,
  } = useResource("qualities");

  const updateQuality = useUpdateResource("qualities");

  const handleUpdate = () => {
    updateQuality.mutate({
      id: "quality-001",
      data: { name: "ভিত্তি" },
    });
  };

  if (isLoading) return <p>Loading qualities...</p>;

  if (isError) {
    return <p>Failed to load: {error.message}</p>;
  }

  return (
    <div className="space-y-3 p-6">
      <h2 className="text-xl font-semibold">Seed Qualities</h2>

      {qualities.map((quality) => (
        <p key={quality.id}>{quality.name}</p>
      ))}

      <button
        onClick={handleUpdate}
        disabled={updateQuality.isPending}
        className="rounded-lg bg-green-700 px-4 py-2 text-white disabled:opacity-50"
      >
        {updateQuality.isPending ? "Updating..." : "Test Update"}
      </button>

      {updateQuality.isSuccess && (
        <p className="text-green-700">Update successful!</p>
      )}

      {updateQuality.isError && (
        <p className="text-red-600">
          Update failed: {updateQuality.error.message}
        </p>
      )}
    </div>
  );
};

export default QualityExample;
