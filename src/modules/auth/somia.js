import Model from "../../../databases/modeles/somia";

export const somiaStaus = async (req, res) => {
    try {
        const weekly = await Model.aggregate([
            {
                $group: {
                    _id: { year: { $year: "$date" }, week: { $week: "$date" } },
                    data: {
                        $push: {
                            _id: "$_id",
                            date: "$date",
                            feeling: "$feeling",
                            description: "$description",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.week": 1 },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    week: "$_id.week",
                    count: 1,
                    data: 1,
                },
            },
        ]);
        const monthly = await Model.aggregate([
            {
                $group: {
                    _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                    data: {
                        $push: {
                            _id: "$_id",
                            date: "$date",
                            feeling: "$feeling",
                            description: "$description",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    month: "$_id.month",
                    count: 1,
                    data: 1,
                },
            },
        ]);
        const daily = await Model.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    },
                    data: {
                        $push: {
                            _id: "$_id",
                            date: "$date",
                            feeling: "$feeling",
                            description: "$description",
                        },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.date": 1 },
            },
            {
                $project: {
                    _id: 0,
                    year: "$_id.year",
                    date: "$_id.date",
                    count: 1,
                    data: 1,
                },
            },
        ]);

        const somiaObj = { weekly, monthly, daily };
        res.status(200).json(somiaObj);
    } catch (error) {
        console.log(error.message);
    }
};