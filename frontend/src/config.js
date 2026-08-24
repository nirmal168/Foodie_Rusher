// Universal Multi-Device, Cross-Origin & Production Configuration
const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? (typeof window !== 'undefined' ? window.location.origin : '') : `${currentProtocol}//${currentHost}:5000`);
export const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || '';
