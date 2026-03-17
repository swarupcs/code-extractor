import { useQuery } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setCurrentWorkspaceId } from '@/features/workspaceSlice';
import axiosInstance from '@/config/axiosInstance';

import type { Workspace } from '@/data/mockData';

export const useGetWorkspaces = () => {
  const dispatch = useAppDispatch();
  const currentWorkspaceId = useAppSelector(
    (s) => s.workspace.currentWorkspaceId,
  );

  return useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/workspaces');
      // Auto-select first workspace if none selected yet
      if (!currentWorkspaceId && data.length > 0) {
        dispatch(setCurrentWorkspaceId(data[0].id));
      }
      return data;
    },
  });
};
