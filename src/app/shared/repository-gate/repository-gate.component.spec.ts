/* src/app/shared/repository-gate/repository-gate.component.spec.ts */

import { describe, expect, it } from 'vitest';
import {
  appendRepositoryFailure,
  isRepositoryAnswerAccepted,
  MAX_VISIBLE_REPOSITORY_FAILURES,
} from './repository-gate.component';

describe('RepositoryGateComponent', /** Gruppiert die Verhaltensprüfungen der Shared-Komponente oder Direktive. */() => {

  it.each(['fülli', 'fuelli', 'füles', 'Fülli', 'Fuelli', 'Füles', '  FÜLLI  '])(
    'akzeptiert die erlaubte Antwort %s unabhängig von Großschreibung und Rand-Leerzeichen',
    /** Prüft die Freigabe der parametrisierten Repository-Antwort. */(answer) => {
      expect(isRepositoryAnswerAccepted(answer)).toBe(true);
    },
  );

  it.each(['', 'fülli!', 'fuelles', 'jemand anderes'])(
    'lehnt die nicht freigegebene Antwort %s ab',
    /** Stellt den für den Test benötigten Zustand bereit. */(answer) => {
      expect(isRepositoryAnswerAccepted(answer)).toBe(false);
    },
  );

  it('behält beim sechsten Fehlversuch nur die letzten fünf Dialoge', /** Behält beim sechsten Fehlversuch nur die letzten fünf Dialoge. */() => {

    const failures = [1, 2, 3, 4, 5]; // Bisherige Fehlversuche vor dem Überschreiten des sichtbaren Limits.

    expect(appendRepositoryFailure(failures, 6)).toEqual([2, 3, 4, 5, 6]);
    expect(appendRepositoryFailure(failures, 6)).toHaveLength(MAX_VISIBLE_REPOSITORY_FAILURES);
  });
});
