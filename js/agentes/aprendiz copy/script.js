const board = document.getElementById('board');
const moveButton = document.getElementById('moveButton');
const bombsAcquiredDisplay = document.getElementById('bombsAcquired');
const treasuresAcquiredDisplay = document.getElementById('treasuresAcquired');
const timeDisplay = document.getElementById('time');
const stepsDisplay = document.getElementById('steps');
const currentCostDisplay = document.getElementById('currentCost');
const totalCostDisplay = document.getElementById('acquiredCost');
const statusDisplay = document.getElementById('status');
const size = 10;
let agentPosition = { x: 0, y: 0 };
let mousePosition = { x: 0, y: 0 };
let steps = 0;
let elapsedTime = 0;
let isMoving = true;
let visitedCells = new Set();
let bombsAcquired = 0;
let treasuresAcquired = 0;
let totalCost = 0;

// Tabela de Q-valores (estado, ação)
const qTable = {};
const learningRate = 0.1;
const discountFactor = 0.9;
const epsilon = 0.2;

// Função para criar o tabuleiro com valores específicos
function createBoard() {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;

            // Atribui valores específicos para células
            let cost = Math.random();
            if (Math.random() < 0.1) { // 10% de chance para ser uma bomba
                cost = -1; // Custo muito negativo para bombas
                cell.classList.add('bomba');
            } else if (Math.random() < 0.05) { // 5% de chance para ser tesouro
                cost = 1.5; // Custo positivo para tesouro
                cell.classList.add('tesouro');
            } else {
                cost = 1; // Células livres
                cell.classList.add('livre');
            }

            cell.textContent = cost.toFixed(2); // Exibe o custo nas células
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
    if (!isMoving) return;

    const bestMove = chooseAction();
    if (bestMove) {
        // Verifica se a célula já foi visitada e se não é bomba ou tesouro
        const cellKey = `${bestMove.position.x},${bestMove.position.y}`;
        let shouldUpdateCost = !visitedCells.has(cellKey) || bestMove.cost === -10 || bestMove.cost === 1.5;

        // Atualiza a posição do agente
        agentPosition = bestMove.position;
        steps++;
        const cost = bestMove.cost;
        currentCostDisplay.textContent = cost.toFixed(2);
        updateDisplays();
        placeAgent();

        // Atualiza o custo adquirido
        if (shouldUpdateCost) {
            totalCost += cost;
        }

        // Marcar a célula como visitada
        if (!visitedCells.has(cellKey)) {
            visitedCells.add(cellKey);
        }

        // Atualiza o Q-valor baseado na recompensa (custo negativo)
        const action = `${bestMove.position.x},${bestMove.position.y}`;
        const reward = -cost; // Recompensa negativa pelo custo
        qTable[action] = qTable[action] + learningRate * (reward + discountFactor * bestMove.qValue - qTable[action]);

        // Verifica se a célula é uma bomba ou tesouro
        if (bestMove.cost === -10) {
            bombsAcquired++; // Incrementa o contador de bombas
        } else if (bestMove.cost === 1.5) {
            treasuresAcquired++; // Incrementa o contador de tesouros
        }

        // Atualiza os displays
        bombsAcquiredDisplay.textContent = bombsAcquired;
        treasuresAcquiredDisplay.textContent = treasuresAcquired;

        // Verifica se o agente alcançou o objetivo (o rato)
        if (agentPosition.x === mousePosition.x && agentPosition.y === mousePosition.y) {
            isMoving = false;
            statusDisplay.textContent = "Agente encontrou o rato!";
        }
    }
}

// Atualiza as informações exibidas
function updateDisplays() {
    stepsDisplay.textContent = steps;
    timeDisplay.textContent = elapsedTime.toFixed(1);
    totalCostDisplay.textContent = totalCost.toFixed(2);
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
    elapsedTime += 1.5;
    updateDisplays();
}, 1500);