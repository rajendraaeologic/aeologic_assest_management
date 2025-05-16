import catchAsync from "@/lib/catchAsync";
import { basicService } from "@/services";


/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Get all countries
 *     description: Returns a list of countries
 *     tags:
 *       - Basic
 *     responses:
 *       200:
 *         description: List of countries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 countries:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [ "India", "United States", "Germany" ]
 *       500:
 *         description: Internal server error
 */

const getCountries = catchAsync(async (req, res) => {
  const countries = await basicService.getCountries();
  res.send({ countries });
});

export default {
  getCountries,
};
