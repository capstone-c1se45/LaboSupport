import { bhxhPriceIndexModel } from "../models/bhxhPriceIndex.model.js";

let CACHE = null;

export async function loadHeSoTruotGia() {
  CACHE = await bhxhPriceIndexModel.getAll();
}

export function getHeSoTruotGia(year) {
  if (!CACHE) return 1;
  return CACHE[year] || 1;
}
