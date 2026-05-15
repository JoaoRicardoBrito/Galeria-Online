// whatsapp.js — Geração de contato via wa.me.
// Único ponto de configuração do telefone do artista neste arquivo.

// Formato wa.me: apenas dígitos, incluindo DDI + DDD.
const ARTIST_WHATSAPP_NUMBER = '5511999999999';
const AVAILABLE_STATUS = 'disponivel';

/**
 * Monta um link wa.me com uma mensagem pré-formatada incluindo o nome da obra.
 * @param {string} obraNome
 * @returns {string}
 */
export function buildWhatsAppLink(obraNome) {
  const nome = obraNome || '';
  const message = `Olá Carlos, tenho interesse na obra "${nome}". Poderia me dar mais informações?`;

  return `https://wa.me/${ARTIST_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Indica se a obra pode exibir contato por WhatsApp.
 * @param {{ status?: string }} obra
 * @returns {boolean}
 */
export function canContactByWhatsApp(obra) {
  return obra?.status === AVAILABLE_STATUS;
}

/**
 * Retorna os atributos necessários para um link de contato em nova aba.
 * @param {{ nome?: string, status?: string }} obra
 * @returns {{ href: string, target: string, rel: string } | null}
 */
export function getWhatsAppLinkAttributes(obra) {
  if (!canContactByWhatsApp(obra)) return null;

  return {
    href: buildWhatsAppLink(obra.nome),
    target: '_blank',
    rel: 'noopener',
  };
}
