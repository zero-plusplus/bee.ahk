import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

const indentStr = (str: string, indent: string): string => {
  return `${indent}${str.replace(/(\r\n|\n)/gu, `$1${indent}`)}`;
};

const bom = '\uFEFF';
export class AhkInliner {
  public readonly version: 1 | 2;
  constructor(version: 1 | 2) {
    this.version = version;
  }
  public exec(src: string, _currentFile?: string, _indent = ''): string {
    const rootPath = path.resolve(src);
    const currentPath = path.resolve(_currentFile ?? src);
    const sourcecode = readFileSync(currentPath, 'utf8').replace(new RegExp(`^${bom}`, 'u'), '');

    const inlined = sourcecode.replace(/^(?<indent>[^\S\r\n]*)#Include (?<libPath>.+)\s*$/gumi, (...params) => {
      const { indent, libPath } = params[params.length - 1] as { [key: string]: string};
      const resolvedPath = this.resolvePath(src, currentPath, libPath);

      return this.exec(rootPath, resolvedPath, indent);
    });
    return indentStr(inlined, _indent);
  }
  public write(src: string, dest: string): void {
    const inlined = `${bom}${this.exec(src)}`;
    writeFileSync(dest, inlined, 'utf-8');
  }
  private resolvePath(rootPath: string, currentPath: string, libPath: string): string {
    if (libPath.startsWith('<') && libPath.endsWith('>')) {
      return path.resolve(`${rootPath}/lib/${libPath}`);
    }
    else if (libPath.startsWith('%')) {
      return path.resolve(libPath.replace(/%(?<variableName>.+)%(?<restPath>.+)/ui, (...params) => {
        const { variableName, restPath } = params[params.length - 1] as { [key: string]: string};
        const expand = variableName
          .replace(/A_LineFile/ui, currentPath)
          .replace(/A_AppData/ui, String(process.env.APPDATA))
          .replace(/A_AppDataCommon/ui, String(process.env.ProgramData));
        return path.resolve(`${expand}/${restPath}`);
      }));
    }
    else if (this.version === 2 && !path.isAbsolute(libPath)) {
      return path.resolve(path.dirname(currentPath), libPath);
    }
    return path.resolve(libPath);
  }
}
