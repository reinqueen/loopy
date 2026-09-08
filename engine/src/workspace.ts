import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

export class WorkspaceError extends Error {
  override name = "WorkspaceError";
}

function isInside(root: string, target: string): boolean {
  const path = relative(root, target);
  return path === "" || (!path.startsWith(`..${sep}`) && path !== ".." && !isAbsolute(path));
}

export function canonicalWorkspaceRoot(workspaceRoot: string): string {
  mkdirSync(workspaceRoot, { recursive: true });
  return realpathSync(workspaceRoot);
}

export function resolveInsideWorkspace(workspaceRoot: string, relativePath: string): string {
  if (isAbsolute(relativePath)) {
    throw new WorkspaceError("Writes must use a path relative to the target workspace.");
  }
  const root = realpathSync(workspaceRoot);
  const target = resolve(root, relativePath);
  if (!isInside(root, target)) {
    throw new WorkspaceError(`Write escapes the target workspace: ${relativePath}.`);
  }

  let existing = target;
  while (!existsSync(existing)) existing = dirname(existing);
  const realExisting = realpathSync(existing);
  if (!isInside(root, realExisting)) {
    throw new WorkspaceError(`Write follows a path outside the target workspace: ${relativePath}.`);
  }
  if (existsSync(target) && lstatSync(target).isSymbolicLink()) {
    const realTarget = realpathSync(target);
    if (!isInside(root, realTarget)) {
      throw new WorkspaceError(`Write follows a symlink outside the target workspace: ${relativePath}.`);
    }
  }
  return target;
}

export function canonicalPathInsideWorkspace(workspaceRoot: string, relativePath: string): string {
  const target = resolveInsideWorkspace(workspaceRoot, relativePath);
  return existsSync(target) ? realpathSync(target) : target;
}

export function writeInsideWorkspace(
  workspaceRoot: string,
  relativePath: string,
  content: string,
): void {
  const target = resolveInsideWorkspace(workspaceRoot, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  const temporary = join(dirname(target), `.${basename(target)}.loopy-tmp-${randomUUID()}`);
  let descriptor: number | undefined;
  try {
    descriptor = openSync(temporary, "wx", 0o600);
    writeFileSync(descriptor, content, "utf8");
    renameSync(temporary, target);
    closeSync(descriptor);
    descriptor = undefined;
  } catch (error) {
    if (descriptor !== undefined) {
      try {
        closeSync(descriptor);
      } catch {
        // Preserve the original write or rename failure.
      }
    }
    try {
      unlinkSync(temporary);
    } catch {
      // The path may not have been created or may already have been renamed.
    }
    throw error;
  }
}

export interface FileSetWriteHooks {
  beforeStage?: (relativePath: string) => void;
  beforeCommit?: (relativePath: string) => void;
}

interface StagedFile {
  relativePath: string;
  target: string;
  temporary: string;
  backup: string;
  hadOriginal: boolean;
  backupMoved: boolean;
  committed: boolean;
}

function pathExists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export function writeFileSetInsideWorkspace(
  workspaceRoot: string,
  files: ReadonlyArray<readonly [relativePath: string, content: string]>,
  hooks: FileSetWriteHooks = {},
): void {
  const seen = new Set<string>();
  const staged: StagedFile[] = files.map(([relativePath]) => {
    const target = resolveInsideWorkspace(workspaceRoot, relativePath);
    if (seen.has(target)) throw new WorkspaceError(`File-set update repeats a target: ${relativePath}.`);
    seen.add(target);
    mkdirSync(dirname(target), { recursive: true });
    const nonce = randomUUID();
    return {
      relativePath,
      target,
      temporary: join(dirname(target), `.${basename(target)}.loopy-stage-${nonce}`),
      backup: join(dirname(target), `.${basename(target)}.loopy-backup-${nonce}`),
      hadOriginal: pathExists(target),
      backupMoved: false,
      committed: false,
    };
  });
  let committedAll = false;

  try {
    for (let index = 0; index < staged.length; index += 1) {
      const entry = staged[index];
      hooks.beforeStage?.(entry.relativePath);
      const descriptor = openSync(entry.temporary, "wx", 0o600);
      try {
        writeFileSync(descriptor, files[index][1], "utf8");
      } finally {
        closeSync(descriptor);
      }
    }

    for (const entry of staged) {
      hooks.beforeCommit?.(entry.relativePath);
      if (entry.hadOriginal) {
        renameSync(entry.target, entry.backup);
        entry.backupMoved = true;
      }
      renameSync(entry.temporary, entry.target);
      entry.committed = true;
    }
    committedAll = true;
  } catch (error) {
    for (const entry of [...staged].reverse()) {
      try {
        if (entry.committed && pathExists(entry.target)) unlinkSync(entry.target);
        if (entry.backupMoved && pathExists(entry.backup)) {
          renameSync(entry.backup, entry.target);
          entry.backupMoved = false;
        }
      } catch {
        // Continue attempting to restore the rest of the prior generation.
      }
    }
    throw error;
  } finally {
    for (const entry of staged) {
      try {
        if (pathExists(entry.temporary)) unlinkSync(entry.temporary);
      } catch {
        // A leftover stage file is never authoritative.
      }
      try {
        if (committedAll && pathExists(entry.backup)) unlinkSync(entry.backup);
      } catch {
        // A leftover backup is recoverable and safer than deleting the prior generation.
      }
    }
  }
}

export function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
