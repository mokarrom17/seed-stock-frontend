import api from "../api/axios";

const createResourceService = (endpoint) => ({
  getAll: async (params = {}) => {
    const response = await api.get(endpoint, { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`${endpoint}/${encodeURIComponent(id)}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(endpoint, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(
      `${endpoint}/${encodeURIComponent(id)}`,
      data,
    );
    return response.data;
  },

  replace: async (id, data) => {
    const response = await api.put(
      `${endpoint}/${encodeURIComponent(id)}`,
      data,
    );
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`${endpoint}/${encodeURIComponent(id)}`);
    return response.data;
  },
});

export default createResourceService;
