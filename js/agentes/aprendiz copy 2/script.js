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
let visitedCells = new Set(); // Alterado para Set que armazena custo de cada célula visitada
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
    
    // Remover o agente das células anteriores
    cells.forEach(cell => cell.classList.remove('agent'));
    
    // Verificar se a posição do agente está dentro dos limites
    if (agentPosition.x >= 0 && agentPosition.x < size && agentPosition.y >= 0 && agentPosition.y < size) {
        const agentCell = cells[agentPosition.y * size + agentPosition.x];
        
        // Certifique-se de que a célula existe antes de adicionar a classe 'agent'
        if (agentCell) {
            agentCell.classList.add('agent');
        }
    }
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


// Função para adicionar um número fixo de bombas
function placeBombas(numBombas) {
    let placedBombas = 0;
    while (placedBombas < numBombas) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        
        // Verifique se a célula já é uma bomba ou tesouro
        if (cell && cell.dataset.cost !== '-1' && cell.dataset.cost !== '1.5') {
            cell.dataset.cost = -1; // Atribui o custo para bomba
            cell.classList.add('bomba'); // Adiciona a classe de bomba
            placedBombas++;
        }
    }
}

// Função para adicionar um número fixo de tesouros
function placeTesouros(numTesouros) {
    let placedTesouros = 0;
    while (placedTesouros < numTesouros) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        
        // Verifique se a célula já é uma bomba ou tesouro
        if (cell && cell.dataset.cost !== '-1' && cell.dataset.cost !== '1.5') {
            cell.dataset.cost = 1.5; // Atribui o custo para tesouro
            cell.classList.add('tesouro'); // Adiciona a classe de tesouro
            placedTesouros++;
        }
    }
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

// Função para escolher a próxima ação com base nos Q-valores, penalizando caminhos não vantajosos
function chooseAction() {
    const qValues = getQValues();
    const validMoves = qValues.filter(move => move.position.x >= 0 && move.position.x < size && move.position.y >= 0 && move.position.y < size);

    if (Math.random() < epsilon) {
        // Exploração: escolha aleatória
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    } else {
        // Exploração: escolha a melhor ação
        return validMoves.reduce((best, move) => {
            if (move.position.x >= 0 && move.position.x < size && move.position.y >= 0 && move.position.y < size) {
                // Penaliza caminhos já visitados com baixo Q-valor
                if (visitedCells.has(`${move.position.x},${move.position.y}`)) {
                    const penalty = 0.5; // Penaliza a escolha de células visitadas
                    move.qValue -= penalty; // Ajusta o Q-valor para células já visitadas
                }
                return (best === null || move.qValue > best.qValue) ? move : best;
            }
            return best;
        }, null);
    }
}

// Atualiza a Q-tabela com base no custo atual e recompensa
function updateQValue(action, reward, nextQValue) {
    const currentQValue = qTable[action] || 0;
    qTable[action] = currentQValue + learningRate * (reward + discountFactor * nextQValue - currentQValue);
}

// Função para mover o agente e atualizar os Q-valores
function moveAgent() {
    if (!isMoving) return;

    const bestMove = chooseAction();
    if (bestMove) {
        const cellKey = `${bestMove.position.x},${bestMove.position.y}`;
        const cost = bestMove.cost;
        const reward = -cost; // Custo negativo como recompensa

        // Atualiza o Q-valor
        updateQValue(cellKey, reward, bestMove.qValue);

        agentPosition = bestMove.position;
        steps++;
        currentCostDisplay.textContent = cost.toFixed(2);
        updateDisplays();
        placeAgent();

        // Marca a célula como visitada
        visitedCells.add(cellKey);

        // Verifica se é uma bomba ou tesouro
        if (cost === -1) {  // Se a célula for uma bomba
            bombsAcquired++; 
            totalCost += cost; // Subtrai do totalCost para representar o custo negativo
        } else if (cost === 1.5) {  // Se a célula for um tesouro
            treasuresAcquired++; 
            totalCost += cost; // Soma ao totalCost para representar o ganho
        }

        // Atualiza os displays
        bombsAcquiredDisplay.textContent = bombsAcquired;
        treasuresAcquiredDisplay.textContent = treasuresAcquired;
        totalCostDisplay.textContent = totalCost.toFixed(2); // Exibe o custo total adquirido

        // Verifica se o agente encontrou o rato
        if (agentPosition.x === mousePosition.x && agentPosition.y === mousePosition.y) {
            isMoving = false;
            statusDisplay.textContent = "Agente encontrou o rato!";
        }
    }
}

// Função para atualizar as informações exibidas
function updateDisplays() {
    stepsDisplay.textContent = steps;
    timeDisplay.textContent = elapsedTime.toFixed(1);
    totalCostDisplay.textContent = totalCost.toFixed(2); // Exibe o custo total adquirido
    bombsAcquiredDisplay.textContent = bombsAcquired;
    treasuresAcquiredDisplay.textContent = treasuresAcquired;
}
// Inicializa o agente e o rato
createBoard();
placeBombas(10); // Coloca 10 bombas
placeTesouros(5); // Coloca 5 tesouros
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
