import api from "../mockApi/api/axios";
import createResourceService from "../mockApi/services/resourceService";

const resource = createResourceService("/seedTypes");

const seedTypeService = {
  ...resource,

  getBySeason: async (seasonId) => {
    const seedTypes = await resource.getAll();

    if (!seasonId) return seedTypes;

    return seedTypes.filter((seedType) =>
      seedType.seasonIds?.includes(seasonId),
    );
  },

  getQualities: async (seedTypeId) => {
    const [seedTypeResponse, qualitiesResponse] = await Promise.all([
      api.get(`/seedTypes/${encodeURIComponent(seedTypeId)}`),
      api.get("/qualities"),
    ]);

    const seedType = seedTypeResponse.data;
    const qualities = qualitiesResponse.data;
    const qualityIds = seedType.qualityIds ?? [];

    return qualities.filter((quality) => qualityIds.includes(quality.id));
  },
};

export default seedTypeService;
