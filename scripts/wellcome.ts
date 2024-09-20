import { intro, outro, spinner } from "@clack/prompts";
import { exec } from "child_process";

interface ErrorType {
  message: string;
  [key: string]: any;
}

const commands = ["rm -rf ./yarn.lock", "rm -rf ./bun.lockb", "bun --version"];

const commands2 = ["bun generate:migration", "bun migrate"];

const runCommand = async (command: string) => {
  const sp = spinner();
  sp.start(`Executando: ${command}`);

  return new Promise<void>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      sp.stop();
      if (error) {
        console.error(`Erro ao executar ${command}: ${error.message}`);
        reject(new Error(`Failed to execute ${command}: ${error.message}`));
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        reject(new Error(`stderr output for ${command}: ${stderr}`));
        return;
      }
      console.log(`stdout: ${stdout}`);
      resolve();
    });
  });
};

// Wrapper to run multiple commands sequentially
const runCommands = async (commands: string[], title: string) => {
  intro(title);
  for (const command of commands) {
    try {
      await runCommand(command);
    } catch (exception) {
      const ex = exception as ErrorType;
      outro(`Erro: ${ex.message}`);
      return false;
    }
  }
  outro(`${title} concluído.`);
  return true;
};

// Main execution flow
(async () => {
  let verify = false;

  // Run the first set of commands (dependency installation)
  verify = await runCommands(
    commands,
    "Executando comandos de inicialização..."
  );

  // If the first set succeeded, run the DB migration commands
  if (verify) {
    await runCommand("bun install");
    await runCommands(commands2, "Executando migração do DB...");
  } else {
    outro("Falha ao instalar dependências. Migração cancelada.");
  }
})();
