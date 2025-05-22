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

/**
 * @swagger
 * tags:
 *   name: User Dashboard
 *   description: End‑user asset assignments and widgets
 *
 * components:
 *   schemas:
 *     AssignedAsset:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "a2d8e1f4‑c8d9‑4f0c‑a245‑4cfb52ee7f4e"
 *         assetName:
 *           type: string
 *           example: "Dell Latitude 5420"
 *         status:
 *           type: string
 *           example: "ASSIGNED"
 *         assignedAt:
 *           type: string
 *           format: date‑time
 *           example: "2025‑05‑10T08:22:31Z"
 *         returnAt:
 *           type: string
 *           format: date‑time
 *           nullable: true
 *       required: [id, assetName, status, assignedAt]
 *
 *     AssignedAssetListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 200
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Assigned assets fetched successfully for User
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AssignedAsset'
 *
 *     EmptyAssignedAssetResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 404
 *         message:
 *           type: string
 *           example: No assigned assets found for User
 *         data:
 *           type: array
 *           items: {}
 */

/**
 * @swagger
 * /userDashboard:
 *   get:
 *     summary: List assets assigned to the authenticated user
 *     description: >
 *       Returns all asset‑assignment records that belong to the logged‑in user.
 *       Supports optional status and date‑range filters plus pagination.
 *     tags: [User Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assigned assets retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignedAssetListResponse'
 *       404:
 *         description: No assigned assets
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmptyAssignedAssetResponse'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
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
    data: {
      assignments,
    }
  });
  return;
});

export default {
  getAssignAssetUser,
};
