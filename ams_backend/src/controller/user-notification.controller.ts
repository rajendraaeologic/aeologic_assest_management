import httpStatus from "http-status";
import pick from "@/lib/pick";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { userNotificationService } from "@/services";
import { User } from "@prisma/client";
import { applyDateFilter } from "@/utils/filters.utils";

const getUserNotifications = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["hasRead", "from_date", "to_date"]);
  const user = req.user as User;

  applyDateFilter(filter);

  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);
  const notifications = await userNotificationService.getUserNotifications(
    user.id,
    filter,
    options
  );
  res.send(notifications);
});

const markUserNotificationAsRead = catchAsync(async (req, res) => {
  const user = req.user as User;
  if (
    !req.body.notificationIds ||
    !(req.body.notificationIds instanceof Array) ||
    !req.body.notificationIds.length
  ) {
    throw new ApiError(httpStatus.NOT_FOUND, "No notification found");
  }

  const notifications =
    await userNotificationService.markUserNotificationAsRead(
      user.id,
      req.body.notificationIds
    );
  res.send({ message: "User notifications marked as read.", notifications });
});

export default {
  getUserNotifications,
  markUserNotificationAsRead,
};
