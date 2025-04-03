import {
  Prisma,
  UserNotification,
} from '@prisma/client';
import db from '@/lib/db';
import { UserNotificationKeys} from "@/utils/selects.utils";

const createUserNotification = async (
    notificationInput: Prisma.UserNotificationCreateInput,
    selectKeys: Prisma.UserNotificationSelect = UserNotificationKeys
): Promise<UserNotification | null> => {

  return db.userNotification.create({
    data: notificationInput,
    select: selectKeys
  });
};

const getUserNotifications = async (
    userId: string,
    filter: object,
    options: {
      limit?: number;
      page?: number;
      sortBy?: string;
      sortType?: 'asc' | 'desc';
    },
    selectKeys: Prisma.UserNotificationSelect = UserNotificationKeys
): Promise<UserNotification[]> => {

  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = ((page - 1) * limit) || 0;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? 'desc';

  return db.userNotification.findMany({
    where: {
      userId,
      ...filter
    },
    select: selectKeys,
    skip: (skip > 0) ? skip : 0,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortType } : undefined
  });
};

const getUserNotificationsByUserId = async (
    userId: string,
    selectKeys: Prisma.UserNotificationSelect = UserNotificationKeys
): Promise<UserNotification[]> => {

  return db.userNotification.findMany({
    where: {
      hasRead: false,
      userId
    },
    select: selectKeys,
  });
};

const markUserNotificationAsRead = async (
    userId: string,
    userNotificationIds: string[],
): Promise<Prisma.BatchPayload | null> => {

  return db.userNotification.updateMany({
    where: {
      id: {
        in: userNotificationIds,
      },
      userId,
      hasRead: false,
    },
    data: {
      hasRead: true,
      readAt: new Date(),
    },
  });
};


export default {
  createUserNotification,
  getUserNotifications,
  markUserNotificationAsRead,
  getUserNotificationsByUserId,
};
