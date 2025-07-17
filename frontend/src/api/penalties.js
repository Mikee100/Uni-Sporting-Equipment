import api from './axios';

export const getAllPenalties = async () => {
  const res = await api.get('/api/penalties');
  return res.data;
};

export const createPenalty = async (penalty) => {
  const res = await api.post('/api/penalties', penalty);
  return res.data;
};

export const updatePenalty = async (id, penalty) => {
  const res = await api.put(`/api/penalties/${id}`, penalty);
  return res.data;
};

export const deletePenalty = async (id) => {
  const res = await api.delete(`/api/penalties/${id}`);
  return res.data;
}; 