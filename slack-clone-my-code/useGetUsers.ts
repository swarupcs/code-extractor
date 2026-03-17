import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import axiosInstance from '@/config/axiosInstance';

import type { User } from '@/data/mockData';

// Fetch all users in the workspace — cached indefinitely (users rarely change)
export const useGetWorkspaceUsers = () => {
  const workspaceId = useAppSelector((s) => s.workspace.currentWorkspaceId);

  return useQuery<User[]>({
    queryKey: ['users', workspaceId],
    queryFn: () =>
      axiosInstance
        .get(`/workspaces/${workspaceId}/members`)
        .then((r) => r.data),
    enabled: !!workspaceId,
    staleTime: Infinity,
  });
};

// Replaces: getUser(id) — returns a single user from the cached list
export const useGetUser = (userId: string) => {
  const workspaceId = useAppSelector((s) => s.workspace.currentWorkspaceId);

  return useQuery<User[], Error, User | undefined>({
    queryKey: ['users', workspaceId],
    queryFn: () =>
      axiosInstance
        .get(`/workspaces/${workspaceId}/members`)
        .then((r) => r.data),
    enabled: !!workspaceId,
    staleTime: Infinity,
    select: (users) => users.find((u) => u.id === userId),
  });
};
