import axios from 'axios';
import api from './axios';

export const getAllUsers = async () => {
  const res = await api.get('/api/users');
  return res.data;
};

export const createUser = async (user) => {
  const res = await api.post('/api/users', user);
  return res.data;
};

export const updateUser = async (id, user) => {
  const res = await api.put(`/api/users/${id}`, user);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/api/users/${id}`);
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/api/users/${id}`);
  return res.data;
}; 