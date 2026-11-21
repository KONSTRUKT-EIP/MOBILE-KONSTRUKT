import api from '../API/Api';

export type BackendStatus = 'PRESENT' | 'ABSENT' | 'RETARD' | 'CONGE';

export interface AttendanceRecord {
  id: string;
  status: BackendStatus;
  normalHours: string | number;
  overtimeHours: string | number;
  minutesLate: number | null;
  notes: string | null;
}

export interface HoursPayload {
  teamId: string;
  userId: string;
  date: string;
  normalHours: number;
  overtimeHours: number;
}

const attendanceService = {
  getRecord: async (teamId: string, userId: string, date: string): Promise<AttendanceRecord | null> => {
    const response = await api.get<AttendanceRecord[]>('/attendance', { params: { teamId, userId, date } });
    return response.data[0] ?? null;
  },

  upsertStatus: async (teamId: string, userId: string, date: string, status: BackendStatus): Promise<AttendanceRecord> => {
    const response = await api.patch<AttendanceRecord>('/attendance/upsert', { teamId, userId, date, status });
    return response.data;
  },

  saveHours: async (siteId: string, payload: HoursPayload): Promise<void> => {
    await api.post(`/teams/site/${siteId}/workforce-hours`, payload);
  },

  updateDetails: async (id: string, payload: { notes?: string; minutesLate?: number }): Promise<void> => {
    await api.put(`/attendance/${id}`, payload);
  },
};

export default attendanceService;
