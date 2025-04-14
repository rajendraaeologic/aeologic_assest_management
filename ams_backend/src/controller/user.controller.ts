import httpStatus from 'http-status';
import pick from '@/lib/pick';
import ApiError from '@/lib/ApiError';
import catchAsync from '@/lib/catchAsync';
import { userService} from '@/services';
import {User} from "@prisma/client";
import {encryptPassword} from "@/lib/encryption";
import {applyDateFilter} from "@/utils/filters.utils";

const createUser = catchAsync(async (req, res) => {
    try{
        const user = await userService.createUser({
            userName: req.body.userName,
            phone: req.body.phone,
            email: req.body.email,
            password: await encryptPassword(req.body.password),
            status: req.body.status || 'ACTIVE',
            userRole: req.body.role,
            // code: req.body.code,
            // department: req.body.department,
            // departmentCode: req.body.departmentCode
        } as unknown as User);

        res
            .status(httpStatus.CREATED)
            .send({user, message: 'User Created Successfully.',});
    } catch (error) {
        throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
});

// Get All Users
const getAllUsers = catchAsync(async (req, res) => {
    const filter = pick(req.query, [
        'userName',
        'phone',
        'userRole',
        'status',
        'isEmailVerified',
        'email',
        'from_date',
        'to_date',
    ]);
    const options = pick(req.query, ['sortBy', 'sortType', 'limit', 'page']);

    applyDateFilter(filter);

    if (filter.userName) {
        filter.userName = {
            contains: filter.userName,
            mode: 'insensitive',
        };
    }

    const result = await userService.queryUsers(filter, options);

    if (!result || result.length === 0) {
        res.status(200).json({
            status: '404',
            message: 'No Users found',
            data: [],
        });
        return;
    }

    res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: result,
    });
});

// Get User By ID
const getUserById = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.userId);

    if (!user) {
        res.status(200).json({
            status: '404',
            message: 'No User found',
            data: [],
        });
        return;
    }

    res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: user,
    });
});

// Update User
const updateUser = catchAsync(async (req, res) => {
    try {
        const user = await userService.updateUserById(
            req.params.userId,
            req.body
        );
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user,
        });
    } catch (error) {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
    }
});

// Delete User
const deleteUser = catchAsync(async (req, res) => {
    try {
        await userService.deleteUserById(req.params.userId);
        res.status(httpStatus.NO_CONTENT).send({message: "User deleted successfully"});
    } catch (error) {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
    }
});

export default {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
