const board = document.getElementById('board');
const moveButton = document.getElementById('moveButton');
const timeDisplay = document.getElementById('time');
const stepsDisplay = document.getElementById('steps');
const currentCostDisplay = document.getElementById('currentCost');
const statusDisplay = document.getElementById('status');
const size = 10;
let agentPosition = { x: 0, y: 0 };
let mousePosition = { x: 0, y: 0 };
let steps = 0;
let elapsedTime = 0;
let isMoving = true;

// Tabela de Q-valores (estado, ação)
const qTable = {};
const learningRate = 0.1; // Taxa de aprendizado
const discountFactor = 0.9; // Fator de desconto
const epsilon = 0.2; // Taxa de exploração (para escolha aleatória)

// Cria o tabuleiro e inicializa os custos aleatórios
function createBoard() {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Atribui um custo aleatório entre 0 e 1
            const cost = (Math.random()).toFixed(2); // Limita a 2 casas decimais
            cell.textContent = cost;
            cell.dataset.cost = cost; // Armazena o custo no dataset
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
function placeMouse() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('mouse'));

    // Gera uma posição aleatória para o rato
    mousePosition.x = Math.floor(Math.random() * size);
    mousePosition.y = Math.floor(Math.random() * size);

    const mouseCell = cells[mousePosition.y * size + mousePosition.x];
    mouseCell.classList.add('mouse');
}

// Função para obter os Q-valores para os movimentos possíveis
function getQValues() {
    const directions = [
        { dx: 0, dy: -1 }, // Cima
        { dx: 0, dy: 1 },  // Baixo
        { dx: -1, dy: 0 }, // Esquerda
        { dx: 1, dy: 0 }   // Direita
    ];

    return directions.map(({ dx, dy }) => {
        const newX = agentPosition.x + dx;
        const newY = agentPosition.y + dy;
        const cell = document.querySelector(`.cell[data-x="${newX}"][data-y="${newY}"]`);
        const cost = cell ? parseFloat(cell.dataset.cost) : Infinity;
        const action = `${newX},${newY}`;

        // Inicializa Q-valores se não existirem
        if (!qTable[action]) {
            qTable[action] = 0; // Q-valor inicial
        }
        
        return { position: { x: newX, y: newY }, cost, qValue: qTable[action] };
    });
}

// Função para escolher a próxima ação com base nos Q-valores
function chooseAction() {
    const qValues = getQValues();
    if (Math.random() < epsilon) {
        // Exploração: escolha aleatória
        const validMoves = qValues.filter(move => move.position.x >= 0 && move.position.x < size && move.position.y >= 0 && move.position.y < size);
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    } else {
        // Exploração: escolha a melhor ação
        return qValues.reduce((best, move) => {
            if (move.position.x >= 0 && move.position.x < size && move.position.y >= 0 && move.position.y < size) {
                return (best === null || move.qValue > best.qValue) ? move : best;
            }
            return best;
        }, null);
    }
}

// Função para mover o agente e atualizar os Q-valores
function moveAgent() {
    if (!isMoving) return; // Se o agente não deve se mover, retorna

    const bestMove = chooseAction();
    if (bestMove) {
        // Atualiza a posição do agente
        agentPosition = bestMove.position;
        steps++;
        const cost = bestMove.cost;
        currentCostDisplay.textContent = cost.toFixed(2);
        updateDisplays();
        placeAgent();

        // Atualiza o Q-valor baseado na recompensa (custo negativo)
        const action = `${bestMove.position.x},${bestMove.position.y}`;
        const reward = -cost; // Recompensa negativa pelo custo
        qTable[action] = qTable[action] + learningRate * (reward + discountFactor * bestMove.qValue - qTable[action]);

        // Verifica se o agente alcançou o objetivo (o rato)
        if (agentPosition.x === mousePosition.x && agentPosition.y === mousePosition.y) {
            isMoving = false; // Para o movimento do agente
            statusDisplay.textContent = "Agente encontrou o rato!";
        }
    }
}

// Atualiza as informações exibidas
function updateDisplays() {
    stepsDisplay.textContent = steps;
    timeDisplay.textContent = elapsedTime.toFixed(1);
}

// Inicializa o agente e o rato
createBoard();
placeAgent();
placeMouse();

// Adiciona o evento de mover ao botão
moveButton.addEventListener('click', moveAgent);

// Mover o agente automaticamente a cada 1,5 segundos
const autoMoveInterval = setInterval(() => {
    moveAgent();
    if (!isMoving) clearInterval(autoMoveInterval); // Para o intervalo se o agente encontrar o rato
}, 1500);

// Atualiza o tempo decorrido a cada segundo
setInterval(() => {
    elapsedTime += 1.5; // Incrementa 1.5 segundos a cada intervalo
    updateDisplays();
}, 1500);
