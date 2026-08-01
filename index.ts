import {
  alternaPausa,
  avancaJogo,
  criaNovoJogo,
  mudaDirecao,
  type Direcao,
  type Jogo,
} from "./game"

const COLUNAS_MINIMAS = 24
const LINHAS_MINIMAS = 12
const ESCAPE = "\x1b"

let jogo = criaJogoParaTerminal()
let executando = true
let ultimaDirecao: Direcao | null = null

function criaJogoParaTerminal(): Jogo {
  const largura = Math.max(10, Math.min(60, (process.stdout.columns ?? 80) - 2))
  const altura = Math.max(6, Math.min(25, (process.stdout.rows ?? 24) - 5))
  return criaNovoJogo([largura, altura])
}

function exibeJogo(jogoAtual: Jogo): void {
  if (
    (process.stdout.columns ?? 80) < COLUNAS_MINIMAS
    || (process.stdout.rows ?? 24) < LINHAS_MINIMAS
  ) {
    process.stdout.write(
      `${ESCAPE}[H${ESCAPE}[2JTerminal pequeno demais. Use ao menos ${COLUNAS_MINIMAS}x${LINHAS_MINIMAS}.`,
    )
    return
  }

  const { tabuleiro } = jogoAtual
  const [largura, altura] = tabuleiro.tamanho
  const celulas = Array.from({ length: altura }, () => Array<string>(largura).fill("  "))

  if (tabuleiro.fruta) celulas[tabuleiro.fruta[1]]![tabuleiro.fruta[0]] = "\x1b[31m● \x1b[0m"
  tabuleiro.cobra.posicoes.forEach(([x, y], indice) => {
    celulas[y]![x] = indice === 0 ? "\x1b[92m██\x1b[0m" : "\x1b[32m██\x1b[0m"
  })

  const borda = `+${"--".repeat(largura)}+`
  const linhas = celulas.map((linha) => `|${linha.join("")}|`)
  const estado = mensagemEstado(jogoAtual)
  const saida = [
    `${ESCAPE}[H${ESCAPE}[2J\x1b[1;32mSNAKE\x1b[0m  Pontos: \x1b[1m${jogoAtual.pontuacao}\x1b[0m`,
    borda,
    ...linhas,
    borda,
    estado,
    "Setas/WASD: mover  Espaço/P: pausar  R: reiniciar  Q: sair",
  ].join("\n")

  process.stdout.write(saida)
}

function mensagemEstado(jogoAtual: Jogo): string {
  switch (jogoAtual.estado) {
    case "pausado":
      return "\x1b[33mPAUSADO\x1b[0m"
    case "fim-de-jogo":
      return "\x1b[31;1mFIM DE JOGO\x1b[0m - pressione R para tentar novamente"
    case "venceu":
      return "\x1b[32;1mVOCÊ VENCEU!\x1b[0m - pressione R para jogar novamente"
    default:
      return "Pegue a fruta vermelha e não bata nas paredes ou em si mesmo."
  }
}

function trataEntrada(tecla: string): void {
  if (tecla === "\u0003" || tecla.toLowerCase() === "q") {
    executando = false
    return
  }
  if (tecla.toLowerCase() === "r") {
    jogo = criaJogoParaTerminal()
    ultimaDirecao = null
    return
  }
  if (tecla === " " || tecla.toLowerCase() === "p") {
    jogo = alternaPausa(jogo)
    return
  }

  const direcoes: Record<string, Direcao> = {
    "\x1b[A": "cima",
    "\x1b[B": "baixo",
    "\x1b[C": "direita",
    "\x1b[D": "esquerda",
    w: "cima",
    s: "baixo",
    d: "direita",
    a: "esquerda",
  }
  const direcao = direcoes[tecla.toLowerCase()]
  if (direcao) ultimaDirecao = direcao
}

function encerra(): void {
  if (process.stdin.isTTY) process.stdin.setRawMode(false)
  process.stdin.pause()
  process.stdout.write(`${ESCAPE}[?25h${ESCAPE}[0m\n`)
}

async function principal(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error("Este jogo precisa ser executado em um terminal interativo.")
    process.exitCode = 1
    return
  }

  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding("utf8")
  process.stdout.write(`${ESCAPE}[?25l`)
  process.stdin.on("data", (tecla: string) => trataEntrada(tecla))

  try {
    while (executando) {
      if (ultimaDirecao) {
        jogo = mudaDirecao(jogo, ultimaDirecao)
        ultimaDirecao = null
      }
      jogo = avancaJogo(jogo)
      exibeJogo(jogo)
      await Bun.sleep(Math.max(80, 180 - jogo.pontuacao * 4))
    }
  } finally {
    encerra()
  }
}

await principal()
