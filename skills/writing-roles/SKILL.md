---
name: writing-roles
description: Role persona standard for first-person identity documents — self-cognition, action pattern, decision basis, interpersonal stance, language style, voice, and character.
license: MIT
metadata:
  tags: [role, persona, character, voice, identity]
---

# Writing Roles

An identity is who the agent remains after the current turn is removed.

It is constituted by five points: self-cognition, action pattern, decision
basis, interpersonal stance, and language style. The identity can be
reproduced when all five are present.

No point contradicts another. Decision basis does not restate the action
pattern. Language style does not add an action.

A mood adjective or a biography is not a point. Temper that changes what is
said is already interpersonal stance or language style.

## When to Use

- Writing or revising a first-person role document under a `roles/` directory
- Checking such a document against the five points

Don't use for:

- Switching the session identity (`/role`, `--role`, `role.default`)
- The extension's discovery, settings, or prompt prepending

## Self-cognition

Self-cognition is the agent's model of itself after the current turn is
removed.

Good: `I am a reviewer, not the author of the change under review.`
Bad: `I will review src/auth.ts.`

Test: mask the current user message; "who I am, and who I am not" still
has an answer.

## Action pattern

Action pattern is how the agent does its work after the current turn is
removed.

Good: `I read the proposed change and report defects to the author. I do
not apply the fix. I read, then report.`

Bad: `Review the diff, then open an issue.`

Test: mask the current user message; "what I do, for whom, in what
order, and what I do not do" still has an answer.

## Decision basis

Decision basis is which good wins when two goods that the role accepts
cannot both be kept.

Good: `When completeness and speed conflict, I keep completeness. I do
not drop an in-scope defect to finish sooner.`
Bad: `I value quality.`

Test: mask the current user message; "which good I keep when two
conflict" still has an answer.

## Interpersonal stance

Interpersonal stance is where the agent stands toward the party the work
serves: how much authority it takes, and how much warmth.

Good: `I speak to the author as a peer. I do not soften a defect, and I
do not place myself above them.`
Bad: `Be professional.`

Test: mask the current user message; "how much authority I take, and how
much warmth I show" still has an answer.

## Language style

Language style is the way the document speaks. The document is in that
style from the first sentence. A note about the style is not the style.

One core style leads. The speaker then tells the occasions apart. The
telling is the speaker's own. It is not a list of what is permitted or
refused. After it, the speech says what the speaker attends to on each
occasion, and enters authority: who decides, where the boundary is, and
which sentence must hold a deliverable, a decision, or an admission.
Those sentences are the same style.

Common examples: tone, voice, register, caricature, a ban list.

Good: `The finding is the first sentence, and it is the whole of the
opening. I can tell that sentence from a verdict. The verdict stays as
plain as the finding, and it is mine to give.`
Bad: `Be serious. Do not joke when stating a decision.`

Test: mask the claims; one core style still runs through the whole
document, the speaker tells the occasions apart, and the sentences that
enter authority are that same style.

## Writing

The document is first person. Every sentence constitutes one of the
five points.

Good: the five points spoken as "I".
Bad: a first-person list of this turn's tasks.

## Verification

1. Two readers given the same five points reproduce the same identity.
   (Commitment; Identity)
2. The document is the five points and no further identity dimension.
   (Invariant; Identity)
3. A document that is first person and valid Markdown can still omit a
   point, or satisfy one point by restating another.
   (Silent; Writing)
4. A first-person document can still name its style with an adjective or
   a ban list, while the speech never takes that style.
   (Silent; Language style)
