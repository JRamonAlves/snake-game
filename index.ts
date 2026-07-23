import { criaNovoJogo, type Board, type Seeds } from "./game";

console.log("Hello via Bun!");

async function main() {
  const width = process.stdout.columns;
  const height = process.stdout.rows;

  const seeds = [width * Math.random(), height * Math.random()] as Seeds
  const game = criaNovoJogo([width, height] as Board['size'], seeds)
  const speed = 700

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  while (true) {
    exibeJogo(game)
    const input = await leInput(speed)

  }
  // Exibe pra o usuario
  //
  // Recolhe o input do usuario
  // Computa a proxima jogada com base no input
  // Confere o estado do jogo
  // Loop
}

async function leInput(timeoutMs: number) {
  return new Promise((resolve) => {
      const timer = setTimeout(() => {
        cleanup();
        resolve(null);
      }, timeoutMs);

      // Le o input
      function onData(key: string) {
        cleanup();
        resolve(key);
      }

      // Cancela o setTimeout.
      function cleanup() {
        clearTimeout(timer);
        process.stdin.off("data", onData);
      }

      process.stdin.once("data", onData);
    });

}

await main()
