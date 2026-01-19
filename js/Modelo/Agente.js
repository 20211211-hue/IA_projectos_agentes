class Agente {
  constructor(ambiente, modelo, id) {
      this.ambiente = ambiente;
      this.modelo = modelo;
      this.id = id;
      this.posicao = { x: 0, y: 0 };
      this.passos = 0;
      this.custoTotal = 0;
      this.bombasEncontradas = 0;
      this.tesourosEncontrados = 0;
      this.forca = 0; // Força inicial do agente
      this.visitadas = new Set();
      this.ativo = true; // Status ativo do agente
      this.criarElementoVisual();
      this.atualizarInterface();
  }

  atualizarInterface() {
      if (!this.ativo) return; // Não atualiza se o agente está destruído
      document.getElementById('steps').textContent = this.passos;
      document.getElementById('acquiredCost').textContent = this.custoTotal.toFixed(2);
      document.getElementById('bombsAcquired').textContent = this.bombasEncontradas;
      document.getElementById('treasuresAcquired').textContent = this.tesourosEncontrados;
  }

  moverPara(x, y) {
    const celula = this.ambiente.getCelula(x, y);
    if (!celula) return;

    // Verifica se a célula escolhida é a mesma da posição anterior
    if (this.posicaoAnterior && this.posicaoAnterior.x === x && this.posicaoAnterior.y === y) {
      console.log(`O agente ${this.id} não pode voltar para a célula anterior!`);
      return; // Impede o movimento para a célula anterior
    }

    // Atualiza a posição anterior antes de se mover
    this.posicaoAnterior = { ...this.posicao };
    
    this.posicao = { x, y };
    this.passos++;
    this.custoTotal += celula.custo;
    this.visitadas.add(`${x},${y}`);

    // Compartilhar descoberta com o ambiente
    this.ambiente.registrarDescoberta(x, y, celula.tipo);

    if (celula.tipo === 'bomba') {
      if (this.forca > 0) {
          this.forca--; // Desativa a bomba sem destruir o agente
          this.bombasEncontradas++;
      } else {
        this.destruir(); // Se não tiver força, o agente é destruído
      }
    }
    else if (celula.tipo === 'tesouro') {
      this.forca++; // Ganha força ao encontrar um tesouro
      this.tesourosEncontrados++;
    }

    this.atualizarInterface();
    this.desenhar();
  }

  destruir() {
      console.log(`O agente ${this.id} foi destruído ao encontrar uma bomba!`);
      this.ativo = false; // Marca o agente como inativo
      this.removerElementoVisual(); // Remove o agente da interface
  }

  criarElementoVisual() {
    const agenteDiv = document.createElement('div');
    agenteDiv.id = `agente-${this.id}`;
    agenteDiv.style.backgroundColor = this.id === 'KNN' ? 'blue' :
                                      this.id === 'NB' ? 'green' :
                                      this.id === 'NN' ? 'red' : 'brown';
    agenteDiv.style.zIndex = 10;
  }

  desenhar() {
      if (!this.ativo) return; // Não desenha se o agente está destruído

      document.querySelectorAll('.cell').forEach(cell => {
          cell.classList.remove(`agent-${this.id}`);
      });

      const div = this.ambiente.getDiv(this.posicao.x, this.posicao.y);
      if (div) {
          div.classList.add(`agent-${this.id}`);
      }
  }

  removerElementoVisual() {
      const div = document.querySelector(`#agente-${this.id}`);
      if (div) {
          div.remove(); // Remove a representação visual do agente
      }
  }

  mover() {
      if (!this.ativo) return; // Não realiza movimentos se o agente está destruído

      const vizinhas = this.obterVizinhos();
      const tipoEscolhido = this.modelo.prever(this.ambiente.getCelula(this.posicao.x, this.posicao.y), vizinhas);
      const celulaDestino = vizinhas.find(vizinha => vizinha.tipo === tipoEscolhido);

      if (celulaDestino) {
          this.moverPara(celulaDestino.x, celulaDestino.y);
      } else {
          this.moverAleatorio();
      }
  }

  obterVizinhos() {
      const movimentos = [
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 }
      ];

      return movimentos
          .map(({ dx, dy }) => ({
              x: this.posicao.x + dx,
              y: this.posicao.y + dy
          }))
          .filter(({ x, y }) =>
              x >= 0 && x < this.ambiente.tamanho &&
              y >= 0 && y < this.ambiente.tamanho
          )
          .map(({ x, y }) => this.ambiente.getCelula(x, y));
  }

  moverAleatorio() {
    if (!this.ativo) return; // Não realiza movimentos aleatórios se o agente está destruído

    const movimentos = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
    ];

    const validos = movimentos
        .map(({ dx, dy }) => ({ x: this.posicao.x + dx, y: this.posicao.y + dy }))
        .filter(({ x, y }) =>
            x >= 0 && x < this.ambiente.tamanho &&
            y >= 0 && y < this.ambiente.tamanho
        );

    if (validos.length === 0) return;

    // Filtra células não visitadas, priorizando-as
    const naoVisitados = validos.filter(({ x, y }) => !this.visitadas.has(`${x},${y}`));

    if (naoVisitados.length > 0) {
        const proximo = naoVisitados[Math.floor(Math.random() * naoVisitados.length)];
        this.moverPara(proximo.x, proximo.y);
    } else {
        // Se todas as células forem visitadas, escolhe aleatoriamente
        const proximo = validos[Math.floor(Math.random() * validos.length)];
        this.moverPara(proximo.x, proximo.y);
    }
  }

}
window.Agente = Agente;