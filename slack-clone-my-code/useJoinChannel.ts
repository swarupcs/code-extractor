import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';
import type { Channel } from '@/data/mockData';
import axiosInstance from '@/config/axiosInstance';

export const useJoinChannel = () => {
  const queryClient = useQueryClient();
  const workspaceId = useAppSelector((s) => s.workspace.currentWorkspaceId);
  const userId = useAppSelector((s) => s.auth.user?.id);

  return useMutation<void, Error, string>({
    mutationFn: (channelId) =>
      axiosInstance
        .post(`/workspaces/${workspaceId}/channels/${channelId}/join`)
        .then((r) => r.data),

    onMutate: async (channelId) => {
      await queryClient.cancelQueries({ queryKey: ['channels', workspaceId] });
      const previous = queryClient.getQueryData<Channel[]>([
        'channels',
        workspaceId,
      ]);

      // Optimistic: add userId to channel members
      queryClient.setQueryData<Channel[]>(['channels', workspaceId], (old) =>
        (old ?? []).map((ch) =>
          ch.id === channelId && !ch.members.includes(userId!)
            ? { ...ch, members: [...ch.members, userId!] }
            : ch,
        ),
      );
      return { previous };
    },

    onSuccess: () => toast.success('Joined channel'),

    onError: (_, __, ctx) => {
      queryClient.setQueryData(['channels', workspaceId], ctx?.previous);
      toast.error('Failed to join channel');
    },
  });
};
