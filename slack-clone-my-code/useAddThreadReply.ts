import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';
import type { Message } from '@/data/mockData';

interface ThreadReplyPayload {
  parentId: string;
  content: string;
}

export const useAddThreadReply = () => {
  const queryClient = useQueryClient();
  const channelId = useAppSelector((s) => s.channel.currentChannelId);
  const userId = useAppSelector((s) => s.auth.user?.id);

  return useMutation<Message, Error, ThreadReplyPayload>({
    mutationFn: ({ parentId, content }) =>
      axiosInstance
        .post(`/channels/${channelId}/messages/${parentId}/replies`, {
          content,
        })
        .then((r) => r.data),

    onMutate: async ({ parentId, content }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', channelId] });
      const previous = queryClient.getQueryData<Message[]>([
        'messages',
        channelId,
      ]);

      const tempId = `thread_temp_${Date.now()}`;
      const tempReply: Message = {
        id: tempId,
        channelId: channelId!,
        authorId: userId!,
        content,
        timestamp: new Date().toISOString(),
        edited: false,
        reactions: [],
        thread: [],
        attachments: [],
      };

      queryClient.setQueryData<Message[]>(['messages', channelId], (old) =>
        (old ?? []).map((m) =>
          m.id === parentId ? { ...m, thread: [...m.thread, tempReply] } : m,
        ),
      );

      return { previous, tempId };
    },

    onSuccess: (real, { parentId }, ctx) => {
      queryClient.setQueryData<Message[]>(['messages', channelId], (old) =>
        (old ?? []).map((m) =>
          m.id === parentId
            ? {
                ...m,
                thread: m.thread.map((t) => (t.id === ctx?.tempId ? real : t)),
              }
            : m,
        ),
      );
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(['messages', channelId], ctx?.previous);
      toast.error('Failed to add reply');
    },
  });
};
