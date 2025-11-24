//src/modules/Types/uploadTypes.ts
export interface Entry {
  [key: string]: string | number | boolean | null;
}

export interface DuplicatePair {
  existing: Entry;
  incoming: Entry;
}
