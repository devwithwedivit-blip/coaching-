import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentUser, AdminUser, UserRole } from '../types';
import { storage } from '../services/storage';
import { apiService } from '../services/api';

interface AuthContextType {
  role: UserRole;
  student: StudentUser | null;
  admin: AdminUser | null;
  isLoading: boolean;
  loginAsStudent: (data: { fullName: string; age: string; email: string; phone: string; targetExam?: string }) => Promise<void>;
  loginAsAdmin: (adminData: AdminUser) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  student: null,
  admin: null,
  isLoading: true,
  loginAsStudent: async () => {},
  loginAsAdmin: async () => {},
  logout: async () => {},
  switchRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('student');
  const [student, setStudent] = useState<StudentUser | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const savedStudent = await storage.getJson<StudentUser | null>('sarvottam_active_student', null);
      const savedAdmin = await storage.getJson<AdminUser | null>('sarvottam_active_admin', null);
      const savedRole = await storage.getItem('sarvottam_active_role') as UserRole;

      if (savedStudent) setStudent(savedStudent);
      if (savedAdmin) setAdmin(savedAdmin);
      if (savedRole) setRole(savedRole);
      else if (savedStudent) setRole('student');
    } catch {}
    setIsLoading(false);
  };

  const loginAsStudent = async (data: { fullName: string; age: string; email: string; phone: string; targetExam?: string }) => {
    const cleanPhone = data.phone.replace(/\D/g, '');
    const rollNo = `NEET2024-${data.age}-${cleanPhone.slice(-4) || '8812'}`;
    const studentUser: StudentUser = {
      fullName: data.fullName.trim(),
      age: data.age.trim(),
      email: data.email.trim().toLowerCase(),
      phone: cleanPhone,
      rollNo,
      targetExam: data.targetExam || 'NEET (UG) 2024',
      registeredAt: new Date().toISOString(),
    };

    setStudent(studentUser);
    setRole('student');
    await storage.setJson('sarvottam_active_student', studentUser);
    await storage.setItem('sarvottam_active_role', 'student');

    // Notify backend
    apiService.sendCbtTelemetry({
      action: 'register',
      fullName: studentUser.fullName,
      age: studentUser.age,
      email: studentUser.email,
      phone: studentUser.phone,
      rollNo: studentUser.rollNo,
      stream: studentUser.targetExam,
      status: 'LIVE_TESTING',
    }).catch(() => {});
  };

  const loginAsAdmin = async (adminData: AdminUser) => {
    setAdmin(adminData);
    setRole('admin');
    await storage.setJson('sarvottam_active_admin', adminData);
    await storage.setItem('sarvottam_active_role', 'admin');
  };

  const logout = async () => {
    if (role === 'admin') {
      setAdmin(null);
      await storage.removeItem('sarvottam_active_admin');
    } else {
      setStudent(null);
      await storage.removeItem('sarvottam_active_student');
    }
    setRole(null);
    await storage.removeItem('sarvottam_active_role');
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole) storage.setItem('sarvottam_active_role', newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        student,
        admin,
        isLoading,
        loginAsStudent,
        loginAsAdmin,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
