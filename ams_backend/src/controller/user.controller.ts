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
            status: req.body.status,
            userRole: req.body.userRole,
        } as User);

        res.status(httpStatus.CREATED).send({user, message: "User Created Successfully."});
    } catch (error) {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
    }
});

const getUsers = catchAsync(async (req, res) => {
    const filter = pick(req.query, [
        'name','phone', 'userRole','status','isEmailVerified',
        'email', 'from_date', 'to_date'
    ]);

    applyDateFilter(filter);

    const options = pick(req.query, ['sortBy','sortType', 'limit', 'page']);

    if (filter.name){
        filter.name =  {
            contains: filter.name,
            mode: 'insensitive',
        }
    }

    console.log(options)
    const result = await userService.queryUsers(filter, options);
    res.send(result);
});

const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.userId);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
    try{
        const user = await userService.updateUserById(req.params.userId, req.body);
        res.send(user);
    } catch (error) {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
    }
});


const deleteUser = catchAsync(async (req, res) => {
    try{
        await userService.deleteUserById(req.params.userId);
        res.status(httpStatus.NO_CONTENT).send({message: "User deleted successfully"});
    } catch (error) {
        throw new ApiError(httpStatus.NOT_FOUND, error.message);
    }
});

export default {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
};