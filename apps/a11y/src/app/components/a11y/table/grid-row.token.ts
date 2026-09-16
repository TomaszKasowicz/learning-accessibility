import { InjectionToken } from '@angular/core';
import { GridRow } from '@angular/aria/grid';

type ProvidersResolver = (
  def: unknown,
  processProviders: (providers: unknown[]) => unknown[],
) => void;

const ABORT = Symbol('abort');

/**
 * `GridCell` injects a private token to find its parent row, and `@angular/aria/grid` does not
 * export it. `ɵɵProvidersFeature` keeps the directive's provider array alive in
 * `providersResolver`, so passing a `processProviders` callback hands it to us. We throw from that
 * callback so the real resolver never runs -- it would try to register the providers on whatever
 * view happens to be rendering.
 *
 * Reading `ɵdir.type.decorators` instead would only work in development; the linker drops that
 * metadata from production builds.
 */
function readGridRowToken(): InjectionToken<GridRow> {
  const def = (
    GridRow as unknown as { ɵdir: { providersResolver?: ProvidersResolver } }
  ).ɵdir;

  let providers: unknown[] = [];
  try {
    def.providersResolver?.(def, (captured) => {
      providers = captured;
      throw ABORT;
    });
  } catch (error) {
    if (error !== ABORT) {
      throw error;
    }
  }

  const token = providers
    .flat(Infinity)
    .find(
      (
        provider,
      ): provider is {
        provide: InjectionToken<GridRow>;
        useExisting: unknown;
      } =>
        typeof provider === 'object' &&
        provider !== null &&
        'useExisting' in provider &&
        provider.useExisting === GridRow,
    )?.provide;

  if (!token) {
    throw new Error(
      'Could not recover the GRID_ROW token from the GridRow directive definition.',
    );
  }

  return token;
}

export const GRID_ROW = readGridRowToken();
