import catchAsync from "@/lib/catchAsync";
import { basicService } from "@/services";

const getCountries = catchAsync(async (req, res) => {
  const countries = await basicService.getCountries();
  res.send({ countries });
});

export default {
  getCountries,
};
