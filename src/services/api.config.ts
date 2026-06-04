import { isDevMode } from '@angular/core';

export const API_BASE_URL = isDevMode() ? '' : 'https://mec-point-production.up.railway.app';
export const TOKEN_KEY = 'mecpoint_token';
export const USER_KEY = 'mecpoint_user';
