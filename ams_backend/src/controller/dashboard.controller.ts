import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { dashboardService } from "@/services";

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics and summary data
 */

/**
 * @swagger
 * /dashboard/counts:
 *   get:
 *     summary: Get dashboard counts
 *     description: Retrieve counts for dashboard overview (e.g., users, assets, organizations)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard counts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Dashboard counts fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                       example: 100
 *                     totalAssets:
 *                       type: number
 *                       example: 250
 *                     totalOrganizations:
 *                       type: number
 *                       example: 10
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Unable to fetch dashboard counts
 */
const getDashboardCounts = catchAsync(async (req, res) => {
  const counts = await dashboardService.getDashboardCounts();

  if (!counts) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unable to fetch dashboard counts"
    );
  }

  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: "Dashboard counts fetched successfully",
    data: {
      counts,
    },
  });
});

export default {
  getDashboardCounts,
};
