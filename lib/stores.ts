export type Store = {
    id: string; // Store ID (e.g. 123456)
    name: string;
    address: string;
};

// Mock Data Hierarchy: City -> District -> Road -> Stores
export type RoadData = {
    name: string;
    stores: Store[];
};

export type DistrictData = {
    name: string;
    roads: RoadData[];
};

export type CityData = {
    name: string;
    districts: DistrictData[];
};

export const TAIWAN_STORES: CityData[] = [
    {
        name: "Taipei City",
        districts: [
            {
                name: "Xinyi District",
                roads: [
                    {
                        name: "Xinyi Road Sec. 5",
                        stores: [
                            { id: "111001", name: "Taipei 101 Store", address: "No. 7, Sec. 5, Xinyi Rd, Xinyi Dist, Taipei City" },
                            { id: "111002", name: "World Trade Center", address: "No. 5, Sec. 5, Xinyi Rd, Xinyi Dist, Taipei City" },
                        ]
                    },
                    {
                        name: "Songren Road",
                        stores: [
                            { id: "111003", name: "Breeze Nanshan", address: "No. 100, Songren Rd, Xinyi Dist, Taipei City" },
                        ]
                    }
                ]
            },
            {
                name: "Da'an District",
                roads: [
                    {
                        name: "Heping E. Road",
                        stores: [
                            { id: "112001", name: "NTU Store", address: "No. 1, Sec. 1, Heping E Rd, Da'an Dist, Taipei City" }
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: "New Taipei City",
        districts: [
            {
                name: "Banqiao District",
                roads: [
                    {
                        name: "Xianmin Blvd",
                        stores: [
                            { id: "220001", name: "Banqiao Station", address: "No. 7, Sec. 2, Xianmin Blvd, Banqiao Dist, New Taipei City" }
                        ]
                    }
                ]
            }
        ]
    }
];
