import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';

import type { Channel } from '@/data/mockData';

export const useTogglePin = () => {
  const queryClient = useQueryClient();
  const channelId = useAppSelector((s) => s.channel.currentChannelId);
  const workspaceId = useAppSelector((s) => s.workspace.currentWorkspaceId);

  return useMutation<void, Error, string>({
    mutationFn: (messageId) =>
      axiosInstance
        .post(`/channels/${channelId}/messages/${messageId}/pin`)
        .then((r) => r.data),

    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ['channels', workspaceId] });
      const previous = queryClient.getQueryData<Channel[]>([
        'channels',
        workspaceId,
      ]);

      queryClient.setQueryData<Channel[]>(['channels', workspaceId], (old) =>
        (old ?? []).map((ch) => {
          if (ch.id !== channelId) return ch;
          const isPinned = ch.pinnedMessages.includes(messageId);
          return {
            ...ch,
            pinnedMessages: isPinned
              ? ch.pinnedMessages.filter((id) => id !== messageId)
              : [...ch.pinnedMessages, messageId],
          };
        }),
      );

      return { previous };
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(['channels', workspaceId], ctx?.previous);
      toast.error('Failed to toggle pin');
    },
  });
};
