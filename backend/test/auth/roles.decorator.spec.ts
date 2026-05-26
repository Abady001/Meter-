import { ROLES_KEY, Roles } from '../../src/auth/roles.decorator';
import { Role } from '../../src/auth/types';

describe('@Roles decorator', () => {
  it('should set metadata with the ROLES_KEY', () => {
    const roles = [Role.SUPER_ADMIN, Role.OPERATOR];

    @Roles(...roles)
    class TestController {}

    const metadata = Reflect.getMetadata(ROLES_KEY, TestController);
    expect(metadata).toEqual(roles);
  });

  it('should support a single role', () => {
    @Roles(Role.SUPER_ADMIN)
    class TestController {}

    const metadata = Reflect.getMetadata(ROLES_KEY, TestController);
    expect(metadata).toEqual([Role.SUPER_ADMIN]);
  });

  it('should support no roles (empty set)', () => {
    @Roles()
    class TestController {}

    const metadata = Reflect.getMetadata(ROLES_KEY, TestController);
    expect(metadata).toEqual([]);
  });

  it('should be type-safe and only accept Role values', () => {
    const decorator = Roles(Role.SUPER_ADMIN);
    expect(decorator).toBeDefined();
  });

  it('should store roles in the correct metadata key', () => {
    expect(ROLES_KEY).toBe('roles');
  });
});
