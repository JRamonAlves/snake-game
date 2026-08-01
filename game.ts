export type Posicao = [x: number, y: number]
export type Direcao = "cima" | "baixo" | "esquerda" | "direita"
export type Estado = "jogando" | "pausado" | "fim-de-jogo" | "venceu"

export type Cobra = {
  posicoes: Posicao[]
  direcao: Direcao
}

export type Tabuleiro = {
  tamanho: [largura: number, altura: number]
  cobra: Cobra
  fruta: Posicao | null
}

export type Jogo = {
  tabuleiro: Tabuleiro
  pontuacao: number
  estado: Estado
}

const vetores: Record<Direcao, Posicao> = {
  cima: [0, -1],
  baixo: [0, 1],
  esquerda: [-1, 0],
  direita: [1, 0],
}

const opostas: Record<Direcao, Direcao> = {
  cima: "baixo",
  baixo: "cima",
  esquerda: "direita",
  direita: "esquerda",
}

export function criaNovoJogo(
  tamanho: Tabuleiro["tamanho"],
  aleatorio: () => number = Math.random,
): Jogo {
  const largura = Math.max(10, Math.floor(tamanho[0]))
  const altura = Math.max(6, Math.floor(tamanho[1]))
  const cabeca: Posicao = [Math.floor(largura / 2), Math.floor(altura / 2)]
  const posicoes: Posicao[] = [
    cabeca,
    [cabeca[0] - 1, cabeca[1]],
    [cabeca[0] - 2, cabeca[1]],
  ]
  const tabuleiro: Tabuleiro = {
    tamanho: [largura, altura],
    cobra: { posicoes, direcao: "direita" },
    fruta: null,
  }

  const posicoesDisponiveis = posicoesLivres(tabuleiro)
  if (posicoesDisponiveis.length > 0) {
    tabuleiro.fruta = criaFruta(posicoesDisponiveis, aleatorio)
  }
  return {
    tabuleiro,
    pontuacao: 0,
    estado: posicoesDisponiveis.length > 0 ? "jogando" : "venceu",
  }
}

export function mudaDirecao(jogo: Jogo, direcao: Direcao): Jogo {
  if (jogo.estado !== "jogando" || opostas[jogo.tabuleiro.cobra.direcao] === direcao) {
    return jogo
  }

  return {
    ...jogo,
    tabuleiro: {
      ...jogo.tabuleiro,
      cobra: { ...jogo.tabuleiro.cobra, direcao },
    },
  }
}

export function alternaPausa(jogo: Jogo): Jogo {
  if (jogo.estado !== "jogando" && jogo.estado !== "pausado") return jogo
  return { ...jogo, estado: jogo.estado === "jogando" ? "pausado" : "jogando" }
}

export function avancaJogo(jogo: Jogo, aleatorio: () => number = Math.random): Jogo {
  if (jogo.estado !== "jogando") return jogo

  const { tabuleiro } = jogo
  const { posicoes: posicoesCobra, direcao: direcaoCobra } = tabuleiro.cobra
  const cabeca = posicoesCobra[0]
  if (!cabeca) return { ...jogo, estado: "fim-de-jogo" }

  const vetor = vetores[direcaoCobra]
  const proximaCabeca = calculaProximaCabeca(cabeca, vetor)
  const comeu = comeuFruta(proximaCabeca, tabuleiro.fruta)
  const corpoVerificado = corpoParaColisao(posicoesCobra, comeu)

  if (
    foraDoTabuleiro(proximaCabeca, tabuleiro.tamanho)
    || corpoVerificado.some((posicao) => mesmaPosicao(posicao, proximaCabeca))
  ) {
    return { ...jogo, estado: "fim-de-jogo" }
  }

  const proximasPosicoes = atualizaPosicoes(proximaCabeca, posicoesCobra, comeu)
  const novoTabuleiro = proximoTabuleiro(tabuleiro, proximasPosicoes, direcaoCobra, comeu)

  if (comeu) {
    const posicoesDisponiveis = posicoesLivres(novoTabuleiro)
    if (posicoesDisponiveis.length === 0) {
      return { tabuleiro: novoTabuleiro, pontuacao: jogo.pontuacao + 1, estado: "venceu" }
    }
    novoTabuleiro.fruta = criaFruta(posicoesDisponiveis, aleatorio)
  }

  return {
    tabuleiro: novoTabuleiro,
    pontuacao: jogo.pontuacao + (comeu ? 1 : 0),
    estado: jogo.estado,
  }
}

export function criaFruta(
  posicoesDisponiveis: Posicao[],
  aleatorio: () => number = Math.random,
): Posicao {
  const posicao = posicoesDisponiveis[Math.floor(aleatorio() * posicoesDisponiveis.length)]
    ?? posicoesDisponiveis[0]
  if (!posicao) throw new Error("Não há posição livre para criar a fruta")
  return posicao
}

function posicoesLivres(tabuleiro: Tabuleiro): Posicao[] {
  const [largura, altura] = tabuleiro.tamanho
  const ocupadas = new Set(tabuleiro.cobra.posicoes.map(([x, y]) => `${x},${y}`))

  // Cria uma matriz com todas as coordenadas possíveis do tabuleiro.
  return Array.from({ length: altura }, (_, y) =>
    Array.from({ length: largura }, (_, x): Posicao => [x, y]),
  )
    // Transforma a matriz de linhas em uma lista única de posições.
    .flat()
    // Mantém somente as posições que não estão ocupadas pela cobra.
    .filter(([x, y]) => !ocupadas.has(`${x},${y}`))
}

function calculaProximaCabeca(cabeca: Posicao, vetor: Posicao): Posicao {
  return [cabeca[0] + vetor[0], cabeca[1] + vetor[1]]
}

function comeuFruta(cabeca: Posicao, fruta: Posicao | null): boolean {
  return fruta !== null && mesmaPosicao(cabeca, fruta)
}

function corpoParaColisao(posicoes: Posicao[], comeu: boolean): Posicao[] {
  return comeu ? posicoes : posicoes.slice(0, -1)
}

function atualizaPosicoes(
  proximaCabeca: Posicao,
  posicoes: Posicao[],
  comeu: boolean,
): Posicao[] {
  return comeu
    ? [proximaCabeca, ...posicoes]
    : [proximaCabeca, ...posicoes.slice(0, -1)]
}

function proximoTabuleiro(
  tabuleiro: Tabuleiro,
  posicoes: Posicao[],
  direcao: Direcao,
  comeu: boolean,
): Tabuleiro {
  return {
    ...tabuleiro,
    cobra: { posicoes, direcao },
    fruta: comeu ? null : tabuleiro.fruta,
  }
}

function mesmaPosicao([ax, ay]: Posicao, [bx, by]: Posicao): boolean {
  return ax === bx && ay === by
}

function foraDoTabuleiro(
  [x, y]: Posicao,
  [largura, altura]: Tabuleiro["tamanho"],
): boolean {
  return x < 0 || x >= largura || y < 0 || y >= altura
}
