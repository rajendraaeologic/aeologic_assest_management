import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { dashboardService } from "@/services";
import { User } from "@prisma/client";

const getDashboardCounts = catchAsync(async (req, res) => {
  const { period } = req.query;
  const user = req.user as User;

  const dashboardUser = {
    id: user.id,
    userRole: user.userRole,
    companyId: user.companyId
  };

  const counts = await dashboardService.getDashboardCounts(period as string, dashboardUser);

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
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7days, 4weeks, 6months, 12months]
 *           default: 7days
 *         description: The time period to filter the counts by
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
 *                     counts:
 *                       type: object
 *                       properties:
 *                         users:
 *                           type: number
 *                           example: 100
 *                         organizations:
 *                           type: number
 *                           example: 10
 *                         branches:
 *                           type: number
 *                           example: 15
 *                         departments:
 *                           type: number
 *                           example: 20
 *                         assets:
 *                           type: number
 *                           example: 250
 *                         outForDelivery:
 *                           type: number
 *                           example: 5
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Unable to fetch dashboard counts
 */

export default {
  getDashboardCounts,
};