import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    if (error.response?.data?.error) return error.response.data.error;
    if (!error.response) return 'Não foi possível conectar ao servidor.';
  }
  return 'Algo deu errado. Tente novamente.';
}
