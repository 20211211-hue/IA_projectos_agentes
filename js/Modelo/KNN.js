

/*class KNN extends ModeloDecisao {
    constructor(k = 3) {
        super();
        this.k = k; // Número de vizinhos
        this.dados = []; // Conjunto de dados para aprendizado
    }

    treinar(celulaAtual, vizinhas) {
        // Adiciona as vizinhas ao conjunto de dados com o tipo da célula atual como alvo
        vizinhas.forEach(c => {
            const entrada = [c.x, c.y, c.custo]; // Atributos de entrada (posição e custo)
            const alvo = celulaAtual.tipo; // Tipo da célula atual como alvo
            this.dados.push({ entrada, alvo });
        });
    }

    prever(celulaAtual, vizinhas) {
        if (this.dados.length === 0) {
            console.warn('O modelo KNN ainda não foi treinado.');
            return 'livre'; // Retorna "livre" como fallback padrão
        }

        const entradasVizinhas = vizinhas.map(c => [c.x, c.y, c.custo]);

        // Calcula as distâncias entre as vizinhas e todos os dados de treinamento
        const distancias = this.dados.map(({ entrada, alvo }) => {
            const distancia = Math.sqrt(
                (entrada[0] - celulaAtual.x) ** 2 +
                (entrada[1] - celulaAtual.y) ** 2 +
                (entrada[2] - celulaAtual.custo) ** 2
            );
            return { distancia, alvo };
        });

        // Ordena pelas distâncias e pega os K mais próximos
        distancias.sort((a, b) => a.distancia - b.distancia);
        const maisProximos = distancias.slice(0, this.k);

        // Faz uma votação entre os K vizinhos mais próximos
        const votos = maisProximos.reduce((acc, { alvo }) => {
            acc[alvo] = (acc[alvo] || 0) + 1;
            return acc;
        }, {});

        // Retorna o tipo com mais votos
        const [melhorEscolha] = Object.entries(votos).sort(([, a], [, b]) => b - a)[0];
        return melhorEscolha;
    }
}

window.KNN = KNN; // Torna a classe globalmente acessível
*/
class KNN extends ModeloDecisao {
    constructor(k) {
        super();
        this.k = k; // Número de vizinhos mais próximos
        this.dadosTreinamento = []; // Armazena os dados de treinamento
    }

    // Método para treinar o modelo KNN com os dados fornecidos
    modeloTreinado(dados) {
        this.dadosTreinamento = dados; // Armazena os dados de treinamento no modelo
        console.log('Modelo KNN treinado com sucesso!');
    }

    // Função de distância (Euclidiana, por exemplo) para medir a proximidade entre os pontos
    distanciaEuclidiana(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy); // Retorna a distância Euclidiana
    }

    // Função para prever a classe de uma célula com base nos dados de treinamento
    prever(celulaAtual, vizinhas) {
        if (this.dadosTreinamento.length === 0) {
            console.warn('O modelo KNN ainda não foi treinado.');
            return 'livre'; // Fallback
        }

        // Calcular as distâncias de cada célula nos dados de treinamento para a célula atual
        const distancias = this.dadosTreinamento.map(dado => {
            const distancia = this.distanciaEuclidiana(dado, celulaAtual);
            return { distancia, tipo: dado.tipo };
        });

        // Ordenar as distâncias e pegar os k vizinhos mais próximos
        distancias.sort((a, b) => a.distancia - b.distancia);
        const vizinhosMaisProximos = distancias.slice(0, this.k);

        // Contar a frequência das classes nos k vizinhos mais próximos
        const contagemClasses = {};
        vizinhosMaisProximos.forEach(vizinho => {
            if (!contagemClasses[vizinho.tipo]) {
                contagemClasses[vizinho.tipo] = 0;
            }
            contagemClasses[vizinho.tipo]++;
        });

        // Retornar a classe mais frequente
        return Object.entries(contagemClasses).reduce((maxClasse, [classe, contagem]) => {
            return contagem > maxClasse[1] ? [classe, contagem] : maxClasse;
        }, ['', 0])[0];
    }
}

window.KNN = KNN; // Torna a classe globalmente acessível
        