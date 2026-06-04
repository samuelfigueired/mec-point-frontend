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
  valor: number;
  ativo: boolean;
  categoria?: string;
}

export type StatusAgendamento = 'PENDENTE' | 'AGENDADO' | 'CONFIRMADO' | 'EM_ANDAMENTO' | 'QUASE_FINALIZADO' | 'FINALIZADO' | 'CANCELADO';

export interface Agendamento {
  id?: number;
  numeroAgd?: string;
  cliente?: string;
  servico?: string;
  descricao?: string;
  dataHora: string;
  status: StatusAgendamento;
  veiculoId: number;
  veiculoModelo?: string;
  veiculoMarca?: string;
  veiculoPlaca?: string;
  usuarioId: number;
  usuarioNome?: string;
  mecanicoId?: number;
  mecanicoNome?: string;
  servicoId?: number;
  servicoNome?: string;
  servicoValor?: number;
}

export interface EventoAgendamento {
  id?: number;
  agendamentoId: number;
  numeroAgendamento?: string;
  titulo: string;
  descricao?: string;
  status?: StatusAgendamento;
  dataEvento?: string;
  criadoPorId?: number;
  criadoPorNome?: string;
}

export interface DashboardMecanico {
  total: number;
  pendentes: number;
  agendados: number;
  confirmados: number;
  emAndamento: number;
  quaseFinalizados: number;
  finalizados: number;
  cancelados: number;
}
