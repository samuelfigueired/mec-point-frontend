export type Role = 'CLIENTE' | 'MECANICO' | 'ADMIN';

export interface User {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  role: Role;
}

export interface AuthRequest { email: string; senha: string; }
export interface AuthResponse { token: string; user: User; }
export interface RegisterRequest { nome: string; email: string; senha: string; }

export interface Veiculo {
  id?: number;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cambio: string;
  usuarioId?: number;
  usuarioNome?: string;
}

export interface Servico {
  id?: number;
  nome: string;
  descricao?: string;
  preco: number;
  ativo: boolean;
}

export type StatusAgendamento = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';

export interface Agendamento {
  id?: number;
  usuarioId: number;
  mecanicoId?: number;
  veiculoId: number;
  servicoId: number;
  dataInicio: string;
  dataFim?: string;
  status: StatusAgendamento;
  descricao?: string;
  // joined
  cliente?: User;
  mecanico?: User;
  veiculo?: Veiculo;
  servico?: Servico;
}

export interface EventoAgendamento {
  id?: number;
  agendamentoId: number;
  titulo: string;
  descricao?: string;
  data: string;
}

export interface DashboardMecanico {
  pendentes: number;
  emAndamento: number;
  concluidos: number;
  cancelados: number;
}
