import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';

import type { Message } from '@/data/mockData';

interface EditPayload {
  messageId: string;
  content: string;
}

export const useEditMessage = () => {
  const queryClient = useQueryClient();
  const channelId = useAppSelector((s) => s.channel.currentChannelId);

  return useMutation<Message, Error, EditPayload>({
    mutationFn: ({ messageId, content }) =>
      axiosInstance
        .patch(`/channels/${channelId}/messages/${messageId}`, { content })
        .then((r) => r.data),

    onMutate: async ({ messageId, content }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', channelId] });
      const previous = queryClient.getQueryData<Message[]>([
        'messages',
        channelId,
      ]);

      queryClient.setQueryData<Message[]>(['messages', channelId], (old) =>
        (old ?? []).map((m) =>
          m.id === messageId
            ? {
                ...m,
                content,
                edited: true,
                editedAt: new Date().toISOString(),
              }
            : m,
        ),
      );

      return { previous };
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(['messages', channelId], ctx?.previous);
      toast.error('Failed to edit message');
    },
  });
};
