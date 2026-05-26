import { AUDIT_RESOURCE_KEY, AUDIT_ACTION_KEY, Audit } from '../../src/audit/audit.decorator';

describe('@Audit decorator', () => {
  it('should set resource type metadata', () => {
    class TestController {
      @Audit('meter', 'CREATE')
      create(): void {}
    }

    const controller = new TestController();
    const metadata = Reflect.getMetadata(AUDIT_RESOURCE_KEY, controller.create);
    expect(metadata).toBe('meter');
  });

  it('should set action metadata', () => {
    class TestController {
      @Audit('invoice', 'UPDATE')
      update(): void {}
    }

    const controller = new TestController();
    const metadata = Reflect.getMetadata(AUDIT_ACTION_KEY, controller.update);
    expect(metadata).toBe('UPDATE');
  });

  it('should set both metadata keys', () => {
    class TestController {
      @Audit('user', 'DELETE')
      delete(): void {}
    }

    const controller = new TestController();
    const resource = Reflect.getMetadata(AUDIT_RESOURCE_KEY, controller.delete);
    const action = Reflect.getMetadata(AUDIT_ACTION_KEY, controller.delete);
    expect(resource).toBe('user');
    expect(action).toBe('DELETE');
  });

  it('should use the correct metadata keys', () => {
    expect(AUDIT_RESOURCE_KEY).toBe('audit:resource');
    expect(AUDIT_ACTION_KEY).toBe('audit:action');
  });
});
