import axios from 'axios';
import { mockAdapter } from './mock-adapter';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/log-master',
  headers: { 'Content-Type': 'application/json' },
});

if (import.meta.env.VITE_MOCK === 'true') {
  client.defaults.adapter = mockAdapter;
}

export default client;
