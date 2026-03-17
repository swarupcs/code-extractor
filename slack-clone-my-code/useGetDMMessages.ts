import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';

import type { Message } from '@/data/mockData';

export const useGetDMMessages = () => {
  const dmId = useAppSelector((s) => s.channel.currentDMId);
  const workspaceId = useAppSelector((s) => s.workspace.currentWorkspaceId);

  return useQuery<Message[]>({
    queryKey: ['dm-messages', workspaceId, dmId],
    queryFn: () =>
      axiosInstance
        .get(`/workspaces/${workspaceId}/dms/${dmId}/messages`)
        .then((r) => r.data),
    enabled: !!dmId && !!workspaceId,
  });
};

export const useSendDMMessage = () => {
  const queryClient = useQueryClient();
  const dmId = useAppSelector((s) => s.channel.currentDMId);
  const workspaceId = useAppSelector((s) => s.workspace.currentWorkspaceId);
  const userId = useAppSelector((s) => s.auth.user?.id);

  return useMutation<Message, Error, string>({
    mutationFn: (content) =>
      axiosInstance
        .post(`/workspaces/${workspaceId}/dms/${dmId}/messages`, { content })
        .then((r) => r.data),

    onMutate: async (content) => {
      await queryClient.cancelQueries({
        queryKey: ['dm-messages', workspaceId, dmId],
      });
      const previous = queryClient.getQueryData<Message[]>([
        'dm-messages',
        workspaceId,
        dmId,
      ]);

      const tempId = `dm_temp_${Date.now()}`;
      const tempMsg: Message = {
        id: tempId,
        dmId: dmId!,
        authorId: userId!,
        content,
        timestamp: new Date().toISOString(),
        edited: false,
        reactions: [],
        thread: [],
        attachments: [],
      };

      queryClient.setQueryData<Message[]>(
        ['dm-messages', workspaceId, dmId],
        (old) => [...(old ?? []), tempMsg],
      );

      return { previous, tempId };
    },

    onSuccess: (real, _, ctx) => {
      queryClient.setQueryData<Message[]>(
        ['dm-messages', workspaceId, dmId],
        (old) => (old ?? []).map((m) => (m.id === ctx?.tempId ? real : m)),
      );
    },

    onError: (_, __, ctx) => {
      queryClient.setQueryData(
        ['dm-messages', workspaceId, dmId],
        ctx?.previous,
      );
      toast.error('Failed to send message');
    },
  });
};
