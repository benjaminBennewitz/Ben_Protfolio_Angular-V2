/* src/app/shared/repository-gate/repository-gate.component.spec.ts */

import { describe, expect, it } from 'vitest';
import {
  appendRepositoryFailure,
  isRepositoryAnswerAccepted,
  MAX_VISIBLE_REPOSITORY_FAILURES,
} from './repository-gate.component';

describe('RepositoryGateComponent', () => {
  it.each(['fülli', 'fuelli', 'füles', 'Fülli', 'Fuelli', 'Füles', '  FÜLLI  '])(
    'akzeptiert die erlaubte Antwort %s unabhängig von Großschreibung und Rand-Leerzeichen',
    (answer) => {
      expect(isRepositoryAnswerAccepted(answer)).toBe(true);
    },
  );

  it.each(['', 'fülli!', 'fuelles', 'jemand anderes'])(
    'lehnt die nicht freigegebene Antwort %s ab',
    (answer) => {
      expect(isRepositoryAnswerAccepted(answer)).toBe(false);
    },
  );

  it('behält beim sechsten Fehlversuch nur die letzten fünf Dialoge', () => {
    const failures = [1, 2, 3, 4, 5];

    expect(appendRepositoryFailure(failures, 6)).toEqual([2, 3, 4, 5, 6]);
    expect(appendRepositoryFailure(failures, 6)).toHaveLength(MAX_VISIBLE_REPOSITORY_FAILURES);
  });
});
