
export interface MageConfig {
    meta: {
        author: string;
        title: string;
        link: string;
        description: string;
    };
    config: Record<string, any>;
    [key: string]: any;
}

export interface Mage {
    id: string; // derived from filename
    data: MageConfig;
}

const magesModules = import.meta.glob('../mages/*.json', { eager: true });

export const getMages = (): Mage[] => {
    return Object.entries(magesModules).map(([path, module]) => {
        // extract filename as ID, e.g., "../mages/vegan-mage-1.1.json" -> "vegan-mage-1.1"
        const filename = path.split('/').pop()?.replace('.json', '') || '';

        const data = (module as any).default || module;
        return {
            id: filename,
            data: data as MageConfig,
        };
    });
};

export const getMageById = (id: string): Mage | undefined => {
    const mages = getMages();
    return mages.find(m => m.id === id);
};
