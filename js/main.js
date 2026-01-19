document.addEventListener('DOMContentLoaded', function () {
    // Criação do ambiente
    const ambiente = new Ambiente(10);
    ambiente.adicionarBombas(10);
    ambiente.adicionarTesouros(3);

    // Instanciando os modelos
    const modeloKNN = new KNN(3);
    const modeloNB = new NaiveBayes(ambiente);
    //const modeloNN = new RedeNeural(6, 10, 0.2, ambiente, 6);
    const modeloAD = new ArvoreDecisao(ambiente);

    // Instanciando os agentes
    const agenteKNN = new Agente(ambiente, modeloKNN, 'KNN');
    const agenteKNN1 = new Agente(ambiente, modeloKNN, 'KNN');
    const agenteKNN2 = new Agente(ambiente, modeloKNN, 'KNN');
    const agenteNB = new Agente(ambiente, modeloNB, 'NB');
    const agenteNB1 = new Agente(ambiente, modeloNB, 'NB');
    const agenteNB2 = new Agente(ambiente, modeloNB, 'NB');
    const agenteAD = new Agente(ambiente, modeloAD, 'AD');
    const agenteAD1 = new Agente(ambiente, modeloAD, 'AD');
    const agenteAD2 = new Agente(ambiente, modeloAD, 'AD');

    let agentes = [agenteKNN, agenteKNN1,agenteKNN2, agenteNB, agenteAD];
    let posicoes = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]; // Posições iniciais

    // Função para carregar o arquivo CSV
    function carregarCSV(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const conteudo = e.target.result;
                processarCSV(conteudo);
            };
            reader.readAsText(file);
        }
    }

    // Função para processar os dados CSV
    function processarCSV(conteudo) {
        const linhas = conteudo.split('\n');
        const dados = linhas.map(linha => {
            const partes = linha.split(',');
            return {
                x: parseInt(partes[0].trim()), // Remover espaços extras
                y: parseInt(partes[1]), // Remover espaços extras
                tipo: partes[2],
                custo: parseFloat(partes[3])
            };
        });

        // Treinando os modelos com os dados carregados
        treinarModelos(dados);
    }

    // Função para treinar os modelos com os dados carregados
    function treinarModelos(dados) {
        if (modeloKNN) modeloKNN.modeloTreinado(dados);
        if (modeloNB) modeloNB.modeloTreinado(dados);
        if (modeloAD) modeloAD.modeloTreinado(dados);

        // Após o treinamento, iniciar o movimento dos agentes
        iniciarMovimentoAgentes();
    }

    // Adicionar o evento de carregamento do CSV ao input de arquivo
    const inputCSV = document.getElementById('csvInput');
    if (inputCSV) {
        inputCSV.addEventListener('change', carregarCSV);
    } else {
        console.error('Elemento com ID "csvInput" não encontrado!');
    }

    // Função para mover todos os agentes periodicamente com intervalo de 1.5 segundos
    function iniciarMovimentoAgentes() {
        let i = 0;
        const intervaloPosicionamento = setInterval(() => {
            if (i < agentes.length) {
                if (!agentes[i].destruido) {
                    agentes[i].moverPara(posicoes[i][0], posicoes[i][1]);
                }
                i++;
            } else {
                clearInterval(intervaloPosicionamento);
    
                
                
            }
        }, 1500);

        // Iniciar movimento simultâneo
        setInterval(() => {
            agentes.forEach(agente => {
                if (agente.ativo) {
                    agente.mover();
                }
            });
        }, 1500);
    }
    
    
});
