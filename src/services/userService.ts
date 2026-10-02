/**
 * EXAMGUARD — Foydalanuvchilar API servisi
 * 
 * Backend /api/users bilan RBAC asosida ishlaydi.
 * Har bir so'rovga foydalanuvchi roli (x-user-role) va ID (x-user-id) biriktiriladi.
 * Agar rol ADMIN bo'lmasa, server 403 Forbidden xatosini qaytaradi.
 */

import { User, UserRole, UserStatus } from '../types';

export interface UserCreatePayload {
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  password?: string;
  group_id?: string;
  course?: number;
  department?: string;
}

export interface UserUpdatePayload {
  full_name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  group_id?: string;
  course?: number;
  department?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  statusCode?: number;
  data?: T;
  total?: number;
  users?: User[];
  user?: User;
  tempPassword?: string;
}

export const UserService = {
  /**
   * Foydalanuvchilar ro'yxatini olish (Faqat ADMIN)
   */
  async getUsers(actorRole: UserRole, actorId: string): Promise<ApiResponse<User[]>> {
    try {
      const res = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': actorRole,
          'x-user-id': actorId
        }
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          statusCode: res.status,
          error: data.error || `Server xatosi: ${res.status}`
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        error: err.message || 'Tarmoq xatosi'
      };
    }
  },

  /**
   * Yangi foydalanuvchi yaratish (Faqat ADMIN)
   */
  async createUser(payload: UserCreatePayload, actorRole: UserRole, actorId: string): Promise<ApiResponse<User>> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': actorRole,
          'x-user-id': actorId
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          statusCode: res.status,
          error: data.error || 'Foydalanuvchi yaratishda xatolik'
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        error: err.message || 'Tarmoq xatosi'
      };
    }
  },

  /**
   * Foydalanuvchini tahrirlash (Faqat ADMIN)
   */
  async updateUser(id: string, payload: UserUpdatePayload, actorRole: UserRole, actorId: string): Promise<ApiResponse<User>> {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': actorRole,
          'x-user-id': actorId
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          statusCode: res.status,
          error: data.error || 'Foydalanuvchini yangilashda xatolik'
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        error: err.message || 'Tarmoq xatosi'
      };
    }
  },

  /**
   * Foydalanuvchi holatini o'zgartirish (Faol / Faolsiz)
   */
  async toggleStatus(id: string, actorRole: UserRole, actorId: string): Promise<ApiResponse<User>> {
    try {
      const res = await fetch(`/api/users/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': actorRole,
          'x-user-id': actorId
        }
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          statusCode: res.status,
          error: data.error || 'Holatni o‘zgartirishda xatolik'
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        error: err.message || 'Tarmoq xatosi'
      };
    }
  },

  /**
   * Foydalanuvchi parolini tiklash
   */
  async resetPassword(id: string, tempPassword: string, actorRole: UserRole, actorId: string): Promise<ApiResponse<User>> {
    try {
      const res = await fetch(`/api/users/${id}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': actorRole,
          'x-user-id': actorId
        },
        body: JSON.stringify({ tempPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          statusCode: res.status,
          error: data.error || 'Parolni tiklashda xatolik'
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        error: err.message || 'Tarmoq xatosi'
      };
    }
  },

  /**
   * Foydalanuvchini o'chirish
   */
  async deleteUser(id: string, actorRole: UserRole, actorId: string): Promise<ApiResponse<void>> {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': actorRole,
          'x-user-id': actorId
        }
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          statusCode: res.status,
          error: data.error || 'Foydalanuvchini o‘chirishda xatolik'
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        error: err.message || 'Tarmoq xatosi'
      };
    }
  }
};
