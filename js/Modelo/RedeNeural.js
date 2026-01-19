class RedeNeural extends ModeloDecisao {
    constructor(tamanhoEntrada, tamanhoOculta, taxaAprendizado, ambiente, tamanhoMemoria) {
        super();
        this.tamanhoEntrada = tamanhoEntrada;
        this.tamanhoOculta = tamanhoOculta;
        this.taxaAprendizado = taxaAprendizado;
        this.ambiente = ambiente;
        this.tamanhoMemoria = tamanhoMemoria; // Para armazenar memória do agente

        // Inicialização aleatória dos pesos
        this.pesosEntradaOculta = Array.from({ length: tamanhoOculta }, () =>
            Array.from({ length: tamanhoEntrada }, () => Math.random() * 2 - 1)
        );
        this.pesosOcultaSaida = Array.from({ length: tamanhoOculta }, () => Math.random() * 2 - 1);
        
        // Inicialização da memória (camada de "memória" adicional, inspirada em RNNs)
        this.memoria = Array.from({ length: tamanhoMemoria }, () => Array(tamanhoEntrada).fill(0));
    }

    ativacao(x) {
        return 1 / (1 + Math.exp(-x)); // Função de ativação Sigmoid
    }

    derivadaAtivacao(x) {
        return x * (1 - x); // Derivada da Sigmoid
    }

    // Função para combinar a memória anterior com a entrada atual
    combinarMemoriaEntrada(entrada) {
        // Aqui você pode adicionar mais complexidade para manipular a memória
        return entrada.concat(this.memoria[0]); // Concatenando a entrada com a memória mais recente
    }

    forward(entrada) {
        // Atualiza a memória com a entrada atual
        this.memoria.unshift(entrada); // Adiciona a entrada mais recente
        if (this.memoria.length > this.tamanhoMemoria) this.memoria.pop(); // Mantém o tamanho da memória

        // Combina a memória com a entrada
        entrada = this.combinarMemoriaEntrada(entrada);

        this.entrada = entrada;

        // Propagação para frente (forward propagation)
        this.saidaOculta = this.pesosEntradaOculta.map(neuronio =>
            this.ativacao(neuronio.reduce((soma, peso, i) => soma + peso * entrada[i], 0))
        );

        this.saidaFinal = this.ativacao(
            this.saidaOculta.reduce((soma, peso, i) => soma + this.pesosOcultaSaida[i] * peso, 0)
        );

        return this.saidaFinal;
    }

    backpropagacao(desejado) {
        const erroSaida = desejado - this.saidaFinal;
        const deltaSaida = erroSaida * this.derivadaAtivacao(this.saidaFinal);

        const erroOculta = this.pesosOcultaSaida.map(
            (peso, i) => peso * deltaSaida * this.derivadaAtivacao(this.saidaOculta[i])
        );

        this.pesosOcultaSaida = this.pesosOcultaSaida.map(
            (peso, i) => peso + this.taxaAprendizado * deltaSaida * this.saidaOculta[i]
        );

        this.pesosEntradaOculta = this.pesosEntradaOculta.map((neuronio, i) =>
            neuronio.map((peso, j) => peso + this.taxaAprendizado * erroOculta[i] * this.entrada[j])
        );
    }

    treinar(celulaAtual, vizinhas) {
        // Considera mais vizinhas, por exemplo, 3 vizinhas ao invés de 1
        const entrada = vizinhas.map(c => (c.tipo === 'tesouro' ? 1 : c.tipo === 'bomba' ? -1 : 0));
        const desejado = celulaAtual.tipo === 'tesouro' ? 1 : -1;

        this.forward(entrada);
        this.backpropagacao(desejado);
    }

    prever(celulaAtual, vizinhas) {
        // Considera mais vizinhas ao fazer a previsão
        const entrada = vizinhas.map(c => (c.tipo === 'tesouro' ? 1 : c.tipo === 'bomba' ? -1 : 0));
        const saida = this.forward(entrada);

        return saida >= 0.5 ? 'tesouro' : 'bomba';
    }

    modeloTreinado(dados) {
        dados.forEach(dado => {
            const { x, y, tipo, custo } = dado;
            const celulaAtual = { x, y, tipo, custo };

            // Obtém as vizinhas da célula
            const vizinhas = this.ambiente.obterVizinhas(x, y);

            // Treina o modelo com a célula e suas vizinhas
            this.treinar(celulaAtual, vizinhas);
        });

        console.log('Modelo de Rede Neural treinado com sucesso!');
    }
}

window.RedeNeural = RedeNeural; // Torna a classe globalmente acessível
