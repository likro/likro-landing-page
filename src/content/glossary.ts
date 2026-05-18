/**
 * Glossário vertical Likro — termos aprovados para uso em copy das seções (COPY-05).
 *
 * Esta é a fonte canônica consultada na redação de cada variante de copy
 * (src/content/<sec>.ts). Importação direta NÃO é obrigatória — copy modules
 * podem usar as strings finais diretamente. Este arquivo serve como referência
 * canônica de grafia, capitalização e terminologia vertical clínica.
 *
 * Novos termos exigem aprovação Lenny via PR.
 */
export const CLINICA_GLOSSARY = {
  atendimento: "atendimento",
  agendamento: "agendamento",
  paciente: "paciente",
  retorno: "retorno",
  followUp: "follow-up",
  recepcao: "recepção",
  equipeAtendimento: "equipe de atendimento",
  lead: "lead",
  estetica: "estética",
  dermatologia: "dermatologia",
  harmonizacao: "harmonização facial",
  odontologia: "odontologia",
  bemEstar: "bem-estar",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  inboxMulticanal: "caixa de entrada multicanal",
  distribuicaoAutomatica: "distribuição automática",
  agendaIntegrada: "agenda integrada",
} as const;

export type ClinicaGlossaryKey = keyof typeof CLINICA_GLOSSARY;
