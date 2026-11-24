import mockData from '../datas/mockData.json';

let activeVariant = 'variantA';

export const simulateRequest = (data: any[], delay = 150) =>
    new Promise((resolve) => {
        setTimeout(() => resolve(structuredClone(data)), delay);
    });

export const getDataset = (variant = activeVariant) => {
    const dataset = mockData[variant];
    if (!dataset) {
        throw new Error(`Вариант "${variant}" не найден в мок-файле`);
    }
    return dataset;
};


export const setVariant = (variant) => {
    if (!mockData[variant]) {
        throw new Error(`Неизвестный вариант: ${variant}`);
    }
    activeVariant = variant;
};

export const getCurrentVariant = () => activeVariant;

export const getStoreInfo = async (variant) => {
    const { companyName, catalogTitle } = getDataset(variant);
    return simulateRequest({ companyName, catalogTitle });
};

export const getCategories = async (variant) => {
    return simulateRequest(getDataset(variant).categories);
};

export const getManufacturers = async (variant) => {
    const names = getDataset(variant).products.map((p) => p.manufacturer_name);
    const uniqueNames = [...new Set(names)].sort();
    return simulateRequest(uniqueNames);
};