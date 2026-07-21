import { devtoolsActionSanitizer } from './devtools-config';
import * as AuthActions from '@anular-ngrx/auth-data-access/auth.actions';

describe('devtoolsActionSanitizer', () => {
  it('masks password on login actions', () => {
    const action = AuthActions.loginUser({
      credentials: { email: 'a@b.com', password: 'secret' },
    });

    const sanitized = devtoolsActionSanitizer(action);

    expect(sanitized).toMatchObject({
      type: action.type,
      credentials: { email: 'a@b.com', password: '***' },
    });
  });

  it('leaves non-login actions unchanged', () => {
    const action = AuthActions.logoutUser();
    expect(devtoolsActionSanitizer(action)).toBe(action);
  });
});
