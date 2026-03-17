import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axiosInstance from '@/config/axiosInstance';

import type { Notification } from '@/data/mockData';

export const useGetNotifications = () =>
  useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => axiosInstance.get('/notifications').then((r) => r.data),
    refetchInterval: 1000 * 30, // poll every 30s until you have sockets
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      axiosInstance.patch(`/notifications/${id}/read`).then((r) => r.data),
    onMutate: (id) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        (old ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    onError: () => toast.error('Failed to mark notification read'),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () =>
      axiosInstance.patch('/notifications/read-all').then((r) => r.data),
    onMutate: () => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        (old ?? []).map((n) => ({ ...n, read: true })),
      );
    },
    onError: () => toast.error('Failed to mark all notifications read'),
  });
};
