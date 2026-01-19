class Ambiente {
    constructor(tamanho) {
      this.tamanho = tamanho;
      this.celulas = [];
      this.excluidas = new Set();
      this.descobertas = {}; // Mapa global de descobertas
      this.criarTabuleiro();
    }
  
    criarTabuleiro() {
      const board = document.getElementById('board');
      board.innerHTML = '';
  
      for (let y = 0; y < this.tamanho; y++) {
        for (let x = 0; x < this.tamanho; x++) {
          const celula = { x, y, tipo: 'livre', custo: 1 };
          this.celulas.push(celula);
  
          const div = document.createElement('div');
          div.classList.add('cell', 'livre');
          div.dataset.x = x;
          div.dataset.y = y;
          div.dataset.custo = celula.custo;
          div.textContent = celula.custo.toFixed(2);
          board.appendChild(div);
        }
      }
    }
  
    registrarDescoberta(x, y, tipo) {
      const chave = `${x},${y}`;
      if (!this.descobertas[chave]) {
        this.descobertas[chave] = tipo;
      }
    }

    // Adicionando a função obterVizinhos diretamente aqui
    obterVizinhas(x, y) {
        const movimentos = [
            { dx: 0, dy: -1 }, // Cima
            { dx: 0, dy: 1 },  // Baixo
            { dx: -1, dy: 0 }, // Esquerda
            { dx: 1, dy: 0 }   // Direita
        ];

        return movimentos
            .map(({ dx, dy }) => ({
                x: x + dx,
                y: y + dy
            }))
            .filter(({ x, y }) =>
                x >= 0 &&
                x < this.tamanho &&
                y >= 0 &&
                y < this.tamanho
            )
            .map(({ x, y }) => this.getCelula(x, y));
    }
  
    obterDescoberta(x, y) {
      return this.descobertas[`${x},${y}`] || 'livre';
    }
  
    getCelula(x, y) {
      return this.celulas.find(c => c.x === x && c.y === y);
    }
  
    getDiv(x, y) {
      return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    }
  
    adicionarBombas(qtd) {
        let adicionadas = 0;
        while (adicionadas < qtd) {
            const x = Math.floor(Math.random() * this.tamanho);
            const y = Math.floor(Math.random() * this.tamanho);
            const chave = `${x},${y}`;
    
            if (!this.excluidas.has(chave)) {
                const celula = this.getCelula(x, y);
                celula.tipo = 'bomba';
                celula.custo = -1;
                this.registrarDescoberta(x, y, 'bomba'); // Compartilhamento de descoberta
    
                const div = this.getDiv(x, y);
                div.classList.remove('livre');
                div.classList.add('bomba');
                div.dataset.custo = -1;
                div.textContent = "-1";
    
                this.excluidas.add(chave);
                adicionadas++;
            }
        }
    }
    
  
    adicionarTesouros(qtd) {
      let adicionados = 0;
      while (adicionados < qtd) {
        const x = Math.floor(Math.random() * this.tamanho);
        const y = Math.floor(Math.random() * this.tamanho);
        const chave = `${x},${y}`;
  
        if (!this.excluidas.has(chave)) {
          const celula = this.getCelula(x, y);
          celula.tipo = 'tesouro';
          celula.custo = 1.5;
          this.registrarDescoberta(x, y, 'tesouro');
  
          const div = this.getDiv(x, y);
          div.classList.remove('livre');
          div.classList.add('tesouro');
          div.dataset.custo = 1.5;
          div.textContent = "1.5";
  
          this.excluidas.add(chave);
          adicionados++;
        }
      }
    }
  }