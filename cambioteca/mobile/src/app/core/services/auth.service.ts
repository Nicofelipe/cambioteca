import { Preferences } from '@capacitor/preferences';
import api from './api.service';

export interface LoginResponse { access: string; refresh: string }

export class AuthService {
  async login(username: string, password: string) {
    const { data } = await api.post<LoginResponse>('/auth/login/', { username, password });
    await Preferences.set({ key: 'token', value: data.access });
    await Preferences.set({ key: 'refresh', value: data.refresh });
    return data;
  }

  async register(username: string, email: string, password: string) {
    await api.post('/auth/register/', { username, email, password });
  }

  async logout() {
    await Preferences.remove({ key: 'token' });
    await Preferences.remove({ key: 'refresh' });
  }

  async isLoggedIn(): Promise<boolean> {
    const { value } = await Preferences.get({ key: 'token' });
    return !!value;
  }
}

export const authService = new AuthService();
