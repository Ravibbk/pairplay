import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { QuestionCard } from '../components/game/QuestionCard.js';
import { AnswerRevealCard } from '../components/game/AnswerRevealCard.js';
import { GameQuestion, User } from '../types/index.js';

describe('Frontend Component Tests', () => {
  it('renders Button with children and handles click event', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Start Game</Button>);

    const button = screen.getByRole('button', { name: /start game/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables Button when isLoading is true', () => {
    render(<Button isLoading>Submit Answer</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders Input with accessible label and validation error', () => {
    render(
      <Input
        label="Partner Invitation Code"
        placeholder="PAIR-XXXX"
        error="Invalid invitation code"
      />
    );

    expect(screen.getByLabelText(/partner invitation code/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid invitation code/i)).toBeInTheDocument();
  });

  it('renders QuestionCard with category and question text', () => {
    const mockQuestion: GameQuestion = {
      id: 'q1',
      orderIndex: 0,
      questionText: 'What was your favorite trip together?',
      category: 'Memories & Milestones',
      userHasAnswered: false,
      partnerHasAnswered: false,
      isRevealed: false,
      answers: [],
    };

    render(
      <QuestionCard
        question={mockQuestion}
        currentIndex={0}
        totalQuestions={5}
        category="Memories & Milestones"
      />
    );

    expect(screen.getByText(/what was your favorite trip together\?/i)).toBeInTheDocument();
    expect(screen.getByText(/question 1 of 5/i)).toBeInTheDocument();
  });

  it('AnswerRevealCard shows locked state for partner when answers are not yet revealed', () => {
    const mockUser: User = {
      id: 'u1',
      email: 'alex@pairplay.app',
      displayName: 'Alex',
      partnerCode: 'PAIR-ALEX',
    };

    const mockPartner = {
      id: 'u2',
      displayName: 'Sam',
    };

    const mockQuestion: GameQuestion = {
      id: 'q1',
      orderIndex: 0,
      questionText: 'Favorite memory?',
      category: 'Memories & Milestones',
      userHasAnswered: true,
      partnerHasAnswered: true,
      isRevealed: false,
      answers: [
        {
          id: 'a1',
          userId: 'u1',
          answerText: 'Paris in springtime',
          submittedAt: new Date().toISOString(),
        },
        {
          id: 'a2',
          userId: 'u2',
          answerText: '•••••••• (Locked until both reveal)',
          submittedAt: new Date().toISOString(),
        },
      ],
    };

    render(
      <AnswerRevealCard
        question={mockQuestion}
        currentUser={mockUser}
        partnerUser={mockPartner}
        onSubmitAnswer={vi.fn()}
        onSendReaction={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText(/paris in springtime/i)).toBeInTheDocument();
    expect(screen.getByText(/waiting for partner to lock in their answer|answer is locked in/i)).toBeInTheDocument();
  });

  it('AnswerRevealCard displays partner answer when isRevealed is true', () => {
    const mockUser: User = {
      id: 'u1',
      email: 'alex@pairplay.app',
      displayName: 'Alex',
      partnerCode: 'PAIR-ALEX',
    };

    const mockPartner = {
      id: 'u2',
      displayName: 'Sam',
    };

    const mockQuestion: GameQuestion = {
      id: 'q1',
      orderIndex: 0,
      questionText: 'Favorite memory?',
      category: 'Memories & Milestones',
      userHasAnswered: true,
      partnerHasAnswered: true,
      isRevealed: true,
      answers: [
        {
          id: 'a1',
          userId: 'u1',
          answerText: 'Paris in springtime',
          submittedAt: new Date().toISOString(),
        },
        {
          id: 'a2',
          userId: 'u2',
          answerText: 'Camping under shooting stars in Maine',
          submittedAt: new Date().toISOString(),
        },
      ],
    };

    render(
      <AnswerRevealCard
        question={mockQuestion}
        currentUser={mockUser}
        partnerUser={mockPartner}
        onSubmitAnswer={vi.fn()}
        onSendReaction={vi.fn()}
        isSubmitting={false}
      />
    );

    expect(screen.getByText(/camping under shooting stars in maine/i)).toBeInTheDocument();
  });
});
