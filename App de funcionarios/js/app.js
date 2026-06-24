/* ═══════════════════════════════════════════════════════════════
   MH Facilities — App Operacional
   Todos os módulos, CRUD em localStorage, print
═══════════════════════════════════════════════════════════════ */

// ── STORE ──────────────────────────────────────────────────────
const DB = {
  get(key)        { return JSON.parse(localStorage.getItem(key) || '[]'); },
  save(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
  add(key, item)  {
    const arr = this.get(key);
    arr.unshift({ ...item, id: Date.now() });
    this.save(key, arr);
  },
  remove(key, id) {
    this.save(key, this.get(key).filter(x => x.id !== id));
  },
  update(key, id, patch) {
    this.save(key, this.get(key).map(x => x.id === id ? { ...x, ...patch } : x));
  },
  count(key)      { return this.get(key).length; }
};

// ── AUTO-NÚMERO ─────────────────────────────────────────────────
function nextNum(key, prefix) {
  const n = DB.count(key) + 1;
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

// ── MÓDULOS ─────────────────────────────────────────────────────
const MODULES = [
  /* ── OPERACIONAL ──────────────────────────────────────────── */
  {
    id: 'os', title: 'Ordem de Serviço', group: 'Operacional',
    icon: '📋', key: 'mh_os', printable: true,
    autoNum: { field: 'numero', prefix: 'OS' },
    desc: 'Formaliza cada trabalho realizado com data, local e responsável.',
    fields: [
      { name: 'numero',      label: 'Nº OS',              type: 'text',     readonly: true },
      { name: 'data',        label: 'Data',                type: 'date',     required: true, half: true },
      { name: 'cliente',     label: 'Cliente / Condomínio',type: 'text',     required: true, half: true },
      { name: 'local',       label: 'Local / Posto',       type: 'text',     required: true, half: true },
      { name: 'funcionario', label: 'Funcionário Responsável', type: 'text', required: true, half: true },
      { name: 'tipo_servico',label: 'Tipo de Serviço',     type: 'select',   required: true, half: true,
        options: ['Portaria','Limpeza','Zeladoria','Segurança Patrimonial','Controle de Acesso','Facilities Corporativas'] },
      { name: 'status',      label: 'Status',              type: 'select',   required: true, half: true,
        options: ['Pendente','Em andamento','Concluído','Cancelado'] },
      { name: 'descricao',   label: 'Descrição do Trabalho', type: 'textarea', required: true, full: true },
      { name: 'assinatura',  label: 'Nome do Responsável pelo Cliente (Assinatura)', type: 'text', full: true },
    ],
    columns: [
      { key: 'numero',       label: 'Nº OS' },
      { key: 'data',         label: 'Data',        fmt: 'date' },
      { key: 'cliente',      label: 'Cliente' },
      { key: 'funcionario',  label: 'Funcionário' },
      { key: 'tipo_servico', label: 'Serviço' },
      { key: 'status',       label: 'Status',      badge: true },
    ]
  },

  {
    id: 'checklist', title: 'Checklist de Supervisão', group: 'Operacional',
    icon: '✅', key: 'mh_checklist',
    desc: 'Vistoria diária/semanal preenchida pelo supervisor para garantir qualidade.',
    fields: [
      { name: 'data',       label: 'Data da Vistoria', type: 'date',   required: true, half: true },
      { name: 'tipo',       label: 'Tipo',             type: 'select', required: true, half: true,
        options: ['Diária','Semanal'] },
      { name: 'supervisor', label: 'Supervisor',        type: 'text',   required: true, half: true },
      { name: 'local',      label: 'Local / Posto',     type: 'text',   required: true, half: true },
      { name: 'items',      label: 'Itens Verificados', type: 'checklist', full: true,
        options: [
          'Apresentação e uniforme da equipe',
          'Limpeza das áreas comuns',
          'Portaria organizada e limpa',
          'Equipamentos em bom estado',
          'Postura e conduta dos colaboradores',
          'Registro de visitas atualizado',
          'Iluminação das áreas verificada',
          'Lixeiras limpas e no local correto',
          'Elevadores e corredores limpos',
          'Área externa e estacionamento limpos',
          'Banheiros higienizados',
          'Sala de lixo organizada',
          'Portão/cancela funcionando',
          'Material de limpeza estocado',
          'Ocorrências registradas corretamente',
        ]
      },
      { name: 'nota',  label: 'Avaliação Geral', type: 'select', half: true,
        options: ['Ótimo','Bom','Regular','Ruim'] },
      { name: 'obs',   label: 'Observações',     type: 'textarea', full: true },
    ],
    columns: [
      { key: 'data',       label: 'Data',       fmt: 'date' },
      { key: 'tipo',       label: 'Tipo' },
      { key: 'supervisor', label: 'Supervisor' },
      { key: 'local',      label: 'Local' },
      { key: 'nota',       label: 'Avaliação',  badge: true },
    ]
  },

  {
    id: 'relatorio', title: 'Relatório Mensal', group: 'Operacional',
    icon: '📊', key: 'mh_relatorio', printable: true,
    desc: 'Comprovante mensal de serviços entregues ao cliente.',
    fields: [
      { name: 'mes',      label: 'Mês',               type: 'select', required: true, half: true,
        options: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'] },
      { name: 'ano',      label: 'Ano',               type: 'text',   required: true, half: true, placeholder: '2025' },
      { name: 'cliente',  label: 'Cliente / Condomínio', type: 'text', required: true, full: true },
      { name: 'os_realizadas', label: 'OS Realizadas no Período', type: 'text', half: true },
      { name: 'ocorrencias',  label: 'Nº de Ocorrências',         type: 'text', half: true },
      { name: 'indice_qualidade', label: 'Índice de Qualidade (%)', type: 'text', half: true },
      { name: 'satisfacao',       label: 'Nota de Satisfação (1-5)', type: 'text', half: true },
      { name: 'servicos',     label: 'Serviços Realizados',    type: 'textarea', full: true },
      { name: 'observacoes',  label: 'Observações do Gestor',  type: 'textarea', full: true },
      { name: 'status',       label: 'Status',                 type: 'select', half: true,
        options: ['Rascunho','Enviado ao cliente','Aprovado'] },
    ],
    columns: [
      { key: 'mes',     label: 'Mês' },
      { key: 'ano',     label: 'Ano' },
      { key: 'cliente', label: 'Cliente' },
      { key: 'os_realizadas', label: 'OS' },
      { key: 'status',  label: 'Status', badge: true },
    ]
  },

  {
    id: 'ocorrencia', title: 'Ficha de Ocorrência', group: 'Operacional',
    icon: '⚠️', key: 'mh_ocorrencia',
    autoNum: { field: 'numero', prefix: 'OC' },
    desc: 'Registro de incidentes, reclamações ou irregularidades.',
    fields: [
      { name: 'numero',      label: 'Nº Ocorrência',  type: 'text',   readonly: true },
      { name: 'data',        label: 'Data / Hora',     type: 'datetime-local', required: true, half: true },
      { name: 'tipo',        label: 'Tipo',            type: 'select', required: true, half: true,
        options: ['Incidente','Reclamação','Irregularidade','Acidente','Perda de material','Outro'] },
      { name: 'local',       label: 'Local',           type: 'text',   required: true, half: true },
      { name: 'funcionario', label: 'Funcionário Envolvido', type: 'text', half: true },
      { name: 'relato',      label: 'Relato da Ocorrência',  type: 'textarea', required: true, full: true },
      { name: 'providencias',label: 'Providências Tomadas',  type: 'textarea', full: true },
      { name: 'status',      label: 'Status',          type: 'select', half: true,
        options: ['Aberta','Em análise','Encerrada'] },
    ],
    columns: [
      { key: 'numero',      label: 'Nº' },
      { key: 'data',        label: 'Data',    fmt: 'datetime' },
      { key: 'tipo',        label: 'Tipo' },
      { key: 'local',       label: 'Local' },
      { key: 'funcionario', label: 'Funcionário' },
      { key: 'status',      label: 'Status', badge: true },
    ]
  },

  /* ── RH / FUNCIONÁRIOS ────────────────────────────────────── */
  {
    id: 'funcionarios', title: 'Cadastro de Funcionário', group: 'RH / Funcionários',
    icon: '👤', key: 'mh_funcionarios',
    desc: 'Dados pessoais, documentos, função e salário de cada colaborador.',
    fields: [
      { name: 'nome',       label: 'Nome Completo',   type: 'text',   required: true, full: true },
      { name: 'cpf',        label: 'CPF',             type: 'text',   required: true, half: true, placeholder: '000.000.000-00' },
      { name: 'rg',         label: 'RG',              type: 'text',   half: true },
      { name: 'nascimento', label: 'Data de Nascimento', type: 'date', half: true },
      { name: 'telefone',   label: 'Telefone',        type: 'text',   half: true, placeholder: '(11) 90000-0000' },
      { name: 'email',      label: 'E-mail',          type: 'email',  half: true },
      { name: 'endereco',   label: 'Endereço Completo', type: 'text', full: true },
      { name: 'funcao',     label: 'Função',          type: 'select', required: true, half: true,
        options: ['Porteiro','Zelador','Auxiliar de Limpeza','Segurança Patrimonial','Supervisor','Auxiliar Administrativo','Outro'] },
      { name: 'salario',    label: 'Salário (R$)',    type: 'text',   half: true, placeholder: '0,00' },
      { name: 'admissao',   label: 'Data de Admissão', type: 'date', half: true },
      { name: 'posto',      label: 'Posto / Local de Trabalho', type: 'text', half: true },
      { name: 'status',     label: 'Status',          type: 'select', half: true,
        options: ['Ativo','Inativo','Férias','Afastado'] },
      { name: 'obs',        label: 'Observações',     type: 'textarea', full: true },
    ],
    columns: [
      { key: 'nome',     label: 'Nome' },
      { key: 'cpf',      label: 'CPF' },
      { key: 'funcao',   label: 'Função' },
      { key: 'posto',    label: 'Posto' },
      { key: 'admissao', label: 'Admissão', fmt: 'date' },
      { key: 'status',   label: 'Status', badge: true },
    ]
  },

  {
    id: 'avaliacao', title: 'Avaliação de Desempenho', group: 'RH / Funcionários',
    icon: '⭐', key: 'mh_avaliacao',
    desc: 'Formulário periódico de avaliação do colaborador por critérios.',
    fields: [
      { name: 'funcionario', label: 'Funcionário',        type: 'text',   required: true, full: true },
      { name: 'periodo',     label: 'Período de Referência', type: 'text', half: true, placeholder: 'Ex: Junho/2025' },
      { name: 'avaliador',   label: 'Avaliador',          type: 'text',   half: true },
      { name: 'criterios',   label: 'Critérios de Avaliação (1 a 5)', type: 'rating', full: true,
        options: ['Pontualidade e assiduidade','Apresentação e uniforme','Postura e atendimento','Cooperação e proatividade','Qualidade do trabalho'] },
      { name: 'obs',         label: 'Observações',        type: 'textarea', full: true },
    ],
    columns: [
      { key: 'funcionario', label: 'Funcionário' },
      { key: 'periodo',     label: 'Período' },
      { key: 'avaliador',   label: 'Avaliador' },
      { key: '_nota',       label: 'Nota Média', computed: true },
    ]
  },

  {
    id: 'escala', title: 'Escala de Trabalho', group: 'RH / Funcionários',
    icon: '📅', key: 'mh_escala',
    desc: 'Planilha de turnos e horários por funcionário e posto.',
    fields: [
      { name: 'funcionario',  label: 'Funcionário',   type: 'text',   required: true, full: true },
      { name: 'posto',        label: 'Posto / Local', type: 'text',   required: true, half: true },
      { name: 'turno',        label: 'Turno',         type: 'select', required: true, half: true,
        options: ['Manhã 06h–14h','Tarde 14h–22h','Noite 22h–06h','Diurno 08h–17h','12x36 Dia','12x36 Noite'] },
      { name: 'dias',         label: 'Dias da Semana', type: 'weekdays', full: true },
      { name: 'data_inicio',  label: 'Início',        type: 'date',   half: true },
      { name: 'data_fim',     label: 'Fim',           type: 'date',   half: true },
      { name: 'obs',          label: 'Observações',   type: 'textarea', full: true },
    ],
    columns: [
      { key: 'funcionario', label: 'Funcionário' },
      { key: 'posto',       label: 'Posto' },
      { key: 'turno',       label: 'Turno' },
      { key: 'dias',        label: 'Dias', fmt: 'dias' },
      { key: 'data_inicio', label: 'Início', fmt: 'date' },
      { key: 'data_fim',    label: 'Fim',    fmt: 'date' },
    ]
  },

  /* ── FINANCEIRO ───────────────────────────────────────────── */
  {
    id: 'faturamento', title: 'Faturamento / Contas a Receber', group: 'Financeiro',
    icon: '💰', key: 'mh_faturamento', hasSummary: true,
    desc: 'Controle de quem pagou e quem está em aberto.',
    fields: [
      { name: 'cliente',     label: 'Cliente / Condomínio', type: 'text',   required: true, full: true },
      { name: 'referencia',  label: 'Referência (Mês/Serviço)', type: 'text', required: true, half: true },
      { name: 'valor',       label: 'Valor (R$)',           type: 'text',   required: true, half: true, placeholder: '0,00' },
      { name: 'vencimento',  label: 'Vencimento',           type: 'date',   required: true, half: true },
      { name: 'status',      label: 'Status',               type: 'select', required: true, half: true,
        options: ['Pendente','Pago','Atrasado'] },
      { name: 'pagamento',   label: 'Data do Pagamento',    type: 'date',   half: true },
      { name: 'obs',         label: 'Observações',          type: 'textarea', full: true },
    ],
    columns: [
      { key: 'cliente',    label: 'Cliente' },
      { key: 'referencia', label: 'Referência' },
      { key: 'valor',      label: 'Valor (R$)',  fmt: 'currency' },
      { key: 'vencimento', label: 'Vencimento',  fmt: 'date' },
      { key: 'status',     label: 'Status',      badge: true },
    ]
  },

  {
    id: 'recibo', title: 'Recibo de Serviços', group: 'Financeiro',
    icon: '🧾', key: 'mh_recibo', printable: true,
    autoNum: { field: 'numero', prefix: 'REC' },
    desc: 'Recibo para clientes sem nota fiscal eletrônica.',
    fields: [
      { name: 'numero',    label: 'Nº Recibo',            type: 'text',  readonly: true },
      { name: 'data',      label: 'Data',                 type: 'date',  required: true, half: true },
      { name: 'cliente',   label: 'Cliente / Pagador',    type: 'text',  required: true, half: true },
      { name: 'cnpj_cpf', label: 'CNPJ / CPF do Cliente', type: 'text', half: true },
      { name: 'valor',     label: 'Valor (R$)',           type: 'text',  required: true, half: true, placeholder: '0,00' },
      { name: 'descricao', label: 'Descrição do Serviço', type: 'textarea', required: true, full: true },
      { name: 'obs',       label: 'Observações',          type: 'textarea', full: true },
    ],
    columns: [
      { key: 'numero',  label: 'Nº Recibo' },
      { key: 'data',    label: 'Data',    fmt: 'date' },
      { key: 'cliente', label: 'Cliente' },
      { key: 'valor',   label: 'Valor',   fmt: 'currency' },
    ]
  },

  /* ── CLIENTES ─────────────────────────────────────────────── */
  {
    id: 'clientes', title: 'Cadastro de Cliente', group: 'Clientes',
    icon: '🏢', key: 'mh_clientes',
    desc: 'Dados do cliente, contrato ativo e histórico.',
    fields: [
      { name: 'nome',        label: 'Nome / Razão Social',    type: 'text',   required: true, full: true },
      { name: 'cnpj_cpf',   label: 'CNPJ / CPF',             type: 'text',   half: true },
      { name: 'endereco',    label: 'Endereço',               type: 'text',   full: true },
      { name: 'contato',     label: 'Nome do Responsável',    type: 'text',   half: true },
      { name: 'telefone',    label: 'Telefone',               type: 'text',   half: true, placeholder: '(11) 90000-0000' },
      { name: 'email',       label: 'E-mail',                 type: 'email',  half: true },
      { name: 'servicos',    label: 'Serviços Contratados',   type: 'text',   full: true },
      { name: 'inicio_contrato', label: 'Início do Contrato', type: 'date',  half: true },
      { name: 'status',      label: 'Status',                 type: 'select', half: true,
        options: ['Ativo','Inativo','Negociação','Encerrado'] },
      { name: 'obs',         label: 'Observações',            type: 'textarea', full: true },
    ],
    columns: [
      { key: 'nome',        label: 'Nome / Razão Social' },
      { key: 'cnpj_cpf',   label: 'CNPJ / CPF' },
      { key: 'contato',     label: 'Responsável' },
      { key: 'telefone',    label: 'Telefone' },
      { key: 'inicio_contrato', label: 'Contrato desde', fmt: 'date' },
      { key: 'status',      label: 'Status', badge: true },
    ]
  },

  {
    id: 'pesquisa', title: 'Pesquisa de Satisfação', group: 'Clientes',
    icon: '📝', key: 'mh_pesquisa',
    desc: 'Formulário curto de satisfação enviado mensalmente ao cliente.',
    fields: [
      { name: 'cliente',  label: 'Cliente',              type: 'text',   required: true, full: true },
      { name: 'mes',      label: 'Mês de Referência',    type: 'text',   required: true, half: true, placeholder: 'Ex: Junho/2025' },
      { name: 'criterios', label: 'Avaliação (1 a 5)',   type: 'rating', full: true,
        options: ['Qualidade do serviço','Pontualidade da equipe','Comunicação / Atendimento','Profissionalismo dos colaboradores'] },
      { name: 'comentario', label: 'Comentário / Sugestão', type: 'textarea', full: true },
    ],
    columns: [
      { key: 'cliente',   label: 'Cliente' },
      { key: 'mes',       label: 'Mês' },
      { key: '_nota',     label: 'Nota Média', computed: true },
      { key: 'comentario', label: 'Comentário' },
    ]
  },
];

// ── ROUTER ─────────────────────────────────────────────────────
let currentPage = 'dashboard';

function navigate(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const page = document.getElementById(`page-${id}`);
  if (page) page.classList.add('active');
  const btn = document.querySelector(`.nav-btn[data-id="${id}"]`);
  if (btn) btn.classList.add('active');
  const mod = MODULES.find(m => m.id === id);
  document.getElementById('topbar-title').textContent = mod ? mod.title : 'Dashboard';
  currentPage = id;
  if (id === 'dashboard') renderDashboard();
  // close sidebar on mobile
  if (window.innerWidth <= 768) closeSidebar();
}

// ── SIDEBAR BUILD ───────────────────────────────────────────────
function buildSidebar() {
  const nav = document.getElementById('sb-nav');
  // Dashboard button
  let html = `<button class="nav-btn active" data-id="dashboard">
    <span class="nav-icon">🏠</span> Dashboard
  </button>`;

  const groups = [...new Set(MODULES.map(m => m.group))];
  groups.forEach(g => {
    html += `<div class="nav-group-label">${g}</div>`;
    MODULES.filter(m => m.group === g).forEach(m => {
      html += `<button class="nav-btn" data-id="${m.id}">
        <span class="nav-icon">${m.icon}</span> ${m.title}
      </button>`;
    });
  });

  nav.innerHTML = html;
  nav.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.id));
  });
}

// ── SIDEBAR TOGGLE ──────────────────────────────────────────────
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sb-overlay').classList.remove('visible');
}

document.getElementById('sb-toggle').addEventListener('click', () => {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sb-overlay');
  if (window.innerWidth <= 768) {
    sb.classList.toggle('open');
    ov.classList.toggle('visible');
  }
});

// ── FORMAT HELPERS ───────────────────────────────────────────────
function fmtDate(v) {
  if (!v) return '—';
  const [y,m,d] = v.split('T')[0].split('-');
  return `${d}/${m}/${y}`;
}

function fmtDatetime(v) {
  if (!v) return '—';
  const dt = new Date(v);
  return dt.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function fmtCurrency(v) {
  if (!v) return '—';
  const n = parseFloat(v.replace(',','.'));
  if (isNaN(n)) return v;
  return n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}

function fmtDias(v) {
  if (!v || !v.length) return '—';
  const labels = { seg:'Seg',ter:'Ter',qua:'Qua',qui:'Qui',sex:'Sex',sab:'Sab',dom:'Dom' };
  return (Array.isArray(v) ? v : JSON.parse(v || '[]')).map(d => labels[d] || d).join(', ');
}

function fmtValue(col, item) {
  const v = item[col.key];
  if (col.computed) {
    if (col.key === '_nota') {
      const ratings = item.criterios ? Object.values(item.criterios) : [];
      if (!ratings.length) return '—';
      const avg = ratings.reduce((a,b) => a + Number(b), 0) / ratings.length;
      return avg.toFixed(1);
    }
    return '—';
  }
  if (col.fmt === 'date')     return fmtDate(v);
  if (col.fmt === 'datetime') return fmtDatetime(v);
  if (col.fmt === 'currency') return fmtCurrency(v);
  if (col.fmt === 'dias')     return fmtDias(v);
  return v || '—';
}

function badgeClass(val) {
  if (!val) return '';
  const map = {
    'pendente':'badge-pendente','em andamento':'badge-andamento','concluído':'badge-concluido',
    'cancelado':'badge-cancelado','pago':'badge-pago','atrasado':'badge-atrasado',
    'aberta':'badge-aberta','em análise':'badge-analise','encerrada':'badge-encerrada',
    'ativo':'badge-ativo','inativo':'badge-inativo','férias':'badge-andamento','afastado':'badge-cancelado',
    'rascunho':'badge-pendente','enviado ao cliente':'badge-andamento','aprovado':'badge-concluido',
    'ótimo':'badge-concluido','bom':'badge-andamento','regular':'badge-pendente','ruim':'badge-cancelado',
    'negociação':'badge-andamento','encerrado':'badge-cancelado',
  };
  return map[val.toLowerCase()] || '';
}

// ── TABLE RENDER ────────────────────────────────────────────────
function renderTable(mod) {
  const data = DB.get(mod.key);
  if (!data.length) {
    return `<div class="empty-state">
      <div class="empty-icon">${mod.icon}</div>
      <p>Nenhum registro ainda. Clique em <strong>+ Novo</strong> para começar.</p>
    </div>`;
  }
  const rows = data.map(item => {
    const tds = mod.columns.map(col => {
      const val = fmtValue(col, item);
      if (col.badge) return `<td><span class="badge ${badgeClass(item[col.key])}">${val}</span></td>`;
      return `<td>${val}</td>`;
    }).join('');
    const printBtn = mod.printable
      ? `<button class="btn btn-outline btn-sm" onclick="printRecord('${mod.id}',${item.id})">🖨️</button>`
      : '';
    return `<tr>
      ${tds}
      <td><div class="td-actions">
        ${printBtn}
        <button class="btn btn-danger btn-sm" onclick="deleteRecord('${mod.id}',${item.id})">Excluir</button>
      </div></td>
    </tr>`;
  }).join('');

  const ths = mod.columns.map(c => `<th>${c.label}</th>`).join('');
  return `<div class="table-wrap">
    <table>
      <thead><tr>${ths}<th>Ações</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

// ── PAGE RENDER ─────────────────────────────────────────────────
function renderPage(mod) {
  const page = document.getElementById(`page-${mod.id}`);
  let extra = '';

  if (mod.id === 'faturamento') {
    extra = renderFatSummary();
  }

  page.innerHTML = `
    <div class="page-head">
      <div>
        <p class="eyebrow">${mod.group}</p>
        <h1>${mod.icon} ${mod.title}</h1>
        <p class="muted">${mod.desc}</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-gold" onclick="openForm('${mod.id}')">+ Novo</button>
      </div>
    </div>
    ${extra}
    <div class="toolbar">
      <input class="search-box" type="text" placeholder="Buscar..." oninput="filterTable('${mod.id}',this.value)" />
    </div>
    <div id="list-${mod.id}">${renderTable(mod)}</div>
  `;
}

function refreshPage(id) {
  const mod = MODULES.find(m => m.id === id);
  if (!mod) return;
  const listEl = document.getElementById(`list-${id}`);
  if (listEl) {
    listEl.innerHTML = renderTable(mod);
    if (mod.id === 'faturamento') {
      const sumEl = document.querySelector('.fat-summary');
      if (sumEl) sumEl.outerHTML = renderFatSummary();
    }
  }
}

// ── FATURAMENTO SUMMARY ─────────────────────────────────────────
function renderFatSummary() {
  const data = DB.get('mh_faturamento');
  const toNum = v => {
    const n = parseFloat((v || '0').toString().replace(/\./g,'').replace(',','.'));
    return isNaN(n) ? 0 : n;
  };
  const pago     = data.filter(x => x.status === 'Pago').reduce((a,x) => a + toNum(x.valor), 0);
  const pendente = data.filter(x => x.status === 'Pendente').reduce((a,x) => a + toNum(x.valor), 0);
  const atrasado = data.filter(x => x.status === 'Atrasado').reduce((a,x) => a + toNum(x.valor), 0);
  const fmt = n => n.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
  return `<div class="fat-summary">
    <div class="fat-card verde"><span>Total Recebido</span><strong>${fmt(pago)}</strong></div>
    <div class="fat-card amarelo"><span>A Receber</span><strong>${fmt(pendente)}</strong></div>
    <div class="fat-card vermelho"><span>Em Atraso</span><strong>${fmt(atrasado)}</strong></div>
  </div>`;
}

// ── FILTER TABLE ────────────────────────────────────────────────
function filterTable(id, q) {
  const mod = MODULES.find(m => m.id === id);
  const data = DB.get(mod.key).filter(item =>
    Object.values(item).some(v => String(v).toLowerCase().includes(q.toLowerCase()))
  );
  const listEl = document.getElementById(`list-${id}`);
  if (!data.length) {
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><p>Nenhum resultado para "<strong>${q}</strong>".</p></div>`;
    return;
  }
  // reuse renderTable logic with filtered data
  const mod2 = { ...mod, _filtered: data };
  listEl.innerHTML = renderTableData(mod, data);
}

function renderTableData(mod, data) {
  const rows = data.map(item => {
    const tds = mod.columns.map(col => {
      const val = fmtValue(col, item);
      if (col.badge) return `<td><span class="badge ${badgeClass(item[col.key])}">${val}</span></td>`;
      return `<td>${val}</td>`;
    }).join('');
    const printBtn = mod.printable
      ? `<button class="btn btn-outline btn-sm" onclick="printRecord('${mod.id}',${item.id})">🖨️</button>`
      : '';
    return `<tr>${tds}<td><div class="td-actions">${printBtn}<button class="btn btn-danger btn-sm" onclick="deleteRecord('${mod.id}',${item.id})">Excluir</button></div></td></tr>`;
  }).join('');
  const ths = mod.columns.map(c => `<th>${c.label}</th>`).join('');
  return `<div class="table-wrap"><table><thead><tr>${ths}<th>Ações</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

// ── FORM RENDER ─────────────────────────────────────────────────
function renderField(f, mod) {
  const cls = f.full ? 'form-group full' : 'form-group';

  if (f.type === 'checklist') {
    const items = f.options.map((opt, i) =>
      `<label class="check-item">
        <input type="checkbox" name="${f.name}" value="${opt}" id="chk-${i}">
        ${opt}
      </label>`
    ).join('');
    return `<div class="${cls} full">
      <label>${f.label}</label>
      <div class="checklist-items">${items}</div>
    </div>`;
  }

  if (f.type === 'rating') {
    const rows = f.options.map((opt, i) => {
      const btns = [1,2,3,4,5].map(n =>
        `<button type="button" class="rating-btn" data-field="${f.name}" data-criterion="${i}" data-val="${n}" onclick="setRating(this)">${n}</button>`
      ).join('');
      return `<div class="rating-row">
        <span>${opt}</span>
        <div class="rating-stars">${btns}</div>
        <input type="hidden" name="${f.name}[${i}]" id="rating-${f.name}-${i}" value="">
      </div>`;
    }).join('');
    return `<div class="${cls} full">
      <label>${f.label}</label>
      <div class="rating-group">${rows}</div>
    </div>`;
  }

  if (f.type === 'weekdays') {
    const days = [
      { k:'seg', l:'Seg' },{ k:'ter', l:'Ter' },{ k:'qua', l:'Qua' },
      { k:'qui', l:'Qui' },{ k:'sex', l:'Sex' },{ k:'sab', l:'Sáb' },
      { k:'dom', l:'Dom' },
    ];
    const boxes = days.map(d =>
      `<div class="day-check">
        <input type="checkbox" name="${f.name}" value="${d.k}" id="day-${d.k}">
        <label for="day-${d.k}">${d.l}</label>
      </div>`
    ).join('');
    return `<div class="${cls} full">
      <label>${f.label}</label>
      <div class="escala-week">${boxes}</div>
    </div>`;
  }

  if (f.type === 'select') {
    const opts = f.options.map(o => `<option value="${o}">${o}</option>`).join('');
    return `<div class="${cls}">
      <label for="f-${f.name}">${f.label}${f.required ? ' *':''}</label>
      <select id="f-${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>
        <option value="">Selecione</option>${opts}
      </select>
    </div>`;
  }

  if (f.type === 'textarea') {
    return `<div class="${cls}">
      <label for="f-${f.name}">${f.label}${f.required ? ' *':''}</label>
      <textarea id="f-${f.name}" name="${f.name}" ${f.required ? 'required' : ''} placeholder="${f.placeholder || ''}"></textarea>
    </div>`;
  }

  return `<div class="${cls}">
    <label for="f-${f.name}">${f.label}${f.required ? ' *':''}</label>
    <input id="f-${f.name}" name="${f.name}" type="${f.type || 'text'}"
      ${f.required ? 'required' : ''} ${f.readonly ? 'readonly' : ''}
      ${f.placeholder ? `placeholder="${f.placeholder}"` : ''}
      ${f.type === 'date' ? '' : ''}>
  </div>`;
}

window.setRating = function(btn) {
  const field = btn.dataset.field;
  const crit  = btn.dataset.criterion;
  const val   = btn.dataset.val;
  // highlight siblings
  btn.closest('.rating-stars').querySelectorAll('.rating-btn').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.val) <= Number(val));
  });
  document.getElementById(`rating-${field}-${crit}`).value = val;
};

// ── OPEN FORM (MODAL) ────────────────────────────────────────────
window.openForm = function(id) {
  const mod = MODULES.find(m => m.id === id);
  document.getElementById('modal-title').textContent = `Novo — ${mod.title}`;

  const fieldsHtml = mod.fields.map(f => renderField(f, mod)).join('');

  document.getElementById('modal-body').innerHTML = `
    <form id="record-form" class="form-grid" onsubmit="saveRecord(event,'${id}')">
      ${fieldsHtml}
      <div class="form-actions full">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-gold">Salvar</button>
      </div>
    </form>
  `;

  // fill auto-number
  if (mod.autoNum) {
    const input = document.getElementById(`f-${mod.autoNum.field}`);
    if (input) input.value = nextNum(mod.key, mod.autoNum.prefix);
  }

  // set today's date
  mod.fields.filter(f => f.type === 'date').forEach(f => {
    const el = document.getElementById(`f-${f.name}`);
    if (el && !el.value) el.value = new Date().toISOString().slice(0,10);
  });

  openModal();
};

// ── SAVE RECORD ─────────────────────────────────────────────────
window.saveRecord = function(e, id) {
  e.preventDefault();
  const mod  = MODULES.find(m => m.id === id);
  const form = e.target;
  const data = {};

  mod.fields.forEach(f => {
    if (f.type === 'checklist') {
      const checked = [...form.querySelectorAll(`input[name="${f.name}"]:checked`)].map(x => x.value);
      data[f.name] = checked;
    } else if (f.type === 'rating') {
      const ratings = {};
      f.options.forEach((_, i) => {
        const hidden = form.querySelector(`input[name="${f.name}[${i}]"]`);
        ratings[i] = hidden ? hidden.value : '';
      });
      data[f.name] = ratings;
    } else if (f.type === 'weekdays') {
      const checked = [...form.querySelectorAll(`input[name="${f.name}"]:checked`)].map(x => x.value);
      data[f.name] = checked;
    } else {
      const el = form.elements[f.name];
      data[f.name] = el ? el.value : '';
    }
  });

  DB.add(mod.key, data);
  closeModal();
  refreshPage(id);
  renderDashboard();
};

// ── DELETE ───────────────────────────────────────────────────────
window.deleteRecord = function(id, recId) {
  if (!confirm('Excluir este registro?')) return;
  const mod = MODULES.find(m => m.id === id);
  DB.remove(mod.key, recId);
  refreshPage(id);
  renderDashboard();
};

// ── PRINT ────────────────────────────────────────────────────────
window.printRecord = function(id, recId) {
  const mod  = MODULES.find(m => m.id === id);
  const item = DB.get(mod.key).find(x => x.id === recId);
  if (!item) return;

  let body = '';

  if (id === 'os') {
    body = `
      <div class="print-doc-header">
        <div><div class="print-company">MH Facilities &amp; Segurança</div><div>Portaria · Limpeza · Zeladoria · Segurança</div></div>
        <div style="text-align:right"><strong>ORDEM DE SERVIÇO</strong><br>${item.numero}</div>
      </div>
      <div class="print-row">
        <div class="print-field"><label>Data</label><span>${fmtDate(item.data)}</span></div>
        <div class="print-field"><label>Status</label><span>${item.status}</span></div>
      </div>
      <div class="print-row">
        <div class="print-field"><label>Cliente / Condomínio</label><span>${item.cliente}</span></div>
        <div class="print-field"><label>Local / Posto</label><span>${item.local}</span></div>
      </div>
      <div class="print-row">
        <div class="print-field"><label>Funcionário Responsável</label><span>${item.funcionario}</span></div>
        <div class="print-field"><label>Tipo de Serviço</label><span>${item.tipo_servico}</span></div>
      </div>
      <div class="print-body"><label style="font-size:10px;text-transform:uppercase;color:#666;font-weight:700">Descrição do Trabalho</label><p style="margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:4px;min-height:80px">${item.descricao || '—'}</p></div>
      <div class="print-sign">
        <div class="print-sign-box">Responsável MH Facilities</div>
        <div class="print-sign-box">Cliente: ${item.assinatura || '________________________'}</div>
      </div>`;
  } else if (id === 'recibo') {
    body = `
      <div class="print-doc-header">
        <div><div class="print-company">MH Facilities &amp; Segurança</div></div>
        <div style="text-align:right"><strong>RECIBO DE SERVIÇOS</strong><br>${item.numero}</div>
      </div>
      <div class="print-row">
        <div class="print-field"><label>Data</label><span>${fmtDate(item.data)}</span></div>
        <div class="print-field"><label>CNPJ / CPF</label><span>${item.cnpj_cpf || '—'}</span></div>
      </div>
      <div class="print-row">
        <div class="print-field"><label>Recebemos de</label><span>${item.cliente}</span></div>
      </div>
      <div class="print-total">Valor: ${fmtCurrency(item.valor)}</div>
      <div class="print-body"><label style="font-size:10px;text-transform:uppercase;color:#666;font-weight:700">Referente a</label><p style="padding:10px;border:1px solid #ddd;border-radius:4px;margin-top:6px;min-height:60px">${item.descricao}</p></div>
      ${item.obs ? `<p style="font-size:12px;color:#555;margin-top:10px">${item.obs}</p>` : ''}
      <div class="print-sign" style="margin-top:60px">
        <div class="print-sign-box">MH Facilities &amp; Segurança<br>Prestador de Serviços</div>
        <div class="print-sign-box">Cliente<br>${item.cliente}</div>
      </div>`;
  } else if (id === 'relatorio') {
    body = `
      <div class="print-doc-header">
        <div><div class="print-company">MH Facilities &amp; Segurança</div></div>
        <div style="text-align:right"><strong>RELATÓRIO MENSAL</strong></div>
      </div>
      <div class="print-doc-title">Relatório de Serviços — ${item.mes}/${item.ano}</div>
      <div class="print-row">
        <div class="print-field"><label>Cliente</label><span>${item.cliente}</span></div>
        <div class="print-field"><label>Status</label><span>${item.status}</span></div>
      </div>
      <div class="print-row">
        <div class="print-field"><label>OS Realizadas</label><span>${item.os_realizadas || '—'}</span></div>
        <div class="print-field"><label>Ocorrências</label><span>${item.ocorrencias || '—'}</span></div>
        <div class="print-field"><label>Índice de Qualidade</label><span>${item.indice_qualidade || '—'}%</span></div>
        <div class="print-field"><label>Satisfação</label><span>${item.satisfacao || '—'}/5</span></div>
      </div>
      <div class="print-body">
        <label style="font-size:10px;text-transform:uppercase;color:#666;font-weight:700">Serviços Realizados</label>
        <p style="padding:10px;border:1px solid #ddd;border-radius:4px;margin:6px 0 14px;min-height:60px">${item.servicos || '—'}</p>
        <label style="font-size:10px;text-transform:uppercase;color:#666;font-weight:700">Observações do Gestor</label>
        <p style="padding:10px;border:1px solid #ddd;border-radius:4px;margin-top:6px;min-height:60px">${item.observacoes || '—'}</p>
      </div>
      <div class="print-sign"><div class="print-sign-box">Gestor MH Facilities</div><div class="print-sign-box">Cliente: ${item.cliente}</div></div>`;
  }

  const printArea = document.getElementById('print-area');
  printArea.innerHTML = body;
  printArea.classList.remove('hidden');
  window.print();
  printArea.classList.add('hidden');
};

// ── MODAL ────────────────────────────────────────────────────────
function openModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

window.closeModal = function() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
};

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ── DASHBOARD ────────────────────────────────────────────────────
function renderDashboard() {
  const metricsEl   = document.getElementById('dash-metrics');
  const shortcutsEl = document.getElementById('dash-shortcuts');

  const metrics = [
    { label: 'OS Abertas',        val: DB.get('mh_os').filter(x => x.status !== 'Concluído' && x.status !== 'Cancelado').length },
    { label: 'Funcionários Ativos', val: DB.get('mh_funcionarios').filter(x => x.status === 'Ativo').length },
    { label: 'Clientes Ativos',    val: DB.get('mh_clientes').filter(x => x.status === 'Ativo').length },
    { label: 'Ocorrências Abertas', val: DB.get('mh_ocorrencia').filter(x => x.status !== 'Encerrada').length },
    { label: 'A Receber',
      val: (() => {
        const toNum = v => { const n = parseFloat((v||'0').toString().replace(/\./g,'').replace(',','.')); return isNaN(n)?0:n; };
        const t = DB.get('mh_faturamento').filter(x => x.status === 'Pendente').reduce((a,x) => a+toNum(x.valor),0);
        return t.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
      })()
    },
    { label: 'Checklists este mês',
      val: (() => {
        const m = new Date().getMonth(), y = new Date().getFullYear();
        return DB.get('mh_checklist').filter(x => {
          const d = new Date(x.data); return d.getMonth()===m && d.getFullYear()===y;
        }).length;
      })()
    },
  ];

  metricsEl.innerHTML = metrics.map(m =>
    `<div class="metric-card"><span>${m.label}</span><strong>${m.val}</strong></div>`
  ).join('');

  shortcutsEl.innerHTML = MODULES.map(m =>
    `<div class="shortcut-card" onclick="navigate('${m.id}')">
      <div class="sc-icon">${m.icon}</div>
      <strong>${m.title}</strong>
      <small>${DB.count(m.key)} registro(s)</small>
    </div>`
  ).join('');
}

// ── DATE DISPLAY ─────────────────────────────────────────────────
function updateDate() {
  const el = document.getElementById('top-date');
  if (el) el.textContent = new Date().toLocaleDateString('pt-BR', {
    weekday:'short', day:'2-digit', month:'short', year:'numeric'
  });
}

// ── OVERLAY MOBILE ───────────────────────────────────────────────
function buildOverlay() {
  const ov = document.createElement('div');
  ov.id = 'sb-overlay';
  ov.className = 'sb-overlay';
  ov.addEventListener('click', closeSidebar);
  document.body.appendChild(ov);
}

// ── INIT ─────────────────────────────────────────────────────────
function init() {
  buildOverlay();
  buildSidebar();
  MODULES.forEach(mod => renderPage(mod));
  renderDashboard();
  updateDate();
  navigate('dashboard');
}

init();
