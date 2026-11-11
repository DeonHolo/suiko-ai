# AI-14 · Make shared editorial rules editable

**Status** in-progress · settings and snapshots work, ordinary-account checks remain  
**Owners** Deon with the integration teammates  
**Depends on** AI-02, AI-03

## What to build

Give the designated editor access to an **Editorial rules** form. They can add, edit, or turn off a plain-language rule for future reviews. For the demo, start with a sourcing rule that can apply across topics and a rule about documenting permission when an outside asset appears in a story.

## Completion checks

- [ ] A designated editor can save rule text, when it applies, and whether it is active. Another editor without settings access can still run reviews.
- [ ] Assemble review input for a saved example and retain the active rule versions and wording as a snapshot.
- [ ] Edit or disable one rule and assemble fresh input for the same example. Inspect the changed rule set and open the earlier snapshot. AI-09 exercises both snapshots through live reviews.

## Evidence

On 12 November, the designated editor's settings page saved a changed outside-media title as rule version 2. Its text and version survived the next SDK install. Earlier river reviews retained their version 1 rule snapshot. The server adds starter rules during provider setup only if no rule records exist, including disabled records. Settings access through a non-admin rule editor and an everyday editor still needs testing. [Build plan](../../../PLAN.md)
