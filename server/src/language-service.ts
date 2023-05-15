import type { InitializeResult } from 'vscode-languageserver/node';
import type { LanguageServer } from './language-server'

export type LanguageService<T extends LanguageServer> = (this: T, result: InitializeResult) => InitializeResult;

export const defineLanguageService = <T extends LanguageServer>(service: LanguageService<T>) => service;
