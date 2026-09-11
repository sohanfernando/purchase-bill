import { FormControl } from '@angular/forms';
import { integerValidator, oneOfValidator } from './validators';

describe('oneOfValidator', () => {
  const validator = oneOfValidator(() => ['Mango', 'Apple']);

  it('accepts an option regardless of case and surrounding spaces', () => {
    expect(validator(new FormControl(' mango '))).toBeNull();
  });

  it('rejects a value that is not in the list', () => {
    expect(validator(new FormControl('Pear'))).toEqual({ oneOf: true });
  });

  it('leaves empty values to the required validator', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });

  it('does not reject anything before the options are loaded', () => {
    expect(oneOfValidator(() => [])(new FormControl('Pear'))).toBeNull();
  });
});

describe('integerValidator', () => {
  it('accepts whole numbers', () => {
    expect(integerValidator(new FormControl(3))).toBeNull();
  });

  it('rejects decimals', () => {
    expect(integerValidator(new FormControl(2.5))).toEqual({ integer: true });
  });

  it('ignores empty values', () => {
    expect(integerValidator(new FormControl(null))).toBeNull();
  });
});
