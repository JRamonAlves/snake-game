// Tipagem do jogo
// Sobre a tipagem de TypeScript:
//    Ela é bem completa e usa dos objetos de JavaScript.
//    Cada objeto pode ser de um tipo. Criar tipos pode ser
//    por composição e por uso das funções de tipo que TS
//    disponibiliza (aqui eu não usei nenhuma). Idiomaticamente
//    enums são feitos através do operador | então
//    "X" | "Y" é um enum para todos os fins.
//    Outro recurso importante é o uso de tipos dentro de tipos compostos.
//    Eu usei no caso de Board['size']. Assim eu posso usar o tipo
//    de 'size' sem necessariamente declara-lo separadamente.
//    Outro operador importante é o as que permite forçar o castings
//    de um tipo para um outro menor e especifico. Usei no main para
//    criar as seeds.

/**
 * Tipo do jogo, possui um board, o score do jogador
 * e um state para decidir a proxima acao do jogo.
 */
export type Game = {
  board: Board
  score: Score,
  state: State
}

/**
 * Pontuacao do jogador
 */
export type Score = number

/**
 * Estado atual do jogo, decide a proxima acao
 */
export type State = "playing" | "stopped" | "paused"

/**
 * Tabuleiro o jogo.
 *
 * Possui a cobra que o jogador vai controlar e uma fruta que ele tem que buscar
 * para pontuar. Possui tambem o tamanho do tabuleiro.
 */
export type Board = {
  size: [number, number]
  snake: Snake
  fruit: Fruit
}

/**
 * Cobra que o jogador vai controlar, possui head e positions.
 */
export type Snake = {
  positions: Pos[]
  head: Pos
}

/**
 * Fruta que o jogador tem que buscar para pontuar no jogo
 */
export type Fruit = {
  pos: Pos
}
/**
 * Tipo que especifica uma posicao no jogo.
 */
export type Pos = [Y, X]

export type Y = number

export type X = number

export type Seeds = [number, number]

// Functional Core
export function criaNovoJogo(tamanho: Board['size'], seeds: Seeds): Game {
  const board = criaNovoTabuleiro(tamanho, seeds)
  const score = 0
  const state = "playing"
  return {
    board,
    score,
    state
  }
}

export function criaNovoTabuleiro(tamanho: Board['size'], seeds: Seeds): Board {

  const size = tamanho
  const midWid = tamanho[0] / 2
  const midHei = tamanho[1] / 2
  const head = [midWid, midHei] as Pos

  const fruit = { pos: seeds }
  const snake = {
    head,
    positions: [head]
  }

  return {
    snake,
    fruit,
    size
  }
}
