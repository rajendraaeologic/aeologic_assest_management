import httpStatus from 'http-status';
import ApiError from '@/lib/ApiError';
import db from '@/lib/db';

const getCountries = async () => {
  try {
    return '';
    // return await db.country.findMany({
    //   include: {
    //     State: {
    //       include: {
    //         Cities: true,
    //       },
    //     },
    //   },
    // });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Get Countries failed');
  }
};


export default {
  getCountries,
};
