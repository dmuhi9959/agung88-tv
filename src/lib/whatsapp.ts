export const ADMIN_WHATSAPP_NUMBER = '6289693388835'
export const ADMIN_WHATSAPP_DISPLAY = '0' + ADMIN_WHATSAPP_NUMBER.slice(2)
export function getWhatsAppLink(customMessage?: string): string {
  const message = customMessage || 'Halo Admin BIRU TV, saya butuh bantuan. Terima kasih.'
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
