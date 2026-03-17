import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/app/hooks';
import { setCurrentWorkspaceId } from '@/features/workspaceSlice';
import { setCurrentChannelId } from '@/features/channelSlice';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';

import type { Workspace } from '@/data/mockData';

interface CreateWorkspacePayload {
  name: string;
  icon: string;
  description: string;
  firstChannel: string;
}

export const useCreateWorkspace = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, CreateWorkspacePayload>({
    mutationFn: (payload) =>
      axiosInstance.post('/workspaces', payload).then((r) => r.data),
    onSuccess: (ws) => {
      // Invalidate workspace list so useGetWorkspaces refetches
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      dispatch(setCurrentWorkspaceId(ws.id));
      dispatch(setCurrentChannelId(ws.channels[0]?.id ?? null));
      toast.success(`Workspace "${ws.name}" created`);
    },
    onError: () => toast.error('Failed to create workspace'),
  });
};
