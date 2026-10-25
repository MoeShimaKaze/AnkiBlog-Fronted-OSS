import type { OutfitLog } from '@/types/outfit';

const OUTFIT_PLACEHOLDER_IMAGE = '/placeholder-outfit.jpg';

export const getOutfitDisplayImage = (outfit: OutfitLog): string => {
    if (outfit.outfitImage) {
        return outfit.outfitImage;
    }

    const mainItemImage = outfit.items?.find(item => item.itemType === 'MAIN' && item.productMainImage)?.productMainImage;
    if (mainItemImage) {
        return mainItemImage;
    }

    return outfit.items?.find(item => item.productMainImage)?.productMainImage || OUTFIT_PLACEHOLDER_IMAGE;
};
