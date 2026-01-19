class ArvoreDecisao extends ModeloDecisao {
    constructor(ambiente) {
        super();
        this.ambiente = ambiente;
        this.arvore = null;
    }

    // Função para calcular a "impureza" de uma divisão
    calcularGini(dados) {
        const total = dados.length;
        if (total === 0) return 0;

        const frequencias = dados.reduce((acc, dado) => {
            acc[dado.tipo] = (acc[dado.tipo] || 0) + 1;
            return acc;
        }, {});

        return Object.values(frequencias).reduce((gini, freq) => {
            const probabilidade = freq / total;
            return gini - probabilidade * probabilidade;
        }, 1);
    }

    // Função para dividir os dados com base em um atributo
    dividirDados(dados, atributo, valor) {
        const dadosEsquerda = dados.filter(dado => dado[atributo] <= valor);
        const dadosDireita = dados.filter(dado => dado[atributo] > valor);
        return [dadosEsquerda, dadosDireita];
    }

    // Função recursiva para construir a árvore de decisão
    construirArvore(dados, profundidade = 0, maxProfundidade = 5) {
        // Caso base 1: Se não há dados, retorna um nó com classe 'livre' (por exemplo)
        if (dados.length === 0) {
            return { classe: 'livre' };
        }
    
        // Caso base 2: Se todos os dados são da mesma classe, retorna a classe
        const classes = [...new Set(dados.map(dado => dado.tipo))];
        if (classes.length === 1) {
            return { classe: classes[0] };
        }
    
        // Caso base 3: Se atingiu a profundidade máxima, retorna a classe mais frequente
        if (profundidade >= maxProfundidade) {
            const classe = this.classeMaisFrequente(dados);
            return { classe };
        }
    
        // Encontra a melhor divisão dos dados
        const melhorDivisao = this.encontrarMelhorDivisao(dados);
        if (!melhorDivisao) {
            const classe = this.classeMaisFrequente(dados);
            return { classe };
        }
    
        // Divide os dados em duas partes
        const [dadosEsquerda, dadosDireita] = this.dividirDados(dados, melhorDivisao.atributo, melhorDivisao.valor);
    
        // Cria um nó da árvore com a divisão
        return {
            atributo: melhorDivisao.atributo,
            valor: melhorDivisao.valor,
            esquerda: this.construirArvore(dadosEsquerda, profundidade + 1, maxProfundidade),
            direita: this.construirArvore(dadosDireita, profundidade + 1, maxProfundidade)
        };
    }
    
    // Função para determinar a classe mais frequente em um conjunto de dados
    classeMaisFrequente(dados) {
        const frequencias = dados.reduce((acc, dado) => {
            acc[dado.tipo] = (acc[dado.tipo] || 0) + 1;
            return acc;
        }, {});
    
        return Object.keys(frequencias).reduce((classeMaisComum, classe) => {
            return frequencias[classe] > frequencias[classeMaisComum] ? classe : classeMaisComum;
        });
    }
    

    // Função para encontrar o melhor atributo para dividir os dados
    encontrarMelhorDivisao(dados) {
        const atributos = ['x', 'y', 'custo']; // Atributos disponíveis para a divisão
        let melhorGini = Infinity;
        let melhorDivisao = null;

        atributos.forEach(atributo => {
            const valores = [...new Set(dados.map(dado => dado[atributo]))];
            valores.forEach(valor => {
                const [dadosEsquerda, dadosDireita] = this.dividirDados(dados, atributo, valor);
                const gini = this.calcularGini(dadosEsquerda) * dadosEsquerda.length / dados.length +
                             this.calcularGini(dadosDireita) * dadosDireita.length / dados.length;
                if (gini < melhorGini) {
                    melhorGini = gini;
                    melhorDivisao = { atributo, valor };
                }
            });
        });

        return melhorDivisao;
    }

    // Função para prever a classe de um dado
    preverDado(dado, arvore = this.arvore, profundidade = 0, maxProfundidade = 5) {
        // Evitar loop infinito
        if (!arvore || profundidade >= maxProfundidade) {
            console.warn('Profundidade máxima atingida ou árvore inválida.');
            return null;
        }

        // Caso base: se chegou a um nó folha
        if (arvore.classe) {
            return arvore.classe;
        }

        const { atributo, valor } = arvore;
        // Segue o caminho na árvore com base no atributo
        if (dado[atributo] <= valor) {
            return this.preverDado(dado, arvore.esquerda, profundidade + 1, maxProfundidade);
        } else {
            return this.preverDado(dado, arvore.direita, profundidade + 1, maxProfundidade);
        }
    }

    // Função para prever a classe de uma célula com base nas vizinhas
    prever(celulaAtual, vizinhas) {
        const entrada = vizinhas.map(c => ({ x: c.x, y: c.y, custo: c.custo }));

        if (!this.arvore) {
            console.error("A árvore de decisão não foi treinada.");
            return null;
        }

        return this.preverDado(entrada[0]); // Prevendo com base nas vizinhas
    }

    // Treinar o modelo com os dados
    modeloTreinado(dados) {
        this.arvore = this.construirArvore(dados);
        console.log('Árvore de Decisão treinada com sucesso!');
    }
}

window.ArvoreDecisao = ArvoreDecisao;
