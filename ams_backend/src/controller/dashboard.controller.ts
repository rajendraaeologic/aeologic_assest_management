import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { dashboardService } from "@/services";
const getDashboardCounts = catchAsync(async (req, res) => {
  const counts = await dashboardService.getDashboardCounts();

  if (!counts) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to fetch dashboard counts"
    );
  }

  res.status(httpStatus.OK).json({
    status: httpStatus.OK.toString(),
    message: "Dashboard counts fetched successfully",
    data: counts,
  });
});

export default {
  getDashboardCounts,
};
