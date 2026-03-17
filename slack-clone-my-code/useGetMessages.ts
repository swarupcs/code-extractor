import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/app/hooks';
import axiosInstance from '@/config/axiosInstance';

import type { Message } from '@/data/mockData';

export const useGetMessages = () => {
  const channelId = useAppSelector((s) => s.channel.currentChannelId);

  return useQuery<Message[]>({
    queryKey: ['messages', channelId],
    queryFn: () =>
      axiosInstance.get(`/channels/${channelId}/messages`).then((r) => r.data),
    enabled: !!channelId,
    staleTime: 1000 * 30, // 30s — messages go stale quickly
  });
};
