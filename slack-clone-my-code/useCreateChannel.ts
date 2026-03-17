import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setCurrentChannelId } from '@/features/channelSlice';
import { toast } from 'sonner';

import type { Channel } from '@/data/mockData';
import axiosInstance from '@/config/axiosInstance';

type CreateChannelPayload = Omit<
  Channel,
  'id' | 'pinnedMessages' | 'unreadCount' | 'muted'
>;

export const useCreateChannel = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const workspaceId = useAppSelector((s) => s.workspace.currentWorkspaceId);

  return useMutation<Channel, Error, CreateChannelPayload>({
    mutationFn: (payload) =>
      axiosInstance
        .post(`/workspaces/${workspaceId}/channels`, payload)
        .then((r) => r.data),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['channels', workspaceId] });
      const previous = queryClient.getQueryData<Channel[]>([
        'channels',
        workspaceId,
      ]);

      // Optimistic: add temp channel to list immediately
      const tempChannel: Channel = {
        ...payload,
        id: `temp_${Date.now()}`,
        pinnedMessages: [],
        unreadCount: 0,
        muted: false,
      };
      queryClient.setQueryData<Channel[]>(['channels', workspaceId], (old) => [
        ...(old ?? []),
        tempChannel,
      ]);
      dispatch(setCurrentChannelId(tempChannel.id));

      return { previous, tempId: tempChannel.id };
    },

    onSuccess: (real, _, ctx) => {
      // Replace temp channel with real one from server
      queryClient.setQueryData<Channel[]>(['channels', workspaceId], (old) =>
        (old ?? []).map((ch) => (ch.id === ctx?.tempId ? real : ch)),
      );
      dispatch(setCurrentChannelId(real.id));
      toast.success(`Channel #${real.name} created`);
    },

    onError: (_, __, ctx) => {
      // Rollback optimistic update
      queryClient.setQueryData(['channels', workspaceId], ctx?.previous);
      toast.error('Failed to create channel');
    },
  });
};
