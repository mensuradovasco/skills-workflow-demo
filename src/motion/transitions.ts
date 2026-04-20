export const stagger = (index: number, base = 90) => ({
  animationDelay: `${index * base}ms`,
});

export const stepDelay = (step: number) => ({
  animationDelay: `${step}ms`,
});
