import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';
import type { Message } from '@/data/mockData';

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const channelId = useAppSelector((s) => s.channel.currentChannelId);

  return useMutation<void, Error, string>({
    mutationFn: (messageId) =>
      axiosInstance
        .delete(`/channels/${channelId}/messages/${messageId}`)
        .then((r) => r.data),

    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: ['messages', channelId] });
      const previous = queryClient.getQueryData<Message[]>([
        'messages',
        channelId,
      ]);

      queryClient.setQueryData<Message[]>(['messages', channelId], (old) =>
        (old ?? []).filter((m) => m.id !== messageId),
      );

      return { previous };
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(['messages', channelId], ctx?.previous);
      toast.error('Failed to delete message');
    },
  });
};
