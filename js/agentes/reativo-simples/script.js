const board = document.getElementById('board');
const moveButton = document.getElementById('moveButton');
const timeDisplay = document.getElementById('time');
const stepsDisplay = document.getElementById('steps');
const statusDisplay = document.getElementById('status');
const sessionDisplay = document.getElementById('session');

const size = 10; // Tamanho do tabuleiro (10x10)
let totalCells = size * size; // Total de células no tabuleiro
let numeroSession = 0; // Sessão atual
let agentPosition = { x: 0, y: 0 }; // Posição inicial do agente
let bombaPositions = []; // Posições das bombas
let tesouroPosition = { x: 0, y: 0 }; // Posição do tesouro
let steps = 0; // Passos dados pelo agente
let elapsedTime = 0; // Tempo decorrido
let isMoving = true; // Controle do movimento do agente
let numeroBombas = totalCells * 0.5; // 50% do ambiente começa com bombas

init();

function init() {
    // Cria o tabuleiro
    board.innerHTML = ''; // Limpa o tabuleiro antes de criar
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            board.appendChild(cell);
        }
    }
}

// Função para posicionar o agente
function placeAgent() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('agent'));
    const agentCell = cells[agentPosition.y * size + agentPosition.x];
    agentCell.classList.add('agent');
}

// Função para posicionar o rato
function placeBomba() {
    const cells = document.querySelectorAll('.cell');

    bombaPositions = []; // Limpa o vetor de bombas antes de adicionar novas

    // Calcula o número de bombas para a sessão atual
    numeroBombas = numeroSession === 0 
        ? totalCells * 0.5 
        : numeroBombas - totalCells * 0.06;
    
    // Garante um limite mínimo de 20 bombas
    if (numeroBombas < 20) {
        statusDisplay.textContent = "Todas as sessões concluídas!";
        isMoving = false;
        return;
    }

    cells.forEach(cell => cell.classList.remove('bomba'))


    for (let i = 0; i < Math.floor(numeroBombas); i++) {
        let bombaPosition;
        do {
            bombaPosition = {
                x: Math.floor(Math.random() * size),
                y: Math.floor(Math.random() * size)
            };
        } while (bombaPositions.some(b => b.x === bombaPosition.x && b.y === bombaPosition.y));

        bombaPositions.push(bombaPosition);
        const bombaCell = cells[bombaPosition.y * size + bombaPosition.x];
        bombaCell.classList.add('bomba');
    }
    console.log(`Total de células: ${totalCells}`);
    console.log(`Número de bombas: ${numeroBombas}`);
}


// Função para posicionar o tesouro
function placeTesouro() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('tesouro'));
    
    // Gera uma posição aleatória para o rato
    tesouroPosition.x = Math.floor(Math.random() * size);
    tesouroPosition.y = Math.floor(Math.random() * size);
    
    const tesouroCell = cells[tesouroPosition.y * size + tesouroPosition.x];
    tesouroCell.classList.add('tesouro');
}


// Função para mover o agente
function moveAgent() {
    if (!isMoving) return; // Se o agente não deve se mover, retorna
    
    const direction = Math.floor(Math.random() * 4); // 0: cima, 1: baixo, 2: esquerda, 3: direita
    switch (direction) {
        case 0: // Cima
            if (agentPosition.y > 0) agentPosition.y--;
            break;
        case 1: // Baixo
            if (agentPosition.y < size - 1) agentPosition.y++;
            break;
        case 2: // Esquerda
            if (agentPosition.x > 0) agentPosition.x--;
            break;
        case 3: // Direita
            if (agentPosition.x < size - 1) agentPosition.x++;
            break;
    }
    
    steps++;
    updateDisplays();
    placeAgent();
    
    // Verifica se o agente encontrou o tesouro
    if (agentPosition.x === tesouroPosition.x && agentPosition.y === tesouroPosition.y) {
        isMoving = false; // Para o movimento do agente
        statusDisplay.textContent = "Agente encontrou o tesouro!";

    }

    // Verifica se o agente encontrou uma bomba
    for (let bomba of bombaPositions) {
        if (agentPosition.x === bomba.x && agentPosition.y === bomba.y) {
            isMoving = false;
            statusDisplay.textContent = "Agente encontrou a bomba!";
            numeroSession++;
            Inicializar();
            break;
        }
    }

    
}

// Atualiza as informações exibidas
function updateDisplays() {
    stepsDisplay.textContent = steps;
    sessionDisplay.textContent = numeroSession+1;
    timeDisplay.textContent = elapsedTime.toFixed(1);
}

// Inicializa o ambiente
function Inicializar() {
    isMoving = true;
    agentPosition = { x: 0, y: 0 };
    steps = 0;
    elapsedTime = 0;
    placeAgent();
    placeBomba();
    placeTesouro();
}

// Evento do botão para mover manualmente
moveButton.addEventListener('click', moveAgent);

// Movimento automático do agente
const autoMoveInterval = setInterval(() => {
    moveAgent();
    if (!isMoving && numeroBombas < 20) clearInterval(autoMoveInterval);
}, 1500);

// Atualização do tempo decorrido
setInterval(() => {
    if (isMoving) {
        elapsedTime += 1.5;
        updateDisplays();
    }
}, 1500);


Inicializar();
