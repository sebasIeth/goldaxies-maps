export type Lang = "en" | "es";

export const LANG_KEY = "goldaxis-lang";

export const mapTranslations = {
  tracingRoute: { en: "Tracing route...", es: "Trazando ruta..." },
  nearbyCommerces: { en: "nearby commerces", es: "comercios cercanos" },
  searchPlaceholder: { en: "Search commerce...", es: "Buscar comercio..." },
  noResults: { en: "No commerces found", es: "No se encontraron comercios" },
  getDirections: { en: "Get directions", es: "Cómo llegar" },
  recalcRoute: { en: "Recalculate route", es: "Recalcular ruta" },
  yourLocation: { en: "Your Location", es: "Tu Ubicación" },
  locationDesc: { en: "Select your country and province.", es: "Selecciona tu país y provincia." },
  locationFound: { en: "Location found", es: "Ubicación encontrada" },
  selectCountry: { en: "Select country", es: "Selecciona país" },
  selectProvince: { en: "Select province / state", es: "Selecciona provincia / estado" },
  selectCity: { en: "Select city / neighborhood", es: "Selecciona ciudad / barrio" },
  loadingProvinces: { en: "Loading provinces...", es: "Cargando provincias..." },
  loadingCities: { en: "Loading cities...", es: "Cargando ciudades..." },
  confirmLocation: { en: "Confirm location", es: "Confirmar ubicación" },
  skipForNow: { en: "Skip for now", es: "Omitir por ahora" },
  searchAddress: { en: "Search your address...", es: "Busca tu dirección..." },
} as const;

export function t(key: keyof typeof mapTranslations, lang: Lang): string {
  return mapTranslations[key][lang];
}
