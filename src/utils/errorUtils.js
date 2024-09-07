export function formatError(error) {
    const status = error.status || 'Desconhecido';
    const description = error.error || 'Descrição não disponível';
    const date = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
    });

    return `Erro: ${description} - Status Code: ${status} - Hora: ${date}`;
}