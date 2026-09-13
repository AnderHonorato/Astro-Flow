/**
 * Erros da aplicacao. Tudo que chega ao cliente passa por aqui e sai no
 * envelope `apiErrorSchema` de `@astros/contracts` — nunca outra forma.
 */

import type { ApiError, ApiErrorCode } from '@astros/contracts';
import type { ZodError } from 'zod';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly fields: Record<string, string> | undefined;

  constructor(
    statusCode: number,
    code: ApiErrorCode,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
  }

  toEnvelope(): ApiError {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.fields ? { fields: this.fields } : {}),
      },
    };
  }
}

/* ── construtores nomeados (mensagens em pt-BR, exibiveis) ─────────────── */

export const badRequest = (message: string, fields?: Record<string, string>) =>
  new AppError(400, 'validation_error', message, fields);

export const unauthorized = (message = 'Faca login para continuar.') =>
  new AppError(401, 'unauthorized', message);

export const forbidden = (message = 'Voce nao tem acesso a este recurso.') =>
  new AppError(403, 'forbidden', message);

export const notFound = (message = 'Nao encontramos o que voce procura.') =>
  new AppError(404, 'not_found', message);

export const conflict = (message: string) => new AppError(409, 'conflict', message);

export const planRequired = (message: string) =>
  new AppError(402, 'plan_required', message);

export const rateLimited = (
  message = 'Muitas tentativas em pouco tempo. Aguarde um instante.',
) => new AppError(429, 'rate_limited', message);

export const internalError = (
  message = 'Algo deu errado do nosso lado. Tente de novo em instantes.',
) => new AppError(500, 'internal_error', message);

/* ── zod -> validation_error ───────────────────────────────────────────── */

/**
 * Converte um ZodError no mapa `campo -> problema` que a web usa para grudar a
 * mensagem embaixo do input. Caminhos aninhados viram "place.timezone";
 * indices de array viram "partners.0.name".
 */
export function fieldsFromZod(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_';
    // Primeiro problema por campo vence — e o mais especifico.
    if (fields[key] === undefined) fields[key] = issue.message;
  }
  return fields;
}

export function fromZod(error: ZodError, message = 'Confira os campos destacados.'): AppError {
  return badRequest(message, fieldsFromZod(error));
}
