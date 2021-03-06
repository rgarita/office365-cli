import { Rule } from "./Rule";
import { Occurrence } from "../";
import * as path from 'path'

export abstract class ManifestRule extends Rule {
  get resolutionType(): string {
    return 'json';
  };

  get file(): string {
    return '';
  };

  protected addOccurrence(resolution: string, filePath: string, projectPath: string, occurrences: Occurrence[]): void {
    occurrences.push({
      file: path.relative(projectPath, filePath),
      resolution: resolution
    });
  }
}