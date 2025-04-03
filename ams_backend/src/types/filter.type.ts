
type ISODateString = `${number}-${number}-${number}`;

export type DateFilter = {
    from_date?: ISODateString;
    to_date?: ISODateString;
    createdAt?: {
        gte?: Date;
        lte?: Date;
    };
}