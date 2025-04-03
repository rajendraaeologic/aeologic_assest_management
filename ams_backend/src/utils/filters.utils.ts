import { startOfDay, endOfDay } from 'date-fns';
import {DateFilter} from "@/types/filter.type";

export const applyDateFilter = (filter: DateFilter) => {
    if (filter.from_date || filter.to_date) {
        filter.createdAt = {};

        if (filter.from_date) {
            filter.createdAt.gte = startOfDay(new Date(`${filter.from_date}`));
            delete filter.from_date;
        }

        if (filter.to_date) {
            filter.createdAt.lte = endOfDay(new Date(`${filter.to_date}`));
            delete filter.to_date;
        }
    }
};
