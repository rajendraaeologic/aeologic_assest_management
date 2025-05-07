import httpStatus from "http-status";
import pick from "@/lib/pick";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import userDashboardService from "@/services/userDashboard.service";
import { UserRole } from "@prisma/client";
import { applyDateFilter } from "@/utils/filters.utils";
interface CustomUser {
  id: string;
  userRole: UserRole;
}

const getAssignAssetUser = catchAsync(async (req, res) => {
  const user = req.user as CustomUser;

  const filter = pick(req.query, ["status", "from_date", "to_date"]);
  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);

  applyDateFilter(filter);

  if (filter.status) {
    filter.status = {
      equals: filter.status,
      mode: "insensitive",
    };
  }

  const assignments = await userDashboardService.queryAssignAssetUser(
    user.id,
    filter,
    options
  );

  if (!assignments || assignments.length === 0) {
    res.status(200).json({
      status: "404",
      message: "No assigned assets found for User",
      data: [],
    });
    return;
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: "Assigned assets fetched successfully for User",
    data: assignments,
  });
  return;
});

export default {
  getAssignAssetUser,
};
