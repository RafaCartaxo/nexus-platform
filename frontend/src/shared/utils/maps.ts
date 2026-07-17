interface MapsTarget {
  clienteLat: number | null
  clienteLng: number | null
  clienteLogradouro: string
  clienteNumero: string | null
  clienteBairro: string | null
  clienteCidade: string | null
  clienteEstado: string | null
}

export function buildMapsUrl(item: MapsTarget): string | null {
  if (item.clienteLat && item.clienteLng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${item.clienteLat},${item.clienteLng}`
  }

  const parts = [
    item.clienteLogradouro,
    item.clienteNumero,
    item.clienteBairro,
    item.clienteCidade,
    item.clienteEstado,
  ].filter((p): p is string => !!p)

  if (parts.length >= 2) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parts.join(", "))}`
  }

  return null
}
