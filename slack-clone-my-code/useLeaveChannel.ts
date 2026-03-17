import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setCurrentChannelId } from '@/features/channelSlice';
import { toast } from 'sonner';

import type { Channel } from '@/data/mockData';
import axiosInstance from '@/config/axiosInstance';

export const useLeaveChannel = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const workspaceId = useAppSelector((s) => s.workspace.currentWorkspaceId);
  const currentChannelId = useAppSelector((s) => s.channel.currentChannelId);
  const userId = useAppSelector((s) => s.auth.user?.id);

  return useMutation<void, Error, string>({
    mutationFn: (channelId) =>
      axiosInstance
        .post(`/workspaces/${workspaceId}/channels/${channelId}/leave`)
        .then((r) => r.data),

    onMutate: async (channelId) => {
      await queryClient.cancelQueries({ queryKey: ['channels', workspaceId] });
      const previous = queryClient.getQueryData<Channel[]>([
        'channels',
        workspaceId,
      ]);

      // Optimistic: remove userId from members
      queryClient.setQueryData<Channel[]>(['channels', workspaceId], (old) =>
        (old ?? []).map((ch) =>
          ch.id === channelId
            ? { ...ch, members: ch.members.filter((m) => m !== userId) }
            : ch,
        ),
      );

      // If leaving current channel, switch to first available other channel
      if (currentChannelId === channelId) {
        const channels =
          queryClient.getQueryData<Channel[]>(['channels', workspaceId]) ?? [];
        const next = channels.find(
          (c) => c.id !== channelId && c.members.includes(userId!),
        );
        dispatch(setCurrentChannelId(next?.id ?? null));
      }

      return { previous };
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(['channels', workspaceId], ctx?.previous);
      toast.error('Failed to leave channel');
    },
  });
};
