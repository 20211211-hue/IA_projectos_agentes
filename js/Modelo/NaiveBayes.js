class NaiveBayes extends ModeloDecisao {
    constructor(ambiente) {
        super();
        this.ambiente = ambiente; // Define o ambiente como atributo
        this.tabelasFrequencia = {};
        this.totalClasses = {};
        this.totalAmostras = 0;
        this.celulasVisitadas = new Set(); // Armazena células visitadas recentemente
    }

    calcularProbabilidade(condicional, total) {
        // Suavização de Laplace
        return (condicional + 1) / (total + Object.keys(this.tabelasFrequencia).length);
    }

    // Atualiza as frequências dos dados e penaliza ciclos repetitivos
    treinar(celulaAtual, vizinhas) {
        const classe = celulaAtual.tipo; // Classe da célula (bomba, tesouro, livre)

        // Penaliza movimentos repetitivos, ou seja, ciclos
        if (this.celulasVisitadas.has(`${celulaAtual.x},${celulaAtual.y}`)) {
            // Penaliza a célula para evitar loops
            celulaAtual.custo *= 0.5; // Por exemplo, diminui o custo de mover para esta célula
        } else {
            this.celulasVisitadas.add(`${celulaAtual.x},${celulaAtual.y}`);
        }

        // Inicializa a contagem para a classe
        if (!this.tabelasFrequencia[classe]) {
            this.tabelasFrequencia[classe] = {};
            this.totalClasses[classe] = 0;
        }

        // Atualiza frequências para cada atributo
        vizinhas.forEach(({ x, y, custo, tipo }) => {
            const atributos = [x, y, custo, tipo]; // Inclui tipo das vizinhas como atributo
            atributos.forEach((atributo, index) => {
                if (!this.tabelasFrequencia[classe][index]) {
                    this.tabelasFrequencia[classe][index] = {};
                }
                if (!this.tabelasFrequencia[classe][index][atributo]) {
                    this.tabelasFrequencia[classe][index][atributo] = 0;
                }
                this.tabelasFrequencia[classe][index][atributo]++;
            });
        });

        // Incrementa o total de amostras na classe
        this.totalClasses[classe]++;
        this.totalAmostras++;
    }

    // Método de treinamento adicional para receber os dados
    modeloTreinado(dados) {
        dados.forEach(dado => {
            const { x, y, tipo, custo } = dado;
            const celulaAtual = { x, y, tipo, custo };

            // Obtém as vizinhas da célula atual
            const vizinhas = this.ambiente.obterVizinhas(x, y);

            // Treina o modelo com a célula e suas vizinhas
            this.treinar(celulaAtual, vizinhas);
        });

        console.log('Modelo Naive Bayes treinado com sucesso!');
    }

    prever(celulaAtual, vizinhas) {
        if (this.totalAmostras === 0) {
            console.warn('O modelo Naive Bayes ainda não foi treinado.');
            return 'livre'; // Fallback padrão
        }

        const probabilidades = {};

        // Calcula a probabilidade para cada classe
        for (const classe in this.tabelasFrequencia) {
            let probClasse = this.calcularProbabilidade(this.totalClasses[classe], this.totalAmostras);

            vizinhas.forEach(({ x, y, custo, tipo }) => {
                const atributos = [x, y, custo, tipo]; // Inclui tipo das vizinhas
                atributos.forEach((atributo, index) => {
                    const freq = this.tabelasFrequencia[classe][index]?.[atributo] || 0;
                    probClasse *= this.calcularProbabilidade(freq, this.totalClasses[classe]);
                });
            });

            probabilidades[classe] = probClasse;
        }

        // Retorna a classe com a maior probabilidade
        return Object.entries(probabilidades).reduce((maxClasse, [classe, prob]) => {
            return prob > maxClasse[1] ? [classe, prob] : maxClasse;
        }, ['', 0])[0];
    }
}

window.NaiveBayes = NaiveBayes;
