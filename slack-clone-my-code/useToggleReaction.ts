import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';
import type { Message, Reaction } from '@/data/mockData';

interface ToggleReactionPayload {
  messageId: string;
  emoji: string;
}

const applyReactionToggle = (
  messages: Message[],
  messageId: string,
  emoji: string,
  userId: string,
): Message[] =>
  messages.map((m) => {
    if (m.id === messageId) {
      const existing = m.reactions.find((r) => r.emoji === emoji);
      let newReactions: Reaction[];
      if (existing) {
        const filtered = existing.userIds.filter((u) => u !== userId);
        if (existing.userIds.includes(userId)) {
          newReactions =
            filtered.length > 0
              ? m.reactions.map((r) =>
                  r.emoji === emoji ? { ...r, userIds: filtered } : r,
                )
              : m.reactions.filter((r) => r.emoji !== emoji);
        } else {
          newReactions = m.reactions.map((r) =>
            r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r,
          );
        }
      } else {
        newReactions = [...m.reactions, { emoji, userIds: [userId] }];
      }
      return { ...m, reactions: newReactions };
    }
    // Also apply to thread replies
    return {
      ...m,
      thread: applyReactionToggle(m.thread, messageId, emoji, userId),
    };
  });

export const useToggleReaction = () => {
  const queryClient = useQueryClient();
  const channelId = useAppSelector((s) => s.channel.currentChannelId);
  const userId = useAppSelector((s) => s.auth.user?.id);

  return useMutation<void, Error, ToggleReactionPayload>({
    mutationFn: ({ messageId, emoji }) =>
      axiosInstance
        .post(`/channels/${channelId}/messages/${messageId}/reactions`, {
          emoji,
        })
        .then((r) => r.data),

    onMutate: async ({ messageId, emoji }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', channelId] });
      const previous = queryClient.getQueryData<Message[]>([
        'messages',
        channelId,
      ]);

      queryClient.setQueryData<Message[]>(['messages', channelId], (old) =>
        applyReactionToggle(old ?? [], messageId, emoji, userId!),
      );

      return { previous };
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(['messages', channelId], ctx?.previous);
      toast.error('Failed to update reaction');
    },
  });
};
