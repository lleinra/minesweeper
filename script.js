let cells
let cellsElement = [...document.getElementsByClassName('cell')]
let revealedCells
let time = document.getElementById('time')
let flags = document.getElementById('flags')
let resetButton = document.getElementById('reset-button')
let ongoing = false
let interval

window.oncontextmenu = (e) => {
    e.preventDefault();
}

function setup() {
    ongoing = true
    cellsElement.forEach(cellElement => {
        cellElement.classList.remove(...cellElement.classList)
        cellElement.classList.add('cell')
        cellElement.innerText = ''
    })
    cells = []
    clearInterval(interval)
    interval = setInterval(function () {
        time.innerText = `${parseInt(time.innerText) + 1}`
    }, 1000)
    revealedCells = 0
    time.innerText = '0'
    flags.innerText = '10'
    setCells()
    setBoard()
}

function onLoad() {
    resetButton.addEventListener('mousedown', function () { setup() })
    setup()
}

function setCells() {
    for (let i = 0; i < 10; i++) {
        const tempArray = []
        for (let j = 0; j < 10; j++) {
            tempArray.push(new Cell(i, j))
            let cell = document.getElementById(`cell-${(i * 10 + j) + 1}`)
            cell.removeEventListener('mousedown', onClickNumber)
            cell.addEventListener('mousedown', onClick)
        }
        cells.push(tempArray)
    }
}

function onClickNumber(e) {
    if (!ongoing || e.which == 3) {
        return
    }
    const cellElement = e.target
    const elemValue = parseInt(cellElement.id.replace(/^\D+/g, '') - 1)
    const x = Math.floor(elemValue % 10)
    const y = Math.floor(elemValue / 10)
    let cell = cells[y][x]
    let count = 0
    cell.neighbors.forEach(neighbor => {
        if (neighbor.cell.classList.contains('show')) {
            return
        }
        if (neighbor.cell.classList.contains('flagged')) {
            count += 1
        }
    })
    cell.neighbors.forEach(neighbor => {
        if (neighbor.cell.classList.contains('show') || neighbor.cell.classList.contains('flagged')) {
            return
        }
        if (count == cell.value) {
            showCell(neighbor, neighbor.cell, neighbor.value)
        }
    })
}

function onClick(e) {
    if (!ongoing) {
        return
    }
    const cellElement = e.target
    if (e.which == 3) {
        if (cellElement.classList.contains('show')) {
            return
        }
        let flagged = cellElement.classList.contains('flagged')
        if (flagged) {
            cellElement.classList.remove('flagged')
            flags.innerText = `${parseInt(flags.innerText) + 1}`
        } else {
            cellElement.classList.add('flagged')
            flags.innerText = `${parseInt(flags.innerText) - 1}`
        }
        return
    }
    const elemValue = parseInt(cellElement.id.replace(/^\D+/g, '') - 1)
    const x = Math.floor(elemValue % 10)
    const y = Math.floor(elemValue / 10)
    let cell = cells[y][x]
    showCell(cell, cellElement, cell.value)
}

function showCell(cell, cellElement, value) {
    if (cell.bomb) {
        endGame(false)
        return
    }
    cellElement.removeEventListener('mousedown', onClick)
    revealedCells += 1
    if (cellElement.classList.contains('flagged')) {
        flags.innerText = `${parseInt(flags.innerText) + 1}`
    }
    cellElement.classList.remove('flagged')
    cellElement.classList.add('show')
    if (value != '') {
        cellElement.classList.add(`show-${value}`)
        cellElement.addEventListener('mousedown', onClickNumber)
    }
    cellElement.innerText = value
    if (gameIsDone()) {
        endGame(true)
    }
    if (value == '') {
        revealNeighbors(cell, cellElement, value)
    }
}

function gameIsDone() {
    return revealedCells >= 90
}

function revealNeighbors(cell, cellElement, value) {
    cell.neighbors.forEach(neighbor => {
        if (neighbor.cell.classList.contains('show')) {
            return
        }
        if (neighbor.neighbors.some(neigh => { return neigh.cell.classList.contains('flagged') })) {
            return
        }
        showCell(neighbor, neighbor.cell, neighbor.value)
    })
}

async function endGame(win) {
    showBombs()
    clearInterval(interval)
    ongoing = false
    if (win) {
        alert("you won")
    } else {
        alert("you lost")
    }
}

function showBombs() {
    cells.forEach(cellRow => {
        cellRow.forEach(cell => {
            if (cell.bomb) {
                cell.cell.classList.add('bomb')
            }
        })
    })
}

function setBoard() {
    for (let i = 0; i < 10; i++) {
        let cell
        do {
            let randomI = Math.floor(Math.random() * 10)
            let randomJ = Math.floor(Math.random() * 10)
            cell = cells[randomI][randomJ]
        } while (cell.bomb)
        cell.bomb = true;
    }

    cells.forEach(cellRow => {
        cellRow.forEach(cell => {
            cell.neighbors = getNeighbors(cell)
            if (cell.bomb) {
                cell.neighbors.forEach(neighbor => {
                    if (neighbor.bomb) {
                        return
                    }
                    let neighborValue = neighbor.value
                    if (neighborValue == '') {
                        neighborValue = '1'
                    } else {
                        neighborValue = `${parseInt(neighborValue) + 1}`
                    }
                    if (neighborValue == '1') {
                        neighbor.cell
                    }
                    neighbor.value = neighborValue
                })
            }
        })
    })
}

function getNeighbors(cell) {
    let x = cell.x;
    let y = cell.y;
    let neighbors = []

    if (y > 0) {
        neighbors.push(cells[y - 1][x])
    }
    if (x < 9 && y > 0) {
        neighbors.push(cells[y - 1][x + 1])
    }
    if (x < 9) {
        neighbors.push(cells[y][x + 1])
    }
    if (x < 9 && y < 9) {
        neighbors.push(cells[y + 1][x + 1])
    }
    if (y < 9) {
        neighbors.push(cells[y + 1][x])
    }
    if (y < 9 && x > 0) {
        neighbors.push(cells[y + 1][x - 1])
    }
    if (x > 0) {
        neighbors.push(cells[y][x - 1])
    }
    if (x > 0 && y > 0) {
        neighbors.push(cells[y - 1][x - 1])
    }

    return neighbors
}

class Cell {
    constructor(i, j) {
        this.cell = document.getElementById(`cell-${(i * 10 + j) + 1}`)
        this.x = j;
        this.y = i;
        this.value = ''
        this.bomb = false;
        this.neighbors = []
    }
}

onLoad();