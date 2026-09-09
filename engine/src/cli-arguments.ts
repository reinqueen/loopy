export const CLI_COMMANDS = [
  "init",
  "apply",
  "review",
  "confirm",
  "render",
  "interrupt",
  "resume",
  "stale",
  "status",
  "engineering-init",
  "engineering-apply",
  "engineering-review",
  "engineering-confirm",
  "engineering-render",
  "engineering-interrupt",
  "engineering-resume",
  "engineering-stale",
  "engineering-status",
  "roadmap-init",
  "roadmap-apply",
  "roadmap-render",
  "roadmap-interrupt",
  "roadmap-resume",
  "roadmap-stale",
  "roadmap-status",
  "definition-init",
  "definition-apply",
  "definition-review",
  "definition-confirm",
  "definition-render",
  "definition-interrupt",
  "definition-resume",
  "definition-stale",
  "definition-status",
  "change-init",
  "change-propose",
  "change-update",
  "change-review",
  "change-decide",
  "change-routine",
  "change-render",
  "change-interrupt",
  "change-resume",
  "change-stale",
  "change-status",
  "planning-init",
  "planning-apply",
  "planning-review",
  "planning-confirm-guides",
  "planning-revalidate",
  "planning-render",
  "planning-interrupt",
  "planning-resume",
  "planning-stale",
  "planning-status",
  "build-init",
  "build-activate",
  "build-assign",
  "build-work",
  "build-freeze",
  "build-evaluate",
  "build-adjust-budget",
  "build-revalidate",
  "build-render",
  "build-interrupt",
  "build-resume",
  "build-stale",
  "build-status",
  "demo-init",
  "demo-activate",
  "demo-authorize",
  "demo-observe",
  "demo-decide",
  "demo-block",
  "demo-render",
  "demo-interrupt",
  "demo-resume",
  "demo-stale",
  "demo-status",
] as const;

export type CliCommand = (typeof CLI_COMMANDS)[number];

export interface ParsedCliArguments {
  command: CliCommand;
  options: Record<string, string>;
}

const COMMAND_OPTIONS: Record<CliCommand, { required: string[]; optional: string[] }> = {
  init: { required: ["--workspace", "--project-name"], optional: ["--source-root", "--responsibilities"] },
  apply: { required: ["--workspace", "--input"], optional: ["--source-root"] },
  review: { required: ["--workspace"], optional: ["--source-root"] },
  confirm: { required: ["--workspace"], optional: ["--source-root", "--responsibilities"] },
  render: { required: ["--workspace"], optional: ["--source-root"] },
  interrupt: { required: ["--workspace"], optional: ["--source-root"] },
  resume: { required: ["--workspace"], optional: ["--source-root"] },
  stale: { required: ["--workspace"], optional: ["--source-root"] },
  status: { required: ["--workspace"], optional: ["--source-root"] },
  "engineering-init": { required: ["--workspace"], optional: ["--source-root", "--responsibilities"] },
  "engineering-apply": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "engineering-review": { required: ["--workspace"], optional: ["--source-root"] },
  "engineering-confirm": { required: ["--workspace"], optional: ["--source-root", "--responsibilities"] },
  "engineering-render": { required: ["--workspace"], optional: ["--source-root"] },
  "engineering-interrupt": { required: ["--workspace"], optional: ["--source-root"] },
  "engineering-resume": { required: ["--workspace"], optional: ["--source-root"] },
  "engineering-stale": { required: ["--workspace"], optional: ["--source-root"] },
  "engineering-status": { required: ["--workspace"], optional: ["--source-root"] },
  "roadmap-init": { required: ["--workspace"], optional: ["--source-root"] },
  "roadmap-apply": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "roadmap-render": { required: ["--workspace"], optional: ["--source-root"] },
  "roadmap-interrupt": { required: ["--workspace", "--resume-action"], optional: ["--source-root"] },
  "roadmap-resume": { required: ["--workspace"], optional: ["--source-root"] },
  "roadmap-stale": { required: ["--workspace"], optional: ["--source-root"] },
  "roadmap-status": { required: ["--workspace"], optional: ["--source-root"] },
  "definition-init": { required: ["--workspace"], optional: ["--source-root", "--input"] },
  "definition-apply": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "definition-review": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "definition-confirm": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "definition-render": { required: ["--workspace"], optional: ["--source-root"] },
  "definition-interrupt": { required: ["--workspace", "--resume-action"], optional: ["--source-root"] },
  "definition-resume": { required: ["--workspace"], optional: ["--source-root"] },
  "definition-stale": { required: ["--workspace"], optional: ["--source-root"] },
  "definition-status": { required: ["--workspace"], optional: ["--source-root"] },
  "change-init": { required: ["--workspace"], optional: ["--source-root"] },
  "change-propose": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "change-update": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "change-review": { required: ["--workspace", "--change-id"], optional: ["--source-root"] },
  "change-decide": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "change-routine": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "change-render": { required: ["--workspace"], optional: ["--source-root"] },
  "change-interrupt": { required: ["--workspace", "--change-id", "--resume-action"], optional: ["--source-root"] },
  "change-resume": { required: ["--workspace"], optional: ["--source-root"] },
  "change-stale": { required: ["--workspace"], optional: ["--source-root"] },
  "change-status": { required: ["--workspace"], optional: ["--source-root"] },
  "planning-init": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "planning-apply": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "planning-review": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "planning-confirm-guides": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "planning-revalidate": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "planning-render": { required: ["--workspace"], optional: ["--source-root"] },
  "planning-interrupt": { required: ["--workspace", "--plan-id", "--resume-action"], optional: ["--source-root"] },
  "planning-resume": { required: ["--workspace"], optional: ["--source-root"] },
  "planning-stale": { required: ["--workspace"], optional: ["--source-root"] },
  "planning-status": { required: ["--workspace"], optional: ["--source-root"] },
  "build-init": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "build-activate": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "build-assign": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "build-work": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "build-freeze": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "build-evaluate": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "build-adjust-budget": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "build-revalidate": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "build-render": { required: ["--workspace"], optional: ["--source-root"] },
  "build-interrupt": { required: ["--workspace", "--build-id", "--resume-action"], optional: ["--source-root"] },
  "build-resume": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "build-stale": { required: ["--workspace"], optional: ["--source-root"] },
  "build-status": { required: ["--workspace"], optional: ["--source-root"] },
  "demo-init": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "demo-activate": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "demo-authorize": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "demo-observe": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "demo-decide": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "demo-block": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "demo-render": { required: ["--workspace"], optional: ["--source-root"] },
  "demo-interrupt": { required: ["--workspace", "--demo-id", "--resume-action"], optional: ["--source-root"] },
  "demo-resume": { required: ["--workspace", "--input"], optional: ["--source-root"] },
  "demo-stale": { required: ["--workspace"], optional: ["--source-root"] },
  "demo-status": { required: ["--workspace"], optional: ["--source-root"] },
};

export function parseCliArguments(argv: string[]): ParsedCliArguments {
  const [commandValue, ...tokens] = argv;
  if (!CLI_COMMANDS.includes(commandValue as CliCommand)) {
    throw new Error(
      `Unknown or missing command. Use: ${CLI_COMMANDS.join(", ")}.`,
    );
  }
  const command = commandValue as CliCommand;
  const specification = COMMAND_OPTIONS[command];
  const allowed = new Set([...specification.required, ...specification.optional]);
  const options: Record<string, string> = {};

  for (let index = 0; index < tokens.length; index += 2) {
    const flag = tokens[index];
    if (!flag.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${flag}.`);
    }
    if (!allowed.has(flag)) {
      throw new Error(`Unknown option for ${command}: ${flag}.`);
    }
    if (Object.hasOwn(options, flag)) {
      throw new Error(`Duplicate option: ${flag}.`);
    }
    const value = tokens[index + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for option: ${flag}.`);
    }
    if (!value.trim()) {
      throw new Error(`Blank value for option: ${flag}.`);
    }
    options[flag] = value;
  }

  for (const required of specification.required) {
    if (!Object.hasOwn(options, required)) throw new Error(`Missing required option: ${required}.`);
  }
  return { command, options };
}
