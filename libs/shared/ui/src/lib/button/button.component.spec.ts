import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();
    button = fixture.nativeElement as HTMLButtonElement;
  });

  it('applies variant and size host classes', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(button.classList.contains('ds-btn--danger')).toBe(true);
    expect(button.classList.contains('ds-btn--lg')).toBe(true);
  });

  it('disables the host while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(button.getAttribute('disabled')).not.toBeNull();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('.spinner')).toBeTruthy();
  });
});
