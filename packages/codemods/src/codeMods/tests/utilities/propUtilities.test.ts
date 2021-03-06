import { renameProp, findJsxTag, boolTransform, enumTransform } from '../../utilities';
import { Project, SyntaxKind, JsxAttribute } from 'ts-morph';
import { EnumMap } from '../../types';
import { Maybe } from '../../../maybe';

const personaPropsFile = 'mPersonaProps.tsx';
const personaSpreadPropsFile = 'mPersonaSpreadProps.tsx';
const spinnerPropsFile = 'mSpinnerProps.tsx';
const spinnerSpreadPropsFile = 'mSpinnerSpreadProps.tsx';
const DropdownPropsFile = 'mDropdownProps.tsx';
const DropdownSpreadPropsFile = 'mDropdownSpreadProps.tsx';

const deprecatedPropName = 'imageShouldFadeIn';
const newPropName = 'imageShouldFadeInwootwoot';

/* Developer will provide a mapping of Enum Values, if necessary. */
// TODO it's not ideal that devs need to write the enum name before every token.
const spinnerMap: EnumMap<string> = {
  'SpinnerType.normal': 'SpinnerSize.medium',
  'SpinnerType.large': 'SpinnerSize.large',
};

describe('Props Utilities Test', () => {
  let project: Project;
  beforeEach(() => {
    project = new Project();
    project.addSourceFilesAtPaths(`${process.cwd()}/**/tests/mock/**/*.tsx`);
  });
  describe('Normal Prop Renaming', () => {
    it('[SANITY] can ID the correct file and get the JSX elements', () => {
      const file = project.getSourceFileOrThrow(personaPropsFile);
      const tags = findJsxTag(file, 'Persona');
      expect(tags.length).toEqual(2);
    });

    it('can rename props in a primitive', () => {
      const file = project.getSourceFileOrThrow(personaPropsFile);
      const tags = findJsxTag(file, 'Persona');
      renameProp(tags, deprecatedPropName, newPropName);
      tags.forEach(tag => {
        expect(tag.getAttribute('imageShouldFadeIn')).toBeFalsy();
      });
    });

    it('can rename props in a spread attribute', () => {
      const file = project.getSourceFileOrThrow(personaSpreadPropsFile);
      const tags = findJsxTag(file, 'Persona');
      renameProp(tags, 'primaryText', 'Text', undefined);
      tags.forEach(val => {
        val.getAttributes().forEach(att => {
          if (att.getKind() === SyntaxKind.JsxSpreadAttribute) {
            att
              .getFirstChildByKind(SyntaxKind.Identifier)
              ?.getType()
              .getProperties()
              .forEach(prop => {
                expect(prop.getName()).not.toEqual('primaryText');
              });
          }
        });
      });
    });
  });

  describe('Edge Case Tests (changes in value)', () => {
    it('[SANITY] can ID the correct file and get the JSX elements', () => {
      const file = project.getSourceFileOrThrow(DropdownPropsFile);
      const tags = findJsxTag(file, 'Dropdown');
      expect(tags.length).toEqual(2);
    });

    it('can rename and replace the values of props (primitives)', () => {
      const file = project.getSourceFileOrThrow(DropdownPropsFile);
      const tags = findJsxTag(file, 'Dropdown');
      renameProp(tags, 'isDisabled', 'disabled', undefined, 'false');
      tags.forEach(tag => {
        expect(tag.getAttribute('isDisabled')).toBeFalsy();
        const valMaybe = Maybe(tag.getAttribute('disabled'));
        const val = valMaybe.then(value => value.getFirstChildByKind(SyntaxKind.JsxExpression));
        expect(val.just).toBeTruthy();
        const propValueText = val.then(value => value.getText().substring(1, value.getText().length - 1));
        expect(propValueText.just).toBeTruthy();
        if (propValueText.just) {
          expect(propValueText.value).toEqual('false');
        }
      });
    });

    it('can replace props with changed values in a spread attribute', () => {
      const file = project.getSourceFileOrThrow(DropdownSpreadPropsFile);
      const tags = findJsxTag(file, 'Dropdown');
      renameProp(tags, 'isDisabled', 'disabled', undefined, 'false');
      tags.forEach(val => {
        val.getAttributes().forEach(att => {
          if (att.getKind() === SyntaxKind.JsxSpreadAttribute) {
            att
              .getFirstChildByKind(SyntaxKind.Identifier)
              ?.getType()
              .getProperties()
              .forEach(prop => {
                expect(prop.getName()).not.toEqual('isDisabled');
              });
          }
        });
      });
    });
  });

  describe('Edge Case Tests (enums)', () => {
    it('[SANITY] can ID the correct file and get the JSX elements', () => {
      const file = project.getSourceFileOrThrow(spinnerPropsFile);
      const tags = findJsxTag(file, 'Spinner');
      expect(tags.length).toEqual(2);
    });

    it('can replace props with changed enum values in a spread attribute', () => {
      const file = project.getSourceFileOrThrow(spinnerSpreadPropsFile);
      let tags = findJsxTag(file, 'Spinner');
      renameProp(tags, 'type', 'size', spinnerMap);
      tags = findJsxTag(file, 'Spinner');
      tags.forEach(val => {
        val.getAttributes().forEach(att => {
          if (att.getKind() === SyntaxKind.JsxSpreadAttribute) {
            att
              .getFirstChildByKind(SyntaxKind.Identifier)
              ?.getType()
              .getProperties()
              .forEach(prop => {
                expect(prop.getName()).not.toEqual('SpinnerType');
              });
          }
          /* Want to see these substrings somewhere in the Jsx element. */
          expect(
            val.getText().includes('{...__migProps}') || val.getText().includes('{...__migPropsTest}'),
          ).toBeTruthy();
          expect(val.getText().includes('size={__migEnumMap[type]}')).toBeTruthy();
        });
      });
    });
  });

  describe('Edge Case Tests (transform function)', () => {
    it('can rename and replace the values of props (primitives)', () => {
      const file = project.getSourceFileOrThrow(DropdownPropsFile);
      const tags = findJsxTag(file, 'Dropdown');
      const func = boolTransform(false);
      renameProp(tags, 'isDisabled', 'disabled', undefined, undefined, func);
      tags.forEach(tag => {
        expect(tag.getAttribute('isDisabled')).toBeFalsy();
        const valMaybe = Maybe(tag.getAttribute('disabled'));
        const val = valMaybe.then(value => value.getFirstChildByKind(SyntaxKind.JsxExpression));
        expect(val.just).toBeTruthy();
        const propValueText = val.then(value => value.getText().substring(1, value.getText().length - 1));
        expect(propValueText.just).toBeTruthy();
        if (propValueText.just) {
          expect(propValueText.value).toEqual('false');
        }
      });
    });

    it('can replace props with changed enum values', () => {
      const file = project.getSourceFileOrThrow(spinnerPropsFile);
      const tags = findJsxTag(file, 'Spinner');
      const oldEnumValues: string[] = ['SpinnerType.large', 'SpinnerType.normal'];
      const enumFn = enumTransform(spinnerMap);
      renameProp(tags, 'type', 'size', undefined, undefined, enumFn);
      tags.forEach(tag => {
        expect(tag.getAttribute('type')).toBeFalsy();
        const currentEnumValue = Maybe(oldEnumValues.pop());
        const innerMaybe = Maybe(
          (tag.getAttribute('size') as JsxAttribute).getFirstChildByKind(SyntaxKind.JsxExpression),
        );
        if (innerMaybe.just && currentEnumValue.just) {
          const inner = innerMaybe.then(value => {
            return value.getFirstChildByKind(SyntaxKind.PropertyAccessExpression);
          });

          expect(inner.just).toBeTruthy();
          expect(currentEnumValue.just).toBeTruthy();
          const newVal = spinnerMap[currentEnumValue.value];
          const firstInnerChild = inner.then(value => value.getFirstChildByKind(SyntaxKind.Identifier));
          const LastInnerChild = inner.then(value => value.getLastChildByKind(SyntaxKind.Identifier));
          expect(firstInnerChild.just).toBeTruthy();
          expect(LastInnerChild.just).toBeTruthy();
          if (firstInnerChild.just && LastInnerChild.just) {
            /* Need this if statement to clear value on the next line. */
            expect(firstInnerChild.value.getText()).toEqual('SpinnerSize');
            expect(LastInnerChild.value.getText()).toEqual(newVal.substring(newVal.indexOf('.') + 1));
          }
        }
      });
    });
  });
});
