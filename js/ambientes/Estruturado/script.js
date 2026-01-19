const chessboard = document.getElementById('chessboard');

// Cria o tabuleiro
for (let i = 0; i < 64; i++) {
    const square = document.createElement('div');
    square.classList.add('square');
    chessboard.appendChild(square);
}

// Adiciona peças iniciais
const pieces = {
    '♖': [0, 1],  // Torres
    '♘': [1, 1],  // Cavalos
    '♗': [2, 1],  // Bispos
    '♕': [3, 1],  // Rainha
    '♔': [4, 1],  // Rei
    '♗': [5, 1],  // Bispos
    '♘': [6, 1],  // Cavalos
    '♖': [7, 1],  // Torres
    '♙': Array.from({ length: 8 }, (_, i) => [i, 6]) // Peões
};

// Adiciona as peças no tabuleiro
for (const [piece, positions] of Object.entries(pieces)) {
    if (Array.isArray(positions[0])) {
        positions.forEach(([x, y]) => {
            const square = chessboard.children[y * 8 + x];
            const pieceDiv = document.createElement('div');
            pieceDiv.textContent = piece;
            pieceDiv.classList.add('piece');
            square.appendChild(pieceDiv);
            makeDraggable(pieceDiv);
        });
    } else {
        const [x, y] = positions;
        const square = chessboard.children[y * 8 + x];
        const pieceDiv = document.createElement('div');
        pieceDiv.textContent = piece;
        pieceDiv.classList.add('piece');
        square.appendChild(pieceDiv);
        makeDraggable(pieceDiv);
    }
}

// Função para permitir arrastar as peças
function makeDraggable(piece) {
    piece.draggable = true;

    piece.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', piece.textContent);
        piece.style.opacity = '0.5';
    });

    piece.addEventListener('dragend', () => {
        piece.style.opacity = '';
    });

    piece.parentElement.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    piece.parentElement.addEventListener('drop', (e) => {
        e.preventDefault();
        const pieceContent = e.dataTransfer.getData('text/plain');
        const targetSquare = e.target;

        if (targetSquare.classList.contains('square')) {
            targetSquare.innerHTML = `<div class="piece">${pieceContent}</div>`;
            makeDraggable(targetSquare.firstChild);
            piece.parentElement.removeChild(piece);
        }
    });
}
