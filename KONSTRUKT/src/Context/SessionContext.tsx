import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../Services/authService';
import { AccessibleSite, User } from '../Types/Auth';
import { decodeTokenPayload } from '../Utils/jwt';

const SELECTED_SITE_KEY = 'selectedSiteId';
const SITE_CREATOR_ROLES = ['ADMIN', 'CHEF_PROJET'];

interface SessionContextValue {
  user: User | null;
  sites: AccessibleSite[];
  selectedSite: AccessibleSite | null;
  organizationId: string | null;
  canCreateSite: boolean;
  loaded: boolean;
  error: string;
  loadSession: () => Promise<User | null>;
  selectSite: (siteId: string | null) => Promise<void>;
  clearSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sites, setSites] = useState<AccessibleSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const loadSession = useCallback(async (): Promise<User | null> => {
    setError('');
    try {
      const [currentUser, accessibleSites, storedSiteId, token] = await Promise.all([
        authService.getCurrentUser(),
        authService.getAccessibleSites(),
        AsyncStorage.getItem(SELECTED_SITE_KEY),
        AsyncStorage.getItem('userToken'),
      ]);
      const payload = decodeTokenPayload(token);
      setOrganizationId(payload?.organizationId ?? null);
      setRole(payload?.role ?? null);
      setUser(currentUser);
      setSites(accessibleSites);
      setSelectedSiteId(
        storedSiteId && accessibleSites.some(site => site.id === storedSiteId) ? storedSiteId : null
      );
      return currentUser;
    } catch (err) {
      console.error('Erreur chargement session:', err);
      setError('Impossible de charger vos chantiers.');
      return null;
    } finally {
      setLoaded(true);
    }
  }, []);

  const selectSite = useCallback(async (siteId: string | null) => {
    setSelectedSiteId(siteId);
    if (siteId) {
      await AsyncStorage.setItem(SELECTED_SITE_KEY, siteId);
    } else {
      await AsyncStorage.removeItem(SELECTED_SITE_KEY);
    }
  }, []);

  const clearSession = useCallback(async () => {
    setUser(null);
    setSites([]);
    setSelectedSiteId(null);
    setOrganizationId(null);
    setRole(null);
    setLoaded(false);
    setError('');
    await AsyncStorage.removeItem(SELECTED_SITE_KEY);
  }, []);

  const selectedSite = useMemo(
    () => sites.find(site => site.id === selectedSiteId) ?? null,
    [sites, selectedSiteId]
  );

  const canCreateSite = role !== null && SITE_CREATOR_ROLES.includes(role);

  const value = useMemo(
    () => ({ user, sites, selectedSite, organizationId, canCreateSite, loaded, error, loadSession, selectSite, clearSession }),
    [user, sites, selectedSite, organizationId, canCreateSite, loaded, error, loadSession, selectSite, clearSession]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession doit être utilisé dans un SessionProvider');
  return context;
};
