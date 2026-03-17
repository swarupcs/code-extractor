import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';

import type { Message } from '@/data/mockData';

interface SendMessagePayload {
  content: string;
  attachments?: Message['attachments'];
}

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const channelId = useAppSelector((s) => s.channel.currentChannelId);
  const userId = useAppSelector((s) => s.auth.user?.id);

  return useMutation<Message, Error, SendMessagePayload>({
    mutationFn: ({ content, attachments }) =>
      axiosInstance
        .post(`/channels/${channelId}/messages`, { content, attachments })
        .then((r) => r.data),

    onMutate: async ({ content, attachments = [] }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', channelId] });
      const previous = queryClient.getQueryData<Message[]>([
        'messages',
        channelId,
      ]);

      const tempId = `temp_${Date.now()}`;
      const tempMsg: Message = {
        id: tempId,
        channelId: channelId!,
        authorId: userId!,
        content,
        timestamp: new Date().toISOString(),
        edited: false,
        reactions: [],
        thread: [],
        attachments,
      };

      queryClient.setQueryData<Message[]>(['messages', channelId], (old) => [
        ...(old ?? []),
        tempMsg,
      ]);

      return { previous, tempId };
    },

    onSuccess: (real, _, ctx) => {
      // Replace optimistic message with real one from server
      queryClient.setQueryData<Message[]>(['messages', channelId], (old) =>
        (old ?? []).map((m) => (m.id === ctx?.tempId ? real : m)),
      );
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(['messages', channelId], ctx?.previous);
      toast.error('Failed to send message');
    },
  });
};
