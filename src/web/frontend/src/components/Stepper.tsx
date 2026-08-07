import { View } from '../types';

const STEPS: { id: View; label: string }[] = [
  { id: 'input', label: 'Input & Filters' },
  { id: 'results', label: 'Results' },
  { id: 'export', label: 'Export' },
];

type StepperProps = {
  currentView: View;
  onChange: (view: View) => void;
};

export default function Stepper({ currentView, onChange }: StepperProps) {
  const currentIndex = STEPS.findIndex(step => step.id === currentView);

  return (
    <nav className="stepper" aria-label="Search progress">
      {STEPS.map((step, index) => (
        <button
          className={`step ${index <= currentIndex ? 'step--reached' : ''} ${
            index === currentIndex ? 'step--active' : ''
          }`}
          key={step.id}
          type="button"
          onClick={() => onChange(step.id)}
          aria-current={index === currentIndex ? 'step' : undefined}
        >
          <span className="step__number">{index + 1}</span>
          <span className="step__label">{step.label}</span>
        </button>
      ))}
    </nav>
  );
}
