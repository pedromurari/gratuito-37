// Vercel Edge Function — Registra lead na tabela lancamento_leads do CRM

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const crmUrl = process.env.CRM_SUPABASE_URL;
  const crmKey = process.env.CRM_SUPABASE_SERVICE_KEY;
  const lancamentoId = process.env.LANCAMENTO_ID;

  if (!crmUrl || !crmKey || !lancamentoId) {
    console.error('Variáveis de ambiente do CRM não configuradas');
    return new Response(JSON.stringify({ error: 'Configuração incompleta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { nome, email, whatsapp } = await req.json();

    const now = new Date().toISOString();

    const response = await fetch(`${crmUrl}/rest/v1/lancamento_leads`, {
      method: 'POST',
      headers: {
        apikey: crmKey,
        Authorization: `Bearer ${crmKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lancamento_id: lancamentoId,
        nome,
        email,
        whatsapp,
        fase: 'planilha',
        crm: false,
        data_entrada: now,
        ultima_atividade: now,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao inserir lead no CRM:', errorText);
      return new Response(JSON.stringify({ error: 'Erro ao salvar no CRM' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função crm-lead:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
