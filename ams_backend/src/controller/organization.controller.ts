import httpStatus from "http-status";
import ApiError from "@/lib/ApiError";
import catchAsync from "@/lib/catchAsync";
import { Organization } from "@prisma/client";
import pick from "@/lib/pick";
import organizationService from "@/services/organization.service";
import { applyDateFilter } from "@/utils/filters.utils";

// createOrganization
const createOrganization = catchAsync(async (req, res) => {
  try {
    const organization = await organizationService.createOrganization({
      organizationName: req.body.organizationName,
    } as Organization);

    res
      .status(httpStatus.CREATED)
      .send({ organization, message: "Organization Created Successfully." });
  } catch (error) {
    throw new ApiError(httpStatus.CONFLICT, error.message);
  }
});

//getAllOrganizations
const getAllOrganizations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["organizationName", "from_date", "to_date"]);
  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);

  applyDateFilter(filter);

  if (filter.organizationName) {
    filter.name = {
      contains: filter.organizationName,
      mode: "insensitive",
    };
  }

  const result = await organizationService.queryOrganizations(filter, options);

  if (!result || result.length === 0) {
    res.status(200).json({
      status: "404",
      message: "No organizations found",
      data: [],
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Organizations fetched successfully",
    data: result,
  });
});

//getOrganizationById
const getOrganizationById = catchAsync(async (req, res) => {
  const result = await organizationService.getOrganizationById(
    req.params.organizationId
  );

  if (!result) {
    res.status(200).json({
      status: "404",
      message: "No organization found",
      data: [],
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: "Organization fetched successfully",
    data: result,
  });
});

const updateOrganization = catchAsync(async (req, res) => {
  try {
    const result = await organizationService.updateOrganizationById(
      req.params.organizationId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Organization update successfully",
      data: result,
    });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

// deleteDepartment
const deleteOrganization = catchAsync(async (req, res) => {
  try {
    await organizationService.deleteOrganizationById(req.params.organizationId);
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Organization deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

//bulkDeleteOrganizations

const bulkDeleteOrganizations = catchAsync(async (req, res) => {
  try {
    await organizationService.deleteOrganizationsByIds(
      req.body.organizationIds
    );
    res.status(httpStatus.NO_CONTENT);
    res.send({ message: "Organizations deleted successfully" });
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, error.message);
  }
});

export default {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  bulkDeleteOrganizations,
};
