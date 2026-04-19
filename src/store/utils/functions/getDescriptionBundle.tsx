import { IBundleData } from "../interfaces";

export const getDescriptionBundle = (bundle: IBundleData) => {
  return `${bundle.duration} ${bundle.duration > 1 ? 'días' : 'día'} datos ${bundle.unlimited ? 'ilimitados' : `${bundle.dataAmount * 0.001} GB`}`
}
