// whatsapp.js — Geração de link wa.me com mensagem pré-formatada
// ÚNICO ponto de configuração do telefone do artista no projeto.

// Telefone placeholder (D-07): atualizar quando Carlos confirmar o número real.
// Formato wa.me exige apenas dígitos (sem +, sem espaço, sem hífen).
const PHONE_NUMBER = '5511999999999';

/**
 * Monta um link wa.me com uma mensagem pré-formatada incluindo o nome da obra.
 * A mensagem inteira é URL-encoded para suportar acentos e caracteres especiais.
 *
 * @param {{ nome: string }} obra — objeto de obra (apenas nome é necessário)
 * @returns {string} URL completa pronta para usar em href
 */
export function buildWhatsAppLink(obra) {
  const nome = (obra && obra.nome) ? obra.nome : '';
  const message = `Olá Carlos, tenho interesse na obra "${nome}". Poderia me dar mais informações?`;
  return `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}
