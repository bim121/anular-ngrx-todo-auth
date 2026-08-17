import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
  });

  it('renders title on the host card', () => {
    fixture.componentRef.setInput('title', 'Empty state');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('ds-card')).toBe(true);
    expect(fixture.nativeElement.querySelector('.ds-card__title').textContent).toContain(
      'Empty state'
    );
  });
});
