import { describe, it, expect } from 'vitest';
import { resolvePermissions, ROLE_PERMISSIONS } from '../legacyRoles';
import type { AuthRoleName } from '../types';

describe('Role -> Permission Snapshot Tests', () => {
  const roles = Object.keys(ROLE_PERMISSIONS) as AuthRoleName[];

  roles.forEach(role => {
    it(`Role '${role}' exact permission mapping`, () => {
      // 1. Resolve permissions
      const permissions = resolvePermissions([role]);
      
      // 2. Sort them alphabetically so diffs are human-readable
      const sortedPermissions = [...permissions].sort((a, b) => a.localeCompare(b));
      
      // 3. Snapshot assertion
      expect(sortedPermissions).toMatchSnapshot();
    });
  });

  it('Unauthenticated user receives empty permissions', () => {
    const permissions = Array.from(resolvePermissions([]));
    expect(permissions).toEqual([]);
  });
});
