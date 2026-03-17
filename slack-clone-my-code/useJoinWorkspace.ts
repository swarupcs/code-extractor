import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch } from '@/app/hooks';
import { setCurrentWorkspaceId } from '@/features/workspaceSlice';
import { setCurrentChannelId } from '@/features/channelSlice';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';
import type { Workspace } from '@/data/mockData';

export const useJoinWorkspace = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, string>({
    mutationFn: (code) =>
      axiosInstance.post('/workspaces/join', { code }).then((r) => r.data),
    onSuccess: (ws) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      dispatch(setCurrentWorkspaceId(ws.id));
      dispatch(setCurrentChannelId(ws.channels[0]?.id ?? null));
      toast.success(`Joined workspace "${ws.name}"`);
    },
    onError: () => toast.error('Invalid invite code'),
  });
};
