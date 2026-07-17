interface GeocodingResult {
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  estado?: string
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=pt-BR`
  const resp = await fetch(url, {
    headers: { "User-Agent": "GestaoCobrancas/1.0" },
  })
  if (!resp.ok) throw new Error("Erro ao consultar endereço")
  const data = await resp.json()
  const addr = data.address ?? {}
  return {
    logradouro: addr.road,
    numero: addr.house_number,
    bairro: addr.suburb ?? addr.neighbourhood,
    cidade: addr.city ?? addr.town ?? addr.village,
    estado: addr.state,
  }
}
