import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';

import type { Channel } from '@/data/mockData';
import axiosInstance from '@/config/axiosInstance';

export const useGetChannels = () => {
  const workspaceId = useAppSelector((s) => s.workspace.currentWorkspaceId);

  return useQuery<Channel[]>({
    queryKey: ['channels', workspaceId],
    queryFn: () =>
      axiosInstance.get(`/workspaces/${workspaceId}/channels`).then((r) => r.data),
    enabled: !!workspaceId,
  });
};
